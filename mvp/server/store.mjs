import { open, mkdir, readFile, rename, unlink, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

/** A single-process, serialized store. One rename commits all records in a submission. */
export async function openStore(dataDir) {
  await mkdir(dataDir, { recursive: true, mode: 0o700 });
  await chmod(dataDir, 0o700);
  const lockPath = join(dataDir, 'server.lock');
  let lock;
  try {
    lock = await open(lockPath, 'wx', 0o600);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let pid;
    try { pid = Number(await readFile(lockPath, 'utf8')); } catch {}
    if (Number.isInteger(pid) && pid > 0) {
      try { process.kill(pid, 0); throw new Error('This private data directory is already in use.'); }
      catch (probe) { if (probe.code !== 'ESRCH') throw probe; }
    } else throw new Error('The private store lock cannot be verified; inspect it before restarting.');
    await unlink(lockPath);
    lock = await open(lockPath, 'wx', 0o600);
  }
  await lock.writeFile(String(process.pid));
  await lock.sync();
  const statePath = join(dataDir, 'state.json');
  let state;
  try {
    state = JSON.parse(await readFile(statePath, 'utf8'));
    if (state.schemaVersion !== 'agent-art-local-store/1' || !state.works) throw new Error('Unsupported local store.');
  } catch (error) {
    if (error.code !== 'ENOENT') { await lock.close(); await unlink(lockPath); throw error; }
    state = { schemaVersion: 'agent-art-local-store/1', instanceId: randomUUID(), works: {} };
  }
  let queue = Promise.resolve();
  let closed = false;
  async function writePrivate(path, value) {
    const temporary = `${path}.${randomUUID()}.tmp`;
    const file = await open(temporary, 'wx', 0o600);
    try { await file.writeFile(`${JSON.stringify(value, null, 2)}\n`); await file.sync(); }
    finally { await file.close(); }
    try { await rename(temporary, path); }
    catch (error) { await unlink(temporary).catch(() => {}); throw error; }
  }
  return {
    dataDir,
    read: () => structuredClone(state),
    writePrivate,
    mutate(fn) {
      if (closed) return Promise.reject(new Error('Store is closed.'));
      const result = queue.then(async () => {
        const next = structuredClone(state);
        const output = await fn(next);
        await writePrivate(statePath, next);
        // Acknowledgments follow the rename; a lost HTTP response can recover this state.
        state = next;
        const directory = await open(dataDir, 'r');
        try { await directory.sync(); } finally { await directory.close(); }
        return structuredClone(output);
      });
      queue = result.catch(() => {});
      return result;
    },
    async close() {
      if (closed) return;
      closed = true;
      await queue;
      await lock.close();
      await unlink(lockPath);
    },
  };
}
