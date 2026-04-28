# Weekly Journal

Ghi lại hành trình xây dựng sản phẩm mỗi tuần — những gì đã làm, học được gì, AI giúp như thế nào.

### Tuần 1 — 06/04/2026

**Thành viên:** Chu Thị Ngọc Huyền, Chu Thành Thông, Chu Minh Quân

#### Đã làm
- Tập hợp nhóm, thảo luận và quyết định đề tài Tối ưu dinh dưỡng 

#### Khó nhất tuần này
- Xác định chân dung người dùng, quyết định thay đổi đối tượng từ nhân viên bếp ăn trường học sang phụ nữ mang thai và cho con bú để thu nhỏ tệp người dùng, cá nhân hoá và chạm tới ngách thị trường chưa được khai thác nhiều

#### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Claude Code | Brainstorm và so sánh các hướng đề tài, phân tích ưu/nhược điểm từng đối tượng người dùng | Giúp nhóm quyết định nhanh hơn, có lập luận rõ ràng khi chọn đối tượng mẹ bầu |

#### Học được
- Thu hẹp đối tượng người dùng từ B2B (bếp ăn trường học) sang B2C (mẹ bầu cá nhân) giúp MVP đơn giản hơn và dễ validate hơn
- Ngách "dinh dưỡng thai kỳ cá nhân hoá theo bệnh lý" chưa được khai thác ở Việt Nam — đây là lợi thế cạnh tranh rõ ràng

#### Nếu làm lại, sẽ làm khác
- Phỏng vấn ít nhất 2–3 người dùng thật trước khi chốt đối tượng, thay vì quyết định dựa hoàn toàn vào phân tích nội bộ
- Vẽ user journey map ngay tuần đầu để nhóm có cùng hình dung về sản phẩm

#### Kế hoạch tuần tới
- Setup repo và cấu hình project structure
- Phác thảo các tính năng MVP
- Lên kế hoạch tech stack và phân công công việc

---

### Tuần 2 — 13/04/2026

**Thành viên:** Chu Thị Ngọc Huyền, Chu Thành Thông, Chu Minh Quân

#### Đã làm
- Setup repo, cấu hình AI logging hooks và project structure
- Chọn đề tài: **NestAI** — Trợ lý dinh dưỡng AI cho mẹ bầu Việt Nam
- Xác định chân dung người dùng chính: mẹ bầu 22–35 tuổi, mang thai lần đầu, ít thời gian tra cứu dinh dưỡng
- Xác định 3 nhóm người dùng có nhu cầu đặc thù: tiểu đường thai kỳ (GDM), thiếu sắt/thiếu máu, cao huyết áp thai kỳ
- Khởi tạo scaffold frontend (Next.js) và optimizer-agent ban đầu
- Phác thảo ý tưởng sản phẩm ban đầu và viết vào repo

#### Khó nhất tuần này
- Xác định scope phù hợp: ban đầu muốn làm quá nhiều tính năng (smart scan ảnh, cooking guide, shopping list, chatbot) — phải thu hẹp lại để có thể hoàn thành trong thời gian cho phép
- Tìm dữ liệu dinh dưỡng Việt Nam đáng tin cậy (cơm, canh, món truyền thống) khó hơn dự kiến

#### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Claude Code | Phân tích chân dung người dùng, gợi ý feature set phù hợp | Giúp thu hẹp scope hợp lý, tránh over-engineering |
| Claude Code | Setup project structure, cấu hình hooks | Tiết kiệm ~1 tiếng setup thủ công |

#### Học được
- Xác định "người dùng cụ thể" (mẹ bầu bị GDM, không phải mẹ bầu nói chung) giúp thiết kế tính năng rõ ràng hơn nhiều
- Pain point thực sự của người dùng không phải "thiếu thông tin" mà là "không biết áp dụng thông tin vào bữa ăn hằng ngày"
- Nên viết user stories trước rồi mới nghĩ tech stack — không phải ngược lại

#### Nếu làm lại, sẽ làm khác
- Phỏng vấn ít nhất 2–3 mẹ bầu thật trước khi quyết định feature chính
- Viết acceptance criteria rõ ràng cho từng user story ngay từ tuần đầu

#### Kế hoạch tuần tới
- Phân tích kỹ bài toán dinh dưỡng thai kỳ theo tuần
- Thiết kế kiến trúc hệ thống và chọn tech stack
- Lập kế hoạch sprint cho toàn dự án

---

### Tuần 3 — 20/04/2026

**Thành viên:** Chu Thị Ngọc Huyền, Chu Thành Thông, Chu Minh Quân

#### Đã làm
- Phân tích bài toán chuyên sâu: dinh dưỡng theo tam cá nguyệt, vi chất theo tuần thai, thực phẩm cần tránh
- Xác định tech stack chính thức: FastAPI (backend) + Next.js App Router (frontend) + Supabase (database)
- Thiết kế sơ bộ kiến trúc 3 lớp: Frontend → Backend API → AI Service Layer
- Lập kế hoạch tính năng theo mức độ ưu tiên: MVP (chatbot Nori, gợi ý thực đơn) → V2 (smart scan, cooking guide)
- Update UI theo hướng thiết kế mới, tinh chỉnh idea

#### Khó nhất tuần này
- Quyết định đổi hướng giữa chừng tốn nhiều thời gian thảo luận và lo ngại về tiến độ
- Thiết kế schema database cho bài toán dinh dưỡng phức tạp hơn dự kiến: cần track cả tuần thai, bệnh lý, food preference, nutrition log

#### AI tool đã dùng
| Tool | Dùng để làm gì | Kết quả |
|---|---|---|
| Claude Code | Review và góp ý kiến trúc hệ thống | Phát hiện thiếu AI Service Layer tách biệt — quan trọng cho maintainability |
| Claude Code | Thiết kế database schema cho nutrition, baby, user profiles | Tiết kiệm ~2 tiếng, schema hợp lý hơn bản nháp tay đầu tiên |

#### Học được
- Đổi hướng sớm (tuần 2) tốt hơn nhiều so với đổi hướng muộn (tuần 5–6)
- Tách AI Service Layer ra khỏi Business Logic Layer ngay từ đầu giúp dễ thay đổi model/provider sau này
- FastAPI rất phù hợp cho prototype AI app: async native, dễ tích hợp Python AI libs, docs tự generate

#### Nếu làm lại, sẽ làm khác
- Validate lại idea với người dùng thật trước khi bắt đầu code — tránh phải đổi hướng
- Vẽ sơ đồ kiến trúc trước khi viết code, không để sau mới refactor

#### Kế hoạch tuần tới
- Bắt đầu implement backend: auth, user profiles, nutrition API
- Setup Supabase và kết nối với FastAPI
- Xây dựng scaffold chatbot Nori (API endpoint + prompt cơ bản)
