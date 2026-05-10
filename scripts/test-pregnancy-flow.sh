#!/bin/bash
# ==================================================================
# Test script: Kiểm tra luồng tính tuần thai cho Mother & Father
# ==================================================================
# Cách dùng:
#   1. Chạy backend:  cd src/backend && uvicorn main:app --reload --port 8000
#   2. Chạy frontend: cd src/frontend && npm run dev
#   3. Chạy script:   bash scripts/test-pregnancy-flow.sh
# ==================================================================

BACKEND="http://localhost:8000"
FRONTEND="http://localhost:3000"

MOTHER_EMAIL="aleyychu184@gmai.com"
FATHER_EMAIL="thongphil18@gmail.com"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       TEST LUỒNG TÍNH TUẦN THAI - MOTHER & FATHER          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ---------------------------------------------------------------
# Bước 0: Tìm user_id từ email (qua Supabase REST)
# ---------------------------------------------------------------
SB_URL="https://mogritedueedwdhzbnbp.supabase.co"
SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vZ3JpdGVkdWVlZHdkaHpibmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzU5MjQsImV4cCI6MjA5MTUxMTkyNH0.JHOXfb467TntUvfag8zJtbx2tRq6d_DvT9iuU0brCh8"

echo "▶ Bước 0: Tìm user_id từ Supabase..."
MOTHER_ID=$(curl -s "$SB_URL/rest/v1/users?email=eq.$MOTHER_EMAIL&select=id" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" 2>/dev/null \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)

FATHER_ID=$(curl -s "$SB_URL/rest/v1/users?email=eq.$FATHER_EMAIL&select=id" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" 2>/dev/null \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null)

if [ -z "$MOTHER_ID" ]; then
  echo "  ⚠ Không tìm thấy mother. Nhập MOTHER_ID (UUID):"
  read -r MOTHER_ID
fi
if [ -z "$FATHER_ID" ]; then
  echo "  ⚠ Không tìm thấy father. Nhập FATHER_ID (UUID):"
  read -r FATHER_ID
fi

echo "  ✓ Mother ID: $MOTHER_ID"
echo "  ✓ Father ID: $FATHER_ID"
echo ""

# ---------------------------------------------------------------
# Bước 1: Kiểm tra babies API (Backend) — enrich_baby()
# ---------------------------------------------------------------
echo "═══════════════════════════════════════════════════════════════"
echo "▶ Bước 1: Backend /api/babies/ — enrich_baby()"
echo "  Kỳ vọng: cả Mother + Father đều có gestation_weeks, days_in_week, due_date"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "  [MOTHER] GET $BACKEND/api/babies/?user_id=$MOTHER_ID"
MOTHER_BABIES=$(curl -s "$BACKEND/api/babies/?user_id=$MOTHER_ID" 2>/dev/null)
echo "$MOTHER_BABIES" | python3 -c "
import json,sys
data = json.load(sys.stdin)
for b in data.get('babies', []):
    print(f\"    name={b.get('name')}  status={b.get('status')}\")
    print(f\"    gestation_weeks={b.get('gestation_weeks')}  days_in_week={b.get('days_in_week')}\")
    print(f\"    due_date={b.get('due_date', b.get('edd'))}  trimester={b.get('trimester')}\")
    print(f\"    lmp={b.get('lmp')}  edd={b.get('edd')}\")
" 2>/dev/null || echo "  ✗ Lỗi"

echo ""
echo "  [FATHER] GET $BACKEND/api/babies/?user_id=$FATHER_ID"
FATHER_BABIES=$(curl -s "$BACKEND/api/babies/?user_id=$FATHER_ID" 2>/dev/null)
echo "$FATHER_BABIES" | python3 -c "
import json,sys
data = json.load(sys.stdin)
for b in data.get('babies', []):
    print(f\"    name={b.get('name')}  status={b.get('status')}\")
    print(f\"    gestation_weeks={b.get('gestation_weeks')}  days_in_week={b.get('days_in_week')}\")
    print(f\"    due_date={b.get('due_date', b.get('edd'))}  trimester={b.get('trimester')}\")
    print(f\"    lmp={b.get('lmp')}  edd={b.get('edd')}\")
" 2>/dev/null || echo "  ✗ Lỗi"

echo ""

# ---------------------------------------------------------------
# Bước 2: Backend medical-profile/me — partnership lookup
# ---------------------------------------------------------------
echo "═══════════════════════════════════════════════════════════════"
echo "▶ Bước 2: Backend /api/medical-profile/me"
echo "  Kỳ vọng: Bố có week_of_pregnancy, days_in_week, due_date (từ mẹ)"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "  [MOTHER]"
curl -s "$BACKEND/api/medical-profile/me?user_id=$MOTHER_ID" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
p = data.get('profile', {})
print(f\"    pregnancy_status={p.get('pregnancy_status')}\")
print(f\"    week_of_pregnancy={p.get('week_of_pregnancy')}  days_in_week={p.get('days_in_week')}\")
print(f\"    due_date={p.get('due_date')}  trimester={p.get('trimester')}\")
print(f\"    last_menstrual_period={p.get('last_menstrual_period')}\")
" 2>/dev/null || echo "  ✗ Lỗi"

echo ""
echo "  [FATHER]"
curl -s "$BACKEND/api/medical-profile/me?user_id=$FATHER_ID" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
p = data.get('profile', {})
print(f\"    pregnancy_status={p.get('pregnancy_status')}\")
print(f\"    week_of_pregnancy={p.get('week_of_pregnancy')}  days_in_week={p.get('days_in_week')}\")
print(f\"    due_date={p.get('due_date')}  trimester={p.get('trimester')}\")
print(f\"    last_menstrual_period={p.get('last_menstrual_period')}\")
" 2>/dev/null || echo "  ✗ Lỗi"

echo ""

# ---------------------------------------------------------------
# Bước 3: Frontend medical-profile/me — ĐÃ SỬA
# ---------------------------------------------------------------
echo "═══════════════════════════════════════════════════════════════"
echo "▶ Bước 3: Frontend /api/medical-profile/me (ĐÃ SỬA partnership lookup)"
echo "  Kỳ vọng: Bố PHẢI có week_of_pregnancy, days_in_week, due_date"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "  [MOTHER]"
curl -s "$FRONTEND/api/medical-profile/me?user_id=$MOTHER_ID" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
p = data.get('profile', {})
print(f\"    pregnancy_status={p.get('pregnancy_status')}\")
print(f\"    week_of_pregnancy={p.get('week_of_pregnancy')}  days_in_week={p.get('days_in_week')}\")
print(f\"    due_date={p.get('due_date')}  trimester={p.get('trimester')}\")
print(f\"    last_menstrual_period={p.get('last_menstrual_period')}\")
" 2>/dev/null || echo "  ✗ Frontend chưa chạy (npm run dev)"

echo ""
echo "  [FATHER]"
curl -s "$FRONTEND/api/medical-profile/me?user_id=$FATHER_ID" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
p = data.get('profile', {})
print(f\"    pregnancy_status={p.get('pregnancy_status')}\")
print(f\"    week_of_pregnancy={p.get('week_of_pregnancy')}  days_in_week={p.get('days_in_week')}\")
print(f\"    due_date={p.get('due_date')}  trimester={p.get('trimester')}\")
print(f\"    last_menstrual_period={p.get('last_menstrual_period')}\")
" 2>/dev/null || echo "  ✗ Frontend chưa chạy (npm run dev)"

echo ""

# ---------------------------------------------------------------
# Bước 4: Kiểm tra partnership
# ---------------------------------------------------------------
echo "═══════════════════════════════════════════════════════════════"
echo "▶ Bước 4: Partnership Mother ↔ Father"
echo "═══════════════════════════════════════════════════════════════"

curl -s "$SB_URL/rest/v1/partnerships?or=(mother_id.eq.$MOTHER_ID,father_id.eq.$FATHER_ID)&status=eq.accepted&select=id,mother_id,father_id,status" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
if data:
    for p in data:
        print(f\"  ✓ Partnership: mother={p['mother_id'][:8]}... father={p['father_id'][:8]}... status={p['status']}\")
else:
    print('  ✗ Không tìm thấy partnership accepted!')
    print('    → Đây là nguyên nhân bố không thấy tuần thai.')
    print('    → Cần kết nối bố-mẹ ở trang Profile > Kết nối gia đình')
" 2>/dev/null || echo "  ⚠ Không query được Supabase trực tiếp"

# ---------------------------------------------------------------
# Bước 5: Validation tự động
# ---------------------------------------------------------------
echo "═══════════════════════════════════════════════════════════════"
echo "▶ Bước 5: VALIDATION TỰ ĐỘNG"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0

# Validate Mother — Backend babies API
M_BABY_WEEKS=$(echo "$MOTHER_BABIES" | python3 -c "
import json,sys
data = json.load(sys.stdin)
for b in data.get('babies', []):
    if b.get('status') == 'pregnant':
        print(b.get('gestation_weeks', 'NONE'))
        break
" 2>/dev/null)

M_BABY_DAYS=$(echo "$MOTHER_BABIES" | python3 -c "
import json,sys
data = json.load(sys.stdin)
for b in data.get('babies', []):
    if b.get('status') == 'pregnant':
        print(b.get('days_in_week', 'NONE'))
        break
" 2>/dev/null)

if [ -n "$M_BABY_WEEKS" ] && [ "$M_BABY_WEEKS" != "NONE" ] && [ "$M_BABY_WEEKS" != "None" ]; then
  echo "  ✅ Mother babies: gestation_weeks=$M_BABY_WEEKS"
  PASS=$((PASS+1))
else
  echo "  ❌ Mother babies: gestation_weeks THIẾU"
  FAIL=$((FAIL+1))
fi

if [ -n "$M_BABY_DAYS" ] && [ "$M_BABY_DAYS" != "NONE" ] && [ "$M_BABY_DAYS" != "None" ]; then
  echo "  ✅ Mother babies: days_in_week=$M_BABY_DAYS"
  PASS=$((PASS+1))
else
  echo "  ❌ Mother babies: days_in_week THIẾU"
  FAIL=$((FAIL+1))
fi

# Validate Father — Backend babies API (phải thấy baby của mẹ)
F_BABY_COUNT=$(echo "$FATHER_BABIES" | python3 -c "
import json,sys
data = json.load(sys.stdin)
print(len(data.get('babies', [])))
" 2>/dev/null)

if [ -n "$F_BABY_COUNT" ] && [ "$F_BABY_COUNT" != "0" ]; then
  echo "  ✅ Father babies: thấy $F_BABY_COUNT baby(s)"
  PASS=$((PASS+1))
else
  echo "  ❌ Father babies: KHÔNG THẤY baby nào!"
  FAIL=$((FAIL+1))
fi

# Validate Father — Medical profile (phải có week_of_pregnancy)
F_MED_WEEKS=$(curl -s "$FRONTEND/api/medical-profile/me?user_id=$FATHER_ID" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
p = data.get('profile', {})
print(p.get('week_of_pregnancy', 'NONE'))
" 2>/dev/null)

F_MED_DAYS=$(curl -s "$FRONTEND/api/medical-profile/me?user_id=$FATHER_ID" 2>/dev/null | python3 -c "
import json,sys
data = json.load(sys.stdin)
p = data.get('profile', {})
print(p.get('days_in_week', 'NONE'))
" 2>/dev/null)

if [ -n "$F_MED_WEEKS" ] && [ "$F_MED_WEEKS" != "NONE" ] && [ "$F_MED_WEEKS" != "None" ]; then
  echo "  ✅ Father medical-profile: week_of_pregnancy=$F_MED_WEEKS"
  PASS=$((PASS+1))
else
  echo "  ❌ Father medical-profile: week_of_pregnancy THIẾU (cần partnership)"
  FAIL=$((FAIL+1))
fi

if [ -n "$F_MED_DAYS" ] && [ "$F_MED_DAYS" != "NONE" ] && [ "$F_MED_DAYS" != "None" ]; then
  echo "  ✅ Father medical-profile: days_in_week=$F_MED_DAYS"
  PASS=$((PASS+1))
else
  echo "  ❌ Father medical-profile: days_in_week THIẾU"
  FAIL=$((FAIL+1))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "▶ KẾT QUẢ: $PASS passed / $FAIL failed"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "  🎉 TẤT CẢ CÁC TEST PASSED!"
else
  echo "  ⚠ CÓ $FAIL TEST FAILED. Kiểm tra:"
  echo "    1. Partnership có status='accepted'?"
  echo "    2. Mother có last_menstrual_period hoặc due_date?"
  echo "    3. Father có medical_profile?"
  echo "    4. Backend + Frontend đều đang chạy?"
fi
echo ""
