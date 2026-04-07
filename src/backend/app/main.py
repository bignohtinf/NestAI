from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal

app = FastAPI(title="NutriGrid Backend")

Role = Literal["admin", "staff"]


class LoginRequest(BaseModel):
  email: str
  password: str
  rememberMe: Optional[bool] = False


class UserOut(BaseModel):
  id: str
  email: str
  name: str
  role: Role
  is_active: bool = True
  created_at: Optional[str] = None
  last_login: Optional[str] = None


DEMO_USERS = {
  "admin@school.edu": {
    "id": "admin-1",
    "email": "admin@school.edu",
    "name": "Admin Demo",
    "role": "admin",
    "password": "Admin@123",
    "is_active": True,
  },
  "staff1@school.edu": {
    "id": "staff-1",
    "email": "staff1@school.edu",
    "name": "Staff Demo",
    "role": "staff",
    "password": "Staff@123",
    "is_active": True,
  },
}


@app.get("/health")
async def health():
  return {"status": "ok"}


@app.post("/auth/login", response_model=UserOut)
async def login(payload: LoginRequest):
  user_record = DEMO_USERS.get(payload.email.lower())
  if not user_record:
    raise HTTPException(status_code=401, detail="Invalid credentials")

  # NOTE: demo only, dùng plain-text; thực tế nên dùng bcrypt
  if payload.password != user_record["password"]:
    raise HTTPException(status_code=401, detail="Invalid credentials")

  if not user_record.get("is_active", True):
    raise HTTPException(status_code=403, detail="User inactive")

  return UserOut(
    id=user_record["id"],
    email=user_record["email"],
    name=user_record["name"],
    role=user_record["role"],
    is_active=user_record.get("is_active", True),
  )

