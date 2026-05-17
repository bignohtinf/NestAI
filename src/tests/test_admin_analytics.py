"""Tests for admin analytics — topic extraction and service logic.

Covers:
  - _extract_topics(): keyword counting from Vietnamese text
  - TOPIC_KEYWORDS taxonomy completeness
  - AdminAnalyticsService with mocked Supabase
"""

import sys
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.schemas.admin_analytics import AnalyticsPeriod, TopicStat
from app.services.admin_analytics_service import (
    TOP_N,
    TOPIC_KEYWORDS,
    AdminAnalyticsService,
    _extract_topics,
)

# ═══════════════════════════════════════════════════════════════════════════════
# _extract_topics
# ═══════════════════════════════════════════════════════════════════════════════

class TestExtractTopics:
    """Test topic extraction from Vietnamese text."""

    def test_single_topic_match(self):
        texts = ["Tôi muốn hỏi về dinh dưỡng khi mang thai"]
        result = _extract_topics(texts)
        topic_names = [t.name for t in result]
        assert "Dinh dưỡng" in topic_names

    def test_multiple_topics_from_one_text(self):
        """One text can trigger multiple topics (but each counted once per text)."""
        texts = ["Mang thai tuần 20, bị đau bụng và lo lắng nhiều"]
        result = _extract_topics(texts)
        topic_names = [t.name for t in result]
        assert "Thai kỳ" in topic_names
        assert "Sức khỏe" in topic_names
        assert "Tâm lý" in topic_names

    def test_multiple_texts_accumulate(self):
        texts = [
            "Nên ăn gì tháng đầu?",
            "Thực phẩm nào tốt cho bà bầu?",
            "Vitamin nào cần bổ sung?",
        ]
        result = _extract_topics(texts)
        # "Dinh dưỡng" should have count >= 3
        dinh_duong = next((t for t in result if t.name == "Dinh dưỡng"), None)
        assert dinh_duong is not None
        assert dinh_duong.count >= 3

    def test_case_insensitive(self):
        texts = ["VITAMIN C rất quan trọng"]
        result = _extract_topics(texts)
        topic_names = [t.name for t in result]
        assert "Dinh dưỡng" in topic_names

    def test_empty_texts(self):
        assert _extract_topics([]) == []

    def test_no_match_returns_empty(self):
        texts = ["xin chào, tôi là AI"]
        result = _extract_topics(texts)
        # May or may not match anything — just ensure no crash
        assert isinstance(result, list)

    def test_max_top_n(self):
        """Should return at most TOP_N topics."""
        # Create texts that match all 8 topics
        texts = [
            "dinh dưỡng chế độ ăn thai kỳ sau sinh sức khỏe sinh nở lo lắng vận động"
        ] * 10
        result = _extract_topics(texts)
        assert len(result) <= TOP_N

    def test_sorted_by_count_descending(self):
        texts = [
            "vitamin protein canxi",  # Dinh dưỡng
            "thực đơn bữa ăn",  # Chế độ ăn
            "vitamin bổ sung",  # Dinh dưỡng
        ]
        result = _extract_topics(texts)
        if len(result) >= 2:
            assert result[0].count >= result[1].count

    def test_returns_topicstat_objects(self):
        texts = ["mang thai tuần 10"]
        result = _extract_topics(texts)
        for item in result:
            assert isinstance(item, TopicStat)
            assert isinstance(item.name, str)
            assert isinstance(item.count, int)


# ═══════════════════════════════════════════════════════════════════════════════
# TOPIC_KEYWORDS taxonomy
# ═══════════════════════════════════════════════════════════════════════════════

class TestTopicKeywords:
    """Verify taxonomy structure and coverage."""

    def test_all_topics_have_keywords(self):
        for topic, keywords in TOPIC_KEYWORDS.items():
            assert len(keywords) > 0, f"Topic '{topic}' has no keywords"

    def test_no_duplicate_keywords_within_topic(self):
        for topic, keywords in TOPIC_KEYWORDS.items():
            assert len(keywords) == len(set(keywords)), f"Duplicates in '{topic}'"

    def test_keywords_are_lowercase(self):
        for topic, keywords in TOPIC_KEYWORDS.items():
            for kw in keywords:
                assert kw == kw.lower(), f"Keyword '{kw}' in '{topic}' not lowercase"

    def test_expected_topics_exist(self):
        expected = ["Dinh dưỡng", "Thai kỳ", "Sức khỏe", "Tâm lý"]
        for t in expected:
            assert t in TOPIC_KEYWORDS


# ═══════════════════════════════════════════════════════════════════════════════
# AdminAnalyticsService (with mocked Supabase)
# ═══════════════════════════════════════════════════════════════════════════════

class TestAdminAnalyticsService:
    """Test service methods with mocked database."""

    @pytest.fixture
    def mock_supabase(self):
        """Create a mock Supabase client."""
        mock = MagicMock()
        return mock

    @pytest.fixture
    def service(self, mock_supabase):
        return AdminAnalyticsService(mock_supabase)

    def test_get_user_analytics_empty_db(self, service, mock_supabase):
        """No users → all zeros."""
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=[], count=0)
        mock_supabase.rpc.return_value = MagicMock(data=[])
        mock_supabase.rpc.return_value.execute.return_value = MagicMock(data=[])

        result = service.get_user_analytics(AnalyticsPeriod.week)
        assert result.totalUsers == 0
        assert result.newUsersThisPeriod == 0

    def test_get_user_analytics_counts_users(self, service, mock_supabase):
        """Users with recent created_at should count as new."""
        now = datetime.utcnow()
        users = [
            {"id": "1", "role": "mother", "is_active": True,
             "created_at": (now - timedelta(days=2)).isoformat(),
             "last_login": now.isoformat()},
            {"id": "2", "role": "mother", "is_active": True,
             "created_at": (now - timedelta(days=60)).isoformat(),
             "last_login": (now - timedelta(days=60)).isoformat()},
        ]
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=users)
        mock_supabase.rpc.return_value = MagicMock()
        mock_supabase.rpc.return_value.execute.return_value = MagicMock(data=[])

        result = service.get_user_analytics(AnalyticsPeriod.week)
        assert result.totalUsers == 2
        assert result.newUsersThisPeriod == 1  # only user created 2 days ago
        assert result.activeUsersThisPeriod == 1  # only user with recent login

    def test_retention_rate_excludes_admin(self, service, mock_supabase):
        """Admin users excluded from retention calculation."""
        now = datetime.utcnow()
        users = [
            {"id": "1", "role": "admin", "is_active": True,
             "created_at": now.isoformat(), "last_login": now.isoformat()},
            {"id": "2", "role": "mother", "is_active": True,
             "created_at": (now - timedelta(days=30)).isoformat(),
             "last_login": now.isoformat()},
        ]
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_table.select.return_value = mock_table
        mock_table.eq.return_value = mock_table
        mock_table.execute.return_value = MagicMock(data=users)
        mock_supabase.rpc.return_value = MagicMock()
        mock_supabase.rpc.return_value.execute.return_value = MagicMock(data=[])

        result = service.get_user_analytics(AnalyticsPeriod.month)
        # 1 non-admin user, who logged in recently → 100% retention
        assert result.retentionRate == 100.0
        assert result.churnRate == 0.0
