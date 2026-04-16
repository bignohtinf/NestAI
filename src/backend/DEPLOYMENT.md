# Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                        │
│              https://nestai.vercel.app                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Ngrok (Backend)                            │
│              https://xxxx-xx-xxx-xxx.ngrok.io               │
│                  FastAPI + Python                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Supabase SDK
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase                                 │
│         PostgreSQL + Auth + Real-time                       │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Deployment (Vercel)

1. **Push code to GitHub:**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Set environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://mogritedueedwdhzbnbp.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     NEXT_PUBLIC_API_URL=https://xxxx-xx-xxx-xxx.ngrok.io
     SUPABASE_SECRET_KEY=your-service-key
     ```
   - Deploy

3. **Update after backend URL changes:**
   - Update `NEXT_PUBLIC_API_URL` in Vercel environment variables
   - Redeploy

## Backend Deployment (Ngrok)

### Local Development with Ngrok

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Or: `brew install ngrok` (macOS)

2. **Setup backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

3. **Add Supabase credentials to `.env`:**
```
SUPABASE_URL=https://mogritedueedwdhzbnbp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=sb_secret_JuW8tIKJyYPW-Ps3-DGO0w_9gs0jZrx
SECRET_KEY=your-secret-key-here
```

4. **Start backend:**
```bash
python main.py
```

Server runs at `http://localhost:8000`

5. **Start ngrok in another terminal:**
```bash
ngrok http 8000
```

You'll see:
```
Forwarding                    https://xxxx-xx-xxx-xxx.ngrok.io -> http://localhost:8000
```

6. **Update frontend API URL:**
   - Copy the ngrok URL
   - Update `NEXT_PUBLIC_API_URL` in frontend `.env`
   - Or update in Vercel environment variables

### Production Deployment

For production, consider:

**Option 1: Railway/Render (Recommended)**
- Deploy backend to Railway or Render
- Get permanent URL
- Update frontend `NEXT_PUBLIC_API_URL`

**Option 2: Keep Ngrok**
- Use ngrok paid plan for permanent URL
- Update frontend once

**Option 3: AWS/GCP/Azure**
- Deploy to cloud provider
- Use custom domain

## Environment Variables

### Frontend (.env)
```
NEXT_PUBLIC_SUPABASE_URL=https://mogritedueedwdhzbnbp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://xxxx-xx-xxx-xxx.ngrok.io
SUPABASE_SECRET_KEY=your-service-key
```

### Backend (.env)
```
SUPABASE_URL=https://mogritedueedwdhzbnbp.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
CORS_ORIGINS=["https://nestai.vercel.app"]
```

## Testing

1. **Test backend locally:**
```bash
curl http://localhost:8000/health
```

2. **Test with ngrok:**
```bash
curl https://xxxx-xx-xxx-xxx.ngrok.io/health
```

3. **Check API docs:**
   - Local: http://localhost:8000/docs
   - Ngrok: https://xxxx-xx-xxx-xxx.ngrok.io/docs

## Troubleshooting

### CORS errors
- Check `CORS_ORIGINS` in backend config
- Make sure frontend URL is in the list

### Ngrok URL changes
- Ngrok free tier changes URL on restart
- Use ngrok paid plan for permanent URL
- Or deploy to permanent hosting

### Supabase connection errors
- Verify credentials in `.env`
- Check Supabase project is active
- Verify RLS policies allow access

## Monitoring

- Backend logs: Check terminal where `python main.py` runs
- Frontend logs: Check Vercel dashboard
- Supabase logs: Check Supabase dashboard
