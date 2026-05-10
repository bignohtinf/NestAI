# Hướng dẫn Deploy NestAI lên AWS
> Chiến lược: Self-hosted Supabase + EC2 Docker Compose  
> Cập nhật: 2026-05-09

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                             │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
       ┌───────▼────────┐        ┌────────▼────────┐
       │   Vercel       │        │   AWS EC2 #1    │
       │  (Frontend)    │        │  Supabase       │
       │  Next.js       │        │  self-hosted    │
       │  nestai.vercel │        │  t3.large       │
       │  .app          │        │  port 8000(Kong)│
       └───────┬────────┘        └────────┬────────┘
               │                          │
               │         ┌────────────────┘
               │         │
       ┌───────▼─────────▼──────────────────┐
       │          AWS EC2 #2                 │
       │       NestAI App Server             │
       │       t3.xlarge                     │
       │  ┌──────────┐  ┌─────────────────┐ │
       │  │ Backend  │  │  bot-pregnant   │ │
       │  │ FastAPI  │  │  RAG Service    │ │
       │  │ :8000    │  │  :8001          │ │
       │  └──────────┘  └─────────────────┘ │
       │  ┌──────────────────────────────┐  │
       │  │         Nginx (SSL)          │  │
       │  │   api.yourdomain.com         │  │
       │  └──────────────────────────────┘  │
       └────────────────────────────────────┘
                          │
              ┌───────────▼──────────┐
              │   Qdrant Cloud       │
              │   (đang dùng sẵn)    │
              │   eu-central-1 AWS   │
              └──────────────────────┘
```

**Tóm tắt:**
- **EC2 #1** — Supabase self-hosted (PostgreSQL + Auth + Kong gateway)
- **EC2 #2** — NestAI app (Backend FastAPI + Bot-pregnant + Nginx)
- **Vercel** — Frontend Next.js (giữ nguyên, chỉ đổi env)
- **Qdrant Cloud** — Đang dùng sẵn trên AWS eu-central-1, giữ nguyên

---

## PHẦN 1 — Chuẩn bị trước khi bắt đầu

### 1.1 Cài đặt Supabase CLI (máy local)

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

### 1.2 Cài đặt AWS CLI (máy local)

```bash
# macOS
brew install awscli

# Windows
winget install Amazon.AWSCLI

# Cấu hình credentials
aws configure
# AWS Access Key ID: <key từ IAM>
# AWS Secret Access Key: <secret>
# Default region: ap-southeast-1  (Singapore - gần VN nhất)
# Default output format: json
```

### 1.3 Lấy thông tin kết nối Supabase cloud hiện tại

Vào **Supabase Dashboard** → Project Settings → Database:
- Ghi lại **Host**, **Database name**, **Port**, **Password**
- Ghi lại **Project URL** và **API keys** (anon + service_role)

---

## PHẦN 2 — Export data từ Supabase Cloud

### 2.1 Export toàn bộ database (schema + data)

```bash
# Chạy trên máy local
# Thay YOUR_DB_PASSWORD bằng password từ Supabase Dashboard

supabase db dump \
  --db-url "postgresql://postgres.mogritedueedwdhzbnbp:YOUR_DB_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" \
  -f nestai_full_backup.sql

# Kiểm tra file đã được tạo
ls -lh nestai_full_backup.sql
```

> **Lưu ý:** Nếu lệnh trên báo lỗi kết nối, vào Supabase Dashboard → Settings → Database → "Direct connection" để lấy connection string chính xác.

### 2.2 Export riêng Auth users (quan trọng!)

Supabase lưu users trong schema `auth` riêng biệt, cần export thêm:

```bash
supabase db dump \
  --db-url "postgresql://postgres.mogritedueedwdhzbnbp:YOUR_DB_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" \
  --schema auth \
  -f nestai_auth_backup.sql
```

### 2.3 Backup file lên S3 (tùy chọn nhưng nên làm)

```bash
aws s3 mb s3://nestai-backups-$(date +%Y%m%d)
aws s3 cp nestai_full_backup.sql s3://nestai-backups-$(date +%Y%m%d)/
aws s3 cp nestai_auth_backup.sql s3://nestai-backups-$(date +%Y%m%d)/
```

---

## PHẦN 3 — Tạo hạ tầng AWS

### 3.1 Tạo Security Groups

Vào **AWS Console → EC2 → Security Groups → Create**:

**Security Group cho Supabase EC2 (#1):**

| Type | Protocol | Port | Source | Mô tả |
|------|----------|------|--------|-------|
| SSH | TCP | 22 | Your IP/32 | SSH access |
| Custom TCP | TCP | 8000 | EC2 #2 SG | Kong API Gateway |
| Custom TCP | TCP | 5432 | EC2 #2 SG | PostgreSQL direct |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | Kong (tạm thời để test) |

**Security Group cho App EC2 (#2):**

| Type | Protocol | Port | Source | Mô tả |
|------|----------|------|--------|-------|
| SSH | TCP | 22 | Your IP/32 | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Nginx |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Nginx SSL |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | Backend API (tạm) |
| Custom TCP | TCP | 8001 | EC2 #1 SG | Bot-pregnant |

### 3.2 Tạo EC2 #1 — Supabase Server

```
AMI: Ubuntu Server 22.04 LTS (HVM)
Instance type: t3.large (2 vCPU, 8GB RAM) — tối thiểu cho Supabase
Storage: 30GB gp3 (tăng lên 100GB nếu data lớn)
Key pair: Tạo mới hoặc dùng key có sẵn
Security Group: Supabase SG (vừa tạo ở trên)
```

**Sau khi tạo xong, ghi lại Public IP của EC2 #1.**

### 3.3 Tạo EC2 #2 — App Server

```
AMI: Ubuntu Server 22.04 LTS (HVM)
Instance type: t3.xlarge (4 vCPU, 16GB RAM)
  → bot-pregnant load model BAAI/bge-m3 cần RAM nhiều
Storage: 50GB gp3
Key pair: Cùng key với EC2 #1
Security Group: App SG (vừa tạo)
```

---

## PHẦN 4 — Cài đặt Supabase Self-Hosted trên EC2 #1

### 4.1 Kết nối vào EC2 #1

```bash
ssh -i your-key.pem ubuntu@<EC2-1-PUBLIC-IP>
```

### 4.2 Cài đặt Docker và Docker Compose

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Kiểm tra
docker --version
docker compose version
```

### 4.3 Clone và cấu hình Supabase

```bash
# Clone repo Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copy file env mẫu
cp .env.example .env
```

### 4.4 Sinh các secret bảo mật

```bash
# Sinh JWT Secret (dùng lệnh này, copy kết quả)
openssl rand -base64 32

# Sinh Anon Key và Service Role Key
# Cách dễ nhất: dùng Supabase CLI trên máy local
# Hoặc dùng trang: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
```

**Cách sinh key bằng Supabase CLI (chạy trên máy local):**
```bash
# Tạo JWT Secret trước
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET: $JWT_SECRET"

# Sinh anon key
supabase token sign --secret $JWT_SECRET --role anon --expiry 99999999

# Sinh service_role key  
supabase token sign --secret $JWT_SECRET --role service_role --expiry 99999999
```

### 4.5 Chỉnh sửa file .env trên EC2 #1

```bash
nano .env
```

Thay thế các giá trị quan trọng sau:

```env
############
# Secrets - THAY THẾ TẤT CẢ CÁC GIÁ TRỊ NÀY
############

POSTGRES_PASSWORD=your-super-secret-postgres-password-here
JWT_SECRET=your-jwt-secret-from-step-above
ANON_KEY=your-anon-key-from-step-above
SERVICE_ROLE_KEY=your-service-role-key-from-step-above

############
# API - Cấu hình domain
############

SITE_URL=http://<EC2-1-PUBLIC-IP>:3000
ADDITIONAL_REDIRECT_URLS=
API_EXTERNAL_URL=http://<EC2-1-PUBLIC-IP>:8000

############
# Database
############

POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# Studio
############

STUDIO_DEFAULT_ORGANIZATION=NestAI
STUDIO_DEFAULT_PROJECT=nestai-production

############
# Email (dùng SMTP của bạn, hoặc để trống nếu chưa cần)
############

SMTP_ADMIN_EMAIL=admin@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME=NestAI
```

### 4.6 Khởi động Supabase

```bash
# Pull images và start
docker compose up -d

# Kiểm tra tất cả containers đang chạy
docker compose ps

# Xem logs nếu có lỗi
docker compose logs -f
```

Chờ khoảng 2-3 phút để tất cả services khởi động. Kết quả mong đợi:
```
NAME                STATUS
supabase-db         running
supabase-auth       running
supabase-rest       running
supabase-realtime   running
supabase-storage    running
supabase-kong       running
supabase-studio     running
```

### 4.7 Kiểm tra Supabase đang hoạt động

```bash
# Test Kong API gateway
curl http://localhost:8000/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Mở Studio qua browser (cần mở port 3000 tạm thời)
# http://<EC2-1-PUBLIC-IP>:3000
```

---

## PHẦN 5 — Import Data vào Supabase Self-Hosted

### 5.1 Upload file backup lên EC2 #1

```bash
# Chạy trên máy LOCAL
scp -i your-key.pem nestai_full_backup.sql ubuntu@<EC2-1-PUBLIC-IP>:~/
scp -i your-key.pem nestai_auth_backup.sql ubuntu@<EC2-1-PUBLIC-IP>:~/
```

### 5.2 Import vào PostgreSQL

```bash
# Trên EC2 #1, lấy container name của db
docker ps | grep supabase-db

# Import schema + data chính
docker exec -i supabase-db psql -U postgres -d postgres < ~/nestai_full_backup.sql

# Import auth users
docker exec -i supabase-db psql -U postgres -d postgres < ~/nestai_auth_backup.sql
```

### 5.3 Verify data đã import thành công

```bash
docker exec -it supabase-db psql -U postgres -d postgres -c "\dt public.*"
docker exec -it supabase-db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM public.users;"
```

### 5.4 Kiểm tra data import

```bash
# Xem các bảng chính và số dòng
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 15;"
```

> **Về pgvector:** Migration 011/012 tạo extension vector trong Supabase, nhưng luồng hiện tại của backend không thực sự dùng — `VectorSearchService` có hàm `_verify_pgvector_available()` và tự fallback sang difflib string matching nếu pgvector không available. Không cần enable thủ công, hệ thống vẫn hoạt động bình thường.
>
> **Về bot-pregnant:** Toàn bộ vector search của RAG chatbot đi qua **Qdrant Cloud** (eu-central-1 AWS) — không liên quan Supabase. Endpoint Qdrant không đổi, không cần làm gì thêm.

---

## PHẦN 6 — Deploy NestAI App trên EC2 #2

### 6.1 Kết nối vào EC2 #2

```bash
ssh -i your-key.pem ubuntu@<EC2-2-PUBLIC-IP>
```

### 6.2 Cài đặt Docker, Git

```bash
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Cài Git
sudo apt-get install -y git
```

### 6.3 Clone dự án lên EC2 #2

```bash
# Option A: Dùng Git (nếu có repo)
git clone https://github.com/your-username/nestai.git
cd nestai

# Option B: Upload trực tiếp từ máy local
# Chạy trên máy LOCAL:
# rsync -avz -e "ssh -i your-key.pem" \
#   --exclude 'node_modules' --exclude '.next' --exclude '__pycache__' \
#   --exclude '.git' --exclude '*.pyc' \
#   D:\Vin\projects\A20-App-005/ \
#   ubuntu@<EC2-2-PUBLIC-IP>:~/nestai/
```

### 6.4 Tạo file .env cho production trên EC2 #2

```bash
cd ~/nestai
nano .env
```

```env
# ============================================================
# NestAI Production Environment — EC2 #2
# ============================================================

# === Supabase (trỏ vào EC2 #1) ===
NEXT_PUBLIC_SUPABASE_URL=http://<EC2-1-PUBLIC-IP>:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY_từ_bước_4.4>
SUPABASE_SERVICE_KEY=<SERVICE_ROLE_KEY_từ_bước_4.4>

# === JWT ===
SECRET_KEY=<sinh bằng: openssl rand -base64 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# === AI APIs ===
ANTHROPIC_API_KEY=<key của bạn>
OPENAI_API_KEY=<key của bạn>
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
OPENAI_MAX_TOKENS=1024
OPENAI_MODEL_SCAN_FOOD=gpt-4o

# === HuggingFace ===
HF_TOKEN=<token của bạn>

# === Qdrant Cloud (giữ nguyên) ===
USE_QDRANT=1
QDRANT_URL=https://90160c88-00c8-482d-9ad3-93bd4a433894.eu-central-1-0.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=<key của bạn>
QDRANT_COLLECTION=nestai
QDRANT_VECTOR_SIZE=1024
QDRANT_BATCH_SIZE=16
QDRANT_TIMEOUT_SECONDS=300
QDRANT_MAX_RETRIES=5

# === Embedding ===
EMBEDDING_MODEL=BAAI/bge-m3
EMBEDDING_BATCH_SIZE=16

# === App ===
ENVIRONMENT=production
BACKEND_URL=https://api.yourdomain.com
BOT_SERVICE_URL=http://bot-pregnant:8001
CORS_ORIGINS=["https://nestai.vercel.app","https://yourdomain.com"]
```

### 6.5 Tạo file .env cho Backend riêng

```bash
nano src/backend/.env
```

```env
SUPABASE_URL=http://<EC2-1-PRIVATE-IP>:8000
SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_KEY=<SERVICE_ROLE_KEY>
SECRET_KEY=<same as above>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ENVIRONMENT=production
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGINS=["https://nestai.vercel.app","https://yourdomain.com"]
OPENAI_API_KEY=<key>
OPENAI_MODEL_SCAN_FOOD=gpt-4o
```

> **Lưu ý về IP:** Dùng **Private IP** của EC2 #1 để giao tiếp nội bộ AWS (không mất phí bandwidth và bảo mật hơn). Xem Private IP trong EC2 Console.

### 6.6 Tạo docker-compose.prod.yml

```bash
nano docker-compose.prod.yml
```

```yaml
# ============================================================
# NestAI — Docker Compose PRODUCTION
# ============================================================

networks:
  nestai-network:
    driver: bridge

services:
  bot-pregnant:
    build:
      context: .
      dockerfile: src/agents/bot-pregnant/Dockerfile
    container_name: nestai-bot-pregnant
    ports:
      - "8001:8001"
    env_file:
      - ./.env
    environment:
      - HF_TOKEN=${HF_TOKEN}
    networks:
      - nestai-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8001/health')\" || exit 1"]
      interval: 30s
      timeout: 10s
      start_period: 120s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: src/backend/Dockerfile
    container_name: nestai-backend
    ports:
      - "8000:8000"
    env_file:
      - ./src/backend/.env
      - ./.env
    environment:
      - HF_TOKEN=${HF_TOKEN}
      - BOT_SERVICE_URL=http://bot-pregnant:8001
    # PRODUCTION: không dùng --reload
    command: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
    networks:
      - nestai-network
    depends_on:
      bot-pregnant:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health')\" || exit 1"]
      interval: 30s
      timeout: 10s
      start_period: 30s
      retries: 3
```

### 6.7 Build và chạy app

```bash
cd ~/nestai

# Build images (lần đầu mất 10-15 phút vì tải model)
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Theo dõi logs
docker compose -f docker-compose.prod.yml logs -f

# Kiểm tra health
curl http://localhost:8000/health
curl http://localhost:8001/health
```

---

## PHẦN 7 — Cấu hình Nginx + SSL trên EC2 #2

### 7.1 Cài Nginx và Certbot

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 7.2 Trỏ DNS trước khi xin SSL

Vào DNS provider (Cloudflare / Route53 / etc.), thêm record:
```
A    api.yourdomain.com    <EC2-2-PUBLIC-IP>
```

Chờ DNS propagate (thường 5-15 phút).

### 7.3 Tạo Nginx config

```bash
sudo nano /etc/nginx/sites-available/nestai
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Backend API
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://nestai.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Upload limit
    client_max_body_size 50M;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nestai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7.4 Xin SSL certificate

```bash
sudo certbot --nginx -d api.yourdomain.com \
  --email your-email@gmail.com \
  --agree-tos --non-interactive

# Certbot sẽ tự sửa config Nginx để dùng SSL
sudo systemctl reload nginx
```

### 7.5 Auto-renew SSL

```bash
# Kiểm tra timer đã được cài tự động
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## PHẦN 8 — Cập nhật Frontend (Vercel)

### 8.1 Cập nhật Environment Variables trên Vercel

Vào **Vercel Dashboard → Project → Settings → Environment Variables**, cập nhật:

```
NEXT_PUBLIC_SUPABASE_URL        = http://<EC2-1-PUBLIC-IP>:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY   = <ANON_KEY_mới>
NEXT_PUBLIC_SUPABASE_KEY        = <ANON_KEY_mới>
SUPABASE_SECRET_KEY             = <SERVICE_ROLE_KEY_mới>
NEXT_PUBLIC_API_URL             = https://api.yourdomain.com
```

> **Quan trọng:** Nếu frontend gọi Supabase trực tiếp (như hiện tại qua `lib/supabase.ts`), EC2 #1 phải có public IP và port 8000 mở cho internet.

### 8.2 Redeploy frontend

```bash
# Trigger redeploy trên Vercel (hoặc push code)
vercel --prod
```

---

## PHẦN 9 — Cập nhật CORS trên EC2 #1 (Supabase)

Supabase self-hosted cần cho phép frontend Vercel gọi Auth:

```bash
# Trên EC2 #1
cd ~/supabase/docker
nano .env
```

Thêm/cập nhật:
```env
SITE_URL=https://nestai.vercel.app
ADDITIONAL_REDIRECT_URLS=https://nestai.vercel.app,https://yourdomain.com
API_EXTERNAL_URL=http://<EC2-1-PUBLIC-IP>:8000
```

```bash
# Restart để apply config
docker compose restart auth kong
```

---

## PHẦN 10 — Checklist kiểm tra sau deploy

### Backend API
```bash
# Health check
curl https://api.yourdomain.com/health

# Test auth endpoint
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass"}'

# Test bot
curl https://api.yourdomain.com/api/chat
```

### Database
```bash
# Trên EC2 #1: Kiểm tra data
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "SELECT schemaname, tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 10;"
```

### Checklist tổng

- [ ] EC2 #1 (Supabase): tất cả containers running
- [ ] EC2 #2 (App): backend và bot-pregnant running
- [ ] Nginx SSL: https hoạt động trên api.yourdomain.com
- [ ] Frontend Vercel: env vars đã cập nhật và redeploy
- [ ] Auth flow: đăng ký / đăng nhập hoạt động
- [ ] Database: data đã import đầy đủ
- [ ] Bot-pregnant: chat API trả lời đúng
- [ ] Qdrant: vector search vẫn hoạt động (endpoint không đổi)
- [ ] pgvector extension: đã enable

---

## PHẦN 11 — Bảo mật production (quan trọng!)

### 11.1 Đóng các port không cần thiết

Sau khi verify xong, vào Security Groups:
- EC2 #1: **Xóa rule** port 8000 từ `0.0.0.0/0`, chỉ giữ từ EC2 #2 Security Group và Vercel IP ranges
- EC2 #2: Đóng port 8000 trực tiếp (chỉ để Nginx proxy)

### 11.2 Setup automatic backups

```bash
# Tạo script backup hàng ngày trên EC2 #1
cat > ~/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec supabase-db pg_dump -U postgres postgres \
  | gzip > /tmp/nestai_backup_$DATE.sql.gz
aws s3 cp /tmp/nestai_backup_$DATE.sql.gz s3://your-backup-bucket/
rm /tmp/nestai_backup_$DATE.sql.gz
EOF

chmod +x ~/backup.sh

# Chạy lúc 2AM mỗi ngày
crontab -e
# Thêm dòng: 0 2 * * * /home/ubuntu/backup.sh
```

### 11.3 Đổi Supabase Studio password

Mặc định Studio không có auth. Thêm basic auth qua Nginx hoặc disable hoàn toàn:

```bash
# Trên EC2 #1, sửa docker-compose.yml để không expose Studio ra ngoài
# Hoặc chỉ cho phép truy cập qua SSH tunnel:
ssh -i key.pem -L 3000:localhost:3000 ubuntu@<EC2-1-IP>
# Rồi mở http://localhost:3000 trên máy local
```

---

## Tổng hợp chi phí AWS ước tính

| Resource | Specs | Chi phí/tháng (ap-southeast-1) |
|----------|-------|-------------------------------|
| EC2 #1 (Supabase) | t3.large | ~$60 |
| EC2 #2 (App) | t3.xlarge | ~$120 |
| EBS Storage (80GB total) | gp3 | ~$7 |
| Bandwidth | ~100GB/tháng | ~$9 |
| **Tổng** | | **~$196/tháng** |

> Có thể dùng **Reserved Instances** (cam kết 1 năm) để giảm 30-40%, còn khoảng $120-140/tháng.

---

## Troubleshooting thường gặp

**Supabase containers không start:**
```bash
docker compose logs supabase-db  # Xem lỗi DB
docker compose logs supabase-auth  # Xem lỗi Auth
```

**bot-pregnant chậm start (>2 phút):**
Bình thường — model BAAI/bge-m3 cần tải ~1.5GB. Kiểm tra:
```bash
docker logs nestai-bot-pregnant -f
```

**CORS error từ frontend:**
Kiểm tra lại `CORS_ORIGINS` trong `src/backend/.env` và restart backend.

**Auth không hoạt động sau migration:**
JWT Secret của Supabase self-hosted khác với cloud. Tất cả sessions cũ sẽ hết hạn — users cần login lại. Đây là bình thường.

**Nutrition scan không tìm được món ăn:**
Bình thường nếu pgvector không được enable — code tự fallback sang difflib (string matching). Nếu muốn semantic search chính xác hơn thì enable pgvector:
```bash
docker exec -it supabase-db psql -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
# Rồi chạy lại migration 011, 012 nếu cần
```
Nhưng không bắt buộc — flow hiện tại không dùng pgvector.
