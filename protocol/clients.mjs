// Browser-safe, allowlisted URL preparation only. No discovery, app opening,
// storage, hashing, logging, background inference or answer callback.
export const CLIENT_SOURCES = Object.freeze({
  codex: 'https://learn.chatgpt.com/docs/app/commands',
  claude: 'https://support.claude.com/en/articles/14729294-open-claude-desktop-with-a-link',
});

export function buildClientHandoff({ client, prompt, conversation = 'fresh', surface = 'chat' }) {
  if (!['codex-app', 'claude-app'].includes(client)) throw new TypeError('Choose a supported Agent app or copy the context into your own client.');
  if (conversation !== 'fresh') throw new TypeError('For an existing conversation, copy the context and paste it into the conversation you choose. Automatic attachment is not supported.');
  if (!['chat', 'code'].includes(surface) || (client === 'codex-app' && surface !== 'chat')) throw new TypeError('Unsupported Agent surface.');
  if (typeof prompt !== 'string' || !prompt.trim() || !prompt.isWellFormed() || prompt.includes('\u0000') || new TextEncoder().encode(prompt).length > 12000) throw new TypeError('The handoff context must be nonempty, valid text of at most 12,000 UTF-8 bytes.');
  const route = client === 'codex-app' ? 'codex://new?prompt=' : surface === 'code' ? 'claude://code/new?q=' : 'claude://claude.ai/new?q=';
  return { client, conversation: 'fresh', surface, url: `${route}${encodeURIComponent(prompt)}`, behavior: 'prefill-new-composer', requiresSend: true };
}
