from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.routes import auth, users, partnerships, nutrition, health, missions, admin, baby, tasks, food_recommendations, bot_pregnant, chat_history, wellness, blog, medical_profile, stores, notifications_api

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(" Backend starting...")
    try:
        await bot_pregnant.warm_up_llm()
    except Exception as exc:
        print(f"[BOT] Warning: OpenAI warm-up did not complete at startup: {exc}")
    yield
    # Shutdown
    print(" Backend shutting down...")

app = FastAPI(
    title="NestAI Backend",
    description="API for family nutrition & health tracking",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
# max_age=86400 → browser cache CORS preflight (OPTIONS) trong 24h thay vì
# preflight lại cho mỗi request. Trước đây mỗi fetch cross-origin bị nhân đôi
# round-trip vì preflight không cache; setting này loại bỏ ~50% request đến
# Cloud Run (đặc biệt với endpoint hay được gọi như /api/users/me,
# /api/notifications, /api/recommendations).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(partnerships.router, prefix="/api/partnerships", tags=["partnerships"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["nutrition"])
app.include_router(food_recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(missions.router, prefix="/api/missions", tags=["missions"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(baby.router, prefix="/api/babies", tags=["babies"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(chat_history.router, prefix="/api/chat-history", tags=["chat-history"])
app.include_router(wellness.router, prefix="/api/wellness", tags=["wellness"])
app.include_router(blog.router, prefix="/api/blog", tags=["blog"])
app.include_router(medical_profile.router, prefix="/api/medical-profile", tags=["medical-profile"])
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(notifications_api.router)
app.include_router(bot_pregnant.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
