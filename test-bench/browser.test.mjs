import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { browserSetupScript } from './check-browser.mjs';

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
