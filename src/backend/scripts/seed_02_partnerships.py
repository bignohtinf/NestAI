"""
Seed partnerships, babies, tasks, shopping_items.

Tables:
  1. public.partnerships   — 4 cặp (Lan-Nam, Mai-Minh, Hoa-Đức, Thu-Hùng)
  2. public.babies         — 4 bé (1 đã sinh, 3 đang mang thai)
  3. public.tasks          — 24 việc gia đình / sức khỏe (6 / partnership)
  4. public.shopping_items — 20 món mua sắm thai kỳ

Usage:
    cd src/backend
    python -m scripts.seed_02_partnerships

Requires: seed_01_users đã chạy trước.
"""

import os
import sys
import logging
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts._seed_ids import USERS, PARTNERSHIPS, BABIES  # noqa: E402

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

# ── Partnerships ───────────────────────────────────────────────────────────────
PARTNERSHIPS_DATA = [
    {
        "id": PARTNERSHIPS["lan_nam"],
        "father_id": USERS["nam"],
        "mother_id": USERS["lan"],
        "status": "accepted",
        "requested_by": USERS["nam"],
        "requested_at": "2025-11-25T10:00:00+07:00",
        "responded_at": "2025-11-25T10:30:00+07:00",
        "responded_by": USERS["lan"],
        "notes": "Kết nối từ khi phát hiện mang thai lần đầu.",
    },
    {
        "id": PARTNERSHIPS["mai_minh"],
        "father_id": USERS["minh"],
        "mother_id": USERS["mai"],
        "status": "accepted",
        "requested_by": USERS["minh"],
        "requested_at": "2025-05-10T08:00:00+07:00",
        "responded_at": "2025-05-10T08:15:00+07:00",
        "responded_by": USERS["mai"],
        "notes": "Đã kết nối từ đầu thai kỳ.",
    },
    {
        "id": PARTNERSHIPS["hoa_duc"],
        "father_id": USERS["duc"],
        "mother_id": USERS["hoa"],
        "status": "accepted",
        "requested_by": USERS["duc"],
        "requested_at": "2026-02-18T09:00:00+07:00",
        "responded_at": "2026-02-18T09:10:00+07:00",
        "responded_by": USERS["hoa"],
        "notes": "Kết nối ngay sau khi xác nhận có thai tuần 1.",
    },
    {
        "id": PARTNERSHIPS["thu_hung"],
        "father_id": USERS["hung"],
        "mother_id": USERS["thu"],
        "status": "accepted",
        "requested_by": USERS["hung"],
        "requested_at": "2026-01-05T14:00:00+07:00",
        "responded_at": "2026-01-05T14:20:00+07:00",
        "responded_by": USERS["thu"],
        "notes": "Kết nối để theo dõi sức khỏe tiền sản cùng nhau.",
    },
]

# ── Babies ─────────────────────────────────────────────────────────────────────
BABIES_DATA = [
    {
        "id": BABIES["an"],
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "name": "Bé An",
        "status": "pregnant",
        "lmp": "2025-11-24",
        "edd": "2026-09-01",
        "mother_name": "Nguyễn Thị Lan",
        "father_name": "Nguyễn Văn Nam",
        "gender": None,  # chưa biết
        "notes": "Thai kỳ đầu, dự kiến sinh tháng 9/2026.",
    },
    {
        "id": BABIES["bao"],
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "name": "Trần Minh Bảo",
        "status": "born",
        "date_of_birth": "2026-02-14",
        "gender": "male",
        "weight_at_birth": 3.25,
        "height_at_birth": 50.0,
        "blood_type": "O",
        "mother_name": "Trần Thị Mai",
        "father_name": "Trần Văn Minh",
        "notes": "Sinh nhân ngày Lễ tình nhân. Sức khỏe tốt.",
    },
    {
        "id": BABIES["chi"],
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "name": "Bé Chi",
        "status": "pregnant",
        "lmp": "2026-02-17",
        "edd": "2026-11-20",
        "mother_name": "Lê Thị Hoa",
        "father_name": "Lê Văn Đức",
        "gender": None,
        "notes": "Mẹ ăn chay, theo dõi dinh dưỡng sát sao.",
    },
    {
        "id": BABIES["dung"],
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "name": "Bé Dũng (dự kiến)",
        "status": "pregnant",
        "lmp": "2026-04-25",
        "edd": "2027-01-30",
        "mother_name": "Phạm Thị Thu",
        "father_name": "Phạm Văn Hùng",
        "gender": None,
        "notes": "Mang thai sau khi điều trị ổn định tuyến giáp. Theo dõi TSH định kỳ.",
    },
]

# ── Tasks ──────────────────────────────────────────────────────────────────────
# 6 task mỗi partnership = 24 tổng
TASKS_DATA = [
    # Lan & Nam (tuần 24)
    {
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "title": "Đặt lịch khám thai tuần 24-28",
        "category": "health",
        "priority": "urgent",
        "description": "Đặt lịch khám tại BV Phụ Sản Hà Nội, kiểm tra đường huyết thai kỳ (OGTT).",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["nam"],
    },
    {
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "title": "Chuẩn bị bữa sáng giàu sắt hằng ngày",
        "category": "household",
        "priority": "high",
        "description": "Nấu cháo thịt bò hoặc trứng + rau xanh mỗi sáng cho vợ.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["lan"],
    },
    {
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "title": "Mua bổ sung DHA cho mẹ",
        "category": "health",
        "priority": "high",
        "description": "Mua 2 hộp DHA 200mg Nordic Naturals theo đơn bác sĩ.",
        "due_time": None,
        "assigned_to": "father",
        "completed": True,
        "created_by": USERS["lan"],
    },
    {
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "title": "Massage chân cho vợ mỗi tối",
        "category": "emotional",
        "priority": "normal",
        "description": "Vợ bị phù chân từ tuần 20, massage nhẹ 15 phút trước khi ngủ.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["lan"],
    },
    {
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "title": "Đăng ký lớp tiền sản",
        "category": "health",
        "priority": "normal",
        "description": "Đăng ký lớp học tiền sản tại bệnh viện cho cả hai vợ chồng.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["lan"],
    },
    {
        "partnership_id": PARTNERSHIPS["lan_nam"],
        "title": "Vệ sinh và chuẩn bị phòng cho bé",
        "category": "household",
        "priority": "normal",
        "description": "Sơn và sắp xếp phòng bé trước tháng 7.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["lan"],
    },
    # Mai & Minh (sau sinh)
    {
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "title": "Chuẩn bị bữa lợi sữa cho mẹ",
        "category": "household",
        "priority": "urgent",
        "description": "Nấu chân giò hầm đu đủ xanh mỗi ngày để tăng lượng sữa.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["minh"],
    },
    {
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "title": "Kiểm tra cân nặng bé Bảo hàng tuần",
        "category": "health",
        "priority": "high",
        "description": "Bé 3 tháng tuổi, cần theo dõi cân nặng tăng ít nhất 150g/tuần.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["mai"],
    },
    {
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "title": "Mua vitamin D3 cho bé Bảo",
        "category": "health",
        "priority": "high",
        "description": "Bé cần bổ sung vitamin D3 400IU/ngày theo chỉ định.",
        "due_time": None,
        "assigned_to": "father",
        "completed": True,
        "created_by": USERS["mai"],
    },
    {
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "title": "Đặt lịch tiêm phòng tháng 3 cho bé",
        "category": "health",
        "priority": "urgent",
        "description": "Tiêm phòng mũi DPT-IPV-HiB, viêm gan B theo lịch.",
        "due_time": None,
        "assigned_to": "mother",
        "completed": False,
        "created_by": USERS["minh"],
    },
    {
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "title": "Trò chuyện với vợ về cảm xúc sau sinh",
        "category": "emotional",
        "priority": "high",
        "description": "Vợ có dấu hiệu mệt mỏi và buồn bã. Lắng nghe và hỗ trợ tinh thần.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["minh"],
    },
    {
        "partnership_id": PARTNERSHIPS["mai_minh"],
        "title": "Cho mẹ nghỉ ngơi 2 tiếng mỗi chiều",
        "category": "emotional",
        "priority": "normal",
        "description": "Bố trông bé để mẹ ngủ bù và tự chăm sóc bản thân.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["mai"],
    },
    # Hoa & Đức (tuần 12, ăn chay)
    {
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "title": "Tìm thực đơn chay giàu protein cho mẹ",
        "category": "health",
        "priority": "high",
        "description": "Nghiên cứu và lên thực đơn chay với đậu hũ, tempeh, đậu lăng đủ 60g protein/ngày.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["duc"],
    },
    {
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "title": "Đặt lịch xét nghiệm máu kiểm tra B12 và sắt",
        "category": "health",
        "priority": "urgent",
        "description": "Xét nghiệm B12, ferritin, CBC cho mẹ bầu ăn chay tuần 12.",
        "due_time": None,
        "assigned_to": "mother",
        "completed": True,
        "created_by": USERS["hoa"],
    },
    {
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "title": "Mua thực phẩm chay bổ sung sắt",
        "category": "household",
        "priority": "high",
        "description": "Mua rau bina, đậu lăng, hạt bí, mè đen về nấu ăn hàng tuần.",
        "due_time": None,
        "assigned_to": "father",
        "completed": True,
        "created_by": USERS["hoa"],
    },
    {
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "title": "Đọc sách về sinh nở tự nhiên",
        "category": "emotional",
        "priority": "normal",
        "description": "Vợ muốn sinh tự nhiên. Cùng đọc và tìm hiểu để hỗ trợ tốt hơn.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["hoa"],
    },
    {
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "title": "Ghi chép triệu chứng ốm nghén hàng ngày",
        "category": "health",
        "priority": "normal",
        "description": "Ghi lại thời điểm và mức độ ốm nghén để báo cáo với bác sĩ.",
        "due_time": None,
        "assigned_to": "mother",
        "completed": False,
        "created_by": USERS["duc"],
    },
    {
        "partnership_id": PARTNERSHIPS["hoa_duc"],
        "title": "Nấu cháo đậu xanh sáng thứ Hai hàng tuần",
        "category": "household",
        "priority": "normal",
        "description": "Cháo đậu xanh hạt sen giúp bổ sung folate và protein thực vật.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["hoa"],
    },
    # Thu & Hùng (chuẩn bị mang thai)
    {
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "title": "Kiểm tra TSH trước khi thụ thai",
        "category": "health",
        "priority": "urgent",
        "description": "Xét nghiệm TSH đạt mức < 2.5 mIU/L trước khi mang thai với suy giáp.",
        "due_time": None,
        "assigned_to": "mother",
        "completed": False,
        "created_by": USERS["thu"],
    },
    {
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "title": "Uống acid folic 3 tháng trước thụ thai",
        "category": "health",
        "priority": "high",
        "description": "Bắt đầu uống acid folic 5mg/ngày từ bây giờ để ngăn ngừa dị tật ống thần kinh.",
        "due_time": None,
        "assigned_to": "mother",
        "completed": True,
        "created_by": USERS["hung"],
    },
    {
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "title": "Lên kế hoạch dinh dưỡng tiền sản",
        "category": "health",
        "priority": "high",
        "description": "Dùng ứng dụng NextAI lên thực đơn giàu sắt, canxi, omega-3.",
        "due_time": None,
        "assigned_to": "mother",
        "completed": False,
        "created_by": USERS["thu"],
    },
    {
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "title": "Hỗ trợ vợ nhớ uống thuốc đúng giờ",
        "category": "health",
        "priority": "normal",
        "description": "Nhắc vợ uống Levothyroxine trước ăn 30 phút mỗi sáng.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["hung"],
    },
    {
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "title": "Đặt lịch tư vấn bác sĩ sản khoa",
        "category": "health",
        "priority": "high",
        "description": "Gặp bác sĩ sản để được tư vấn về kế hoạch mang thai với bệnh tuyến giáp.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["thu"],
    },
    {
        "partnership_id": PARTNERSHIPS["thu_hung"],
        "title": "Tạo môi trường không stress cho vợ",
        "category": "emotional",
        "priority": "normal",
        "description": "Stress ảnh hưởng xấu đến tuyến giáp. Lên kế hoạch cuối tuần thư giãn cùng nhau.",
        "due_time": None,
        "assigned_to": "father",
        "completed": False,
        "created_by": USERS["hung"],
    },
]

# ── Shopping Items ─────────────────────────────────────────────────────────────
SHOPPING_DATA = [
    # Lan & Nam
    {"partnership_id": PARTNERSHIPS["lan_nam"], "name": "DHA 200mg Nordic Naturals 60 viên", "category": "thuốc & vitamin", "price": 580000, "quantity": 2, "purchased": True, "purchased_by": USERS["nam"], "notes": "Theo đơn bác sĩ tuần 20"},
    {"partnership_id": PARTNERSHIPS["lan_nam"], "name": "Sắt hữu cơ Ferrovit 30mg", "category": "thuốc & vitamin", "price": 250000, "quantity": 1, "purchased": True, "purchased_by": USERS["nam"], "notes": None},
    {"partnership_id": PARTNERSHIPS["lan_nam"], "name": "Gối nằm nghiêng cho bà bầu", "category": "đồ dùng mẹ", "price": 350000, "quantity": 1, "purchased": False, "purchased_by": None, "notes": "Mua trước tuần 28"},
    {"partnership_id": PARTNERSHIPS["lan_nam"], "name": "Tã sơ sinh Pampers NB (bộ 3 gói)", "category": "đồ cho bé", "price": 450000, "quantity": 3, "purchased": False, "purchased_by": None, "notes": "Mua khi gần sinh"},
    {"partnership_id": PARTNERSHIPS["lan_nam"], "name": "Quần áo sơ sinh 0-3 tháng", "category": "đồ cho bé", "price": 600000, "quantity": 1, "purchased": False, "purchased_by": None, "notes": None},
    # Mai & Minh
    {"partnership_id": PARTNERSHIPS["mai_minh"], "name": "Vitamin D3 400IU nhỏ giọt cho bé", "category": "thuốc & vitamin", "price": 180000, "quantity": 2, "purchased": True, "purchased_by": USERS["minh"], "notes": "Cho bé Bảo uống hàng ngày"},
    {"partnership_id": PARTNERSHIPS["mai_minh"], "name": "Máy hút sữa Spectra S1+", "category": "đồ cho con bú", "price": 3200000, "quantity": 1, "purchased": True, "purchased_by": USERS["minh"], "notes": "Hút sữa trữ đông"},
    {"partnership_id": PARTNERSHIPS["mai_minh"], "name": "Túi trữ sữa Lansinoh 100 túi", "category": "đồ cho con bú", "price": 320000, "quantity": 2, "purchased": True, "purchased_by": USERS["minh"], "notes": None},
    {"partnership_id": PARTNERSHIPS["mai_minh"], "name": "Giày chân giò heo (1kg)", "category": "thực phẩm", "price": 85000, "quantity": 4, "purchased": False, "purchased_by": None, "notes": "Nấu cháo lợi sữa mỗi tuần"},
    {"partnership_id": PARTNERSHIPS["mai_minh"], "name": "Đu đủ xanh (3kg)", "category": "thực phẩm", "price": 45000, "quantity": 3, "purchased": False, "purchased_by": None, "notes": "Hầm với chân giò"},
    # Hoa & Đức
    {"partnership_id": PARTNERSHIPS["hoa_duc"], "name": "Tempeh đậu nành (gói 500g)", "category": "thực phẩm chay", "price": 65000, "quantity": 4, "purchased": True, "purchased_by": USERS["duc"], "notes": "Nguồn protein chay cho mẹ"},
    {"partnership_id": PARTNERSHIPS["hoa_duc"], "name": "Đậu lăng xanh (500g)", "category": "thực phẩm chay", "price": 55000, "quantity": 5, "purchased": True, "purchased_by": USERS["duc"], "notes": "Giàu sắt thực vật"},
    {"partnership_id": PARTNERSHIPS["hoa_duc"], "name": "Hạt bí rang (200g)", "category": "thực phẩm chay", "price": 85000, "quantity": 3, "purchased": False, "purchased_by": None, "notes": "Ăn vặt lành mạnh, giàu kẽm"},
    {"partnership_id": PARTNERSHIPS["hoa_duc"], "name": "Vitamin B12 Jarrow 1000mcg", "category": "thuốc & vitamin", "price": 420000, "quantity": 1, "purchased": True, "purchased_by": USERS["duc"], "notes": "Quan trọng cho mẹ ăn chay"},
    {"partnership_id": PARTNERSHIPS["hoa_duc"], "name": "Mè đen rang (500g)", "category": "thực phẩm chay", "price": 75000, "quantity": 2, "purchased": False, "purchased_by": None, "notes": "Canxi từ thực vật"},
    # Thu & Hùng
    {"partnership_id": PARTNERSHIPS["thu_hung"], "name": "Acid folic Fefol 5mg (30 viên)", "category": "thuốc & vitamin", "price": 95000, "quantity": 3, "purchased": True, "purchased_by": USERS["hung"], "notes": "Uống 3 tháng trước thụ thai"},
    {"partnership_id": PARTNERSHIPS["thu_hung"], "name": "Que thử rụng trứng Wondfo (20 que)", "category": "theo dõi sinh sản", "price": 160000, "quantity": 2, "purchased": True, "purchased_by": USERS["thu"], "notes": "Xác định ngày rụng trứng"},
    {"partnership_id": PARTNERSHIPS["thu_hung"], "name": "Sách 'Hành trình làm mẹ' - BS Lê Thị Thu Hà", "category": "sách", "price": 145000, "quantity": 1, "purchased": False, "purchased_by": None, "notes": None},
    {"partnership_id": PARTNERSHIPS["thu_hung"], "name": "Máy đo huyết áp Omron HEM-7120", "category": "thiết bị y tế", "price": 890000, "quantity": 1, "purchased": True, "purchased_by": USERS["hung"], "notes": "Theo dõi huyết áp chồng"},
    {"partnership_id": PARTNERSHIPS["thu_hung"], "name": "Omega-3 Fish Oil 1000mg (60 viên)", "category": "thuốc & vitamin", "price": 350000, "quantity": 1, "purchased": False, "purchased_by": None, "notes": "Chuẩn bị cho thai kỳ"},
]


def seed(db: Client) -> tuple[bool, str]:
    try:
        log.info("Seeding partnerships (%d)...", len(PARTNERSHIPS_DATA))
        db.table("partnerships").upsert(PARTNERSHIPS_DATA, on_conflict="id").execute()
        log.info("  ✓ partnerships")

        log.info("Seeding babies (%d)...", len(BABIES_DATA))
        db.table("babies").upsert(BABIES_DATA, on_conflict="id").execute()
        log.info("  ✓ babies")

        log.info("Seeding tasks (%d)...", len(TASKS_DATA))
        # tasks không có id cố định → insert với ignore_duplicates
        existing = db.table("tasks").select("partnership_id").in_(
            "partnership_id", list(PARTNERSHIPS.values())
        ).execute()
        if not existing.data:
            db.table("tasks").insert(TASKS_DATA).execute()
            log.info("  ✓ tasks (inserted %d)", len(TASKS_DATA))
        else:
            log.info("  ⚠ tasks đã tồn tại, bỏ qua.")

        log.info("Seeding shopping_items (%d)...", len(SHOPPING_DATA))
        existing_shop = db.table("shopping_items").select("partnership_id").in_(
            "partnership_id", list(PARTNERSHIPS.values())
        ).execute()
        if not existing_shop.data:
            db.table("shopping_items").insert(SHOPPING_DATA).execute()
            log.info("  ✓ shopping_items (inserted %d)", len(SHOPPING_DATA))
        else:
            log.info("  ⚠ shopping_items đã tồn tại, bỏ qua.")

        return True, "seed_02_partnerships hoàn tất"

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
