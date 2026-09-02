import { APEProtocol } from '../protocol/types.js';
import { RuntimeExecutionResult } from '../runtime/index.js';

export interface ValidationReport {
  passed: boolean;
  semanticIntegrityPercent: number; // 0 - 100
  semanticStatus: 'VERIFIED' | 'UNVERIFIED';
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

    if (!result.response || !result.response.rawResponse) {
      violations.push('Response rawResponse is empty');
      return {
        passed: false,
        semanticIntegrityPercent: 0,
        semanticStatus: 'UNVERIFIED',
        constraintViolations: violations,
        notes: ['Execution produced empty response.'],
      };
    }

    let checkedConstraintsCount = 0;
    let satisfiedConstraintsCount = 0;

    // Check constraint values against execution output or metadata
    const responseUpper = result.response.rawResponse.toUpperCase();
    for (const constraint of protocol.constraints) {
      checkedConstraintsCount++;
      const keyStr = String(constraint.key).toUpperCase();
      const valStr = String(constraint.value).toUpperCase();

      if (responseUpper.includes(keyStr) || responseUpper.includes(valStr)) {
        satisfiedConstraintsCount++;
        notes.push(`Verified constraint ${constraint.key}=${constraint.value}`);
      } else {
        notes.push(`Constraint ${constraint.key}=${constraint.value} present in protocol structure but unverified in execution output`);
      }
    }

    // Calculate real integrity percentage based on verifiable constraints
    let integrityScore = 100;
    let semanticStatus: 'VERIFIED' | 'UNVERIFIED' = 'UNVERIFIED';

    if (checkedConstraintsCount > 0) {
      integrityScore = Number(((satisfiedConstraintsCount / checkedConstraintsCount) * 100).toFixed(2));
      semanticStatus = satisfiedConstraintsCount === checkedConstraintsCount ? 'VERIFIED' : 'UNVERIFIED';
    } else {
      // Without verifiable structural assertions, do not assume 100% integrity
      integrityScore = 0;
      semanticStatus = 'UNVERIFIED';
      notes.push('Semantic integrity marked UNVERIFIED due to lack of verifiable constraints in result.');
    }

    return {
      passed: violations.length === 0,
      semanticIntegrityPercent: integrityScore,
      semanticStatus,
      constraintViolations: violations,
      notes,
    };
  }
}
