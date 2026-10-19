// Checked with an existing local TypeScript compiler; excluded from the SDK.
import { defineWork, verify, type SealedRecord, type Verification } from '@agent-art/protocol';
import { buildClientHandoff } from '@agent-art/protocol/clients';
import { createReading, type Reading, type ReadingPlan } from '@agent-art/protocol/reading';
import { mountReading, type MountedReading } from '@agent-art/protocol/reading-ui';

const work = defineWork({
  id: 'type-consumer', version: '1', title: 'Read public sources', purpose: 'Check the public declaration boundary.',
  capabilities: ['handoff'], conditions: { evidence: { requireAgentAct: false } },
  context: [
    { id: 'invitation', kind: 'text', mode: 'snapshot', text: 'Read relevant public sources and report access failures.' },
    { id: 'index', kind: 'reference', mode: 'live', url: 'https://agentart.work/agent-index.json' },
  ],
});
const reading: Reading = createReading({ work, clients: ['claude-app', 'manual'] });
const plan: ReadingPlan = reading.prepare({ client: 'claude-app', conversation: 'fresh' });
if (plan.kind === 'native') {
  // A native plan always has a URL at runtime; the declaration should preserve
  // this discriminator so consumers need no unverified non-null assertion.
  const nativeURL: string = plan.url;
  new URL(nativeURL);
}
const manual = reading.prepare({ client: 'manual', conversation: 'existing' });
manual.context satisfies string;
const prepared = buildClientHandoff({ client: 'claude-app', surface: 'chat', prompt: reading.context });
prepared.url satisfies string;
const mounted: MountedReading = mountReading(document.createElement('div'), {
  work, evidence: true,
  onReceipt: async (receipt: SealedRecord) => {
    const report: Verification = await verify(receipt);
    report.checks[0].status satisfies 'supported' | 'contradicted' | 'not-established';
  },
});
mounted.destroy();
// @ts-expect-error The frame is not assignable after construction.
reading.context = 'Changed';
// @ts-expect-error Runtime allowlisted reading clients are reflected in types.
reading.prepare({ client: 'unknown-client' });
// @ts-expect-error Unsupported evidence claims must not be represented as events.
reading.receipt({ client: 'claude-app', event: 'agent-read', observer: 'browser' });
