# NestAI Backend

Backend API cho ứng dụng quản lý sức khỏe gia đình.

## Kiến trúc

```
backend/
├── app/
│   ├── api/
│   │   └── routes/          # API endpoints
│   ├── core/                # Config, Supabase client, security
│   ├── schemas/             # Pydantic schemas
│   └── services/            # Business logic
├── main.py                  # FastAPI app entry
├── requirements.txt
└── .env.example
```

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Setup environment:**
```bash
cp .env.example .env
```

Thêm Supabase credentials vào `.env`:
```
SUPABASE_URL=https://mogritedueedwdhzbnbp.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

3. **Start server:**
```bash
python main.py
```

Server sẽ chạy tại `http://localhost:8000`

## Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel deploy
```

### Ngrok (Backend)
```bash
pip install -r requirements.txt
python main.py
ngrok http 8000
```

Copy ngrok URL và update `NEXT_PUBLIC_API_URL` ở frontend.

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database

Sử dụng **Supabase** cho tất cả data:
- Authentication (Supabase Auth)
- Database (PostgreSQL)
- Real-time subscriptions
- Storage (nếu cần)

Không cần database riêng, backend chỉ gọi Supabase API.

## Features

- ✅ User authentication (Supabase Auth + JWT)
- ✅ Partnership management
- ✅ Nutrition tracking
- ✅ Baby milestones
- ✅ Budget management
- ✅ Missions & achievements
- ✅ Admin dashboard

