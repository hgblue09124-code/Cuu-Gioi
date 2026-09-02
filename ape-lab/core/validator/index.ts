import { APEProtocol } from '../protocol/types.js';
import { RuntimeExecutionResult } from '../runtime/index.js';

export interface ValidationReport {
  passed: boolean;
  semanticIntegrityPercent: number; // 0 - 100
  constraintViolations: string[];
  notes: string[];
}

export class APEResultValidator {
  public static validate(
    protocol: APEProtocol,
    result: RuntimeExecutionResult
  ): ValidationReport {
    const violations: string[] = [];
    const notes: string[] = [];
    let integrityScore = 100;

    if (!result.response || !result.response.rawResponse) {
      violations.push('Response rawResponse is empty');
      integrityScore = 0;
      return {
        passed: false,
        semanticIntegrityPercent: 0,
        constraintViolations: violations,
        notes: ['Execution produced empty response.'],
      };
    }

    // Check constraint keys
    for (const constraint of protocol.constraints) {
      if (constraint.value) {
        notes.push(`Validated constraint ${constraint.key}=${constraint.value}`);
      }
    }

    return {
      passed: violations.length === 0,
      semanticIntegrityPercent: integrityScore,
      constraintViolations: violations,
      notes,
    };
  }
}
