# Pitch Deck: NestAI

*Cấu trúc: 9 Slides (Trình bày trong 5 - 10 phút)*

---

## Slide 1: Tiêu đề (Title)
- **Tiêu đề lớn:** NestAI - Trợ lý Dinh dưỡng AI cho Mẹ bầu & Sau sinh
- **Tagline:** *"Biến nỗi lo dinh dưỡng thai kỳ thành sự an tâm tuyệt đối, chỉ trong 10 giây."*
- **Hình ảnh minh hoạ:** Giao diện app (mockup trên iPhone) với thông báo dinh dưỡng an toàn cho mẹ bầu.
- **Presenter:** [Tên người trình bày / Đại diện team]

---

## Slide 2: Vấn đề (The Problem) - Sự đứt gãy thông tin
- **Bối cảnh:** Phụ nữ mang thai mất hàng giờ tra cứu Google mỗi ngày vì sợ "ăn sai sẽ hại thai nhi".
- **Pain point chính:**
  - Bác sĩ sản: Quá bận rộn để thiết kế thực đơn chi tiết mỗi ngày.
  - Các App quốc tế (MyFitnessPal): Không hiểu được ẩm thực Việt (bún, phở, đồ xào) và không có chuyên môn y khoa cho mẹ bầu.
- **Hệ quả:** Dẫn đến sự lo âu tột độ và tỷ lệ không tuân thủ dinh dưỡng cao.

---

## Slide 3: Tác động xã hội (The Impact)
- **Thực trạng báo động:** 20% - 25% phụ nữ mang thai tại Việt Nam mắc Đái tháo đường thai kỳ hoặc thiếu máu (tỷ lệ tăng gấp nhiều lần so với 20 năm trước).
- **Thị trường:** Mẹ bầu Millennial và GenZ sẵn sàng chi trả mức cao để bảo đảm sức khỏe tốt nhất cho con.
- **Thông điệp:** Đây không chỉ là bài toán tiện ích, đây là bài toán y tế cấp thiết.

---

## Slide 4: Giải pháp (The Solution) - NestAI
- **NestAI là gì?** Trợ lý dinh dưỡng tự động sinh thực đơn và đo lường vi chất tức thì, được thiết kế riêng cho phụ nữ mang thai tại Việt Nam.
- **Chuẩn Y Khoa:** Nhúng trực tiếp phác đồ của Bộ Y tế (Hướng dẫn quản lý đái tháo đường thai kỳ & dinh dưỡng bà mẹ) vào cơ sở dữ liệu ẩm thực Việt Nam.
- **Mục tiêu:** Chuyển đổi trạng thái của mẹ bầu từ *"đoán mò, sợ hãi"* thành *"hoàn toàn yên tâm"*.

---

## Slide 5: Công nghệ (The Tech) - Tính năng cốt lõi: Smart Scan
- **Tính năng:** Chụp ảnh bữa ăn để phân tích calo & vi chất ngay lập tức.
- **Công nghệ (Sự khác biệt):** Thay vì tốn kém huấn luyện model Vision truyền thống, NestAI ứng dụng kiến trúc **LLM Vision + Mapping Database**.
- **Cách hoạt động:** 
  - AI nhận diện món ăn trong 2 giây (Zero-Hallucination Vision).
  - Tự động map kết quả với bộ dữ liệu chuẩn y khoa để tính lượng đường, đạm, béo.
  - Phát cảnh báo nếu món ăn vượt giới hạn của phác đồ bệnh lý.

---

## Slide 6: Công nghệ (The Tech) - Kiến trúc AI phân tách (Multi-Agent)
- Không dùng 1 LLM "ôm đồm" mọi thứ (dễ bị ảo giác y tế). Chúng tôi chia nhỏ thành:
  1. **Nori Chatbot (RAG):** Rút trích dữ liệu từ bệnh viện Vinmec và Bộ Y tế để giải đáp thắc mắc thai kỳ an toàn, chống ảo giác (Hallucination).
  2. **Food Optimizer:** Tự động cá nhân hóa và tối ưu thực đơn theo ngân sách và nhu cầu vi chất bị thiếu hụt của người dùng.
- **Bảo mật:** Tích hợp AI Playbook và chống Prompt Injection từ cấp hệ thống.

---

## Slide 7: Cảm xúc (The Emotion) - Gắn kết gia đình
- **Hành trình sẻ chia:** NestAI không để mẹ bầu phải cô đơn trong thai kỳ.
- **Tính năng:** Mẹ có thể lên thực đơn bằng AI và nhấn nút **"Gửi nhiệm vụ cho Bố"**. 
- **Giá trị:** Bố nhận được danh sách đi chợ và công thức nấu ăn. Áp lực dinh dưỡng trở thành một hành trình yêu thương được san sẻ.

---

## Slide 8: Kết quả & Traction (The Results)
- **Evaluation Evidence (Kết quả test thực tế):**
  - **Độ chính xác (Smart Scan Accuracy):** 92% nhận diện đúng món ăn Việt.
  - **Tốc độ phản hồi:** 2.5s - 3s cho mỗi lần phân tích bữa ăn.
- **User Testing (Tín hiệu thị trường):**
  - **Tỷ lệ tuân thủ (Compliance Rate):** 60% (vượt mức trung bình của các app sức khoẻ).
  - **Retention D3:** 80%.
  - **Aha Moment:** Tạo "Wow effect" cực mạnh khi người dùng trải nghiệm Smart Scan lần đầu.

---

## Slide 9: Mô hình Kinh doanh (Go-to-Market Strategy)
- **B2B2C (Đối tác Y tế):** Phân phối ứng dụng qua các phòng khám sản, bệnh viện phụ sản lớn như một tiện ích giá trị gia tăng kèm theo các gói khám thai.
- **B2C (Direct):** Tiếp cận mẹ bầu qua Social Media, Freemium model (miễn phí cơ bản, trả phí Subscription cho tính năng Smart Scan và Tối ưu thực đơn cá nhân hoá AI).
- **LTV/CAC:** Dự kiến tỷ lệ đạt ~4.2x với thời gian hoàn vốn (Payback period) chỉ trong 3 tháng.

