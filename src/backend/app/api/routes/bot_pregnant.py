from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
import sys
import time
from collections import OrderedDict
from pathlib import Path

# Add bot-pregnant to path
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "agents" / "bot-pregnant"))

from src.engine.retriever import NoriRetriever
from langchain_ollama import OllamaLLM

_system_prompt: Optional[str] = None
_rag_template: Optional[str] = None
_CACHE_TTL_SECONDS = 300
_CACHE_MAX_ENTRIES = 128
_answer_cache: OrderedDict[tuple[str, Optional[str]], tuple[float, dict]] = OrderedDict()
_REQUEST_COUNT = 0
_CACHE_HIT_COUNT = 0
_CACHE_MISS_COUNT = 0
_TIMEOUT_COUNT = 0
_DOCS_NOT_FOUND_COUNT = 0


def load_prompts() -> tuple[str, str]:
    global _system_prompt, _rag_template
    if _system_prompt is None or _rag_template is None:
        prompts_dir = Path(__file__).resolve().parents[3] / "agents" / "bot-pregnant" / "prompts"
        if not prompts_dir.exists():
            # When running from a different working directory, try absolute /app path
            prompts_dir = Path("/app") / "agents" / "bot-pregnant" / "prompts"
        _system_prompt = (prompts_dir / "system_prompt.txt").read_text(encoding="utf-8")
        _rag_template = (prompts_dir / "rag_template.txt").read_text(encoding="utf-8")
    return _system_prompt, _rag_template


def log_event(event: str, details: Optional[dict] = None) -> None:
    payload = {
        "timestamp": time.time(),
        "service": "bot-pregnant",
        "event": event,
        "details": details or {},
    }
    print(json.dumps(payload, ensure_ascii=False))


def _make_cache_key(question: str, stage: Optional[str]) -> tuple[str, Optional[str]]:
    normalized_question = question.strip().lower()
    normalized_stage = stage.strip().lower() if stage else None
    return normalized_question, normalized_stage


def get_cached_answer(question: str, stage: Optional[str]) -> Optional[dict]:
    global _CACHE_HIT_COUNT, _CACHE_MISS_COUNT
    key = _make_cache_key(question, stage)
    cached = _answer_cache.get(key)
    if not cached:
        _CACHE_MISS_COUNT += 1
        return None

    timestamp, payload = cached
    if time.time() - timestamp > _CACHE_TTL_SECONDS:
        del _answer_cache[key]
        _CACHE_MISS_COUNT += 1
        return None

    _CACHE_HIT_COUNT += 1
    _answer_cache.move_to_end(key)
    return payload


def set_cached_answer(question: str, stage: Optional[str], payload: dict) -> None:
    key = _make_cache_key(question, stage)
    if key in _answer_cache:
        del _answer_cache[key]

    while len(_answer_cache) >= _CACHE_MAX_ENTRIES:
        _answer_cache.popitem(last=False)

    _answer_cache[key] = (time.time(), payload)


async def invoke_llm_with_timeout(llm: OllamaLLM, prompt: str, timeout_seconds: int = 60) -> str:
    try:
        result = await asyncio.wait_for(asyncio.to_thread(llm.invoke, prompt), timeout_seconds)
        if hasattr(result, "content"):
            return str(result.content)
        if isinstance(result, dict):
            return str(result.get("content") or result.get("text") or result)
        return str(result)
    except asyncio.TimeoutError as exc:
        raise TimeoutError(f"LLM request timed out after {timeout_seconds} seconds") from exc

router = APIRouter(prefix="/api/bot-pregnant", tags=["bot-pregnant"])

class QueryRequest(BaseModel):
    question: str
    user_id: str
    stage: Optional[str] = None

class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: list[dict]

# Initialize retriever and LLM (singleton)
_retriever = None
_llm = None

def get_retriever():
    global _retriever
    if _retriever is None:
        # Use absolute path for Docker compatibility
        db_path = "/app/agents/bot-pregnant/data/vectordb"
        print(f"[BOT] Loading vector DB from: {db_path}")
        try:
            _retriever = NoriRetriever(db_path=db_path)
            print(f"[BOT] Vector DB loaded successfully")
        except Exception as e:
            print(f"[BOT] Error loading vector DB: {str(e)}")
            raise
    return _retriever

def get_llm():
    global _llm
    if _llm is None:
        _llm = OllamaLLM(
            model="llama3.1:8b",
            temperature=0.2,
            num_predict=1024  # Allow longer responses
        )
    return _llm

async def warm_up_llm(timeout_seconds: int = 90) -> None:
    llm = get_llm()
    if getattr(llm, "_warmup_done", False):
        return

    print("[BOT] Warming up Ollama model...")
    try:
        await invoke_llm_with_timeout(llm, "Xin chào MommyMate.", timeout_seconds=timeout_seconds)
        setattr(llm, "_warmup_done", True)
        print("[BOT] Ollama warm-up completed")
    except Exception as exc:
        print(f"[BOT] Ollama warm-up failed: {exc}")

@router.post("/query", response_model=QueryResponse)
async def query_bot(request: QueryRequest):
    """Query the bot-pregnant RAG system"""
    global _REQUEST_COUNT, _DOCS_NOT_FOUND_COUNT
    _REQUEST_COUNT += 1
    log_event("request_received", {"question": request.question, "stage": request.stage})

    try:
        print(f"[BOT] Query received: {request.question}")
        
        retriever = get_retriever()
        print("[BOT] Retriever initialized")
        
        llm = get_llm()
        print("[BOT] LLM initialized")

        cached_response = get_cached_answer(request.question, request.stage)
        if cached_response is not None:
            log_event("cache_hit", {"question": request.question, "stage": request.stage})
            print("[BOT] Cache hit for bot-pregnant query")
            return cached_response
        
        # Retrieve relevant documents
        print("[BOT] Retrieving documents...")
        docs = retriever.retrieve(request.question, stage=request.stage)
        print(f"[BOT] Retrieved {len(docs)} documents")
        log_event("retrieval_complete", {"question": request.question, "stage": request.stage, "docs_retrieved": len(docs)})
        
        if not docs and request.stage:
            print(f"[BOT] Stage filter returned 0 docs for stage={request.stage}, retrying without stage filter")
            log_event("stage_filter_fallback", {"question": request.question, "stage": request.stage})
            docs = retriever.retrieve(request.question, stage=None)
            print(f"[BOT] Retrieved {len(docs)} documents after stage fallback")
            log_event("retrieval_after_stage_fallback", {"question": request.question, "stage": request.stage, "docs_retrieved": len(docs)})

        if not docs:
            _DOCS_NOT_FOUND_COUNT += 1
            log_event("docs_not_found", {"question": request.question, "stage": request.stage})
            fallback_answer = (
                "Xin lỗi mẹ, MommyMate hiện chưa tìm được tài liệu tham khảo phù hợp cho câu hỏi này. "
                "Mẹ có thể thử đặt câu hỏi khác hoặc hỏi bác sĩ chuyên khoa để được tư vấn chính xác hơn."
            )
            return QueryResponse(
                question=request.question,
                answer=fallback_answer,
                sources=[],
            )
        
        # Combine context
        context = "\n\n".join([doc.page_content for doc in docs])
        print(f"[BOT] Context length: {len(context)}")

        # Load prompt templates from bot-pregnant package
        system_prompt, rag_template = load_prompts()
        final_prompt = f"{system_prompt}\n\n{rag_template.format(context=context, question=request.question)}"

        # Generate answer
        print("[BOT] Invoking LLM with unified RAG prompt...")
        start_time = time.time()
        answer = await invoke_llm_with_timeout(llm, final_prompt, timeout_seconds=30)
        duration_seconds = round(time.time() - start_time, 2)
        print(f"[BOT] LLM response received: {len(answer)} chars in {duration_seconds}s")
        log_event(
            "llm_response",
            {
                "question": request.question,
                "stage": request.stage,
                "docs_retrieved": len(docs),
                "answer_length": len(answer),
                "duration_seconds": duration_seconds,
            },
        )
        
        # Extract sources
        sources = [
            {
                "content": doc.page_content[:200],
                "metadata": doc.metadata
            }
            for doc in docs[:3]
        ]

        response_payload = {
            "question": request.question,
            "answer": answer.strip(),
            "sources": sources,
        }

        set_cached_answer(request.question, request.stage, response_payload)
        log_event("response_cached", {"question": request.question, "stage": request.stage})
        return response_payload

    except TimeoutError as e:
        global _TIMEOUT_COUNT
        _TIMEOUT_COUNT += 1
        log_event(
            "llm_timeout",
            {"question": request.question, "stage": request.stage, "error": str(e)},
        )
        print(f"[BOT] Timeout: {str(e)}")
        raise HTTPException(status_code=504, detail="Bot-pregnant LLM request timed out. Please try again.")
    except Exception as e:
        log_event(
            "query_failed",
            {"question": request.question, "stage": request.stage, "error": str(e)},
        )
        print(f"[BOT] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Check if bot-pregnant service is available"""
    try:
        retriever = get_retriever()
        return {
            "status": "healthy",
            "service": "bot-pregnant",
            "metrics": {
                "requests": _REQUEST_COUNT,
                "cache_hits": _CACHE_HIT_COUNT,
                "cache_misses": _CACHE_MISS_COUNT,
                "docs_not_found": _DOCS_NOT_FOUND_COUNT,
                "llm_timeouts": _TIMEOUT_COUNT,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
