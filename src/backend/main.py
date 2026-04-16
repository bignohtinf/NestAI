from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.routes import auth, users, partnerships, nutrition, health, missions, admin, baby

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(" Backend starting...")
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(partnerships.router, prefix="/api/partnerships", tags=["partnerships"])
app.include_router(nutrition.router, prefix="/api/nutrition", tags=["nutrition"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(missions.router, prefix="/api/missions", tags=["missions"])
app.include_router(baby.router, prefix="/api/babies", tags=["babies"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
