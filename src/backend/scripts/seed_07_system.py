"""
Seed system_settings, admin_logs.

Tables:
  1. public.system_settings — 10 cài đặt hệ thống quan trọng
  2. public.admin_logs      — 12 bản ghi audit log của admin

Usage:
    cd src/backend
    python -m scripts.seed_07_system

Requires: seed_01_users đã chạy (admin user cần tồn tại).
"""

import os
import sys
import logging
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts._seed_ids import USERS  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    log.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

TODAY = date(2026, 5, 11)

# ── System Settings ────────────────────────────────────────────────────────────
SYSTEM_SETTINGS_DATA = [
    {
        "key": "app_version",
        "value": "1.2.0",
        "description": "Phiên bản hiện tại của ứng dụng NextAI",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "maintenance_mode",
        "value": False,
        "description": "Bật/tắt chế độ bảo trì. Khi bật, người dùng thấy trang thông báo.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "ai_daily_budget_usd",
        "value": 50.0,
        "description": "Ngân sách chi phí AI tối đa mỗi ngày (USD). Hệ thống sẽ giới hạn khi vượt ngưỡng.",
        "is_sensitive": True,
        "updated_by": USERS["admin"],
    },
    {
        "key": "food_scan_confidence_threshold",
        "value": 0.75,
        "description": "Ngưỡng độ tin cậy tối thiểu để chấp nhận kết quả nhận diện thức ăn (0.0 - 1.0).",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "max_meal_plans_per_day",
        "value": 3,
        "description": "Số lần tối đa một user có thể tạo thực đơn AI trong 1 ngày.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "default_water_intake_ml",
        "value": 2500,
        "description": "Lượng nước uống mục tiêu mặc định (ml/ngày) cho mẹ bầu.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "supported_languages",
        "value": ["vi", "en"],
        "description": "Danh sách ngôn ngữ được hỗ trợ trong ứng dụng.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "pregnancy_reminder_enabled",
        "value": True,
        "description": "Bật/tắt tính năng nhắc nhở lịch khám thai định kỳ cho tất cả users.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "rag_similarity_threshold",
        "value": 0.75,
        "description": "Ngưỡng độ tương đồng cosine tối thiểu khi tìm kiếm tài liệu RAG.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
    {
        "key": "free_tier_ai_calls_per_day",
        "value": {"menu_recommendation": 3, "food_scan": 5, "chat": 20},
        "description": "Giới hạn lượt gọi AI miễn phí mỗi ngày theo từng tính năng.",
        "is_sensitive": False,
        "updated_by": USERS["admin"],
    },
]

# ── Admin Logs ─────────────────────────────────────────────────────────────────
ADMIN_LOGS_DATA = [
    {
        "admin_id": USERS["admin"],
        "action": "CREATE_USER",
        "target_type": "users",
        "target_id": USERS["lan"],
        "details": {"email": "lan.nguyen@gmail.com", "role": "mother"},
        "created_at": "2026-01-10T09:00:00+07:00",
        "ip_address": "113.172.45.100",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "UPDATE_ALGORITHM_CONFIG",
        "target_type": "algorithm_configs",
        "details": {"algorithm_id": "menu-recommendation-v1", "version": "1.3.2", "change": "Update system prompt v3"},
        "created_at": "2026-04-01T09:15:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
        "old_values": {"current_version": "1.3.0", "accuracy": 0.83},
        "new_values": {"current_version": "1.3.2", "accuracy": 0.87},
    },
    {
        "admin_id": USERS["admin"],
        "action": "CREATE_CMS_ITEM",
        "target_type": "cms_items",
        "details": {"title": "Thực phẩm giàu sắt không thể thiếu trong tam cá nguyệt thứ hai", "type": "post"},
        "created_at": "2026-04-15T07:45:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "UPDATE_SYSTEM_SETTING",
        "target_type": "system_settings",
        "details": {"key": "ai_daily_budget_usd"},
        "created_at": "2026-04-20T10:00:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
        "old_values": {"value": 30.0},
        "new_values": {"value": 50.0},
    },
    {
        "admin_id": USERS["admin"],
        "action": "DEPLOY_ALGORITHM",
        "target_type": "algorithm_configs",
        "details": {"algorithm_id": "food-recognition-v2", "version": "2.1.0", "model": "gpt-4o"},
        "created_at": "2026-02-20T09:00:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "CREATE_RAG_DOCUMENT",
        "target_type": "rag_documents",
        "details": {"title": "Hướng dẫn dinh dưỡng toàn diện trong 3 tháng đầu thai kỳ"},
        "created_at": "2026-03-01T10:00:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "USER_DEACTIVATE",
        "target_type": "users",
        "details": {"reason": "Test account cleanup"},
        "created_at": "2026-03-15T14:00:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "UPDATE_SYSTEM_SETTING",
        "target_type": "system_settings",
        "details": {"key": "food_scan_confidence_threshold"},
        "created_at": "2026-04-10T11:00:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
        "old_values": {"value": 0.8},
        "new_values": {"value": 0.75},
    },
    {
        "admin_id": USERS["admin"],
        "action": "LOGIN",
        "target_type": None,
        "details": {"method": "email_password"},
        "created_at": "2026-05-11T08:00:00+07:00",
        "ip_address": "113.172.45.100",
        "user_agent": "Mozilla/5.0 Chrome/124",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "PUBLISH_CMS_ITEM",
        "target_type": "cms_items",
        "details": {"title": "Canxi và Vitamin D: Bộ đôi vàng bảo vệ xương mẹ"},
        "created_at": "2026-05-05T08:30:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "EXPORT_REPORT",
        "target_type": "token_usage_logs",
        "details": {"report_type": "monthly_cost", "month": "2026-04"},
        "created_at": "2026-05-01T09:00:00+07:00",
        "ip_address": "113.172.45.100",
        "success": True,
    },
    {
        "admin_id": USERS["admin"],
        "action": "UPDATE_SYSTEM_SETTING",
        "target_type": "system_settings",
        "details": {"key": "app_version", "note": "Release v1.2.0"},
        "created_at": "2026-05-01T00:00:01+07:00",
        "ip_address": "10.0.0.1",
        "success": True,
        "old_values": {"value": "1.1.5"},
        "new_values": {"value": "1.2.0"},
    },
]


def seed(db: Client) -> tuple[bool, str]:
    try:
        # 1. System settings — upsert theo key
        log.info("Seeding system_settings (%d)...", len(SYSTEM_SETTINGS_DATA))
        db.table("system_settings").upsert(SYSTEM_SETTINGS_DATA, on_conflict="key").execute()
        log.info("  ✓ system_settings")

        # 2. Admin logs — insert nếu chưa có
        log.info("Seeding admin_logs (%d)...", len(ADMIN_LOGS_DATA))
        existing_al = db.table("admin_logs").select("id").eq(
            "admin_id", USERS["admin"]
        ).execute()
        if not existing_al.data:
            db.table("admin_logs").insert(ADMIN_LOGS_DATA).execute()
            log.info("  ✓ admin_logs (inserted %d)", len(ADMIN_LOGS_DATA))
        else:
            log.info("  ⚠ admin_logs đã tồn tại (%d), bỏ qua.", len(existing_al.data))

        return True, "seed_07_system hoàn tất"

    except Exception as e:
        log.error("Lỗi: %s", e)
        return False, str(e)


def main():
    ok, msg = seed(supabase)
    log.info("✅ %s" if ok else "❌ %s", msg)
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
