export const CLIENT_SOURCES: Readonly<{ codex: string; claude: string }>;
export interface ClientHandoffInput { client: 'codex-app' | 'claude-app'; prompt: string; conversation?: 'fresh'; surface?: 'chat' | 'code' }
export interface ClientHandoff { client: 'codex-app' | 'claude-app'; conversation: 'fresh'; surface: 'chat' | 'code'; url: string; behavior: 'prefill-new-composer'; requiresSend: true }
export function buildClientHandoff(value: ClientHandoffInput): ClientHandoff;
