import { ContextItem, ContextEngineOptions, NormalizedContext, ContextSource } from './types.js';

export * from './types.js';

export class ContextEngine {
  private items: ContextItem[] = [];
  private options: ContextEngineOptions;

  constructor(options: ContextEngineOptions = {}) {
    this.options = {
      maxContextLength: 100000,
      preserveConstraints: true,
      ...options,
    };
  }

  public addContext(
    source: ContextSource,
    content: string | Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): ContextItem {
    const item: ContextItem = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      source,
      content,
      metadata,
      timestamp: Date.now(),
    };
    this.items.push(item);
    return item;
  }

  public addItems(items: ContextItem[]): void {
    this.items.push(...items);
  }

  public clear(): void {
    this.items = [];
  }

  public normalize(): NormalizedContext {
    const rawTextParts: string[] = [];
    const sourcesSet = new Set<ContextSource>();

    for (const item of this.items) {
      sourcesSet.add(item.source);
      let formattedContent = '';
      if (typeof item.content === 'string') {
        formattedContent = item.content;
      } else {
        formattedContent = JSON.stringify(item.content);
      }
      rawTextParts.push(`[SRC:${item.source.toUpperCase()}] ${formattedContent}`);
    }

    const rawText = rawTextParts.join('\n');
    return {
      id: `norm_ctx_${Date.now()}`,
      items: [...this.items],
      rawText,
      rawSize: new TextEncoder().encode(rawText).length,
      sourcesUsed: Array.from(sourcesSet),
      createdAt: Date.now(),
    };
  }
}
