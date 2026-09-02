export type MeasurementStatus = 'ACTUAL' | 'ESTIMATED' | 'NOT_AVAILABLE';

export interface TokenMeasurement {
  inputTokens: number;
  compiledTokens: number;
  outputTokens: number;
  savedTokens: number;
  reductionPercent: number;
  measurementStatus: MeasurementStatus;
}

export class TokenCounter {
  /**
   * Estimates or counts token usage based on standard string heuristic (~3.5-4 chars per token)
   * if real tokenizer is unavailable.
   */
  public static measure(
    inputRawText: string,
    compiledProtocolText: string,
    outputRawText: string,
    useHeuristic = true
  ): TokenMeasurement {
    if (!useHeuristic) {
      return {
        inputTokens: 0,
        compiledTokens: 0,
        outputTokens: 0,
        savedTokens: 0,
        reductionPercent: 0,
        measurementStatus: 'NOT_AVAILABLE',
      };
    }

    // Standard LLM token heuristic estimation: approx 1 token per 4 characters or 0.75 words
    const estimateTokens = (text: string): number => {
      if (!text || text.trim().length === 0) return 0;
      return Math.max(1, Math.round(text.length / 3.8));
    };

    const inputTokens = estimateTokens(inputRawText);
    const compiledTokens = estimateTokens(compiledProtocolText);
    const outputTokens = estimateTokens(outputRawText);
    const savedTokens = Math.max(0, inputTokens - compiledTokens);
    const reductionPercent = inputTokens > 0 ? Number(((savedTokens / inputTokens) * 100).toFixed(2)) : 0;

    return {
      inputTokens,
      compiledTokens,
      outputTokens,
      savedTokens,
      reductionPercent,
      measurementStatus: 'ESTIMATED',
    };
  }
}
