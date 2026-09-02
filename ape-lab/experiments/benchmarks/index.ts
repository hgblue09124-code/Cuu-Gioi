import { APEMeasurementResult } from '../../measurement/index.js';

export interface BenchmarkSummary {
  totalRuns: number;
  avgReductionPercent: number;
  totalTokensSaved: number;
  avgExecutionTimeMs: number;
  successfulRuns: number;
  failedRuns: number;
}

export class ExperimentBenchmarkRunner {
  public static summarize(results: APEMeasurementResult[]): BenchmarkSummary {
    if (results.length === 0) {
      return {
        totalRuns: 0,
        avgReductionPercent: 0,
        totalTokensSaved: 0,
        avgExecutionTimeMs: 0,
        successfulRuns: 0,
        failedRuns: 0,
      };
    }

    const totalRuns = results.length;
    const totalTokensSaved = results.reduce((acc, r) => acc + r.savedTokens, 0);
    const sumReduction = results.reduce((acc, r) => acc + r.reductionPercent, 0);
    const sumTime = results.reduce((acc, r) => acc + r.executionTimeMs, 0);
    const successfulRuns = results.filter((r) => r.status === 'SUCCESS').length;
    const failedRuns = totalRuns - successfulRuns;

    return {
      totalRuns,
      avgReductionPercent: Number((sumReduction / totalRuns).toFixed(2)),
      totalTokensSaved,
      avgExecutionTimeMs: Number((sumTime / totalRuns).toFixed(2)),
      successfulRuns,
      failedRuns,
    };
  }
}
