"""
Seed stores + store_food_mappings data into Supabase.

Usage:
    cd src/backend
    python -m scripts.seed_stores

Requires:
    - Tables: stores, store_food_mappings, nutrition_database already exist
    - .env with SUPABASE_URL and SUPABASE_SERVICE_KEY
"""

import os
import sys
import json
import logging
import random
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

# Fallback: if service key looks invalid (not JWT), use anon key
if SUPABASE_KEY and not SUPABASE_KEY.startswith("eyJ"):
    logger.warning("SUPABASE_SERVICE_KEY is not a valid JWT, falling back to SUPABASE_ANON_KEY")
    SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------------------------------------------------------------------
# Store data - Cửa hàng thực tế tại Hà Nội & HCM
# ---------------------------------------------------------------------------
STORES = [
    # ── Hà Nội ──
    {
        "name": "WinMart+ Trần Duy Hưng",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống và đồ khô",
        "phone": "024-3556-7890",
        "email": "tranduyhung@winmart.vn",
        "website": "https://winmart.vn",
        "address": "15 Trần Duy Hưng, Trung Hoà, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Trung Hoà",
        "latitude": 21.0082,
        "longitude": 105.7982,
        "operating_hours": "07:00 - 22:00",
        "status": "active",
    },
    {
        "name": "Co.op Food Nguyễn Chí Thanh",
        "description": "Chuỗi cửa hàng thực phẩm Co.op Food chất lượng cao",
        "phone": "024-3773-4561",
        "email": "nct@coopfood.vn",
        "website": "https://www.co-opmart.com.vn",
        "address": "68 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Láng Thượng",
        "latitude": 21.0210,
        "longitude": 105.8100,
        "operating_hours": "06:30 - 22:00",
        "status": "active",
    },
    {
        "name": "Bách Hoá Xanh Hoàng Mai",
        "description": "Siêu thị thực phẩm giá rẻ, rau củ quả tươi mỗi ngày",
        "phone": "024-3664-1234",
        "email": "hoangmai@bachhoaxanh.com",
        "website": "https://www.bachhoaxanh.com",
        "address": "320 Tam Trinh, Hoàng Văn Thụ, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Hoàng Văn Thụ",
        "latitude": 20.9858,
        "longitude": 105.8621,
        "operating_hours": "06:00 - 22:30",
        "status": "active",
    },
    {
        "name": "Chợ Hôm",
        "description": "Chợ truyền thống lâu đời với đa dạng thực phẩm tươi sống",
        "phone": "024-3943-5678",
        "address": "79 Phố Huế, Ngô Thì Nhậm, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Ngô Thì Nhậm",
        "latitude": 21.0115,
        "longitude": 105.8540,
        "operating_hours": "05:30 - 18:00",
        "status": "active",
    },
    {
        "name": "VinMart Thanh Xuân",
        "description": "Siêu thị VinMart với khu vực thực phẩm organic",
        "phone": "024-3558-9012",
        "website": "https://winmart.vn",
        "address": "Tầng B1, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội",
        "city": "Hà Nội",
        "district": "Thanh Xuân",
        "ward": "Thượng Đình",
        "latitude": 21.0010,
        "longitude": 105.8150,
        "operating_hours": "08:00 - 22:00",
        "status": "active",
    },
    {
        "name": "Big C Thăng Long",
        "description": "Đại siêu thị với đa dạng thực phẩm nhập khẩu và nội địa",
        "phone": "024-3764-5678",
        "website": "https://www.bigc.vn",
        "address": "222 Trần Duy Hưng, Trung Hoà, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Trung Hoà",
        "latitude": 21.0070,
        "longitude": 105.7935,
        "operating_hours": "08:00 - 22:00",
        "status": "active",
    },
    {
        "name": "Circle K Đại Cồ Việt",
        "description": "Cửa hàng tiện lợi 24/7 với đồ ăn nhanh và thực phẩm cơ bản",
        "phone": "024-3623-7890",
        "website": "https://www.circlek.com.vn",
        "address": "82 Đại Cồ Việt, Lê Đại Hành, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Lê Đại Hành",
        "latitude": 21.0045,
        "longitude": 105.8468,
        "operating_hours": "24/7",
        "status": "active",
    },
    {
        "name": "Chợ Đồng Xuân",
        "description": "Chợ lớn nhất Hà Nội, đa dạng nguyên liệu tươi sống",
        "phone": "024-3825-1234",
        "address": "Chợ Đồng Xuân, Đồng Xuân, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Đồng Xuân",
        "latitude": 21.0380,
        "longitude": 105.8498,
        "operating_hours": "05:00 - 18:00",
        "status": "active",
    },
    # ── TP. Hồ Chí Minh ──
    {
        "name": "Co.op Mart Nguyễn Kiệm",
        "description": "Siêu thị Co.op Mart lớn với khu thực phẩm đa dạng",
        "phone": "028-3845-6789",
        "website": "https://www.co-opmart.com.vn",
        "address": "571 Nguyễn Kiệm, P.9, Phú Nhuận, TP.HCM",
        "city": "TP.HCM",
        "district": "Phú Nhuận",
        "ward": "Phường 9",
        "latitude": 10.8124,
        "longitude": 106.6775,
        "operating_hours": "07:00 - 22:00",
        "status": "active",
    },
    {
        "name": "Bách Hoá Xanh Bình Thạnh",
        "description": "Siêu thị thực phẩm giá rẻ, chuyên rau củ quả tươi",
        "phone": "028-3512-3456",
        "website": "https://www.bachhoaxanh.com",
        "address": "123 Xô Viết Nghệ Tĩnh, P.21, Bình Thạnh, TP.HCM",
        "city": "TP.HCM",
        "district": "Bình Thạnh",
        "ward": "Phường 21",
        "latitude": 10.8015,
        "longitude": 106.7110,
        "operating_hours": "06:00 - 22:30",
        "status": "active",
    },
    {
        "name": "AEON Mall Tân Phú",
        "description": "Trung tâm mua sắm lớn với siêu thị AEON, thực phẩm Nhật",
        "phone": "028-6288-7777",
        "website": "https://aeonmall-tanphuceladon.com.vn",
        "address": "30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM",
        "city": "TP.HCM",
        "district": "Tân Phú",
        "ward": "Sơn Kỳ",
        "latitude": 10.8019,
        "longitude": 106.6188,
        "operating_hours": "08:00 - 22:00",
        "status": "active",
    },
    {
        "name": "Chợ Bến Thành",
        "description": "Chợ biểu tượng Sài Gòn, đặc sản và thực phẩm đa dạng",
        "phone": "028-3829-9274",
        "address": "Chợ Bến Thành, Bến Thành, Quận 1, TP.HCM",
        "city": "TP.HCM",
        "district": "Quận 1",
        "ward": "Bến Thành",
        "latitude": 10.7725,
        "longitude": 106.6981,
        "operating_hours": "06:00 - 18:00",
        "status": "active",
    },
    {
        "name": "Lotte Mart Quận 7",
        "description": "Đại siêu thị Hàn Quốc với thực phẩm nhập khẩu chất lượng",
        "phone": "028-5413-5678",
        "website": "https://www.lottemart.com.vn",
        "address": "469 Nguyễn Hữu Thọ, Tân Hưng, Quận 7, TP.HCM",
        "city": "TP.HCM",
        "district": "Quận 7",
        "ward": "Tân Hưng",
        "latitude": 10.7385,
        "longitude": 106.7000,
        "operating_hours": "08:00 - 22:00",
        "status": "active",
    },
    {
        "name": "GS25 Nguyễn Thị Minh Khai",
        "description": "Cửa hàng tiện lợi Hàn Quốc, đồ ăn sẵn đa dạng",
        "phone": "028-3822-0000",
        "website": "https://gs25.com.vn",
        "address": "210 Nguyễn Thị Minh Khai, P.6, Quận 3, TP.HCM",
        "city": "TP.HCM",
        "district": "Quận 3",
        "ward": "Phường 6",
        "latitude": 10.7795,
        "longitude": 106.6890,
        "operating_hours": "24/7",
        "status": "active",
    },
    {
        "name": "Emart Gò Vấp",
        "description": "Đại siêu thị Hàn Quốc với khu thực phẩm tươi sống rộng",
        "phone": "028-3589-1234",
        "website": "https://emart.com.vn",
        "address": "366 Phan Văn Trị, P.5, Gò Vấp, TP.HCM",
        "city": "TP.HCM",
        "district": "Gò Vấp",
        "ward": "Phường 5",
        "latitude": 10.8330,
        "longitude": 106.6750,
        "operating_hours": "08:00 - 22:00",
        "status": "active",
    },
    {
        "name": "Lotte Mart Tây Hồ",
        "description": "Siêu thị tổng hợp Hàn Quốc với khu ẩm thực và thực phẩm tươi sống phong phú",
        "phone": "024-3758-9999",
        "email": "info@lottemart.com.vn",
        "website": "https://lottemart.com.vn",
        "address": "683 Lạc Long Quân, Phú Thượng, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Phú Thượng",
        "latitude": 21.0691,
        "longitude": 105.8112,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "AEON Mall Long Biên",
        "description": "Đại siêu thị Nhật Bản, cung cấp đầy đủ nhu yếu phẩm và ẩm thực",
        "phone": "024-3269-3000",
        "email": "contact@aeonmall-long-bien.com.vn",
        "website": "https://aeonmall-long-bien.com.vn",
        "address": "27 Cổ Linh, Long Biên, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Long Biên",
        "latitude": 21.0270,
        "longitude": 105.9002,
        "operating_hours": "10:00 - 22:00",
        "status": "active"
    },
    {
        "name": "FujiMart Hoàng Cầu",
        "description": "Siêu thị tiêu chuẩn Nhật Bản với thực phẩm tươi ngon mỗi ngày",
        "phone": "024-3855-6666",
        "website": "https://fujimart.vn",
        "address": "16 Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Ô Chợ Dừa",
        "latitude": 21.0205,
        "longitude": 105.8236,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Tops Market The Garden",
        "description": "Siêu thị cao cấp với đa dạng thực phẩm nhập khẩu",
        "phone": "024-3787-5500",
        "website": "https://topsmarket.vn",
        "address": "Tầng B1, TTTM The Garden, Mễ Trì, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Mễ Trì",
        "latitude": 21.0151,
        "longitude": 105.7788,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "BRGMart Hàng Trống",
        "description": "Siêu thị nội đô tiện lợi, đa dạng hàng hoá thiết yếu",
        "phone": "024-3825-4444",
        "website": "https://brgmart.vn",
        "address": "2 Lý Thái Tổ, Hàng Trống, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Hàng Trống",
        "latitude": 21.0315,
        "longitude": 105.8523,
        "operating_hours": "07:30 - 21:30",
        "status": "active"
    },
    {
        "name": "Chợ Nghĩa Tân",
        "description": "Chợ truyền thống sầm uất, nổi tiếng với các quầy thực phẩm tươi sống",
        "address": "Phố Nghĩa Tân, Nghĩa Tân, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Nghĩa Tân",
        "latitude": 21.0422,
        "longitude": 105.7955,
        "operating_hours": "05:00 - 19:00",
        "status": "active"
    },
    {
        "name": "Chợ Bưởi",
        "description": "Chợ lâu đời, chuyên cung cấp thực phẩm và cây cảnh",
        "address": "Đường Hoàng Hoa Thám, Bưởi, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Bưởi",
        "latitude": 21.0426,
        "longitude": 105.8118,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "Chợ Mơ",
        "description": "Chợ trung tâm tại Hai Bà Trưng, đa dạng các mặt hàng tươi sống",
        "address": "459 Bạch Mai, Trương Định, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Trương Định",
        "latitude": 20.9995,
        "longitude": 105.8510,
        "operating_hours": "06:00 - 19:00",
        "status": "active"
    },
    {
        "name": "Homefarm Thái Hà",
        "description": "Cửa hàng thực phẩm cao cấp, chuyên bò Mỹ, Úc và cá hồi",
        "phone": "024-7108-1008",
        "email": "info@homefarm.vn",
        "website": "https://homefarm.vn",
        "address": "116 Thái Hà, Trung Liệt, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Trung Liệt",
        "latitude": 21.0125,
        "longitude": 105.8211,
        "operating_hours": "08:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Homefarm Trần Đăng Ninh",
        "description": "Chuyên cung cấp cá hồi tươi, thịt bò nhập khẩu và gia vị",
        "phone": "024-7108-1009",
        "website": "https://homefarm.vn",
        "address": "45 Trần Đăng Ninh, Dịch Vọng, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Dịch Vọng",
        "latitude": 21.0375,
        "longitude": 105.7942,
        "operating_hours": "08:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Sói Biển Hoàng Văn Thái",
        "description": "Chuỗi cửa hàng thực phẩm sạch, hải sản tươi và rau hữu cơ",
        "phone": "0966-000-111",
        "website": "https://soibien.vn",
        "address": "65 Hoàng Văn Thái, Khương Trung, Thanh Xuân, Hà Nội",
        "city": "Hà Nội",
        "district": "Thanh Xuân",
        "ward": "Khương Trung",
        "latitude": 20.9961,
        "longitude": 105.8239,
        "operating_hours": "06:30 - 21:30",
        "status": "active"
    },
    {
        "name": "Sói Biển Lạc Trung",
        "description": "Cửa hàng thực phẩm sạch, an toàn cho mọi gia đình",
        "phone": "0966-000-222",
        "website": "https://soibien.vn",
        "address": "115 Lạc Trung, Vĩnh Tuy, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Vĩnh Tuy",
        "latitude": 21.0068,
        "longitude": 105.8643,
        "operating_hours": "06:30 - 21:30",
        "status": "active"
    },
    {
        "name": "Bác Tôm Nguyễn Công Trứ",
        "description": "Cửa hàng chuyên cung cấp rau quả sạch và đặc sản vùng miền",
        "phone": "0912-345-678",
        "website": "https://bactom.com",
        "address": "12 Nguyễn Công Trứ, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Phạm Đình Hổ",
        "latitude": 21.0163,
        "longitude": 105.8569,
        "operating_hours": "07:00 - 20:30",
        "status": "active"
    },
    {
        "name": "Bác Tôm Văn Quán",
        "description": "Thực phẩm hữu cơ và nông sản sạch tiêu chuẩn",
        "phone": "0912-345-679",
        "website": "https://bactom.com",
        "address": "A11 KĐT Văn Quán, Văn Quán, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Văn Quán",
        "latitude": 20.9782,
        "longitude": 105.7925,
        "operating_hours": "07:00 - 20:30",
        "status": "active"
    },
    {
        "name": "TH true mart Bà Triệu",
        "description": "Cửa hàng cung cấp các sản phẩm sữa và thực phẩm từ trang trại TH",
        "phone": "1800-545-440",
        "website": "https://thtruemart.vn",
        "address": "315 Bà Triệu, Lê Đại Hành, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Lê Đại Hành",
        "latitude": 21.0118,
        "longitude": 105.8492,
        "operating_hours": "07:30 - 21:00",
        "status": "active"
    },
    {
        "name": "TH true mart Cầu Giấy",
        "description": "Điểm phân phối các sản phẩm nông nghiệp sạch từ tập đoàn TH",
        "phone": "1800-545-440",
        "website": "https://thtruemart.vn",
        "address": "259 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Dịch Vọng",
        "latitude": 21.0354,
        "longitude": 105.7951,
        "operating_hours": "07:30 - 21:00",
        "status": "active"
    },
    {
        "name": "Klever Fruits Phan Đình Phùng",
        "description": "Hệ thống trái cây nhập khẩu cao cấp",
        "phone": "024-3833-8888",
        "website": "https://kleverfruits.com.vn",
        "address": "71 Phan Đình Phùng, Quán Thánh, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Quán Thánh",
        "latitude": 21.0401,
        "longitude": 105.8398,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Klever Fruits Trần Duy Hưng",
        "description": "Trái cây tươi ngon, hộp quà tặng trái cây cao cấp",
        "phone": "024-3833-8899",
        "website": "https://kleverfruits.com.vn",
        "address": "22 Trần Duy Hưng, Trung Hoà, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Trung Hoà",
        "latitude": 21.0084,
        "longitude": 105.7985,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Luôn Tươi Sạch Tôn Đức Thắng",
        "description": "Hệ thống bán lẻ trái cây nhập khẩu uy tín",
        "phone": "024-3999-6666",
        "website": "https://luontuoisach.vn",
        "address": "125 Tôn Đức Thắng, Hàng Bột, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Hàng Bột",
        "latitude": 21.0263,
        "longitude": 105.8305,
        "operating_hours": "07:30 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Tây Sơn",
        "description": "Cửa hàng tiện dụng cung cấp thực phẩm tươi sống và hàng bách hoá",
        "phone": "024-7106-6868",
        "website": "https://winmart.vn",
        "address": "285 Tây Sơn, Ngã Tư Sở, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Ngã Tư Sở",
        "latitude": 21.0089,
        "longitude": 105.8214,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Linh Đàm",
        "description": "Siêu thị mini phục vụ nhu cầu thường ngày của cư dân",
        "phone": "024-7106-6869",
        "website": "https://winmart.vn",
        "address": "Kiot 2, HH2A Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Hoàng Liệt",
        "latitude": 20.9634,
        "longitude": 105.8256,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Mỹ Đình",
        "description": "Siêu thị mini WinMart+",
        "phone": "024-7106-6870",
        "website": "https://winmart.vn",
        "address": "12 Đình Thôn, Mỹ Đình 1, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Mỹ Đình 1",
        "latitude": 21.0189,
        "longitude": 105.7761,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Trương Định",
        "description": "Thực phẩm tươi ngon, bách hóa thiết yếu",
        "phone": "024-7106-6871",
        "website": "https://winmart.vn",
        "address": "115 Trương Định, Trương Định, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Trương Định",
        "latitude": 20.9951,
        "longitude": 105.8502,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Xuân La",
        "description": "Thực phẩm và nhu yếu phẩm chất lượng",
        "phone": "024-7106-6872",
        "website": "https://winmart.vn",
        "address": "36 Xuân La, Xuân La, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Xuân La",
        "latitude": 21.0567,
        "longitude": 105.8089,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Hàng Bông",
        "description": "Cửa hàng tiện lợi mở cửa xuyên đêm",
        "phone": "024-3938-1111",
        "website": "https://www.circlek.com.vn",
        "address": "81 Hàng Bông, Hàng Gai, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Hàng Gai",
        "latitude": 21.0311,
        "longitude": 105.8475,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Circle K Chùa Láng",
        "description": "Đồ ăn nhanh, đồ uống và các vật dụng thiết yếu",
        "phone": "024-3938-1112",
        "website": "https://www.circlek.com.vn",
        "address": "119 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Láng Thượng",
        "latitude": 21.0234,
        "longitude": 105.8031,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Circle K Trần Đại Nghĩa",
        "description": "Cửa hàng tiện lợi phục vụ học sinh sinh viên",
        "phone": "024-3938-1113",
        "website": "https://www.circlek.com.vn",
        "address": "90 Trần Đại Nghĩa, Đồng Tâm, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Đồng Tâm",
        "latitude": 21.0012,
        "longitude": 105.8445,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Circle K Nguyễn Phong Sắc",
        "description": "Tiện lợi 24/7, có khu vực ngồi ăn",
        "phone": "024-3938-1114",
        "website": "https://www.circlek.com.vn",
        "address": "33 Nguyễn Phong Sắc, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Dịch Vọng Hậu",
        "latitude": 21.0405,
        "longitude": 105.7891,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Circle K Quang Trung",
        "description": "Phục vụ thức ăn nhanh và các loại đồ uống",
        "phone": "024-3938-1115",
        "website": "https://www.circlek.com.vn",
        "address": "15 Quang Trung, Nguyễn Trãi, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Nguyễn Trãi",
        "latitude": 20.9723,
        "longitude": 105.7789,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "GS25 Nguyễn Tuân",
        "description": "Cửa hàng tiện lợi chuẩn phong cách Hàn Quốc",
        "phone": "1900-636-025",
        "website": "https://gs25.com.vn",
        "address": "109 Nguyễn Tuân, Thanh Xuân Trung, Thanh Xuân, Hà Nội",
        "city": "Hà Nội",
        "district": "Thanh Xuân",
        "ward": "Thanh Xuân Trung",
        "latitude": 20.9967,
        "longitude": 105.8011,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "GS25 Hồ Tùng Mậu",
        "description": "Đồ ăn Hàn Quốc, bách hóa tiện lợi",
        "phone": "1900-636-026",
        "website": "https://gs25.com.vn",
        "address": "15 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Mai Dịch",
        "latitude": 21.0378,
        "longitude": 105.7765,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Co.op Food Giải Phóng",
        "description": "Siêu thị thực phẩm an toàn",
        "phone": "024-3864-1122",
        "website": "https://www.co-opmart.com.vn",
        "address": "890 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Giáp Bát",
        "latitude": 20.9834,
        "longitude": 105.8412,
        "operating_hours": "06:30 - 21:30",
        "status": "active"
    },
    {
        "name": "Co.op Food Đội Cấn",
        "description": "Thực phẩm tươi sống đa dạng, giá cả bình ổn",
        "phone": "024-3864-1133",
        "website": "https://www.co-opmart.com.vn",
        "address": "266 Đội Cấn, Liễu Giai, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Liễu Giai",
        "latitude": 21.0345,
        "longitude": 105.8167,
        "operating_hours": "06:30 - 21:30",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Nguyễn Văn Cừ",
        "description": "Rau củ tươi, thịt cá chất lượng",
        "phone": "1900-1908",
        "website": "https://www.bachhoaxanh.com",
        "address": "450 Nguyễn Văn Cừ, Gia Thụy, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Gia Thụy",
        "latitude": 21.0489,
        "longitude": 105.8765,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Kim Giang",
        "description": "Thực phẩm tươi ngon, giá bình dân",
        "phone": "1900-1908",
        "website": "https://www.bachhoaxanh.com",
        "address": "120 Kim Giang, Đại Kim, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Đại Kim",
        "latitude": 20.9801,
        "longitude": 105.8143,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Mega Market Thăng Long",
        "description": "Trung tâm bán buôn và bán lẻ thực phẩm",
        "phone": "024-3755-6666",
        "website": "https://mmvietnam.com",
        "address": "Phạm Văn Đồng, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Bắc Từ Liêm",
        "ward": "Cổ Nhuế 1",
        "latitude": 21.0567,
        "longitude": 105.7821,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Mega Market Hoàng Mai",
        "description": "Siêu thị bán buôn cung cấp thực phẩm chuyên nghiệp",
        "phone": "024-3645-5555",
        "website": "https://mmvietnam.com",
        "address": "Tam Trinh, Yên Sở, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Yên Sở",
        "latitude": 20.9631,
        "longitude": 105.8672,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "GO! Thăng Long",
        "description": "Đại siêu thị mua sắm tổng hợp",
        "phone": "024-3764-1111",
        "website": "https://go-vietnam.vn",
        "address": "222 Trần Duy Hưng, Trung Hoà, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Trung Hoà",
        "latitude": 21.0071,
        "longitude": 105.7936,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Intimex Lạc Long Quân",
        "description": "Siêu thị truyền thống cung cấp thực phẩm và đồ gia dụng",
        "phone": "024-3753-2222",
        "address": "32 Lạc Long Quân, Nghĩa Đô, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Nghĩa Đô",
        "latitude": 21.0456,
        "longitude": 105.8034,
        "operating_hours": "07:30 - 21:30",
        "status": "active"
    },
    {
        "name": "Hapro Mart Hàng Bồ",
        "description": "Siêu thị mini chuyên các sản phẩm nông sản nội địa",
        "phone": "024-3825-3333",
        "address": "15 Hàng Bồ, Hàng Bồ, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Hàng Bồ",
        "latitude": 21.0342,
        "longitude": 105.8491,
        "operating_hours": "07:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Chợ Kim Liên",
        "description": "Chợ truyền thống lâu năm khu vực Đống Đa",
        "address": "Lương Định Của, Kim Liên, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Kim Liên",
        "latitude": 21.0101,
        "longitude": 105.8356,
        "operating_hours": "05:00 - 18:30",
        "status": "active"
    },
    {
        "name": "Chợ Ngã Tư Sở",
        "description": "Trung tâm thương mại truyền thống và thực phẩm đa dạng",
        "address": "Đường Láng, Ngã Tư Sở, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Ngã Tư Sở",
        "latitude": 21.0051,
        "longitude": 105.8162,
        "operating_hours": "05:30 - 19:00",
        "status": "active"
    },
    {
        "name": "Chợ Phùng Khoang",
        "description": "Chợ sinh viên sầm uất với thực phẩm và đồ dùng giá rẻ",
        "address": "Phùng Khoang, Trung Văn, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Trung Văn",
        "latitude": 20.9856,
        "longitude": 105.7923,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Chợ Hàng Bè",
        "description": "Khu chợ phố cổ nổi tiếng với đồ ăn chín và thực phẩm cao cấp",
        "address": "Phố Gia Ngư, Hàng Bạc, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Kiếm",
        "ward": "Hàng Bạc",
        "latitude": 21.0318,
        "longitude": 105.8529,
        "operating_hours": "06:00 - 19:00",
        "status": "active"
    },
    {
        "name": "Dalat Mart Xã Đàn",
        "description": "Siêu thị chuyên các mặt hàng nông sản Đà Lạt",
        "phone": "0988-123-456",
        "address": "150 Xã Đàn, Phương Liên, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Phương Liên",
        "latitude": 21.0116,
        "longitude": 105.8361,
        "operating_hours": "07:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Meat Deli Đê La Thành",
        "description": "Cửa hàng thịt heo sạch tiêu chuẩn BRC",
        "phone": "1800-6868",
        "website": "https://meatdeli.com.vn",
        "address": "400 Đê La Thành, Ô Chợ Dừa, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Ô Chợ Dừa",
        "latitude": 21.0201,
        "longitude": 105.8231,
        "operating_hours": "06:30 - 20:00",
        "status": "active"
    },
    {
        "name": "Meat Deli Hai Bà Trưng",
        "description": "Thịt heo sạch, chế biến an toàn tuyệt đối",
        "phone": "1800-6868",
        "website": "https://meatdeli.com.vn",
        "address": "100 Lò Đúc, Đống Mác, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Đống Mác",
        "latitude": 21.0135,
        "longitude": 105.8576,
        "operating_hours": "06:30 - 20:00",
        "status": "active"
    },
    {
        "name": "V-Mart Hà Đông",
        "description": "Siêu thị địa phương với đa dạng mặt hàng thiết yếu",
        "phone": "024-3352-1111",
        "address": "15 Trần Phú, Mộ Lao, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Mộ Lao",
        "latitude": 20.9785,
        "longitude": 105.7865,
        "operating_hours": "07:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Q-Mart Trần Quốc Toản",
        "description": "Cửa hàng bán lẻ nhu yếu phẩm gia đình",
        "phone": "024-3942-2222",
        "address": "28 Trần Quốc Toản, Hàng Bài, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Hàng Bài",
        "latitude": 21.0216,
        "longitude": 105.8504,
        "operating_hours": "07:00 - 21:30",
        "status": "active"
    },
    {
        "name": "Seven-Mart Cầu Diễn",
        "description": "Cửa hàng tiện lợi cung cấp thực phẩm đóng gói và nước giải khát",
        "phone": "024-3763-3333",
        "address": "18 Hồ Tùng Mậu, Cầu Diễn, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Cầu Diễn",
        "latitude": 21.0375,
        "longitude": 105.7661,
        "operating_hours": "06:00 - 23:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Nguyễn Văn Cừ",
        "description": "Cửa hàng tiện lợi WinMart+ với đầy đủ nhu yếu phẩm",
        "phone": "024-7106-6868",
        "email": "nguyenvancu@winmart.vn",
        "website": "https://winmart.vn",
        "address": "554 Nguyễn Văn Cừ, Gia Thụy, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Gia Thụy",
        "latitude": 21.0456,
        "longitude": 105.8792,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Ngọc Lâm",
        "description": "Cửa hàng tiện lợi 24/7, có khu vực ngồi ăn uống",
        "phone": "024-3622-1111",
        "website": "https://www.circlek.com.vn",
        "address": "152 Ngọc Lâm, Ngọc Lâm, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Ngọc Lâm",
        "latitude": 21.0435,
        "longitude": 105.8734,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Co.op Food Nguyễn Sơn",
        "description": "Thực phẩm tươi sống và an toàn mỗi ngày",
        "phone": "024-3873-2222",
        "address": "85 Nguyễn Sơn, Ngọc Lâm, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Ngọc Lâm",
        "latitude": 21.0401,
        "longitude": 105.8789,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Chợ Ngọc Lâm",
        "description": "Chợ dân sinh truyền thống lớn nhất nhì Long Biên",
        "phone": "024-3827-0000",
        "address": "Ngõ 111 Ngọc Lâm, Ngọc Lâm, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Ngọc Lâm",
        "latitude": 21.0430,
        "longitude": 105.8710,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "BRGMart Nguyễn Văn Cừ",
        "description": "Siêu thị đa dạng hàng hóa và thực phẩm nhập khẩu",
        "phone": "024-3872-3333",
        "website": "https://brgshopping.vn",
        "address": "381 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0422,
        "longitude": 105.8765,
        "operating_hours": "07:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Bồ Đề",
        "description": "Siêu thị rau củ thịt cá tươi sống",
        "phone": "1900-1908",
        "website": "https://www.bachhoaxanh.com",
        "address": "120 Phú Viên, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0360,
        "longitude": 105.8655,
        "operating_hours": "06:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Sói Biển Lâm Hạ",
        "description": "Chuỗi cửa hàng thực phẩm sạch, hải sản tươi sống",
        "phone": "098-123-4567",
        "website": "https://soibien.vn",
        "address": "45 Lâm Hạ, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0375,
        "longitude": 105.8770,
        "operating_hours": "06:00 - 21:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Hoàng Như Tiếp",
        "description": "Siêu thị mini tiện lợi phục vụ cư dân Bồ Đề",
        "phone": "024-7106-6869",
        "address": "82 Hoàng Như Tiếp, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0388,
        "longitude": 105.8752,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Ái Mộ",
        "description": "Đồ ăn nhẹ, nước giải khát mở cửa xuyên đêm",
        "phone": "024-3622-1112",
        "address": "12 Ái Mộ, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0350,
        "longitude": 105.8700,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "FujiMart Long Biên",
        "description": "Siêu thị liên doanh Việt - Nhật",
        "phone": "024-3873-4444",
        "website": "https://fujimart.vn",
        "address": "Tầng 1, Tòa nhà Hope Residences, Phúc Đồng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Đồng",
        "latitude": 21.0392,
        "longitude": 105.9031,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Chợ Gia Lâm",
        "description": "Chợ lớn lâu đời của khu vực",
        "phone": "024-3827-1111",
        "address": "Phố Ngô Gia Khảm, Ngọc Lâm, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Ngọc Lâm",
        "latitude": 21.0470,
        "longitude": 105.8760,
        "operating_hours": "05:00 - 18:30",
        "status": "active"
    },
    {
        "name": "Aeon MaxValu Ecopark (Giáp Long Biên)",
        "description": "Siêu thị thực phẩm tiêu chuẩn Nhật Bản",
        "phone": "024-6666-8888",
        "address": "Khu đô thị Ecopark, Xuân Quan, Văn Giang (Giáp Gia Lâm)",
        "city": "Hưng Yên",
        "district": "Văn Giang",
        "ward": "Xuân Quan",
        "latitude": 20.9630,
        "longitude": 105.9320,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "CleverFood Việt Hưng",
        "description": "Thực phẩm hữu cơ và trái cây cao cấp",
        "phone": "098-999-8888",
        "address": "KĐT Việt Hưng, Giang Biên, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Giang Biên",
        "latitude": 21.0550,
        "longitude": 105.9010,
        "operating_hours": "06:30 - 21:00",
        "status": "active"
    },
    {
        "name": "K-Market Việt Hưng",
        "description": "Siêu thị hàng tiêu dùng và thực phẩm Hàn Quốc",
        "phone": "024-3873-5555",
        "website": "https://kmarket.vn",
        "address": "Khu đô thị Việt Hưng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Giang Biên",
        "latitude": 21.0560,
        "longitude": 105.9025,
        "operating_hours": "07:00 - 22:30",
        "status": "active"
    },
    {
        "name": "WinMart+ KĐT Việt Hưng",
        "description": "Tiện ích cho cư dân khu đô thị",
        "phone": "024-7106-6870",
        "address": "Tòa HH04 KĐT Việt Hưng, Giang Biên, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Giang Biên",
        "latitude": 21.0572,
        "longitude": 105.9001,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Ngô Gia Tự",
        "description": "Mì trộn, cà phê và đồ ăn nhanh",
        "phone": "024-3622-1113",
        "address": "452 Ngô Gia Tự, Đức Giang, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Đức Giang",
        "latitude": 21.0600,
        "longitude": 105.8920,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Chợ Việt Hưng",
        "description": "Chợ dân sinh phục vụ KĐT và cư dân xung quanh",
        "phone": "024-3827-2222",
        "address": "Đường Hoa Lâm, Việt Hưng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Việt Hưng",
        "latitude": 21.0510,
        "longitude": 105.8950,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "BRGMart Phúc Đồng",
        "description": "Nhu yếu phẩm và đồ gia dụng",
        "phone": "024-3872-4444",
        "address": "Chu Huy Mân, Phúc Đồng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Đồng",
        "latitude": 21.0365,
        "longitude": 105.9050,
        "operating_hours": "07:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Tomita Mart Long Biên",
        "description": "Siêu thị thực phẩm cao cấp",
        "phone": "098-111-2222",
        "website": "https://tomitamart.vn",
        "address": "Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0405,
        "longitude": 105.8775,
        "operating_hours": "08:00 - 21:30",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Ngô Gia Tự",
        "description": "Rau quả tươi sống, thịt cá mỗi ngày",
        "phone": "1900-1908",
        "address": "345 Ngô Gia Tự, Đức Giang, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Đức Giang",
        "latitude": 21.0580,
        "longitude": 105.8890,
        "operating_hours": "06:30 - 21:30",
        "status": "active"
    },
    {
        "name": "WinMart+ Sài Đồng",
        "description": "Phục vụ dân cư khu vực Sài Đồng",
        "phone": "024-7106-6871",
        "address": "15 Vũ Xuân Thiều, Sài Đồng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Sài Đồng",
        "latitude": 21.0315,
        "longitude": 105.9150,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Sài Đồng",
        "description": "Mở cửa xuyên đêm khu Sài Đồng",
        "phone": "024-3622-1114",
        "address": "Số 2 Sài Đồng, Sài Đồng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Sài Đồng",
        "latitude": 21.0320,
        "longitude": 105.9120,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Chợ Phúc Đồng",
        "description": "Chợ lớn khu vực Phúc Đồng",
        "phone": "024-3827-3333",
        "address": "Đường Phúc Đồng, Phúc Đồng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Đồng",
        "latitude": 21.0380,
        "longitude": 105.9080,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "Chợ Sài Đồng",
        "description": "Cung cấp nông sản tươi sống",
        "phone": "024-3827-4444",
        "address": "Vũ Xuân Thiều, Sài Đồng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Sài Đồng",
        "latitude": 21.0290,
        "longitude": 105.9140,
        "operating_hours": "05:00 - 19:00",
        "status": "active"
    },
    {
        "name": "Co.op Food Thạch Bàn",
        "description": "Thực phẩm an toàn, tiện lợi",
        "phone": "024-3873-5555",
        "address": "Ngõ 68 Thạch Bàn, Thạch Bàn, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Thạch Bàn",
        "latitude": 21.0180,
        "longitude": 105.9050,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Thạch Bàn",
        "description": "Chuỗi siêu thị thực phẩm rẻ",
        "phone": "1900-1908",
        "address": "154 Thạch Bàn, Thạch Bàn, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Thạch Bàn",
        "latitude": 21.0160,
        "longitude": 105.9070,
        "operating_hours": "06:30 - 22:00",
        "status": "active"
    },
    {
        "name": "V-Mart Cổ Linh",
        "description": "Siêu thị mini đường Cổ Linh",
        "phone": "024-3333-4444",
        "address": "Cổ Linh, Thạch Bàn, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Thạch Bàn",
        "latitude": 21.0210,
        "longitude": 105.9000,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Aeon Mall Long Biên (AEON Supermarket)",
        "description": "Đại siêu thị Nhật Bản quy mô lớn",
        "phone": "024-6288-7777",
        "website": "https://aeonmall-long-bien.com.vn",
        "address": "27 Cổ Linh, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Long Biên",
        "latitude": 21.0268,
        "longitude": 105.8985,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Cổ Linh",
        "description": "Siêu thị WinMart+ gần TTTM Aeon",
        "phone": "024-7106-6872",
        "address": "Ngõ 29 Cổ Linh, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Long Biên",
        "latitude": 21.0275,
        "longitude": 105.8960,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Cổ Linh",
        "description": "Cửa hàng tiện lợi trên tuyến đường lớn",
        "phone": "024-3622-1115",
        "address": "15 Cổ Linh, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Long Biên",
        "latitude": 21.0250,
        "longitude": 105.8990,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Chợ Thạch Bàn",
        "description": "Chợ quy mô vừa khu vực Thạch Bàn",
        "phone": "024-3827-5555",
        "address": "Ngõ 63 Thạch Bàn, Thạch Bàn, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Thạch Bàn",
        "latitude": 21.0150,
        "longitude": 105.9080,
        "operating_hours": "05:30 - 18:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Phúc Lợi",
        "description": "Thực phẩm tươi giá tốt",
        "phone": "1900-1908",
        "address": "Đường Phúc Lợi, Phúc Lợi, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Lợi",
        "latitude": 21.0450,
        "longitude": 105.9320,
        "operating_hours": "06:00 - 21:30",
        "status": "active"
    },
    {
        "name": "BRGMart Phúc Lợi",
        "description": "Phục vụ cư dân khu chung cư Ruby City",
        "phone": "024-3872-5555",
        "address": "Tòa nhà Ruby City, Phúc Lợi, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Lợi",
        "latitude": 21.0460,
        "longitude": 105.9335,
        "operating_hours": "07:30 - 22:00",
        "status": "active"
    },
    {
        "name": "TH True Mart Việt Hưng",
        "description": "Chuyên các sản phẩm từ sữa và hạt TH",
        "phone": "1800-545440",
        "website": "https://thtruemart.vn",
        "address": "KĐT Việt Hưng, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Việt Hưng",
        "latitude": 21.0525,
        "longitude": 105.8970,
        "operating_hours": "07:00 - 21:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Phúc Lợi",
        "description": "Siêu thị mini tại Phúc Lợi",
        "phone": "024-7106-6873",
        "address": "Khu đô thị Việt Hưng, Phúc Lợi, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Lợi",
        "latitude": 21.0445,
        "longitude": 105.9300,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Phúc Lợi",
        "description": "Mua sắm nhanh chóng và tiện lợi",
        "phone": "024-3622-1116",
        "address": "Ruby City CT3, Phúc Lợi, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Lợi",
        "latitude": 21.0470,
        "longitude": 105.9340,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Chợ Phúc Lợi",
        "description": "Khu chợ đông đúc tại phường Phúc Lợi",
        "phone": "024-3827-6666",
        "address": "Ngõ 200 Phúc Lợi, Phúc Lợi, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Phúc Lợi",
        "latitude": 21.0430,
        "longitude": 105.9315,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "Co.op Food Giang Biên",
        "description": "Thực phẩm an toàn khu Giang Biên",
        "phone": "024-3873-6666",
        "address": "Mai Chí Thọ, Giang Biên, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Giang Biên",
        "latitude": 21.0540,
        "longitude": 105.9120,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Giang Biên",
        "description": "Hàng tươi sống giá tốt",
        "phone": "1900-1908",
        "address": "Đường Giang Biên, Giang Biên, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Giang Biên",
        "latitude": 21.0565,
        "longitude": 105.9150,
        "operating_hours": "06:30 - 21:30",
        "status": "active"
    },
    {
        "name": "WinMart+ S1.01 Ocean Park",
        "description": "Siêu thị ngay chân đế tòa S1.01",
        "phone": "024-7106-6874",
        "address": "Tòa S1.01, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9920,
        "longitude": 105.9400,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Circle K S1.03 Ocean Park",
        "description": "Cửa hàng tiện lợi phục vụ sinh viên Uni và cư dân",
        "phone": "024-3622-1117",
        "address": "Tòa S1.03, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9925,
        "longitude": 105.9410,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "K-Market S1.05 Ocean Park",
        "description": "Đồ ăn Hàn Quốc, mì cay, snack",
        "phone": "024-3873-7777",
        "address": "Tòa S1.05, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9930,
        "longitude": 105.9420,
        "operating_hours": "07:00 - 23:00",
        "status": "active"
    },
    {
        "name": "GS25 S1.08 Ocean Park",
        "description": "Thương hiệu cửa hàng tiện lợi Hàn Quốc",
        "phone": "024-3333-5555",
        "website": "https://gs25.com.vn",
        "address": "Tòa S1.08, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9940,
        "longitude": 105.9415,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "MeatDeli S1.09 Ocean Park",
        "description": "Thịt heo sạch công nghệ Châu Âu",
        "phone": "1800-6828",
        "website": "https://meatdeli.com.vn",
        "address": "Tòa S1.09, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9945,
        "longitude": 105.9425,
        "operating_hours": "06:30 - 20:30",
        "status": "active"
    },
    {
        "name": "Sói Biển S1.12 Ocean Park",
        "description": "Thực phẩm sạch và hải sản",
        "phone": "098-123-4568",
        "address": "Tòa S1.12, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9950,
        "longitude": 105.9430,
        "operating_hours": "06:00 - 21:00",
        "status": "active"
    },
    {
        "name": "TH True Mart S1.10 Ocean Park",
        "description": "Đại lý sữa và các sản phẩm sạch TH",
        "phone": "1800-545440",
        "address": "Tòa S1.10, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9948,
        "longitude": 105.9428,
        "operating_hours": "07:00 - 21:30",
        "status": "active"
    },
    {
        "name": "WinMart+ S2.01 Ocean Park",
        "description": "Tiện lợi cho khu S2",
        "phone": "024-7106-6875",
        "address": "Tòa S2.01, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9960,
        "longitude": 105.9440,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Circle K S2.02 Ocean Park",
        "description": "Đồ ăn vặt, mì ly 24/7",
        "phone": "024-3622-1118",
        "address": "Tòa S2.02, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9962,
        "longitude": 105.9445,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "7-Eleven S2.05 Ocean Park",
        "description": "Chuỗi cửa hàng tiện lợi toàn cầu",
        "phone": "1900-633-811",
        "website": "https://www.7-eleven.vn",
        "address": "Tòa S2.05, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9970,
        "longitude": 105.9455,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Co.op Food S2.08 Ocean Park",
        "description": "Thực phẩm tươi sạch từ Co.op",
        "phone": "024-3873-8888",
        "address": "Tòa S2.08, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9975,
        "longitude": 105.9460,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "K-Market S2.10 Ocean Park",
        "description": "Đặc sản thực phẩm Hàn",
        "phone": "024-3873-9999",
        "address": "Tòa S2.10, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9980,
        "longitude": 105.9465,
        "operating_hours": "07:00 - 23:00",
        "status": "active"
    },
    {
        "name": "T-Mart S2.15 Ocean Park",
        "description": "Siêu thị gia đình",
        "phone": "098-222-3333",
        "address": "Tòa S2.15, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9990,
        "longitude": 105.9475,
        "operating_hours": "06:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Thực phẩm sạch S2.17 Ocean Park",
        "description": "Rau củ chuẩn VietGAP",
        "phone": "098-333-4444",
        "address": "Tòa S2.17, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9995,
        "longitude": 105.9480,
        "operating_hours": "06:00 - 21:00",
        "status": "active"
    },
    {
        "name": "WinMart+ R1.01 The Zenpark",
        "description": "Siêu thị cao cấp khu Zenpark",
        "phone": "024-7106-6876",
        "address": "Tòa R1.01 The Zenpark, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0020,
        "longitude": 105.9500,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Circle K R1.02 The Zenpark",
        "description": "Cửa hàng tiện lợi 24/7 khu Ruby",
        "phone": "024-3622-1119",
        "address": "Tòa R1.02 The Zenpark, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0022,
        "longitude": 105.9505,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "K-Market R1.05 The Zenpark",
        "description": "Siêu thị Hàn Quốc nhập khẩu",
        "phone": "024-3874-1111",
        "address": "Tòa R1.05 The Zenpark, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0030,
        "longitude": 105.9515,
        "operating_hours": "07:00 - 23:00",
        "status": "active"
    },
    {
        "name": "Tomita Mart R1.08 Ocean Park",
        "description": "Thực phẩm cao cấp Tomita",
        "phone": "098-111-3333",
        "address": "Tòa R1.08, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0035,
        "longitude": 105.9520,
        "operating_hours": "08:00 - 21:30",
        "status": "active"
    },
    {
        "name": "CleverFood R1.03 The Zenpark",
        "description": "Rau củ hữu cơ, hải sản tươi",
        "phone": "098-999-7777",
        "address": "Tòa R1.03 The Zenpark, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0025,
        "longitude": 105.9510,
        "operating_hours": "06:30 - 21:00",
        "status": "active"
    },
    {
        "name": "GS25 R1.05 The Zenpark",
        "description": "Cửa hàng GS25 tiện lợi",
        "phone": "024-3333-6666",
        "address": "Tòa R1.05 The Zenpark, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0030,
        "longitude": 105.9515,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Aeon MaxValu The Zenpark",
        "description": "Siêu thị chuẩn Nhật",
        "phone": "024-6666-9999",
        "address": "Chân đế R1, The Zenpark, Vinhomes Ocean Park, Dương Xá, Gia Lâm",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 21.0020,
        "longitude": 105.9500,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Hải Âu",
        "description": "Siêu thị mini khu biệt thự",
        "phone": "024-7106-6877",
        "address": "Khu Hải Âu, Vinhomes Ocean Park, Kiêu Kỵ, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Kiêu Kỵ",
        "latitude": 20.9900,
        "longitude": 105.9480,
        "operating_hours": "06:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Sao Biển",
        "description": "Cửa hàng khu TMDV Sao Biển",
        "phone": "024-3622-1120",
        "address": "Khu TMDV Sao Biển, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 20.9955,
        "longitude": 105.9550,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh San Hô",
        "description": "Chuỗi siêu thị khu San Hô",
        "phone": "1900-1908",
        "address": "Khu San Hô, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9880,
        "longitude": 105.9400,
        "operating_hours": "06:30 - 22:00",
        "status": "active"
    },
    {
        "name": "K-Market Hải Âu",
        "description": "Thực phẩm Hàn khu Hải Âu",
        "phone": "024-3874-2222",
        "address": "HA01, Vinhomes Ocean Park, Kiêu Kỵ, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Kiêu Kỵ",
        "latitude": 20.9905,
        "longitude": 105.9490,
        "operating_hours": "07:00 - 23:00",
        "status": "active"
    },
    {
        "name": "Chợ đêm Ocean Park",
        "description": "Phố đi bộ và chợ đêm hải sản, đồ ăn vặt",
        "phone": "090-000-0000",
        "address": "Khu Hải Âu, Vinhomes Ocean Park, Kiêu Kỵ, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Kiêu Kỵ",
        "latitude": 20.9890,
        "longitude": 105.9470,
        "operating_hours": "16:00 - 24:00",
        "status": "active"
    },
    {
        "name": "MeatDeli Sao Biển",
        "description": "Thịt chuẩn sạch MeatDeli",
        "phone": "1800-6828",
        "address": "Khu Sao Biển, Vinhomes Ocean Park, Dương Xá, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Dương Xá",
        "latitude": 20.9960,
        "longitude": 105.9560,
        "operating_hours": "06:30 - 20:30",
        "status": "active"
    },
    {
        "name": "Sói Biển San Hô",
        "description": "Hải sản tươi sống khu San Hô",
        "phone": "098-123-4569",
        "address": "Khu San Hô, Vinhomes Ocean Park, Đa Tốn, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Đa Tốn",
        "latitude": 20.9885,
        "longitude": 105.9410,
        "operating_hours": "06:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Vinmart / Winmart Mega Mall Ocean Park",
        "description": "Đại siêu thị quy mô lớn trong TTTM",
        "phone": "024-7106-6888",
        "address": "Tầng 1 Vincom Mega Mall Ocean Park, Kiêu Kỵ, Gia Lâm, Hà Nội",
        "city": "Hà Nội",
        "district": "Gia Lâm",
        "ward": "Kiêu Kỵ",
        "latitude": 20.9870,
        "longitude": 105.9450,
        "operating_hours": "09:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Big C Long Biên (Savico Megamall)",
        "description": "Đại siêu thị giá rẻ đa dạng mặt hàng",
        "phone": "024-6257-3333",
        "website": "https://www.bigc.vn",
        "address": "7-9 Nguyễn Văn Linh, Gia Thụy, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Gia Thụy",
        "latitude": 21.0485,
        "longitude": 105.8850,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Lò Đúc",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống và đồ khô",
        "phone": "024-3972-1122",
        "email": "loduc@winmart.vn",
        "website": "https://winmart.vn",
        "address": "114 Lò Đúc, Đống Mác, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Đống Mác",
        "latitude": 21.0135,
        "longitude": 105.8572,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Trương Định",
        "description": "Siêu thị thực phẩm giá rẻ, rau củ quả tươi mỗi ngày",
        "phone": "024-3662-3344",
        "email": "truongdinh@bachhoaxanh.com",
        "website": "https://www.bachhoaxanh.com",
        "address": "250 Trương Định, Tương Mai, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Tương Mai",
        "latitude": 20.9901,
        "longitude": 105.8485,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Circle K Hàng Bún",
        "description": "Cửa hàng tiện lợi 24/7 với đồ ăn nhanh và thực phẩm cơ bản",
        "phone": "024-3829-5566",
        "website": "https://www.circlek.com.vn",
        "address": "10 Hàng Bún, Nguyễn Trung Trực, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Nguyễn Trung Trực",
        "latitude": 21.0421,
        "longitude": 105.8450,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "BRGMart Thành Công",
        "description": "Siêu thị bán lẻ cung cấp nhu yếu phẩm và thực phẩm tươi",
        "phone": "024-3831-7788",
        "website": "https://brgshopping.vn",
        "address": "D2 Giảng Võ, Thành Công, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Thành Công",
        "latitude": 21.0268,
        "longitude": 105.8182,
        "operating_hours": "07:00 - 21:30",
        "status": "active"
    },
    {
        "name": "Chợ Bưởi",
        "description": "Chợ truyền thống chuyên bán thực phẩm, cây cảnh và vật nuôi",
        "phone": "024-3753-9900",
        "address": "Hoàng Hoa Thám, Bưởi, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Bưởi",
        "latitude": 21.0415,
        "longitude": 105.8078,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "FujiMart Hoàng Cầu",
        "description": "Siêu thị tiêu chuẩn Nhật Bản với thực phẩm tươi ngon, an toàn",
        "phone": "024-3519-1122",
        "website": "https://fujimart.vn",
        "address": "36 Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Ô Chợ Dừa",
        "latitude": 21.0205,
        "longitude": 105.8234,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Aeon Citimart Ecopark",
        "description": "Siêu thị tiện lợi thuộc chuỗi Aeon",
        "phone": "024-3874-3344",
        "website": "https://aeoncitimart.vn",
        "address": "Khu đô thị Ecopark, Xuân Quan, Văn Giang, Hưng Yên (Giáp Hà Nội)",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Thạch Bàn",
        "latitude": 20.9634,
        "longitude": 105.9321,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Sói Biển Trung Hòa",
        "description": "Chuỗi cửa hàng thực phẩm sạch, hải sản tươi sống",
        "phone": "024-3556-5566",
        "email": "cskh@soibien.vn",
        "website": "https://soibien.vn",
        "address": "116 Trung Hòa, Yên Hoà, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Yên Hoà",
        "latitude": 21.0132,
        "longitude": 105.7981,
        "operating_hours": "06:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Lotte Mart Đống Đa",
        "description": "Đại siêu thị đa dạng mặt hàng tiêu dùng và thực phẩm Hàn Quốc",
        "phone": "024-3564-7788",
        "website": "http://lottemart.com.vn",
        "address": "229 Tây Sơn, Ngã Tư Sở, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Ngã Tư Sở",
        "latitude": 21.0085,
        "longitude": 105.8230,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Co.opmart Hà Đông",
        "description": "Siêu thị bán lẻ cung cấp nhu yếu phẩm hàng ngày",
        "phone": "024-3311-9900",
        "website": "https://www.co-opmart.com.vn",
        "address": "Km 10 Nguyễn Trãi, Mộ Lao, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Mộ Lao",
        "latitude": 20.9821,
        "longitude": 105.7876,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Linh Đàm",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống và đồ khô",
        "phone": "024-3641-1133",
        "address": "HH2A Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Hoàng Liệt",
        "latitude": 20.9622,
        "longitude": 105.8255,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Ngọc Lâm",
        "description": "Siêu thị thực phẩm giá rẻ, rau củ quả tươi mỗi ngày",
        "phone": "024-3873-2244",
        "address": "15 Ngọc Lâm, Ngọc Lâm, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Ngọc Lâm",
        "latitude": 21.0471,
        "longitude": 105.8698,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Circle K Tạ Hiện",
        "description": "Cửa hàng tiện lợi 24/7 với đồ ăn nhanh và thực phẩm cơ bản",
        "phone": "024-3926-3355",
        "address": "15 Tạ Hiện, Hàng Buồm, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Hàng Buồm",
        "latitude": 21.0345,
        "longitude": 105.8521,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Chợ Nghĩa Tân",
        "description": "Chợ dân sinh sầm uất với nhiều loại thực phẩm tươi sống và đồ ăn vặt",
        "phone": "024-3756-4466",
        "address": "Nghĩa Tân, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Nghĩa Tân",
        "latitude": 21.0433,
        "longitude": 105.7944,
        "operating_hours": "05:00 - 19:00",
        "status": "active"
    },
    {
        "name": "BRGMart Lạc Long Quân",
        "description": "Siêu thị bán lẻ cung cấp nhu yếu phẩm và thực phẩm tươi",
        "phone": "024-3758-5577",
        "address": "609 Lạc Long Quân, Xuân La, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Xuân La",
        "latitude": 21.0665,
        "longitude": 105.8110,
        "operating_hours": "07:00 - 21:30",
        "status": "active"
    },
    {
        "name": "Tops Market The Garden",
        "description": "Siêu thị cung cấp đa dạng thực phẩm và đồ gia dụng",
        "phone": "024-3787-6688",
        "website": "https://topsmarket.vn",
        "address": "Tầng hầm B1, TTTM The Garden, Mễ Trì, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Mễ Trì",
        "latitude": 21.0142,
        "longitude": 105.7766,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Kim Mã",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống",
        "phone": "024-3722-7799",
        "address": "150 Kim Mã, Kim Mã, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Kim Mã",
        "latitude": 21.0305,
        "longitude": 105.8258,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "TH true mart Cầu Giấy",
        "description": "Cửa hàng chuyên cung cấp sữa tươi sạch và thực phẩm từ sữa",
        "phone": "024-3833-8800",
        "website": "https://thmilk.vn",
        "address": "112 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Quan Hoa",
        "latitude": 21.0311,
        "longitude": 105.8015,
        "operating_hours": "07:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Bác Tôm Phạm Ngọc Thạch",
        "description": "Cửa hàng thực phẩm sạch, đặc sản vùng miền",
        "phone": "024-3574-9911",
        "website": "https://bactom.com",
        "address": "65 Phạm Ngọc Thạch, Kim Liên, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Kim Liên",
        "latitude": 21.0089,
        "longitude": 105.8340,
        "operating_hours": "06:30 - 21:00",
        "status": "active"
    },
    {
        "name": "Co.op Food Thụy Khuê",
        "description": "Chuỗi cửa hàng thực phẩm Co.op Food chất lượng cao",
        "phone": "024-3847-1122",
        "address": "200 Thụy Khuê, Thụy Khuê, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Thụy Khuê",
        "latitude": 21.0435,
        "longitude": 105.8198,
        "operating_hours": "06:30 - 22:00",
        "status": "active"
    },
    {
        "name": "Circle K Láng Hạ",
        "description": "Cửa hàng tiện lợi 24/7 với đồ ăn nhanh và thực phẩm cơ bản",
        "phone": "024-3514-3344",
        "address": "8 Láng Hạ, Thành Công, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Thành Công",
        "latitude": 21.0188,
        "longitude": 105.8145,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Chợ Long Biên",
        "description": "Chợ đầu mối hoa quả và nông sản lớn nhất Hà Nội",
        "phone": "024-3828-5566",
        "address": "Cửa khẩu Phúc Xá, Phúc Xá, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Phúc Xá",
        "latitude": 21.0430,
        "longitude": 105.8475,
        "operating_hours": "22:00 - 06:00",
        "status": "active"
    },
    {
        "name": "Aeon Mall Long Biên",
        "description": "Đại siêu thị Nhật Bản cung cấp đầy đủ mọi mặt hàng",
        "phone": "024-3269-3000",
        "website": "https://aeonmall-long-bien.com.vn",
        "address": "27 Cổ Linh, Long Biên, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Long Biên",
        "latitude": 21.0285,
        "longitude": 105.8992,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Nguyễn Trãi",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống",
        "phone": "024-3552-7788",
        "address": "450 Nguyễn Trãi, Thanh Xuân Trung, Thanh Xuân, Hà Nội",
        "city": "Hà Nội",
        "district": "Thanh Xuân",
        "ward": "Thanh Xuân Trung",
        "latitude": 20.9930,
        "longitude": 105.8030,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Tây Sơn",
        "description": "Siêu thị thực phẩm giá rẻ, rau củ quả tươi mỗi ngày",
        "phone": "024-3857-9900",
        "address": "120 Tây Sơn, Quang Trung, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Quang Trung",
        "latitude": 21.0118,
        "longitude": 105.8266,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "FujiMart Tôn Thất Tùng",
        "description": "Siêu thị tiêu chuẩn Nhật Bản với thực phẩm tươi ngon",
        "phone": "024-3574-1122",
        "address": "1 Tôn Thất Tùng, Trung Tự, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Trung Tự",
        "latitude": 21.0062,
        "longitude": 105.8305,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Homefarm Nguyễn Trãi",
        "description": "Hệ thống bán lẻ thực phẩm nhập khẩu",
        "phone": "024-7108-1008",
        "website": "https://homefarm.vn",
        "address": "Kiot 2, Tòa nhà CT2, Bắc Hà, Nguyễn Trãi, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Trung Văn",
        "latitude": 20.9855,
        "longitude": 105.7923,
        "operating_hours": "07:30 - 21:00",
        "status": "active"
    },
    {
        "name": "Chợ Mơ",
        "description": "Chợ truyền thống lâu đời tại khu vực Hai Bà Trưng",
        "phone": "024-3862-3344",
        "address": "Bạch Mai, Trương Định, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Trương Định",
        "latitude": 20.9994,
        "longitude": 105.8502,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "Circle K Lê Văn Lương",
        "description": "Cửa hàng tiện lợi 24/7 với đồ ăn nhanh và thực phẩm cơ bản",
        "phone": "024-3556-5566",
        "address": "Tầng 1, Tòa nhà 319, Lê Văn Lương, Trung Hoà, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Trung Hoà",
        "latitude": 21.0035,
        "longitude": 105.8010,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Sói Biển Văn Quán",
        "description": "Chuỗi cửa hàng thực phẩm sạch, hải sản tươi sống",
        "phone": "024-3354-7788",
        "address": "A12 Khu đô thị Văn Quán, Phúc La, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Phúc La",
        "latitude": 20.9782,
        "longitude": 105.7905,
        "operating_hours": "06:00 - 21:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Hồ Tùng Mậu",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống",
        "phone": "024-3764-9900",
        "address": "199 Hồ Tùng Mậu, Cầu Diễn, Nam Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Nam Từ Liêm",
        "ward": "Cầu Diễn",
        "latitude": 21.0375,
        "longitude": 105.7660,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Đội Cấn",
        "description": "Siêu thị thực phẩm giá rẻ, rau củ quả tươi mỗi ngày",
        "phone": "024-3722-1122",
        "address": "260 Đội Cấn, Liễu Giai, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Liễu Giai",
        "latitude": 21.0358,
        "longitude": 105.8166,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Lotte Mart Cầu Giấy",
        "description": "Đại siêu thị đa dạng mặt hàng tiêu dùng",
        "phone": "024-3833-3344",
        "address": "Tòa nhà Discovery Complex, 302 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Dịch Vọng",
        "latitude": 21.0355,
        "longitude": 105.7950,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Chợ Ngọc Hà",
        "description": "Chợ truyền thống lâu đời chuyên các loại thực phẩm hàng ngày",
        "phone": "024-3843-5566",
        "address": "Ngọc Hà, Đội Cấn, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Đội Cấn",
        "latitude": 21.0360,
        "longitude": 105.8300,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "Co.op Food Hoàng Hoa Thám",
        "description": "Chuỗi cửa hàng thực phẩm Co.op Food",
        "phone": "024-3728-7788",
        "address": "672 Hoàng Hoa Thám, Bưởi, Tây Hồ, Hà Nội",
        "city": "Hà Nội",
        "district": "Tây Hồ",
        "ward": "Bưởi",
        "latitude": 21.0425,
        "longitude": 105.8122,
        "operating_hours": "06:30 - 22:00",
        "status": "active"
    },
    {
        "name": "BRGMart Lò Đúc",
        "description": "Siêu thị bán lẻ cung cấp nhu yếu phẩm và thực phẩm tươi",
        "phone": "024-3971-9900",
        "address": "76 Lò Đúc, Phạm Đình Hổ, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Phạm Đình Hổ",
        "latitude": 21.0150,
        "longitude": 105.8560,
        "operating_hours": "07:00 - 21:30",
        "status": "active"
    },
    {
        "name": "Circle K Quán Sứ",
        "description": "Cửa hàng tiện lợi 24/7 với đồ ăn nhanh",
        "phone": "024-3822-1122",
        "address": "65 Quán Sứ, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàn Kiếm",
        "ward": "Trần Hưng Đạo",
        "latitude": 21.0255,
        "longitude": 105.8445,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Tomita Mart Ciputra",
        "description": "Siêu thị cao cấp thực phẩm nhập khẩu",
        "phone": "024-3758-3344",
        "website": "https://tomitamart.vn",
        "address": "Khu đô thị Ciputra, Xuân Đỉnh, Bắc Từ Liêm, Hà Nội",
        "city": "Hà Nội",
        "district": "Bắc Từ Liêm",
        "ward": "Xuân Đỉnh",
        "latitude": 21.0711,
        "longitude": 105.7925,
        "operating_hours": "08:00 - 21:30",
        "status": "active"
    },
    {
        "name": "WinMart+ Giải Phóng",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống",
        "phone": "024-3864-5566",
        "address": "800 Giải Phóng, Giáp Bát, Hoàng Mai, Hà Nội",
        "city": "Hà Nội",
        "district": "Hoàng Mai",
        "ward": "Giáp Bát",
        "latitude": 20.9850,
        "longitude": 105.8415,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Bạch Mai",
        "description": "Siêu thị thực phẩm giá rẻ",
        "phone": "024-3622-7788",
        "address": "400 Bạch Mai, Bạch Mai, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Bạch Mai",
        "latitude": 21.0040,
        "longitude": 105.8505,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Chợ Kim Liên",
        "description": "Chợ truyền thống phục vụ khu vực dân cư đông đúc",
        "phone": "024-3852-9900",
        "address": "Lương Định Của, Kim Liên, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Kim Liên",
        "latitude": 21.0065,
        "longitude": 105.8360,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "FujiMart Xã Đàn",
        "description": "Siêu thị tiêu chuẩn Nhật Bản",
        "phone": "024-3573-1122",
        "address": "280 Xã Đàn, Phương Liên, Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "district": "Đống Đa",
        "ward": "Phương Liên",
        "latitude": 21.0110,
        "longitude": 105.8365,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "TH true mart Quang Trung",
        "description": "Cửa hàng sữa tươi và thực phẩm hữu cơ",
        "phone": "024-3352-3344",
        "address": "100 Quang Trung, Quang Trung, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Quang Trung",
        "latitude": 20.9701,
        "longitude": 105.7750,
        "operating_hours": "07:00 - 21:00",
        "status": "active"
    },
    {
        "name": "Circle K Cầu Giấy",
        "description": "Cửa hàng tiện lợi 24/7",
        "phone": "024-3833-5566",
        "address": "260 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "district": "Cầu Giấy",
        "ward": "Quan Hoa",
        "latitude": 21.0335,
        "longitude": 105.7955,
        "operating_hours": "24/7",
        "status": "active"
    },
    {
        "name": "Tops Market Hà Đông",
        "description": "Siêu thị thực phẩm nội địa và nhập khẩu",
        "phone": "024-3382-7788",
        "address": "Hồ Gươm Plaza, Trần Phú, Mộ Lao, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Mộ Lao",
        "latitude": 20.9790,
        "longitude": 105.7865,
        "operating_hours": "08:00 - 22:00",
        "status": "active"
    },
    {
        "name": "WinMart+ Lạc Trung",
        "description": "Siêu thị mini WinMart+ với đầy đủ thực phẩm tươi sống",
        "phone": "024-3987-9900",
        "address": "65 Lạc Trung, Vĩnh Tuy, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Vĩnh Tuy",
        "latitude": 21.0025,
        "longitude": 105.8655,
        "operating_hours": "07:00 - 22:00",
        "status": "active"
    },
    {
        "name": "Bách Hoá Xanh Nguyễn Khoái",
        "description": "Siêu thị thực phẩm giá rẻ",
        "phone": "024-3984-1122",
        "address": "200 Nguyễn Khoái, Thanh Lương, Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "district": "Hai Bà Trưng",
        "ward": "Thanh Lương",
        "latitude": 21.0075,
        "longitude": 105.8690,
        "operating_hours": "06:00 - 22:30",
        "status": "active"
    },
    {
        "name": "Chợ Hà Đông",
        "description": "Khu chợ sầm uất với đa dạng rau củ, thịt cá",
        "phone": "024-3352-3344",
        "address": "Trần Hưng Đạo, Nguyễn Trãi, Hà Đông, Hà Nội",
        "city": "Hà Nội",
        "district": "Hà Đông",
        "ward": "Nguyễn Trãi",
        "latitude": 20.9720,
        "longitude": 105.7735,
        "operating_hours": "05:00 - 18:00",
        "status": "active"
    },
    {
        "name": "Homefarm Đội Cấn",
        "description": "Hệ thống bán lẻ thực phẩm nhập khẩu",
        "phone": "024-3722-5566",
        "address": "205 Đội Cấn, Đội Cấn, Ba Đình, Hà Nội",
        "city": "Hà Nội",
        "district": "Ba Đình",
        "ward": "Đội Cấn",
        "latitude": 21.0350,
        "longitude": 105.8235,
        "operating_hours": "07:30 - 21:00",
        "status": "active"
    },
    {
        "name": "Circle K Nguyễn Văn Cừ",
        "description": "Cửa hàng tiện lợi 24/7",
        "phone": "024-3872-7788",
        "address": "350 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội",
        "city": "Hà Nội",
        "district": "Long Biên",
        "ward": "Bồ Đề",
        "latitude": 21.0450,
        "longitude": 105.8755,
        "operating_hours": "24/7",
        "status": "active"
    }
]


def seed_stores():
    """Insert stores, skip if name already exists."""
    logger.info(f"Seeding {len(STORES)} stores...")

    inserted = 0
    skipped = 0

    for store in STORES:
        # Check existing
        existing = (
            supabase.table("stores")
            .select("id")
            .eq("name", store["name"])
            .execute()
        )
        if existing.data:
            logger.info(f"  SKIP (exists): {store['name']}")
            skipped += 1
            continue

        res = supabase.table("stores").insert(store).execute()
        if res.data:
            logger.info(f"  OK: {store['name']} → id={res.data[0]['id']}")
            inserted += 1
        else:
            logger.warning(f"  FAIL: {store['name']}")

    logger.info(f"Stores: {inserted} inserted, {skipped} skipped")
    return inserted


def seed_food_mappings():
    """Create store_food_mappings linking stores to random dishes from nutrition_database."""
    logger.info("Seeding store_food_mappings...")

    # Get all stores
    stores_res = supabase.table("stores").select("id, name").execute()
    stores = stores_res.data or []
    if not stores:
        logger.warning("No stores found!")
        return

    # Get dishes from nutrition_database
    dishes_res = (
        supabase.table("nutrition_database")
        .select("stt, dish_name_vi, price_vnd")
        .limit(200)
        .execute()
    )
    dishes = dishes_res.data or []
    if not dishes:
        logger.warning("No dishes found in nutrition_database!")
        return

    logger.info(f"Found {len(stores)} stores and {len(dishes)} dishes")

    inserted = 0
    skipped = 0

    for store in stores:
        # Each store gets 15-40 random dishes
        num_dishes = random.randint(15, min(40, len(dishes)))
        selected = random.sample(dishes, num_dishes)

        for dish in selected:
            # Check existing mapping
            existing = (
                supabase.table("store_food_mappings")
                .select("id")
                .eq("store_id", store["id"])
                .eq("dish_stt", dish["stt"])
                .execute()
            )
            if existing.data:
                skipped += 1
                continue

            # Random price variation ±20% from DB price
            base_price = dish.get("price_vnd") or random.randint(15000, 80000)
            price_variation = random.uniform(0.8, 1.2)
            price_at_store = round(base_price * price_variation / 1000) * 1000  # Round to nearest 1000

            mapping = {
                "store_id": store["id"],
                "dish_stt": dish["stt"],
                "availability": random.random() > 0.1,  # 90% available
                "price_at_store": price_at_store,
                "notes": None,
            }

            try:
                res = supabase.table("store_food_mappings").insert(mapping).execute()
                if res.data:
                    inserted += 1
            except Exception as e:
                logger.debug(f"  Skip duplicate: store={store['name']}, dish={dish['stt']}: {e}")
                skipped += 1

        logger.info(f"  {store['name']}: mapped {num_dishes} dishes")

    logger.info(f"Mappings: {inserted} inserted, {skipped} skipped")

    # Update food_items_count on stores
    logger.info("Updating food_items_count on stores...")
    for store in stores:
        count_res = (
            supabase.table("store_food_mappings")
            .select("id", count="exact")
            .eq("store_id", store["id"])
            .eq("availability", True)
            .execute()
        )
        count = count_res.count or 0
        supabase.table("stores").update({"food_items_count": count}).eq("id", store["id"]).execute()
        logger.info(f"  {store['name']}: {count} items")


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("SEED STORES & FOOD MAPPINGS")
    logger.info("=" * 60)

    seed_stores()
    print()
    seed_food_mappings()

    logger.info("=" * 60)
    logger.info("DONE!")
    logger.info("=" * 60)
