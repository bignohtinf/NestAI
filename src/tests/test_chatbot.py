"""Tests for bot-pregnant chatbot service.

Covers:
  - _cache_get / _cache_set: in-memory cache logic
  - DANGER_KEYWORDS: emergency detection
  - convert_chat_history(): ChatMessage → dict conversion
  - format_system_prompt(): profile injection
  - process_query(): query processing pipeline
  - _HealthFilter: log filtering
"""

import time
import pytest
from unittest.mock import MagicMock

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "agents" / "bot-pregnant"))

from service import (
    _cache_get,
    _cache_set,
    _cache,
    _CACHE_TTL,
    DANGER_KEYWORDS,
    convert_chat_history,
    format_system_prompt,
    process_query,
    ChatMessage,
    UserProfile,
    QueryRequest,
    _HealthFilter,
)


# ═══════════════════════════════════════════════════════════════════════════════
# Cache functions
# ═══════════════════════════════════════════════════════════════════════════════

class TestCache:
    """Test in-memory query cache."""

    def setup_method(self):
        _cache.clear()

    def test_cache_miss_returns_none(self):
        assert _cache_get("unknown question", None) is None

    def test_cache_set_and_get(self):
        _cache_set("xin chào", "tuần 10", {"answer": "hello"})
        result = _cache_get("xin chào", "tuần 10")
        assert result == {"answer": "hello"}

    def test_cache_case_insensitive(self):
        _cache_set("XIN CHÀO", None, {"answer": "hi"})
        result = _cache_get("xin chào", None)
        assert result == {"answer": "hi"}

    def test_cache_strips_whitespace(self):
        _cache_set("  hello  ", None, {"answer": "world"})
        result = _cache_get("hello", None)
        assert result == {"answer": "world"}

    def test_cache_expired(self):
        """Expired entries should return None."""
        key = ("expired", None)
        _cache[key] = (time.time() - _CACHE_TTL - 10, {"stale": True})
        result = _cache_get("expired", None)
        assert result is None

    def test_cache_different_stages(self):
        """Same question with different stages should be different cache entries."""
        _cache_set("ăn gì?", "tuần 10", {"a": 1})
        _cache_set("ăn gì?", "tuần 20", {"a": 2})
        assert _cache_get("ăn gì?", "tuần 10")["a"] == 1
        assert _cache_get("ăn gì?", "tuần 20")["a"] == 2


# ═══════════════════════════════════════════════════════════════════════════════
# DANGER_KEYWORDS
# ═══════════════════════════════════════════════════════════════════════════════

class TestDangerKeywords:
    """Test emergency keyword detection."""

    def test_danger_keywords_exist(self):
        assert len(DANGER_KEYWORDS) >= 5

    def test_common_dangers_present(self):
        expected = ["ra máu", "đau bụng dữ dội", "vỡ ối", "co giật"]
        for kw in expected:
            assert kw in DANGER_KEYWORDS, f"Missing danger keyword: {kw}"

    def test_danger_detection_in_text(self):
        """Simulate how the service checks for danger keywords."""
        text = "Em bị ra máu và đau bụng dữ dội"
        detected = [kw for kw in DANGER_KEYWORDS if kw in text.lower()]
        assert len(detected) >= 2


# ═══════════════════════════════════════════════════════════════════════════════
# convert_chat_history
# ═══════════════════════════════════════════════════════════════════════════════

class TestConvertChatHistory:
    """Test ChatMessage → dict conversion."""

    def test_empty_history(self):
        assert convert_chat_history([]) == []

    def test_single_message(self):
        msgs = [ChatMessage(role="user", content="Xin chào")]
        result = convert_chat_history(msgs)
        assert len(result) == 1
        assert result[0] == {"role": "user", "content": "Xin chào"}

    def test_multi_turn(self):
        msgs = [
            ChatMessage(role="user", content="Tuần 10 nên ăn gì?"),
            ChatMessage(role="assistant", content="Nên bổ sung acid folic..."),
            ChatMessage(role="user", content="Cụ thể hơn được không?"),
        ]
        result = convert_chat_history(msgs)
        assert len(result) == 3
        assert result[0]["role"] == "user"
        assert result[1]["role"] == "assistant"
        assert result[2]["role"] == "user"

    def test_preserves_content(self):
        msgs = [ChatMessage(role="user", content="Hello 🤰")]
        result = convert_chat_history(msgs)
        assert result[0]["content"] == "Hello 🤰"


# ═══════════════════════════════════════════════════════════════════════════════
# format_system_prompt
# ═══════════════════════════════════════════════════════════════════════════════

class TestFormatSystemPrompt:
    """Test system prompt with user profile injection."""

    def test_no_profile(self):
        prompt = format_system_prompt(None)
        assert "Nori" in prompt
        assert "Thông tin người dùng" not in prompt

    def test_with_gestation_weeks(self):
        profile = UserProfile(id="u1", name="Huyền", gestation_weeks=20)
        prompt = format_system_prompt(profile)
        assert "20 tuần" in prompt

    def test_with_gestation_weeks_and_days(self):
        profile = UserProfile(id="u1", name="Huyền", gestation_weeks=20, days_in_week=3)
        prompt = format_system_prompt(profile)
        assert "20 tuần 3 ngày" in prompt

    def test_with_weight(self):
        profile = UserProfile(id="u1", name="Huyền", weight=55.5)
        prompt = format_system_prompt(profile)
        assert "55.5 kg" in prompt

    def test_with_condition(self):
        profile = UserProfile(id="u1", name="Huyền", condition="gdm")
        prompt = format_system_prompt(profile)
        assert "gdm" in prompt

    def test_condition_none_skipped(self):
        profile = UserProfile(id="u1", name="Huyền", condition="none")
        prompt = format_system_prompt(profile)
        assert "Tình trạng sức khỏe" not in prompt

    def test_with_food_preference(self):
        profile = UserProfile(id="u1", name="Huyền", food_preference="ăn chay")
        prompt = format_system_prompt(profile)
        assert "ăn chay" in prompt

    def test_full_profile(self):
        profile = UserProfile(
            id="u1", name="Huyền",
            gestation_weeks=30, days_in_week=5,
            weight=60.0, condition="anemia",
            food_preference="không ăn hải sản",
        )
        prompt = format_system_prompt(profile)
        assert "30 tuần 5 ngày" in prompt
        assert "60.0 kg" in prompt
        assert "anemia" in prompt
        assert "không ăn hải sản" in prompt


# ═══════════════════════════════════════════════════════════════════════════════
# process_query
# ═══════════════════════════════════════════════════════════════════════════════

class TestProcessQuery:
    """Test query processing pipeline."""

    def test_basic_query(self):
        req = QueryRequest(
            user_id="u1",
            question="Ăn gì tuần đầu?",
        )
        result = process_query(req)
        assert result["question"] == "Ăn gì tuần đầu?"
        assert isinstance(result["messages"], list)
        assert "Nori" in result["system_prompt"]

    def test_query_with_chat_history(self):
        req = QueryRequest(
            user_id="u1",
            question="Còn gì nữa?",
            chat_history=[
                ChatMessage(role="user", content="Vitamin nào cần?"),
                ChatMessage(role="assistant", content="Acid folic, sắt, canxi..."),
            ],
        )
        result = process_query(req)
        assert len(result["messages"]) == 2

    def test_query_with_profile(self):
        profile = UserProfile(id="u1", name="Huyền", gestation_weeks=25)
        req = QueryRequest(
            user_id="u1",
            question="Nên ăn gì?",
            user_profile=profile,
        )
        result = process_query(req)
        assert "25 tuần" in result["system_prompt"]
        assert result["user_profile"]["gestation_weeks"] == 25

    def test_query_without_profile(self):
        req = QueryRequest(user_id="u1", question="Xin chào")
        result = process_query(req)
        assert result["user_profile"] is None


# ═══════════════════════════════════════════════════════════════════════════════
# _HealthFilter (logging)
# ═══════════════════════════════════════════════════════════════════════════════

class TestHealthFilter:
    """Test log filter for /health endpoint."""

    def test_filters_health_logs(self):
        f = _HealthFilter()
        record = MagicMock()
        record.getMessage.return_value = 'GET /health 200 OK'
        assert f.filter(record) is False

    def test_passes_non_health_logs(self):
        f = _HealthFilter()
        record = MagicMock()
        record.getMessage.return_value = 'POST /query 200 OK'
        assert f.filter(record) is True
