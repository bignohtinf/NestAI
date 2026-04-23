# NestAI — Thiết kế App Mobile Flutter

> Phiên bản: 1.0 | Cập nhật: 2026-04-20  
> Dự án: A20-App-005 | Nền tảng: iOS & Android

---

## Mục lục

1. [Tổng quan App](#1-tổng-quan-app)
2. [Hệ thống Màu sắc & Design Tokens](#2-hệ-thống-màu-sắc--design-tokens)
3. [Typography](#3-typography)
4. [Spacing & Border Radius](#4-spacing--border-radius)
5. [Cấu trúc Navigation](#5-cấu-trúc-navigation)
6. [Thiết kế từng Màn hình](#6-thiết-kế-từng-màn-hình)
   - [Onboarding & Auth](#61-onboarding--auth)
   - [Dashboard Mẹ](#62-dashboard-mẹ)
   - [Dashboard Bố](#63-dashboard-bố)
   - [Nori AI Chatbot](#64-nori-ai-chatbot)
   - [Smart Scan](#65-smart-scan)
   - [Thực Đơn & Dinh Dưỡng](#66-thực-đơn--dinh-dưỡng)
   - [Sức Khỏe & Wellness](#67-sức-khỏe--wellness)
   - [Hành Trình Bé](#68-hành-trình-bé)
   - [NutriMart (Bố)](#69-nutrimart-bố)
   - [Planner (Bố)](#610-planner-bố)
   - [Profile & Cài đặt](#611-profile--cài-đặt)
7. [Kiến trúc Flutter](#7-kiến-trúc-flutter)
8. [Quản lý State](#8-quản-lý-state)
9. [Widget Library tùy chỉnh](#9-widget-library-tùy-chỉnh)
10. [Tích hợp API & Supabase](#10-tích-hợp-api--supabase)
11. [Platform-specific Notes](#11-platform-specific-notes)
12. [Accessibility & UX](#12-accessibility--ux)

---

## 1. Tổng quan App

### Mô tả
NestAI là ứng dụng chăm sóc gia đình thông minh dành cho các bậc phụ huynh sắp có em bé hoặc đang nuôi con nhỏ. App kết hợp AI để hỗ trợ dinh dưỡng, theo dõi sức khỏe và đồng hành cùng gia đình.

### Mục tiêu thiết kế Mobile
- **Ấm cúng & thân thiện**: Màu sắc warm, bo góc mềm mại, phù hợp tâm lý gia đình
- **Một tay sử dụng được**: Các CTA chính nằm vùng ngón cái (bottom 40% màn hình)
- **Tốc độ**: Màn hình chính load < 1.5s, chatbot phản hồi < 2s
- **Offline-first**: Dashboard & lịch sử có thể xem offline

### Người dùng mục tiêu
| Role | Đặc điểm | Nhu cầu chính |
|------|----------|---------------|
| Mẹ | Sau sinh, hay dùng 1 tay | Dinh dưỡng, sữa mẹ, sức khỏe |
| Bố | Muốn hỗ trợ tích cực | Mua sắm, nấu ăn, theo dõi gia đình |
| Cả hai | Kết nối partnership | Chia sẻ thông tin bé |

### Nền tảng & Yêu cầu tối thiểu
- **Flutter**: 3.19+ (Dart 3.3+)
- **iOS**: 15.0+
- **Android**: API 26+ (Android 8.0)
- **Màn hình**: 360dp – 428dp width (mobile), hỗ trợ tablet 600dp+

---

## 2. Hệ thống Màu sắc & Design Tokens

### Bảng màu chính

```dart
// lib/core/theme/app_colors.dart

class AppColors {
  // --- Primary: Warm Coral ---
  static const Color primary         = Color(0xFFC8564A);
  static const Color primaryLight    = Color(0xFFF7EBE9);
  static const Color primaryDark     = Color(0xFFAD3F34);
  static const Color primaryOnColor  = Color(0xFFFFFFFF);

  // --- Background & Surface ---
  static const Color background      = Color(0xFFFDF8F5); // Warm cream
  static const Color surface         = Color(0xFFFFFBF9); // Near-white warm
  static const Color surfaceVariant  = Color(0xFFF5EDE8); // Muted peach

  // --- Text ---
  static const Color textPrimary     = Color(0xFF3D2C28); // Warm dark
  static const Color textSecondary   = Color(0xFF6B4F4A); // Warm gray
  static const Color textMuted       = Color(0xFF9A8380); // Muted warm
  static const Color textOnPrimary   = Color(0xFFFFFFFF);

  // --- Borders & Dividers ---
  static const Color border          = Color(0xFFE8D5D0);
  static const Color divider         = Color(0xFFF0E0DA);

  // --- Semantic Colors ---
  static const Color success         = Color(0xFF4F9678); // Sage green
  static const Color successLight    = Color(0xFFE8F5EF);
  static const Color warning         = Color(0xFFD4874A); // Amber
  static const Color warningLight    = Color(0xFFFEF3E8);
  static const Color error           = Color(0xFFD4352A);
  static const Color errorLight      = Color(0xFFFDE8E7);
  static const Color info            = Color(0xFF4D7FB5);
  static const Color infoLight       = Color(0xFFEBF2FA);

  // --- Feature Colors ---
  static const Color noriPurple      = Color(0xFF7C4DAA); // Nori AI
  static const Color noriLight       = Color(0xFFF2EBF8);
  static const Color scanAmber       = Color(0xFFD4874A); // Smart Scan
  static const Color scanLight       = Color(0xFFFEF3E8);
  static const Color nutritionGreen  = Color(0xFF4F9678); // Nutrition
  static const Color nutritionLight  = Color(0xFFE8F5EF);
  static const Color wellnessRose    = Color(0xFFE8608A); // Wellness
  static const Color wellnessLight   = Color(0xFFFCE8EF);
  static const Color babyPink        = Color(0xFFE87898); // Baby Journey
  static const Color babyLight       = Color(0xFFFCEFF4);

  // --- Gradients ---
  static const LinearGradient gradientHero = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFC8564A), Color(0xFFD46458), Color(0xFFE07870)],
  );
  static const LinearGradient gradientNori = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF7C4DAA), Color(0xFF9B5FC5)],
  );
  static const LinearGradient gradientScan = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFD4874A), Color(0xFFE09558)],
  );
  static const LinearGradient gradientSage = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF4F9678), Color(0xFF5AAB89)],
  );

  // --- Dark Mode ---
  static const Color backgroundDark  = Color(0xFF2C1F1C);
  static const Color surfaceDark     = Color(0xFF3A2824);
  static const Color textPrimaryDark = Color(0xFFF5EDE8);
  static const Color borderDark      = Color(0xFF4D3530);
}
```

### Shadows

```dart
class AppShadows {
  static const List<BoxShadow> card = [
    BoxShadow(color: Color(0x0FB46450), blurRadius: 8, offset: Offset(0, 2)),
    BoxShadow(color: Color(0x08B46450), blurRadius: 3, offset: Offset(0, 1)),
  ];
  static const List<BoxShadow> cardHover = [
    BoxShadow(color: Color(0x1FB46450), blurRadius: 24, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x0FB46450), blurRadius: 8,  offset: Offset(0, 2)),
  ];
  static const List<BoxShadow> warm = [
    BoxShadow(color: Color(0x26C8564A), blurRadius: 20, offset: Offset(0, 4)),
  ];
  static const List<BoxShadow> deep = [
    BoxShadow(color: Color(0x19B46450), blurRadius: 32, offset: Offset(0, 8)),
    BoxShadow(color: Color(0x0FB46450), blurRadius: 16, offset: Offset(0, 4)),
  ];
}
```

---

## 3. Typography

### Font: **Inter** (Google Fonts)

```dart
// lib/core/theme/app_typography.dart
// Thêm dependency: google_fonts: ^6.x

import 'package:google_fonts/google_fonts.dart';

class AppTypography {
  static TextStyle get displayHero => GoogleFonts.inter(
    fontSize: 36, fontWeight: FontWeight.w700,
    letterSpacing: -1.0, height: 1.1,
    color: AppColors.textPrimary,
  );
  static TextStyle get heading1 => GoogleFonts.inter(
    fontSize: 28, fontWeight: FontWeight.w700,
    letterSpacing: -0.5, height: 1.2,
  );
  static TextStyle get heading2 => GoogleFonts.inter(
    fontSize: 22, fontWeight: FontWeight.w700,
    letterSpacing: -0.3, height: 1.25,
  );
  static TextStyle get heading3 => GoogleFonts.inter(
    fontSize: 18, fontWeight: FontWeight.w600,
    letterSpacing: -0.2, height: 1.3,
  );
  static TextStyle get bodyLarge => GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w400,
    height: 1.5,
  );
  static TextStyle get body => GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w400,
    height: 1.5,
  );
  static TextStyle get bodyMedium => GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w500,
    height: 1.5,
  );
  static TextStyle get caption => GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w400,
    height: 1.4,
  );
  static TextStyle get captionMedium => GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w500,
    letterSpacing: 0.1, height: 1.4,
  );
  static TextStyle get badge => GoogleFonts.inter(
    fontSize: 11, fontWeight: FontWeight.w600,
    letterSpacing: 0.3, height: 1.3,
  );
  static TextStyle get button => GoogleFonts.inter(
    fontSize: 15, fontWeight: FontWeight.w600,
    letterSpacing: 0.1,
  );
  static TextStyle get navLabel => GoogleFonts.inter(
    fontSize: 11, fontWeight: FontWeight.w500,
    letterSpacing: 0.2,
  );
}
```

---

## 4. Spacing & Border Radius

```dart
class AppSpacing {
  static const double xs   = 4.0;
  static const double sm   = 8.0;
  static const double md   = 12.0;
  static const double base = 16.0;
  static const double lg   = 20.0;
  static const double xl   = 24.0;
  static const double xl2  = 32.0;
  static const double xl3  = 40.0;
  static const double xl4  = 48.0;

  // Horizontal page padding
  static const EdgeInsets pagePadding = EdgeInsets.symmetric(horizontal: 16.0);
  static const EdgeInsets sectionPadding = EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0);
}

class AppRadius {
  static const double micro   = 4.0;
  static const double sm      = 8.0;
  static const double md      = 12.0;
  static const double lg      = 16.0;
  static const double xl      = 20.0;
  static const double xl2     = 24.0;
  static const double pill    = 999.0;

  static BorderRadius get microR   => BorderRadius.circular(micro);
  static BorderRadius get smR      => BorderRadius.circular(sm);
  static BorderRadius get mdR      => BorderRadius.circular(md);
  static BorderRadius get lgR      => BorderRadius.circular(lg);
  static BorderRadius get xlR      => BorderRadius.circular(xl);
  static BorderRadius get pillR    => BorderRadius.circular(pill);
}
```

---

## 5. Cấu trúc Navigation

### App Navigation Stack

```
SplashScreen
└── AuthGate (kiểm tra session Supabase)
    ├── OnboardingScreen (lần đầu)
    │   ├── OnboardingPage 1 — "Chào mừng"
    │   ├── OnboardingPage 2 — "Tính năng AI"
    │   └── OnboardingPage 3 — "Bắt đầu ngay"
    ├── LoginScreen
    ├── SignupScreen
    ├── RoleSelectionScreen
    └── MainShell (authenticated)
        ├── BottomNavBar (5 tabs)
        │   ├── Tab 0: HomeScreen (role-based)
        │   ├── Tab 1: NoriChatScreen
        │   ├── Tab 2: ScanScreen (mẹ) / NutriMartScreen (bố)
        │   ├── Tab 3: NutritionScreen (mẹ) / PlannerScreen (bố)
        │   └── Tab 4: ProfileScreen
        └── Các màn hình push (Navigator.push)
            ├── WellnessScreen
            ├── BabyJourneyScreen
            ├── NotificationsScreen
            ├── FoodDetailScreen
            └── QuestDetailScreen
```

### Bottom Navigation — thiết kế

```
┌─────────────────────────────────────────────┐
│  [🏠 Trang chủ] [✨ Nori] [📷 Scan] [🥗 Dinh dưỡng] [👤 Tôi]  │  ← Mẹ
│  [🏠 Trang chủ] [✨ Nori] [🛒 Mart] [📅 Planner] [👤 Tôi]     │  ← Bố
└─────────────────────────────────────────────┘
```

**Specs BottomNavBar:**
- Height: 64dp + safe area inset
- Icon size: 24dp
- Label: 11dp Inter Medium
- Active: icon màu `primary`, text màu `primary`, background `primaryLight` pill
- Inactive: icon & text màu `textMuted`
- Floating style: bo góc trên 20dp, shadow nhẹ

---

## 6. Thiết kế từng Màn hình

### 6.1 Onboarding & Auth

#### SplashScreen
```
┌──────────────────────────┐
│          [Logo]          │
│         NestAI           │
│    (animate fade-in)     │
│                          │
│    Background: gradient  │
│    warm coral → peach    │
└──────────────────────────┘
```
- Duration: 2s → auto navigate
- Logo animation: scale 0.8 → 1.0 với `ElasticOutCurve`

#### OnboardingScreen (PageView)
```
Page 1                    Page 2                    Page 3
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  [Illustration]│          │  [Illustration]│          │  [Illustration]│
│              │          │              │          │              │
│ Chào mừng    │          │ AI đồng hành │          │ Bắt đầu      │
│ đến NestAI   │          │ 24/7         │          │ hành trình   │
│              │          │              │          │              │
│ Theo dõi mẹ  │          │ Nori trả lời │          │   [Đăng ký]  │
│ và bé với    │          │ mọi câu hỏi  │          │   [Đăng nhập]│
│ trí tuệ AI   │          │ về dinh dưỡng│          │              │
│ ● ○ ○       │          │ ○ ● ○       │          │ ○ ○ ●       │
└──────────────┘          └──────────────┘          └──────────────┘
```

**Illustrations**: Lottie animations (`.json`) — phong cách flat, warm color palette

#### LoginScreen
```
┌──────────────────────────┐
│  Background: warm cream  │
│  Blob decorations        │
│                          │
│    [Heart Icon - coral]  │
│    Chào mừng trở lại     │
│    Đăng nhập tài khoản   │
│                          │
│  ┌────────────────────┐  │
│  │ Email              │  │
│  └────────────────────┘  │
│  ┌──────────────── 👁 ┐  │
│  │ Mật khẩu           │  │
│  └────────────────────┘  │
│                          │
│  Quên mật khẩu?          │
│                          │
│  ┌────────────────────┐  │
│  │   ĐĂNG NHẬP        │  │  ← gradient coral
│  └────────────────────┘  │
│                          │
│  Chưa có tài khoản?      │
│  [Đăng ký ngay]          │
└──────────────────────────┘
```

**Widgets**: `TextFormField` custom style, `GradientButton`, Form validation với `flutter_form_builder`

#### RoleSelectionScreen
```
┌──────────────────────────┐
│  Bạn là ai trong gia đình│
│                          │
│  ┌────────┐  ┌────────┐  │
│  │   🤱   │  │   👨   │  │
│  │  Mẹ   │  │  Bố   │  │
│  │       │  │       │  │
│  └────────┘  └────────┘  │
│  (tap to select, scale)  │
│                          │
│  Mã kết nối gia đình:    │
│  ┌────────────────────┐  │
│  │ Nhập mã partner    │  │
│  └────────────────────┘  │
│  [TẠO MÃ MỚI]           │
│                          │
│  [TIẾP TỤC]             │
└──────────────────────────┘
```

---

### 6.2 Dashboard Mẹ

```
┌──────────────────────────┐
│ [Header: NestAI logo] [🔔]│
│                          │
│ ┌──────────────────────┐ │
│ │  Chào buổi sáng ☀️   │ │  ← Hero card (gradient coral)
│ │  Xin chào, Lan! 🤱   │ │
│ │  Tuần 8 sau sinh     │ │
│ │  ⭐ 1.250 điểm       │ │
│ │  [Nori AI →] [Scan→] │ │
│ └──────────────────────┘ │
│                          │
│  Tính năng nổi bật       │
│  ┌──────┐ ┌──────┐       │
│  │ ✨   │ │ 📷   │       │
│  │Nori │ │Scan │       │  ← 2x2 feature grid
│  └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐       │
│  │ 🥗   │ │ ❤️   │       │
│  │Menu │ │Health│       │
│  └──────┘ └──────┘       │
│                          │
│ ┌───────────┐ ┌────────┐ │
│ │ Điểm Sữa  │ │Hôm nay│ │  ← Metrics row
│ │   [Gauge] │ │[Stats]│ │
│ └───────────┘ └────────┘ │
│                          │
│  Nhiệm vụ hôm nay        │
│  ┌──────────────────────┐ │
│  │ 🎯 [Quest 1] [+50đ] │ │
│  └──────────────────────┘ │
│  ┌──────────────────────┐ │
│  │ 🎯 [Quest 2] [+30đ] │ │
│  └──────────────────────┘ │
└──────────────────────────┘
```

**Widgets dùng:**
- `SliverAppBar` với gradient hero card (collapsible khi scroll)
- `GridView.count` 2 cột cho feature cards
- `MilkScoreGauge` — custom `CustomPainter` vẽ arc
- `QuickStatsRow` — `Row` 4 items với icons
- `QuestCard` — `Card` với leading icon, trailing reward badge

---

### 6.3 Dashboard Bố

```
┌──────────────────────────┐
│ [Header] [🔔]            │
│                          │
│ ┌──────────────────────┐ │
│ │  Xin chào, Nam! 👨   │ │  ← Hero card (gradient teal)
│ │  Gia đình cần bạn    │ │
│ │  ⭐ 890 điểm         │ │
│ └──────────────────────┘ │
│                          │
│  Việc cần làm hôm nay    │
│  [2/5 hoàn thành] ████░░ │  ← Progress bar
│  ☑ Mua cá hồi [✓]        │
│  ☐ Nấu canh gà           │
│  ☐ Nhắc mẹ uống nước     │
│  ⚠ Thiếu protein!        │
│                          │
│  Tình trạng Gia đình      │
│  ┌──────┐    ┌──────┐    │
│  │ Mẹ  │    │ Bé   │    │
│  │ 82  │    │ 😊   │    │
│  │điểm │    │tốt  │    │
│  └──────┘    └──────┘    │
│                          │
│  Ngân sách Tháng         │
│  Đã chi: 1.2M / 2M       │
│  ████████░░░░  60%       │
└──────────────────────────┘
```

---

### 6.4 Nori AI Chatbot

```
┌──────────────────────────┐
│ ← [✨ Nori]    [Online●] │  ← AppBar gradient tím
│ Trợ lý AI của bạn        │
│                          │
│ ┌──────────────────────┐ │
│ │ ✨ Xin chào Lan! 💕  │ │  ← Bot bubble (cream)
│ │ Tôi là Nori, sẵn     │ │
│ │ sàng hỗ trợ bạn...   │ │
│ └──────────────────────┘ │
│                   [👤]   │
│        ┌────────────────┐│
│        │ Tôi nên ăn gì? ││  ← User bubble (coral)
│        └────────────────┘│
│ [✨]                     │
│ ┌──────────────────────┐ │
│ │ Để tăng sữa mẹ nên  │ │  ← Bot bubble
│ │ ✅ Cá hồi, trứng     │ │
│ │ ✅ Rau xanh đậm      │ │
│ └──────────────────────┘ │
│                          │
│ ● ● ● (loading dots)     │
│──────────────────────────│
│ Gợi ý nhanh:             │
│ [🥗 Dinh dưỡng] [👶 Bé]  │  ← Chip row (scrollable)
│ [🍳 Công thức] [💊 Sức kh]│
│                          │
│ ┌────────────────┐ [▶]  │  ← Input + Send button
│ │ Nhập câu hỏi...│      │
│ └────────────────┘      │
└──────────────────────────┘
```

**Đặc điểm kỹ thuật:**
- `ListView.builder` + `ScrollController` auto-scroll to bottom
- `AnimatedSwitcher` cho loading indicator (3 dots bounce)
- Input: `TextField` với `InputDecoration` custom, border radius 20dp
- Bubble alignment: `CrossAxisAlignment.end/start`
- Tin nhắn bot hỗ trợ **Markdown** render (`flutter_markdown`)
- `QuickSuggestionsBar`: `SingleChildScrollView` ngang, chips

---

### 6.5 Smart Scan

```
┌──────────────────────────┐
│ ← Quét Dinh Dưỡng        │  ← AppBar gradient amber
│ AI phân tích từ ảnh       │
│                          │
│  [Tab: 📷 Chụp ảnh | 🥗 Gợi ý]
│                          │
│ --- Khi chưa có ảnh ---  │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │    [📷 Icon lớn]     │ │  ← Drop zone (dashed border)
│ │  Chụp ảnh món ăn     │ │
│ │  AI tự phân tích     │ │
│ │  calo & dinh dưỡng   │ │
│ │                      │ │
│ │ [📷 CHỤP]  [📂 TẢI] │ │  ← 2 buttons
│ └──────────────────────┘ │
│                          │
│ 💡 Mẹo: Chụp từ trên    │
│ xuống, đủ ánh sáng       │
│                          │
│ --- Sau khi có ảnh ---   │
│                          │
│ ┌──────────────────────┐ │
│ │  [Ảnh món ăn]        │ │  ← Image preview, full width
│ │                  [✕] │ │
│ └──────────────────────┘ │
│                          │
│ ┌────┐ ┌────┐ ┌────┐ ┌──│
│ │450 │ │25g │ │60g │ │18│  ← Nutrition cards
│ │kcal│ │Pro │ │Carb│ │Fa│
│ └────┘ └────┘ └────┘ └──│
│                          │
│ 🌿 Lợi ích sữa: Tốt     │
│                          │
│ [  LƯU VÀO NHẬT KÝ  ]   │
└──────────────────────────┘
```

**Tích hợp Camera:**
```dart
// Dùng: image_picker ^1.x
final ImagePicker _picker = ImagePicker();

// Chụp ảnh
final XFile? photo = await _picker.pickImage(
  source: ImageSource.camera,
  imageQuality: 85,
  maxWidth: 1280,
);

// Tải từ thư viện
final XFile? image = await _picker.pickImage(
  source: ImageSource.gallery,
  imageQuality: 85,
);
```

**Gọi API phân tích:**
```dart
// POST /api/nutrition/scan
// Body: multipart/form-data với image file
// Response: { name, calories, protein, carbs, fat, milkBenefit }
```

---

### 6.6 Thực Đơn & Dinh Dưỡng

```
┌──────────────────────────┐
│ Khuyến Nghị Dinh Dưỡng   │
│                          │
│ ┌──────────────────────┐ │
│ │ 🐟 Cá hồi            │ │
│ │ Protein cao, Omega-3 │ │  ← Food card (tappable)
│ │ Tốt cho sữa: ████ 95%│ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🥚 Trứng gà           │ │
│ │ Protein + Vitamin D  │ │
│ │ Tốt cho sữa: ███ 85% │ │
│ └──────────────────────┘ │
│ ...                      │
└──────────────────────────┘

--- Khi tap vào 1 món ---
┌──────────────────────────┐
│ ← Cá hồi                 │  ← BottomSheet hoặc push
│ ────────────────────────  │
│ [Ảnh minh họa]           │
│ Lợi ích cho sữa mẹ       │
│ • Omega-3 tăng DHA...    │
│ • Protein cao giúp...    │
│                          │
│ Cửa hàng gần bạn         │
│ 📍 BigC (0.8km) ⭐4.5    │
│ 📍 Lotte (1.2km) ⭐4.3   │
│                          │
│ Công thức gợi ý           │
│ 🍲 Canh cá hồi nấu dứa   │
│ [XEM CÔNG THỨC →]        │
└──────────────────────────┘
```

---

### 6.7 Sức Khỏe & Wellness

```
┌──────────────────────────┐
│ Sức Khỏe                 │
│ [Xu hướng │ Ảnh hưởng │ Khám]
│                          │
│ Tab: Xu hướng            │
│ ┌──────────────────────┐ │
│ │  Milk Score 30 ngày  │ │
│ │   [Line Chart]        │ │  ← fl_chart LineChart
│ │   82 / 100           │ │
│ └──────────────────────┘ │
│                          │
│ Tab: Ảnh hưởng           │
│ ┌──────────────────────┐ │
│ │ Món ăn → Sữa         │ │
│ │ Cá hồi    ↑ +8%      │ │
│ │ Rau xanh  ↑ +5%      │ │
│ │ Cà phê    ↓ -3%      │ │
│ └──────────────────────┘ │
│                          │
│ Tab: Khám định kì        │
│ [+ Thêm kết quả khám]    │
│ ┌──────────────────────┐ │
│ │ 15/04 — Hemoglobin   │ │
│ │ 12.5 g/dL — Bình thường│
│ └──────────────────────┘ │
└──────────────────────────┘
```

**Charts:** Dùng `fl_chart ^0.69+`
```dart
LineChartData(
  gridData: FlGridData(show: false),
  titlesData: FlTitlesData(...),
  borderData: FlBorderData(show: false),
  lineBarsData: [
    LineChartBarData(
      color: AppColors.primary,
      barWidth: 3,
      dotData: FlDotData(show: false),
      belowBarData: BarAreaData(
        show: true,
        color: AppColors.primaryLight.withOpacity(0.3),
      ),
    ),
  ],
)
```

---

### 6.8 Hành Trình Bé

```
┌──────────────────────────┐
│ Hành Trình Của Bé 👶      │
│                          │
│ Bé: [Tên bé] — 8 tuần   │
│                          │
│ Timeline (vertical)       │
│ ●  Tuần 8                │
│ │  🎯 Bé bắt đầu cười    │
│ │  ☑ Hoàn thành          │
│ │                        │
│ ●  Tuần 12               │
│ │  🎯 Bé theo dõi mặt    │
│ │  ⏳ Sắp tới             │
│ │                        │
│ ●  Tuần 16               │
│    🎯 Bé tập lẫy          │
│    🔒 Chưa đến            │
│                          │
│ [+ GHI CHÚ CỘT MỐC]     │
└──────────────────────────┘
```

---

### 6.9 NutriMart (Bố)

```
┌──────────────────────────┐
│ NutriMart 🛒              │
│ [Mua sắm | Nấu ăn]       │
│                          │
│ Tab: Mua sắm             │
│ Ngân sách: [2,000,000đ ▼]│
│                          │
│ ┌──────────────────────┐ │
│ │ Tổng: 1.2M | Còn 800k│ │  ← Budget summary card
│ └──────────────────────┘ │
│                          │
│ Danh sách                │
│ ☐ Cá hồi 300g    120k  │
│ ☑ Trứng 10 quả    45k  │
│ ☐ Rau bina 2 bó   20k  │
│                          │
│ 🤖 AI gợi ý: Combo 3 món │
│ tiết kiệm 15% (~150k)    │
│                          │
│ Tab: Nấu ăn              │
│ [Công thức hôm nay]      │
│ ┌──────────────────────┐ │
│ │ 🍲 Canh cá hồi       │ │
│ │ ⏱ 30 phút | 😊 Dễ   │ │
│ │ [BẮT ĐẦU NẤU →]     │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

**Màn hình Hướng dẫn nấu ăn** (Step-by-step):
```
┌──────────────────────────┐
│ ← Canh cá hồi            │
│ Bước 2 / 5               │
│ ████████░░░░░░░  40%     │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │   Sơ chế cá hồi:     │ │  ← Big text, 1 bước / màn hình
│ │                      │ │
│ │ Rửa sạch, thái miếng │ │
│ │ vừa ăn, ướp muối     │ │
│ │ tiêu 10 phút.        │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ [🎙 ĐỌC TO]              │  ← Text-to-speech
│                          │
│ [← TRƯỚC]    [TIẾP →]   │  ← Điều hướng 1 tay
└──────────────────────────┘
```

---

### 6.10 Planner (Bố)

```
┌──────────────────────────┐
│ Planner 📅                │
│ [Ngân sách | Nhiệm vụ]   │
│                          │
│ Tab: Ngân sách           │
│ ┌──────────────────────┐ │
│ │ Tháng 4 • 2026       │ │
│ │ Đã chi: 1,200,000đ   │ │
│ │ Còn lại: 800,000đ    │ │
│ │ ████████░░░░  60%    │ │
│ └──────────────────────┘ │
│                          │
│ Phân bổ                  │
│ 🐟 Thực phẩm  60%  720k │
│ 💊 Thực phẩm bổ 25% 300k│
│ 📦 Khác       15% 180k  │
│                          │
│ Tab: Nhiệm vụ            │
│ ┌──────────────────────┐ │
│ │ 🎯 Mua đủ 5 loại rau │ │
│ │ Phần thưởng: +100đ   │ │
│ │ [HOÀN THÀNH]         │ │
│ └──────────────────────┘ │
│                          │
│ 🏆 Bảng xếp hạng         │
│ 1. 👤 Nam       2,450đ  │
│ 2. 👤 Minh      2,100đ  │
└──────────────────────────┘
```

---

### 6.11 Profile & Cài đặt

```
┌──────────────────────────┐
│ Hồ sơ                    │
│                          │
│ ┌──────────────────────┐ │
│ │  [Avatar]  Lan Nguyen│ │  ← Profile header card
│ │  🤱 Mẹ               │ │
│ │  Tuần 8 sau sinh     │ │
│ │  ⭐ 1,250 điểm       │ │
│ └──────────────────────┘ │
│                          │
│ Thông tin cá nhân        │
│ ► Tên hiển thị           │
│ ► Ngày sinh bé           │
│ ► Số tuần sau sinh       │
│                          │
│ Gia đình                 │
│ ► Kết nối với partner    │
│ ► Mã gia đình: NEST-8847 │
│                          │
│ Cài đặt App              │
│ ► Thông báo              │
│ ► Chủ đề (Sáng/Tối)     │
│ ► Ngôn ngữ               │
│                          │
│ [  ĐĂNG XUẤT  ]          │
└──────────────────────────┘
```

---

## 7. Kiến trúc Flutter

### Cấu trúc thư mục

```
lib/
├── main.dart
├── app.dart                    # MaterialApp, Theme, Router
├── core/
│   ├── theme/
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   ├── app_spacing.dart
│   │   └── app_theme.dart      # ThemeData light/dark
│   ├── router/
│   │   └── app_router.dart     # GoRouter config
│   ├── network/
│   │   ├── dio_client.dart
│   │   └── api_endpoints.dart
│   └── utils/
│       ├── formatters.dart
│       └── validators.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   └── auth_repository.dart
│   │   ├── presentation/
│   │   │   ├── login_screen.dart
│   │   │   ├── signup_screen.dart
│   │   │   └── role_selection_screen.dart
│   │   └── bloc/
│   │       └── auth_bloc.dart
│   ├── home/
│   ├── nori/
│   ├── smart_scan/
│   ├── nutrition/
│   ├── wellness/
│   ├── baby_journey/
│   ├── nutrimart/
│   ├── planner/
│   └── profile/
├── shared/
│   ├── widgets/
│   │   ├── gradient_button.dart
│   │   ├── warm_card.dart
│   │   ├── app_bottom_nav.dart
│   │   ├── feature_grid_card.dart
│   │   ├── milk_score_gauge.dart
│   │   ├── quest_card.dart
│   │   └── loading_dots.dart
│   └── models/
│       ├── user_model.dart
│       └── quest_model.dart
└── l10n/
    └── app_vi.arb              # Vietnamese strings
```

### ThemeData

```dart
// lib/core/theme/app_theme.dart
ThemeData get lightTheme => ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: AppColors.primary,
    brightness: Brightness.light,
    background: AppColors.background,
    surface: AppColors.surface,
    primary: AppColors.primary,
    onPrimary: AppColors.primaryOnColor,
    secondary: AppColors.success,
    error: AppColors.error,
  ),
  scaffoldBackgroundColor: AppColors.background,
  appBarTheme: AppBarTheme(
    backgroundColor: AppColors.surface,
    elevation: 0,
    scrolledUnderElevation: 1,
    shadowColor: AppColors.border,
    titleTextStyle: AppTypography.heading3,
    iconTheme: const IconThemeData(color: AppColors.textPrimary),
  ),
  cardTheme: CardTheme(
    color: AppColors.surface,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: AppRadius.lgR,
      side: const BorderSide(color: AppColors.border, width: 1),
    ),
    shadowColor: Colors.transparent,
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: AppColors.surface,
    border: OutlineInputBorder(
      borderRadius: AppRadius.mdR,
      borderSide: const BorderSide(color: AppColors.border),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: AppRadius.mdR,
      borderSide: const BorderSide(color: AppColors.border),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: AppRadius.mdR,
      borderSide: BorderSide(color: AppColors.primary, width: 1.5),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    hintStyle: AppTypography.body.copyWith(color: AppColors.textMuted),
  ),
  textTheme: TextTheme(
    displayLarge: AppTypography.displayHero,
    headlineMedium: AppTypography.heading2,
    titleLarge: AppTypography.heading3,
    bodyLarge: AppTypography.bodyLarge,
    bodyMedium: AppTypography.body,
    labelSmall: AppTypography.caption,
  ),
  bottomNavigationBarTheme: BottomNavigationBarThemeData(
    backgroundColor: AppColors.surface,
    selectedItemColor: AppColors.primary,
    unselectedItemColor: AppColors.textMuted,
    type: BottomNavigationBarType.fixed,
    showSelectedLabels: true,
    showUnselectedLabels: true,
    selectedLabelStyle: AppTypography.navLabel,
    unselectedLabelStyle: AppTypography.navLabel,
  ),
);
```

---

## 8. Quản lý State

### Công nghệ đề xuất: **flutter_bloc (BLoC pattern)**

```
flutter_bloc: ^8.x
equatable: ^2.x
```

### BLoC Structure mỗi feature:

```dart
// Event
abstract class AuthEvent extends Equatable {}
class LoginRequested extends AuthEvent {
  final String email, password;
}

// State
abstract class AuthState extends Equatable {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {
  final UserModel user;
}
class AuthFailure extends AuthState {
  final String message;
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repo;
  AuthBloc(this._repo) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await _repo.login(event.email, event.password);
      emit(AuthSuccess(user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }
}
```

### Global AppState (cho user session):
```dart
// Dùng Provider hoặc single AuthBloc ở root
BlocProvider<AuthBloc>(
  create: (context) => AuthBloc(AuthRepository()),
  child: MaterialApp.router(...),
)
```

---

## 9. Widget Library tùy chỉnh

### GradientButton
```dart
class GradientButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final Gradient gradient;
  final bool isLoading;

  Widget build(BuildContext context) => InkWell(
    onTap: isLoading ? null : onPressed,
    borderRadius: AppRadius.lgR,
    child: Container(
      height: 52,
      decoration: BoxDecoration(
        gradient: isLoading ? null : gradient,
        color: isLoading ? AppColors.border : null,
        borderRadius: AppRadius.lgR,
        boxShadow: isLoading ? [] : AppShadows.warm,
      ),
      alignment: Alignment.center,
      child: isLoading
          ? const LoadingDots()
          : Text(label, style: AppTypography.button.copyWith(color: Colors.white)),
    ),
  );
}
```

### WarmCard
```dart
class WarmCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color? backgroundColor;
  final VoidCallback? onTap;

  Widget build(BuildContext context) => Material(
    color: backgroundColor ?? AppColors.surface,
    borderRadius: AppRadius.lgR,
    child: InkWell(
      onTap: onTap,
      borderRadius: AppRadius.lgR,
      child: Container(
        padding: padding ?? const EdgeInsets.all(AppSpacing.base),
        decoration: BoxDecoration(
          borderRadius: AppRadius.lgR,
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: AppShadows.card,
        ),
        child: child,
      ),
    ),
  );
}
```

### MilkScoreGauge (CustomPainter)
```dart
class MilkScoreGauge extends StatelessWidget {
  final double score; // 0–100

  Widget build(BuildContext context) => SizedBox(
    width: 160, height: 100,
    child: CustomPaint(
      painter: _GaugePainter(score: score, color: AppColors.primary),
      child: Center(
        child: Column(children: [
          const SizedBox(height: 20),
          Text('${score.round()}', style: AppTypography.displayHero),
          Text('/ 100', style: AppTypography.caption),
        ]),
      ),
    ),
  );
}
```

### LoadingDots (3 chấm nhảy cho chatbot)
```dart
class LoadingDots extends StatefulWidget { ... }
// AnimationController 3 dots với staggered delay 150ms
// AnimatedContainer height 4→8→4 dp
```

### FeatureGridCard
```dart
class FeatureGridCard extends StatelessWidget {
  final IconData icon;
  final String label, desc;
  final Color iconBg;
  final String route;
  // Tap → GoRouter.go(route)
  // AnimatedScale trên hover/press
}
```

---

## 10. Tích hợp API & Supabase

### Dependencies
```yaml
dependencies:
  supabase_flutter: ^2.x
  dio: ^5.x
  dio_cache_interceptor: ^3.x
  image_picker: ^1.x
  flutter_markdown: ^0.7.x
  fl_chart: ^0.69.x
  google_fonts: ^6.x
  go_router: ^14.x
  flutter_bloc: ^8.x
  equatable: ^2.x
  cached_network_image: ^3.x
  lottie: ^3.x
  flutter_tts: ^4.x        # Text-to-speech cho cooking guide
  permission_handler: ^11.x
```

### Supabase Init
```dart
// main.dart
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_ANON_KEY',
);
```

### API Endpoints (từ backend NestAI)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/signup` | Đăng ký |
| GET | `/api/users/me` | Thông tin user |
| POST | `/api/nutrition/scan` | Phân tích ảnh món ăn |
| GET | `/api/nutrition/recommendations` | Danh sách món gợi ý |
| GET | `/api/babies/{id}` | Thông tin bé |
| POST | `/api/chat/nori` | Gửi tin nhắn Nori AI |
| GET | `/api/wellness/milk-score` | Điểm sữa theo ngày |
| GET | `/api/quests` | Danh sách nhiệm vụ |
| PUT | `/api/quests/{id}/complete` | Hoàn thành nhiệm vụ |

### Xử lý Cache
```dart
// Dùng dio_cache_interceptor cho GET requests
final cacheStore = MemCacheStore(maxSize: 10485760); // 10MB
final cacheInterceptor = DioCacheInterceptor(
  options: CacheOptions(
    store: cacheStore,
    maxStale: const Duration(minutes: 15),
    priority: CachePriority.normal,
  ),
);
```

---

## 11. Platform-specific Notes

### iOS
- `Info.plist` cần:
  ```xml
  NSCameraUsageDescription → "NestAI cần truy cập camera để chụp ảnh món ăn"
  NSPhotoLibraryUsageDescription → "NestAI cần thư viện để chọn ảnh"
  NSMicrophoneUsageDescription → "NestAI cần microphone cho trợ lý giọng nói"
  ```
- Dùng `SafeArea` và `MediaQuery.padding` cho notch/Dynamic Island
- Bottom BottomNav: cộng thêm `MediaQuery.of(context).padding.bottom`

### Android
- `AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
  <uses-permission android:name="android.permission.INTERNET" />
  ```
- Minimum SDK: 26 (`build.gradle`)
- Edge-to-edge: `SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge)`

### Adaptive Layout
```dart
// Hỗ trợ tablet (≥600dp)
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth >= 600) {
      return TabletLayout(child: child);
    }
    return MobileLayout(child: child);
  },
)
```

---

## 12. Accessibility & UX

### Tiêu chuẩn
- **Tất cả tap targets**: tối thiểu 44×44dp
- **Contrast ratio**: text trên nền ≥ 4.5:1 (WCAG AA)
- **Semantics**: `Semantics` widget cho icons không có label text
- **Screen reader**: test với TalkBack (Android) và VoiceOver (iOS)

### Animations
- Dùng `Curves.easeOutCubic` cho transitions
- Duration: 200ms (micro), 300ms (standard), 400ms (emphasis)
- Tránh animation > 500ms cho UI thường
- `reduceMotion`: check `MediaQuery.of(context).disableAnimations`

### Loading States
| Màn hình | Loading pattern |
|----------|----------------|
| Dashboard | Skeleton shimmer (`shimmer` package) |
| Chatbot | Typing dots animation |
| Smart Scan | Circular progress với text |
| Nutrition list | Shimmer card placeholders |
| Charts | Fade-in sau khi data loaded |

### Error States
```dart
// Widget chuẩn cho lỗi
class ErrorStateWidget extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  // Icon ⚠️ + message + [Thử lại] button
}
```

### Empty States
Mỗi màn hình danh sách phải có empty state với:
- Illustration (Lottie nhỏ hoặc icon 64dp)
- Tiêu đề: "Chưa có dữ liệu"  
- Mô tả: hướng dẫn cách thêm
- CTA button (nếu cần)

---

## Ghi chú triển khai

- **Flavors**: `dev` (staging API) và `prod` (production API)
- **CI/CD**: GitHub Actions → Fastlane → App Store / Play Store
- **Analytics**: Firebase Analytics cho tracking màn hình và events
- **Crash reporting**: Firebase Crashlytics
- **Push notifications**: Firebase Cloud Messaging (FCM) cho nhắc nhở hàng ngày

---

*Tài liệu này là nền tảng thiết kế — cập nhật khi có thay đổi yêu cầu hoặc sau mỗi sprint review.*