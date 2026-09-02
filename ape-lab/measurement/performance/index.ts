export interface PerformanceMeasurement {
  executionTimeMs: number;
  executionTimeSeconds: number;
  protocolSizeInBytes: number;
}

export class PerformanceMeasurer {
  public static measure(executionTimeMs: number, protocolString: string): PerformanceMeasurement {
    const protocolBytes = new TextEncoder().encode(protocolString).length;
    return {
      executionTimeMs,
      executionTimeSeconds: Number((executionTimeMs / 1000).toFixed(2)),
      protocolSizeInBytes: protocolBytes,
    };
  }
}
