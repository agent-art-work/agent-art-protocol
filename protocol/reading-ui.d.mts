import type { SealedRecord } from './index.mjs';
import type { ReadingOptions, Reading } from './reading.mjs';
/** IDs reported by a host integration; not independent installation proof. */
export interface ReadingClientAvailability { readonly clients: ReadonlyArray<{ readonly id: 'codex-app' | 'claude-app' }> }
export interface ReadingUIOptions extends ReadingOptions {
  /** Optional host-supplied availability check. The SDK itself performs no probing or fetch. */
  discoverClients?: () => ReadingClientAvailability | Promise<ReadingClientAvailability>;
  /** Visible identity/About-link label. Defaults to Ask your Agent. */
  label?: string;
  evidence?: boolean;
  onReceipt?: (receipt: SealedRecord) => void | Promise<void>;
}
export interface MountedReading { readonly reading: Reading; destroy(): void }
export function mountReading(element: HTMLElement, options: ReadingUIOptions): MountedReading;
