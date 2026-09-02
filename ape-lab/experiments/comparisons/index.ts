import { APEMeasurementResult } from '../../measurement/index.js';

export interface ComparisonReport {
  rawPromptTokenEstimate: number;
  apeProtocolTokenEstimate: number;
  tokensSaved: number;
  efficiencyGainRatio: number;
  details: string;
}

export class ExperimentComparer {
  public static compare(rawText: string, apeResult: APEMeasurementResult): ComparisonReport {
    const rawPromptEstimate = apeResult.inputTokens;
    const apeEstimate = apeResult.compiledTokens;
    const saved = apeResult.savedTokens;
    const gainRatio = apeEstimate > 0 ? Number((rawPromptEstimate / apeEstimate).toFixed(2)) : 1;

    return {
      rawPromptTokenEstimate: rawPromptEstimate,
      apeProtocolTokenEstimate: apeEstimate,
      tokensSaved: saved,
      efficiencyGainRatio: gainRatio,
      details: `Giao thức APE đạt hiệu quả gấp ${gainRatio}x so với context thô ban đầu.`,
    };
  }
}
