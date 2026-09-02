export interface TaskDirective {
  taskType: string;
  params?: Record<string, string | number | boolean>;
}

export interface ContextConstraint {
  key: string;
  value: string | number | boolean;
}

export interface RuleDirective {
  code: string;
  description?: string;
}

export interface FlowDirective {
  steps: string[];
}

export interface APEProtocol {
  version: string; // e.g. 'v0.1'
  task: TaskDirective;
  constraints: ContextConstraint[];
  rules: RuleDirective[];
  flow: FlowDirective;
  rawString: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}
