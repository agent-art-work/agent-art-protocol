/** Candidate-only synthetic clipboard/timer checks, separate from real clients. */
export async function checkFeedbackUI() {
  const [{ mountReading }, { default: work }] = await Promise.all([
    import('/assets/agent-art-sdk/reading-ui.mjs'), import('/assets/agent-art-reading-work.mjs'),
  ]);
  const realTimeout = window.setTimeout, realClear = window.clearTimeout;
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const timers = [], results = [];
  const assert = (ok, message) => { if (!ok) throw Error(message); };
  const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.setTimeout = (fn, ms, ...args) => {
    if (ms !== 3000) return realTimeout.call(window, fn, ms, ...args);
    const timer = { id: 900000 + timers.length, delay: ms, callback: () => fn(...args), cleared: false };
    timers.push(timer); return timer.id;
  };
  window.clearTimeout = id => {
    const timer = timers.find(t => t.id === id);
    if (timer) timer.cleared = true; else realClear.call(window, id);
  };
  const clipboard = fn => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: fn } });
  let host, mounted;
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
  const near = (a,b) => Math.abs(a-b)<.05;
  try {
    for (const width of [900, 320, 257]) for (const clients of [undefined, ['claude-app'], ['manual']]) {
      host = document.createElement('section'); host.style.width = width + 'px'; document.body.append(host);
      mounted = mountReading(host, { work, ...(clients && { clients }) });
      const copy = host.querySelector('.aap-reading-copy'), row = host.querySelector('.aap-reading-row');
      const announcer = host.querySelector('.aap-reading-announcement'), sizing = host.querySelector('.aap-reading-actions-size');
      const bounds = () => rect(row);
      const gaps = () => {
        const actions = host.querySelector('.aap-reading-actions').getBoundingClientRect();
        const field = row.getBoundingClientRect();
        assert(near(actions.right, field.right), 'action line fills field to its right edge');
        const items = [...host.querySelectorAll('.aap-reading-agent,.aap-reading-copy')].map(el => el.getBoundingClientRect());
        return [items[0].left-actions.left, ...items.slice(1).map((r,i)=>r.left-items[i].right), actions.right-items.at(-1).right];
      };
      const verifyGaps = () => { const g=gaps(); assert(Math.min(...g)>=11.95 && Math.max(...g)-Math.min(...g)<.06, 'equal visible gaps >=12px'); return g; };
      await frame(); const initial=bounds(), before=verifyGaps();
      assert(sizing.getAttribute('aria-hidden')==='true' && !sizing.querySelector('a,button,[tabindex]'), 'sizing row is noninteractive and hidden from accessibility');
      assert(announcer.getAttribute('aria-live')==='polite' && announcer.getAttribute('aria-atomic')==='true', 'polite atomic copy announcement');
      let exact;
      clipboard(async text => { exact=text; }); copy.click(); await frame();
      assert(exact===mounted.reading.context && copy.dataset.state==='copied', 'exact clipboard success');
      assert(getComputedStyle(copy.querySelector('.aap-reading-copy-done')).display==='inline' && getComputedStyle(copy.querySelector('.aap-reading-copy-ready')).display==='none', 'only Copied visible');
      const after=verifyGaps(), copied=bounds();
      assert(Object.keys(initial).every(k=>near(initial[k],copied[k])), 'total component bounds stable');
      assert(!!announcer.textContent && !host.querySelector('.aap-reading-status').textContent, 'success has no visible status paragraph');
      const first=timers.at(-1);assert(first.delay===3000, 'feedback is three seconds');
      copy.click(); await frame();const repeat=timers.at(-1);assert(first.cleared && first!==repeat,'repeat replaces timer');
      first.callback();assert(copy.dataset.state==='copied','queued stale reset ignored');
      repeat.callback();await frame();assert(copy.dataset.state==='ready','current timer resets Copy');verifyGaps();
      const reset=bounds();assert(Object.keys(initial).every(k=>near(initial[k],reset[k])),'reset bounds stable');
      clipboard(async()=>{throw new DOMException('Synthetic denial','NotAllowedError');});copy.click();await frame();
      const text=host.querySelector('.aap-reading-text');assert(!text.hidden && text.readOnly && text.value===mounted.reading.context,'exact manual fallback');
      assert(document.activeElement===text && text.selectionStart===0 && text.selectionEnd===text.value.length,'fallback selected');
      clipboard(async()=>{});copy.click();await frame();const timer=timers.at(-1);mounted.destroy();mounted=undefined;
      const state=copy.dataset.state;timer.callback();assert(timer.cleared && copy.dataset.state===state,'destroy clears timer and blocks late reset');
      results.push({width,clients:clients||'default',passed:true,before,after,initial,copied,reset});host.remove();host=undefined;
    }
    // Discovery leaves Copy available immediately; it must already reserve Copied.
    for (const available of [[], [{id:'claude-app'}], [{id:'codex-app'},{id:'claude-app'}]]) {
      host=document.createElement('section');host.style.width='257px';document.body.append(host);
      let resolveDiscovery;
      mounted=mountReading(host,{work,discoverClients:()=>new Promise(resolve=>{resolveDiscovery=resolve;})});
      await frame();const row=host.querySelector('.aap-reading-row'),copy=host.querySelector('.aap-reading-copy');
      const measure=()=>{
        const a=host.querySelector('.aap-reading-actions').getBoundingClientRect(),r=row.getBoundingClientRect();
        const items=[...host.querySelectorAll('.aap-reading-agent,.aap-reading-copy')].map(el=>el.getBoundingClientRect());
        const g=[items[0].left-a.left,...items.slice(1).map((x,i)=>x.left-items[i].right),r.right-items.at(-1).right];
        assert(near(a.right,r.right)&&Math.min(...g)>=11.95&&Math.max(...g)-Math.min(...g)<.06,'pending/resolved discovery keeps equal outer gaps');
        return rect(row);
      };
      const before=measure();clipboard(async()=>{});copy.click();await frame();const after=measure();
      assert(Object.keys(before).every(k=>near(before[k],after[k])),'pending discovery Copy has stable outer bounds');
      resolveDiscovery({clients:available});await frame();
      assert(host.querySelectorAll('.aap-reading-agent').length===available.length,'resolved discovery client count');
      const resolved=measure();timers.at(-1).callback();await frame();const reset=measure();
      assert(Object.keys(resolved).every(k=>near(resolved[k],reset[k])),'discovered routes keep stable feedback bounds');
      results.push({name:'pending and resolved discovery feedback',available:available.map(x=>x.id),passed:true,before,after,resolved,reset});
      mounted.destroy();mounted=undefined;host.remove();host=undefined;
    }
    host=document.createElement('section');host.style.width='257px';
    host.style.setProperty('--aap-font-size','16px');host.style.setProperty('--aap-padding-block','6px');
    host.style.setProperty('--aap-label-padding-inline','20px');host.style.setProperty('--aap-action-gap','20px');
    document.body.append(host);mounted=mountReading(host,{work});await frame();
    const row=host.querySelector('.aap-reading-row'),title=host.querySelector('.aap-reading-title'),copy=host.querySelector('.aap-reading-copy');
    const a=host.querySelector('.aap-reading-actions').getBoundingClientRect(),items=[...host.querySelectorAll('.aap-reading-agent,.aap-reading-copy')].map(el=>el.getBoundingClientRect());
    const gaps=[items[0].left-a.left,...items.slice(1).map((r,i)=>r.left-items[i].right),row.getBoundingClientRect().right-items.at(-1).right];
    assert(getComputedStyle(row).fontSize==='16px'&&getComputedStyle(title).paddingTop==='6px'&&getComputedStyle(title).paddingLeft==='20px','supported density hooks apply');
    assert(Math.min(...gaps)>=19.95&&Math.max(...gaps)-Math.min(...gaps)<.06,'larger density retains equal gaps');
    const before=rect(row);clipboard(async()=>{});copy.click();await frame();const after=rect(row);
    assert(Object.keys(before).every(k=>near(before[k],after[k])),'larger density has stable feedback bounds');
    results.push({name:'supported larger density at narrow width',passed:true,gaps,before,after});
    return {passed:true,results};
  } catch(error) { return {passed:false,results,error:error.message}; }
  finally {
    mounted?.destroy();host?.remove();window.setTimeout=realTimeout;window.clearTimeout=realClear;
    if(descriptor)Object.defineProperty(navigator,'clipboard',descriptor);else delete navigator.clipboard;
  }
}
