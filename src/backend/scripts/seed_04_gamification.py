"""
Seed badges, quests, user_badges, user_quests,
wellness_entries (14 ngày x 5 mẹ), wellness_challenges.

Tables:
  1. public.badges           — 6 huy hiệu thành tích
  2. public.quests           — 5 nhiệm vụ gamification
  3. public.user_badges      — gán huy hiệu cho users
  4. public.user_quests      — tiến độ nhiệm vụ của users
  5. public.wellness_entries — 14 ngày ghi chép sức khỏe (5 mẹ = 70 bản ghi)
  6. public.wellness_challenges — 15 thử thách sức khỏe cá nhân

Usage:
    cd src/backend
    python -m scripts.seed_04_gamification

Requires: seed_01_users đã chạy.
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
from scripts._seed_ids import USERS, BADGES, QUESTS, MOTHER_KEYS  # noqa: E402

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

# ── Badges ─────────────────────────────────────────────────────────────────────
BADGES_DATA = [
    {
        "id": BADGES["buoc_dau"],
        "name": "Bước Đầu Tiên",
        "description": "Chào mừng đến với NextAI! Hoàn thành đăng ký và điền hồ sơ sức khỏe.",
        "icon_url": "https://cdn.nextai.vn/badges/first-step.png",
        "criteria": {"action": "complete_profile", "count": 1},
        "is_active": True,
    },
    {
        "id": BADGES["kien_tri_7"],
        "name": "7 Ngày Kiên Trì",
        "description": "Theo dõi sức khỏe và ghi nhật ký 7 ngày liên tiếp không bỏ lỡ.",
        "icon_url": "https://cdn.nextai.vn/badges/7-days.png",
        "criteria": {"action": "daily_log_streak", "days": 7},
        "is_active": True,
    },
    {
        "id": BADGES["vang_30"],
        "name": "30 Ngày Vàng",
        "description": "Duy trì theo dõi sức khỏe liên tục trong 30 ngày. Thành tích xuất sắc!",
        "icon_url": "https://cdn.nextai.vn/badges/30-days-gold.png",
        "criteria": {"action": "daily_log_streak", "days": 30},
        "is_active": True,
    },
    {
        "id": BADGES["me_dinh_duong"],
        "name": "Mẹ Dinh Dưỡng",
        "description": "Đạt đủ 90% nhu cầu dinh dưỡng trong 5 ngày liên tiếp.",
        "icon_url": "https://cdn.nextai.vn/badges/nutrition-mom.png",
        "criteria": {"action": "nutrition_goal_streak", "days": 5, "threshold": 0.9},
        "is_active": True,
    },
    {
        "id": BADGES["be_khoe_me_vui"],
        "name": "Bé Khỏe Mẹ Vui",
        "description": "Hoàn thành đầy đủ 3 lịch khám thai quan trọng và ghi kết quả vào hệ thống.",
        "icon_url": "https://cdn.nextai.vn/badges/healthy-baby.png",
        "criteria": {"action": "checkup_logged", "count": 3},
        "is_active": True,
    },
    {
        "id": BADGES["nha_tham_hieu"],
        "name": "Nhà Thám Hiểm Dinh Dưỡng",
        "description": "Sử dụng tính năng quét thức ăn bằng AI 10 lần thành công.",
        "icon_url": "https://cdn.nextai.vn/badges/food-explorer.png",
        "criteria": {"action": "food_scan", "count": 10},
        "is_active": True,
    },
]

# ── Quests ─────────────────────────────────────────────────────────────────────
QUESTS_DATA = [
    {
        "id": QUESTS["theo_doi_7_ngay"],
        "title": "Theo Dõi 7 Ngày Liên Tiếp",
        "description": "Ghi nhật ký sức khỏe (cân nặng, nước uống, tâm trạng) mỗi ngày trong 7 ngày liên tiếp.",
        "reward": 100,
        "category": "wellness",
        "is_active": True,
    },
    {
        "id": QUESTS["scan_thuc_an_5_lan"],
        "title": "Khám Phá Thức Ăn (5 lần)",
        "description": "Dùng tính năng quét thức ăn bằng AI để nhận diện và lưu dinh dưỡng 5 bữa ăn.",
        "reward": 50,
        "category": "nutrition",
        "is_active": True,
    },
    {
        "id": QUESTS["hoan_thanh_thuc_don"],
        "title": "Ngày Đầu Tiên Theo Thực Đơn AI",
        "description": "Hoàn thành đầy đủ 3 bữa ăn (sáng, trưa, tối) theo gợi ý thực đơn của AI trong 1 ngày.",
        "reward": 30,
        "category": "nutrition",
        "is_active": True,
    },
    {
        "id": QUESTS["ket_noi_chong"],
        "title": "Kết Nối Với Người Đồng Hành",
        "description": "Mời chồng/vợ kết nối trên NextAI và hoàn thành 1 task chung đầu tiên.",
        "reward": 80,
        "category": "partnership",
        "is_active": True,
    },
    {
        "id": QUESTS["ghi_cam_xuc_7_ngay"],
        "title": "Nhật Ký Cảm Xúc 7 Ngày",
        "description": "Ghi lại điểm tâm trạng và ghi chú cảm xúc mỗi ngày trong 7 ngày. Chăm sóc sức khỏe tinh thần.",
        "reward": 70,
        "category": "mental_health",
        "is_active": True,
    },
]

# ── User Badges (gán cho users) ────────────────────────────────────────────────
USER_BADGES_DATA = [
    # Lan — đã có 3 huy hiệu (đang tuần 24, tích cực)
    {"user_id": USERS["lan"], "badge_id": BADGES["buoc_dau"], "earned_at": "2026-01-10T10:00:00+07:00"},
    {"user_id": USERS["lan"], "badge_id": BADGES["kien_tri_7"], "earned_at": "2026-02-01T10:00:00+07:00"},
    {"user_id": USERS["lan"], "badge_id": BADGES["nha_tham_hieu"], "earned_at": "2026-03-15T10:00:00+07:00"},
    # Mai — sau sinh, tích cực
    {"user_id": USERS["mai"], "badge_id": BADGES["buoc_dau"], "earned_at": "2025-08-01T10:00:00+07:00"},
    {"user_id": USERS["mai"], "badge_id": BADGES["kien_tri_7"], "earned_at": "2025-08-15T10:00:00+07:00"},
    {"user_id": USERS["mai"], "badge_id": BADGES["vang_30"], "earned_at": "2025-09-10T10:00:00+07:00"},
    {"user_id": USERS["mai"], "badge_id": BADGES["me_dinh_duong"], "earned_at": "2025-10-01T10:00:00+07:00"},
    {"user_id": USERS["mai"], "badge_id": BADGES["be_khoe_me_vui"], "earned_at": "2025-12-01T10:00:00+07:00"},
    # Hoa — tuần 12, mới bắt đầu
    {"user_id": USERS["hoa"], "badge_id": BADGES["buoc_dau"], "earned_at": "2026-03-01T10:00:00+07:00"},
    # Linh — tuần 32, tích cực
    {"user_id": USERS["linh"], "badge_id": BADGES["buoc_dau"], "earned_at": "2025-12-01T10:00:00+07:00"},
    {"user_id": USERS["linh"], "badge_id": BADGES["kien_tri_7"], "earned_at": "2026-01-10T10:00:00+07:00"},
    {"user_id": USERS["linh"], "badge_id": BADGES["me_dinh_duong"], "earned_at": "2026-02-15T10:00:00+07:00"},
    # Thu — chưa mang thai nhưng tích cực theo dõi
    {"user_id": USERS["thu"], "badge_id": BADGES["buoc_dau"], "earned_at": "2026-01-15T10:00:00+07:00"},
    # Nam (bố)
    {"user_id": USERS["nam"], "badge_id": BADGES["buoc_dau"],     "earned_at": "2026-01-10T10:30:00+07:00"},
    {"user_id": USERS["nam"], "badge_id": BADGES["nha_tham_hieu"], "earned_at": "2026-01-11T10:00:00+07:00"},
]

# ── User Quests ────────────────────────────────────────────────────────────────
USER_QUESTS_DATA = [
    # Lan
    {"user_id": USERS["lan"], "quest_id": QUESTS["theo_doi_7_ngay"], "completed": True, "completed_at": "2026-02-05T20:00:00+07:00"},
    {"user_id": USERS["lan"], "quest_id": QUESTS["scan_thuc_an_5_lan"], "completed": True, "completed_at": "2026-03-10T19:00:00+07:00"},
    {"user_id": USERS["lan"], "quest_id": QUESTS["hoan_thanh_thuc_don"], "completed": True, "completed_at": "2026-02-20T21:00:00+07:00"},
    {"user_id": USERS["lan"], "quest_id": QUESTS["ket_noi_chong"], "completed": True, "completed_at": "2026-01-11T10:00:00+07:00"},
    {"user_id": USERS["lan"], "quest_id": QUESTS["ghi_cam_xuc_7_ngay"], "completed": False, "completed_at": None},
    # Mai
    {"user_id": USERS["mai"], "quest_id": QUESTS["theo_doi_7_ngay"], "completed": True, "completed_at": "2025-08-20T20:00:00+07:00"},
    {"user_id": USERS["mai"], "quest_id": QUESTS["hoan_thanh_thuc_don"], "completed": True, "completed_at": "2025-09-05T21:00:00+07:00"},
    {"user_id": USERS["mai"], "quest_id": QUESTS["ket_noi_chong"], "completed": True, "completed_at": "2025-08-02T10:00:00+07:00"},
    {"user_id": USERS["mai"], "quest_id": QUESTS["ghi_cam_xuc_7_ngay"], "completed": True, "completed_at": "2025-10-15T20:00:00+07:00"},
    # Hoa
    {"user_id": USERS["hoa"], "quest_id": QUESTS["theo_doi_7_ngay"], "completed": False, "completed_at": None},
    {"user_id": USERS["hoa"], "quest_id": QUESTS["ket_noi_chong"], "completed": True, "completed_at": "2026-03-02T10:00:00+07:00"},
    # Linh
    {"user_id": USERS["linh"], "quest_id": QUESTS["theo_doi_7_ngay"], "completed": True, "completed_at": "2026-01-15T20:00:00+07:00"},
    {"user_id": USERS["linh"], "quest_id": QUESTS["hoan_thanh_thuc_don"], "completed": True, "completed_at": "2026-01-20T21:00:00+07:00"},
    {"user_id": USERS["linh"], "quest_id": QUESTS["ket_noi_chong"], "completed": True, "completed_at": "2025-12-02T10:00:00+07:00"},
    {"user_id": USERS["linh"], "quest_id": QUESTS["ghi_cam_xuc_7_ngay"], "completed": False, "completed_at": None},
]


def _make_wellness_entries() -> list[dict]:
    """Tạo 14 ngày wellness entries cho 5 mẹ (70 bản ghi tổng)."""
    random.seed(42)  # Reproducible

    # Profile: (base_milk, base_mood, base_sleep, base_water, base_energy)
    profiles = {
        "lan":  (72, 4, 7.5, 2200, 4),  # tuần 24, năng lượng tốt
        "mai":  (60, 3, 5.0, 2400, 3),  # sau sinh, mệt
        "hoa":  (65, 4, 8.0, 2100, 4),  # tuần 12, ổn
        "thu":  (70, 4, 7.0, 1900, 4),  # không mang thai
        "linh": (55, 3, 6.0, 2500, 3),  # tuần 32, khó ngủ
    }

    notes_pool = {
        "lan": [
            "Phù chân buổi chiều, đã ngâm nước muối ấm.",
            "Bé đạp nhiều vào ban đêm, ngủ không sâu.",
            "Ăn sáng đầy đủ, cảm thấy năng lượng tốt.",
            "Buổi tối hơi khó thở khi nằm ngửa.",
            None, None, None,  # Ngày bình thường không ghi
        ],
        "mai": [
            "Bé Bảo bú tốt hơn hôm qua. Mừng lắm!",
            "Đêm bé thức 3 lần, mẹ mệt nhiều.",
            "Sữa về nhiều hơn sau khi uống cháo chân giò.",
            "Cảm thấy buồn và khóc không rõ lý do. Bình thường sau sinh.",
            None, None,
        ],
        "hoa": [
            "Ốm nghén giảm nhiều hơn tuần trước. Ăn được cháo yến mạch.",
            "Uống vitamin B12 đúng giờ. Thấy năng lượng tốt hơn.",
            "Ăn chay vẫn ổn, thêm tempeh vào bữa trưa.",
            None, None, None,
        ],
        "thu": [
            "Uống Levothyroxine đúng giờ. Theo dõi TSH tuần này.",
            "Cảm thấy cơ thể ổn định. Đang chuẩn bị tốt.",
            None, None,
        ],
        "linh": [
            "Đau lưng nhiều. Chồng massage 15 phút trước ngủ.",
            "Chuột rút chân lúc 3h sáng. Uống canxi thêm.",
            "Bé quay đầu rồi! Bác sĩ nói vị trí tốt để sinh.",
            "Khó ngủ vì bụng to. Nằm nghiêng trái dễ chịu hơn.",
            None, None,
        ],
    }

    entries = []
    for key in ["lan", "mai", "hoa", "thu", "linh"]:
        base_milk, base_mood, base_sleep, base_water, base_energy = profiles[key]
        pool = notes_pool[key]
        for i in range(14):
            entry_date = (TODAY - timedelta(days=13 - i)).isoformat()
            # Slight variation
            milk = max(0, min(100, base_milk + random.randint(-8, 8)))
            mood = max(1, min(5, base_mood + random.choice([-1, 0, 0, 0, 1])))
            sleep = max(0, base_sleep + random.uniform(-0.5, 0.5))
            water = max(0, base_water + random.randint(-200, 300))
            energy = max(1, min(5, base_energy + random.choice([-1, 0, 0, 1])))
            note = random.choice(pool)

            entries.append({
                "user_id": USERS[key],
                "entry_date": entry_date,
                "milk_score": milk,
                "mood": mood,
                "sleep_hours": round(sleep, 1),
                "water_intake_ml": water,
                "energy_level": energy,
                "notes": note,
            })
    return entries


def _make_wellness_challenges() -> list[dict]:
    """Tạo 15 thử thách sức khỏe cá nhân."""
    challenges = []
    challenge_templates = [
        # (type, text)
        ("water", "Uống đủ 2.5 lít nước hôm nay"),
        ("movement", "Đi bộ nhẹ 20 phút buổi sáng"),
        ("mindfulness", "Thiền 5 phút trước khi ngủ"),
        ("nutrition", "Ăn ít nhất 5 loại rau/quả hôm nay"),
        ("sleep", "Ngủ trước 22:30 tối nay"),
        ("bonding", "Dành 15 phút trò chuyện với bé trong bụng"),
        ("gratitude", "Viết 3 điều biết ơn vào nhật ký"),
        ("posture", "Kiểm tra và chỉnh tư thế ngồi mỗi giờ"),
        ("breathing", "Thực hiện bài thở 4-7-8 ba lần hôm nay"),
        ("supplement", "Uống đầy đủ vitamin và khoáng chất theo chỉ định"),
    ]

    configs = [
        ("lan", 5), ("mai", 4), ("hoa", 3), ("linh", 2), ("thu", 1),
    ]

    for user_key, count in configs:
        for j in range(count):
            tmpl = challenge_templates[(hash(user_key) + j) % len(challenge_templates)]
            day_offset = -(j * 2)  # cách nhau 2 ngày
            c_date = (TODAY + timedelta(days=day_offset)).isoformat()
            challenges.append({
                "user_id": USERS[user_key],
                "challenge_type": tmpl[0],
                "challenge_text": tmpl[1],
                "challenge_date": c_date,
                "completed": j < count - 1,  # tất cả trừ cái mới nhất đã hoàn thành
                "completed_at": f"{c_date}T21:00:00+07:00" if j < count - 1 else None,
            })
    return challenges


def seed(db: Client) -> tuple[bool, str]:
    try:
        log.info("Seeding badges (%d)...", len(BADGES_DATA))
        db.table("badges").upsert(BADGES_DATA, on_conflict="id").execute()
        log.info("  ✓ badges")

        log.info("Seeding quests (%d)...", len(QUESTS_DATA))
        db.table("quests").upsert(QUESTS_DATA, on_conflict="id").execute()
        log.info("  ✓ quests")

        log.info("Seeding user_badges (%d)...", len(USER_BADGES_DATA))
        db.table("user_badges").upsert(USER_BADGES_DATA, on_conflict="user_id,badge_id").execute()
        log.info("  ✓ user_badges")

        log.info("Seeding user_quests (%d)...", len(USER_QUESTS_DATA))
        db.table("user_quests").upsert(USER_QUESTS_DATA, on_conflict="user_id,quest_id").execute()
        log.info("  ✓ user_quests")

        wellness_entries = _make_wellness_entries()
        log.info("Seeding wellness_entries (%d)...", len(wellness_entries))
        existing_we = db.table("wellness_entries").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_we.data:
            # Insert in batches of 50
            for i in range(0, len(wellness_entries), 50):
                db.table("wellness_entries").insert(wellness_entries[i:i + 50]).execute()
            log.info("  ✓ wellness_entries (inserted %d)", len(wellness_entries))
        else:
            log.info("  ⚠ wellness_entries đã tồn tại (%d), bỏ qua.", len(existing_we.data))

        challenges = _make_wellness_challenges()
        log.info("Seeding wellness_challenges (%d)...", len(challenges))
        existing_wc = db.table("wellness_challenges").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_wc.data:
            db.table("wellness_challenges").insert(challenges).execute()
            log.info("  ✓ wellness_challenges (inserted %d)", len(challenges))
        else:
            log.info("  ⚠ wellness_challenges đã tồn tại, bỏ qua.")

        return True, "seed_04_gamification hoàn tất"

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
