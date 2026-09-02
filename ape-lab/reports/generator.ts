import { APEMeasurementResult } from '../measurement/index.js';
import { ExecutionRecord } from '../journal/executions/index.js';

export interface ReportOptions {
  experimentMode?: boolean;
}

export class APEReportGenerator {
  public static generateReport(
    measurement: APEMeasurementResult,
    options: ReportOptions = {}
  ): string {
    const isAvailable = measurement.measurementStatus !== 'NOT_AVAILABLE';
    const isEstimated = measurement.measurementStatus === 'ESTIMATED';

    const formatNum = (val: number): string => {
      if (!isAvailable) return 'CHƯA ĐO ĐƯỢC';
      const formatted = val.toLocaleString('vi-VN');
      return isEstimated ? `${formatted} (ước tính)` : formatted;
    };

    const formatPercent = (val: number): string => {
      if (!isAvailable) return 'CHƯA ĐO ĐƯỢC';
      const formatted = `${val.toString().replace('.', ',')}%`;
      return isEstimated ? `${formatted} (ước tính)` : formatted;
    };

    const statusText = measurement.status === 'SUCCESS' ? 'THÀNH CÔNG' : 'THẤT BẠI';

    const lines: string[] = [];
    lines.push('╔══════════════════════════════════════════════════════╗');
    lines.push('║             BÁO CÁO TỐI ƯU APE LAB                   ║');
    lines.push('╠══════════════════════════════════════════════════════╣');
    lines.push(`║ Token đầu vào       : ${formatNum(measurement.inputTokens).padEnd(30)} ║`);
    lines.push(`║ Token sau biên dịch : ${formatNum(measurement.compiledTokens).padEnd(30)} ║`);
    lines.push(`║ Token đã tiết kiệm  : ${formatNum(measurement.savedTokens).padEnd(30)} ║`);
    lines.push(`║ Mức giảm            : ${formatPercent(measurement.reductionPercent).padEnd(30)} ║`);
    lines.push('║                                                      ║');
    lines.push(`║ Toàn vẹn ngữ nghĩa  : ${`${measurement.semanticIntegrityPercent}%`.padEnd(30)} ║`);
    lines.push(`║ Thời gian thực thi  : ${`${measurement.executionTimeSeconds}s`.padEnd(30)} ║`);
    lines.push(`║ Trạng thái          : ${statusText.padEnd(30)} ║`);
    if (options.experimentMode) {
      lines.push('║ [Ghi chú: Số liệu trong môi trường thử nghiệm APE Lab]║');
    }
    lines.push('╚══════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  public static generateExecutionReport(record: ExecutionRecord): string {
    return this.generateReport(record.measurement, {
      experimentMode: true,
    });
  }
}
