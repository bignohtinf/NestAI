"""
Runner tổng hợp — chạy toàn bộ seed scripts theo đúng thứ tự phụ thuộc.

Thứ tự chạy:
  01. seed_01_users        → users, user_profiles, medical_profiles, wellness_profiles
  02. seed_02_partnerships → partnerships, babies, tasks, shopping_items
  03. seed_03_content      → blog_categories, cms_items, comments, reactions, rag_docs
  04. seed_04_gamification → badges, quests, user_badges, user_quests, wellness_entries
  05. seed_05_nutrition_logs → nutrition_logs, daily_entries, meal_plans
  06. seed_06_ai_logs      → algorithm_configs, food_scan_logs, conversations, token_logs
  07. seed_07_system       → system_settings, admin_logs

  (Các bảng nutrition_database, nutrition_profiles, stores đã có scripts riêng.)

Usage:
    cd src/backend
    python -m scripts.run_all_seeds

    # Chỉ chạy một bước cụ thể:
    python -m scripts.run_all_seeds --only 3

    # Bắt đầu từ bước N:
    python -m scripts.run_all_seeds --from 4

    # Xem kế hoạch mà không chạy:
    python -m scripts.run_all_seeds --dry-run

Requires:
    - .env với SUPABASE_URL và SUPABASE_SERVICE_KEY
    - nutrition_database và nutrition_profiles đã được seed (seed_nutrition_data.py)
    - stores đã được seed (seed_stores.py)
"""

import os
import sys
import time
import argparse
import logging
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

# ── Setup path ─────────────────────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
load_dotenv(BACKEND_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ── Supabase client ────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    log.error("❌ Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ── Import seed modules (lazy để tránh lỗi import nếu chỉ chạy một bước) ──────
def _import_seed_module(module_name: str):
    """Import seed module theo tên."""
    import importlib
    return importlib.import_module(f"scripts.{module_name}")


# ── Danh sách seed steps ───────────────────────────────────────────────────────
SEED_STEPS = [
    {
        "step": 1,
        "module": "seed_01_users",
        "description": "Users (10), user_profiles, medical_profiles, wellness_profiles",
        "tables": ["users", "user_profiles", "medical_profiles", "wellness_profiles"],
        "depends_on": [],
    },
    {
        "step": 2,
        "module": "seed_02_partnerships",
        "description": "Partnerships (4), babies (4), tasks (24), shopping_items (20)",
        "tables": ["partnerships", "babies", "tasks", "shopping_items"],
        "depends_on": [1],
    },
    {
        "step": 3,
        "module": "seed_03_content",
        "description": "Blog categories (5), CMS items (8), comments (15), reactions (20), RAG docs (5)",
        "tables": ["blog_categories", "cms_items", "blog_post_categories", "blog_comments", "blog_reactions", "rag_documents"],
        "depends_on": [1],
    },
    {
        "step": 4,
        "module": "seed_04_gamification",
        "description": "Badges (6), quests (5), user_badges (15), user_quests (14), wellness_entries (70), challenges (15)",
        "tables": ["badges", "quests", "user_badges", "user_quests", "wellness_entries", "wellness_challenges"],
        "depends_on": [1],
    },
    {
        "step": 5,
        "module": "seed_05_nutrition_logs",
        "description": "Nutrition logs (210), log_items, daily_entries (42), meal_plans (21), plan_items (63)",
        "tables": ["nutrition_logs", "nutrition_log_items", "daily_entries", "meal_plans", "meal_plan_items"],
        "depends_on": [1, 2],
        "notes": "Yêu cầu nutrition_database và nutrition_profiles đã được seed trước.",
    },
    {
        "step": 6,
        "module": "seed_06_ai_logs",
        "description": "Algorithm configs (2), config history (4), food_scan_logs (25), rec_logs (20), conversations (4), messages (~32), chat_histories (8), token_usage_logs (120)",
        "tables": ["algorithm_configs", "algorithm_config_history", "food_scan_logs", "recommendation_logs", "conversations", "messages", "chat_histories", "token_usage_logs"],
        "depends_on": [1],
    },
    {
        "step": 7,
        "module": "seed_07_system",
        "description": "System settings (10), admin_logs (12)",
        "tables": ["system_settings", "admin_logs"],
        "depends_on": [1],
    },
]


def print_plan():
    """In kế hoạch seed."""
    print("\n" + "=" * 70)
    print("  NEXTAI SEED PLAN")
    print("=" * 70)
    for step in SEED_STEPS:
        deps = f"  (cần: bước {', '.join(map(str, step['depends_on']))})" if step["depends_on"] else ""
        print(f"\n  [{step['step']:02d}] {step['description']}{deps}")
        if "notes" in step:
            print(f"       ⚠ {step['notes']}")
        print(f"       Tables: {', '.join(step['tables'])}")
    print("\n" + "=" * 70 + "\n")


def run_seeds(
    steps_to_run: list[dict],
    dry_run: bool = False,
) -> dict[int, tuple[bool, str]]:
    """Chạy các seed steps, trả về kết quả."""
    results: dict[int, tuple[bool, str]] = {}
    total = len(steps_to_run)

    print("\n" + "=" * 70)
    print(f"  BẮT ĐẦU SEED — {total} bước")
    print("=" * 70 + "\n")

    for i, step in enumerate(steps_to_run, 1):
        step_num = step["step"]
        print(f"[{i}/{total}] Bước {step_num:02d}: {step['description']}")
        print(f"  Module: {step['module']}")

        if dry_run:
            print("  → [DRY-RUN] Bỏ qua\n")
            results[step_num] = (True, "dry-run")
            continue

        start_time = time.time()
        try:
            module = _import_seed_module(step["module"])
            ok, msg = module.seed(supabase)
            elapsed = time.time() - start_time

            if ok:
                print(f"  ✅ Thành công ({elapsed:.1f}s): {msg}\n")
            else:
                print(f"  ❌ Thất bại ({elapsed:.1f}s): {msg}\n")
            results[step_num] = (ok, msg)

        except Exception as e:
            elapsed = time.time() - start_time
            error_msg = str(e)
            print(f"  ❌ Exception ({elapsed:.1f}s): {error_msg}\n")
            log.exception("Lỗi nghiêm trọng tại bước %d", step_num)
            results[step_num] = (False, error_msg)

    return results


def print_summary(results: dict[int, tuple[bool, str]], dry_run: bool):
    """In tóm tắt kết quả."""
    print("=" * 70)
    print("  KẾT QUẢ SEED")
    print("=" * 70)

    success_count = sum(1 for ok, _ in results.values() if ok)
    total = len(results)

    for step_num in sorted(results.keys()):
        ok, msg = results[step_num]
        status = "✅" if ok else "❌"
        step_info = next((s for s in SEED_STEPS if s["step"] == step_num), {})
        desc = step_info.get("description", "")
        print(f"  {status} Bước {step_num:02d}: {desc[:50]}")

    print(f"\n  Tổng: {success_count}/{total} bước thành công")
    if dry_run:
        print("  ℹ️  (Chạy ở chế độ dry-run, không có dữ liệu nào được ghi)")
    print("=" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Runner tổng hợp seed data cho NextAI Supabase",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  python -m scripts.run_all_seeds                # Chạy toàn bộ
  python -m scripts.run_all_seeds --dry-run      # Xem kế hoạch
  python -m scripts.run_all_seeds --only 3       # Chỉ chạy bước 3
  python -m scripts.run_all_seeds --from 4       # Từ bước 4 trở đi
  python -m scripts.run_all_seeds --steps 1 3 7  # Chạy bước 1, 3, 7
        """,
    )
    parser.add_argument("--dry-run", action="store_true", help="Xem kế hoạch, không chạy thật")
    parser.add_argument("--only", type=int, metavar="N", help="Chỉ chạy bước N")
    parser.add_argument("--from", dest="from_step", type=int, metavar="N", help="Bắt đầu từ bước N")
    parser.add_argument("--steps", type=int, nargs="+", metavar="N", help="Chạy các bước cụ thể")
    args = parser.parse_args()

    # Xác định steps cần chạy
    if args.only:
        steps_to_run = [s for s in SEED_STEPS if s["step"] == args.only]
        if not steps_to_run:
            log.error("Không tìm thấy bước %d", args.only)
            sys.exit(1)
    elif args.steps:
        steps_to_run = [s for s in SEED_STEPS if s["step"] in args.steps]
    elif args.from_step:
        steps_to_run = [s for s in SEED_STEPS if s["step"] >= args.from_step]
    else:
        steps_to_run = SEED_STEPS

    print_plan()

    if args.dry_run:
        log.info("🔍 Chế độ DRY-RUN — chỉ in kế hoạch, không ghi dữ liệu.")

    results = run_seeds(steps_to_run, dry_run=args.dry_run)
    print_summary(results, args.dry_run)

    # Exit code: 0 nếu tất cả thành công
    all_ok = all(ok for ok, _ in results.values())
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
