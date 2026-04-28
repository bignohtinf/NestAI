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

| Task | Người làm | Deadline | Trạng thái |
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

### Sprint 1 — 06/04 → 13/04/2026

| Task | Người làm | Deadline | Trạng thái |
|---|---|---|---|
| Thảo luận đề tài, chọn đối tượng người dùng | Cả nhóm | 06/04 | ✅ Xong |
| Setup repo, cấu hình AI logging hooks | Thông | 07/04 | ✅ Xong |
| Initial scaffold frontend (Next.js) | Thông | 07/04 | ✅ Xong |
| Khởi tạo optimizer-agent (OR-Tools) | Quân | 07/04 | ✅ Xong |
| Phác thảo ý tưởng sản phẩm, thiết kế UX sơ bộ | Quân | 10/04 | ✅ Xong |
| Update UI theo idea mới | Huyền | 11/04 | ✅ Xong |

---

### Sprint 2 — 13/04 → 20/04/2026

| Task | Người làm | Deadline | Trạng thái |
|---|---|---|---|
| Setup FastAPI backend + routers (auth, users, nutrition) | Thông | 16/04 | ✅ Xong |
| Frontend pages scaffold (tất cả routes) | Thông | 16/04 | ✅ Xong |
| Nori chatbot API (`/api/nori` + Claude integration) | Huyền | 17/04 | ✅ Xong |
| Food Optimizer agent (CP-SAT solver) | Thông | 17/04 | ✅ Xong |
| Bot Pregnant (RAG + Vinmec data crawl) | Quân | 17/04 | ✅ Xong |
| Xoá mock data, kết nối API thật | Quân | 16/04 | ✅ Xong |

---

### Sprint 3 — 20/04 → 28/04/2026

| Task | Người làm | Deadline | Trạng thái |
|---|---|---|---|
| Docker + docker-compose cho cả BE và FE | Thông | 25/04 | ✅ Xong |
| Fix bug API và optimizer | Quân | 26/04 | ✅ Xong |
| Tích hợp food_recommendations route | Thông | 27/04 | ✅ Xong |
| Fix dialog Nori (kích thước, truncate text) | Huyền | 28/04 | ✅ Xong |
| Cập nhật JOURNAL và WORKLOG | Huyền | 28/04 | ✅ Xong |

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
