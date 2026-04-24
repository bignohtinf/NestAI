## 1. Idea reframed

**Original idea:**
> Hệ thống AI tự động sinh thực đơn phù hợp với từng giai đoạn trong thai kỳ và cho con bú, cá nhân hoá theo sở thích và bệnh lý, tự động tính toán kcal từ hình ảnh và gợi ý thực đơn.

**Reframed as a product opportunity:**
> Phụ nữ mang thai phải tự quản lý dinh dưỡng dựa trên thông tin rải rác, mâu thuẫn và không cá nhân hóa — bác sĩ sản không có thời gian tư vấn dinh dưỡng chi tiết, còn các app dinh dưỡng hiện tại không hiểu nhu cầu thay đổi theo từng tuần thai và không có cơ sở dữ liệu món Việt. Khi xuất hiện thêm bệnh lý (tiểu đường thai kỳ, thiếu máu, cao huyết áp thai kỳ), gap này trở thành rủi ro sức khỏe thực sự. Cơ hội: xây một AI nutrition companion hiểu đúng giao điểm giữa giai đoạn thai kỳ — bệnh lý cụ thể — ẩm thực Việt, và giảm barrier theo dõi bằng cách tự động tính kcal từ ảnh bữa ăn thay vì buộc người dùng nhập tay.

---

## 2. Customer / Segment Card

- **Segment name:** Phụ nữ lần đầu mang thai tại Việt Nam, 22–35 tuổi, có smartphone
- **Operational context:** Đang theo dõi thai kỳ định kỳ tại phòng khám sản, tự tra cứu thực phẩm được/không được ăn hằng ngày, cố gắng ăn đủ chất nhưng không có framework rõ ràng để biết "đủ" là bao nhiêu
- **Recurring workflow:** Mỗi ngày phải quyết định ăn gì — đặc biệt khi có triệu chứng thai kỳ (buồn nôn T1, thèm đồ ngọt/mặn T2-T3), khi bác sĩ vừa thông báo có bệnh lý kèm theo, hoặc khi đơn giản là không biết tuần thai này cần bổ sung vi chất gì thêm
- **Pain moment:** Khi vừa nhận kết quả xét nghiệm tiểu đường thai kỳ hoặc thiếu sắt — bác sĩ cho tờ giấy hướng dẫn chung chung, gia đình mỗi người một ý kiến, Google cho kết quả mâu thuẫn nhau, và không biết bắt đầu từ đâu với từng bữa ăn thực tế
- **Why now:** (1) Vision AI đã đủ tốt để nhận diện thức ăn và ước tính kcal từ ảnh điện thoại; (2) LLM đủ mạnh để sinh thực đơn cá nhân hóa có cấu trúc từ thông tin y tế; (3) phụ nữ GenZ/Millennial đã quen dùng app theo dõi thai kỳ và health tracking; (4) thị trường app dinh dưỡng bà bầu Việt Nam chưa có player mạnh
- **Access path:** Cộng đồng mẹ bầu trên Facebook/Zalo (group "Mang thai lần đầu" 500k+ members, "Hội mẹ bỉm sữa"); phòng khám sản tư nhân tại TP.HCM và Hà Nội; KOL/influencer cộng đồng mẹ bầu trên TikTok/Instagram

**One-sentence description:**
> Mẹ bầu lần đầu 22–35 tuổi tại Việt Nam, đang bật/tắt Google mỗi ngày để biết "hôm nay ăn gì cho đủ chất và không gây hại" — đặc biệt khi vừa bị chẩn đoán tiểu đường thai kỳ hoặc thiếu máu.

---

## 3. Need Map (3 needs)

### Need #1 (priority) — Không biết ăn gì đúng khi có bệnh lý thai kỳ kèm theo

- **Statement (JTBD):** Khi tôi đang ở tam cá nguyệt thứ hai và vừa được chẩn đoán tiểu đường thai kỳ, tôi muốn biết chính xác nên ăn những món Việt nào mỗi ngày để kiểm soát đường huyết mà không bị thiếu chất cho bản thân và thai nhi, để tôi có thể tránh biến chứng và không còn lo lắng về từng quyết định bữa ăn.
- **Current workaround:** Hỏi bác sĩ (thường chỉ nhận được hướng dẫn 1 trang chung chung), tra Google (thông tin mâu thuẫn và không theo ngữ cảnh Việt Nam), hỏi group mẹ bầu (kinh nghiệm cá nhân không đảm bảo về y tế), nhờ người thân nấu theo kinh nghiệm dân gian
- **Pain signal:** Anxiety cao sau mỗi bữa ăn ("không biết mình ăn thế này có sao không"); rủi ro y tế thực sự nếu đường huyết không kiểm soát tốt (ảnh hưởng thai nhi); mất 15–30 phút/ngày tra cứu thông tin mâu thuẫn
- **Evidence / proxy evidence:**
  - Tỷ lệ tiểu đường thai kỳ tại VN: ~20–25% (Bệnh viện Phụ sản Trung ương, 2022)
  - Thiếu máu thiếu sắt: ~40% phụ nữ mang thai tại VN (WHO Southeast Asia data)
  - Group "Mẹ bầu Việt Nam" Facebook: 500k+ thành viên, top posts hằng tuần là câu hỏi "mang thai tiểu đường ăn gì được?" và "thiếu máu nên ăn gì?"
  - MyFitnessPal — 200M+ users toàn cầu nhưng không có chế độ thai kỳ theo giai đoạn, database món Việt rất nghèo
- **Why underserved:** Dietitian chuyên thai kỳ rất thiếu tại VN và chi phí cao (500k–1.5M VND/buổi); bác sĩ sản không đủ thời gian tư vấn dinh dưỡng chi tiết trong 10–15 phút khám; không có app nào hiểu đồng thời giai đoạn thai kỳ + bệnh lý cụ thể + ẩm thực Việt

---

### Need #2 — Không biết mình đã ăn đủ vi chất chưa sau mỗi bữa

- **Statement (JTBD):** Khi tôi ăn xong một bữa, tôi muốn biết ngay liệu mình đã nạp đủ sắt, folate, canxi và DHA cho tuần thai này chưa, để tôi có thể điều chỉnh bữa tiếp theo một cách chủ động trước khi tình trạng thiếu hụt xảy ra và hiện ra trong kết quả xét nghiệm lần sau.
- **Current workaround:** Không theo dõi gì cả (đa số); đọc nhãn thực phẩm đóng gói (không áp dụng cho món nấu tại nhà); nhập tay từng nguyên liệu vào app (quá tốn thời gian → bỏ sau 2–3 ngày)
- **Pain signal:** Thiếu vi chất thường phát hiện muộn qua xét nghiệm định kỳ (mỗi 4–8 tuần); cảm giác lo lắng và thiếu kiểm soát; barrier nhập liệu cao khiến không ai duy trì được thói quen tracking
- **Evidence / proxy evidence:**
  - App dinh dưỡng có tỷ lệ retention D30 rất thấp (~5–10%) — partially do barrier nhập liệu thủ công (App Store reviews của Cronometer, FatSecret)
  - Ứng dụng photo-logging như Lose It! báo cáo tăng retention 2–3x so với text-only logging
  - Nhu cầu vi chất thai kỳ thay đổi đáng kể theo trimester (sắt tăng từ 18mg → 27mg/ngày ở T2-T3 theo WHO)
- **Why underserved:** Không có app nào map nhu cầu vi chất theo tuần thai cụ thể cho người Việt; barrier nhập liệu của app hiện tại quá cao; photo kcal estimation cho món Việt (bún bò, phở, cơm tấm) chưa được làm tốt

---

### Need #3 — Gợi ý thực đơn không thực tế với ẩm thực Việt hàng ngày

- **Statement (JTBD):** Khi tôi nhận được gợi ý thực đơn, tôi muốn được gợi ý những món Việt quen thuộc mà tôi thực sự có thể nấu tại nhà hoặc mua tại chợ địa phương hay quán cơm tấm, để tôi có thể theo kế hoạch mà không phải tìm nguyên liệu lạ hay tốn thêm thời gian và tiền bạc.
- **Current workaround:** Bỏ qua gợi ý của app, tự nấu theo thói quen cũ và cộng thêm viên supplement cho chắc
- **Pain signal:** Compliance thấp → hiệu quả dinh dưỡng thực tế kém dù đã có plan; tiền mua supplement không cần thiết do thiếu thông tin cụ thể về thực phẩm
- **Evidence / proxy evidence:**
  - Reviews tiêu cực về app dinh dưỡng quốc tế trên CH Play VN thường đề cập "không có món Việt", "toàn bánh mì bơ với salad"
  - Database thực phẩm Việt trong USDA FoodData Central: rất hạn chế (thiếu bún bò, cơm tấm, canh chua cá lóc, bánh mì thịt nguội...)
- **Why underserved:** Phần lớn app dinh dưỡng được xây cho thị trường phương Tây; việc xây database kcal chuẩn cho ẩm thực Việt đòi hỏi on-the-ground data collection — không có incentive với player toàn cầu

---

## 4. Strategy Statement

```
Dành cho phụ nữ mang thai lần đầu và đang cho con bú tại Việt Nam (22–35 tuổi, có smartphone)
đang gặp khó khăn trong việc biết nên ăn gì ở từng giai đoạn thai kỳ cụ thể khi đồng thời
phải quản lý các bệnh lý thai kỳ (tiểu đường, thiếu máu, cao huyết áp),

sản phẩm của chúng tôi giúp họ tuân theo một kế hoạch thực đơn Việt Nam cá nhân hóa theo giai đoạn, có nền tảng y khoa, phù hợp văn hóa và dễ dàng theo dõi,

thông qua thực đơn hàng ngày được AI tạo ra, thích ứng theo tuần thai + tình trạng sức khỏe +
sở thích ẩm thực cá nhân, cùng với tính năng tự động tính kcal và vi chất từ ảnh bữa ăn (không cần nhập tay), khác với các app dinh dưỡng chung chung (MyFitnessPal, Cronometer) không có giao thức thai kỳ hay database thực phẩm Việt, hoặc các tờ hướng dẫn từ bác sĩ chỉ mang tính chung chung, vì chúng tôi có thể tận dụng bộ dữ liệu ground-truth ngày càng mở rộng về món Việt với bản đồ dinh dưỡng đặc thù thai kỳ, kết hợp với vision AI được huấn luyện trên ảnh thực phẩm Việt do người dùng đóng góp — tạo ra một tài sản mà không có app toàn cầu nào sẽ xây dựng.
```

---

## 5. Moat Hypothesis

**Moat mechanism:** Domain-learning flywheel + Data compounding

Nếu chúng tôi deploy với 10,000 mẹ bầu Việt Nam qua các giai đoạn và bệnh lý khác nhau, những điều sau cải thiện có hệ thống:

1. **Vietnamese pregnancy food database ngày càng chính xác hơn** — mỗi ảnh bữa ăn người dùng chụp + phản hồi ("đây là bún bò không có huyết") tạo ground truth cho vision AI, điều không có app toàn cầu nào có động cơ xây dựng riêng cho VN
2. **Menu recommendations ngày càng có compliance cao hơn** — khi biết người dùng ở Hà Nội hay TP.HCM, có hay không có bếp ở nhà, thích nước mắm hay tương — model học được preference distribution và gợi ý đúng hơn → người dùng follow được → outcome tốt hơn → word-of-mouth trong cộng đồng mẹ bầu
3. **Protocol bệnh lý ngày càng được calibrate với dữ liệu thực tế người Việt** — nếu có thêm feedback từ xét nghiệm định kỳ (đường huyết, hemoglobin), model có thể adjust menu recommendation theo outcome thực tế, tiến đến credibility lâm sàng

**Why competitors cannot easily replicate this:**
- Global apps (MyFitnessPal, Ovia) không có incentive xây Vietnamese food DB đủ depth cho pregnancy nutrition
- Xây ground truth kcal/nutrient data cho món Việt đòi hỏi cộng đồng người dùng trong nước + dietitian review — không thể mua hay scrape
- Trust trong cộng đồng mẹ bầu Việt Nam được xây dựng qua peer referral trong group Zalo/Facebook — first mover đáng tin có lợi thế phân phối khó replicate
- Bác sĩ/phòng khám chỉ recommend tool mà họ quen và đã thấy outcome tốt — switching cost cao sau khi được embed vào workflow khám thai

---

## 6. Initial TAM / SAM / SOM view

| Layer | Estimate | Key assumptions | Confidence |
|---|---|---|---|
| **TAM** | $3–5B/năm | ~130 triệu ca sinh/năm toàn cầu; 40% ở các thị trường có thể tiếp cận qua smartphone; giả định $5/tháng × 12 tháng × độ phủ 50% trong giai đoạn mang thai + cho con bú | Thấp |
| **SAM** | $80–150M/năm | VN: 1.4M births/year × 30% early adopter × $4/month × 10 months avg = ~$17M; mở rộng SEA 3 thị trường (Thailand, Philippines, Indonesia): thêm ~5M births × 20% × $4/month × 10 months = ~$40M; tổng có thể reach $80–150M/year | Medium |
| **SOM** | $600K–1.2M ARR (18 tháng) | 15.000–25.000 người dùng trả phí tại VN; $4/month average; đạt được qua 8–12 phòng khám sản tư nhân + community activation; churn ~5%/month | Low–Medium |

**Top 3 unknowns requiring further research:**

1. **Willingness to pay thực tế tại VN:** Bao nhiêu % mẹ bầu VN chấp nhận trả tiền cho app dinh dưỡng (vs. free với ads)? Ngưỡng giá nào chấp nhận được? *(Chưa có data — cần in-depth interview 30–50 người)*
2. **Accuracy của photo-based kcal estimation với món Việt:** Vision AI hiện tại (Google Food Vision, Calorie Mama) đạt độ chính xác bao nhiêu với bún bò, phở, cơm tấm, canh? Sai số chấp nhận được trong pregnancy context là bao nhiêu? *(Cần benchmark test)*
3. **Điều kiện để bác sĩ sản recommend app:** Bác sĩ cần gì để tin tưởng và chủ động giới thiệu app cho bệnh nhân? Clinical validation? Pilot data? Cơ chế hoa hồng? *(Cần phỏng vấn 10–15 bác sĩ sản tư nhân)*

**Judgment:**
- [x] Đáng theo đuổi, nhưng cần validate khả năng chấp nhận trả tiền và con đường đối tác lâm sàng trước khi xây dựng sản phẩm hoàn chỉnh
- [ ] Đáng theo đuổi nhưng chưa phải lúc này
- [ ] Không đáng theo đuổi với cách định hình hiện tại

> **Lý do:** Need #1 là need thật và gắn với consequence y tế rõ ràng. Thị trường VN đủ lớn cho giai đoạn đầu. Tuy nhiên, toàn bộ SOM assumption phụ thuộc vào willingness to pay và khả năng clinic adoption — cả hai đều là unknown cần validate trước khi đầu tư vào build.

---

## 7. Positioning Note (2 sentences)

**What we are:**
> Trợ lý dinh dưỡng AI cá nhân hóa đầu tiên cho mẹ bầu và mẹ cho con bú tại Việt Nam — hiểu đúng từng tuần thai, từng bệnh lý kèm theo, và đề xuất thực đơn từ món Việt quen thuộc với tracking tự động qua ảnh bữa ăn.

**What we are not / not yet:**
> Chúng tôi không phải bác sĩ dinh dưỡng và không thay thế tư vấn y tế chuyên sâu; trong giai đoạn đầu, chúng tôi chưa tích hợp với dữ liệu xét nghiệm từ bệnh viện hay đưa ra chỉ định điều trị.

---

## 8. Self-assessment before Day 17

**Mắt xích yếu nhất hiện tại:**
> **Evidence trong Need Map** — phần lớn proxy evidence dựa vào số liệu dịch tễ học và observation từ social media, chưa có primary research (phỏng vấn trực tiếp mẹ bầu). Need #2 và Need #3 cần được validate bằng user interview thực tế trước khi chốt thứ tự ưu tiên.

**Open questions muốn khám phá ở Day 17:**

1. Friction point thực sự của photo-logging là gì? Mẹ bầu có chụp ảnh bữa ăn mỗi ngày không, hay đây là assumption của team? Cần test với prototype nhanh.
2. Với bệnh lý thai kỳ (tiểu đường thai kỳ), ai là người ra quyết định thực sự — bản thân mẹ bầu, hay bác sĩ phải "kê đơn" app thì mới dùng? Điều này ảnh hưởng hoàn toàn đến go-to-market strategy.
3. MVP đúng nhất là gì — nên build menu generation trước hay photo kcal tracking trước? Cái nào validate được core assumption nhanh hơn trong 2 tuần đầu?

---

## AI Critique Log (Transparency)

**Structured Critique đã chạy:**
- Issue phát hiện: "Need #2 (photo kcal tracking) là feature request trá hình" — *Team accept partial*: Need được reframe thành "muốn biết đã đủ vi chất chưa" (outcome), photo tracking chỉ là approach trong Strategy Statement, không phải need
- Issue phát hiện: "Moat mechanism chưa có cơ chế compound rõ" — *Team accept*: Đã thêm cơ chế cụ thể (user photo → ground truth DB → better estimation → higher retention → more users)
- Issue phát hiện: "SOM assumption quá optimistic về clinic adoption" — *Team accept*: Đã đánh Confidence là Low–Medium và ghi rõ trong Unknowns

**Facts vs. Assumptions:**
- **Facts** (có nguồn): Tỷ lệ tiểu đường thai kỳ VN ~20–25%; thiếu máu ~40%; group mẹ bầu Facebook 500k+ members; nhu cầu sắt tăng T2-T3 (WHO)
- **Assumptions**: Willingness to pay $4/month; 30% early adopter rate; clinic adoption feasible; photo logging retention benefit
- **Unknowns**: Xem mục 6 Top 3 unknowns

