// Synthetic public-reading frame for SDK UI checks, not the publisher's live invitation.
const invitation = 'Read the public Agent Art knowledge index at https://agentart.work/agent-index.json. Use it as a discovery map and fetch only sources relevant to my question. Report sources you cannot access.\n\nThe conversation remains inside my Agent. Wait for my question.';
export default {
  id: 'urn:agent-art:reading:sdk-012-fixture', version: 'fixture-2026-10-21',
  title: 'Read agentart.work', purpose: 'Check the packaged reading interface with public context.',
  capabilities: ['handoff'],
  context: [
    { id: 'invitation', kind: 'text', mode: 'snapshot', text: invitation },
    { id: 'public-index', kind: 'reference', mode: 'live', url: 'https://agentart.work/agent-index.json' },
  ],
  conditions: { conversation: 'Questions and answers stay in the visitor’s chosen Agent.' },
};
