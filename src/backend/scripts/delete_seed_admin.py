"""
Xóa tài khoản admin seed khỏi hệ thống.

Admin seed:
  - ID    : a1000001-0000-4000-8000-000000000099
  - Email : admin@nextai.vn
  - Role  : admin

Script này:
  1. Nullify created_by / updated_by trong các bảng tham chiếu
  2. Xóa user_profiles
  3. Xóa admin_logs (nếu có)
  4. Xóa bản ghi trong public.users

LƯU Ý: Script KHÔNG xóa tài khoản trong auth.users (Supabase Auth).
        Nếu cần xóa auth, làm thủ công trong Supabase Dashboard > Auth > Users.

Usage:
    cd src/backend
    python -m scripts.delete_seed_admin
"""

import os
import sys
import logging
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    log.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong .env")
    sys.exit(1)

ADMIN_ID = "a1000001-0000-4000-8000-000000000099"
ADMIN_EMAIL = "admin@nextai.vn"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def confirm_admin_exists() -> bool:
    """Xác nhận admin tồn tại trước khi xóa."""
    res = supabase.table("users").select("id, email, role").eq("id", ADMIN_ID).execute()
    if not res.data:
        log.warning("Không tìm thấy admin với ID %s — có thể đã xóa rồi.", ADMIN_ID)
        return False
    user = res.data[0]
    log.info("Tìm thấy: id=%s | email=%s | role=%s", user["id"], user["email"], user["role"])
    return True


def nullify_references():
    """
    Nullify các cột created_by / updated_by trỏ đến admin.
    Tránh lỗi FK constraint khi xóa.
    """
    tables_with_refs = [
        ("medical_profiles", ["created_by", "updated_by"]),
        ("rag_documents",    ["created_by", "updated_by"]),
        ("cms_items",        ["created_by", "updated_by"]),
        ("stores",           ["created_by", "updated_by"]),
        ("algorithm_configs",["updated_by"]),
        ("system_settings",  ["updated_by"]),
    ]

    for table, cols in tables_with_refs:
        for col in cols:
            try:
                res = supabase.table(table).update({col: None}).eq(col, ADMIN_ID).execute()
                count = len(res.data) if res.data else 0
                if count:
                    log.info("  nullify %s.%s → %d bản ghi", table, col, count)
            except Exception as e:
                log.warning("  Bỏ qua %s.%s — lỗi: %s", table, col, e)


def delete_dependent_rows():
    """Xóa các bảng phụ thuộc trực tiếp vào user."""

    # admin_logs (admin_id NOT NULL → phải xóa)
    try:
        res = supabase.table("admin_logs").delete().eq("admin_id", ADMIN_ID).execute()
        count = len(res.data) if res.data else 0
        log.info("  xóa admin_logs: %d bản ghi", count)
    except Exception as e:
        log.warning("  admin_logs — lỗi: %s", e)

    # user_profiles
    try:
        res = supabase.table("user_profiles").delete().eq("user_id", ADMIN_ID).execute()
        count = len(res.data) if res.data else 0
        log.info("  xóa user_profiles: %d bản ghi", count)
    except Exception as e:
        log.warning("  user_profiles — lỗi: %s", e)

    # algorithm_config_history (changed_by)
    try:
        res = supabase.table("algorithm_config_history").delete().eq("changed_by", ADMIN_ID).execute()
        count = len(res.data) if res.data else 0
        log.info("  xóa algorithm_config_history: %d bản ghi", count)
    except Exception as e:
        log.warning("  algorithm_config_history — lỗi: %s", e)


def delete_admin_user():
    """Xóa bản ghi chính trong public.users."""
    res = supabase.table("users").delete().eq("id", ADMIN_ID).execute()
    if res.data:
        log.info("✅ Đã xóa public.users id=%s (%s)", ADMIN_ID, ADMIN_EMAIL)
    else:
        log.warning("Không xóa được — kiểm tra lại FK constraints còn sót.")


def main():
    log.info("=== Bắt đầu xóa admin seed ===")
    log.info("Target: id=%s | email=%s", ADMIN_ID, ADMIN_EMAIL)

    if not confirm_admin_exists():
        log.info("Không có gì để xóa. Kết thúc.")
        sys.exit(0)

    # Xác nhận từ người dùng
    answer = input("\n⚠️  Xác nhận xóa admin seed? Gõ 'yes' để tiếp tục: ").strip().lower()
    if answer != "yes":
        log.info("Hủy. Không có thay đổi nào được thực hiện.")
        sys.exit(0)

    log.info("--- Bước 1: Nullify FK references ---")
    nullify_references()

    log.info("--- Bước 2: Xóa bảng phụ thuộc ---")
    delete_dependent_rows()

    log.info("--- Bước 3: Xóa public.users ---")
    delete_admin_user()

    log.info("=== Hoàn tất ===")
    log.info("Nhớ xóa thủ công trong Supabase Dashboard > Auth > Users nếu admin có tài khoản auth.")


if __name__ == "__main__":
    main()
