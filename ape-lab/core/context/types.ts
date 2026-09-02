export type ContextSource =
  | 'conversation'
  | 'file'
  | 'code'
  | 'game_state'
  | 'history'
  | 'event'
  | 'api'
  | 'other_ai'
  | string;

export interface ContextItem {
  id: string;
  source: ContextSource;
  content: string | Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

export interface NormalizedContext {
  id: string;
  items: ContextItem[];
  rawText: string;
  rawSize: number;
  sourcesUsed: ContextSource[];
  createdAt: number;
}

export interface ContextEngineOptions {
  maxContextLength?: number;
  preserveConstraints?: boolean;
}
