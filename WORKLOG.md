# Worklog

Ghi lại các quyết định kỹ thuật, phân công, và brainstorming của nhóm.

> Cập nhật **bất cứ khi nào** nhóm ra quyết định kỹ thuật quan trọng hoặc thay đổi hướng đi.

---

## Template

### Quyết định kỹ thuật

```markdown
### [ADR-1] Tiêu đề quyết định — DD/MM/YYYY

**Bối cảnh:** Vấn đề cần giải quyết là gì?

**Các lựa chọn đã xem xét:**
- Option A: ...
- Option B: ...

**Quyết định:** Chọn option nào và tại sao.

**Hệ quả:** Những gì bị ảnh hưởng / trade-off.
```


### Phân công

```markdown
### Sprint N — DD/MM → DD/MM/YYYY

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| | | | |
```

### Brainstorming

```markdown
### Brainstorm: [Chủ đề] — DD/MM/YYYY

**Câu hỏi:** ...

**Các ý tưởng:**
- Ý tưởng 1: ...
- Ý tưởng 2: ...

**Kết luận:** ...
```

### Evaluation Evidence

```markdown
### Evaluation: [Tính năng/Module] — DD/MM/YYYY

**Phương pháp test:** (Unit test / User testing / A/B testing...)

**Kết quả / Metrics:**
- Metric 1: ...
- Metric 2: ...

**Đánh giá:** (Đạt / Không đạt / Cần cải thiện gì)
```

---

## Nhật ký thực tế

### [ADR-1] Đổi đối tượng người dùng từ nhân viên bếp ăn sang mẹ bầu — 06/04/2026

**Bối cảnh:** Đề tài ban đầu là tối ưu thực đơn dinh dưỡng cho bếp ăn trường học (B2B). Sau khi thảo luận nhóm, nhận ra đây là thị trường khó tiếp cận và khó cá nhân hoá.

**Các lựa chọn đã xem xét:**
- **Bếp ăn trường học (B2B):** Thị trường lớn nhưng chu kỳ bán hàng dài, khó test với người dùng thật trong thời gian ngắn.
- **Mẹ bầu & sau sinh (B2C):** Thu hẹp đối tượng, có thể cá nhân hoá theo tuần thai và bệnh lý, ngách chưa có nhiều giải pháp tốt ở Việt Nam.

**Quyết định:** Chọn mẹ bầu & sau sinh. Chia 3 nhóm nhu cầu đặc thù: tiểu đường thai kỳ (GDM), thiếu sắt/thiếu máu, cao huyết áp thai kỳ.

**Hệ quả:** Phải thiết kế lại toàn bộ user flow và data model. Lợi thế: dễ validate với người dùng thật, scope rõ ràng hơn.

---

### [ADR-2] Tech stack: FastAPI + Next.js App Router + Supabase — 13/04/2026

**Bối cảnh:** Cần chọn stack phù hợp để build full-stack app có tích hợp AI trong thời gian ngắn.

**Các lựa chọn đã xem xét:**
- **Backend:** FastAPI (Python) vs Express (Node.js) vs Django
- **Frontend:** Next.js App Router vs Vite + React vs Remix
- **Database:** Supabase vs Firebase vs PostgreSQL tự host

**Quyết định:**
- **FastAPI**: async native, dễ tích hợp Python AI/ML libs (OR-Tools, LiteLLM), auto-generate docs `/docs`
- **Next.js App Router**: Server Components giúp gọi AI API trực tiếp, `/api` routes cho Nori chatbot
- **Supabase**: PostgreSQL + Auth + realtime, free tier đủ dùng cho prototype

**Hệ quả:** 2 runtime (Python + Node.js) chạy song song — cần quản lý 2 môi trường. Bù lại tốc độ phát triển nhanh hơn.

---

### [ADR-3] Kiến trúc AI: 3 module độc lập — 16/04/2026

**Bối cảnh:** Cần tích hợp nhiều loại AI khác nhau (conversational, optimization, RAG). Cần quyết định kiến trúc để dễ mở rộng.

**Các lựa chọn đã xem xét:**
- **1 LLM duy nhất cho tất cả:** Đơn giản nhưng LLM yếu ở bài toán tối ưu số học.
- **3 module chuyên biệt:** Mỗi module dùng công cụ phù hợp nhất.

**Quyết định:** Tách thành 3 module độc lập:
1. **Nori Chatbot** (`src/frontend/app/api/nori/`) — Claude 3.5 Sonnet qua API Next.js, tư vấn dinh dưỡng tiếng Việt
2. **Food Optimizer Agent** (`src/agents/optimization_food/`) — Google OR-Tools CP-SAT solver, tối ưu thực đơn theo ngân sách + vi chất
3. **Bot Pregnant** (`src/agents/bot-pregnant/`) — RAG với dữ liệu Vinmec, trả lời câu hỏi thai kỳ

**Hệ quả:** Tăng độ phức tạp triển khai (3 service). Đổi lại chất lượng từng loại output tốt hơn đáng kể.

---

### [ADR-4] Thay đổi công nghệ nhận diện món ăn (Smart Scan) — 27/04/2026

**Bối cảnh:** Cần phát triển tính năng Smart Scan giúp mẹ bầu chụp ảnh bữa ăn để tự động tính lượng calo và vi chất. Ban đầu dự kiến tự fine-tune một model vision để nhận diện các món ăn Việt Nam.

**Các lựa chọn đã xem xét:**
- **Tự fine-tune vision model:** Cần thu thập lượng lớn dataset ảnh món ăn Việt Nam (tốn thời gian dán nhãn), chi phí huấn luyện cao, khó mở rộng cho các món ăn mới.
- **Sử dụng LLM Vision kết hợp cơ sở dữ liệu dinh dưỡng:** Gọi API LLM để phân tích ảnh, trích xuất tên món ăn, ước lượng khẩu phần. Sau đó tự động map với bộ cơ sở dữ liệu dinh dưỡng (database) để tính toán calo và vi chất.

**Quyết định:** Chọn **Sử dụng LLM Vision kết hợp cơ sở dữ liệu dinh dưỡng**. 

**Hệ quả:** 
- Rút ngắn đáng kể thời gian phát triển (time-to-market).
- Không tốn chi phí và công sức thu thập/dán nhãn dữ liệu.
- Đánh đổi: Phụ thuộc vào API bên ngoài và cần kỹ năng prompt engineering tốt để tránh hallucination.

---

### Sprint 1 — 06/04 → 13/04/2026

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| Thảo luận đề tài, chọn đối tượng người dùng | Cả nhóm | 06/04 | ✅ Xong |
| Setup repo, cấu hình AI logging hooks | Thông | 07/04 | ✅ Xong |
| Initial scaffold frontend (Next.js) | Thông | 07/04 | ✅ Xong |
| Khởi tạo optimizer-agent (OR-Tools) | Quân | 07/04 | ✅ Xong |
| Phác thảo ý tưởng sản phẩm, thiết kế UX sơ bộ | Quân | 10/04 | ✅ Xong |
| Update UI theo idea mới | Huyền | 11/04 | ✅ Xong |

---

### Sprint 2 — 13/04 → 20/04/2026

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| Setup FastAPI backend + routers (auth, users, nutrition) | Thông | 16/04 | ✅ Xong |
| Frontend pages scaffold (tất cả routes) | Thông | 16/04 | ✅ Xong |
| Nori chatbot API (`/api/nori` + Claude integration) | Huyền | 17/04 | ✅ Xong |
| Food Optimizer agent (CP-SAT solver) | Thông | 17/04 | ✅ Xong |
| Bot Pregnant (RAG + Vinmec data crawl) | Quân | 17/04 | ✅ Xong |
| Xoá mock data, kết nối API thật | Quân | 16/04 | ✅ Xong |

---

### Sprint 3 — 20/04 → 28/04/2026

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| Docker + docker-compose cho cả BE và FE | Thông | 25/04 | ✅ Xong |
| Fix bug API và optimizer | Quân | 26/04 | ✅ Xong |
| Tích hợp food_recommendations route | Thông | 27/04 | ✅ Xong |
| Fix dialog Nori (kích thước, truncate text) | Huyền | 28/04 | ✅ Xong |
| Cập nhật JOURNAL và WORKLOG | Huyền | 28/04 | ✅ Xong |

---

### Sprint 4 — 28/04 → 05/05/2026

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| Nghiên cứu & tích hợp LLM Vision cho Smart Scan | Thông | 01/05 | ✅ Xong |
| Xây dựng thuật toán mapping LLM output với Nutrition DB | Quân | 02/05 | ✅ Xong |
| Cập nhật UI/UX cho màn hình Smart Scan | Huyền | 04/05 | ✅ Xong |
| Tối ưu prompt để chống hallucination và lấy format JSON | Quân | 05/05 | ✅ Xong |

---

### Sprint 5 — 05/05 → 12/05/2026

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| Hoàn thiện Dashboard hiển thị dinh dưỡng cá nhân hoá | Huyền | 08/05 | ✅ Xong |
| Viết kịch bản Demo theo AIDA framework | Huyền | 09/05 | ✅ Xong |
| Security test (Prompt injection) & AI Governance docs | Quân | 10/05 | ✅ Xong |
| Freeze code, test toàn bộ luồng, dry-run demo | Cả nhóm | 11/05 | ✅ Xong |

---

### Brainstorm: Ưu tiên tính năng MVP — 10/04/2026

**Câu hỏi:** Với thời gian còn lại, tính năng nào cần làm trước để sản phẩm có giá trị thực sự cho mẹ bầu?

**Các ý tưởng:**
- **Nori chatbot:** Tư vấn dinh dưỡng tiếng Việt theo tuần thai và bệnh lý — thấp về kỹ thuật, cao về giá trị người dùng
- **Smart Scan (ảnh món ăn):** Phân tích dinh dưỡng từ ảnh — ấn tượng nhưng cần vision model, phức tạp
- **Food Optimizer:** Gợi ý thực đơn theo ngân sách + vi chất thiếu — rõ ràng hơn, dễ demo
- **Nutrition tracking:** Log bữa ăn, xem dashboard — cần nhiều UI

**Pros/Cons:**
| Tính năng | Giá trị người dùng | Độ khó | Thời gian |
|---|---|---|---|
| Nori chatbot | Cao | Thấp | ~2 ngày |
| Food Optimizer | Cao | Trung bình | ~3 ngày |
| Smart Scan | Rất cao | Cao | ~1 tuần |
| Nutrition tracking | Trung bình | Trung bình | ~3 ngày |

**Kết luận:** Làm Nori + Food Optimizer trước (MVP). Smart Scan để V2. Nutrition tracking song song nếu còn thời gian.

---

### Evaluation: Nhận diện món ăn (Smart Scan) bằng LLM Vision — 07/05/2026

**Phương pháp test:** 
- Chụp và tải lên 50 bức ảnh các bữa ăn thực tế của mẹ bầu Việt Nam (cơm nhà, bún, phở, xôi).
- So sánh kết quả trích xuất món ăn và định lượng của LLM với dữ liệu dán nhãn thủ công (ground-truth).

**Kết quả / Metrics:**
- **Tỷ lệ nhận diện đúng (Accuracy):** 92% (46/50 ảnh)
- **Tốc độ phản hồi trung bình (Latency):** 2.5s - 3.2s
- **Tỷ lệ xuất format JSON hợp lệ (Valid JSON Rate):** 98% (Sau khi áp dụng few-shot prompt)
- **Độ chính xác lượng Calo ước tính:** Sai số ± 15% so với tính toán thủ công từ chuyên gia dinh dưỡng.

**Đánh giá:** Đạt yêu cầu cho phiên bản MVP. Sai số ± 15% calo là hoàn toàn chấp nhận được trong việc tracking dinh dưỡng hàng ngày (các app lớn như MyFitnessPal thường cũng có sai số ~20%). Cần tối ưu thêm prompt để giảm latency xuống dưới 2s.

---

### Evaluation: Trải nghiệm ứng dụng thực tế (User Testing) — 10/05/2026

**Phương pháp test:** 
- Phỏng vấn và theo dõi hành vi của 10 mẹ bầu (thuộc nhóm đối tượng mục tiêu) sử dụng app trong 3 ngày liên tục.

**Kết quả / Metrics:**
- **Tỷ lệ tuân thủ thực đơn (Compliance Rate D3):** 60% (6/10 người dùng ăn theo đúng hoặc thay thế món thành công trên app).
- **Tỷ lệ Retention (D3):** 80% (8/10 người dùng tiếp tục mở app vào ngày thứ 3 để chụp ảnh bữa ăn).
- **Aha Moment:** 7/10 người dùng bày tỏ sự ngạc nhiên và thích thú khi chụp bát phở và nhận được phân tích chi tiết về lượng đường/tinh bột so với chuẩn của Bộ Y tế.

**Đánh giá:** Tín hiệu thị trường rất tích cực, tính năng Smart Scan thực sự tạo ra "Wow effect". Tuy nhiên cần bổ sung onboarding guideline trong app để hướng dẫn user cách chụp ảnh ở góc đủ sáng, giúp AI nhận diện tốt hơn.
