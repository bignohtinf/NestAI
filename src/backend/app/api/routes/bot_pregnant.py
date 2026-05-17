"""Proxy route — forwards bot-pregnant requests to the standalone RAG service (port 8001).

The RAG service (src/agents/bot-pregnant/service.py) runs on Python 3.9 to avoid
the PyTorch/Intel-Mac wheel limitation (max torch 2.2.2 on x86_64).
Start it with: cd src/agents/bot-pregnant && USE_QDRANT=1 ... .venv/bin/python service.py
"""
from __future__ import annotations

import logging
import os
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)
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
    logger.info(f"[BOT-PROXY] RAG service expected at {BOT_SERVICE_URL}")


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


class TitleRequest(BaseModel):
    question: str

class StreamRequest(BaseModel):
    user_id: str
    question: str
    conversation_id: Optional[str] = None
    chat_history: list[dict] = []
    user_profile: Optional[dict] = None
    stage: Optional[str] = None

@router.post("/generate-title")
async def generate_title(request: TitleRequest):
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                f"{BOT_SERVICE_URL}/generate-title",
                json=request.model_dump(),
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            # Fallback title if RAG service fails
            return {"title": "Cuộc trò chuyện mới", "is_greeting": False}

@router.post("/stream")
async def stream_bot(request: StreamRequest):
    async def event_generator():
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{BOT_SERVICE_URL}/stream",
                    json=request.model_dump(),
                ) as resp:
                    resp.raise_for_status()
                    async for line in resp.aiter_lines():
                        if line:
                            yield f"{line}\n\n"
            except Exception as e:
                yield f"data: {{\"type\": \"error\", \"error\": \"{str(e)}\"}}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/health")
async def health_check():
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(f"{BOT_SERVICE_URL}/health")
            return resp.json()
        except Exception:
            raise HTTPException(status_code=503, detail="Bot-pregnant service unavailable")
