"""
Seed blog_categories, cms_items, blog_post_categories,
blog_comments, blog_reactions.

Tables:
  1. public.blog_categories       — 5 danh mục
  2. public.cms_items             — 5 bài viết + 3 thông báo/cảnh báo
  3. public.blog_post_categories  — mapping bài-danh mục
  4. public.blog_comments         — 15 bình luận thực tế
  5. public.blog_reactions        — 20 lượt thích

Usage:
    cd src/backend
    python -m scripts.seed_03_content

Requires: seed_01_users đã chạy.
"""

import os
import sys
import logging
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts._seed_ids import USERS, BLOG_CATS, CMS  # noqa: E402

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

# ── Blog Categories ────────────────────────────────────────────────────────────
BLOG_CATEGORIES_DATA = [
    {
        "id": BLOG_CATS["dinh_duong"],
        "name": "Dinh Dưỡng Thai Kỳ",
        "slug": "dinh-duong-thai-ky",
        "description": "Hướng dẫn dinh dưỡng khoa học cho từng giai đoạn thai kỳ.",
        "icon_url": "https://cdn.nextai.vn/icons/nutrition.svg",
    },
    {
        "id": BLOG_CATS["suc_khoe"],
        "name": "Sức Khỏe Mẹ Bầu",
        "slug": "suc-khoe-me-bau",
        "description": "Theo dõi sức khỏe, các triệu chứng và lịch khám thai.",
        "icon_url": "https://cdn.nextai.vn/icons/health.svg",
    },
    {
        "id": BLOG_CATS["tam_ly"],
        "name": "Tâm Lý & Cảm Xúc",
        "slug": "tam-ly-cam-xuc",
        "description": "Hỗ trợ sức khỏe tinh thần trong thai kỳ và giai đoạn sau sinh.",
        "icon_url": "https://cdn.nextai.vn/icons/mental-health.svg",
    },
    {
        "id": BLOG_CATS["sau_sinh"],
        "name": "Sau Sinh & Phục Hồi",
        "slug": "sau-sinh-phuc-hoi",
        "description": "Dinh dưỡng, phục hồi thể lực và nuôi con bằng sữa mẹ sau sinh.",
        "icon_url": "https://cdn.nextai.vn/icons/postpartum.svg",
    },
    {
        "id": BLOG_CATS["luyen_tap"],
        "name": "Vận Động & Yoga",
        "slug": "van-dong-yoga",
        "description": "Các bài tập an toàn và yoga dành riêng cho mẹ bầu.",
        "icon_url": "https://cdn.nextai.vn/icons/yoga.svg",
    },
]

# ── CMS Items ──────────────────────────────────────────────────────────────────
CMS_ITEMS_DATA = [
    # ── Bài viết blog ──────────────────────────────────────────────────────────
    {
        "id": CMS["post_1"],
        "type": "post",
        "title": "Thực phẩm giàu sắt không thể thiếu trong tam cá nguyệt thứ hai",
        "content": (
            "## Tại sao sắt quan trọng trong tam cá nguyệt thứ hai?\n\n"
            "Từ tuần 14 đến 28, nhu cầu sắt của mẹ bầu tăng lên đáng kể — lên đến **27mg/ngày**.\n\n"
            "## Top 10 thực phẩm giàu sắt cho mẹ bầu\n\n"
            "### Nguồn sắt từ động vật\n"
            "1. **Thịt bò** — 3mg/100g\n"
            "2. **Gan gà** — 9mg/100g\n"
            "3. **Hàu** — 7mg/100g\n"
            "4. **Cá hồi** — 0.8mg/100g + omega-3\n\n"
            "### Nguồn sắt từ thực vật\n"
            "5. **Đậu lăng đỏ** — 3.3mg/100g\n"
            "6. **Rau bina** — 2.7mg/100g\n"
            "7. **Đậu phụ cứng** — 2.7mg/100g\n"
            "8. **Hạt bí ngô** — 3.3mg/30g\n"
            "9. **Socola đen 70%** — 3.4mg/30g\n"
            "10. **Mồng tơi** — 1.8mg/100g\n\n"
            "## Mẹo tăng hấp thu sắt\n"
            "- Ăn cùng thực phẩm giàu vitamin C (cam, kiwi, ổi)\n"
            "- Không uống trà/cà phê trong vòng 1 giờ sau bữa ăn\n"
            "- Bổ sung sắt lúc bụng rỗng hoặc cách xa bữa chứa canxi"
        ),
        "slug": "thuc-pham-giau-sat-tam-ca-nguyet-thu-hai",
        "status": "published",
        "published_at": "2026-04-15T08:00:00+07:00",
        "target_role": "mother",
        "target_pregnancy_status": "pregnant",
        "view_count": 1847,
        "seo_title": "Top 10 thực phẩm giàu sắt cho bà bầu tam cá nguyệt thứ 2",
        "seo_description": "Danh sách thực phẩm giàu sắt nhất cho mẹ bầu tuần 14-28, kèm mẹo tăng hấp thu hiệu quả.",
        "tags": ["sắt", "dinh dưỡng", "tam cá nguyệt 2", "thực phẩm"],
        "thumbnail_url": "https://cdn.nextai.vn/posts/iron-foods.jpg",
        "created_by": USERS["admin"],
    },
    {
        "id": CMS["post_2"],
        "type": "post",
        "title": "10 bài yoga nhẹ nhàng an toàn cho mẹ bầu tuần 20-32",
        "content": (
            "## Lợi ích của yoga khi mang thai\n\n"
            "Yoga thai kỳ giúp giảm đau lưng, cải thiện giấc ngủ, chuẩn bị cơ thể cho sinh nở.\n\n"
            "## Các bài tập khuyến nghị\n\n"
            "### Bài 1: Tư thế mèo-bò (Cat-Cow)\n"
            "Quỳ bốn điểm, hít vào ưỡn lưng, thở ra khum lưng. Lặp 10 lần.\n\n"
            "### Bài 2: Tư thế chiến binh I (Warrior I)\n"
            "Đứng rộng chân, xoay bàn chân sau 45 độ. Giữ 5 nhịp thở.\n\n"
            "### Bài 3: Tư thế ngồi bướm (Butterfly)\n"
            "Ngồi chạm lòng bàn chân vào nhau, nhẹ nhàng ấn đầu gối xuống.\n\n"
            "### Bài 4: Tư thế trẻ con (Child's Pose)\n"
            "Quỳ, ngồi lên gót chân, duỗi tay ra trước. Thư giãn và nghỉ ngơi.\n\n"
            "## Lưu ý an toàn\n"
            "- Tránh nằm ngửa sau tuần 20\n"
            "- Không tập các tư thế đảo ngược\n"
            "- Tham khảo ý kiến bác sĩ nếu có biến chứng"
        ),
        "slug": "yoga-nhe-nhang-cho-me-bau-tuan-20-32",
        "status": "published",
        "published_at": "2026-04-22T09:00:00+07:00",
        "target_role": "mother",
        "target_pregnancy_status": "pregnant",
        "view_count": 2341,
        "seo_title": "10 bài yoga an toàn cho bà bầu tuần 20-32",
        "seo_description": "Hướng dẫn chi tiết 10 tư thế yoga dành riêng cho mẹ bầu tam cá nguyệt 2-3.",
        "tags": ["yoga", "vận động", "sức khỏe", "thai kỳ"],
        "thumbnail_url": "https://res.cloudinary.com/dxxiercxx/image/upload/v1778569947/47d8b73c5368b0f3b53ae53edf2cb38c396ffb10-900x600_qcba6v.avif",
        "created_by": USERS["admin"],
    },
    {
        "id": CMS["post_3"],
        "type": "post",
        "title": "Kiểm soát lo âu và stress trong thai kỳ — Hướng dẫn thực hành",
        "content": (
            "## Lo âu thai kỳ: Khi nào cần lo?\n\n"
            "Khoảng 15-20% mẹ bầu trải qua lo âu ở mức ảnh hưởng sinh hoạt hàng ngày.\n\n"
            "## 5 kỹ thuật thực hành hiệu quả\n\n"
            "### 1. Thở 4-7-8\n"
            "Hít 4 giây, nín thở 7 giây, thở ra 8 giây. Giảm cortisol ngay lập tức.\n\n"
            "### 2. Mindfulness 5 phút\n"
            "Mỗi sáng: ngồi yên, chú ý hơi thở, đặt tay lên bụng cảm nhận bé.\n\n"
            "### 3. Nhật ký cảm xúc\n"
            "Viết 3 điều biết ơn mỗi tối. Giảm lo âu 25% sau 4 tuần.\n\n"
            "### 4. Kết nối với chồng\n"
            "Chia sẻ lo lắng thay vì giữ trong lòng. Cảm giác được hỗ trợ giảm hormon stress.\n\n"
            "### 5. Giới hạn thời gian đọc tin tức\n"
            "Không đọc tin sức khỏe trước khi ngủ. Đặt giờ không điện thoại từ 21:00."
        ),
        "slug": "kiem-soat-lo-au-stress-trong-thai-ky",
        "status": "published",
        "published_at": "2026-05-01T07:30:00+07:00",
        "target_role": "all",
        "target_pregnancy_status": "pregnant",
        "view_count": 3102,
        "seo_title": "Cách kiểm soát lo âu và stress khi mang thai",
        "seo_description": "5 kỹ thuật thực hành giảm lo âu thai kỳ được chứng minh bởi khoa học.",
        "tags": ["tâm lý", "stress", "lo âu", "sức khỏe tinh thần"],
        "thumbnail_url": "https://res.cloudinary.com/dxxiercxx/image/upload/v1778569948/cang-thang-thai-ky-2_zl3t4z.jpg",
        "created_by": USERS["admin"],
    },
    {
        "id": CMS["post_4"],
        "type": "post",
        "title": "Dinh dưỡng sau sinh: Thực đơn lợi sữa và phục hồi nhanh trong 6 tuần đầu",
        "content": (
            "## Nhu cầu dinh dưỡng tăng cao sau sinh\n\n"
            "Khi cho con bú, mẹ cần thêm 500 kcal/ngày so với trước khi mang thai.\n\n"
            "## Thực phẩm lợi sữa hiệu quả nhất\n\n"
            "- **Chân giò hầm đu đủ xanh**: Collagen + enzyme papain kích thích prolactin\n"
            "- **Hạt mắc ca**: Galactagogue, giàu omega-3\n"
            "- **Rau ngót**: Phytosterol tăng tiết sữa\n"
            "- **Yến mạch**: Beta-glucan kích thích oxytocin\n\n"
            "## Lịch ăn mẫu tuần 1 sau sinh\n"
            "- Sáng: Cháo thịt bằm + rau xanh + sữa không đường\n"
            "- Trưa: Cơm + thịt kho + canh rau ngót\n"
            "- Xế: Sữa chua + hạt mắc ca\n"
            "- Tối: Cháo chân giò hầm đu đủ xanh\n\n"
            "## Những thứ cần tránh\n"
            "- Cà phê và trà đặc (cafein vào sữa)\n"
            "- Rượu bia\n"
            "- Ăn kiêng cực đoan (giảm sữa ngay)"
        ),
        "slug": "dinh-duong-sau-sinh-loi-sua-phuc-hoi",
        "status": "published",
        "published_at": "2026-03-10T08:00:00+07:00",
        "target_role": "mother",
        "target_pregnancy_status": "postpartum",
        "view_count": 4520,
        "seo_title": "Thực đơn lợi sữa và dinh dưỡng phục hồi sau sinh 6 tuần đầu",
        "seo_description": "Hướng dẫn chi tiết thực phẩm lợi sữa, lịch ăn mẫu và những điều cần tránh sau sinh.",
        "tags": ["sau sinh", "lợi sữa", "phục hồi", "dinh dưỡng"],
        "thumbnail_url": "https://res.cloudinary.com/dxxiercxx/image/upload/v1778569947/mon-an-loi-sua-cho-me-sau-sinh_sbl1nk.jpg",
        "created_by": USERS["admin"],
    },
    {
        "id": CMS["post_5"],
        "type": "post",
        "title": "Canxi và Vitamin D: Bộ đôi vàng bảo vệ xương mẹ và phát triển xương bé",
        "content": (
            "## Nhu cầu Canxi trong thai kỳ\n\n"
            "Mẹ bầu cần 1000mg canxi/ngày. Thai nhi lấy canxi từ xương mẹ nếu không bổ sung đủ.\n\n"
            "## Nguồn canxi tự nhiên tốt nhất\n"
            "1. Sữa không đường — 300mg/240ml\n"
            "2. Sữa chua — 400mg/200g\n"
            "3. Đậu phụ cứng — 350mg/100g\n"
            "4. Cá hồi hộp (có xương) — 200mg/85g\n"
            "5. Bông cải xanh — 60mg/100g\n"
            "6. Mè trắng — 1000mg/100g\n\n"
            "## Tại sao cần Vitamin D3?\n\n"
            "Vitamin D giúp ruột hấp thu canxi. Nhu cầu: 600-2000 IU/ngày.\n\n"
            "## Nguồn Vitamin D\n"
            "- Ánh nắng sáng sớm 15-20 phút (trước 8h hoặc sau 16h)\n"
            "- Cá hồi, cá thu, cá mòi\n"
            "- Lòng đỏ trứng (50 IU/quả)\n"
            "- Bổ sung D3 theo chỉ dẫn bác sĩ"
        ),
        "slug": "canxi-vitamin-d-bo-doi-vang-cho-me-bau",
        "status": "published",
        "published_at": "2026-05-05T08:00:00+07:00",
        "target_role": "mother",
        "target_pregnancy_status": "all",
        "view_count": 2876,
        "seo_title": "Canxi và Vitamin D cho bà bầu: Liều lượng và nguồn thực phẩm tốt nhất",
        "seo_description": "Hướng dẫn bổ sung canxi và vitamin D trong thai kỳ để bảo vệ xương mẹ và phát triển xương bé.",
        "tags": ["canxi", "vitamin D", "xương", "dinh dưỡng thai kỳ"],
        "thumbnail_url": "https://res.cloudinary.com/dxxiercxx/image/upload/v1778569947/211116tac-dung-cua-vitamin-d3-voi-tre-so-sinh_jlucxa.jpg",
        "created_by": USERS["admin"],
    },
    # ── Thông báo & Cảnh báo ───────────────────────────────────────────────────
    {
        "id": CMS["notif_1"],
        "type": "notification",
        "title": "Tính năng mới: Thực đơn AI theo ngân sách",
        "content": "NextAI vừa ra mắt tính năng lên thực đơn theo ngân sách hàng ngày! Nhập số tiền dự kiến, AI sẽ gợi ý thực đơn đủ dinh dưỡng trong mức ngân sách đó.",
        "slug": None,
        "status": "published",
        "published_at": "2026-05-01T00:00:00+07:00",
        "target_role": "all",
        "target_pregnancy_status": "all",
        "view_count": 0,
        "created_by": USERS["admin"],
    },
    {
        "id": CMS["notif_2"],
        "type": "notification",
        "title": "Nhắc nhở: Uống đủ nước mỗi ngày",
        "content": "Mẹ bầu cần uống 2.5-3 lít nước mỗi ngày. Ứng dụng đã thêm tính năng nhắc nhở uống nước theo giờ trong Cài đặt.",
        "slug": None,
        "status": "published",
        "published_at": "2026-04-28T00:00:00+07:00",
        "target_role": "mother",
        "target_pregnancy_status": "pregnant",
        "view_count": 0,
        "created_by": USERS["admin"],
    },
    {
        "id": CMS["alert_1"],
        "type": "alert",
        "title": "Cảnh báo: Không tự ý ngưng thuốc tuyến giáp khi mang thai",
        "content": "Nếu đang điều trị bệnh tuyến giáp và phát hiện mang thai, KHÔNG tự ý ngưng thuốc. Liên hệ bác sĩ ngay để điều chỉnh liều lượng. Ngưng thuốc đột ngột có thể gây hại cho thai nhi.",
        "slug": None,
        "status": "published",
        "published_at": "2026-05-10T00:00:00+07:00",
        "expires_at": "2026-08-10T00:00:00+07:00",
        "target_role": "mother",
        "target_pregnancy_status": "pregnant",
        "view_count": 0,
        "created_by": USERS["admin"],
    },
]

# ── Blog post-category mappings ────────────────────────────────────────────────
BLOG_POST_CATS_DATA = [
    {"post_id": CMS["post_1"], "category_id": BLOG_CATS["dinh_duong"]},
    {"post_id": CMS["post_1"], "category_id": BLOG_CATS["suc_khoe"]},
    {"post_id": CMS["post_2"], "category_id": BLOG_CATS["luyen_tap"]},
    {"post_id": CMS["post_2"], "category_id": BLOG_CATS["suc_khoe"]},
    {"post_id": CMS["post_3"], "category_id": BLOG_CATS["tam_ly"]},
    {"post_id": CMS["post_4"], "category_id": BLOG_CATS["sau_sinh"]},
    {"post_id": CMS["post_4"], "category_id": BLOG_CATS["dinh_duong"]},
    {"post_id": CMS["post_5"], "category_id": BLOG_CATS["dinh_duong"]},
    {"post_id": CMS["post_5"], "category_id": BLOG_CATS["suc_khoe"]},
]

# ── Blog Comments ──────────────────────────────────────────────────────────────
BLOG_COMMENTS_DATA = [
    # post_1 (thực phẩm giàu sắt)
    {"post_id": CMS["post_1"], "user_id": USERS["lan"], "content": "Bài viết rất hữu ích! Mình đang tuần 24 và vừa được bác sĩ dặn cần bổ sung sắt. Sẽ thêm đậu lăng vào thực đơn ngay."},
    {"post_id": CMS["post_1"], "user_id": USERS["hoa"], "content": "Mình ăn chay nên phần nguồn sắt thực vật rất cần thiết. Cảm ơn bài viết đã có mẹo ăn cùng vitamin C để tăng hấp thu!"},
    {"post_id": CMS["post_1"], "user_id": USERS["linh"], "content": "Tuần 32 rồi mà vẫn hay quên uống viên sắt. Bài này nhắc mình nhớ lại tầm quan trọng."},
    {"post_id": CMS["post_1"], "user_id": USERS["nam"], "content": "Mình là chồng, đọc để biết cách nấu cho vợ. Hóa ra không được uống trà khi ăn đồ giàu sắt! Học được điều mới."},
    # post_2 (yoga)
    {"post_id": CMS["post_2"], "user_id": USERS["lan"], "content": "Mình hay bị đau lưng từ tuần 20. Thử tư thế mèo-bò theo hướng dẫn, thấy đỡ hơn hẳn sau 1 tuần!"},
    {"post_id": CMS["post_2"], "user_id": USERS["linh"], "content": "Tuần 32 khó tập lắm rồi nhưng bài ngồi bướm vẫn làm được. Cảm ơn bài viết có lưu ý an toàn rõ ràng."},
    {"post_id": CMS["post_2"], "user_id": USERS["thu"], "content": "Mình chưa mang thai nhưng đang chuẩn bị. Các bài yoga này có phù hợp với giai đoạn tiền mang thai không ạ?"},
    # post_3 (tâm lý)
    {"post_id": CMS["post_3"], "user_id": USERS["lan"], "content": "Kỹ thuật thở 4-7-8 mình đã thử và thực sự hiệu quả! Hay bị lo lắng về sinh nở, giờ biết cách kiểm soát hơn."},
    {"post_id": CMS["post_3"], "user_id": USERS["mai"], "content": "Sau sinh cũng cần đọc bài này. Mình hay bị stress vì bé khóc nhiều. Thử nhật ký cảm xúc xem sao."},
    {"post_id": CMS["post_3"], "user_id": USERS["minh"], "content": "Cảm ơn bài viết! Mình là chồng, đọc để hiểu vợ hơn trong giai đoạn này. Phần kết nối với chồng hay quá."},
    # post_4 (dinh dưỡng sau sinh)
    {"post_id": CMS["post_4"], "user_id": USERS["mai"], "content": "Đúng y chang những gì mình đang cần! Bé 3 tháng, sữa không đủ lắm. Thử cháo chân giò đu đủ xem sao."},
    {"post_id": CMS["post_4"], "user_id": USERS["minh"], "content": "Mình đang nấu cho vợ hàng ngày. Bài này giúp mình có thêm nhiều lựa chọn thực đơn hơn. Cảm ơn!"},
    {"post_id": CMS["post_4"], "user_id": USERS["linh"], "content": "Lưu lại để sau sinh đọc. Mình sắp sinh tháng 7 nên bài này cực kỳ hữu ích."},
    # post_5 (canxi, vitamin D)
    {"post_id": CMS["post_5"], "user_id": USERS["hoa"], "content": "Mẹo về mè trắng và đậu phụ cho nguồn canxi thực vật quá tuyệt! Mình ăn chay nên đây là thông tin vàng."},
    {"post_id": CMS["post_5"], "user_id": USERS["lan"], "content": "Không biết ánh nắng buổi sáng chỉ 15 phút đã đủ vitamin D. Mình hay ngủ đến 9h nên sẽ thay đổi giờ giấc."},
]

# ── Blog Reactions ─────────────────────────────────────────────────────────────
BLOG_REACTIONS_DATA = [
    {"post_id": CMS["post_1"], "user_id": USERS["lan"], "reaction_type": "like"},
    {"post_id": CMS["post_1"], "user_id": USERS["hoa"], "reaction_type": "like"},
    {"post_id": CMS["post_1"], "user_id": USERS["linh"], "reaction_type": "like"},
    {"post_id": CMS["post_1"], "user_id": USERS["nam"], "reaction_type": "like"},
    {"post_id": CMS["post_1"], "user_id": USERS["thu"], "reaction_type": "like"},
    {"post_id": CMS["post_2"], "user_id": USERS["lan"], "reaction_type": "like"},
    {"post_id": CMS["post_2"], "user_id": USERS["linh"], "reaction_type": "like"},
    {"post_id": CMS["post_2"], "user_id": USERS["mai"], "reaction_type": "like"},
    {"post_id": CMS["post_3"], "user_id": USERS["lan"], "reaction_type": "like"},
    {"post_id": CMS["post_3"], "user_id": USERS["mai"], "reaction_type": "like"},
    {"post_id": CMS["post_3"], "user_id": USERS["hoa"], "reaction_type": "like"},
    {"post_id": CMS["post_3"], "user_id": USERS["minh"], "reaction_type": "like"},
    {"post_id": CMS["post_4"], "user_id": USERS["mai"], "reaction_type": "like"},
    {"post_id": CMS["post_4"], "user_id": USERS["minh"], "reaction_type": "like"},
    {"post_id": CMS["post_4"], "user_id": USERS["linh"], "reaction_type": "like"},
    {"post_id": CMS["post_4"], "user_id": USERS["nam"], "reaction_type": "like"},
    {"post_id": CMS["post_5"], "user_id": USERS["hoa"], "reaction_type": "like"},
    {"post_id": CMS["post_5"], "user_id": USERS["lan"], "reaction_type": "like"},
    {"post_id": CMS["post_5"], "user_id": USERS["thu"], "reaction_type": "like"},
    {"post_id": CMS["post_5"], "user_id": USERS["linh"], "reaction_type": "like"},
]


# ── Hàm seed (full — chỉ chạy lần đầu) ───────────────────────────────────────
def seed(db: Client) -> tuple[bool, str]:
    try:
        log.info("Seeding blog_categories (%d)...", len(BLOG_CATEGORIES_DATA))
        db.table("blog_categories").upsert(BLOG_CATEGORIES_DATA, on_conflict="id").execute()
        log.info("  ✓ blog_categories")

        log.info("Seeding cms_items (%d)...", len(CMS_ITEMS_DATA))
        db.table("cms_items").upsert(CMS_ITEMS_DATA, on_conflict="id").execute()
        log.info("  ✓ cms_items")

        log.info("Seeding blog_post_categories (%d)...", len(BLOG_POST_CATS_DATA))
        db.table("blog_post_categories").upsert(
            BLOG_POST_CATS_DATA, on_conflict="post_id,category_id"
        ).execute()
        log.info("  ✓ blog_post_categories")

        log.info("Seeding blog_comments (%d)...", len(BLOG_COMMENTS_DATA))
        existing = db.table("blog_comments").select("id").eq(
            "user_id", USERS["lan"]
        ).eq("post_id", CMS["post_1"]).execute()
        if not existing.data:
            db.table("blog_comments").insert(BLOG_COMMENTS_DATA).execute()
            log.info("  ✓ blog_comments (inserted %d)", len(BLOG_COMMENTS_DATA))
        else:
            log.info("  ⚠ blog_comments đã tồn tại, bỏ qua.")

        log.info("Seeding blog_reactions (%d)...", len(BLOG_REACTIONS_DATA))
        db.table("blog_reactions").upsert(
            BLOG_REACTIONS_DATA, on_conflict="post_id,user_id"
        ).execute()
        log.info("  ✓ blog_reactions")

        return True, "seed_03_content hoàn tất"

    except Exception as e:
        log.error("Lỗi: %s", e)
        return False, str(e)


# ── Chỉ cập nhật URL ảnh (patch — an toàn khi chạy lại nhiều lần) ─────────────
def patch_image_urls(db: Client) -> tuple[bool, str]:
    """Chỉ update icon_url và thumbnail_url, không đụng dữ liệu khác."""
    try:
        # icon_url cho blog_categories
        cat_urls = {
            item["id"]: item["icon_url"]
            for item in BLOG_CATEGORIES_DATA
            if item.get("icon_url")
        }
        log.info("Patching icon_url cho %d blog_categories...", len(cat_urls))
        for cat_id, url in cat_urls.items():
            db.table("blog_categories").update({"icon_url": url}).eq("id", cat_id).execute()
        log.info("  ✓ blog_categories icon_url")

        # thumbnail_url cho cms_items (chỉ bài viết có thumbnail)
        post_urls = {
            item["id"]: item["thumbnail_url"]
            for item in CMS_ITEMS_DATA
            if item.get("thumbnail_url")
        }
        log.info("Patching thumbnail_url cho %d cms_items...", len(post_urls))
        for post_id, url in post_urls.items():
            db.table("cms_items").update({"thumbnail_url": url}).eq("id", post_id).execute()
        log.info("  ✓ cms_items thumbnail_url")

        return True, f"patch_image_urls hoàn tất ({len(cat_urls)} categories, {len(post_urls)} posts)"

    except Exception as e:
        log.error("Lỗi: %s", e)
        return False, str(e)


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--patch-urls",
        action="store_true",
        help="Chỉ cập nhật icon_url / thumbnail_url, không seed toàn bộ",
    )
    args = parser.parse_args()

    if args.patch_urls:
        ok, msg = patch_image_urls(supabase)
    else:
        ok, msg = seed(supabase)

    log.info("✅ %s" if ok else "❌ %s", msg)
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
