# 🏛️ NestAI — Kiến trúc hệ thống

Tài liệu này mô tả kiến trúc tổng thể của NestAI, bao gồm các thành phần, luồng dữ liệu, và cách User tương tác với App và AI Agent.

---

## Tổng quan

NestAI được xây dựng theo kiến trúc **microservice** gồm 3 lớp chính:

1. **Client Layer** — Giao diện người dùng (Web + Mobile)
2. **Application Layer** — Backend API xử lý nghiệp vụ
3. **AI Agent Layer** — RAG engine chuyên biệt cho thai kỳ

---

## Sơ đồ kiến trúc tổng thể

```mermaid
graph TD
    subgraph CLIENT["👤 Client Layer"]
        U1["🧑‍💻 Mẹ bầu / Bố / Admin"]
        WEB["🌐 Web App\nNext.js 14"]
        MOB["📱 Mobile App\nFlutter"]
        U1 --> WEB
        U1 --> MOB
    end

    subgraph APP["⚙️ Application Layer"]
        API["🚀 Backend API\nFastAPI · port 8000"]
        DB[("🗄️ Supabase\nPostgreSQL")]
        API <-->|"SQL / REST"| DB
    end

    subgraph AI["🤖 AI Agent Layer"]
        BOT["🌸 Bot-Pregnant Service\nFastAPI · port 8001"]
        GRAPH["🔁 MommyEngine\nLangGraph Agent"]
        EMBED["📐 NoriRetriever\nBAAI/bge-m3"]
        VDB[("🧠 Vector DB\nQdrant Cloud")]
        LLM["💬 LLM\nGPT-4o-mini"]
        TRUST["✅ TrustManager\nKiểm định nguồn"]

        BOT --> GRAPH
        GRAPH -->|"retrieve"| EMBED
        EMBED <-->|"similarity search"| VDB
        GRAPH -->|"trust check"| TRUST
        GRAPH -->|"generate"| LLM
    end

    WEB <-->|"REST / HTTPS"| API
    MOB <-->|"REST / HTTPS"| API
    API <-->|"HTTP (internal)"| BOT
```

---

## Luồng hội thoại AI (User → App → AI Agent)

```mermaid
sequenceDiagram
    actor U as 👩 Mẹ bầu
    participant FE as 🌐 Frontend
    participant API as ⚙️ Backend API
    participant BOT as 🌸 Bot-Pregnant
    participant GRAPH as 🔁 LangGraph
    participant VDB as 🧠 Qdrant
    participant LLM as 💬 GPT-4o-mini

    U->>FE: Gõ câu hỏi thai kỳ
    FE->>API: POST /api/bot-pregnant/chat
    API->>BOT: Forward request + user_profile + chat_history

    BOT->>GRAPH: Khởi chạy MommyEngine

    GRAPH->>GRAPH: analyze_query_node\n(kiểm tra từ khóa khẩn cấp)

    alt Câu hỏi khẩn cấp (ra máu, vỡ ối...)
        GRAPH-->>BOT: ⚠️ Emergency response
    else Câu hỏi thông thường
        GRAPH->>VDB: Semantic search (BAAI/bge-m3)
        VDB-->>GRAPH: Top-k documents
        GRAPH->>GRAPH: trust_check_node\n(lọc nguồn tin cậy)
        GRAPH->>LLM: Prompt = context + câu hỏi + lịch sử
        LLM-->>GRAPH: Câu trả lời
    end

    GRAPH-->>BOT: AgentState với answer
    BOT-->>API: JSON response (streaming)
    API-->>FE: Trả kết quả
    FE-->>U: Hiển thị câu trả lời
```

---

## Chi tiết các thành phần

### 1. Client Layer

| Thành phần | Công nghệ | Vai trò |
|------------|-----------|---------|
| Web App | Next.js 14, TypeScript, Tailwind CSS | Dashboard mẹ/bố/admin, chatbot, blog |
| Mobile App | Flutter | Ứng dụng di động đa nền tảng |

**Các màn hình chính:**
- `LandingPage` — Trang giới thiệu (chưa đăng nhập)
- `MomDashboard` — Bảng điều khiển cho mẹ bầu
- `DadDashboard` — Theo dõi cùng gia đình
- `AdminDashboard` — Quản trị hệ thống

---

### 2. Application Layer (Backend API)

**FastAPI** chạy tại `port 8000`, đóng vai trò API Gateway và xử lý toàn bộ nghiệp vụ.

| Route prefix | Chức năng |
|---|---|
| `/api/auth` | Đăng ký, đăng nhập, JWT |
| `/api/users` | Hồ sơ người dùng |
| `/api/nutrition` | Dinh dưỡng, thực đơn |
| `/api/health` | Sức khỏe, chỉ số thai kỳ |
| `/api/babies` | Theo dõi bé |
| `/api/missions` | Nhiệm vụ sức khỏe |
| `/api/recommendations` | Gợi ý thực phẩm |
| `/api/chat-history` | Lịch sử hội thoại AI |
| `/api/wellness` | Sức khỏe tinh thần |
| `/api/blog` | Bài viết kiến thức |
| `/api/medical-profile` | Hồ sơ y tế |
| `/api/stores` | Đối tác / cửa hàng |
| `/bot-pregnant/*` | Proxy đến AI Agent |

**Database:** Supabase (PostgreSQL) — lưu trữ dữ liệu người dùng, lịch sử, hồ sơ y tế.

---

### 3. AI Agent Layer (Bot-Pregnant)

**FastAPI** chạy tại `port 8001`, độc lập với backend chính để dễ scale.

```
Request
  └─► MommyEngine (LangGraph)
        ├─► analyze_query_node  — Phát hiện tình huống khẩn cấp
        ├─► retrieve_node       — Tìm kiếm ngữ nghĩa (Qdrant)
        ├─► trust_check_node    — Lọc & kiểm định nguồn tin
        └─► generate_node       — Sinh câu trả lời (GPT-4o-mini)
```

**Nguồn dữ liệu RAG:**
- Vinmec — hàng trăm bài viết sức khỏe thai kỳ tiếng Việt
- Quyết định Bộ Y tế — 776/QĐ-BYT, 1470/QĐ-BYT, 4128/QĐ-BYT
- Hướng dẫn chăm sóc sức khỏe sinh sản

**Embedding model:** `BAAI/bge-m3` (đa ngôn ngữ, 1024 chiều)

**Vector DB:**
- Production: Qdrant Cloud (`nestai` collection)
- Local/dev: Chroma (không cần cấu hình thêm)

**Safety layer:** Các từ khóa khẩn cấp (ra máu, vỡ ối, co giật...) kích hoạt immediate emergency response — không qua retrieval.

---

## Sơ đồ triển khai (Deployment)

```mermaid
graph LR
    subgraph CLOUD["☁️ Cloud"]
        QDRANT["Qdrant Cloud\n(Vector DB)"]
        SUPA["Supabase\n(PostgreSQL)"]
        OPENAI["OpenAI API\n(GPT-4o-mini)"]
    end

    subgraph SERVER["🖥️ Server / Docker"]
        FE_C["Frontend\n:3000"]
        BE_C["Backend API\n:8000"]
        BOT_C["Bot-Pregnant\n:8001"]
    end

    FE_C --> BE_C
    BE_C --> BOT_C
    BE_C --> SUPA
    BOT_C --> QDRANT
    BOT_C --> OPENAI
```

---

## Luồng dữ liệu RAG (ingestion)

```mermaid
flowchart LR
    RAW["📄 Dữ liệu thô\nVinmec · BYT"] 
    --> CRAWL["🕷️ Crawler\n(Selenium + BS4)"]
    --> PROC["📝 Processed MD\n/data/processed"]
    --> INGEST["⚙️ Ingestion Script"]
    --> EMBED2["📐 BAAI/bge-m3\nEmbedding"]
    --> VDB2[("🧠 Qdrant\nCollection: nestai")]
```

---

## Công nghệ & phụ thuộc chính

```
LangGraph ──────► StateGraph với conditional routing
LangChain ──────► Chains, document loaders, vector stores
LiteLLM ────────► Abstraction layer đa LLM provider
BAAI/bge-m3 ────► Embedding đa ngôn ngữ (HuggingFace)
Qdrant ─────────► Vector database (cloud-native)
FastAPI ────────► Backend API + Bot service
Next.js ────────► Frontend (SSR + App Router)
Flutter ────────► Cross-platform mobile
Supabase ───────► PostgreSQL + Auth + Storage
Docker ─────────► Containerization
```
