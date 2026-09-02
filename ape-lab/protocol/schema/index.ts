import { APEProtocol } from '../../core/protocol/types.js';

export interface ProtocolValidationResult {
  valid: boolean;
  errors: string[];
}

export class ProtocolSchemaValidator {
  public static validate(protocol: APEProtocol): ProtocolValidationResult {
    const errors: string[] = [];

    if (!protocol.version) {
      errors.push('Missing protocol version');
    }
    if (!protocol.task || !protocol.task.taskType) {
      errors.push('Missing task type directive (T:)');
    }
    if (!protocol.rawString) {
      errors.push('Missing protocol raw string representation');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
