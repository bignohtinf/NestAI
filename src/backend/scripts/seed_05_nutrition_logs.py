"""
Seed nutrition_logs, nutrition_log_items, daily_entries (babies),
meal_plans, meal_plan_items.

Tables:
  1. public.nutrition_logs      — 14 ngày x 5 users x 3 bữa = 210 log entries
  2. public.nutrition_log_items — link log → nutrition_database (stt)
  3. public.daily_entries       — 14 ngày x 3 babies = 42 bản ghi (cân nặng, sữa)
  4. public.meal_plans          — 7 ngày x 3 mẹ đang mang thai = 21 kế hoạch
  5. public.meal_plan_items     — 3 bữa x 21 kế hoạch = 63 bản ghi

Lưu ý: Script tự động lấy stt hợp lệ từ nutrition_database.
        Nếu nutrition_database chưa có dữ liệu, sẽ bỏ qua items.

Usage:
    cd src/backend
    python -m scripts.seed_05_nutrition_logs

Requires: seed_01_users, seed_02_partnerships đã chạy.
"""

import os
import sys
import random
import logging
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts._seed_ids import USERS, BABIES, PARTNERSHIPS  # noqa: E402

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
random.seed(42)


def get_valid_stts(db: Client, limit: int = 50) -> list[int]:
    """Lấy danh sách stt hợp lệ từ nutrition_database."""
    try:
        res = db.table("nutrition_database").select("stt").order("stt").limit(limit).execute()
        return [r["stt"] for r in res.data] if res.data else []
    except Exception as e:
        log.warning("Không lấy được stt từ nutrition_database: %s", e)
        return []


def get_valid_profile_stts(db: Client) -> list[int]:
    """Lấy danh sách stt hợp lệ từ nutrition_profiles."""
    try:
        res = db.table("nutrition_profiles").select("stt").order("stt").limit(30).execute()
        return [r["stt"] for r in res.data] if res.data else []
    except Exception as e:
        log.warning("Không lấy được stt từ nutrition_profiles: %s", e)
        return []


def make_nutrition_logs(dish_stts: list[int]) -> tuple[list[dict], list[dict]]:
    """
    Tạo nutrition_logs và nutrition_log_items cho 5 users trong 14 ngày.
    Trả về (logs, log_items).
    """
    all_users = ["lan", "mai", "hoa", "thu", "linh"]
    meal_types = ["breakfast", "lunch", "dinner"]

    # Thông số dinh dưỡng theo users và bữa ăn
    nutrition_profile = {
        "lan":  {"breakfast": (380, 15, 12, 55), "lunch": (620, 28, 20, 80), "dinner": (550, 25, 18, 70)},
        "mai":  {"breakfast": (400, 18, 14, 50), "lunch": (700, 35, 22, 85), "dinner": (600, 30, 20, 75)},
        "hoa":  {"breakfast": (350, 12, 10, 50), "lunch": (580, 22, 18, 78), "dinner": (500, 20, 15, 68)},
        "thu":  {"breakfast": (360, 14, 11, 48), "lunch": (600, 26, 19, 78), "dinner": (520, 22, 17, 65)},
        "linh": {"breakfast": (420, 18, 15, 58), "lunch": (680, 32, 22, 88), "dinner": (580, 28, 20, 75)},
    }

    logs = []

    for key in all_users:
        profile = nutrition_profile[key]
        for day_offset in range(14):
            log_date = (TODAY - timedelta(days=13 - day_offset)).isoformat()
            for meal in meal_types:
                kcal, protein, fat, carbs = profile[meal]
                # Thêm biến động ngẫu nhiên
                kcal += random.randint(-50, 60)
                protein += random.uniform(-3, 4)
                fat += random.uniform(-2, 3)
                carbs += random.uniform(-8, 10)

                log_entry = {
                    "user_id": USERS[key],
                    "log_date": log_date,
                    "meal_type": meal,
                    "calories": max(200, int(kcal)),
                    "protein": round(max(5, protein), 1),
                    "fat": round(max(3, fat), 1),
                    "carbs": round(max(10, carbs), 1),
                    "source": random.choice(["ai_recommendation", "manual", "smart_scan"]),
                    "notes": None,
                }
                logs.append(log_entry)

    return logs


def make_daily_entries() -> list[dict]:
    """Tạo daily_entries cho 3 babies đang mang thai trong 14 ngày."""
    # babies có dữ liệu theo dõi: an (Lan's), chi (Hoa's), bao (Mai's - đã sinh)
    entries = []

    baby_recorder_pairs = [
        ("an", "lan"),    # theo dõi thai An — mẹ Lan ghi
        ("bao", "mai"),   # bé Bảo đã sinh — mẹ Mai ghi
        ("chi", "hoa"),   # theo dõi thai Chi — mẹ Hoa ghi
    ]

    for baby_key, recorder_key in baby_recorder_pairs:
        for day_offset in range(14):
            entry_date = (TODAY - timedelta(days=13 - day_offset)).isoformat()
            is_born = baby_key == "bao"

            if is_born:
                # Bé Bảo: cân nặng thực, chiều cao (tăng theo tuần)
                week = day_offset // 7
                base_weight = 5.2 + week * 0.15 + random.uniform(-0.05, 0.05)
                base_height = 57.0 + week * 0.3 + random.uniform(-0.1, 0.1)
                milk_score = random.randint(70, 90)
                entries.append({
                    "baby_id": BABIES[baby_key],
                    "recorded_by": USERS[recorder_key],
                    "entry_date": entry_date,
                    "milk_score": milk_score,
                    "weight": round(base_weight, 2),
                    "height": round(base_height, 1),
                    "notes": "Bú tốt, tăng cân đều." if milk_score > 75 else "Hơi bú ít, theo dõi thêm.",
                })
            else:
                # Bé đang trong bụng — chỉ ghi milk_score (điểm sữa mẹ) và notes
                milk_score = random.randint(55, 85)
                entries.append({
                    "baby_id": BABIES[baby_key],
                    "recorded_by": USERS[recorder_key],
                    "entry_date": entry_date,
                    "milk_score": milk_score,
                    "weight": None,
                    "height": None,
                    "notes": random.choice([
                        "Mẹ ăn uống tốt hôm nay.",
                        "Bé đạp nhiều vào buổi tối.",
                        "Mẹ nghỉ ngơi đủ giấc.",
                        None,
                    ]),
                })
    return entries


def make_meal_plans(dish_stts: list[int], profile_stts: list[int]) -> tuple[list[dict], list[dict]]:
    """Tạo meal_plans và meal_plan_items cho 3 mẹ đang mang thai, 7 ngày."""
    pregnant_mothers = ["lan", "hoa", "linh"]
    plans = []
    plan_items = []

    profile_stt = profile_stts[3] if len(profile_stts) > 3 else (profile_stts[0] if profile_stts else None)

    for key in pregnant_mothers:
        for day_offset in range(7):
            plan_date = (TODAY - timedelta(days=6 - day_offset)).isoformat()
            status = "completed" if day_offset < 5 else ("accepted" if day_offset == 5 else "generated")

            plan = {
                "user_id": USERS[key],
                "plan_date": plan_date,
                "profile_stt": profile_stt,
                "status": status,
                "target": "mother",
                "daily_budget_vnd": 150000,
                "breakfast_budget_vnd": 35000,
                "lunch_budget_vnd": 65000,
                "dinner_budget_vnd": 50000,
                "nutrition_summary": {
                    "total_calories": random.randint(1800, 2200),
                    "total_protein": round(random.uniform(70, 95), 1),
                    "total_fat": round(random.uniform(60, 80), 1),
                    "total_carbs": round(random.uniform(230, 280), 1),
                },
                "plan_data": {"generated_by": "ai", "model": "nextai-menu-v1"},
            }
            plans.append(plan)

    return plans, plan_items


def seed(db: Client) -> tuple[bool, str]:
    try:
        # Lấy stts hợp lệ từ DB
        dish_stts = get_valid_stts(db, 100)
        profile_stts = get_valid_profile_stts(db)

        if not dish_stts:
            log.warning("nutrition_database chưa có dữ liệu — bỏ qua nutrition_log_items và meal_plan_items.")
        if not profile_stts:
            log.warning("nutrition_profiles chưa có dữ liệu — meal_plans sẽ không có profile_stt.")

        # 1. Nutrition logs
        nutrition_logs = make_nutrition_logs(dish_stts)
        log.info("Seeding nutrition_logs (%d bản ghi)...", len(nutrition_logs))
        existing_nl = db.table("nutrition_logs").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_nl.data:
            for i in range(0, len(nutrition_logs), 100):
                db.table("nutrition_logs").insert(nutrition_logs[i:i + 100]).execute()
            log.info("  ✓ nutrition_logs (inserted %d)", len(nutrition_logs))
        else:
            log.info("  ⚠ nutrition_logs đã tồn tại (%d), bỏ qua.", len(existing_nl.data))

        # 2. Nutrition log items — lấy log IDs vừa tạo rồi thêm items
        if dish_stts:
            fresh_logs = db.table("nutrition_logs").select("id, meal_type, user_id").eq(
                "user_id", USERS["lan"]
            ).limit(10).execute()
            if fresh_logs.data:
                # Kiểm tra đã có items chưa
                sample_log_id = fresh_logs.data[0]["id"]
                existing_items = db.table("nutrition_log_items").select("id").eq(
                    "log_id", sample_log_id
                ).execute()
                if not existing_items.data:
                    # Lấy tất cả log IDs của seed users
                    all_log_ids = []
                    for ukey in ["lan", "mai", "hoa", "thu", "linh"]:
                        res = db.table("nutrition_logs").select("id").eq(
                            "user_id", USERS[ukey]
                        ).limit(42).execute()
                        all_log_ids.extend([r["id"] for r in res.data])

                    items = []
                    for log_id in all_log_ids:
                        num_dishes = random.randint(2, 4)
                        chosen = random.sample(dish_stts[:30], min(num_dishes, len(dish_stts[:30])))
                        for stt in chosen:
                            items.append({
                                "log_id": log_id,
                                "dish_stt": stt,
                                "servings": round(random.uniform(0.8, 1.5), 1),
                            })
                    log.info("Seeding nutrition_log_items (%d)...", len(items))
                    for i in range(0, len(items), 100):
                        db.table("nutrition_log_items").insert(items[i:i + 100]).execute()
                    log.info("  ✓ nutrition_log_items")
                else:
                    log.info("  ⚠ nutrition_log_items đã tồn tại, bỏ qua.")
        else:
            log.info("  ⚠ Bỏ qua nutrition_log_items (không có dish_stts).")

        # 3. Daily entries (babies)
        daily_entries = make_daily_entries()
        log.info("Seeding daily_entries (%d)...", len(daily_entries))
        existing_de = db.table("daily_entries").select("id").eq(
            "baby_id", BABIES["bao"]
        ).execute()
        if not existing_de.data:
            for i in range(0, len(daily_entries), 50):
                db.table("daily_entries").insert(daily_entries[i:i + 50]).execute()
            log.info("  ✓ daily_entries (inserted %d)", len(daily_entries))
        else:
            log.info("  ⚠ daily_entries đã tồn tại, bỏ qua.")

        # 4. Meal plans
        meal_plans, _ = make_meal_plans(dish_stts, profile_stts)
        log.info("Seeding meal_plans (%d)...", len(meal_plans))
        existing_mp = db.table("meal_plans").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_mp.data:
            for i in range(0, len(meal_plans), 50):
                db.table("meal_plans").insert(meal_plans[i:i + 50]).execute()
            log.info("  ✓ meal_plans (inserted %d)", len(meal_plans))
        else:
            log.info("  ⚠ meal_plans đã tồn tại, bỏ qua.")

        # 5. Meal plan items
        if dish_stts:
            fresh_plans = db.table("meal_plans").select("id").eq(
                "user_id", USERS["lan"]
            ).limit(7).execute()
            if fresh_plans.data:
                sample_plan_id = fresh_plans.data[0]["id"]
                existing_mpi = db.table("meal_plan_items").select("id").eq(
                    "plan_id", sample_plan_id
                ).execute()
                if not existing_mpi.data:
                    # Lấy tất cả plan IDs
                    all_plan_ids = []
                    for ukey in ["lan", "hoa", "linh"]:
                        res = db.table("meal_plans").select("id").eq(
                            "user_id", USERS[ukey]
                        ).limit(7).execute()
                        all_plan_ids.extend([r["id"] for r in res.data])

                    plan_items = []
                    for plan_id in all_plan_ids:
                        for meal_type in ["breakfast", "lunch", "dinner"]:
                            stt = random.choice(dish_stts[:40])
                            plan_items.append({
                                "plan_id": plan_id,
                                "meal_type": meal_type,
                                "dish_stt": stt,
                                "is_locked": False,
                            })
                    log.info("Seeding meal_plan_items (%d)...", len(plan_items))
                    for i in range(0, len(plan_items), 100):
                        db.table("meal_plan_items").insert(plan_items[i:i + 100]).execute()
                    log.info("  ✓ meal_plan_items")
                else:
                    log.info("  ⚠ meal_plan_items đã tồn tại, bỏ qua.")
        else:
            log.info("  ⚠ Bỏ qua meal_plan_items (không có dish_stts).")

        return True, "seed_05_nutrition_logs hoàn tất"

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
    main()
