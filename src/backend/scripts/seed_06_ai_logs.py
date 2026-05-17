"""
Seed algorithm_configs, algorithm_config_history, food_scan_logs,
recommendation_logs, conversations, messages, chat_histories, token_usage_logs.

Tables:
  1. public.algorithm_configs        — 2 cấu hình AI hiện hành
  2. public.algorithm_config_history — 4 bản lịch sử thay đổi
  3. public.food_scan_logs           — 25 lần quét thức ăn bằng AI
  4. public.recommendation_logs      — 20 lần gợi ý thực đơn AI
  5. public.conversations            — 8 cuộc hội thoại với AI
  6. public.messages                 — ~40 tin nhắn trong các cuộc hội thoại
  7. public.chat_histories           — 8 lịch sử chat (legacy)
  8. public.token_usage_logs         — 30 ngày thống kê token/chi phí

Usage:
    cd src/backend
    python -m scripts.seed_06_ai_logs

Requires: seed_01_users, seed_05_nutrition_logs đã chạy.
"""

import os
import sys
import uuid
import random
import logging
from datetime import date, timedelta, datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts._seed_ids import USERS, ALGO_IDS  # noqa: E402

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

# ── Algorithm Configs ──────────────────────────────────────────────────────────
ALGO_CONFIGS_DATA = [
    {
        "id": ALGO_IDS["menu_rec"],
        "name": "Thuật toán Gợi ý Thực đơn Dinh dưỡng",
        "description": "Mô hình gợi ý thực đơn cá nhân hóa cho bà bầu dựa trên hồ sơ y tế, "
                       "giai đoạn thai kỳ, sở thích ăn uống và ngân sách.",
        "algorithm_type": "menu_recommendation",
        "status": "active",
        "current_version": "1.3.2",
        "model_checkpoint": "gpt-4o-mini",
        "config_json": {
            "model": "gpt-4o-mini",
            "temperature": 0.7,
            "max_tokens": 2000,
            "system_prompt_version": "v3",
            "include_budget": True,
            "include_allergies": True,
            "include_medical_conditions": True,
            "meal_types": ["breakfast", "lunch", "dinner"],
        },
        "last_evaluation_date": "2026-04-01",
        "accuracy": 0.87,
        "precision_score": 0.85,
        "recall_score": 0.89,
        "f1_score": 0.87,
        "calls_this_month": 4821,
        "success_rate": 0.97,
        "avg_response_time_ms": 1850,
        "last_training_date": "2026-03-01T00:00:00+07:00",
        "training_dataset_size": 150000,
        "training_duration_hours": 48.5,
        "deployed_at": "2026-03-15T00:00:00+07:00",
        "updated_by": USERS["admin"],
    },
    {
        "id": ALGO_IDS["food_recog"],
        "name": "Nhận diện Món ăn từ Hình ảnh",
        "description": "Mô hình computer vision nhận diện món ăn Việt Nam từ ảnh chụp, "
                       "trả về thông tin dinh dưỡng từ cơ sở dữ liệu.",
        "algorithm_type": "food_recognition",
        "status": "active",
        "current_version": "2.1.0",
        "model_checkpoint": "gpt-4o",
        "config_json": {
            "model": "gpt-4o",
            "temperature": 0.1,
            "max_tokens": 1000,
            "confidence_threshold": 0.75,
            "max_alternatives": 3,
            "supported_formats": ["jpg", "jpeg", "png", "webp"],
            "max_image_size_mb": 5,
        },
        "last_evaluation_date": "2026-04-15",
        "accuracy": 0.91,
        "precision_score": 0.89,
        "recall_score": 0.93,
        "f1_score": 0.91,
        "calls_this_month": 2304,
        "success_rate": 0.94,
        "avg_response_time_ms": 2300,
        "last_training_date": "2026-02-01T00:00:00+07:00",
        "training_dataset_size": 80000,
        "training_duration_hours": 72.0,
        "deployed_at": "2026-02-20T00:00:00+07:00",
        "updated_by": USERS["admin"],
    },
]

# ── Algorithm Config History ───────────────────────────────────────────────────
ALGO_HISTORY_DATA = [
    {
        "algorithm_id": ALGO_IDS["menu_rec"],
        "version": "1.3.2",
        "change_description": "Cập nhật system prompt v3: thêm ngữ cảnh văn hóa ẩm thực Việt Nam, "
                              "cải thiện gợi ý cho mẹ ăn chay.",
        "config_changes": {"system_prompt_version": {"old": "v2", "new": "v3"}, "temperature": {"old": 0.8, "new": 0.7}},
        "performance_changes": {"accuracy": {"old": 0.83, "new": 0.87}, "f1_score": {"old": 0.84, "new": 0.87}},
        "changed_at": "2026-04-01T09:00:00+07:00",
        "changed_by": USERS["admin"],
    },
    {
        "algorithm_id": ALGO_IDS["menu_rec"],
        "version": "1.3.0",
        "change_description": "Thêm hỗ trợ tính ngân sách bữa ăn. Tích hợp giá từ bảng nutrition_database.",
        "config_changes": {"include_budget": {"old": False, "new": True}},
        "performance_changes": {"user_satisfaction": {"old": 0.78, "new": 0.85}},
        "changed_at": "2026-03-15T09:00:00+07:00",
        "changed_by": USERS["admin"],
    },
    {
        "algorithm_id": ALGO_IDS["food_recog"],
        "version": "2.1.0",
        "change_description": "Nâng cấp lên GPT-4o. Độ chính xác tăng từ 85% lên 91%.",
        "config_changes": {"model": {"old": "gpt-4-vision", "new": "gpt-4o"}},
        "performance_changes": {"accuracy": {"old": 0.85, "new": 0.91}, "avg_response_time_ms": {"old": 3200, "new": 2300}},
        "changed_at": "2026-02-20T09:00:00+07:00",
        "changed_by": USERS["admin"],
    },
    {
        "algorithm_id": ALGO_IDS["food_recog"],
        "version": "2.0.0",
        "change_description": "Ra mắt tính năng nhận diện món ăn. Bước đầu hỗ trợ 500 món Việt Nam.",
        "config_changes": {"confidence_threshold": {"old": 0.8, "new": 0.75}},
        "performance_changes": {"accuracy": {"old": 0, "new": 0.85}},
        "changed_at": "2025-12-01T09:00:00+07:00",
        "changed_by": USERS["admin"],
    },
]


def make_food_scan_logs(dish_stts: list[int]) -> list[dict]:
    """25 lượt quét thức ăn thực tế."""
    scan_users = ["lan", "mai", "hoa", "linh", "thu"]
    meal_types = ["breakfast", "lunch", "dinner", "snack"]
    feedbacks = ["accurate", "accurate", "accurate", "partial", "inaccurate"]

    dish_names = [
        "Cơm trắng", "Bún bò Huế", "Phở bò", "Bánh mì ốp la", "Cháo yến mạch",
        "Rau muống xào tỏi", "Thịt kho tàu", "Canh chua cá lóc", "Đậu hũ chiên",
        "Cháo thịt bằm", "Bánh xèo", "Bún riêu cua", "Gỏi cuốn tôm thịt", "Cơm gà",
        "Mì quảng", "Chả giò chiên", "Canh bí đỏ thịt heo", "Salad rau xanh",
        "Cơm chiên dương châu", "Canh rau ngót", "Súp gà nấm", "Tempeh xào sả",
        "Đậu lăng hầm", "Cháo đậu xanh hạt sen", "Sữa chua không đường",
    ]

    logs = []
    for i in range(25):
        user_key = scan_users[i % len(scan_users)]
        day_offset = -(i * 2) % 28  # spread qua 28 ngày
        scan_time = (TODAY - timedelta(days=abs(day_offset))).isoformat()
        stt = dish_stts[i % len(dish_stts)] if dish_stts else None
        dish_name = dish_names[i % len(dish_names)]

        logs.append({
            "user_id": USERS[user_key],
            "image_url": f"https://cdn.nextai.vn/scans/user_{user_key}_{i+1:03d}.jpg",
            "image_size_kb": random.randint(150, 800),
            "recognized_dish_stt": stt,
            "recognized_dish_name": dish_name,
            "confidence_score": round(random.uniform(0.72, 0.98), 3),
            "alternatives": [
                {"stt": dish_stts[(i + 1) % len(dish_stts)] if dish_stts else None,
                 "name": dish_names[(i + 1) % len(dish_names)],
                 "confidence": round(random.uniform(0.3, 0.6), 3)},
            ],
            "nutrition_data": {
                "energy": round(random.uniform(150, 650), 1),
                "protein": round(random.uniform(8, 35), 1),
                "fat": round(random.uniform(5, 25), 1),
                "carbohydrate": round(random.uniform(20, 85), 1),
            },
            "meal_type": meal_types[i % len(meal_types)],
            "meal_time": f"{scan_time}T{random.choice(['07:30', '12:00', '18:30', '15:00'])}:00+07:00",
            "user_feedback": feedbacks[i % len(feedbacks)],
            "model_version": "gpt-4o-v2.1",
            "processing_time_ms": random.randint(1800, 3500),
            "tokens_used": random.randint(500, 1200),
            "cost_usd": round(random.uniform(0.002, 0.012), 6),
        })
    return logs


def make_recommendation_logs() -> list[dict]:
    """20 lần AI gợi ý thực đơn."""
    active_mothers = ["lan", "hoa", "linh", "mai", "thu"]
    meal_types = ["breakfast", "lunch", "dinner"]

    sample_recommendations = [
        [{"stt": 1, "name": "Cháo yến mạch trứng", "reason": "Giàu sắt và protein"}, {"stt": 5, "name": "Sữa không đường", "reason": "Bổ sung canxi"}],
        [{"stt": 12, "name": "Cơm gạo lứt", "reason": "GI thấp, ổn định đường huyết"}, {"stt": 8, "name": "Canh rau ngót cua", "reason": "Canxi, sắt, DHA"}],
        [{"stt": 3, "name": "Phở bò", "reason": "Protein hoàn chỉnh, iron heme"}, {"stt": 7, "name": "Trái cây vitamin C", "reason": "Tăng hấp thu sắt"}],
        [{"stt": 15, "name": "Đậu hũ chiên tỏi", "reason": "Canxi thực vật"}, {"stt": 20, "name": "Đậu lăng hầm", "reason": "Protein + sắt thực vật"}],
        [{"stt": 9, "name": "Cá hồi áp chảo", "reason": "DHA, omega-3 cho não bé"}, {"stt": 11, "name": "Bông cải xanh", "reason": "Folate, canxi, vitamin K"}],
    ]

    logs = []
    for i in range(20):
        user_key = active_mothers[i % len(active_mothers)]
        day_offset = -(i * 1.5) % 21
        rec_time = (TODAY - timedelta(days=int(abs(day_offset)))).isoformat()

        logs.append({
            "user_id": USERS[user_key],
            "meal_type": meal_types[i % len(meal_types)],
            "recommended_at": f"{rec_time}T{random.choice(['06:00', '11:00', '17:00'])}:00+07:00",
            "recommended_dishes": sample_recommendations[i % len(sample_recommendations)],
            "reason_text": random.choice([
                "Dựa trên hồ sơ y tế và giai đoạn thai kỳ, cần bổ sung thêm sắt và DHA.",
                "Ngân sách hôm nay 150k, gợi ý thực đơn đa dạng và tiết kiệm.",
                "Mẹ thiếu canxi theo xu hướng 7 ngày qua, ưu tiên thực phẩm giàu canxi.",
                "Tuần 3 tam cá nguyệt 3: tăng cường DHA và vitamin D để phát triển não bé.",
                "Phát hiện mẹ hay bỏ bữa sáng, gợi ý bữa nhanh và đủ dinh dưỡng.",
            ]),
            "user_accepted": random.choice([True, True, True, False]),
            "user_feedback": random.choice([
                "Thực đơn phù hợp, tôi sẽ thử!",
                "Hơi ít đồ chay, nhưng ổn.",
                None, None,
            ]),
            "model_version": "menu-recommendation-v1.3.2",
            "tokens_used": random.randint(800, 2200),
            "cost_usd": round(random.uniform(0.001, 0.005), 6),
        })
    return logs


def make_conversations_and_messages() -> tuple[list[dict], list[dict]]:
    """8 cuộc hội thoại với AI chatbot, mỗi cuộc 4-7 tin nhắn."""
    convo_templates = [
        {
            "user": "lan",
            "title": "Hỏi về phù chân khi mang thai",
            "qa_pairs": [
                ("Mình đang tuần 24, chân bị phù nhất vào buổi chiều tối. Có cách nào giảm không ạ?",
                 "Phù chân ở tuần 24 khá phổ biến và thường lành tính. Một số biện pháp giúp giảm: (1) Kê chân cao khi nghỉ ngơi, (2) Tránh đứng/ngồi lâu một tư thế, (3) Đi bộ nhẹ 20 phút/ngày để kích thích tuần hoàn, (4) Giảm muối trong khẩu phần, (5) Mang tất nén y tế loại nhẹ. Nếu phù kèm đau đầu, mờ mắt hoặc đau thượng vị → cần đến bệnh viện ngay vì có thể là dấu hiệu tiền sản giật."),
                ("Mình có thể ăn gì để giảm phù không?",
                 "Một số thực phẩm hỗ trợ giảm phù: Dưa hấu và dưa leo (lợi tiểu tự nhiên), Chuối (kali cân bằng natri), Rau mùi tây (tác dụng lợi tiểu nhẹ), Măng tây. Đồng thời HẠN CHẾ: Đồ ăn mặn (sốt, mì ăn liền, đồ hộp), Thực phẩm chế biến sẵn nhiều natri."),
                ("Vậy mình có cần lo không ạ?",
                 "Phù chân đơn thuần ở tuần 24 thường không đáng lo nếu: chỉ phù chân (không phù mặt, tay), không kèm theo đau đầu hay thay đổi thị giác, huyết áp ổn định. Tuy nhiên hãy đo huyết áp định kỳ và báo bác sĩ tại lần khám tiếp theo. Bác sĩ có thể cho làm xét nghiệm nước tiểu để kiểm tra protein."),
            ],
        },
        {
            "user": "mai",
            "title": "Cách tăng lượng sữa sau sinh",
            "qa_pairs": [
                ("Bé Bảo 3 tháng, mình thấy sữa không đủ. Làm sao để tăng sữa ạ?",
                 "Để tăng sản lượng sữa mẹ hiệu quả, điều quan trọng nhất là 'supply = demand' — cho bé bú hoặc hút sữa thường xuyên hơn. Cụ thể: cho bé bú mỗi 2-3 tiếng, ngay cả ban đêm; đảm bảo bé ngậm bắt vú đúng kỹ thuật; hút sữa thêm sau khi bé bú xong để kích thích tuyến sữa sản xuất thêm."),
                ("Mình đang ăn cháo chân giò đu đủ mỗi ngày, có đúng không?",
                 "Cháo chân giò đu đủ xanh là một trong những thực phẩm lợi sữa phổ biến nhất trong y học dân gian Việt Nam, và có bằng chứng thực tiễn tốt. Enzyme papain từ đu đủ xanh có thể kích thích sản xuất sữa. Ngoài ra bạn có thể thêm: yến mạch buổi sáng, rau ngót nấu canh, hạt mắc ca như snack lành mạnh, và đặc biệt uống đủ 3 lít nước/ngày."),
                ("Mình cần uống sữa mẹ bổ sung không?",
                 "Sữa bổ sung cho mẹ đang cho con bú không cần thiết nếu bạn ăn đủ và đa dạng. Thay vào đó, ưu tiên: thực phẩm tươi, cơm gạo trắng/lứt, protein từ thịt cá trứng đậu, rau xanh nhiều màu. Nếu bạn lo thiếu dinh dưỡng, một viên vitamin tổng hợp sau sinh chất lượng tốt là đủ."),
            ],
        },
        {
            "user": "hoa",
            "title": "Dinh dưỡng ăn chay khi mang thai tuần 12",
            "qa_pairs": [
                ("Mình ăn chay trường và đang mang thai tuần 12. Cần bổ sung gì quan trọng nhất?",
                 "Mẹ bầu ăn chay cần chú ý đặc biệt đến 5 dưỡng chất dễ thiếu: (1) **Vitamin B12** — hoàn toàn từ động vật, cần bổ sung viên B12 1000mcg/ngày hoặc 2000mcg/tuần. (2) **Sắt** — dễ thiếu khi ăn chay, uống kèm vitamin C. (3) **DHA/Omega-3** — lấy từ tảo biển (algae-based DHA) thay cá. (4) **Canxi** — đậu hũ cứng, mè trắng, rau xanh. (5) **Iod** — muối iod hóa và rong biển lượng nhỏ."),
                ("Mình bị ốm nghén nặng, khó ăn. Có thực phẩm chay nào dễ ăn không?",
                 "Cho ốm nghén mà ăn chay, tôi gợi ý: **Dễ xuống**: bánh quy gừng không bơ, cháo trắng loãng, gừng tươi pha trà mật ong (nếu uống mật ong), cracker yến mạch. **Nhẹ bụng**: sữa hạt (hạnh nhân/yến mạch), sinh tố xoài chuối ít đường, cháo yến mạch với chuối. **Tránh**: đồ chiên, thực phẩm mùi mạnh như sầu riêng, tỏi sống, thức ăn ngọt quá."),
            ],
        },
        {
            "user": "linh",
            "title": "Chuẩn bị sinh tuần 32",
            "qa_pairs": [
                ("Mình tuần 32 rồi, cần chuẩn bị gì cho việc sinh nở không?",
                 "Ở tuần 32, bạn có khoảng 6-8 tuần để chuẩn bị. Danh sách cần làm: **Y tế**: đặt lịch khám mỗi 2 tuần đến tuần 36, rồi hàng tuần. Bàn về kế hoạch sinh với bác sĩ (sinh thường/mổ, bệnh viện). **Thực tế**: chuẩn bị túi đồ đi sinh (quần áo mẹ + bé, giấy tờ, đồ vệ sinh). **Kiến thức**: tham gia lớp tiền sản, học dấu hiệu chuyển dạ. **Nhà cửa**: chuẩn bị phòng bé, lắp đặt ghế ngồi ô tô."),
                ("Mình bị khó ngủ và đau lưng nhiều. Có cách nào không ạ?",
                 "Đau lưng và khó ngủ tuần 32 rất phổ biến vì bụng to. Giải pháp: **Ngủ**: gối kẹp giữa hai đầu gối + gối tựa lưng, nằm nghiêng trái (tốt cho tuần hoàn), tránh ăn nhiều trước ngủ 2 tiếng. **Đau lưng**: bơi nhẹ hoặc yoga thai kỳ, massage lưng (chồng giúp!), đai đỡ bụng bầu, tránh đứng lâu. Canxi 1000mg trước ngủ cũng giúp giảm chuột rút ban đêm."),
                ("Dinh dưỡng giai đoạn cuối thai kỳ cần chú ý gì?",
                 "Tam cá nguyệt 3 — nhu cầu tăng vọt: **Năng lượng**: thêm 450kcal/ngày (tổng ~2350kcal). **Protein**: 80-100g/ngày cho tăng trưởng cơ bắp bé. **Canxi**: 1000mg + D3 để khoáng hóa xương bé (đang phát triển nhanh nhất). **DHA**: 300mg/ngày cho não bé. **Sắt**: 27mg/ngày — hb cần đủ trước sinh để tránh mất máu. Ăn nhiều bữa nhỏ vì dạ dày bị ép."),
            ],
        },
        {
            "user": "nam",
            "title": "Bố cần làm gì để hỗ trợ vợ mang thai",
            "qa_pairs": [
                ("Vợ mình đang tuần 24, mình là bố nên làm gì để giúp vợ?",
                 "Vai trò của bố rất quan trọng trong thai kỳ. Một số điều bạn có thể làm ngay: (1) **Dinh dưỡng**: học nấu các món giàu sắt và canxi cho vợ — cháo thịt bò, canh rau ngót, trứng. (2) **Vận động**: đi bộ buổi tối cùng vợ 20 phút. (3) **Cảm xúc**: lắng nghe không phán xét, hỏi han mỗi ngày. (4) **Thực tế**: đảm nhận việc nhà nặng, massage chân cho vợ buổi tối. (5) **Y tế**: đi khám thai cùng vợ, hiểu các mốc quan trọng."),
                ("Vợ hay lo lắng và hay khóc. Mình nên làm gì?",
                 "Lo lắng và xúc động trong thai kỳ là hoàn toàn bình thường do thay đổi hormone. Điều quan trọng nhất bạn có thể làm: **Lắng nghe** — không cần giải quyết vấn đề, chỉ cần ở bên và lắng nghe. **Xác nhận cảm xúc** — 'Em đang cảm thấy vậy là hoàn toàn bình thường', đừng nói 'lo thế làm gì'. **Hành động nhỏ** — ôm vợ, nấu bữa yêu thích, tắt điện thoại dành thời gian chất lượng. Nếu lo lắng kéo dài > 2 tuần hoặc ảnh hưởng sinh hoạt, hãy gợi ý vợ gặp chuyên gia tâm lý."),
            ],
        },
    ]

    conversations = []
    messages = []

    for i, tmpl in enumerate(convo_templates[:4]):  # Lấy 4 conversations đầu
        convo_id = str(uuid.uuid4())
        user_id = USERS[tmpl["user"]]
        created_at = (TODAY - timedelta(days=i * 5)).isoformat()

        conversations.append({
            "id": convo_id,
            "user_id": user_id,
            "title": tmpl["title"],
            "created_at": f"{created_at}T10:00:00+07:00",
            "updated_at": f"{created_at}T10:30:00+07:00",
        })

        for j, (q, a) in enumerate(tmpl["qa_pairs"]):
            base_date = TODAY - timedelta(days=i * 5)
            base_time = datetime(base_date.year, base_date.month, base_date.day, 10, j * 5, 0, tzinfo=timezone.utc)
            messages.append({
                "conversation_id": convo_id,
                "role": "user",
                "content": q,
                "timestamp": base_time.isoformat(),
            })
            messages.append({
                "conversation_id": convo_id,
                "role": "assistant",
                "content": a,
                "timestamp": (base_time + timedelta(seconds=15)).isoformat(),
            })

    return conversations, messages


def make_chat_histories() -> list[dict]:
    """8 chat histories (legacy format)."""
    histories = []
    chat_users = ["lan", "mai", "hoa", "linh", "thu", "nam", "minh", "duc"]
    titles = [
        "Hỏi về phù chân thai kỳ",
        "Cách tăng sữa sau sinh",
        "Dinh dưỡng mẹ chay",
        "Chuẩn bị sinh tháng 7",
        "Thực đơn tiền sản",
        "Bố hỗ trợ vợ mang thai",
        "Theo dõi cân nặng bé sau sinh",
        "Yoga cho bà bầu tuần 12",
    ]

    for i, (user_key, title) in enumerate(zip(chat_users, titles, strict=False)):
        histories.append({
            "user_id": USERS[user_key],
            "title": title,
            "messages": [
                {"role": "user", "content": f"Câu hỏi liên quan đến: {title}"},
                {"role": "assistant", "content": "NextAI đã tư vấn chi tiết về vấn đề này."},
            ],
            "created_at": (TODAY - timedelta(days=i * 3)).isoformat() + "T09:00:00+07:00",
        })
    return histories


def make_token_usage_logs() -> list[dict]:
    """30 ngày log sử dụng token/chi phí."""
    logs = []
    features = ["menu_recommendation", "food_recognition", "chat_ai", "rag_search"]
    models = {
        "menu_recommendation": "gpt-4o-mini",
        "food_recognition": "gpt-4o",
        "chat_ai": "gpt-4o-mini",
        "rag_search": "text-embedding-3-small",
    }

    for day_offset in range(30):
        log_date = (TODAY - timedelta(days=29 - day_offset)).isoformat()
        is_weekday = (TODAY - timedelta(days=29 - day_offset)).weekday() < 5

        for feature in features:
            # Weekday cao hơn weekend
            base_requests = random.randint(80, 200) if is_weekday else random.randint(20, 60)
            if feature == "food_recognition":
                base_requests = base_requests // 3

            input_tokens = base_requests * random.randint(400, 800)
            output_tokens = base_requests * random.randint(150, 400)
            total_tokens = input_tokens + output_tokens
            error_count = max(0, random.randint(-5, 8))

            # Chi phí theo model
            if models[feature] == "gpt-4o":
                input_cost = input_tokens * 0.000005  # $5/1M tokens
                output_cost = output_tokens * 0.000015
            elif models[feature] == "gpt-4o-mini":
                input_cost = input_tokens * 0.00000015  # $0.15/1M tokens
                output_cost = output_tokens * 0.0000006
            else:  # embedding
                input_cost = total_tokens * 0.00000002
                output_cost = 0

            logs.append({
                "date_at": log_date,
                "model_name": models[feature],
                "feature": feature,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens,
                "input_cost_usd": round(input_cost, 6),
                "output_cost_usd": round(output_cost, 6),
                "total_cost_usd": round(input_cost + output_cost, 6),
                "request_count": base_requests,
                "error_count": error_count,
            })
    return logs


def seed(db: Client) -> tuple[bool, str]:
    try:
        # Lấy dish_stts nếu có
        try:
            res = db.table("nutrition_database").select("stt").order("stt").limit(50).execute()
            dish_stts = [r["stt"] for r in res.data] if res.data else []
        except Exception:
            dish_stts = []

        # 1. Algorithm configs
        log.info("Seeding algorithm_configs (%d)...", len(ALGO_CONFIGS_DATA))
        db.table("algorithm_configs").upsert(ALGO_CONFIGS_DATA, on_conflict="id").execute()
        log.info("  ✓ algorithm_configs")

        # 2. Algorithm config history
        log.info("Seeding algorithm_config_history (%d)...", len(ALGO_HISTORY_DATA))
        existing_ah = db.table("algorithm_config_history").select("id").eq(
            "algorithm_id", ALGO_IDS["menu_rec"]
        ).execute()
        if not existing_ah.data:
            db.table("algorithm_config_history").insert(ALGO_HISTORY_DATA).execute()
            log.info("  ✓ algorithm_config_history")
        else:
            log.info("  ⚠ algorithm_config_history đã tồn tại, bỏ qua.")

        # 3. Food scan logs
        scan_logs = make_food_scan_logs(dish_stts if dish_stts else [1, 2, 3, 4, 5])
        log.info("Seeding food_scan_logs (%d)...", len(scan_logs))
        existing_fsl = db.table("food_scan_logs").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_fsl.data:
            db.table("food_scan_logs").insert(scan_logs).execute()
            log.info("  ✓ food_scan_logs")
        else:
            log.info("  ⚠ food_scan_logs đã tồn tại, bỏ qua.")

        # 4. Recommendation logs
        rec_logs = make_recommendation_logs()
        log.info("Seeding recommendation_logs (%d)...", len(rec_logs))
        existing_rl = db.table("recommendation_logs").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_rl.data:
            db.table("recommendation_logs").insert(rec_logs).execute()
            log.info("  ✓ recommendation_logs")
        else:
            log.info("  ⚠ recommendation_logs đã tồn tại, bỏ qua.")

        # 5. Conversations + messages
        conversations, messages = make_conversations_and_messages()
        log.info("Seeding conversations (%d) + messages (%d)...", len(conversations), len(messages))
        existing_cv = db.table("conversations").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_cv.data:
            for cv in conversations:
                db.table("conversations").insert(cv).execute()
            db.table("messages").insert(messages).execute()
            log.info("  ✓ conversations + messages")
        else:
            log.info("  ⚠ conversations đã tồn tại, bỏ qua.")

        # 6. Chat histories (legacy)
        chat_histories = make_chat_histories()
        log.info("Seeding chat_histories (%d)...", len(chat_histories))
        existing_ch = db.table("chat_histories").select("id").eq(
            "user_id", USERS["lan"]
        ).execute()
        if not existing_ch.data:
            db.table("chat_histories").insert(chat_histories).execute()
            log.info("  ✓ chat_histories")
        else:
            log.info("  ⚠ chat_histories đã tồn tại, bỏ qua.")

        # 7. Token usage logs (30 ngày)
        token_logs = make_token_usage_logs()
        log.info("Seeding token_usage_logs (%d)...", len(token_logs))
        existing_tl = db.table("token_usage_logs").select("id").eq(
            "date_at", (TODAY - timedelta(days=29)).isoformat()
        ).execute()
        if not existing_tl.data:
            for i in range(0, len(token_logs), 50):
                db.table("token_usage_logs").insert(token_logs[i:i + 50]).execute()
            log.info("  ✓ token_usage_logs (inserted %d)", len(token_logs))
        else:
            log.info("  ⚠ token_usage_logs đã tồn tại, bỏ qua.")

        return True, "seed_06_ai_logs hoàn tất"

    except Exception as e:
        log.error("Lỗi: %s", e)
        return False, str(e)



def main():
    ok, msg = seed(supabase)
    log.info('✅ %s' if ok else '❌ %s', msg)
    if not ok:
        sys.exit(1)


if __name__ == '__main__':
    main()
