import { NormalizedContext } from '../context/types.js';
import { APEProtocol, ContextConstraint, FlowDirective, RuleDirective, TaskDirective } from '../protocol/types.js';
import { ProtocolEngine } from '../protocol/index.js';

export interface InferredTask {
  taskType: string;
  params: Record<string, string | number | boolean>;
  confidence: number;
}

export interface CompilerOptions {
  version?: string;
  compressionLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export class ContextCompiler {
  private options: CompilerOptions;

  constructor(options: CompilerOptions = {}) {
    this.options = {
      version: ProtocolEngine.CURRENT_VERSION,
      compressionLevel: 'MEDIUM',
      ...options,
    };
  }

  public compile(normalizedContext: NormalizedContext): APEProtocol {
    // 1. Normalize context
    const cleanItems = this.normalizeContext(normalizedContext);

    // 2. Infer task
    const inferredTask = this.inferTask(cleanItems, normalizedContext.rawText);

    // 3. Resolve required context (filter out redundancy while retaining key constraints)
    const { constraints, rules, flow } = this.resolveRequiredContext(cleanItems, inferredTask, normalizedContext.rawText);

    // 4. Build execution protocol
    return ProtocolEngine.format({
      version: this.options.version || ProtocolEngine.CURRENT_VERSION,
      task: {
        taskType: inferredTask.taskType,
        params: inferredTask.params,
      },
      constraints,
      rules,
      flow,
    });
  }

  private normalizeContext(ctx: NormalizedContext) {
    return ctx.items.filter((item) => {
      const contentStr = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
      return contentStr.trim().length > 0;
    });
  }

  private inferTask(items: unknown[], rawText: string): InferredTask {
    const textLower = rawText.toLowerCase();

    if (textLower.includes('sửa') || textLower.includes('patch') || textLower.includes('fix') || textLower.includes('cuộn')) {
      return { taskType: 'PATCH', params: { TARGET: 'RUNTIME_SCROLL' }, confidence: 0.95 };
    }
    if (textLower.includes('train') || textLower.includes('huấn luyện')) {
      return { taskType: 'TRAIN', params: { R: 'LQ', L: 7 }, confidence: 0.9 };
    }
    if (textLower.includes('query') || textLower.includes('hỏi') || textLower.includes('tìm')) {
      return { taskType: 'QUERY', params: { MODE: 'FAST' }, confidence: 0.85 };
    }
    if (textLower.includes('execute') || textLower.includes('thực thi')) {
      return { taskType: 'EXEC', params: { MODE: 'STRICT' }, confidence: 0.9 };
    }

    return { taskType: 'GENERAL_TASK', params: { MODE: 'AUTO' }, confidence: 0.7 };
  }

  private resolveRequiredContext(cleanItems: unknown[], inferredTask: InferredTask, rawText: string) {
    const constraints: ContextConstraint[] = [];
    const rules: RuleDirective[] = [];
    let flowSteps: string[] = ['CHK', 'ACT', 'UPD'];

    // Extract key parameters as compact constraints
    if (inferredTask.params) {
      for (const [k, v] of Object.entries(inferredTask.params)) {
        constraints.push({ key: k, value: v });
      }
    }

    if (inferredTask.taskType === 'PATCH') {
      rules.push({ code: 'PRESERVE_EXISTING' });
      flowSteps = ['INSPECT', 'PATCH', 'TEST'];
    } else {
      rules.push({ code: 'PRESERVE_SEMANTICS' });
      rules.push({ code: 'STRICT_CONSTRAINTS' });
    }

    return {
      constraints,
      rules,
      flow: <FlowDirective>{ steps: flowSteps },
    };
  }
}
