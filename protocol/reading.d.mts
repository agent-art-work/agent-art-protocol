import type { SealedRecord, Work } from './index.mjs';

export type ReadingClient = 'codex-app' | 'claude-app' | 'manual';
export type ReadingConversation = 'fresh' | 'existing';
export type ReadingEvent = 'handoff-requested' | 'context-copied' | 'manual-context-selected';
export interface ReadingOptions { work: Work; context?: string; clients?: ReadingClient[] }
export interface ReadingRequest { client: ReadingClient; conversation?: ReadingConversation }
export type ReadingPlan = Readonly<{
  kind: 'native'; client: 'codex-app' | 'claude-app'; conversation: 'fresh';
  context: string; requiresSend: true; url: string;
} | {
  kind: 'manual'; client: ReadingClient; conversation: ReadingConversation;
  context: string; requiresSend: true; url?: never;
}>;
export interface ReadingObservation extends ReadingRequest {
  event: ReadingEvent;
  /** Application/browser name; this is an attributed local statement, not authenticated identity. */
  observer: string;
  /** Exact ISO timestamp; defaults to the caller runtime's current time. */
  observedAt?: string;
}
export interface Reading {
  readonly work: Readonly<Work>;
  readonly context: string;
  readonly clients: readonly ReadingClient[];
  prepare(request: ReadingRequest): ReadingPlan;
  /** Call only after actually observing the named action. The SDK cannot independently witness it. */
  receipt(observation: ReadingObservation): Promise<SealedRecord>;
}
export function createReading(options: ReadingOptions): Reading;
