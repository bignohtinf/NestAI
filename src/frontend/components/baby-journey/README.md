# Hành Trình Thai Kỳ - Baby Journey Components

## 📱 Components

### PregnancyWeekCarousel
Carousel interactive hiển thị 40 tuần thai kỳ với sự phát triển của bé.

#### Features
- 🎯 **40 Week Cards**: Hiển thị tất cả 40 tuần từ lúc mang thai đến sinh
- 🎨 **Gradient Colors**: Màu sắc ấm cúng biến đổi theo tuần (hồng → cam → tím)
- 🖱️ **Interactive Selection**: Click vào card để xem chi tiết, auto-center tuần hiện tại
- ⌨️ **Keyboard Navigation**: Dùng ← → arrow keys để di chuyển
- 💬 **Hover Details**: Hiển thị mô tả khi hover vào card
- 📊 **Progress Indicator**: Thanh tiến độ trực quan theo tuần
- 📱 **Responsive Design**: Hoạt động tốt trên mobile, tablet, desktop
- ✨ **Smooth Animations**: Transitions mượt khi chọn/scroll

#### Usage

```tsx
import { PregnancyWeekCarousel } from '@/components/baby-journey/pregnancy-week-carousel';

export default function MyComponent() {
  const currentWeek = 24;
  
  return (
    <PregnancyWeekCarousel 
      currentWeek={currentWeek}
      onWeekSelect={(week) => {
        console.log(`Selected week: ${week}`);
      }}
    />
  );
}
```

#### Props

```typescript
interface PregnancyWeekCarouselProps {
  currentWeek: number;           // Tuần hiện tại (1-40)
  onWeekSelect?: (week: number) => void;  // Callback khi chọn tuần khác
}
```

#### Data Structure

Mỗi tuần có thông tin:
- **icon**: Emoji đại diện sự phát triển (🌱, 🫐, 👁️, v.v.)
- **color**: Gradient color (from-rose-200 to-pink-200, v.v.)
- **description**: Mô tả sự phát triển của bé
- **size**: Kích thước tương đương (hạt tiêu, quả chanh, v.v.)
- **weight**: Cân nặng ước tính

#### Styling

Component sử dụng Tailwind CSS + Custom CSS animations:

- **Hover Effect**: Card phóng to 1.05x → 1.1x
- **Selected State**: Scale 1.1x + ring effect
- **Smooth Scrolling**: Snap-scroll behavior
- **Dark Mode**: Tự động thích ứng với dark mode

#### Customization

Để tùy chỉnh màu sắc hoặc emoji, sửa mảng `weeklyData` trong component:

```typescript
const weeklyData: WeekData[] = [
  { 
    week: 1, 
    icon: '🌱',                    // Thay emoji
    color: 'from-rose-200 to-pink-200',  // Thay gradient color
    description: '...', 
    size: '...', 
    weight: '...' 
  },
  // ...
];
```

#### Colors Available

- **Trimester 1**: Rose → Pink → Fuchsia → Purple (🌱 → 👁️)
- **Trimester 2**: Blue → Cyan → Teal → Green → Lime → Yellow (💪 → 💛)
- **Trimester 3**: Orange → Rose → Pink → Fuchsia (✨ → 👶)

#### Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)  
- ✅ Safari (latest)
- ✅ Mobile browsers

#### Accessibility

- ⌨️ Keyboard navigation (Arrow keys)
- ♿ Semantic HTML (role, tabIndex)
- 🎨 Sufficient color contrast
- 🔊 Screen reader friendly

---

## 📦 Integration

Component đã được tích hợp vào:
- `baby-journey-tracker.tsx` - PregnancyJourney section

---

## 🎨 Design Features

### Ấm Cúng & Hiện Đại
- Gradient colors từ hồng đến cam (maternal colors)
- Smooth animations không quá hiệu ứng
- Whitespace hợp lý
- Typography rõ ràng

### Mobile-First
- Horizontal scroll trên mobile
- Gradient overlays để indicate scrollable area
- Touch-friendly card sizes
- Responsive detail panel

### Interactive
- Instant feedback khi click
- Smooth scroll-to-center
- Visual feedback (scale, ring)
- Keyboard shortcuts

---

## 🚀 Performance

- Memoized component
- CSS transitions instead of JS animations
- Efficient scroll handling
- Minimal re-renders

---

## 📝 Notes

- Component hiện đang sử dụng simulated data, có thể thay bằng API data
- Icon/images có thể được thay thế bằng actual baby ultrasound images
- Description text có thể localize sang nhiều ngôn ngữ
- Detail panel có thể mở rộng với thêm thông tin (tips, exercises, v.v.)

