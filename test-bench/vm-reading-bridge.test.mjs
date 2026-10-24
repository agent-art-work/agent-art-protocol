/** CLI/import guard checks only. No VM, app, browser or network is contacted. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./vm-reading-bridge.py', import.meta.url));
const absent = '/nonexistent-agent-art-reading-guard-fixture';
const required = ['--connection', absent + '/connection.json', '--record', absent + '/record.json'];
const observed = ['--environment', absent + '/environment.json'];
const run = args => spawnSync('python3', [script, ...args], { encoding: 'utf8', timeout: 5000 });
function rejectedBeforeProfile(result, reason) {
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, reason);
  assert.doesNotMatch(result.stderr, /Traceback|FileNotFoundError|No such file|Guest RPC|Guest transport/u,
    'Bad scope must be rejected before any profile, transport or authority access.');
  assert.equal(result.stdout, '', 'No runtime or authority event should be emitted.');
}

test('reading bridge help separates default draft-only and explicit one-Send trial without startup', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0, result.stderr);
  const help = result.stdout.replace(/\s+/gu, ' ');
  assert.match(help, /Guest regular Chrome and Lab reading; draft-only by default, separate one-Send trial\./u);
  for (const flag of ['--authorize-handoff', '--connection', '--record', '--environment', '--browser-origin']) {
    assert.ok(help.includes(flag), 'Missing help flag ' + flag);
  }
  assert.match(help, /Record existing operator authorization; does not obtain consent/u);
  assert.doesNotMatch(help, /--allow-send|--authorize-send|--type|--keypress|--clear/u);
  assert.equal(result.stderr, '');
});

test('reading bridge requires handoff authorization before reading any supplied profile', () => {
  rejectedBeforeProfile(run(required), /Explicit no-Send handoff authorization required/u);
  rejectedBeforeProfile(run([...required, ...observed, '--browser-origin', 'https://hostile.invalid']),
    /Explicit no-Send handoff authorization required/u);
});

test('reading bridge requires environment and origin together before any connection read', () => {
  for (const extra of [observed, ['--browser-origin', 'http://127.0.0.1:4180']]) {
    rejectedBeforeProfile(run([...required, '--authorize-handoff', ...extra]),
      /Full handoff requires both observed environment and owned browser origin/u);
  }
});

test('reading bridge rejects foreign, noncanonical and invalid loopback origins before profile access', () => {
  for (const origin of [
    'https://127.0.0.1:4180', 'http://localhost:4180', 'http://192.0.2.4:4180',
    'http://127.0.0.1:4180/', 'http://127.0.0.1:4180/path', 'http://127.0.0.1:4180?lane=desktop',
    'http://127.0.0.1:4180#reading-test', 'http://user@127.0.0.1:4180',
    'http://127.0.0.1', 'http://127.0.0.1:0',
  ]) {
    rejectedBeforeProfile(run([...required, '--authorize-handoff', ...observed, '--browser-origin', origin]),
      /Only the owned loopback origin is allowed/u);
  }
  for (const port of [1000, 1023, 65536, 99999]) {
    rejectedBeforeProfile(run([...required, '--authorize-handoff', ...observed,
      '--browser-origin', 'http://127.0.0.1:' + port]), /owned loopback port must be within 1024\.\.65535/u);
  }
});

test('reading bridge rejects legacy Send switches and arbitrary composer input', () => {
  for (const flag of ['--allow-send', '--authorize-send', '--type', '--keypress', '--clear']) {
    rejectedBeforeProfile(run([...required, '--authorize-handoff', flag]), /unrecognized arguments/u);
  }
});

test('importing the reading bridge performs no connection reads, subprocesses, prompts or native startup', () => {
  const code = String.raw`
import pathlib, runpy, socket, subprocess, sys, unittest.mock
def forbidden(*args, **kwargs):
    raise AssertionError('Import attempted startup or access')
with unittest.mock.patch.object(pathlib.Path, 'read_text', forbidden), \
     unittest.mock.patch.object(subprocess, 'Popen', forbidden), \
     unittest.mock.patch.object(subprocess, 'run', forbidden), \
     unittest.mock.patch.object(subprocess, 'check_output', forbidden), \
     unittest.mock.patch.object(socket, 'socket', forbidden), \
     unittest.mock.patch('builtins.input', forbidden):
    module = runpy.run_path(sys.argv[1], run_name='reading_bridge_import_guard')
    assert callable(module['main'])
print('import-only')
`;
  const result = spawnSync('python3', ['-c', code, script], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'import-only\n');
  assert.equal(result.stderr, '');
});

function pythonGuard(code) {
  const result = spawnSync('python3', ['-c', `import runpy, sys\nm = runpy.run_path(sys.argv[1], run_name='reading_bridge_guard_fixture')\n${code}`, script],
    { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
}

test('both owned-tab cleanup paths derive the active document URL rather than accepting page mentions', () => {
  pythonGuard(String.raw`
url = 'http://127.0.0.1:4180/?lane=browser&controller=agent#reading-synthetic-owned'
parse = m['current_chrome_page_url']
def capture(document, extras=''):
    return 'Window: "Synthetic public bench", App: Google Chrome.\n0 window Synthetic public bench\n\t1 HTML content Synthetic bench' + document + '\n\t\t2 text ' + url + '\n' + extras
assert parse(capture(', URL: ' + url)) == url
assert parse(capture(', URL: ' + url.removeprefix('http://'))) == url
# This is the previously unsafe case: a different active page mentions the
# owned URL. Cleanup must identify the actual native active document instead.
for document in [', URL: https://unrelated.invalid/', ', URL: /relative', ', URL: http://127.0.0.1:4180@unrelated.invalid/']:
    try:
        parse(capture(document))
        raise AssertionError('Wrong active document was accepted')
    except RuntimeError:
        pass
try:
    parse(capture(''))
    raise AssertionError('A body mention became active-page ownership')
except RuntimeError:
    pass
# Missing HTML URL can use only one current, enabled, exact native address.
assert parse(capture('', '\t3 text field (settable) Description: Address and search bar, Value: ' + url + '\n')) == url
for extras in ['\t3 text field Address and search bar, Value: /relative\n',
               '\t3 text field (disabled) Address and search bar, Value: ' + url + '\n',
               '\t3 text field Address and search bar, Value: ' + url + '\n\t4 text field Address and search bar, Value: ' + url + '\n',
               '\t3 HTML content Another document, URL: ' + url + '\n']:
    try:
        parse(capture('', extras))
        raise AssertionError('Missing/ambiguous address or document was accepted')
    except RuntimeError:
        pass
`);
});

test('normal empty session app approval is accepted and unfamiliar schema, URL flow or app scope is refused', () => {
  pythonGuard(String.raw`
import copy
validate = m['empty_session_app_approval']
allowed = {'com.google.Chrome': ['get_app_state', 'click']}
normal = {'serverName': 'cua_repl', 'mode': 'form', 'requestedSchema': {'type': 'object', 'properties': {}},
          '_meta': {'connector_id': 'computer-use', 'tool_name': 'click', 'tool_params': {'app': 'com.google.Chrome'}}}
assert validate(normal, allowed)
for transform in [lambda p: p.update(mode='url'), lambda p: p.update(mode='unexpected'),
                  lambda p: p['requestedSchema'].update(properties={'credential': {'type': 'string'}}),
                  lambda p: p['requestedSchema'].update(required=['credential']),
                  lambda p: p['requestedSchema'].update(type='string'),
                  lambda p: p['_meta']['tool_params'].update(app='com.google.Chrome.beta'),
                  lambda p: p['_meta'].update(tool_name='press_key'),
                  lambda p: p['_meta'].update(connector_id='different'),
                  lambda p: p.update(serverName='different'), lambda p: p.update(requestedSchema=None)]:
    changed = copy.deepcopy(normal)
    transform(changed)
    assert not validate(changed, allowed), changed
`);
});

test('a failed fresh observation invalidates the old capture before invoking CUA', () => {
  pythonGuard(String.raw`
slot = {'capture': {'captureId': 'old-reviewed-capture', 'target': 'chrome'}}
attempts = []
def failing_read():
    assert slot['capture'] is None, 'Old input authority survived into the new observation request'
    attempts.append('read')
    raise RuntimeError('Synthetic observation unavailable')
try:
    m['acquire_observation'](slot, failing_read)
    raise AssertionError('Expected synthetic read failure')
except RuntimeError:
    pass
assert slot['capture'] is None
assert attempts == ['read']
# Even a successful API return does not stamp or restore qualification itself.
assert m['acquire_observation'](slot, lambda: {'content': []}) == {'content': []}
assert slot['capture'] is None
`);
});


test('one-Send trial requires explicit handoff direction and complete observed inputs before profile access', () => {
  rejectedBeforeProfile(run([...required, '--authorize-submit']), /Explicit no-Send handoff authorization required/u);
  for (const extra of [[], observed, ['--browser-origin', 'http://127.0.0.1:4180']]) {
    rejectedBeforeProfile(run([...required, '--authorize-handoff', '--authorize-submit', ...extra]),
      /Submission requires the full observed environment and owned browser origin/u);
  }
});


test('explicit trial preparation profile cannot widen a default draft-only connection', () => {
  rejectedBeforeProfile(run([...required, '--authorize-handoff', '--submitted-policy', 'claude-inline-static-v1']),
    /submitted-message policy requires separate submission authorization/u);
  for (const profile of ['lab-unified-reading-trial-v1','lab-unified-reading-trial-v2','lab-unified-reading-trial-v3']) {
    rejectedBeforeProfile(run([...required, '--authorize-handoff', '--trial-profile', profile]),
      /A trial profile requires separate submission authorization/u);
  }
  rejectedBeforeProfile(run([...required, '--authorize-handoff', '--authorize-submit', '--trial-profile', 'unrecognized']),
    /invalid choice/u);
});

test('startup cleanup accepts the native main-window restore container and rejects page imitations or telemetry changes',()=>{
  pythonGuard(String.raw`
close=m['chrome_startup_close']
prompt='\t\t62 container Restore pages?\n\t\t\t63 container\n\t\t\t\t64 heading Restore pages?\n\t\t\t\t65 button Close\n\t\t\t\t67 text Chrome didn\'t shut down correctly.\n\t\t\t\t68 checkbox Help make Google Chrome better by sending crash reports and usage statistics to Google, Value: 0\n\t\t\t\t71 button Restore\n'
actual='Window: "New Tab", App: Google Chrome.\n0 standard window New Tab\n\t1 container New Tab\n\t\t55 button Close\n'+prompt+'\t72 close button\n'
assert close(actual)==65
standalone='Window: "Restore pages?", App: Google Chrome.\n'+prompt
assert close(standalone)==65
for bad in [actual.replace('Value: 0','Value: 1'),actual.replace('64 heading Restore pages?','64 text Restore pages?'),actual.replace(prompt,prompt+prompt),actual.replace(prompt,'\n'.join('\t\t'+x for x in prompt.splitlines())),actual.replace('App: Google Chrome.','App: Google Chrome Beta.')]:
    try:
        close(bad)
        raise AssertionError('Unowned or altered startup prompt accepted')
    except RuntimeError:
        pass
`);
});
