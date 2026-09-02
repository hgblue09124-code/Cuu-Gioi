import { AIAdapter, AIAdapterResponse } from '../../core/runtime/index.js';
import { APEProtocol } from '../../core/protocol/types.js';

export interface LocalAdapterOptions {
  modelName?: string;
  simulatedDelayMs?: number;
}

export class LocalAdapter implements AIAdapter {
  public name = 'LocalModelAdapter';
  private modelName: string;
  private delayMs: number;

  constructor(options: LocalAdapterOptions = {}) {
    this.modelName = options.modelName || 'ape-local-v1';
    this.delayMs = options.simulatedDelayMs || 50;
  }

  public async execute(protocol: APEProtocol, promptExtra?: string): Promise<AIAdapterResponse> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    const responseText = `[Mô hình Local (${this.modelName}) đã xử lý Giao thức APE: ${protocol.rawString}] ${promptExtra || 'Thực thi hoàn tất đúng quy tắc.'}`;

    return {
      rawResponse: responseText,
      outputTokens: Math.max(1, Math.round(responseText.length / 4)),
      metadata: { model: this.modelName, provider: 'local' },
    };
  }
}
