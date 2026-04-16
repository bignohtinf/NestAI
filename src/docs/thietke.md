# Dashboard Design - NextAI

## Sidebar Navigation Structure

### Shared Tabs (Cả bố và mẹ)

1. **🏠 Trang chủ** (`/`)
   - Home dashboard
   
2. **🍼 Hành Trình Của Bé** (`/baby-journey`)
   - Phát triển của bé
   - Mốc phát triển
   - Giống nhau cho cả bố và mẹ

3. **🔔 Thông báo** (`/notifications`)
   - Yêu cầu kết nối
   - Mốc phát triển
   - Giống nhau cho cả bố và mẹ

4. **🤖 Nori** (`/nori`)
   - Trợ lý AI
   - Giống nhau cho cả bố và mẹ

5. **⚙️ Quản trị** (`/admin`) - Admin only
   - Admin dashboard

---

## MẸ - Tabs riêng (Mother only)

### 📸 Smart Scan (`/smart-scan`)
- Chụp ảnh & Tính calo
- AI phân tích dinh dưỡng
- Tự động lưu vào nhật ký

### 🍽️ Dinh dưỡng (`/nutrition`)
- Gợi ý món ăn
- Khi nhấn vào 1 món → hiển thị các cửa hàng gần đó có món đó
- Breakdown dinh dưỡng
- AI gợi ý

### 🍼 Sữa & Bé (`/milk-baby-impact`)
- Milk Support Score theo ngày/tuần
- Theo dõi: ăn gì → bé ngủ / quấy
- Insight: "Sữa tốt hơn khi ăn cá + rau"
- Biểu đồ xu hướng

### 💪 Sức khỏe (`/health`)
- Milk Score
- Quick Stats
- Nutrition Tracker
- Daily Checklist

---

## BỐ - Tabs riêng (Father only)

### 📋 Checklist (`/checklist`)
- Mua gì
- Nấu gì
- Nhắc mẹ uống nước
- Alert: "Thiếu protein", "Chưa đủ calo"
- Progress bar

### 👨‍👩‍👧 Gia đình (`/family-status`)
- Tình trạng mẹ: dinh dưỡng, milk score
- Tình trạng bé: phản ứng, mood
- Insight: "Món A ảnh hưởng nhẹ"
- Radar của bố

### 🛒 Mua sắm (`/shopping`)
- Danh sách mua theo thực đơn
- Theo ngân sách
- AI gợi ý: "Combo 150k cho 2 ngày"
- Scan sản phẩm: có nên mua không

### 🍳 Nấu ăn (`/cooking`)
- Step-by-step nấu ăn
- Voice assistant: "Tiếp theo là gì?"
- Thay nguyên liệu
- UI tối giản, chữ to, dùng 1 tay

### 💰 Kinh phí (`/budget`)
- Chi tiêu tuần
- So sánh: planned vs actual
- Gợi ý: "Giảm 20% nếu thay món X"
- Biểu đồ chi tiêu

### 🎯 Nhiệm vụ (`/missions`)
- "Nấu 5 bữa/tuần"
- "Tiết kiệm 200k"
- Level: "Chồng chuẩn 5⭐"
- Progress bar

---

## Sidebar Items Summary

### Mother Sidebar
```
- 🏠 Trang chủ
- 🍽️ Dinh dưỡng (Smart Scan + Gợi ý)
- 💪 Sức khỏe (Sữa & Bé + Sức khỏe)
- 🍼 Hành Trình Của Bé
- 🔔 Thông báo
- 🤖 Nori
```

### Father Sidebar
```
- 🏠 Trang chủ
- 🛒 NutriMart (Mua sắm + Nấu ăn)
- 💰 Planner (Kinh phí + Nhiệm vụ)
- 🍼 Hành Trình Của Bé
- 🔔 Thông báo
- 🤖 Nori
```

### Admin Sidebar
```
- 🏠 Trang chủ
- ⚙️ Quản trị
```

---

## Implementation Notes

- Mỗi tab là 1 page riêng (`/smart-scan`, `/nutrition`, v.v.)
- Sidebar tự động hiển thị items dựa trên role
- Shared tabs (Baby Journey, Notifications, Nori) giống nhau cho cả bố và mẹ
- Sẽ có sự khác nhau sau khi fetch API (partnership data)
