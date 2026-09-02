import { getEncoding } from 'js-tiktoken';

export type MeasurementStatus = 'ACTUAL' | 'ESTIMATED' | 'NOT_AVAILABLE';

export interface TokenMeasurement {
  inputTokens: number;
  compiledTokens: number;
  outputTokens: number;
  savedTokens: number;
  reductionPercent: number;
  measurementStatus: MeasurementStatus;
  tokenizerInfo?: string;
}

export class TokenCounter {
  /**
   * Measures actual token count using a real tokenizer (e.g. tiktoken cl100k_base / o200k_base).
   */
  public static measureActual(
    inputRawText: string,
    compiledProtocolText: string,
    outputRawText: string,
    encodingName: 'cl100k_base' | 'o200k_base' | 'p50k_base' = 'cl100k_base'
  ): TokenMeasurement {
    try {
      const enc = getEncoding(encodingName);
      const inputTokens = enc.encode(inputRawText || '').length;
      const compiledTokens = enc.encode(compiledProtocolText || '').length;
      const outputTokens = enc.encode(outputRawText || '').length;

      const savedTokens = Math.max(0, inputTokens - compiledTokens);
      const reductionPercent =
        inputTokens > 0 ? Number(((savedTokens / inputTokens) * 100).toFixed(2)) : 0;

      return {
        inputTokens,
        compiledTokens,
        outputTokens,
        savedTokens,
        reductionPercent,
        measurementStatus: 'ACTUAL',
        tokenizerInfo: `tiktoken:${encodingName}`,
      };
    } catch {
      return {
        inputTokens: 0,
        compiledTokens: 0,
        outputTokens: 0,
        savedTokens: 0,
        reductionPercent: 0,
        measurementStatus: 'NOT_AVAILABLE',
      };
    }
  }

  /**
   * Estimates or counts token usage based on standard string heuristic (~3.5-4 chars per token)
   * if real tokenizer is unavailable or heuristically requested.
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
      tokenizerInfo: 'heuristic:char-ratio',
    };
  }
}
