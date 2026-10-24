import test from 'node:test';
import assert from 'node:assert/strict';
import { INLINE_SUBMITTED_POLICY, extractInlineSubmittedMessage } from './submitted-message.mjs';
import { claudeAXSnapshot } from './claude-ax.mjs';

const canonical = 'Read these sources.\n\nUse https://public.example/index.json\nAsk me next.';
const now = '2026-10-24T05:00:00.000Z';
function fixture() {
  const snapshot = claudeAXSnapshot('Window: "Owned public test", App: Claude.\n0 standard window Claude\n'
    + '\t1 HTML content Public test, URL: claude.ai/chat/synthetic\n\t\t2 container Primary pane\n'
    + '\t\t\t3 container Message 1 of 2\n\t\t\t\t4 heading Value: 3, You said: Read these sources.\n'
    + '\t\t\t\t\t5 text You said: Read these sources.\n\t\t\t\t6 container\n'
    + '\t\t\t\t\t7 text Read these sources. Use \n'
    + '\t\t\t\t\t8 link Description: https://public.example/index.json, Value: public.example/index.json\n'
    + '\t\t\t\t\t9 text  Ask me next.\n\t\t\t\t10 button Copy\n',
  { owned: true, ownedWindowId: 'owned-public-window', captureId: 'public-capture', capturedAt: now });
  const options = { now, policy: INLINE_SUBMITTED_POLICY, scopeIndex: 3, messageIndex: 6,
    partIndices: [7, 8, 9], ownedUserMessage: true };
  return { snapshot, options, run: (s = snapshot, o = options) => extractInlineSubmittedMessage(s, canonical, o) };
}
test('actual split text/link serialization matches only the explicit rendered-message policy', () => {
  const f = fixture(), r = f.run();
  assert.equal(r.matches, true); assert.equal(r.comparison.exactMatches, false);
  assert.equal(r.comparison.basis, 'line-breaks-rendered-as-spaces');
  assert.equal(r.claim, 'submitted-public-invitation-visible-under-rendering-policy');
  assert.equal(JSON.stringify(r).includes('Read these sources'), false);
  assert.equal(JSON.stringify(r).includes('https://public.example'), false);
});
test('exact static parts remain separately identified', () => {
  const f = fixture(); f.snapshot.nodes = f.snapshot.nodes.filter(n => ![8,9].includes(n.index));
  f.snapshot.nodes.find(n => n.index === 7).label = canonical;
  const r = f.run(f.snapshot, {...f.options, partIndices:[7]});
  assert.equal(r.comparison.exactMatches, true); assert.equal(r.comparison.basis, 'exact-static-parts');
});
test('no policy or ownership silently opts into rendered comparison', () => {
  const f = fixture();
  for (const delta of [{policy:undefined},{policy:'exact'},{ownedUserMessage:false}]) assert.throws(()=>f.run(f.snapshot,{...f.options,...delta}));
});
test('missing, repeated and reordered parts cannot omit message material', () => {
  const f = fixture(); for(const partIndices of [[7,9],[9,8,7],[7,8,8],[7,8,9,10]])
    assert.throws(()=>f.run(f.snapshot,{...f.options,partIndices}),/every message/);
});
test('altered text, punctuation, spaces and unrelated links fail comparison', () => {
  for(const value of ['Read these sources.  Use ','Read those sources. Use ','Read these sources! Use ']) {
    const f=fixture();f.snapshot.nodes.find(n=>n.index===7).label=value;assert.throws(()=>f.run(),/differs/);
  }
  const f=fixture();f.snapshot.nodes.find(n=>n.index===8).label='https://other.example/index.json';assert.throws(()=>f.run());
});
test('conflicting or misleading link targets and display labels are rejected', () => {
  for(const delta of [{url:'https://other.example/'},{value:'public.example/other.json'},{label:'Read me'},{label:'https://u:p@public.example/index.json',value:'u:p@public.example/index.json'}]) {
    const f=fixture();Object.assign(f.snapshot.nodes.find(n=>n.index===8),delta);assert.throws(()=>f.run());
  }
});
test('assistant boundary, missing user marker, partial body or foreign parts cannot qualify', () => {
  for(const change of [s=>{s.nodes.find(n=>n.index===3).label='Message 2 of 2';},
    s=>{s.nodes.find(n=>n.index===5).label='Claude responded:';},
    s=>{s.nodes.find(n=>n.index===9).parentIndex=2;},
    s=>{s.nodes.find(n=>n.index===10).parentIndex=6;}]) {
    const f=fixture();change(f.snapshot);assert.throws(()=>f.run());
  }
});
test('stale capture, non-LF canonical and hidden material are rejected', () => {
  const f=fixture();assert.throws(()=>f.run(f.snapshot,{...f.options,now:'2026-10-24T05:01:00.000Z'}),/stale/);
  assert.throws(()=>extractInlineSubmittedMessage(f.snapshot,canonical.replace('\n','\r\n'),f.options),/LF/);
  f.snapshot.nodes.find(n=>n.index===9).visible=false;assert.throws(()=>f.run());
});
