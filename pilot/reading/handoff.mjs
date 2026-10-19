import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { buildClientHandoff, CLIENT_SOURCES } from '@agent-art/protocol/clients';

// These links prepare a new composer. They do not attach to private history,
// send a request, select a model, change settings or return an answer here.
// Route descriptions were checked against official documentation on 2026-10-19.
export const HANDOFF_SOURCES = CLIENT_SOURCES;

const CLIENTS = Object.freeze([
  { id: 'codex-app', name: 'Codex app', bundleId: 'com.openai.codex', scheme: 'codex', appNames: ['ChatGPT.app', 'Codex.app'] },
  { id: 'claude-app', name: 'Claude app', bundleId: 'com.anthropic.claudefordesktop', scheme: 'claude', appNames: ['Claude.app'] },
]);

function clientDefinition(id) {
  const client = CLIENTS.find(item => item.id === id);
  if (!client) throw new Error('Choose a supported Agent app or copy the context into your own client.');
  return client;
}

export function buildHandoff(input) {
  clientDefinition(input.client);
  const { surface: _surface, ...prepared } = buildClientHandoff(input);
  return prepared;
}

function readBundle(appPath) {
  const file = path.join(appPath, 'Contents', 'Info.plist');
  if (!fs.existsSync(file)) return null;
  const result = spawnSync('/usr/bin/plutil', ['-convert', 'json', '-o', '-', file], {
    encoding: 'utf8', timeout: 3000, maxBuffer: 512 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'], shell: false,
  });
  if (result.error || result.status !== 0) return null;
  try { return JSON.parse(result.stdout); } catch { return null; }
}

function installedClient(definition, { platform = process.platform, readAppBundle = readBundle } = {}) {
  if (platform !== 'darwin') return null;
  for (const root of ['/Applications', path.join(os.homedir(), 'Applications')]) {
    for (const name of definition.appNames) {
      const metadata = readAppBundle(path.join(root, name));
      const schemes = Array.isArray(metadata?.CFBundleURLTypes)
        ? metadata.CFBundleURLTypes.flatMap(entry => Array.isArray(entry?.CFBundleURLSchemes) ? entry.CFBundleURLSchemes : [])
        : [];
      if (metadata?.CFBundleIdentifier === definition.bundleId && schemes.includes(definition.scheme)) {
        return { version: typeof metadata.CFBundleShortVersionString === 'string' ? metadata.CFBundleShortVersionString.slice(0, 100) : null };
      }
    }
  }
  return null;
}

export function discoverHandoffClients(options = {}) {
  return CLIENTS.map(definition => {
    const observed = installedClient(definition, options);
    return {
      id: definition.id, name: definition.name, available: observed !== null,
      conversation: 'fresh', version: observed?.version ?? null,
      detail: observed
        ? 'Installed app and registered URL scheme detected. Opens a new composer with the Lab context; review and send there, then ask your questions in your Agent. Existing conversations use copy context. No read or answer confirmation returns to this page.'
        : 'No matching installed macOS app and registered scheme were detected. Copy the Lab context into your chosen Agent instead.',
    };
  });
}

export async function openHandoff({ client, prompt, conversation = 'fresh' }, { spawnProcess = spawn, ...discovery } = {}) {
  const prepared = buildHandoff({ client, prompt, conversation });
  const definition = clientDefinition(client);
  if (!installedClient(definition, discovery)) throw new Error('The selected app route is unavailable. Copy the context into your Agent instead.');
  await new Promise((resolve, reject) => {
    let child;
    let timer;
    let settled = false;
    const finish = error => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      error ? reject(error) : resolve();
    };
    try {
      child = spawnProcess('/usr/bin/open', ['-b', definition.bundleId, '-u', prepared.url], {
        shell: false, stdio: ['ignore', 'ignore', 'ignore'],
      });
      child.once('error', () => finish(new Error('The app open request failed. Copy the context into your Agent instead.')));
      child.once('exit', code => finish(code === 0 ? null : new Error('macOS did not accept the app open request. Copy the context instead.')));
      timer = setTimeout(() => {
        try { child.kill('SIGTERM'); } catch { /* Only the owned open helper is signaled. */ }
        finish(new Error('The app open request timed out. Check your Agent before trying again, or copy the context.'));
      }, 5000);
      timer.unref?.();
    } catch { finish(new Error('The app open request could not start. Copy the context into your Agent instead.')); }
  });
  // Exit 0 means macOS accepted the open request. It does not establish that
  // the intended composer appeared, the user sent, or the Agent read anything.
  return { requested: true, conversation: 'fresh', client };
}
