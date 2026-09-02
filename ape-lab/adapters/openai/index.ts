import { AIAdapter, AIAdapterResponse } from '../../core/runtime/index.js';
import { APEProtocol } from '../../core/protocol/types.js';

export interface OpenAIAdapterOptions {
  apiKey?: string;
  model?: string;
}

export class OpenAIAdapter implements AIAdapter {
  public name = 'OpenAIAdapter';
  private model: string;

  constructor(options: OpenAIAdapterOptions = {}) {
    this.model = options.model || 'gpt-4o';
  }

  public async execute(protocol: APEProtocol, promptExtra?: string): Promise<AIAdapterResponse> {
    // Stub / Interface abstraction for OpenAI
    const responseText = `[OpenAI ${this.model} Response for Protocol: ${protocol.rawString}] ${promptExtra || 'Task completed successfully.'}`;
    return {
      rawResponse: responseText,
      outputTokens: Math.max(1, Math.round(responseText.length / 4)),
      metadata: { model: this.model, provider: 'openai' },
    };
  }
}
