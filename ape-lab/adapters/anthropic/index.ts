import { AIAdapter, AIAdapterResponse } from '../../core/runtime/index.js';
import { APEProtocol } from '../../core/protocol/types.js';

export interface AnthropicAdapterOptions {
  apiKey?: string;
  model?: string;
}

export class AnthropicAdapter implements AIAdapter {
  public name = 'AnthropicAdapter';
  private model: string;

  constructor(options: AnthropicAdapterOptions = {}) {
    this.model = options.model || 'claude-3-5-sonnet';
  }

  public async execute(protocol: APEProtocol, promptExtra?: string): Promise<AIAdapterResponse> {
    // Stub / Interface abstraction for Anthropic
    const responseText = `[Anthropic ${this.model} Response for Protocol: ${protocol.rawString}] ${promptExtra || 'Task processed adhering to constraints.'}`;
    return {
      rawResponse: responseText,
      outputTokens: Math.max(1, Math.round(responseText.length / 4)),
      metadata: { model: this.model, provider: 'anthropic' },
    };
  }
}
