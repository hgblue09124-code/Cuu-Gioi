import { NormalizedContext } from '../core/context/types.js';
import { InferredTask } from '../core/compiler/index.js';
import { APEProtocol } from '../core/protocol/types.js';
import { RuntimeExecutionResult } from '../core/runtime/index.js';
import { APEMeasurementResult } from '../measurement/index.js';
import { ExecutionRecord } from '../journal/executions/index.js';

export class HumanSeeView {
  public static xemContext(context: NormalizedContext): string {
    const header = `--- [GIAO DIỆN CON NGƯỜI: CONTEXT NGUYÊN BẢN] ---`;
    const details = `Mã Context: ${context.id}\nNguồn dữ liệu: ${context.sourcesUsed.join(', ')}\nKích thước: ${context.rawSize} bytes\n`;
    return `${header}\n${details}\nNội dung:\n${context.rawText}`;
  }

  public static xemTask(task: InferredTask): string {
    return `--- [GIAO DIỆN CON NGƯỜI: NHIỆM VỤ SUY LUẬN] ---\nLoại nhiệm vụ: ${task.taskType}\nĐộ tin cậy: ${(task.confidence * 100).toFixed(0)}%\nTham số: ${JSON.stringify(task.params)}`;
  }

  public static xemProtocol(protocol: APEProtocol): string {
    return `--- [GIAO DIỆN CON NGƯỜI: GIAO THỨC APE (v${protocol.version})] ---\nChuỗi Giao thức: ${protocol.rawString}\nLoại Task: ${protocol.task.taskType}\nĐiều kiện ràng buộc: ${protocol.constraints.map((c) => `${c.key}=${c.value}`).join(', ')}\nQuy tắc: ${protocol.rules.map((r) => r.code).join(', ')}\nLuồng thực thi: ${protocol.flow.steps.join(' -> ')}`;
  }

  public static xemKetQua(result: RuntimeExecutionResult): string {
    return `--- [GIAO DIỆN CON NGƯỜI: KẾT QUẢ THỰC THI] ---\nMã thực thi: ${result.executionId}\nAdapter: ${result.adapterName}\nThời gian: ${result.executionTimeMs} ms\nPhản hồi AI:\n${result.response.rawResponse}`;
  }

  public static xemToken(measurement: APEMeasurementResult): string {
    return `--- [GIAO DIỆN CON NGƯỜI: THÔNG SỐ TOKEN] ---\nToken đầu vào: ${measurement.inputTokens}\nToken sau biên dịch: ${measurement.compiledTokens}\nToken tiết kiệm: ${measurement.savedTokens}\nTỷ lệ giảm: ${measurement.reductionPercent}%\nTrạng thái đo đạc: ${measurement.measurementStatus}`;
  }

  public static xemLichSu(records: ExecutionRecord[]): string {
    const lines = ['--- [GIAO DIỆN CON NGƯỜI: LỊCH SỬ THÍ NGHIỆM] ---'];
    if (records.length === 0) {
      lines.push('Chưa có lịch sử thí nghiệm nào.');
    } else {
      records.forEach((r, idx) => {
        lines.push(
          `${idx + 1}. [${new Date(r.timestamp).toISOString()}] ID: ${r.executionId} | Protocol: ${r.protocolReference.rawString} | Mức giảm Token: ${r.measurement.reductionPercent}% | Trạng thái: ${r.status}`
        );
      });
    }
    return lines.join('\n');
  }
}
