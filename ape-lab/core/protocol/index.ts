import { APEProtocol, TaskDirective, ContextConstraint, RuleDirective, FlowDirective } from './types.js';

export * from './types.js';

export class ProtocolEngine {
  public static CURRENT_VERSION = 'v0.1';

  public static format(protocol: Omit<APEProtocol, 'rawString' | 'createdAt'>): APEProtocol {
    const taskPart = `T:${protocol.task.taskType}${
      protocol.task.params && Object.keys(protocol.task.params).length > 0
        ? `(${Object.entries(protocol.task.params)
            .map(([k, v]) => `${k}=${v}`)
            .join(',')})`
        : ''
    }`;

    const constraintsPart =
      protocol.constraints.length > 0
        ? `|C:${protocol.constraints.map((c) => `${c.key}=${c.value}`).join(',')}`
        : '';

    const rulesPart =
      protocol.rules.length > 0
        ? `|R:${protocol.rules.map((r) => r.code).join(',')}`
        : '';

    const flowPart =
      protocol.flow.steps.length > 0
        ? `|F:${protocol.flow.steps.join('>')}`
        : '';

    const rawString = `${taskPart}${constraintsPart}${rulesPart}${flowPart}`;

    return {
      ...protocol,
      rawString,
      createdAt: Date.now(),
    };
  }

  public static parse(rawString: string, version = ProtocolEngine.CURRENT_VERSION): APEProtocol {
    const parts = rawString.split('|');
    let task: TaskDirective = { taskType: 'UNKNOWN' };
    const constraints: ContextConstraint[] = [];
    const rules: RuleDirective[] = [];
    let flow: FlowDirective = { steps: [] };

    for (const part of parts) {
      if (part.startsWith('T:')) {
        const content = part.substring(2);
        const match = content.match(/^([^(]+)(?:\(([^)]+)\))?$/);
        if (match) {
          const taskType = match[1];
          const paramsStr = match[2];
          const params: Record<string, string | number | boolean> = {};
          if (paramsStr) {
            for (const kv of paramsStr.split(',')) {
              const [k, v] = kv.split('=');
              if (k) params[k.trim()] = v ? v.trim() : true;
            }
          }
          task = { taskType, params };
        } else {
          task = { taskType: content };
        }
      } else if (part.startsWith('C:')) {
        const content = part.substring(2);
        for (const kv of content.split(',')) {
          const [k, v] = kv.split('=');
          if (k) {
            constraints.push({ key: k.trim(), value: v ? v.trim() : '' });
          }
        }
      } else if (part.startsWith('R:')) {
        const content = part.substring(2);
        for (const r of content.split(',')) {
          if (r.trim()) {
            rules.push({ code: r.trim() });
          }
        }
      } else if (part.startsWith('F:')) {
        const content = part.substring(2);
        flow = { steps: content.split('>').map((s) => s.trim()) };
      }
    }

    return {
      version,
      task,
      constraints,
      rules,
      flow,
      rawString,
      createdAt: Date.now(),
    };
  }
}
