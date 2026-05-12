# 🚀 Hướng dẫn Deploy NestAI lên GCP

## Tổng quan kiến trúc production

```
[Users]
   │
   ├── Frontend (Vercel hoặc Cloud Run) :3000
   │        │ gọi API
   ├── Backend FastAPI (Cloud Run) :8000
   │        │ gọi bot agent
   ├── Bot-Pregnant (Cloud Run) :8001
   │        │ query vector
   └── Qdrant Cloud (đã có sẵn) ✅
            │ đọc data
        Supabase (đã có sẵn) ✅
```

**Services cần deploy lên GCP:**
| Service | Deploy ở đâu | Image |
|---|---|---|
| `backend` | Cloud Run | `asia-southeast1-docker.pkg.dev/PROJECT_ID/nestai/backend` |
| `bot-pregnant` | Cloud Run | `asia-southeast1-docker.pkg.dev/PROJECT_ID/nestai/bot-pregnant` |
| `frontend` | Vercel (giữ nguyên) hoặc Cloud Run | — |

> Qdrant Cloud & Supabase đã có sẵn, **không cần deploy thêm**.

---

## Bước 1 — Cài đặt & cấu hình GCP

### 1.1 Cài gcloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

### 1.2 Đăng nhập & tạo project

```bash
gcloud auth login

# Tạo project mới (hoặc dùng project đã có)
gcloud projects create nestai-production --name="NestAI Production"

# Set project hiện tại
gcloud config set project nestai-production

# Lấy PROJECT_ID để dùng xuyên suốt
export PROJECT_ID=$(gcloud config get-value project)
echo $PROJECT_ID   # nestai-production
```

### 1.3 Bật các APIs cần thiết

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com
```

> ⏳ Đợi ~1 phút cho APIs khởi động.

### 1.4 Tạo Artifact Registry (nơi lưu Docker images)

```bash
gcloud artifacts repositories create nestai \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="NestAI Docker images"

# Cấu hình Docker xác thực với GCP
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

---

## Bước 2 — Build & Push Docker Images

> Chạy từ thư mục gốc dự án: `A20-App-005/`

```bash
export PROJECT_ID=nestai-production
export REGION=asia-southeast1
export REPO=asia-southeast1-docker.pkg.dev/$PROJECT_ID/nestai
```

### 2.1 Build & push `bot-pregnant` (build trước vì backend phụ thuộc)

> ⚠️ Lệnh build truyền `HF_TOKEN` để download model `BAAI/bge-m3` (~1.5GB) **vào trong image**.
> Cloud Run sẽ không cần download lại mỗi lần cold start.

```bash
# Windows PowerShell
$HF_TOKEN = (Get-Content .env | Select-String "HF_TOKEN").ToString().Split("=")[1]

docker build `
  -f src/agents/bot-pregnant/Dockerfile `
  --build-arg HF_TOKEN=$HF_TOKEN `
  -t $REPO/bot-pregnant:latest `
  .

docker push $REPO/bot-pregnant:latest
```

```bash
# macOS / Linux (Git Bash trên Windows cũng được)
HF_TOKEN=$(grep HF_TOKEN .env | cut -d= -f2)

docker build \
  -f src/agents/bot-pregnant/Dockerfile \
  --build-arg HF_TOKEN=$HF_TOKEN \
  -t $REPO/bot-pregnant:latest \
  .

docker push $REPO/bot-pregnant:latest
```

> ⏳ Build lần đầu mất **15–25 phút** (download + bake model vào image ~3GB).
> Lần sau nếu chỉ sửa code (không đổi model), Docker cache sẽ bỏ qua bước download.

### 2.2 Build & push `backend`

```bash
docker build \
  -f src/backend/Dockerfile \
  -t $REPO/backend:latest \
  .

docker push $REPO/backend:latest
```

> ⏳ Lần đầu build mất ~10 phút do download Python deps + model embedding.

---

## Bước 3 — Lưu secrets vào Secret Manager

Thay vì để API keys trong env file, dùng GCP Secret Manager để bảo mật.

```bash
# Helper function
create_secret() {
  echo -n "$2" | gcloud secrets create $1 --data-file=- 2>/dev/null || \
  echo -n "$2" | gcloud secrets versions add $1 --data-file=-
}

# === Supabase ===
create_secret SUPABASE_URL        "https://mogritedueedwdhzbnbp.supabase.co"
create_secret SUPABASE_ANON_KEY   "<SUPABASE_ANON_KEY>"
create_secret SUPABASE_SERVICE_KEY "<SUPABASE_SERVICE_KEY>"
create_secret SERVICE_ROLE_KEY    "<SERVICE_ROLE_KEY>"

# === JWT ===
create_secret SECRET_KEY "secret_nextai_production_change_me"

# === OpenAI ===
create_secret OPENAI_API_KEY "<OPENAI_API_KEY>"

# === Qdrant Cloud (đã có) ===
create_secret QDRANT_URL     "https://90160c88-00c8-482d-9ad3-93bd4a433894.eu-central-1-0.aws.cloud.qdrant.io:6333"
create_secret QDRANT_API_KEY "<QDRANT_API_KEY>"

# === Other ===
create_secret GOOGLEMAP_API_KEY   "<GOOGLEMAP_API_KEY>"
create_secret FPTAI_API_KEY       "<FPTAI_API_KEY>"
create_secret ANTHROPIC_API_KEY   "<ANTHROPIC_API_KEY>"
create_secret HF_TOKEN            "<HF_TOKEN>"
```

> ⚠️ Thay `<...>` bằng giá trị thực từ file `.env` hiện tại của bạn.

---

## Bước 4 — Deploy `bot-pregnant` lên Cloud Run

```bash
gcloud run deploy nestai-bot-pregnant \
  --image=$REPO/bot-pregnant:latest \
  --region=$REGION \
  --platform=managed \
  --port=8001 \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=5 \
  --timeout=300 \
  --concurrency=10 \
  --no-allow-unauthenticated \
  --set-env-vars="USE_QDRANT=1,QDRANT_COLLECTION=nestai,QDRANT_VECTOR_SIZE=1024,EMBEDDING_MODEL=BAAI/bge-m3,OPENAI_MODEL=gpt-4o-mini,OPENAI_TEMPERATURE=0.2,MODEL=claude-3-sonnet,PROVIDER=anthropic" \
  --set-secrets="QDRANT_URL=QDRANT_URL:latest,QDRANT_API_KEY=QDRANT_API_KEY:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,HF_TOKEN=HF_TOKEN:latest"
```

### Lấy URL của bot-pregnant

```bash
export BOT_URL=$(gcloud run services describe nestai-bot-pregnant \
  --region=$REGION \
  --format='value(status.url)')
echo "Bot URL: $BOT_URL"
# Ví dụ: https://nestai-bot-pregnant-xxxxxxxx-as.a.run.app
```

---

## Bước 5 — Deploy `backend` lên Cloud Run

```bash
# Dùng BOT_URL lấy được ở bước 4
gcloud run deploy nestai-backend \
  --image=$REPO/backend:latest \
  --region=$REGION \
  --platform=managed \
  --port=8000 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --timeout=120 \
  --concurrency=80 \
  --allow-unauthenticated \
  --set-env-vars="ENVIRONMENT=production,ALGORITHM=HS256,ACCESS_TOKEN_EXPIRE_MINUTES=30,OPENAI_MODEL_SCAN_FOOD=gpt-4o,BOT_SERVICE_URL=$BOT_URL,CORS_ORIGINS=[\"https://nestai.vercel.app\"]" \
  --set-secrets="SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_KEY=SUPABASE_SERVICE_KEY:latest,SERVICE_ROLE_KEY=SERVICE_ROLE_KEY:latest,SECRET_KEY=SECRET_KEY:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,GOOGLEMAP_API_KEY=GOOGLEMAP_API_KEY:latest,FPTAI_API_KEY=FPTAI_API_KEY:latest"
```

### Lấy URL backend

```bash
export BACKEND_URL=$(gcloud run services describe nestai-backend \
  --region=$REGION \
  --format='value(status.url)')
echo "Backend URL: $BACKEND_URL"
# Ví dụ: https://nestai-backend-xxxxxxxx-as.a.run.app
```

---

## Bước 6 — Cấu hình IAM (backend gọi bot-pregnant)

Vì `bot-pregnant` dùng `--no-allow-unauthenticated`, backend cần Service Account để gọi được:

```bash
# Tạo service account cho backend
gcloud iam service-accounts create nestai-backend-sa \
  --display-name="NestAI Backend Service Account"

# Cấp quyền gọi bot-pregnant
gcloud run services add-iam-policy-binding nestai-bot-pregnant \
  --region=$REGION \
  --member="serviceAccount:nestai-backend-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

# Gán SA cho backend service
gcloud run services update nestai-backend \
  --region=$REGION \
  --service-account=nestai-backend-sa@$PROJECT_ID.iam.gserviceaccount.com
```

> **Lưu ý:** Nếu backend và bot-pregnant cùng project, có thể dùng `--allow-unauthenticated` cho bot-pregnant nếu muốn đơn giản hơn, nhưng kém bảo mật hơn.

---

## Bước 7 — Cập nhật Frontend

Sau khi deploy backend, cập nhật biến môi trường frontend với URL mới.

### Nếu dùng Vercel (khuyến nghị)

Vào **Vercel → Project Settings → Environment Variables**, cập nhật:

```
NEXT_PUBLIC_API_URL = https://nestai-backend-xxxxxxxx-as.a.run.app
```

Rồi **Redeploy** là xong.

### Nếu muốn deploy Frontend lên Cloud Run

```bash
# Build với production env
docker build \
  -f src/frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://mogritedueedwdhzbnbp.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY> \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
  -t $REPO/frontend:latest \
  src/frontend/

docker push $REPO/frontend:latest

gcloud run deploy nestai-frontend \
  --image=$REPO/frontend:latest \
  --region=$REGION \
  --platform=managed \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5 \
  --allow-unauthenticated
```

---

## Bước 8 — Cập nhật CORS trên Backend

Sau khi có URL frontend production, cập nhật CORS:

```bash
gcloud run services update nestai-backend \
  --region=$REGION \
  --update-env-vars="CORS_ORIGINS=[\"https://nestai.vercel.app\",\"https://nestai-frontend-xxxxxxxx-as.a.run.app\"]"
```

---

## Kiểm tra sau khi deploy

```bash
# Health check backend
curl $BACKEND_URL/health

# Health check bot-pregnant (cần auth token hoặc test qua backend)
curl $BACKEND_URL/api/v1/bot/health

# Xem logs realtime
gcloud run services logs tail nestai-backend --region=$REGION
gcloud run services logs tail nestai-bot-pregnant --region=$REGION
```

---

## Tóm tắt các URLs sau khi deploy

| Service | URL |
|---|---|
| Backend API | `https://nestai-backend-xxxxxxxx-as.a.run.app` |
| Bot-pregnant | `https://nestai-bot-pregnant-xxxxxxxx-as.a.run.app` |
| API Docs | `https://nestai-backend-xxxxxxxx-as.a.run.app/docs` |
| Frontend | `https://nestai.vercel.app` (Vercel) |
| Qdrant Cloud | `https://90160c88-....eu-central-1-0.aws.cloud.qdrant.io` ✅ |
| Supabase | `https://mogritedueedwdhzbnbp.supabase.co` ✅ |

---

## Lỗi thường gặp

### ❌ `Container failed to start`
```bash
# Xem log chi tiết
gcloud run services logs tail nestai-backend --region=asia-southeast1
```
Thường do thiếu biến môi trường → kiểm tra lại `--set-secrets` và `--set-env-vars`.

### ❌ `bot-pregnant timeout khi khởi động`
Model `BAAI/bge-m3` download lâu lần đầu. Tăng `--timeout=600` và `start_period` trong healthcheck.

### ❌ Backend không gọi được bot-pregnant
Kiểm tra IAM: service account của backend phải có `roles/run.invoker` trên bot-pregnant.

### ❌ CORS error từ frontend
Cập nhật `CORS_ORIGINS` trên backend bao gồm đúng domain của frontend.

---

## Cập nhật khi có code mới (CI/CD đơn giản)

```bash
# Rebuild và redeploy backend
docker build -f src/backend/Dockerfile -t $REPO/backend:latest . && \
docker push $REPO/backend:latest && \
gcloud run deploy nestai-backend --image=$REPO/backend:latest --region=$REGION

# Rebuild và redeploy bot-pregnant
docker build -f src/agents/bot-pregnant/Dockerfile -t $REPO/bot-pregnant:latest . && \
docker push $REPO/bot-pregnant:latest && \
gcloud run deploy nestai-bot-pregnant --image=$REPO/bot-pregnant:latest --region=$REGION
```
