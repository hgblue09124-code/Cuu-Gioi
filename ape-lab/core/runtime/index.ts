import { APEProtocol } from '../protocol/types.js';

export interface AIAdapterResponse {
  rawResponse: string;
  outputTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface AIAdapter {
  name: string;
  execute(protocol: APEProtocol, promptExtra?: string): Promise<AIAdapterResponse>;
}

export interface RuntimeExecutionResult {
  executionId: string;
  protocol: APEProtocol;
  adapterName: string;
  response: AIAdapterResponse;
  executionTimeMs: number;
  timestamp: number;
}

export class APERuntime {
  private adapter: AIAdapter;

  constructor(adapter: AIAdapter) {
    this.adapter = adapter;
  }

  public async execute(protocol: APEProtocol, promptExtra?: string): Promise<RuntimeExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const response = await this.adapter.execute(protocol, promptExtra);
    const executionTimeMs = Date.now() - startTime;

    return {
      executionId,
      protocol,
      adapterName: this.adapter.name,
      response,
      executionTimeMs,
      timestamp: Date.now(),
    };
  }
}
