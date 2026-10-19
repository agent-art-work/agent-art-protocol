export { buildClientHandoff } from './clients.mjs';
export type JSONValue = null | boolean | number | string | JSONValue[] | { [key: string]: JSONValue };
export interface Work {
  id: string; version: string; title: string; purpose: string;
  capabilities: ('handoff' | 'participation')[];
  context: ({ id: string; kind: 'text'; text: string; mode: 'snapshot'; digest?: string } | { id: string; kind: 'reference'; url: string; mode: 'snapshot' | 'live'; digest?: string })[];
  conditions: { [key: string]: JSONValue | undefined; evidence?: { requireAgentAct?: boolean; requireConsequence?: boolean } };
  publisher?: { id: string; label: string };
}
export interface Participant { id: string; kind: 'human' | 'agent' | 'service'; label: string; roles?: string[]; authority?: JSONValue }
export interface Act { id: string; participant: string; kind: string; content: JSONValue; context?: { workVersion: string; actIds?: string[] } }
export interface Relation { id: string; participant: string; kind: string; from: string; to: { type: 'work' | 'act'; id: string } }
export interface Observation { id: string; observer: string; event: string; subjects: string[]; material?: JSONValue; trust: string[]; limits: string[] }
export interface Artifact { id: string; mediaType: string; content: string; actIds?: string[]; claims?: string[] }
export interface RecordInput { work: Work; instance?: string; participants?: Participant[]; acts?: Act[]; relations?: Relation[]; observations?: Observation[]; artifacts?: Artifact[]; schema?: string }
export interface ParticipationRecord extends RecordInput { schema: string; participants: Participant[]; acts: Act[]; relations: Relation[]; observations: Observation[]; artifacts: Artifact[] }
export interface SealedRecord extends ParticipationRecord { integrity: { algorithm: 'sha256'; digest: string } }
export type CheckStatus = 'supported' | 'contradicted' | 'not-established';
export interface Check { claim: string; status: CheckStatus; detail: string; subject?: string }
export interface ConsequenceCheck extends Check { subject: string }
export interface Verification { checks: Check[]; limits: string[] }
export const SCHEMA: 'agent-art-protocol/0.1-experimental';
export function canonicalJSON(value: unknown): string;
export function defineWork(value: Work): Work;
export function participant(value: Participant): Participant;
export function act(value: Act): Act;
export function relation(value: Relation): Relation;
export function createRecord(value: RecordInput): ParticipationRecord;
export function seal(value: RecordInput): Promise<SealedRecord>;
export function verify(value: unknown, options?: { checkConsequence?: (record: ParticipationRecord) => ConsequenceCheck[] | Promise<ConsequenceCheck[]> }): Promise<Verification>;
export const sealRecord: typeof seal;
export const verifyRecord: typeof verify;
