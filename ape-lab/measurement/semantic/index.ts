export interface SemanticMeasurement {
  semanticIntegrityPercent: number; // 0 - 100
  preservationScore: number;
}

export class SemanticMeasurer {
  public static measure(validationIntegrity: number): SemanticMeasurement {
    return {
      semanticIntegrityPercent: Math.min(100, Math.max(0, validationIntegrity)),
      preservationScore: validationIntegrity / 100,
    };
  }
}
