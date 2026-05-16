"""Standalone FastAPI service for bot-pregnant RAG engine (port 8001).

Runs on Python 3.9 venv to work around the Intel Mac PyTorch 2.2.2 ceiling.
Start: cd src/agents/bot-pregnant && USE_QDRANT=1 ... .venv/bin/python service.py
"""
from __future__ import annotations

import sys
import time
import asyncio
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from contextlib import asynccontextmanager


# --- Suppress noisy /health logs ---
class _HealthFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return "/health" not in record.getMessage()

logging.getLogger("uvicorn.access").addFilter(_HealthFilter())

sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Pre-warm models so the first request is fast
    print("[BOT-SERVICE] Pre-warming models on startup...")
    try:
        # Initializing retriever and generator
        await asyncio.to_thread(get_retriever)
        await asyncio.to_thread(get_generator)
        print("[BOT-SERVICE] Models warmed up and ready.")
    except Exception as e:
        print(f"[BOT-SERVICE] Error during pre-warming: {e}")
    yield

app = FastAPI(title="Bot-Pregnant RAG Service", version="1.0.0", lifespan=lifespan)
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


def convert_chat_history(chat_history: List[ChatMessage]) -> List[Dict[str, str]]:
    """Convert ChatMessage objects to LangChain-compatible message dicts.
    
    For any chat history, converts each message to a dict with role and content.
    Preserves chronological order and role information.
    
    **Validates: Requirements 1.2, 1.3**
    """
    messages = []
    for msg in chat_history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    return messages


def format_system_prompt(user_profile: Optional[UserProfile]) -> str:
    """Inject user profile into system prompt.
    
    For any user profile data, formats and injects all profile fields into the system prompt.
    If profile is missing, returns base system prompt.
    
    **Validates: Requirements 2.1, 2.3**
    """
    base_prompt = (
        "Bạn là Nori, một trợ lý AI chuyên tư vấn dinh dưỡng cho phụ nữ mang thai. "
        "Hãy cung cấp lời khuyên an toàn, dựa trên bằng chứng khoa học."
    )
    
    if not user_profile:
        return base_prompt
    
    profile_text = "\n\nThông tin người dùng:\n"
    if user_profile.gestation_weeks is not None:
        # Hiển thị giống header: "X tuần Y ngày"
        days = user_profile.days_in_week
        if days:
            profile_text += f"- Tuần thai kỳ: {user_profile.gestation_weeks} tuần {days} ngày\n"
        else:
            profile_text += f"- Tuần thai kỳ: {user_profile.gestation_weeks} tuần\n"
    if user_profile.weight:
        profile_text += f"- Cân nặng: {user_profile.weight} kg\n"
    if user_profile.condition and user_profile.condition != "none":
        profile_text += f"- Tình trạng sức khỏe: {user_profile.condition}\n"
    if user_profile.food_preference:
        profile_text += f"- Hạn chế thực phẩm: {user_profile.food_preference}\n"
    
    return base_prompt + profile_text


def process_query(req: QueryRequest) -> Dict[str, Any]:
    """Process enriched query request with chat history and user profile.
    
    Converts chat_history to LangChain messages, formats user_profile into context,
    and prepares data for LangGraph invocation.
    
    **Validates: Requirements 1.3, 2.2, 4.3, 4.4**
    """
    # Convert chat history to message format
    messages = convert_chat_history(req.chat_history)
    
    # Format system prompt with user profile
    system_prompt = format_system_prompt(req.user_profile)
    
    return {
        "messages": messages,
        "system_prompt": system_prompt,
        "question": req.question,
        "user_profile": req.user_profile.dict() if req.user_profile else None
    }


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[str] = None


class UserProfile(BaseModel):
    id: str
    name: str
    gestation_weeks: Optional[int] = None
    days_in_week: Optional[int] = None   # số ngày lẻ trong tuần — giống header hiển thị "X tuần Y ngày"
    weight: Optional[float] = None
    condition: Optional[str] = None  # 'gdm', 'anemia', 'hypertension', 'none'
    food_preference: Optional[str] = None
    baby_status: Optional[str] = None  # 'pregnant', 'born'


class QueryRequest(BaseModel):
    user_id: str
    question: str
    conversation_id: Optional[str] = None
    chat_history: List[ChatMessage] = []
    user_profile: Optional[UserProfile] = None
    stage: Optional[str] = None


class StreamRequest(BaseModel):
    user_id: str
    question: str
    conversation_id: Optional[str] = None
    chat_history: List[ChatMessage] = []
    user_profile: Optional[UserProfile] = None
    stage: Optional[str] = None


class QueryResponse(BaseModel):
    response: str
    metadata: Dict[str, Any] = {}


class StreamEvent(BaseModel):
    type: str  # 'token' or 'done'
    content: Optional[str] = None
    timestamp: str
    error: Optional[str] = None


class TitleRequest(BaseModel):
    question: str

class TitleResponse(BaseModel):
    title: str
    is_greeting: bool

@app.post("/generate-title", response_model=TitleResponse)
async def generate_title(req: TitleRequest):
    """Generate a short title from the first question, ignoring greetings."""
    q = req.question.strip().lower()
    greetings = ["hello", "hi", "hey", "xin chào", "chào", "hi nori", "chào nori"]
    
    if q in greetings or len(q) < 5:
        return TitleResponse(title="Cuộc trò chuyện mới", is_greeting=True)
    
    generator = get_generator()
    # Prompt the LLM to generate a very short title (2-4 words) in Vietnamese
    prompt = f"Tạo một tiêu đề cực kỳ ngắn gọn (2-4 từ) cho cuộc trò chuyện bắt đầu bằng nội dung này: '{req.question}'. Chỉ trả về tiêu đề, không thêm gì khác. Ví dụ: 'Dinh dưỡng tiểu đường', 'Bổ sung sắt'."
    
    try:
        title = await asyncio.to_thread(
            generator.generate,
            prompt,
            "", # no context needed
            safety_level="safe"
        )
        # Clean up the title (remove quotes, trailing dots)
        title = title.strip().strip('"').strip("'").strip(".").strip(":")
        if not title:
            return TitleResponse(title="Cuộc trò chuyện mới", is_greeting=False)
        return TitleResponse(title=title, is_greeting=False)
    except Exception as e:
        print(f"Error generating title: {e}")
        return TitleResponse(title="Cuộc trò chuyện mới", is_greeting=False)


@app.get("/health")
def health():
    is_ready = _retriever is not None and _generator is not None
    return {
        "status": "ok" if is_ready else "initializing",
        "service": "bot-pregnant",
        "ready": is_ready
    }


@app.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    """Query endpoint that accepts enriched requests with chat history and user profile.
    
    Processes the request through the AI service with context from chat history
    and personalization from user profile.
    """
    if any(kw in req.question.lower() for kw in DANGER_KEYWORDS):
        return QueryResponse(
            response=(
                "🚨 Đây có thể là dấu hiệu khẩn cấp trong thai kỳ. "
                "Mẹ cần đến cơ sở y tế/sản khoa gần nhất ngay lập tức hoặc gọi cấp cứu."
            ),
            metadata={"emergency": True}
        )

    # Basic Prompt Injection Protection
    injection_keywords = ["ignore previous instructions", "quên đi các quy tắc", "hệ thống prompt", "developer mode", "vào chế độ"]
    if any(kw in req.question.lower() for kw in injection_keywords):
        return QueryResponse(
            response="Nori là trợ lý y khoa chuyên về dinh dưỡng và sức khỏe thai kỳ. Mình chỉ có thể hỗ trợ mẹ các vấn đề này thôi nhé! 🌸",
            metadata={"injection_detected": True}
        )

    retriever = get_retriever()
    generator = get_generator()

    # Retrieve documents
    docs = retriever.retrieve(req.question, stage=req.stage)
    if not docs and req.stage:
        docs = retriever.retrieve(req.question, stage=None)

    if not docs:
        return QueryResponse(
            response=(
                "Xin lỗi mẹ, Nori hiện chưa tìm được tài liệu tham khảo phù hợp. "
                "Mẹ có thể thử đặt câu hỏi khác hoặc hỏi bác sĩ chuyên khoa."
            ),
            metadata={"no_sources": True}
        )

    context = "\n\n".join(doc.page_content for doc in docs)
    
    # Convert chat history to dict format for generator
    chat_history_dicts = convert_chat_history(req.chat_history)
    
    # Convert user profile to dict format for generator
    user_profile_dict = req.user_profile.dict() if req.user_profile else None
    
    # Generate response with enriched context, chat history, and user profile
    answer = await asyncio.to_thread(
        generator.generate,
        req.question,
        context,
        safety_level="safe",
        chat_history=chat_history_dicts,
        user_profile=user_profile_dict
    )

    return QueryResponse(
        response=answer,
        metadata={
            "sources_count": len(docs),
            "has_chat_history": len(req.chat_history) > 0,
            "has_user_profile": req.user_profile is not None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


@app.post("/stream")
async def stream(req: StreamRequest):
    """Stream endpoint that returns tokens via Server-Sent Events (SSE).
    
    Streams tokens from the AI service with context from chat history
    and personalization from user profile.
    
    For any streaming response, the concatenation of all streamed tokens 
    SHALL equal the complete response text that would be returned by the 
    non-streaming endpoint.
    
    **Validates: Requirements 3.2, 3.3, 3.5**
    """
    async def stream_generator():
        try:
            # Check for emergency keywords
            if any(kw in req.question.lower() for kw in DANGER_KEYWORDS):
                emergency_response = (
                    "🚨 Đây có thể là dấu hiệu khẩn cấp trong thai kỳ. "
                    "Mẹ cần đến cơ sở y tế/sản khoa gần nhất ngay lập tức hoặc gọi cấp cứu."
                )
            # Basic Prompt Injection Protection
            injection_keywords = ["ignore previous instructions", "quên đi các quy tắc", "hệ thống prompt", "developer mode", "vào chế độ"]
            if any(kw in req.question.lower() for kw in injection_keywords):
                injection_response = "Nori là trợ lý y khoa chuyên về dinh dưỡng và sức khỏe thai kỳ. Mình chỉ có thể hỗ trợ mẹ các vấn đề này thôi nhé! 🌸"
                yield f"data: {json.dumps({'type': 'token', 'content': injection_response, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
                return

            retriever = get_retriever()
            generator = get_generator()

            # Retrieve documents
            docs = retriever.retrieve(req.question, stage=req.stage)
            if not docs and req.stage:
                docs = retriever.retrieve(req.question, stage=None)

            if not docs:
                no_sources_response = (
                    "Xin lỗi mẹ, Nori hiện chưa tìm được tài liệu tham khảo phù hợp. "
                    "Mẹ có thể thử đặt câu hỏi khác hoặc hỏi bác sĩ chuyên khoa."
                )
                yield f"data: {json.dumps({'type': 'token', 'content': no_sources_response, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
                return

            context = "\n\n".join(doc.page_content for doc in docs)
            
            # Convert chat history to dict format for generator
            chat_history_dicts = convert_chat_history(req.chat_history)
            
            # Convert user profile to dict format for generator
            user_profile_dict = req.user_profile.dict() if req.user_profile else None
            
            # Stream tokens from the generator
            async for token in generator.astream(
                req.question,
                context,
                safety_level="safe",
                chat_history=chat_history_dicts,
                user_profile=user_profile_dict
            ):
                yield f"data: {json.dumps({'type': 'token', 'content': token, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
            
            # Send done event
            yield f"data: {json.dumps({'type': 'done', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
            
        except Exception as e:
            # Send error event
            error_msg = str(e)
            yield f"data: {json.dumps({'type': 'error', 'error': error_msg, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
    
    return StreamingResponse(stream_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service:app", host="0.0.0.0", port=8001, reload=False)
