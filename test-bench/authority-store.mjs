/** Local filesystem authority, outside the disposable workspace.
 * Placement outside a VM baseline remains an operator/controller assertion.
 * This is crash/rollback protection, not an independent or malicious-owner witness.
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/u;
const UUID = /^[a-f0-9-]{36}$/u;
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const within = (parent, child) => { const relative = path.relative(parent, child); return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)); };
const bindingFile = root => path.join(root, '.local/test-bench/authority-binding.json');

export function syncDirectory(directory) {
  const fd = fs.openSync(directory, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
export function writeExclusive(file, value) {
  const fd = fs.openSync(file, 'wx', 0o600);
  try { fs.writeFileSync(fd, JSON.stringify(value, null, 2) + '\n'); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  syncDirectory(path.dirname(file));
}
export function writeAtomic(file, value) {
  const temporary = file + '.' + randomUUID() + '.tmp';
  try { writeExclusive(temporary, value); fs.renameSync(temporary, file); syncDirectory(path.dirname(file)); }
  finally { fs.rmSync(temporary, { force: true }); }
}

function directory(value) {
  ensure(typeof value === 'string' && path.isAbsolute(value), 'An absolute external authority directory is required.');
  return fs.realpathSync(value);
}
function separated(workspace, store) {
  ensure(!within(workspace, store) && !within(store, workspace), 'Authority storage must be separate from the disposable workspace, including symlink aliases.');
}

/** Explicit initial setup only. Never recreates a missing already-bound store. */
export function bindAuthorityStore({ root, authorityRoot }) {
  const workspace = directory(root), file = bindingFile(workspace);
  if (fs.existsSync(file)) {
    const current = resolveAuthorityStore(workspace);
    if (authorityRoot !== undefined) ensure(directory(authorityRoot) === current.directory, 'The workspace is already bound to another authority store.');
    return current;
  }
  ensure(typeof authorityRoot === 'string' && path.isAbsolute(authorityRoot), 'Configure --authority-dir outside the disposable workspace before creating a case.');
  // Check the nearest existing ancestor before creating anything.
  let ancestor = path.resolve(authorityRoot);
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const proposed = path.resolve(directory(ancestor), path.relative(ancestor, path.resolve(authorityRoot)));
  separated(workspace, proposed);
  fs.mkdirSync(authorityRoot, { recursive: true, mode: 0o700 });
  const store = directory(authorityRoot); separated(workspace, store);
  const metadata = path.join(store, 'authority-store.json');
  if (!fs.existsSync(metadata)) {
    ensure(fs.readdirSync(store).length === 0, 'Refusing to initialize a nonempty authority directory.');
    writeExclusive(metadata, { schema: 'agent-art-bench/authority-store/1', storeId: randomUUID() });
  }
  const record = read(metadata);
  ensure(record.schema === 'agent-art-bench/authority-store/1' && UUID.test(record.storeId), 'Invalid authority store identity.');
  fs.mkdirSync(path.join(store, 'cases'), { recursive: true, mode: 0o700 });
  syncDirectory(store);
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  writeExclusive(file, { schema: 'agent-art-bench/authority-binding/1', storeId: record.storeId, directory: store });
  return resolveAuthorityStore(workspace);
}

export function resolveAuthorityStore(root) {
  const workspace = directory(root), binding = read(bindingFile(workspace));
  ensure(binding.schema === 'agent-art-bench/authority-binding/1' && UUID.test(binding.storeId), 'Invalid workspace authority binding.');
  const store = directory(binding.directory); separated(workspace, store);
  const metadata = read(path.join(store, 'authority-store.json'));
  ensure(metadata.schema === 'agent-art-bench/authority-store/1' && metadata.storeId === binding.storeId, 'Authority store identity changed; do not recreate or replace it.');
  ensure(directory(path.join(store, 'cases')) === path.join(store, 'cases'), 'Authority cases must not be symlinked.');
  return { storeId: binding.storeId, directory: store, workspace };
}

export const hasAuthorityBinding = root => fs.existsSync(bindingFile(root));
export function authorityCasePaths(id, root) {
  ensure(typeof id === 'string' && ID.test(id), 'Invalid case identifier.');
  const authority = resolveAuthorityStore(root), base = path.join(authority.directory, 'cases'), dir = path.join(base, id);
  if (fs.existsSync(dir)) ensure(directory(dir) === dir, 'Authority case directories must not be symlinked.');
  return { authority, base, dir, state: path.join(dir, 'case.json'), run: path.join(dir, 'run.json'),
    registration: path.join(dir, 'registration.json'), journal: path.join(dir, 'journal.json'),
    claim: path.join(dir, 'send-claimed.json'), handoff: path.join(dir, 'handoff-claimed.json'),
    dispatchEntered: path.join(dir, 'send-dispatch-entered.json'), dispatchResult: path.join(dir, 'send-dispatch-result.json'),
    mutex: path.join(dir, 'mutation.lock'), active: path.join(authority.directory, 'active-claude.json') };
}
export function registerAuthorityCase(p, { id, kind, contractSha256 }) {
  ensure(p.authority && ['desktop', 'diagnostic'].includes(kind) && ID.test(id) && /^[a-f0-9]{64}$/u.test(contractSha256), 'Bounded case registration is required.');
  writeExclusive(p.registration, { schema: 'agent-art-bench/authority-case/1', storeId: p.authority.storeId, caseId: id, kind, contractSha256 });
  return { storeId: p.authority.storeId, placement: 'external-directory-operator-attributed' };
}
export function assertAuthorityCase(p, state) {
  ensure(p.authority, 'Historical workspace-local cases are read-only; create a newly authorized externally stored case.');
  const registration = read(p.registration);
  ensure(registration.schema === 'agent-art-bench/authority-case/1' && registration.storeId === p.authority.storeId
    && state.authority?.storeId === p.authority.storeId && registration.caseId === state.id
    && (!state.executionContract || registration.contractSha256 === state.executionContract.contractSha256), 'Case authority binding differs.');
  return registration;
}
export function withAuthorityLock(p, action) {
  assertAuthorityCase(p, read(p.state));
  const nonce = randomUUID();
  writeExclusive(p.mutex, { schema: 'agent-art-bench/authority-lock/1', nonce });
  try { return action(); }
  finally {
    // A recovered/changed lock cannot be removed by an old controller.
    if (fs.existsSync(p.mutex) && read(p.mutex).nonce === nonce) { fs.unlinkSync(p.mutex); syncDirectory(p.dir); }
  }
}

/** Exceptional recovery is explicit, never automatic lock stealing. The caller
 * must actually establish the old controller stopped and input is exclusive.
 */
export function abandonStoppedControllerLock(p, { previousControllerStopped, exclusiveInput }) {
  ensure(previousControllerStopped === true && exclusiveInput === true, 'Recovery requires confirmed stopped prior controller and exclusive input.');
  assertAuthorityCase(p, read(p.state));
  if (fs.existsSync(p.mutex)) {
    fs.renameSync(p.mutex, path.join(p.dir, 'abandoned-lock-' + randomUUID() + '.json'));
    syncDirectory(p.dir);
  }
}
