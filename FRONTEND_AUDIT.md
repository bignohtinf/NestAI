# 📋 Frontend Structure Audit

## ✅ Hiện Có

```
src/frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── fonts/GeistVF.woff
│   │   └── globals.css
│   ├── components/          (📁 Created - Empty)
│   │   ├── ui/              (📁 Created - Empty)
│   │   └── layout/          (📁 Created - Empty)
│   └── lib/                 (📁 Created - Empty)
│       ├── hooks/           (📁 Created - Empty)
│       └── services/        (📁 Created - Empty)
├── public/                  (📁 Created - Empty)
├── next.config.mjs
├── package.json
├── tsconfig.json
└── ...
```

## ❌ Bị Mất (Cần Restore)

### Core Library Files
- [ ] **lib/types.ts** - Type definitions (User, Meal, PregnancyInfo, etc.)
- [ ] **lib/mock-data.ts** - Mock user & meal data
- [ ] **lib/utils.ts** - Utility helpers
- [ ] **lib/firebase.ts** - Firebase initialization

### Services
- [ ] **lib/services/firestore.ts** - Firestore CRUD operations
  - userService, mealService, mealPlanService, dailyLogService, healthMetricsService

### Hooks & Context
- [ ] **lib/hooks/useUser.tsx** - User context provider & hook
- [ ] **lib/hooks/use-mobile.ts** - Mobile detection hook
- [ ] **lib/hooks/use-toast.ts** - Toast hook

### Components
- [ ] **components/layout/main-layout.tsx** - Main page wrapper
- [ ] **components/layout/header.tsx** - Header with user info
- [ ] **components/layout/sidebar.tsx** - Navigation sidebar
- [ ] **components/ui/** - Radix UI components (50+ files)
  - button.tsx, card.tsx, input.tsx, select.tsx, etc.
- [ ] **components/theme-provider.tsx** - Theme provider

### App Pages
- [ ] **app/providers.tsx** - Context providers wrapper
- [ ] **app/dashboard/page.tsx** - Dashboard page
- [ ] **app/menu-planner/page.tsx** - Menu planner
- [ ] **app/nutrition-calc/page.tsx** - Nutrition calculator
- [ ] **app/photo-analysis/page.tsx** - Photo analysis
- [ ] **app/profile/page.tsx** - User profile
- [ ] **app/settings/page.tsx** - Settings
- [ ] **app/debug/firebase/page.tsx** - Firebase debug panel

### Configuration
- [ ] **next.config.mjs** - Proper routing config
- [ ] **.env.local** - Firebase credentials template

### Styles
- [ ] **styles/globals.css** - Global styles (if not in app/)
- [ ] **postcss.config.mjs** - PostCSS config
- [ ] **tailwind.config.ts** - Tailwind config

## 📊 Summary

- **Total Files Missing:** ~100+ (mostly UI components and lib utilities)
- **Config Issues:** Minor (tsconfig is OK, next.config basic)
- **Package Size:** 283 packages (OK)
- **Next.js Version:** 14.2.35 (downgraded from 15 due to Node compatibility)

## 🔧 Next Steps

1. ✅ Created directory structure
2. ✅ Updated .gitignore
3. ⏳ Restore missing library files (from git or backup)
4. ⏳ Verify imports work correctly
5. ⏳ Test build & dev server

---

**Note:** Most files are from previous session. Check if there's a backup or git history.
