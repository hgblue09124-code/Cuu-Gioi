import { MeasurementStatus, TokenCounter, TokenMeasurement } from './token/index.js';
import { SemanticMeasurer, SemanticMeasurement } from './semantic/index.js';
import { PerformanceMeasurer, PerformanceMeasurement } from './performance/index.js';
import { NormalizedContext } from '../core/context/types.js';
import { APEProtocol } from '../core/protocol/types.js';
import { RuntimeExecutionResult } from '../core/runtime/index.js';
import { ValidationReport } from '../core/validator/index.js';

export * from './token/index.js';
export * from './semantic/index.js';
export * from './performance/index.js';

export interface APEMeasurementResult {
  inputTokens: number;
  compiledTokens: number;
  outputTokens: number;
  savedTokens: number;
  reductionPercent: number;
  semanticIntegrityPercent: number;
  executionTimeMs: number;
  executionTimeSeconds: number;
  protocolSizeInBytes: number;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  measurementStatus: MeasurementStatus;
}

export class APEMeasurementEngine {
  public static measure(
    context: NormalizedContext,
    protocol: APEProtocol,
    executionResult: RuntimeExecutionResult,
    validationReport: ValidationReport,
    useTokenHeuristic = true
  ): APEMeasurementResult {
    const tokenMetrics: TokenMeasurement = TokenCounter.measure(
      context.rawText,
      protocol.rawString,
      executionResult.response.rawResponse,
      useTokenHeuristic
    );

    const semanticMetrics: SemanticMeasurement = SemanticMeasurer.measure(
      validationReport.semanticIntegrityPercent
    );

    const perfMetrics: PerformanceMeasurement = PerformanceMeasurer.measure(
      executionResult.executionTimeMs,
      protocol.rawString
    );

    const status = validationReport.passed ? 'SUCCESS' : 'FAILED';

    return {
      inputTokens: tokenMetrics.inputTokens,
      compiledTokens: tokenMetrics.compiledTokens,
      outputTokens: tokenMetrics.outputTokens,
      savedTokens: tokenMetrics.savedTokens,
      reductionPercent: tokenMetrics.reductionPercent,
      semanticIntegrityPercent: semanticMetrics.semanticIntegrityPercent,
      executionTimeMs: perfMetrics.executionTimeMs,
      executionTimeSeconds: perfMetrics.executionTimeSeconds,
      protocolSizeInBytes: perfMetrics.protocolSizeInBytes,
      status,
      measurementStatus: tokenMetrics.measurementStatus,
    };
  }
}
