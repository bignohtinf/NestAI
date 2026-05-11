"""
Seed users, user_profiles, medical_profiles, wellness_profiles.

Tables (theo thứ tự phụ thuộc):
  1. public.users            — 10 người (5 mẹ, 4 bố, 1 admin)
  2. public.user_profiles    — thông tin cá nhân
  3. public.medical_profiles — hồ sơ y tế / thai kỳ
  4. public.wellness_profiles — hồ sơ sức khỏe tinh thần

Usage:
    cd src/backend
    python -m scripts.seed_01_users

Requires:
    - .env with SUPABASE_URL and SUPABASE_SERVICE_KEY
"""

import os
import sys
import logging
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

# Shared IDs — phải import SAU khi sys.path đúng
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts._seed_ids import USERS  # noqa: E402

# ── Logging & client ───────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    log.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_KEY trong .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Dữ liệu users ──────────────────────────────────────────────────────────────
USERS_DATA = [
    # ── Mothers ────────────────────────────────────────────────────────────────
    {
        "id": USERS["lan"],
        "email": "lan.nguyen@gmail.com",
        "phone": "0912345001",
        "full_name": "Nguyễn Thị Lan",
        "role": "mother",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1997-03-15",
        "allergies": ["hải sản"],
        "dislikes": ["mướp đắng", "đầu cá"],
        "condition": "none",
        "food_preference": "no_pref",
    },
    {
        "id": USERS["mai"],
        "email": "mai.tran@gmail.com",
        "phone": "0912345002",
        "full_name": "Trần Thị Mai",
        "role": "mother",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1994-07-22",
        "allergies": [],
        "dislikes": ["đồ cay", "tiêu"],
        "condition": "none",
        "food_preference": "no_pref",
    },
    {
        "id": USERS["hoa"],
        "email": "hoa.le@gmail.com",
        "phone": "0912345003",
        "full_name": "Lê Thị Hoa",
        "role": "mother",
        "is_active": True,
        "email_verified": True,
        "phone_verified": False,
        "dob": "1999-11-08",
        "allergies": ["đậu phộng"],
        "dislikes": [],
        "condition": "none",
        "food_preference": "vegetarian",
    },
    {
        "id": USERS["thu"],
        "email": "thu.pham@gmail.com",
        "phone": "0912345004",
        "full_name": "Phạm Thị Thu",
        "role": "mother",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1992-04-30",
        "allergies": [],
        "dislikes": ["nội tạng động vật"],
        "condition": "none",
        "food_preference": "no_pref",
    },
    {
        "id": USERS["linh"],
        "email": "linh.hoang@gmail.com",
        "phone": "0912345005",
        "full_name": "Hoàng Thị Linh",
        "role": "mother",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1996-09-12",
        "allergies": [],
        "dislikes": [],
        "condition": "none",
        "food_preference": "no_pref",
    },
    # ── Fathers ────────────────────────────────────────────────────────────────
    {
        "id": USERS["nam"],
        "email": "nam.nguyen@gmail.com",
        "phone": "0912345011",
        "full_name": "Nguyễn Văn Nam",
        "role": "father",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1996-05-20",
        "allergies": [],
        "dislikes": [],
        "condition": "none",
        "food_preference": "no_pref",
    },
    {
        "id": USERS["minh"],
        "email": "minh.tran@gmail.com",
        "phone": "0912345012",
        "full_name": "Trần Văn Minh",
        "role": "father",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1993-12-05",
        "allergies": [],
        "dislikes": [],
        "condition": "none",
        "food_preference": "no_pref",
    },
    {
        "id": USERS["duc"],
        "email": "duc.le@gmail.com",
        "phone": "0912345013",
        "full_name": "Lê Văn Đức",
        "role": "father",
        "is_active": True,
        "email_verified": True,
        "phone_verified": False,
        "dob": "2000-02-28",
        "allergies": [],
        "dislikes": ["rau mùi"],
        "condition": "none",
        "food_preference": "no_pref",
    },
    {
        "id": USERS["hung"],
        "email": "hung.pham@gmail.com",
        "phone": "0912345014",
        "full_name": "Phạm Văn Hùng",
        "role": "father",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1991-08-15",
        "allergies": [],
        "dislikes": [],
        "condition": "none",
        "food_preference": "no_pref",
    },
    # ── Admin ──────────────────────────────────────────────────────────────────
    {
        "id": USERS["admin"],
        "email": "admin@nextai.vn",
        "phone": "0912345099",
        "full_name": "Admin NextAI",
        "role": "admin",
        "is_active": True,
        "email_verified": True,
        "phone_verified": True,
        "dob": "1990-01-01",
        "allergies": [],
        "dislikes": [],
        "condition": "none",
        "food_preference": "no_pref",
    },
]

# ── Dữ liệu user_profiles ──────────────────────────────────────────────────────
USER_PROFILES_DATA = [
    {
        "user_id": USERS["lan"],
        "date_of_birth": "1997-03-15",
        "gender": "female",
        "address": "123 Phố Huế, Hai Bà Trưng",
        "city": "Hà Nội",
        "country": "VN",
        "bio": "Mẹ bầu lần đầu, đang ở tuần 24 thai kỳ. Thích nấu ăn và yoga nhẹ.",
        "preferences": {"theme": "light", "notifications_enabled": True, "language": "vi", "reminder_meal": True},
    },
    {
        "user_id": USERS["mai"],
        "date_of_birth": "1994-07-22",
        "gender": "female",
        "address": "45 Nguyễn Huệ, Quận 1",
        "city": "Hồ Chí Minh",
        "country": "VN",
        "bio": "Mẹ đang trong giai đoạn hồi phục sau sinh bé Bảo được 3 tháng.",
        "preferences": {"theme": "dark", "notifications_enabled": True, "language": "vi", "reminder_meal": True},
    },
    {
        "user_id": USERS["hoa"],
        "date_of_birth": "1999-11-08",
        "gender": "female",
        "address": "78 Trần Phú, Hải Châu",
        "city": "Đà Nẵng",
        "country": "VN",
        "bio": "Mẹ bầu lần đầu, ăn chay trường. Quan tâm đến dinh dưỡng thuần thực vật.",
        "preferences": {"theme": "light", "notifications_enabled": True, "language": "vi", "reminder_meal": False},
    },
    {
        "user_id": USERS["thu"],
        "date_of_birth": "1992-04-30",
        "gender": "female",
        "address": "22 Kim Mã, Ba Đình",
        "city": "Hà Nội",
        "country": "VN",
        "bio": "Đang chuẩn bị cho lần mang thai tiếp theo sau khi điều trị ổn định tuyến giáp.",
        "preferences": {"theme": "light", "notifications_enabled": False, "language": "vi", "reminder_meal": False},
    },
    {
        "user_id": USERS["linh"],
        "date_of_birth": "1996-09-12",
        "gender": "female",
        "address": "56 Lê Lợi, Quận 1",
        "city": "Hồ Chí Minh",
        "country": "VN",
        "bio": "Mẹ bầu tuần 32, sắp đến ngày sinh nở. Đang tập trung vào dinh dưỡng cuối thai kỳ.",
        "preferences": {"theme": "light", "notifications_enabled": True, "language": "vi", "reminder_meal": True},
    },
    {
        "user_id": USERS["nam"],
        "date_of_birth": "1996-05-20",
        "gender": "male",
        "address": "123 Phố Huế, Hai Bà Trưng",
        "city": "Hà Nội",
        "country": "VN",
        "bio": "Bố tương lai, đang học cách chăm sóc mẹ và bé trong thai kỳ.",
        "preferences": {"theme": "light", "notifications_enabled": True, "language": "vi"},
    },
    {
        "user_id": USERS["minh"],
        "date_of_birth": "1993-12-05",
        "gender": "male",
        "address": "45 Nguyễn Huệ, Quận 1",
        "city": "Hồ Chí Minh",
        "country": "VN",
        "bio": "Bố của bé Bảo, đang hỗ trợ vợ phục hồi sau sinh.",
        "preferences": {"theme": "dark", "notifications_enabled": True, "language": "vi"},
    },
    {
        "user_id": USERS["duc"],
        "date_of_birth": "2000-02-28",
        "gender": "male",
        "address": "78 Trần Phú, Hải Châu",
        "city": "Đà Nẵng",
        "country": "VN",
        "bio": "Bố trẻ, đồng hành cùng vợ từ tuần đầu tiên của thai kỳ.",
        "preferences": {"theme": "light", "notifications_enabled": True, "language": "vi"},
    },
    {
        "user_id": USERS["hung"],
        "date_of_birth": "1991-08-15",
        "gender": "male",
        "address": "22 Kim Mã, Ba Đình",
        "city": "Hà Nội",
        "country": "VN",
        "bio": "Đang cùng vợ lên kế hoạch mang thai, tìm hiểu về chế độ dinh dưỡng tiền sản.",
        "preferences": {"theme": "light", "notifications_enabled": True, "language": "vi"},
    },
    {
        "user_id": USERS["admin"],
        "date_of_birth": "1990-01-01",
        "gender": "male",
        "address": "1 Hàng Bài, Hoàn Kiếm",
        "city": "Hà Nội",
        "country": "VN",
        "bio": "Quản trị viên hệ thống NextAI.",
        "preferences": {"theme": "dark", "notifications_enabled": True, "language": "vi"},
    },
]

# ── Dữ liệu medical_profiles ───────────────────────────────────────────────────
MEDICAL_PROFILES_DATA = [
    {
        "user_id": USERS["lan"],
        "pregnancy_status": "pregnant",
        "trimester": 2,
        "week_of_pregnancy": 24,
        "days_in_week": 3,
        "due_date": "2026-09-01",
        "pre_pregnancy_weight_kg": 52.0,
        "current_weight_kg": 58.5,
        "height_cm": 158.0,
        "blood_type": "A",
        "rh_factor": "+",
        "chronic_diseases": [],
        "allergies": ["hải sản"],
        "medications": [
            {"name": "Acid folic", "dose": "5mg", "frequency": "1 lần/ngày"},
            {"name": "Sắt hữu cơ", "dose": "30mg", "frequency": "1 lần/ngày"},
        ],
        "medical_history": "Không có tiền sử bệnh đặc biệt. Thai kỳ phát triển bình thường.",
        "last_checkup_date": "2026-04-28",
        "next_checkup_date": "2026-05-26",
        "last_menstrual_period": "2025-11-24",
        "created_by": USERS["admin"],
        "updated_by": USERS["admin"],
    },
    {
        "user_id": USERS["mai"],
        "pregnancy_status": "postpartum",
        "trimester": None,
        "week_of_pregnancy": None,
        "days_in_week": 0,
        "due_date": None,
        "pre_pregnancy_weight_kg": 49.0,
        "current_weight_kg": 53.5,
        "height_cm": 155.0,
        "blood_type": "O",
        "rh_factor": "+",
        "chronic_diseases": [],
        "allergies": [],
        "medications": [
            {"name": "Vitamin tổng hợp sau sinh", "dose": "1 viên", "frequency": "1 lần/ngày"},
            {"name": "DHA", "dose": "200mg", "frequency": "1 lần/ngày"},
        ],
        "medical_history": "Sinh thường không biến chứng tháng 02/2026. Đang cho con bú.",
        "last_checkup_date": "2026-04-15",
        "next_checkup_date": "2026-06-15",
        "last_menstrual_period": "2025-05-01",
        "created_by": USERS["admin"],
        "updated_by": USERS["admin"],
    },
    {
        "user_id": USERS["hoa"],
        "pregnancy_status": "pregnant",
        "trimester": 1,
        "week_of_pregnancy": 12,
        "days_in_week": 5,
        "due_date": "2026-11-20",
        "pre_pregnancy_weight_kg": 47.0,
        "current_weight_kg": 48.5,
        "height_cm": 160.0,
        "blood_type": "B",
        "rh_factor": "+",
        "chronic_diseases": [],
        "allergies": ["đậu phộng"],
        "medications": [
            {"name": "Acid folic", "dose": "5mg", "frequency": "1 lần/ngày"},
            {"name": "Vitamin B12", "dose": "1000mcg", "frequency": "2 lần/tuần"},
            {"name": "Sắt hữu cơ", "dose": "30mg", "frequency": "1 lần/ngày"},
        ],
        "medical_history": "Ăn chay trường 3 năm, nguy cơ thiếu B12 và sắt. Cần bổ sung thường xuyên.",
        "last_checkup_date": "2026-05-05",
        "next_checkup_date": "2026-06-02",
        "last_menstrual_period": "2026-02-17",
        "created_by": USERS["admin"],
        "updated_by": USERS["admin"],
    },
    {
        "user_id": USERS["thu"],
        "pregnancy_status": "not_pregnant",
        "trimester": None,
        "week_of_pregnancy": None,
        "days_in_week": 0,
        "due_date": None,
        "pre_pregnancy_weight_kg": 55.0,
        "current_weight_kg": 55.5,
        "height_cm": 162.0,
        "blood_type": "AB",
        "rh_factor": "-",
        "chronic_diseases": [{"name": "Suy giáp", "diagnosed_year": 2020, "severity": "nhẹ"}],
        "allergies": [],
        "medications": [
            {"name": "Levothyroxine", "dose": "50mcg", "frequency": "1 lần/ngày, trước ăn 30 phút"},
        ],
        "medical_history": "Suy giáp nhẹ, đang điều trị ổn định. Cần kiểm tra TSH mỗi 3 tháng trước khi mang thai.",
        "last_checkup_date": "2026-03-10",
        "next_checkup_date": "2026-06-10",
        "last_menstrual_period": "2026-04-25",
        "created_by": USERS["admin"],
        "updated_by": USERS["admin"],
    },
    {
        "user_id": USERS["linh"],
        "pregnancy_status": "pregnant",
        "trimester": 3,
        "week_of_pregnancy": 32,
        "days_in_week": 4,
        "due_date": "2026-07-07",
        "pre_pregnancy_weight_kg": 51.0,
        "current_weight_kg": 63.5,
        "height_cm": 157.0,
        "blood_type": "A",
        "rh_factor": "+",
        "chronic_diseases": [],
        "allergies": [],
        "medications": [
            {"name": "Canxi", "dose": "500mg", "frequency": "2 lần/ngày"},
            {"name": "DHA", "dose": "200mg", "frequency": "1 lần/ngày"},
            {"name": "Sắt", "dose": "60mg", "frequency": "1 lần/ngày"},
            {"name": "Vitamin D3", "dose": "1000IU", "frequency": "1 lần/ngày"},
        ],
        "medical_history": "Thai nghén nhẹ ở tháng đầu, đã ổn định. Phù chân nhẹ từ tuần 28.",
        "last_checkup_date": "2026-05-05",
        "next_checkup_date": "2026-05-19",
        "last_menstrual_period": "2025-09-30",
        "created_by": USERS["admin"],
        "updated_by": USERS["admin"],
    },
    # Fathers — điền tối thiểu
    {
        "user_id": USERS["nam"],
        "pregnancy_status": "not_pregnant",
        "trimester": None, "week_of_pregnancy": None, "days_in_week": 0,
        "current_weight_kg": 68.0, "height_cm": 172.0,
        "blood_type": "A", "rh_factor": "+",
        "chronic_diseases": [], "allergies": [], "medications": [],
        "medical_history": None,
        "last_checkup_date": None, "next_checkup_date": None, "last_menstrual_period": None,
    },
    {
        "user_id": USERS["minh"],
        "pregnancy_status": "not_pregnant",
        "trimester": None, "week_of_pregnancy": None, "days_in_week": 0,
        "current_weight_kg": 72.0, "height_cm": 175.0,
        "blood_type": "O", "rh_factor": "+",
        "chronic_diseases": [], "allergies": [], "medications": [],
        "medical_history": None,
        "last_checkup_date": None, "next_checkup_date": None, "last_menstrual_period": None,
    },
    {
        "user_id": USERS["duc"],
        "pregnancy_status": "not_pregnant",
        "trimester": None, "week_of_pregnancy": None, "days_in_week": 0,
        "current_weight_kg": 65.0, "height_cm": 170.0,
        "blood_type": "B", "rh_factor": "+",
        "chronic_diseases": [], "allergies": [], "medications": [],
        "medical_history": None,
        "last_checkup_date": None, "next_checkup_date": None, "last_menstrual_period": None,
    },
    {
        "user_id": USERS["hung"],
        "pregnancy_status": "not_pregnant",
        "trimester": None, "week_of_pregnancy": None, "days_in_week": 0,
        "current_weight_kg": 75.0, "height_cm": 173.0,
        "blood_type": "AB", "rh_factor": "-",
        "chronic_diseases": [{"name": "Huyết áp cao nhẹ", "diagnosed_year": 2023}],
        "allergies": [], "medications": [],
        "medical_history": "Huyết áp nhẹ, đang theo dõi. Chưa cần dùng thuốc.",
        "last_checkup_date": None, "next_checkup_date": None, "last_menstrual_period": None,
    },
]

# ── Dữ liệu wellness_profiles (chỉ mothers) ────────────────────────────────────
WELLNESS_PROFILES_DATA = [
    {
        "user_id": USERS["lan"],
        "health_focus": ["dinh_dưỡng", "giấc_ngủ", "vận_động"],
        "last_sleep_hours": 7.5,
        "current_mood": 4,
        "health_concerns": "Lo về cân nặng tăng nhanh và phù chân vào buổi chiều.",
        "reminder_time": "08:00:00",
        "personalization_completed": True,
    },
    {
        "user_id": USERS["mai"],
        "health_focus": ["phục_hồi_sau_sinh", "cho_con_bú", "tâm_lý"],
        "last_sleep_hours": 5.0,
        "current_mood": 3,
        "health_concerns": "Mệt mỏi sau sinh, lo lắng về lượng sữa cho con.",
        "reminder_time": "07:30:00",
        "personalization_completed": True,
    },
    {
        "user_id": USERS["hoa"],
        "health_focus": ["dinh_dưỡng_chay", "vitamin_khoáng_chất", "năng_lượng"],
        "last_sleep_hours": 8.0,
        "current_mood": 4,
        "health_concerns": "Thiếu B12 và sắt do ăn chay. Cần theo dõi sát hơn.",
        "reminder_time": "09:00:00",
        "personalization_completed": True,
    },
    {
        "user_id": USERS["thu"],
        "health_focus": ["cân_bằng_nội_tiết", "dinh_dưỡng", "stress"],
        "last_sleep_hours": 7.0,
        "current_mood": 4,
        "health_concerns": "Tuyến giáp ảnh hưởng đến khả năng mang thai và năng lượng.",
        "reminder_time": "08:00:00",
        "personalization_completed": True,
    },
    {
        "user_id": USERS["linh"],
        "health_focus": ["dinh_dưỡng", "chuẩn_bị_sinh", "vận_động_nhẹ"],
        "last_sleep_hours": 6.0,
        "current_mood": 3,
        "health_concerns": "Khó ngủ, đau lưng và chuột rút ban đêm. Hồi hộp trước ngày sinh.",
        "reminder_time": "08:30:00",
        "personalization_completed": True,
    },
]


# ── Hàm seed ───────────────────────────────────────────────────────────────────
def seed(db: Client) -> tuple[bool, str]:
    try:
        # 1. Users
        log.info("Seeding users (%d bản ghi)...", len(USERS_DATA))
        db.table("users").upsert(USERS_DATA, on_conflict="id").execute()
        log.info("  ✓ users")

        # 2. User profiles
        log.info("Seeding user_profiles...")
        db.table("user_profiles").upsert(USER_PROFILES_DATA, on_conflict="user_id").execute()
        log.info("  ✓ user_profiles")

        # 3. Medical profiles
        log.info("Seeding medical_profiles...")
        db.table("medical_profiles").upsert(MEDICAL_PROFILES_DATA, on_conflict="user_id").execute()
        log.info("  ✓ medical_profiles")

        # 4. Wellness profiles
        log.info("Seeding wellness_profiles...")
        db.table("wellness_profiles").upsert(WELLNESS_PROFILES_DATA, on_conflict="user_id").execute()
        log.info("  ✓ wellness_profiles")

        return True, "seed_01_users hoàn tất (10 users, profiles, medical, wellness)"

    except Exception as e:
        log.error("Lỗi: %s", e)
        return False, str(e)


def main():
    ok, msg = seed(supabase)
    if ok:
        log.info("✅ %s", msg)
    else:
        log.error("❌ %s", msg)
        sys.exit(1)


if __name__ == "__main__":
    main()
