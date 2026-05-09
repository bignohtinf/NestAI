# Demo Timeline NestAI — 20 phút (Kịch bản kể chuyện)

> **Thời lượng tổng:** 20:00 phút
> **Mô hình:** AIDA, lồng trong câu chuyện về **chị Linh — một mẹ bầu 28 tuổi, mang thai tuần 24, vừa được chẩn đoán tiểu đường thai kỳ**.
> **Cấu trúc:** Mỗi tính năng = một mong muốn của Linh → NestAI đáp ứng.
> **Người trình bày:** 1 người dẫn chuyện + 1 người thao tác app (chuyển vai Mẹ ↔ Bố).

---

## 🎭 Nhân vật chính

> **Chị Linh, 28 tuổi** — nhân viên văn phòng, mang thai con đầu lòng tuần 24. Tuần trước bác sĩ chẩn đoán cô bị **đái tháo đường thai kỳ**. Mẹ chồng vẫn nhắc *"ăn nhiều trứng ngỗng cho con thông minh"*. Chồng cô — anh Nam — muốn giúp nhưng không biết bắt đầu từ đâu.
>
> Linh có **4 mong muốn** rất con người:
> 1. *"Tôi muốn biết hôm nay tôi nên ăn gì — riêng cho tình trạng của tôi."*
> 2. *"Khi cầm bát phở lên, tôi muốn biết ngay nó có hại cho con tôi không."*
> 3. *"Tôi muốn chồng cùng đồng hành, không phải một mình."*
> 4. *"3 giờ sáng con quấy, tôi muốn có người trả lời câu hỏi của tôi ngay."*

---

## Tổng quan timeline

| Mốc | Phần | Mong muốn của Linh | Tính năng NestAI |
|---|---|---|---|
| 00:00–00:30 | Mở màn | — | — |
| 00:30–02:30 | **Attention** — Linh là ai? | Bối cảnh, nỗi đau | — |
| 02:30–05:00 | **Interest 1** — *"Tôi nên ăn gì?"* | Mong muốn #1 | F1: Onboarding & Health Profile |
| 05:00–09:00 | **Interest 2** — *"Bát phở này có hại không?"* | Mong muốn #2 | F2: Smart Scan |
| 09:00–12:30 | **Desire 1** — *"Tôi không muốn cô đơn"* | Mong muốn #3 | F3: Nutrition Planner + gửi Bố |
| 12:30–16:00 | **Desire 2** — *"3 giờ sáng tôi cần ai đó"* | Mong muốn #4 | F4: Hành trình bé + Nori |
| 16:00–19:00 | **Action** — Linh không cô đơn | Business + CTA | — |
| 19:00–20:00 | Q&A buffer | — | — |

---

## 🟢 00:00 — 00:30 | Mở màn (30s)

> *"Kính chào ban giám khảo. Trong 20 phút tới, chúng tôi sẽ không trình bày một danh sách tính năng. Chúng tôi sẽ kể cho ban giám khảo nghe câu chuyện của một người phụ nữ — và câu chuyện đó có thể đang xảy ra với 1 trong 5 mẹ bầu Việt Nam ngay lúc này."*

---

## 🔴 A — Attention (00:30 → 02:30) | Giới thiệu chị Linh

### 00:30 — 01:30 | Linh — và những lời khuyên trái chiều (1 phút)

> *"Đây là chị Linh. 28 tuổi. Đang mang thai tuần thứ 24."*
>
> *"Tuần trước bác sĩ nói Linh bị **tiểu đường thai kỳ**. Cô mang về một xấp giấy hướng dẫn, đọc 3 lần vẫn không hiểu mình nên ăn gì."*
>
> *"Mẹ chồng nhắc: 'ăn trứng ngỗng cho con thông minh'. Bạn bè bảo: 'sau sinh nhớ ăn nhiều móng giò cho nhiều sữa'. Internet thì 1000 câu trả lời khác nhau."*

- **Slide:** ảnh chị Linh + 3 bong bóng thoại mâu thuẫn xung quanh.

### 01:30 — 02:30 | Linh không phải cá biệt (1 phút)

> *"Linh không phải trường hợp hiếm. Tại Việt Nam, **cứ 5 mẹ bầu thì có 1 người mắc tiểu đường thai kỳ — 20%**. Con số này 20 năm trước chỉ 3–4%. Nó đã tăng gấp 5 lần."*
>
> *"Và trong khoảnh khắc bối rối đó, Linh có 4 mong muốn rất đơn giản. Hôm nay chúng tôi sẽ cho ban giám khảo thấy NestAI đáp ứng từng mong muốn ấy như thế nào."*

- **Slide:** liệt kê 4 mong muốn — sẽ tick từng cái khi demo.

---

## 🟡 I — Interest (02:30 → 09:00)

### 02:30 — 05:00 | Mong muốn #1: *"Tôi muốn biết tôi nên ăn gì"* — Demo F1 Onboarding (2 phút 30 giây)

#### 02:30 — 03:00 | Setup câu chuyện (30s)
> *"Tối hôm đó Linh tải NestAI. Cô không có thời gian đọc 50 trang hướng dẫn. Cô chỉ muốn biết: hôm nay tôi nên ăn gì?"*

#### 03:00 — 04:30 | 🎬 Thao tác app (1 phút 30 giây)
- **00:30s** — Mở app, bấm "Bắt đầu hành trình".
- **00:30s** — Linh nhập: tuần thai **24**, BMI, **chọn "Có tiểu đường thai kỳ"**.
- **00:30s** — App tự render dashboard cá nhân hoá:
  - Mục tiêu calo riêng cho mẹ tiểu đường thai kỳ.
  - Tỷ lệ carbs giảm, protein tăng so với mẹ bình thường.
  - Cảnh báo các nhóm thực phẩm cần tránh.

#### 04:30 — 05:00 | Chốt giá trị (30s)
> *"30 giây. Linh đã có một bản kế hoạch dinh dưỡng dành riêng cho cô — không phải dành cho 'mẹ bầu chung chung'. Toàn bộ dựa trên **Hướng dẫn quốc gia về Sàng lọc & Quản lý Đái tháo đường thai kỳ**."*
>
> ✅ **Mong muốn #1: hoàn thành.**

---

### 05:00 — 09:00 | Mong muốn #2: *"Bát phở này có hại cho con tôi không?"* — Demo F2 Smart Scan (4 phút)

#### 05:00 — 05:45 | Setup câu chuyện (45s)
> *"Trưa hôm sau, Linh đi ăn cùng đồng nghiệp. Trên bàn là một bát bún bò. Cô tự hỏi: 'Có nên ăn không? Bao nhiêu là vừa? Có hại cho con không?'"*
>
> *"Linh không phải bác sĩ dinh dưỡng. Cô không thể nhìn bát bún bò và đếm được carbs."*
>
> *"Nhưng NestAI thì có thể."*

#### 05:45 — 08:15 | 🎬 Thao tác app (2 phút 30 giây)
- **00:30s** — Linh mở camera trong app, chụp/chọn ảnh bát bún bò đã chuẩn bị.
- **00:30s** — AI nhận diện trong ~2 giây → hiện tên món, calo, protein, carbs, fat.
- **00:30s** — Tự động cập nhật vào tracker ngày — biểu đồ tiến độ chạy real-time.
- **00:30s** — **Khoảnh khắc quan trọng:** ⚠️ cảnh báo đỏ hiện ra: *"Món này nhiều tinh bột tinh chế — không phù hợp với mẹ tiểu đường thai kỳ. Gợi ý: bớt 1/3 bún, thêm rau xanh."*
- **00:30s** — Linh bấm vào cảnh báo → app gợi ý món thay thế phù hợp.

#### 08:15 — 09:00 | Chốt giá trị (45s)
> *"Đây là điều mà ngay cả MyFitnessPal hay các app quốc tế không làm được — họ chỉ cho biết calo. NestAI hiểu **Linh là ai**, và nói với Linh điều cô **cần** nghe, không chỉ điều cô muốn nghe."*
>
> ✅ **Mong muốn #2: hoàn thành.**

---

## 🟠 D — Desire (09:00 → 16:00)

### 09:00 — 12:30 | Mong muốn #3: *"Tôi không muốn đi qua thai kỳ một mình"* — Demo F3 Nutrition Planner (3 phút 30 giây)

#### 09:00 — 09:45 | Setup câu chuyện (45s)
> *"Tối hôm đó Linh mệt, nghén, không nấu nổi. Anh Nam — chồng Linh — về đến nhà, hỏi 'Em muốn ăn gì?'. Linh không biết trả lời. Nam muốn giúp nhưng không biết nấu gì cho người tiểu đường thai kỳ."*
>
> *"Đây là khoảnh khắc rất nhiều cặp vợ chồng Việt Nam đang trải qua: muốn đồng hành — nhưng không biết bắt đầu từ đâu."*

#### 09:45 — 12:00 | 🎬 Thao tác app (2 phút 15 giây)
- **00:30s** — Linh bấm "Tạo thực đơn hôm nay" → AI sinh menu 3 bữa cân bằng theo profile của Linh.
- **00:20s** — Linh review menu, OK.
- **00:25s** — Linh bấm **"Gửi cho chồng"**.
- **00:30s** — **Switch sang điện thoại Nam** → push notification: *"Linh vừa giao nhiệm vụ đi chợ ❤️"*.
- **00:30s** — Nam mở app, thấy:
  - Danh sách đi chợ (gom nhóm theo quầy: rau, thịt, gia vị).
  - Công thức từng món có hình ảnh.
  - Checklist tick khi mua xong.

#### 12:00 — 12:30 | Chốt giá trị (30s)
> *"Bữa cơm không còn là gánh nặng của riêng Linh. Nó trở thành **hành trình hai người**. Nam không còn đứng ngoài thai kỳ — anh là một phần của nó."*
>
> ✅ **Mong muốn #3: hoàn thành.**

---

### 12:30 — 16:00 | Mong muốn #4: *"3 giờ sáng tôi cần ai đó trả lời tôi"* — Demo F4 Hành trình bé + Nori (3 phút 30 giây)

#### 12:30 — 13:00 | Setup câu chuyện (30s)
> *"Vài tháng sau, Linh sinh em bé. Đêm thứ 3 sau sinh, 3 giờ sáng. Cuống rốn của bé chảy một chút máu. Linh hoảng. Bác sĩ đã ngủ. Mẹ chồng đang ngủ. Internet thì lại có 1000 câu trả lời khác nhau."*
>
> *"Cô mở NestAI."*

#### 13:00 — 13:45 | 🎬 Hành trình bé (45s)
- **00:25s** — Mở tab **"Hành trình bé"** — timeline 40 tuần, tuần hiện tại: kích thước (cỡ quả gì), cân nặng (gram), biểu hiện của mẹ.
- **00:20s** — Vuốt qua các tuần — animation phát triển em bé tuần qua tuần.

#### 13:45 — 15:30 | 🎬 Trò chuyện với Nori (1 phút 45 giây)
- **00:20s** — Linh mở chat **AI Nori**.
- **00:25s** — Gõ: *"Cách chăm sóc cuống rốn của em bé mới sinh như thế nào?"*
- **00:35s** — Nori trả lời streaming, có cấu trúc rõ:
  1. Dấu hiệu bình thường vs bất thường.
  2. Các bước vệ sinh hằng ngày.
  3. Khi nào **phải đi khám ngay**.
- **00:25s** — Linh bấm vào câu trả lời → thấy **trích dẫn nguồn**: *"Hướng dẫn quốc gia về Dinh dưỡng & Chăm sóc Mẹ và Bé."*

#### 15:30 — 16:00 | Chốt giá trị (30s)
> *"Nori không bịa. Mọi câu trả lời đều có nguồn từ hướng dẫn quốc gia. Và Nori không bao giờ ngủ."*
>
> *"3 giờ sáng — Linh không cô đơn nữa."*
>
> ✅ **Mong muốn #4: hoàn thành.**

---

## 🔵 Act — Action (16:00 → 19:00)

### 16:00 — 16:45 | Linh không phải một người (45s)
> *"Câu chuyện của Linh không phải duy nhất. Tại Việt Nam, mỗi năm có **1.5 triệu mẹ bầu**. Mỗi người trong số họ đều có 4 mong muốn giống Linh."*
>
> *"NestAI sinh ra để trả lời cả 4."*

- **Slide:** 4 mong muốn — đều đã ✅.

### 16:45 — 17:45 | Mô hình kinh doanh (1 phút)
- **B2B (30s):** Hợp tác phòng khám sản / bệnh viện — gói "khám thai + NestAI Premium" như tiện ích kèm theo. Bác sĩ tin tưởng giới thiệu vì NestAI dùng đúng hướng dẫn quốc gia.
- **B2C (30s):** Mạng xã hội (TikTok, Facebook mom-groups) — free trial → subscription cho AI cá nhân hoá (Smart Scan unlimited, Nori 24/7, kế hoạch theo tuần).

### 17:45 — 18:30 | Tổng kết giá trị (45s)
> *"Với NestAI, chúng tôi không bán một app đếm calo. Chúng tôi bán **3 thứ Linh thực sự cần**:"*
>
> - 🛡️ **An tâm** — không phải đoán nữa.
> - 💪 **Sức khoẻ** — cho mẹ và cho bé.
> - 👨‍👩‍👧 **Gắn kết** — cả gia đình cùng đi.
>
> *"NestAI — kiến tạo thế hệ trẻ em khoẻ mạnh từ trong bụng mẹ."*

### 18:30 — 19:00 | Call-to-Action (30s)
> *"Bây giờ, mời ban giám khảo trở thành **Linh** trong 5 phút. Cầm thiết bị này, tự tay trải nghiệm bản beta. Hỏi Nori bất cứ điều gì."*

- Đưa thiết bị cho giám khảo + QR tải app trên slide cuối.

---

## 🟣 19:00 — 20:00 | Buffer / Q&A (1 phút)

- Dự phòng cho demo trễ, câu hỏi nhanh, cảm ơn & kết thúc.

---

## 📋 Checklist trước khi lên demo

- [ ] **Profile "chị Linh"** đã tạo sẵn: tuần 24, BMI, có tiểu đường thai kỳ.
- [ ] **Profile "anh Nam"** đã login trên thiết bị/tab thứ 2.
- [ ] **2–3 ảnh món ăn** chuẩn bị sẵn — ít nhất 1 món sẽ trigger cảnh báo (vd. bún bò, phở, cơm tấm).
- [ ] Câu hỏi mẫu cho Nori đã copy sẵn vào clipboard (tránh gõ lỗi trên sân khấu).
- [ ] Wifi ổn định + hotspot 4G dự phòng.
- [ ] Volume thiết bị to + đã test loa ngoài.
- [ ] Slide nhân vật Linh + 4 mong muốn để chiếu khi không thao tác app.

## 🔄 Plan B (rủi ro & phương án)

| Rủi ro | Phương án dự phòng |
|---|---|
| Smart Scan không nhận diện | Video screen-record 15s đã chuẩn bị — cắt sang luôn |
| Nori trả lời chậm > 5s | Người dẫn tiếp tục kể chuyện về nguồn dữ liệu trong lúc đợi |
| Mất mạng | Hotspot 4G, hoặc demo offline với cache |
| Vượt giờ ở Desire | Cắt phần "Hành trình bé" còn 30s, giữ trọn phần Nori (giá trị cốt lõi) |
| Giám khảo cắt ngang hỏi | Trả lời ngắn gọn 30s, quay lại đúng chỗ đang kể về Linh |

---

## 🎯 Nguyên tắc kể chuyện xuyên suốt

1. **Luôn quay về Linh** — mỗi feature mở đầu bằng "Linh đang ở đâu, cô cần gì?", kết thúc bằng "✅ mong muốn X hoàn thành".
2. **Không bao giờ nói "tính năng này có thể..."** — luôn nói "**Linh** có thể..." hoặc "**Nam** thấy...".
3. **Cảm xúc trước, công nghệ sau** — pain point của Linh phải đánh trúng tim trước khi show app.
4. **Slide nhân vật Linh** xuất hiện ở Mở màn, Attention, và Action — neo câu chuyện lại.
