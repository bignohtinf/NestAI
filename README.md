# 🌸 NestAI

> **Trợ lý AI đồng hành cùng hành trình thai kỳ & chăm sóc gia đình**

NestAI là ứng dụng toàn diện giúp bà bầu và gia đình theo dõi sức khỏe, dinh dưỡng, và nhận tư vấn y tế thông minh từ AI — hoàn toàn bằng tiếng Việt.

---

## ✨ Tính năng

### 🤰 Dành cho mẹ bầu
- **Chatbot AI (bot-pregnant)** — Hỏi đáp thai kỳ theo chuẩn Bộ Y tế, dựa trên RAG từ dữ liệu Vinmec + các Quyết định BYT
- **Theo dõi thai kỳ** — Ghi nhận cân nặng, chỉ số sức khỏe theo từng giai đoạn
- **Gợi ý dinh dưỡng** — Thực đơn & thực phẩm phù hợp theo tuần thai
- **Hồ sơ y tế** — Lưu trữ thông tin khám thai, xét nghiệm
- **Nhật ký sức khỏe** — Ghi lại triệu chứng, cảm nhận hàng ngày

### 👶 Theo dõi bé
- Cập nhật chiều cao, cân nặng theo chuẩn WHO
- Lịch tiêm chủng và mốc phát triển

### 🏠 Gia đình & cộng đồng
- Dashboard riêng cho mẹ, bố và admin
- Nhiệm vụ sức khỏe (Missions) hàng ngày / hàng tuần
- Blog kiến thức thai kỳ & nuôi con
- Wellness — theo dõi sức khỏe tinh thần

### 🔐 Hệ thống
- Xác thực JWT, phân quyền (user / admin)
- Lịch sử hội thoại với AI
- Quản lý đối tác / cửa hàng

---

## 🏗️ Công nghệ

| Lớp | Công nghệ |
|-----|-----------|
| **Frontend (Web)** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **Mobile** | Flutter |
| **Backend API** | FastAPI, Python 3.11, Uvicorn |
| **Database** | Supabase (PostgreSQL) |
| **AI Agent** | LangGraph, LangChain, LiteLLM |
| **LLM** | OpenAI GPT-4o-mini (chat), GPT-4-Vision (food scan) |
| **Embeddings** | `BAAI/bge-m3` (HuggingFace) |
| **Vector DB** | Qdrant Cloud (production) / Chroma (local) |
| **Containerization** | Docker, Docker Compose |

---

## 📁 Cấu trúc dự án

```
.
├── src/
│   ├── agents/
│   │   ├── agent.py              # Agent loop đa mô hình (LiteLLM)
│   │   └── bot-pregnant/         # RAG engine cho bà bầu
│   │       ├── service.py        # FastAPI service (port 8001)
│   │       ├── src/engine/
│   │       │   ├── graph.py          # LangGraph agent (MommyEngine)
│   │       │   ├── retriever.py      # NoriRetriever (Qdrant / Chroma)
│   │       │   ├── generator.py      # Response generator
│   │       │   ├── chains.py         # LangChain chains
│   │       │   └── trust_manager.py  # Kiểm định độ tin cậy nguồn
│   │       └── data/processed/   # Dữ liệu Vinmec, BYT đã xử lý
│   ├── backend/                  # FastAPI backend chính (port 8000)
│   │   ├── main.py
│   │   └── app/api/routes/       # auth, users, nutrition, health, ...
│   ├── frontend/                 # Next.js web app
│   │   └── components/
│   │       ├── dashboards/       # MomDashboard, DadDashboard, AdminDashboard
│   │       └── landing/
│   └── mobile/                   # Flutter app
├── scripts/
│   ├── setup_hooks.sh            # Cài git hook (chạy 1 lần)
│   ├── log_hook.py               # Ghi log AI tool calls
│   └── submit_log.py             # Submit log khi git push
├── .env.example
├── AGENTS.md
├── ARCHITECTURE.md
├── JOURNAL.md
└── WORKLOG.md
```

---

## 🚀 Hướng dẫn chạy

### Yêu cầu
- Python 3.10+
- Node.js 18+
- Flutter 3.x (cho mobile)
- Docker & Docker Compose (khuyến nghị)
- Tài khoản Qdrant Cloud hoặc Qdrant chạy local

---

### 1. Cài đặt chung

```bash
git clone <repo-url>
cd A20-App-005

# Cài git hook AI logging (bắt buộc, chạy 1 lần)
bash scripts/setup_hooks.sh

# Sao chép và điền biến môi trường
cp .env.example .env
```

Mở `.env` và điền các giá trị:

```env
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
QDRANT_URL=...
QDRANT_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

### 2. Backend API (port 8000)

```bash
cd src/backend

python -m venv venv
source venv/bin/activate        # Linux/Mac
# hoặc: venv\Scripts\activate   # Windows

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs tự động: http://localhost:8000/docs

---

### 3. AI Agent — bot-pregnant (port 8001)

```bash
cd src/agents/bot-pregnant

python -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

# Chạy với Qdrant Cloud
USE_QDRANT=1 python service.py

# Chạy với Chroma local (không cần Qdrant)
python service.py
```

---

### 4. Frontend Web (port 3000)

```bash
cd src/frontend

npm install
npm run dev
```

Truy cập: http://localhost:3000

---

### 5. Chạy toàn bộ bằng Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Bot-Pregnant Agent | http://localhost:8001 |

---

### 6. Agent loop đa mô hình (CLI)

```bash
cd src

python -m venv venv && source venv/bin/activate
pip install litellm

python -m agents.agent
```

Hỗ trợ các model: `anthropic/claude-3-sonnet`, `openai/gpt-4o`, `google/gemini-pro`, `mistral/mistral-large`, ...

---

## 🧪 Chạy test

```bash
cd src/agents/bot-pregnant
pytest tests/ -v
```

---

## 📋 Tài liệu liên quan

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Sơ đồ kiến trúc hệ thống
- [AGENTS.md](./AGENTS.md) — Quy tắc sử dụng AI coding agents
- [JOURNAL.md](./JOURNAL.md) — Nhật ký sản phẩm hàng tuần
- [WORKLOG.md](./WORKLOG.md) — Quyết định kỹ thuật & phân công công việc

---

## 🔒 Lưu ý bảo mật

- Không commit file `.env` lên repository
- File `.env.example` chứa template trống, không có giá trị thật
- Tất cả API key phải được đặt qua biến môi trường

---

## AI Logging

Prompts và tool calls được **tự động ghi log** khi dùng bất kỳ AI tool nào (Claude Code, Cursor, Codex, Gemini, Copilot). Không cần thao tác thủ công sau khi chạy `setup_hooks.sh`.

Xem [AGENTS.md](./AGENTS.md) để biết thêm chi tiết.

---

_Internal project — [A20] AI Application Course_
