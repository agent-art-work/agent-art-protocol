import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { assessFeedbackGeometry, assessQuietFieldSnapshot, assessTailGeometry, browserSetupScript } from './check-browser.mjs';

function browserStub() {
  const listeners = new Map();
  let operatingSystemClipboardCalls = 0;
  const context = {
    window: { addEventListener: (type, listener) => listeners.set(type, listener) },
    navigator: { clipboard: { writeText: async () => operatingSystemClipboardCalls++ } },
    DOMException,
  };
  vm.runInNewContext(browserSetupScript, context);
  return { ...context, listeners, operatingSystemClipboardCalls: () => operatingSystemClipboardCalls };
}

for (const protocol of ['codex:', 'claude:']) {
  test(`last-resort guard cancels ${protocol} even when page cancellation is broken`, () => {
    const stub = browserStub();
    const anchor = { href: `${protocol}//new?prompt=public`, dataset: { client: protocol === 'codex:' ? 'codex-app' : 'claude-app' } };
    const event = { target: { closest: () => anchor }, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    stub.listeners.get('click')(event);
    assert.equal(event.defaultPrevented, true);
    assert.equal(stub.window.__benchNativeGuard.length, 1);
    assert.equal(stub.window.__benchNativeGuard[0].cancelledByBench, false, 'the fallback must not pretend the page canceled first');
    event.defaultPrevented = true;
    stub.listeners.get('click')(event);
    assert.equal(stub.window.__benchNativeGuard[1].cancelledByBench, true);
  });
}

test('browser clipboard success and denial are isolated from the operating system', async () => {
  const stub = browserStub();
  const context = 'Read the public index.\nKeep exact Unicode: 意';
  await stub.navigator.clipboard.writeText(context);
  assert.equal(stub.window.__benchClipboardCapture[0], context);
  stub.window.__benchDenyClipboard = true;
  await assert.rejects(stub.navigator.clipboard.writeText('not retained'), { name: 'NotAllowedError' });
  assert.equal(stub.window.__benchClipboardCapture.length, 1);
  assert.equal(stub.operatingSystemClipboardCalls(), 0);
});

const quietSnapshot = () => ({
  presentation: 'quiet-field', row: { width: 257, height: 52 }, container: { width: 257 },
  quietField: {
    ink: 'rgb(52, 49, 45)', paper: 'rgb(251, 249, 244)', labelInk: 'rgb(52, 49, 45)', actionInk: 'rgb(52, 49, 45)',
    labelSurface: 'color(srgb 0.9313235 0.8990882 0.8703235)', copyIcon: 'color(srgb 0.63235294 0.47156863 0.37392157)', fontFamily: 'system-ui, sans-serif',
    dot: { width: 8, height: 8, radius: '50%', color: 'color(srgb 0.63235294 0.47156863 0.37392157)', animation: 'none' },
    outline: { hidden: true, pointerEvents: 'none', fill: 'none', strokeWidth: '1px', path: 'closed Z', width: 257, height: 56, radiusFive: true, tailEightByFour: true, stroke: 'color(srgb 0.63235294 0.47156863 0.37392157 / 0.5)' },
  },
});

test('candidate geometry checks reject an open or scaled outline and a clipped narrow container', () => {
  const actual = quietSnapshot();
  const checks = assessQuietFieldSnapshot(actual, { width: 320, theme: 'light' });
  assert.equal(checks.closedOnePixelOutline, true);
  assert.equal(checks.cssPixelOutlineGeometry, true);
  assert.equal(checks.narrowContainerRetained, true);
  actual.quietField.outline.path = 'open'; actual.quietField.outline.width = 300; actual.container.width = 272;
  const failed = assessQuietFieldSnapshot(actual, { width: 320, theme: 'light' });
  assert.equal(failed.closedOnePixelOutline, false);
  assert.equal(failed.cssPixelOutlineGeometry, false);
  assert.equal(failed.narrowContainerRetained, false);
});

test('color acceptance checks independently detect altered frame opacity and coupled mark/Copy colors', () => {
  const actual = quietSnapshot();
  const expected = assessQuietFieldSnapshot(actual, { width: 1440, theme: 'light' });
  assert.equal(expected.independentFrameColor, true); assert.equal(expected.signalMark, true); assert.equal(expected.signalCopyIcon, true);
  actual.quietField.outline.stroke = 'color(srgb 0.63235294 0.47156863 0.37392157 / 1)';
  actual.quietField.copyIcon = actual.quietField.ink;
  const failed = assessQuietFieldSnapshot(actual, { width: 1440, theme: 'light' });
  assert.equal(failed.independentFrameColor, false); assert.equal(failed.signalCopyIcon, false);
});

test('feedback acceptance rejects expanded Copied controls and a success paragraph moving later content', () => {
  const before = { row: { left: 24, top: 100, width: 257, height: 52 }, belowY: 210, controls: [{ left: 225, top: 104, width: 54, height: 44 }] };
  assert.equal(assessFeedbackGeometry(before, structuredClone(before)), true);
  const expanded = structuredClone(before); expanded.controls[0].width += 7;
  assert.equal(assessFeedbackGeometry(before, expanded), false);
  const paragraph = structuredClone(before); paragraph.belowY += 30;
  assert.equal(assessFeedbackGeometry(before, paragraph), false);
});

test('0.1.4 historical fixture adapter changes only the final Copy action identity assertion', () => {
  const source = fs.readFileSync(new URL('../pilot/reading-sdk-012/ui-fixtures.mjs', import.meta.url), 'utf8');
  const adapted = fs.readFileSync(new URL('./ui-fixtures-014.mjs', import.meta.url), 'utf8');
  assert.equal(adapted.slice(adapted.indexOf('/** Synthetic DOM checks.')), source.replace("focusable.at(-1).textContent === 'Copy'", "focusable.at(-1).getAttribute('aria-label') === 'Copy context for any Agent or conversation'"));
});

test('large-radius acceptance rejects corner-tail backtracking and a detached background triangle', () => {
  const defaultTail = { width: 257, height: 52, rx: 5, ry: 5, tail: { left: 17, right: 25, tipX: 21, baseline: 51.5, tipY: 55.5 }, triangle: { left: 17, width: 8, height: 4, bottom: -3.5, pointed: true } };
  assert.equal(Object.values(assessTailGeometry(defaultTail)).every(Boolean), true);
  const overlapping = { ...defaultTail, rx: 25.7 };
  assert.equal(assessTailGeometry(overlapping).tailBetweenTangents, false);
  assert.equal(assessTailGeometry(overlapping).noBottomBacktracking, false);
  const pill = { ...defaultTail, rx: 124, ry: 25, tail: { left: 124.5, right: 132.5, tipX: 128.5, baseline: 51.5, tipY: 55.5 }, triangle: { ...defaultTail.triangle, left: 124.5 } };
  assert.equal(Object.values(assessTailGeometry(pill)).every(Boolean), true);
  assert.equal(assessTailGeometry({ ...pill, triangle: defaultTail.triangle }).alignedBackgroundTriangle, false);
});
