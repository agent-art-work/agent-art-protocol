import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';

export const EXACT_POLICY = 'exact';
export const LAB_AX_POLICY = 'lab-claude-ax-paragraphs-v1';
export const LAB_AX_PRESENTATION_SHA256 = '3ea59be310fa0498e2ce2eb8d7c5d1c8f02c35f799ae3ec51cf5df50c750f1ad';

const MAX_TEXT_BYTES = 1_048_576;
const LAB_PINS = Object.freeze({
  sdkVersion: '0.1.4',
  archiveSha256: 'e035ac72091956dc3fa76acb0359876f6137ccca01a7551e4f675f1ca037d430',
  contextSha256: 'ebef0c1f9ce1c03a6028f840086b9ff079cb3fc2df53d79e6053b9b4f6a8bde6',
  contextBytes: 983,
  workId: 'https://agentart.work/#reading',
  workVersion: '1',
});

function knownPolicy(policy) {
  if (policy !== EXACT_POLICY && policy !== LAB_AX_POLICY) throw new Error('Unknown draft comparison policy.');
  return policy;
}

// The caller validates the manifest shape. This check narrows the candidate
// presentation policy to one pinned public fixture; it is not a UI attestation.
export function validateDraftPolicy(policy, manifest) {
  knownPolicy(policy);
  if (policy === LAB_AX_POLICY && (!manifest || !Object.entries(LAB_PINS).every(([key, value]) => manifest[key] === value))) {
    throw new Error('The Lab draft comparison policy requires its pinned manifest.');
  }
  return policy;
}

function textFacts(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_TEXT_BYTES || !value.isWellFormed()) {
    throw new Error('Draft comparison requires nonempty bounded well-formed UTF-8 text.');
  }
  const bytes = Buffer.byteLength(value, 'utf8');
  if (bytes > MAX_TEXT_BYTES) throw new Error('Draft comparison requires nonempty bounded well-formed UTF-8 text.');
  return {
    sha256: createHash('sha256').update(value, 'utf8').digest('hex'),
    bytes,
    characters: Array.from(value).length,
    newlines: value.split('\n').length - 1,
  };
}

// This only compares supplied strings. The Agent controller still supplies the
// scoped UI observation; neither result proves transport fidelity or execution.
export function compareDraftText(canonicalText, exposedText, { policy = EXACT_POLICY } = {}) {
  knownPolicy(policy);
  const canonical = textFacts(canonicalText);
  const exposed = textFacts(exposedText);
  if (policy === LAB_AX_POLICY && (canonical.sha256 !== LAB_PINS.contextSha256 || canonical.bytes !== LAB_PINS.contextBytes)) {
    throw new Error('The Lab draft comparison policy requires its pinned canonical text.');
  }
  const exactMatches = canonicalText === exposedText;
  const collapsedMatches = policy === LAB_AX_POLICY && exposedText === canonicalText.replaceAll('\n\n', '\n');
  return {
    policy,
    exactMatches,
    presentationMatches: exactMatches || collapsedMatches,
    basis: exactMatches ? 'exact' : collapsedMatches ? 'paragraph-blank-lines-collapsed' : 'different',
    canonicalSha256: canonical.sha256,
    exposedSha256: exposed.sha256,
    canonicalBytes: canonical.bytes,
    exposedBytes: exposed.bytes,
    canonicalCharacters: canonical.characters,
    exposedCharacters: exposed.characters,
    canonicalNewlines: canonical.newlines,
    exposedNewlines: exposed.newlines,
  };
}
