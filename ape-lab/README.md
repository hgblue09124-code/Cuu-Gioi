# APE Lab (AI Protocol Engineering Laboratory)

**APE Lab** là phòng thí nghiệm nghiên cứu công nghệ APE (AI Protocol Engineering) nhằm mục đích tối ưu hóa, cô đọng context và chuẩn hóa giao thức giao tiếp với mô hình AI.

---

## 1. Mục tiêu Kiến trúc & Khả năng Độc lập

- **APE Lab** được thiết kế nguyên khối độc lập trong thư mục `ape-lab/`.
- **Nguyên tắc Phụ thuộc (Dependency Direction):**
  ```
  Cửu Giới
     ↓
  APE Lab
     ↓
  APE Core
  ```
- **Không có phụ thuộc ngược (NO Reverse Dependency):** APE Core tuyệt đối không bao giờ import hay phụ thuộc vào bất kỳ module, UI hay game logic nào của Cửu Giới.
- **Tách Repository độc lập:** Để tách APE Lab thành một kho lưu trữ (repository) độc lập về sau, chỉ cần di chuyển thư mục `ape-lab/` ra một repo mới và chạy `pnpm install`. Không phải viết lại bất kỳ kiến trúc hay logic cốt lõi nào.

---

## 2. Cấu trúc Thư mục

```
ape-lab/
├── core/                   # APE Core - Logic cốt lõi độc lập
│   ├── context/            # Context Engine & Quản lý đầu vào
│   ├── compiler/           # Compiler chuyển đổi Context thành Protocol
│   ├── protocol/           # Format giao thức & parser
│   ├── runtime/            # Runtime thực thi protocol
│   └── validator/          # Kiểm tra toàn vẹn & ràng buộc
│
├── measurement/            # Thành phần đo đạc số liệu
│   ├── token/              # Đo đạc & ước tính Token
│   ├── semantic/           # Đo đạc toàn vẹn ngữ nghĩa
│   └── performance/        # Đo thời gian & kích thước protocol
│
├── experiments/            # Môi trường thực nghiệm
│   ├── cases/              # Các kịch bản thử nghiệm
│   ├── benchmarks/         # Tổng hợp kết quả benchmark
│   └── comparisons/        # So sánh Prompt thô vs APE Protocol
│
├── journal/                # Nhật ký thực thi & nghiên cứu
│   ├── executions/         # Execution records
│   ├── discoveries/        # Nhận định & phát hiện nghiên cứu
│   └── changes/            # Lịch sử thay đổi kiến trúc
│
├── reports/                # Hệ thống tạo báo cáo
│   ├── latest/             # Báo cáo mới nhất
│   ├── archive/            # Lưu trữ báo cáo
│   └── generator.ts        # Generator tạo báo cáo tiếng Việt
│
├── protocol/               # Chuẩn hóa & Phiên bản Giao thức
│   ├── schema/             # Validation schema
│   └── versions/           # Quản lý phiên bản (v0.1, ...)
│
├── adapters/               # Adapters kết nối các nhà cung cấp AI
│   ├── openai/             # OpenAI Adapter
│   ├── anthropic/          # Anthropic Adapter
│   └── local/              # Local Model Adapter
│
├── human-see/              # Lớp giao diện hiển thị cho con người (Tiếng Việt)
├── tests/                  # Bộ kiểm thử tự động
├── package.json            # Cấu hình package độc lập
├── tsconfig.json           # Cấu hình TypeScript
└── README.md               # Tài liệu hướng dẫn
```

---

## 3. Luồng Vật lý (Physical Pipeline)

Mỗi chu trình thực thi trong APE Lab tuân theo đúng dòng dữ liệu:

```
CONTEXT
   ↓
CONTEXT ENGINE
   ↓
COMPILER
   ↓
PROTOCOL
   ↓
RUNTIME
   ↓
AI (Adapter)
   ↓
VALIDATOR
   ↓
MEASUREMENT
   ↓
JOURNAL
   ↓
REPORT
```

1. **Context Engine:** Nhận đầu vào từ nhiều nguồn (`conversation`, `file`, `code`, `game_state`, `history`, `event`, `api`, `other_ai`).
2. **Compiler:** Thực hiện chuẩn hóa (`Normalize`) -> Suy luận nhiệm vụ (`Infer Task`) -> Lọc Context cần thiết (`Resolve required context`) -> Đóng gói Protocol (`Build execution protocol`).
3. **Protocol:** Chuẩn hóa dưới dạng chuỗi ngắn gọn độc lập ngôn ngữ tự nhiên (ví dụ: `T:TRAIN|C:R=LQ,L=7|R:PRESERVE_SEMANTICS|F:CHK>ACT>UPD`).
4. **Runtime & Adapter:** Gửi Protocol tới Adapter AI (OpenAI, Anthropic, Local) và thu nhận phản hồi.
5. **Validator:** Đánh giá tính toàn vẹn ngữ nghĩa và các ràng buộc.
6. **Measurement:** Tính toán token đầu vào/sau biên dịch/tiết kiệm, tỷ lệ nén %, thời gian thực thi. Nếu không có tokenizer thực tế, đánh dấu rõ `measurement_status: ESTIMATED` hoặc `NOT_AVAILABLE`.
7. **Journal:** Ghi nhận nhật ký thực thi (`Execution Record`).
8. **Report:** Xuất báo cáo định dạng tiếng Việt rõ ràng.

---

## 4. Định dạng Báo cáo APE Lab

Ví dụ mẫu báo cáo được tạo ra tự động:

```
╔══════════════════════════════════════════════════════╗
║             BÁO CÁO TỐI ƯU APE LAB                   ║
╠══════════════════════════════════════════════════════╣
║ Token đầu vào       : 2.840 (ước tính)               ║
║ Token sau biên dịch : 612 (ước tính)                 ║
║ Token đã tiết kiệm  : 2.228 (ước tính)               ║
║ Mức giảm            : 78,45% (ước tính)              ║
║                                                      ║
║ Toàn vẹn ngữ nghĩa  : 100%                           ║
║ Thời gian thực thi  : 0,84s                          ║
║ Trạng thái          : THÀNH CÔNG                     ║
║ [Ghi chú: Số liệu trong môi trường thử nghiệm APE Lab]║
╚══════════════════════════════════════════════════════╝
```

---

## 5. Hướng dẫn Chạy Kiểm thử (Tests)

Để chạy toàn bộ kiểm thử xác nhận kiến trúc và chức năng của APE Lab:

```bash
pnpm --filter ape-lab test
```

Hoặc chạy từ gốc repo:

```bash
pnpm run typecheck
```

Các bài test bao gồm:
1. **Context Ingestion:** Xác nhận Context có thể đi vào pipeline từ nhiều nguồn.
2. **Protocol Generation:** Compiler sinh ra giao thức chuẩn hóa.
3. **Runtime Execution:** Runtime đọc và gửi giao thức qua Adapter.
4. **Measurement Logging:** Tự động tính toán số liệu token, thời gian và độ toàn vẹn.
5. **Journal Recording:** Ghi nhận nhật ký thí nghiệm.
6. **Vietnamese Report Generation:** Tạo báo cáo mẫu tiếng Việt có dấu.
7. **Architecture Isolation:** Đảm bảo APE Core không chứa bất kỳ import nào từ Cửu Giới.
8. **Non-Breaking Compatibility:** Đảm bảo toàn bộ ứng dụng Cửu Giới hoạt động bình thường.
