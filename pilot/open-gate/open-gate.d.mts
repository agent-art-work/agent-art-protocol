import type { ReadingOptions, Reading, createReading as SDKCreate } from '@agent-art/protocol/reading';
import type { SealedRecord } from '@agent-art/protocol';
export interface OpenGateOptions extends ReadingOptions {
  createReading: typeof SDKCreate;
  label?: string;
  evidence?: boolean;
  onReceipt?: (receipt: SealedRecord) => void | Promise<void>;
  discoverClients?: () => Promise<{ scope: 'loopback-preview-host'; clients: Array<{ id: string }> }>;
}
export function mountOpenGate(element: HTMLElement, options: OpenGateOptions): { readonly reading: Reading; destroy(): void };
