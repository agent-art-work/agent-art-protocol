/** Synthetic DOM checks. Native activation is canceled or replaced by a same-page fragment. */
export async function checkReadingUI() {
  const [{ mountReading }, { default: original }, { verify }] = await Promise.all([
    import('/assets/agent-art-sdk/reading-ui.mjs'), import('/assets/agent-art-reading-work.mjs'), import('/assets/agent-art-sdk/index.mjs'),
  ]);
  const results = [];
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function until(predicate) {
    for (let i = 0; i < 100; i++) { if (predicate()) return; await wait(40); }
    throw new Error('Timed out waiting for fixture state');
  }
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const clipboard = writeText => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  async function scenario(name, action) {
    const host = document.createElement('section'); document.body.append(host);
    let mounted;
    try {
      const mount = options => (mounted = mountReading(host, { work: original, ...options }));
      await action(host, mount); results.push({ name, passed: true });
    } catch (error) { results.push({ name, passed: false, error: error.message }); }
    finally { mounted?.destroy(); host.remove(); }
  }
  await scenario('default routes, exact public context, names and no mode forcing', async (host, mount) => {
    const component = mount();
    const links = [...host.querySelectorAll('.aap-reading-agent')];
    assert(links.length === 2, 'default route count');
    assert(links.map(x => x.childNodes[0].textContent).join(',') === 'ChatGPT,Claude', 'visible client names');
    for (const link of links) {
      const url = new URL(link.href), parameter = link.dataset.client === 'codex-app' ? 'prompt' : 'q';
      assert(url.searchParams.get(parameter) === component.reading.context, 'exact context');
      assert([...url.searchParams.keys()].join(',') === parameter, 'no mode parameter');
    }
    assert(!host.querySelector('select,details,[aria-expanded]'), 'compact presentation');
    assert(host.querySelector('.aap-reading-title').tagName === 'SPAN', 'label is not interactive');
    assert(host.querySelector('.aap-reading-hint').textContent.includes('not been checked'), 'no installation claim');
    assert(!host.querySelector('.aap-reading-text').getClientRects().length, 'context initially hidden');
    const focusable = [...host.querySelectorAll('a,button')].filter(x => !x.hidden);
    assert(focusable.at(-1).textContent === 'Copy', 'copy remains final action');
    links[0].focus(); assert(document.activeElement === links[0], 'native link keyboard focus');
  });
  await scenario('configured client subset retains Copy', async (host, mount) => {
    mount({ clients: ['claude-app'] });
    assert(host.querySelectorAll('.aap-reading-agent').length === 1, 'subset count');
    assert(host.querySelector('.aap-reading-agent').dataset.client === 'claude-app', 'subset client');
    assert(host.querySelector('.aap-reading-copy').getClientRects().length, 'Copy visible');
  });
  await scenario('copy succeeds exactly, denial selects exact text, no invented receipts', async (host, mount) => {
    let received = 0, copied;
    const component = mount({ evidence: true, onReceipt: () => received++ });
    clipboard(async text => { copied = text; });
    host.querySelector('.aap-reading-copy').click();
    await until(() => !host.querySelector('.aap-reading-copy').disabled);
    assert(copied === component.reading.context, 'clipboard exact');
    clipboard(async () => { throw new DOMException('Synthetic denial', 'NotAllowedError'); });
    host.querySelector('.aap-reading-copy').click();
    await until(() => !host.querySelector('.aap-reading-copy').disabled);
    const text = host.querySelector('.aap-reading-text');
    assert(!text.hidden && text.readOnly && text.value === component.reading.context, 'manual fallback');
    assert(document.activeElement === text && text.selectionStart === 0 && text.selectionEnd === text.value.length, 'exact selection');
    assert(received === 0 && host.querySelector('.aap-reading-download').hidden, 'no destination invented for Copy');
  });
  for (const [name, discoverClients, count, hint] of [
    ['empty host discovery', () => ({ clients: [] }), 0, 'reported no'],
    ['host discovery filters unknown and repeated IDs', () => ({ clients: [{ id: 'claude-app' }, { id: 'claude-app' }, { id: 'unknown', url: 'https://untrusted.invalid' }] }), 1, 'reported by'],
    ['failed host discovery offers unverified routes', () => { throw Error('Synthetic failure'); }, 2, 'could not be checked'],
    ['malformed host discovery offers unverified routes', () => ({ clients: null }), 2, 'could not be checked'],
    ['timed-out host discovery offers unverified routes', () => new Promise(() => {}), 2, 'could not be checked'],
  ]) await scenario(name, async (host, mount) => {
    mount({ discoverClients });
    assert(host.querySelector('.aap-reading-copy').getClientRects().length, 'Copy immediate');
    await until(() => host.querySelector('.aap-reading-hint').textContent.includes(hint));
    assert(host.querySelectorAll('.aap-reading-agent').length === count, 'available route count');
    assert(host.querySelector('.aap-reading-copy').getClientRects().length, 'Copy retained');
  });
  await scenario('oversized context remains exact and manual-only', async (host, mount) => {
    const work = structuredClone(original), text = '意'.repeat(4001);
    work.context.find(item => item.kind === 'text').text = text;
    const component = mount({ work });
    assert(component.reading.context === text, 'no truncation');
    assert(!host.querySelector('.aap-reading-agent'), 'oversized URL not offered');
    assert(host.querySelector('.aap-reading-copy').getClientRects().length, 'Copy visible');
  });
  await scenario('ancestor cancellation creates no receipt or handoff status', async (host, mount) => {
    let received = 0; mount({ evidence: true, onReceipt: () => received++ });
    host.addEventListener('click', event => event.preventDefault(), { once: true });
    host.querySelector('.aap-reading-agent').click(); await wait(80);
    assert(!host.querySelector('.aap-reading-status').textContent && received === 0, 'canceled navigation');
  });
  await scenario('synthetic native observation verifies and callback failure is visible', async (host, mount) => {
    let receipt;
    mount({ evidence: true, onReceipt: value => { receipt = value; throw Error('Synthetic callback failure'); } });
    const anchor = host.querySelector('.aap-reading-agent');
    anchor.href = '#synthetic-handoff-only'; // Prevent all native app activation in this fixture.
    anchor.click();
    await until(() => !!receipt && host.querySelector('.aap-reading-status').textContent.includes('callback failed'));
    const report = await verify(receipt);
    assert(report.checks.find(x => x.claim === 'record-integrity').status === 'supported', 'receipt integrity');
    assert(report.checks.find(x => x.claim === 'agent-execution-origin').status === 'not-established', 'no execution claim');
    assert(receipt.observations[0].material.client === 'codex-app', 'internal identity preserved');
    assert(!host.querySelector('.aap-reading-download').hidden, 'receipt downloadable');
  });
  await scenario('Copy supersedes a pending native callback without stale status', async (host, mount) => {
    let fail, started = false;
    mount({ evidence: true, onReceipt: () => { started = true; return new Promise((_, reject) => { fail = reject; }); } });
    const anchor = host.querySelector('.aap-reading-agent'); anchor.href = '#synthetic-pending-only'; anchor.click();
    await until(() => started);
    clipboard(async () => {}); host.querySelector('.aap-reading-copy').click();
    await until(() => !host.querySelector('.aap-reading-copy').disabled);
    fail(Error('Synthetic stale rejection')); await wait(40);
    assert(!host.querySelector('.aap-reading-status').textContent.includes('callback failed'), 'stale callback suppressed');
    assert(host.querySelector('.aap-reading-download').hidden, 'old receipt discarded');
  });
  await scenario('teardown suppresses late discovery and clipboard completion', async (host, mount) => {
    let discover, finish;
    const component = mount({ discoverClients: () => new Promise(resolve => { discover = resolve; }) });
    await until(() => !!discover);
    clipboard(() => new Promise(resolve => { finish = resolve; }));
    host.querySelector('.aap-reading-copy').click(); await until(() => !!finish);
    component.destroy(); discover({ clients: [{ id: 'codex-app' }] }); finish(); await wait(40);
    assert(!host.children.length, 'destroyed host stays empty');
    const remounted = mount(); assert(host.querySelector('.aap-reading-copy'), 'remount allowed'); remounted.destroy();
  });
  await scenario('immediate teardown does not start host discovery', async (host, mount) => {
    let calls = 0;
    const component = mount({ discoverClients: () => { calls++; return { clients: [] }; } });
    component.destroy(); await wait(40);
    assert(calls === 0 && !host.children.length, 'no discovery after immediate teardown');
  });
  await scenario('duplicate mounts and invalid UI options reject', async (host, mount) => {
    const component = mount(); let duplicate = false;
    try { mountReading(host, { work: original }); } catch { duplicate = true; }
    assert(duplicate, 'duplicate rejected'); component.destroy();
    for (const options of [{ label: '' }, { evidence: 'yes' }, { discoverClients: 'scan' }, { onReceipt: true }]) {
      let rejected = false; try { mountReading(host, { work: original, ...options }); } catch { rejected = true; }
      assert(rejected, 'invalid options rejected');
    }
  });
  return { passed: results.every(x => x.passed), results, boundary: 'Synthetic DOM fixtures only. Native clicks canceled or redirected to same-page fragments; clipboard and host discovery explicitly stubbed. No Agent launch or inference.' };
}
