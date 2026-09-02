export interface ExperimentCase {
  id: string;
  title: string;
  description: string;
  sourceType: string;
  rawPayload: string | Record<string, unknown>;
}

export const SAMPLE_EXPERIMENT_CASES: ExperimentCase[] = [
  {
    id: 'case_001',
    title: 'Nhiệm vụ Huấn luyện Quy chuẩn (Train Directive)',
    description: 'Thử nghiệm nén context hội thoại và tham số huấn luyện',
    sourceType: 'conversation',
    rawPayload:
      'Xin chào hệ thống. Hãy thực hiện quá trình huấn luyện mô hình với tỷ lệ học LQ = 0.001, giới hạn số vòng lặp L = 7. Yêu cầu kiểm tra điều kiện trước khi thực thi và cập nhật trạng thái.',
  },
  {
    id: 'case_002',
    title: 'Truy vấn Trạng thái Hệ thống (Query Directive)',
    description: 'Thử nghiệm nén thông tin sự kiện và trạng thái hệ thống',
    sourceType: 'event',
    rawPayload:
      'Yêu cầu truy vấn toàn bộ trạng thái hệ thống hiện tại, lấy thông số tài nguyên và lịch sử các sự kiện gần nhất trong chế độ FAST.',
  },
];
