"""Proxy route — forwards bot-pregnant requests to the standalone RAG service (port 8001).

The RAG service (src/agents/bot-pregnant/service.py) runs on Python 3.9 to avoid
the PyTorch/Intel-Mac wheel limitation (max torch 2.2.2 on x86_64).
Start it with: cd src/agents/bot-pregnant && USE_QDRANT=1 ... .venv/bin/python service.py
"""
from __future__ import annotations

import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

BOT_SERVICE_URL = os.getenv("BOT_SERVICE_URL", "http://localhost:8001")

router = APIRouter(prefix="/api/bot-pregnant", tags=["bot-pregnant"])


class QueryRequest(BaseModel):
    question: str
    user_id: str
    stage: Optional[str] = None


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[dict]


async def warm_up_llm() -> None:
    print(f"[BOT-PROXY] RAG service expected at {BOT_SERVICE_URL}")


@router.post("/query", response_model=QueryResponse)
async def query_bot(request: QueryRequest):
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                f"{BOT_SERVICE_URL}/query",
                json=request.model_dump(),
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail="Bot-pregnant service not running. Start: cd src/agents/bot-pregnant && .venv/bin/python service.py",
            )
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)


@router.get("/health")
async def health_check():
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(f"{BOT_SERVICE_URL}/health")
            return resp.json()
        except Exception:
            raise HTTPException(status_code=503, detail="Bot-pregnant service unavailable")
