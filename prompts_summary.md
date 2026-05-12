# 🌸 NestAI — AI Prompts & Knowledge Base Summary

Tài liệu này cung cấp cái nhìn sâu sắc về chiến lược Prompt Engineering và quản lý tri thức y tế trong hệ thống NestAI.

---

### 1. Hệ thống Prompt chuyên biệt (AI Prompt Architecture)

NestAI sử dụng phương pháp Prompt phân lớp (Layered Prompts) để kết hợp giữa kiến thức y khoa chuẩn mực và sự thấu cảm cá nhân.

#### A. Trợ lý thai kỳ Nori (MommyMate)
*   **Vai trò & Tính cách (`src/agents/bot-pregnant/prompts/system_prompt.txt`)**: 
    *   Định danh là "MommyMate" - một trợ lý thấu cảm, gọi người dùng là "mẹ" và xưng "mình".
    *   Sử dụng ngôn ngữ Tiếng Việt tự nhiên, tránh thuật ngữ y khoa khô khan mà không giải thích.
    *   Ưu tiên tuyệt đối dữ liệu từ Context (RAG) để tránh tình trạng "ảo giác" (hallucination).
*   **Cấu trúc RAG (`src/agents/bot-pregnant/prompts/rag_template.txt`)**:
    *   Ép LLM tuân thủ cấu trúc phản hồi 4 bước: (1) Chào hỏi & Thấu cảm -> (2) Giải đáp dựa trên Context -> (3) Mẹo nhỏ/Hành động -> (4) Lời chúc/Lời nhắc y tế.
*   **Cá nhân hóa động (Dynamic Profile Injection)**:
    *   Logic trong `service.py` tự động chèn hồ sơ người dùng vào cuối System Prompt:
        *   *Tuần thai*: Giúp AI điều chỉnh lời khuyên theo từng giai đoạn (3 tháng đầu, giữa, cuối).
        *   *Tình trạng bệnh lý*: Chú trọng đặc biệt nếu mẹ bị "tiểu đường thai kỳ", "thiếu máu".
        *   *Hạn chế thực phẩm*: Nhắc nhở AI không gợi ý các món mẹ bị dị ứng hoặc kiêng kỵ.

#### B. Nhận diện thực phẩm (Scan-Food AI)
Nằm trong `src/backend/app/api/routes/nutrition.py`, đây là một trong những prompt phức tạp nhất của dự án:
*   **Quy tắc nhận diện thị giác**: Hướng dẫn LLM phân tích ảnh dựa trên màu sắc và kết cấu (ví dụ: mỡ trắng xen kẽ = thịt lợn; đỏ đậm, thớ thô = thịt bò; da vàng sậm = vịt).
*   **Tiêu chuẩn đặt tên món**: Ép AI phải đặt tên theo công thức: *Loại thực phẩm + Cách chế biến* (ví dụ: "Thịt lợn ba chỉ rang cháy cạnh" thay vì "Thịt rang").
*   **Ước tính dinh dưỡng**: AI được yêu cầu tính toán Calories, Protein, Carbs, Fat per 100g dựa trên món ăn đã nhận diện, phục vụ việc theo dõi dinh dưỡng tự động.

---

### 2. Quản lý tri thức & Lịch sử (Knowledge & History)

Hệ thống đảm bảo tính chính xác thông qua việc đối soát dữ liệu và lưu trữ lịch sử chặt chẽ.

#### A. Bộ dữ liệu chuẩn (Gold Dataset)
Nằm tại `src/agents/bot-pregnant/tests/gold_answer.json`, chứa hàng trăm cặp câu hỏi - câu trả lời dựa trên:
*   Quyết định Bộ Y tế (776/QĐ-BYT, 1470/QĐ-BYT...).
*   Kiến thức chuyên khoa từ Vinmec.
*   *Mục đích*: Dùng để chạy các bài test đánh giá chất lượng (similarity check) mỗi khi thay đổi Prompt hoặc Model.

#### B. Nhật ký hội thoại (Session Logs)
Lịch sử tương tác được lưu trữ tại `.ai-log/session.jsonl` với cấu trúc JSON Lines:
*   **Metadata**: Lưu Model (GPT-4o-mini, Claude-3.5...), thời gian thực thi (latency), và tool được gọi.
*   **Context Persistence**: Lưu giữ toàn bộ nội dung prompt đã gửi đi (bao gồm cả phần Context đã retrieve từ Vector DB) để phục vụ việc debug và tinh chỉnh hệ thống.

---

### 3. Cơ chế An toàn & Bảo mật (Safety & Integrity)

*   **Cảnh báo đỏ (Emergency Safeguards)**: 
    *   Hệ thống kiểm tra các từ khóa nguy hiểm (ra máu, vỡ ối, thai không máy) để trả về ngay lập tức chỉ dẫn cấp cứu, bỏ qua các bước xử lý thông thường.
*   **Chống Prompt Injection**:
    *   Sử dụng danh sách đen các từ khóa ngăn chặn hành vi thay đổi hướng dẫn hệ thống (ví dụ: "ignore previous instructions", "quên đi các quy tắc").
*   **Trust Manager Audit**:
    *   Một Layer AI phụ chuyên trách đối soát sự trùng khớp giữa câu trả lời của Agent và nguồn tài liệu gốc trước khi gửi tới người dùng.

---

