"""Standalone FastAPI service for bot-pregnant RAG engine (port 8001).

Runs on Python 3.9 venv to work around the Intel Mac PyTorch 2.2.2 ceiling.
Start: cd src/agents/bot-pregnant && USE_QDRANT=1 ... .venv/bin/python service.py
"""
from __future__ import annotations

import os
import sys
import time
import asyncio
from pathlib import Path
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Bot-Pregnant RAG Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_retriever = None
_generator = None
_cache: dict = {}
_CACHE_TTL = 300

DANGER_KEYWORDS = ["ra máu", "đau bụng dữ dội", "vỡ ối", "co giật", "sốt cao", "thai không máy"]


def _cache_get(question: str, stage: Optional[str]):
    key = (question.strip().lower(), stage.strip().lower() if stage else None)
    entry = _cache.get(key)
    if not entry:
        return None
    ts, payload = entry
    if time.time() - ts > _CACHE_TTL:
        del _cache[key]
        return None
    return payload


def _cache_set(question: str, stage: Optional[str], payload: dict):
    key = (question.strip().lower(), stage.strip().lower() if stage else None)
    _cache[key] = (time.time(), payload)


def get_retriever():
    global _retriever
    if _retriever is None:
        from src.engine.retriever import NoriRetriever
        print("[BOT-SERVICE] Initialising retriever...")
        _retriever = NoriRetriever()
        print("[BOT-SERVICE] Retriever ready")
    return _retriever


def get_generator():
    global _generator
    if _generator is None:
        from src.engine.chains import ResponseGenerator
        _generator = ResponseGenerator(model="gpt-4o-mini")
    return _generator


class QueryRequest(BaseModel):
    question: str
    user_id: str
    stage: Optional[str] = None


class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list


@app.get("/health")
def health():
    return {"status": "ok", "service": "bot-pregnant"}


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    if any(kw in req.question.lower() for kw in DANGER_KEYWORDS):
        return QueryResponse(
            question=req.question,
            answer=(
                "🚨 Đây có thể là dấu hiệu khẩn cấp trong thai kỳ. "
                "Mẹ cần đến cơ sở y tế/sản khoa gần nhất ngay lập tức hoặc gọi cấp cứu."
            ),
            sources=[],
        )

    cached = _cache_get(req.question, req.stage)
    if cached:
        return cached

    retriever = get_retriever()
    generator = get_generator()

    docs = retriever.retrieve(req.question, stage=req.stage)
    if not docs and req.stage:
        docs = retriever.retrieve(req.question, stage=None)

    if not docs:
        return QueryResponse(
            question=req.question,
            answer=(
                "Xin lỗi mẹ, MommyMate hiện chưa tìm được tài liệu tham khảo phù hợp. "
                "Mẹ có thể thử đặt câu hỏi khác hoặc hỏi bác sĩ chuyên khoa."
            ),
            sources=[],
        )

    context = "\n\n".join(doc.page_content for doc in docs)
    answer = await asyncio.to_thread(generator.generate, req.question, context)

    sources = [
        {"content": doc.page_content[:200], "metadata": doc.metadata}
        for doc in docs[:3]
    ]
    payload = {"question": req.question, "answer": answer, "sources": sources}
    _cache_set(req.question, req.stage, payload)
    return payload


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service:app", host="0.0.0.0", port=8001, reload=False)
