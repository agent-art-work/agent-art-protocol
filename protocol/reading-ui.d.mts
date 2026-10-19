import type { SealedRecord } from './index.mjs';
import type { ReadingOptions, Reading } from './reading.mjs';
export interface ReadingUIOptions extends ReadingOptions {
  label?: string;
  evidence?: boolean;
  onReceipt?: (receipt: SealedRecord) => void | Promise<void>;
}
export interface MountedReading { readonly reading: Reading; destroy(): void }
export function mountReading(element: HTMLElement, options: ReadingUIOptions): MountedReading;
