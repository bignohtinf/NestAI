# Assignment – NextAI App

> Dựa trên file thiết kế `src/docs/thietke.md`, DB schema `db_nextai.txt`, và API endpoints `endpoints.md`
> Cập nhật: 18/04/2026 – sau khi scan codebase hiện tại

---

## Trạng thái hiện tại (Current State)

| Layer | Đã có | Còn thiếu |
|---|---|---|
| **Frontend** | Sidebar role-based, tất cả pages scaffold, Context (mock data) | Middleware auth, Context kết nối Supabase, API client, pages dùng data thật |
| **Backend** | FastAPI + CORS, routers: auth/users/partnerships/nutrition/health/missions/baby/admin | AI routes, shopping router, quests/badges router, services layer mỏng, bug bảng milk_scores |
| **AI** | Chưa có gì | Smart Scan, Nori chat, Cooking guide, prompts.py |

---

## Kiến trúc đề xuất

### Tổng quan

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Next.js 14 (App Router) + TypeScript            │
│                                                  │
│  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  Role-based  │  │     Page Components        │ │
│  │  Middleware  │  │  /mother  /father  /admin  │ │
│  └──────────────┘  └───────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │  Context: AuthContext + RoleContext           │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
           │ HTTP / REST
┌─────────────────────────────────────────────────┐
│                   Backend                        │
│  FastAPI + Python                                │
│                                                  │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth Layer  │  │   Domain Routers          │  │
│  │  (Supabase)  │  │  /nutrition /babies       │  │
│  └──────────────┘  │  /shopping /quests        │  │
│                    └──────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐ │
│  │  AI Service Layer                             │ │
│  │  - Smart Scan (vision → nutrition)            │ │
│  │  - Nori (LLM conversational assistant)        │ │
│  │  - Cooking Voice (step-by-step guide)         │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
           │ Supabase Client
┌─────────────────────────────────────────────────┐
│                  Database                        │
│  Supabase (PostgreSQL)                           │
│                                                  │
│  users / user_profiles / partnerships            │
│  babies / daily_entries / nutrition_logs         │
│  shopping_items / quests / badges                │
└─────────────────────────────────────────────────┘
```

### Nguyên tắc kiến trúc

| Layer | Quyết định |
|---|---|
| **Routing** | Next.js App Router – mỗi tính năng = 1 page riêng |
| **Auth** | Supabase Auth → JWT → middleware kiểm tra role |
| **Role guard** | `middleware.ts` chặn route dựa theo `role` trong JWT claims |
| **State** | React Context (`AuthContext`) cho user/role, TanStack Query cho server state |
| **API client** | `lib/api.ts` – wrapper fetch có gắn Bearer token tự động |
| **AI** | FastAPI `/ai/*` routes – tách biệt khỏi business logic |
| **Sidebar** | 1 component duy nhất, render items theo `role` |

---

## Plan chi tiết – FRONTEND

> Stack: Next.js 14 App Router · TypeScript · Tailwind · shadcn/ui · TanStack Query

### FE-1 · Auth & Foundation _(làm trước tiên)_

#### FE-1.1 · Kết nối Supabase Auth vào Context
- **File**: `src/frontend/lib/context.tsx`
- **Hiện tại**: `AppContext` dùng mock data, `login()` chỉ set hardcoded object
- **Cần làm**:
  - Import `createClientComponentClient` từ `@supabase/auth-helpers-nextjs`
  - Thêm `useEffect` lắng nghe `supabase.auth.onAuthStateChange`
  - Khi session thay đổi: fetch `/api/users/me?user_id=...` để lấy `role`, `full_name`
  - Fetch `/api/partnerships/active?user_id=...` để lấy `partnership_id`
  - Lưu `{ user, session, partnershipId }` vào state
  - Xóa toàn bộ hardcoded `initialUserData`

```typescript
// Cấu trúc mới của AppContext state
interface AppState {
  user: { id: string; email: string; full_name: string; role: Role } | null;
  partnershipId: string | null;
  session: Session | null;
  loading: boolean;
}
```

#### FE-1.2 · Tạo API Client
- **File mới**: `src/frontend/lib/api.ts`
- **Mục đích**: wrapper fetch tự động gắn Bearer token, base URL từ env
- **Các hàm cần có**:

```typescript
// GET  /api/users/me
// GET  /api/partnerships/active
// GET  /api/babies
// GET  /api/nutrition/logs
// POST /api/nutrition/logs
// GET  /api/nutrition/summary
// GET  /api/health/milk-score (trend, current)
// GET  /api/missions
// GET  /api/shopping
// POST /api/shopping
// PUT  /api/shopping/:id
// POST /ai/smart-scan
// POST /ai/nori/chat
// POST /ai/cooking-guide
```

- Pattern:
```typescript
async function apiGet<T>(path: string, token: string): Promise<T>
async function apiPost<T>(path: string, body: unknown, token: string): Promise<T>
```

#### FE-1.3 · Middleware bảo vệ route
- **File mới**: `src/frontend/middleware.ts`
- **Logic**:
  ```
  /auth/*          → public (không cần auth)
  /admin/*         → chỉ role = admin
  /smart-scan, /nutrition, /health, /milk-baby-impact, /wellness
                   → chỉ role = mother
  /checklist, /family-status, /nutrimart, /cooking
                   → chỉ role = father
  /               → mother & father & admin (redirect khác nhau)
  ```
- **Cách đọc role**: decode JWT từ Supabase cookie `sb-access-token`, lấy `user_metadata.role`

#### FE-1.4 · Auth Pages
- **Files**: `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/auth/role-selection/page.tsx`
- **Login**: Form email + password → `supabase.auth.signInWithPassword` → redirect theo role
- **Signup**: Form tên + email + password → `supabase.auth.signUp` → chuyển sang Role Selection
- **Role Selection**: 2 button (Mẹ / Bố) → `supabase.auth.updateUser({ data: { role } })` → lưu role vào user_metadata + gọi `/api/users/me` tạo bản ghi trong DB

---

### FE-2 · Mother Pages

#### FE-2.1 · Smart Scan (`/smart-scan`)
- **File**: `app/smart-scan/page.tsx` (có scaffold, cần wire API)
- **Component**: `components/metrics/smart-scan.tsx` – hiện tại UI có, cần kết nối
- **Cần thêm**:
  - Khi submit ảnh → POST `/ai/smart-scan` với `FormData { image: File }`
  - Hiển thị response: `{ meal_name, calories, protein, carbs, fat, confidence }`
  - Nút "Lưu vào nhật ký" → POST `/api/nutrition/logs`
  - Loading skeleton khi đang phân tích

#### FE-2.2 · Nutrition (`/nutrition`)
- **File**: `app/nutrition/page.tsx`
- **Cần làm**:
  - Fetch GET `/api/nutrition/logs` → hiển thị nhật ký 7 ngày gần nhất
  - Fetch GET `/ai/nutrition-suggest` → danh sách gợi ý món ăn hôm nay
  - Nhấn vào món → modal hiển thị: breakdown dinh dưỡng + danh sách cửa hàng gần (Google Maps Places API hoặc mock)
  - `NutritionSummaryCard`: tổng calo/protein/carbs/fat trong ngày vs. mục tiêu

#### FE-2.3 · Sức khỏe + Sữa & Bé (`/health`, `/milk-baby-impact`, `/wellness`)
- **Files**: `app/health/page.tsx`, `app/milk-baby-impact/page.tsx`, `app/wellness/page.tsx`
- **Cần làm**:
  - Fetch GET `/api/health/trend?user_id=&days=30` → vẽ `LineChart` milk score
  - Fetch GET `/api/babies` → lấy `baby_id`
  - Fetch GET `/api/babies/:id/daily-entries` → bảng mood/ngủ/quấy của bé
  - **Milk Support Score**: aggregate `daily_entries.milk_score` theo ngày/tuần
  - **Insight card**: "Sữa tốt hơn khi ăn cá + rau" – tính từ correlation giữa `nutrition_logs` và `daily_entries.milk_score`

---

### FE-3 · Father Pages

#### FE-3.1 · Checklist (`/checklist` → tab trong `/`)
- **File**: `app/checklist/page.tsx`
- **Cần làm**:
  - Fetch GET `/api/missions?user_id=` → danh sách nhiệm vụ
  - PUT `/api/missions/:id` khi tick → cập nhật `is_completed`
  - `ProgressBar`: `completed / total * 100`
  - Alert banner nếu nutrition summary thiếu protein hoặc calo < mục tiêu

#### FE-3.2 · Gia đình (`/family-status`)
- **File**: `app/family-status/page.tsx`
- **Cần làm**:
  - Fetch partner's nutrition summary qua `/api/partnerships/:id` (lấy `mother_id`) → GET `/api/nutrition/summary?user_id=<mother_id>`
  - Fetch `/api/babies` → GET `/api/babies/:id/daily-entries` → tình trạng bé
  - `RadarChart` 4 chiều: Dinh dưỡng / Sức khỏe / Giấc ngủ bé / Milk Score
  - Insight text: AI gợi ý nếu milk score < 70

#### FE-3.3 · NutriMart (`/nutrimart`)
- **File**: `app/nutrimart/page.tsx` (có 2 tab: Mua sắm + Nấu ăn)
- **Tab Mua sắm**:
  - Fetch GET `/api/shopping?partnership_id=` → danh sách item
  - POST `/api/shopping` thêm item; PUT `/api/shopping/:id` tick purchased
  - Hiển thị tổng tiền vs. ngân sách (từ context)
  - AI combo gợi ý: POST `/ai/nutrition-suggest?mode=shopping&budget=150000`
- **Tab Nấu ăn** (component riêng `CookingGuide`):
  - Input: tên món / nguyên liệu có sẵn → POST `/ai/cooking-guide`
  - Hiển thị steps dạng `Stepper` (step 1/N, Next button)
  - Nút "Đọc to" → `window.speechSynthesis.speak()` text của step hiện tại
  - "Thay nguyên liệu": modal input → gọi lại AI với `{ replace: { old, new } }`

---

### FE-4 · Shared Pages

#### FE-4.1 · Home Dashboard (`/`)
- **File**: `app/page.tsx`
- **Mother view**: Milk Score hôm nay + Nutrition progress + Quick access Smart Scan
- **Father view**: Checklist progress + Family status summary + NutriMart quick add
- Data: kết hợp `/api/nutrition/summary` + `/api/health/current-score` + `/api/missions`

#### FE-4.2 · Baby Journey (`/baby-journey`)
- **File**: `app/baby-journey/page.tsx`
- Fetch `/api/babies` → hiển thị tuổi bé (tính từ `date_of_birth`)
- Fetch `/api/babies/:id/daily-entries` → `LineChart` cân nặng / chiều cao theo thời gian
- Timeline mốc phát triển: hardcode theo tuần tuổi (WHO milestones) so với tuổi thực tế của bé

#### FE-4.3 · Notifications (`/notifications`)
- **File**: `app/notifications/page.tsx`
- Fetch GET `/api/partnerships/pending?user_id=` → hiển thị yêu cầu kết nối
- Accept/Reject: POST `/api/partnerships/:id/respond?action=accept|reject`
- **Realtime**: `supabase.channel('partnerships').on('postgres_changes', ...)` → toast khi có request mới
- Danh sách thông báo mốc phát triển (từ `daily_entries` milestones)

#### FE-4.4 · Nori Chat (`/nori`)
- **File**: `app/nori/page.tsx` (có scaffold, cần wire API)
- **Hiện tại**: gửi message nhưng không có backend endpoint thật
- **Cần làm**:
  - POST `/ai/nori/chat` với `{ message, history: Message[], user_context: { role, weeksPostpartum } }`
  - Streaming response: dùng `ReadableStream` hoặc SSE để hiển thị chữ dần
  - Lưu history vào `localStorage` (key: `nori_history_<user_id>`)
  - Quick suggest chips: "Hôm nay ăn gì?", "Bé ngủ ít có sao không?", "Calo hôm nay thế nào?"

---

### FE-5 · Kỹ thuật chung

| Item | Chi tiết |
|---|---|
| **TanStack Query** | Cài `@tanstack/react-query`, wrap `layout.tsx` với `QueryClientProvider`, dùng `useQuery`/`useMutation` thay `useState+useEffect+fetch` trong từng page |
| **Error boundaries** | Thêm `error.tsx` trong mỗi route segment chính |
| **Loading states** | Thêm `loading.tsx` cho `/`, `/nori`, `/smart-scan` |
| **Env vars** | `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## Plan chi tiết – BACKEND

> Stack: FastAPI · Python · Supabase (PostgreSQL) · Pydantic v2

### BE-1 · Sửa bug + Chuẩn hoá hiện tại

#### BE-1.1 · Fix `health.py` – sai tên bảng
- **File**: `src/backend/app/api/routes/health.py`
- **Bug**: Đang query `milk_scores` – bảng không tồn tại trong schema
- **Fix**: Đổi sang `daily_entries` (đúng schema), cột `milk_score` (integer 0–100)
- Query mới: `.table("daily_entries").select("*").eq("baby_id", baby_id).order("entry_date", desc=True)`

#### BE-1.2 · Thêm Pydantic schemas đầy đủ
- **Files**: `src/backend/app/schemas/babies.py`, `nutrition.py`, `shopping.py`, `quests.py`
- Hiện tại schemas nằm inline trong từng router → tách ra `app/schemas/`
- Thêm `response_model` vào tất cả endpoints để type-safe

#### BE-1.3 · Thêm Services layer
- **Files mới**: `src/backend/app/services/baby_service.py`, `nutrition_service.py`, `shopping_service.py`
- Hiện tại business logic nằm trực tiếp trong router → tách ra service
- Pattern: `async def get_babies_for_user(user_id: str, supabase) -> list[Baby]`

### BE-2 · Routers còn thiếu

#### BE-2.1 · Shopping Router
- **File mới**: `src/backend/app/api/routes/shopping.py`
- Bảng: `shopping_items` (có sẵn trong schema)
- Endpoints:
  ```
  GET  /api/shopping?partnership_id=  → list items
  POST /api/shopping                  → tạo item mới
  PUT  /api/shopping/{id}             → tick purchased / cập nhật giá
  DELETE /api/shopping/{id}           → xóa item
  GET  /api/shopping/summary          → tổng tiền, so với budget
  ```

#### BE-2.2 · Quests & Badges Router
- **File mới**: `src/backend/app/api/routes/quests.py`
- Bảng: `quests`, `user_quests`, `badges`, `user_badges`
- Endpoints:
  ```
  GET  /api/quests              → list active quests
  GET  /api/quests/my           → user's quests + progress
  POST /api/quests/{id}/complete → đánh dấu hoàn thành
  GET  /api/badges/my           → badges đã earn
  ```

#### BE-2.3 · Daily Entries sub-router
- **File**: cập nhật `src/backend/app/api/routes/baby.py`
- Thêm endpoints:
  ```
  GET  /api/babies/{id}/daily-entries          → list entries
  POST /api/babies/{id}/daily-entries          → tạo entry mới
  GET  /api/babies/{id}/daily-entries/trend    → milk_score 30 ngày
  ```

#### BE-2.4 · Đăng ký routers mới vào `main.py`
```python
from app.api.routes import shopping, quests
app.include_router(shopping.router, prefix="/api/shopping", tags=["shopping"])
app.include_router(quests.router, prefix="/api/quests", tags=["quests"])
```

---

## Plan chi tiết – AI

> Stack: FastAPI route · OpenAI `gpt-4o` (vision + chat) · LangChain (optional)

### AI-1 · Setup

#### AI-1.1 · Tạo `prompts.py`
- **File mới**: `src/backend/app/prompts.py`
- Chứa tất cả system prompts tiếng Việt
- 4 prompts cần có:

```python
NORI_SYSTEM_PROMPT = """
Bạn là Nori – trợ lý AI của ứng dụng NextAI dành cho mẹ sau sinh và bố hỗ trợ gia đình.
[Role, tone, constraints...]
"""

SMART_SCAN_SYSTEM_PROMPT = """
Bạn là chuyên gia dinh dưỡng. Phân tích ảnh món ăn và trả về JSON...
"""

COOKING_GUIDE_SYSTEM_PROMPT = """
Bạn là đầu bếp gia đình. Hướng dẫn nấu ăn ngắn gọn, từng bước...
"""

NUTRITION_SUGGEST_SYSTEM_PROMPT = """
Gợi ý thực đơn phù hợp cho mẹ sau sinh, dựa trên lịch sử dinh dưỡng...
"""
```

#### AI-1.2 · Tạo `ai_service.py`
- **File mới**: `src/backend/app/services/ai_service.py`
- Khởi tạo OpenAI client 1 lần, tái sử dụng
- Helper functions:
  ```python
  async def analyze_food_image(image_base64: str) -> FoodAnalysis
  async def chat_with_nori(messages: list, user_context: dict) -> str
  async def get_cooking_steps(dish: str, available_ingredients: list) -> list[Step]
  async def suggest_nutrition(history: list, role: str) -> list[Suggestion]
  ```

### AI-2 · Endpoints

#### AI-2.1 · Smart Scan – `POST /ai/smart-scan`
- **File mới**: `src/backend/app/api/routes/ai.py`
- Input: `multipart/form-data` với `image: UploadFile`
- Xử lý: encode base64 → gửi OpenAI vision với `SMART_SCAN_SYSTEM_PROMPT`
- Output (JSON):
  ```json
  {
    "meal_name": "Cơm tấm sườn bì",
    "calories": 650,
    "protein": 28.5,
    "carbs": 75.0,
    "fat": 22.0,
    "confidence": 0.87,
    "warnings": ["Nhiều carb, cân nhắc khẩu phần"],
    "suggestions": ["Thêm rau xanh để cân bằng"]
  }
  ```
- **Bảo mật**: validate file type (image/jpeg, image/png, image/webp), giới hạn 10MB

#### AI-2.2 · Nori Chat – `POST /ai/nori/chat`
- Input:
  ```json
  {
    "message": "Hôm nay tôi nên ăn gì?",
    "history": [{"role": "user", "content": "..."}, ...],
    "user_context": { "role": "mother", "weeks_postpartum": 6 }
  }
  ```
- Xử lý: build messages array `[SystemMessage(NORI_SYSTEM_PROMPT), ...history, HumanMessage(message)]`
- Output: `{ "reply": "...", "suggestions": ["...", "..."] }`
- **Streaming** (optional): dùng `StreamingResponse` với `text/event-stream`

#### AI-2.3 · Cooking Guide – `POST /ai/cooking-guide`
- Input:
  ```json
  {
    "dish_name": "Canh chua cá lóc",
    "available_ingredients": ["cá lóc", "cà chua", "giá đỗ"],
    "replace": { "old": "me chua", "new": "chanh" }
  }
  ```
- Output:
  ```json
  {
    "dish_name": "Canh chua cá lóc",
    "servings": 4,
    "total_time_minutes": 25,
    "steps": [
      { "step": 1, "instruction": "Sơ chế cá lóc...", "duration_seconds": 120 },
      ...
    ],
    "tips": "Nêm nhạt hơn nếu đang cho con bú"
  }
  ```

#### AI-2.4 · Nutrition Suggest – `GET /ai/nutrition-suggest`
- Query params: `user_id`, `mode=meal|shopping`, `budget` (optional)
- Fetch lịch sử nutrition logs 7 ngày → đưa vào prompt context
- Output meal mode:
  ```json
  {
    "suggestions": [
      { "name": "Bún bò Huế", "calories": 520, "reason": "Nhiều protein, phù hợp sau sinh" }
    ]
  }
  ```
- Output shopping mode:
  ```json
  {
    "combos": [
      { "items": ["Cá hồi 200g", "Rau bina", "Đậu phụ"], "total_price": 145000, "calories_per_day": 1800 }
    ]
  }
  ```

### AI-3 · Đăng ký vào main.py
```python
from app.api.routes import ai as ai_router
app.include_router(ai_router.router, prefix="/ai", tags=["ai"])
```

---

## Thứ tự thực hiện

```
Sprint 1 (Foundation – 2 ngày)
  BE-1.1 Fix health.py bug
  BE-1.2 Tách schemas
  FE-1.1 Context → Supabase Auth
  FE-1.2 API client (api.ts)
  FE-1.3 Middleware route protection
  FE-1.4 Auth pages (login/signup/role-selection)

Sprint 2 (Core Backend – 2 ngày)
  BE-2.1 Shopping router
  BE-2.2 Quests router
  BE-2.3 Daily entries sub-router
  BE-1.3 Services layer

Sprint 3 (AI Layer – 2 ngày)
  AI-1.1 prompts.py
  AI-1.2 ai_service.py
  AI-2.1 Smart Scan endpoint
  AI-2.2 Nori chat endpoint
  AI-2.3 Cooking guide endpoint
  AI-2.4 Nutrition suggest endpoint

Sprint 4 (Pages – 3 ngày, song song FE Mother + FE Father)
  FE-2.1 Smart Scan page wire API
  FE-2.2 Nutrition page
  FE-2.3 Health/Milk-baby pages
  FE-3.1 Checklist page
  FE-3.2 Family status page
  FE-3.3 NutriMart (shopping + cooking)

Sprint 5 (Shared + Polish – 2 ngày)
  FE-4.1 Home dashboard (role-aware)
  FE-4.2 Baby Journey timeline
  FE-4.3 Notifications + realtime
  FE-4.4 Nori chat streaming
  FE-5   TanStack Query, error.tsx, loading.tsx
```

---

## Ghi chú kỹ thuật

| Mục | Quyết định |
|---|---|
| **AI model** | OpenAI `gpt-4o` – hỗ trợ vision + chat trong 1 model |
| **Image upload** | Frontend → `FormData` → Backend → base64 → OpenAI. Không lưu ảnh gốc, chỉ lưu kết quả |
| **Streaming chat** | `StreamingResponse` (FastAPI) + `ReadableStream` (Next.js `fetch`) |
| **Voice TTS** | `window.speechSynthesis` – Web Speech API, không cần backend |
| **Realtime** | Supabase Realtime Postgres Changes trên bảng `partnerships` |
| **Milk Score** | `daily_entries.milk_score` (int 0–100) aggregate 7/30 ngày |
| **Nearby stores** | Phase đầu: mock JSON. Phase sau: Google Maps Places API |
| **Budget** | Lưu trong `user_profiles.preferences` dạng `{ "monthly_budget": 2000000 }` |
| **Env vars cần thêm** | `OPENAI_API_KEY` (backend), `NEXT_PUBLIC_BACKEND_URL` (frontend) |
