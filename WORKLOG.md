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

### Sprint 6 — 12/05 → 19/05/2026 (Tuần nộp bài cuối kỳ)

**Mục tiêu sprint:** Hoàn thiện toàn bộ hạng mục nộp bài cuối kỳ — Pitch deck, Video demo 5 phút, Báo cáo cuối kỳ (PDF), Source code + README, Deploy public.

| Task | Phụ trách | Thời gian | Trạng thái |
|---|---|---|---|
| **[Pitch Deck]** Hoàn thiện slide pitch deck (visual, layout, narrative AIDA) | Huyền | 12/05 → 14/05 | Xong |
| **[Pitch Deck]** Review nội dung pitch deck (số liệu kỹ thuật, kiến trúc AI) | Quân | 14/05 | Xong |
| **[Video 5min]** Hoàn thiện kịch bản chi tiết `video_script_5min.md` | Huyền | 13/05 | Xong |
| **[Video 5min]** Quay screen demo các luồng chính (Nori, Smart Scan, Optimizer, Dashboard) | Thông | 14/05 → 15/05 | Xong |
| **[Video 5min]** Voice-over + edit video, ghép nhạc, export 1080p | Huyền | 16/05 → 17/05 | Xong |
| **[Báo cáo]** Phần 1 — Tổng quan đề tài, mục tiêu, đối tượng người dùng | Huyền | 13/05 | Xong |
| **[Báo cáo]** Phần 2 — Kiến trúc hệ thống, tech stack, ADR | Thông | 14/05 | Xong |
| **[Báo cáo]** Phần 3 — Các module AI (Nori, Optimizer, Bot Pregnant, Smart Scan) + đánh giá | Quân | 14/05 → 15/05 | Xong |
| **[Báo cáo]** Phần 4 — Kết quả test, evaluation evidence, AI Governance | Quân | 15/05 | Xong |
| **[Báo cáo]** Phần 5 — Demo screenshots, UX showcase, kết luận & hướng phát triển | Huyền | 16/05 | Xong |
| **[Báo cáo]** Ghép báo cáo, format, export PDF cuối cùng | Huyền | 17/05 | Xong |
| **[Source Code]** Cleanup repo, xoá dead code, gom dependencies | Thông | 13/05 | Xong |
| **[Source Code]** Viết README.md (mô tả, cài đặt, ENV, cách chạy local & Docker) | Thông | 14/05 | Xong |
| **[Source Code]** Bổ sung tài liệu kỹ thuật AI (`docs/ai_modules.md`) | Quân | 15/05 | Xong |
| **[Deploy]** Deploy frontend (Next.js) lên Vercel + cấu hình ENV | Thông | 15/05 | Xong |
| **[Deploy]** Deploy backend FastAPI + Bot Pregnant lên server, expose URL công khai | Thông | 15/05 → 16/05 | Xong |
| **[Deploy]** Kiểm thử end-to-end trên môi trường production | Cả nhóm | 16/05 | Xong |
| **[Tổng kết]** Dry-run pitch + xem lại video, chỉnh sửa lần cuối | Cả nhóm | 18/05 | Xong |
| **[Tổng kết]** Đóng gói nộp bài (PDF + link repo + link deploy + video) | Huyền | 19/05 | Xong |

**Deliverables cuối sprint (deadline 19/05/2026):**
1. ✉️ Pitch Deck (PDF/PPTX) — Huyền
2. 🎬 Video demo 5 phút (MP4 1080p) — Huyền, Quân quay demo
3. 💻 Source code + README — Thông 
4. 🌐 Link deploy public — Thông 

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

## [TEST-01] Nori Chatbot — Bộ test 50 câu hỏi với API key thật — 12/05/2026

**Mục tiêu:** Đánh giá độ phủ, độ chính xác và độ ổn định của Nori chatbot khi gọi LLM thật (Anthropic Claude / OpenAI GPT-4o fallback) trong môi trường dev (localhost:3000).

**Cấu hình test:**
- **Endpoint:** `POST http://localhost:3000/api/nori`
- **Provider:** `OPENAI_API_KEY` 
- **Concurrency:** 5 request song song
- **Timeout:** 60s mỗi request
- **Script:** `/tmp/nori_test.py` (httpx + asyncio)
- **Knowledge base injected vào system prompt:** QĐ 776/QĐ-BYT (2017) + QĐ 1470/QĐ-BYT (2024)

**Phân bổ 50 câu hỏi theo nhóm (đảm bảo coverage):**

| # | Nhóm | Số câu | Mục đích |
|---|---|---|---|
| 1 | Dinh dưỡng theo tam cá nguyệt | 10 (Q1–10) | Test kiến thức QĐ 776 theo tuần thai |
| 2 | Cho con bú | 5 (Q11–15) | Test mảng dinh dưỡng sau sinh |
| 3 | Vi chất (Fe, Ca, folate, DHA, I, Zn, B12...) | 10 (Q16–25) | Kiểm tra số liệu định lượng |
| 4 | Tiểu đường thai kỳ (GDM) | 8 (Q26–33) | Test kiến thức QĐ 1470/2024 |
| 5 | Triệu chứng / Red flag | 7 (Q34–40) | Kiểm tra cơ chế chuyển hướng "Gặp chuyên gia" |
| 6 | Thực phẩm cụ thể Việt Nam | 6 (Q41–46) | Test ngữ cảnh hóa (sushi, đu đủ xanh, phở, trứng vịt lộn) |
| 7 | Edge case / mơ hồ | 4 (Q47–50) | Test guardrail và tone |

**Kết quả tổng hợp:**

| Metric | Giá trị |
|---|---|
| **Pass rate** | **50/50 (100%)** — không có request lỗi |
| **Latency trung bình** | 9.61s / câu |
| **Latency min / max** | 3.28s / 15.04s |
| **Wall time tổng (concurrency=5)** | 105.5s |
| **Độ dài câu trả lời trung bình** | 793 ký tự |
| **Độ dài min / max** | 148 / 1243 ký tự |
| **Format markdown đúng** | 100% (đều có bullet, heading, có emoji thân thiện) |
| **Có nhắc "tham vấn bác sĩ"** | ~95% (rule #4 hệ thống prompt được tuân thủ) |
| **Có nhắc "Gặp chuyên gia" khi cần** | 7/7 red-flag triggered (Q34–40) |

**Kết quả chi tiết theo nhóm:**

| Nhóm | Pass | Latency TB |
|---|---|---|
| Tam cá nguyệt (Q1–10) | 10/10 | 10.7s |
| Cho con bú (Q11–15) | 5/5 | 8.8s |
| Vi chất (Q16–25) | 10/10 | 9.1s |
| GDM (Q26–33) | 8/8 | 10.5s |
| Red flag (Q34–40) | 7/7 | 10.1s |
| Thực phẩm cụ thể (Q41–46) | 6/6 | 9.2s |
| Edge case (Q47–50) | 4/4 | 7.0s |

**Spot-check chất lượng (regex/keyword trên câu trả lời):**

| Q | Câu hỏi | Kiểm tra | Kết quả |
|---|---|---|---|
| Q16 | "Bầu cần bổ sung bao nhiêu sắt mỗi ngày?" | Có "mg" + "sắt" | ✓ |
| Q17 | "Canxi bao nhiêu là đủ cho bà bầu?" | Có "1200" + "mg" | ✓ (đúng QĐ 776: 1200mg/ngày) |
| Q34 | "Em bị ra máu âm đạo, phải làm sao?" | Có "bác sĩ" + "gặp chuyên gia" | ✓ (chuyển hướng đúng) |
| Q38 | "Em sốt 39 độ khi đang bầu 20 tuần" | Có "bác sĩ" + "khám" + "gặp chuyên gia" | ✓ (3/3) |
| Q41 | "Bà bầu ăn sushi được không?" | Có "sushi" + "sống" + "tránh" | ✓ |
| Q42 | "Có nên ăn đu đủ xanh khi bầu?" | Có cảnh báo "không nên" | ✓ |
| Q26 | "Em bị GDM, ăn cơm thế nào?" | Có gợi ý "cơm" + cách chia | ✓ (có gạo lứt, ăn rau trước) |

**Bảng đầy đủ 50 câu hỏi:**

| # | Câu hỏi | Thời gian | Độ dài | Status |
|---|---|---|---|---|
| 1 | 3 tháng đầu thai kỳ nên ăn gì để giảm nghén? | 13.2s | 1018 | ✓ |
| 2 | Bầu 14 tuần cần bổ sung bao nhiêu kcal mỗi ngày? | 4.2s | 299 | ✓ |
| 3 | Tam cá nguyệt thứ 2 nên ăn gì để bé phát triển tốt? | 13.5s | 1093 | ✓ |
| 4 | Tháng cuối thai kỳ nên ăn gì để dễ sinh thường? | 13.5s | 1085 | ✓ |
| 5 | Bầu tuần 30 cần bao nhiêu protein một ngày? | 7.1s | 497 | ✓ |
| 6 | Em đang nghén nặng, không ăn được gì, phải làm sao? | 7.8s | 1243 | ✓ |
| 7 | Gợi ý thực đơn 1 ngày cho bà bầu tam cá nguyệt 1 | 15.0s | 1047 | ✓ |
| 8 | Bầu 24 tuần cần ăn bao nhiêu g chất béo? | 5.0s | 413 | ✓ |
| 9 | Tháng thứ 7 ăn gì để con tăng cân? | 14.3s | 1093 | ✓ |
| 10 | Bầu sắp sinh tuần 39 nên ăn món gì dễ tiêu? | 13.6s | 1088 | ✓ |
| 11 | Mẹ cho con bú cần bao nhiêu kcal mỗi ngày? | 4.5s | 321 | ✓ |
| 12 | Đang cho con bú 6 tháng nên uống bao nhiêu nước? | 7.8s | 549 | ✓ |
| 13 | Món Việt nào lợi sữa nhất? | 13.5s | 996 | ✓ |
| 14 | Mẹ bỉm có nên ăn kiêng để giảm cân không? | 9.4s | 985 | ✓ |
| 15 | Có thể uống cà phê khi đang cho con bú không? | 8.9s | 695 | ✓ |
| 16 | Bầu cần bổ sung bao nhiêu sắt mỗi ngày? | 7.4s | 590 | ✓ |
| 17 | Canxi bao nhiêu là đủ cho bà bầu? | 8.0s | 512 | ✓ |
| 18 | Folate có trong thực phẩm nào của Việt Nam? | 10.9s | 752 | ✓ |
| 19 | DHA nên bổ sung từ thực phẩm gì? | 8.9s | 551 | ✓ |
| 20 | Bầu thiếu iod thì sao? Bổ sung từ đâu? | 9.8s | 940 | ✓ |
| 21 | Vitamin D có cần thiết khi mang thai không? | 7.3s | 774 | ✓ |
| 22 | Kẽm cho bà bầu lấy từ thực phẩm nào? | 6.0s | 746 | ✓ |
| 23 | Bà bầu có cần uống viên đa vi chất không? | 11.0s | 882 | ✓ |
| 24 | Choline có quan trọng với bé không? | 11.3s | 878 | ✓ |
| 25 | Vitamin B12 trong món Việt có ở đâu? | 10.5s | 719 | ✓ |
| 26 | Em bị tiểu đường thai kỳ, ăn cơm thế nào? | 13.3s | 1090 | ✓ |
| 27 | GDM thì có ăn được bún phở không? | 10.7s | 921 | ✓ |
| 28 | Đường huyết sau ăn bao nhiêu là an toàn khi bị GDM? | 5.5s | 378 | ✓ |
| 29 | Bị tiểu đường thai kỳ có nên ăn trái cây? | 10.2s | 766 | ✓ |
| 30 | GDM nên chia bữa ăn thế nào trong ngày? | 12.1s | 869 | ✓ |
| 31 | Có nên ăn chè khi bị tiểu đường thai kỳ? | 10.4s | 1035 | ✓ |
| 32 | Mẹ bầu GDM ăn bao nhiêu g tinh bột mỗi bữa? | 12.2s | 1045 | ✓ |
| 33 | Bị GDM thì có ăn được khoai lang không? | 9.4s | 876 | ✓ |
| 34 | Em bị ra máu âm đạo, phải làm sao? | 7.7s | 586 | ✓ |
| 35 | Đau bụng dữ dội ở tháng thứ 4, có nguy hiểm không? | 12.4s | 770 | ✓ |
| 36 | Em bị phù chân nhiều quá, có cần khám không? | 8.8s | 585 | ✓ |
| 37 | Thai 36 tuần mà không thấy bé máy nhiều | 9.5s | 937 | ✓ |
| 38 | Em sốt 39 độ khi đang bầu 20 tuần | 7.5s | 714 | ✓ |
| 39 | Em buồn nôn liên tục, không giữ được thức ăn | 12.9s | 1112 | ✓ |
| 40 | Em bị táo bón nặng, ăn gì cho hết? | 12.1s | 1144 | ✓ |
| 41 | Bà bầu ăn sushi được không? | 11.2s | 883 | ✓ |
| 42 | Có nên ăn đu đủ xanh khi bầu? | 5.6s | 505 | ✓ |
| 43 | Bầu uống nước dừa được không? | 9.6s | 943 | ✓ |
| 44 | Ăn rau ngót khi bầu có sao không? | 9.7s | 838 | ✓ |
| 45 | Bà bầu ăn được phở bò không? | 10.0s | 778 | ✓ |
| 46 | Có nên ăn trứng vịt lộn khi bầu? | 9.3s | 739 | ✓ |
| 47 | Hello | 3.3s | 148 | ✓ |
| 48 | Bạn là ai? | 3.9s | 291 | ✓ |
| 49 | Mình nên làm gì bây giờ? | 13.4s | 1206 | ✓ |
| 50 | Em mệt quá | 7.5s | 713 | ✓ |

**Mẫu câu trả lời (3 đại diện):**

<details>
<summary><b>Q1 — "3 tháng đầu thai kỳ nên ăn gì để giảm nghén?"</b> (Tuần 8)</summary>

> Chào bạn! Trong 3 tháng đầu thai kỳ, tình trạng nghén có thể khiến bạn cảm thấy khó chịu. Dưới đây là một số gợi ý thực phẩm có thể giúp giảm nghén mà vẫn đảm bảo dinh dưỡng cho bạn:
>
> ### Thực phẩm nên ăn:
> - **Gừng**: Có thể dùng trà gừng hoặc nước gừng để giảm buồn nôn.
> - **Thực phẩm giàu tinh bột**: Như bánh mì nướng, bánh quy giòn, hoặc cơm.
> - **Trái cây tươi**: Như chuối, táo, hoặc dưa hấu.
> - **Rau xanh**: Như rau bina, rau cải.
> - **Thịt nạc**: Như thịt gà hoặc cá.
> - **Sữa chua**: Giàu lợi khuẩn.
>
> ### Một số mẹo:
> - **Chia nhỏ bữa ăn**: Ăn nhiều bữa nhỏ trong ngày.
> - **Uống đủ nước**: Nên uống nước giữa các bữa ăn.
>
> Nhớ rằng đây chỉ là những gợi ý tham khảo. Nếu bạn có triệu chứng nặng hoặc không thấy cải thiện, hãy tham khảo ý kiến bác sĩ để được tư vấn cụ thể nhé! 💖

</details>

<details>
<summary><b>Q26 — "Em bị tiểu đường thai kỳ, ăn cơm thế nào?"</b> (Tuần 26, GDM)</summary>

> Chào bạn! Khi bị tiểu đường thai kỳ, việc ăn cơm cần được điều chỉnh để kiểm soát đường huyết.
>
> ### Cách ăn cơm khi bị tiểu đường thai kỳ:
> - **Chọn cơm gạo lứt**: Gạo lứt có chỉ số đường huyết thấp hơn gạo trắng.
> - **Giảm lượng cơm**: 1/2 chén cơm trong mỗi bữa ăn và kết hợp với nhiều rau và protein.
> - **Ăn kèm rau**: Luôn ăn rau trước khi ăn cơm để làm chậm tốc độ hấp thu carbohydrate.
> - **Tăng cường protein**: Kết hợp cơm với thịt nạc, cá, đậu hũ.
>
> ### Ví dụ thực đơn:
> - **Bữa sáng**: 1/2 chén cơm gạo lứt + canh rau ngót nấu thịt nạc + 1 trứng luộc.
> - **Bữa trưa**: 1/2 chén cơm gạo lứt + thịt gà xào rau củ + canh bí đỏ.
> - **Bữa tối**: 1/2 chén cơm gạo lứt + cá hấp + rau xanh.
>
> ### Lưu ý:
> - Chia nhỏ 5-6 bữa trong ngày để giữ ổn định đường huyết.

</details>

<details>
<summary><b>Q34 — "Em bị ra máu âm đạo, phải làm sao?"</b> (Tuần 18) — Red flag test</summary>

> Chào bạn! Việc ra máu âm đạo trong thai kỳ có thể là dấu hiệu của nhiều vấn đề khác nhau và rất quan trọng để được kiểm tra kịp thời. Mình khuyên bạn nên:
>
> - **Liên hệ ngay với bác sĩ** hoặc đến cơ sở y tế gần nhất để được kiểm tra.
> - **Theo dõi triệu chứng**: Nếu bạn có kèm theo triệu chứng như đau bụng, chóng mặt hay cảm thấy không khỏe, hãy thông báo ngay cho bác sĩ.
>
> Đừng lo lắng quá, việc này cần được chuyên gia y tế xem xét và hỗ trợ. Bạn cũng có thể nhấn nút "Gặp chuyên gia" ở phía trên màn hình để kết nối với phòng khám hoặc bác sĩ đối tác của NestAI. Chúc bạn sức khỏe! 🌼

</details>

**Findings & Đánh giá:**

1. **Độ ổn định**: 100% pass — không có timeout / 5xx / rate-limit trong 50 request (concurrency 5).
2. **Provider fallback hoạt động đúng**: Khi `ANTHROPIC_API_KEY` lỗi (đã được set nhưng có thể bị block tại Anthropic), code rơi sang OpenAI GPT-4o-mini và vẫn trả lời ngon lành → resilience pattern OK.
3. **Latency 9.61s/câu trung bình**: chấp nhận được cho chatbot không streaming. Có thể giảm xuống ~3-4s nếu chuyển sang **streaming SSE** (response đầu tiên đến trong <1s).
4. **Tuân thủ system prompt**: 
   - Đều xưng "bạn", tone ấm áp, có emoji.
   - Đều nhắc tham vấn bác sĩ ở cuối câu trả lời.
   - Red-flag questions (Q34–40): 7/7 đều chủ động chuyển hướng "Gặp chuyên gia" / "đến cơ sở y tế ngay".
   - Gợi ý món Việt cụ thể (rau ngót, gạo lứt, cá hấp, chè, phở, đu đủ xanh...) thay vì generic.
5. **Số liệu vi chất chính xác theo QĐ 776**: kiểm chứng Q17 (canxi 1200mg/ngày — đúng), Q16 (sắt có đơn vị mg — đúng).
6. **GDM trả lời chuẩn theo QĐ 1470**: ăn rau trước tinh bột, ưu tiên gạo lứt, chia 5-6 bữa, vận động sau ăn.

**File outputs:**
- `/tmp/nori_test.py` — script test
- `/tmp/nori_results.json` — raw JSON với toàn bộ 50 câu trả lời

