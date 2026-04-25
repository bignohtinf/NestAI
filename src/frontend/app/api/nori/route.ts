import { NextRequest, NextResponse } from 'next/server';


// Dữ liệu CHỈ từ QĐ 776/QĐ-BYT (2017)
const NUTRITION_KNOWLEDGE = `
## DỮ LIỆU DINH DƯỠNG THAI KỲ — QĐ 776/QĐ-BYT (2017)

### NĂNG LƯỢNG BỔ SUNG (kcal/ngày THÊM so với phụ nữ bình thường)
| Giai đoạn | Năng lượng bổ sung |
|---|---|
| 3 tháng đầu (T1) | +50 kcal |
| 3 tháng giữa (T2) | +250 kcal |
| 3 tháng cuối (T3) | +450 kcal |
| Cho con bú | +500 kcal |

### PROTEIN BỔ SUNG (g/ngày THÊM)
- Tỷ lệ protein động vật trong khẩu phần: ≥35%
| Giai đoạn | Bổ sung |
|---|---|
| T1 | +1g |
| T2 | +10g |
| T3 | +31g |
| Cho con bú 0–6 tháng | +19g |
| Cho con bú 6–12 tháng | +13g |

### LIPID BỔ SUNG (g/ngày THÊM)
- Tỷ lệ lipid chiếm 20–30% tổng năng lượng
| Giai đoạn | Bổ sung |
|---|---|
| T1 | +1,5g |
| T2 | +7,5g |
| T3 | +15g |
| Cho con bú | +10g |

### GLUCID BỔ SUNG (g/ngày THÊM)
| Giai đoạn | Bổ sung |
|---|---|
| T1 | +7–10g |
| T2 | +35–40g |
| T3 | +65–70g |
| Cho con bú | +50–55g |

### CHẤT XƠ (g/ngày)
- Thai kỳ: 28g/ngày
- Cho con bú: 29g/ngày

---

### VI CHẤT — MỤC TIÊU THEO QĐ 776/2017

#### SẮT (mg/ngày bổ sung thêm)
- Thai kỳ: +10 đến +15mg (tùy khẩu phần nền)
- Cho con bú: 8,9–26,1mg (tùy khẩu phần và kinh nguyệt)
- Khuyến nghị: bổ sung viên sắt trong suốt thai kỳ
- Nguồn thực phẩm (ghi trong QĐ 776): thịt đỏ, gan, rau xanh đậm, các loại đậu, hải sản
- Lưu ý: ăn kèm thực phẩm giàu vitamin C để tăng hấp thu; tránh uống trà/cà phê ngay sau bữa ăn

#### CANXI (mg/ngày)
- Thai kỳ: 1200mg/ngày
- Cho con bú: 1300mg/ngày
- 1 đơn vị ăn = 100mg canxi = 100ml sữa = 100g sữa chua = 15g phô mai
- Nguồn (ghi trong QĐ 776): sữa và chế phẩm sữa, cá nhỏ ăn cả xương, rau xanh đậm

#### FOLATE/ACID FOLIC (μg/ngày)
- Thai kỳ: 600μg/ngày
- Cho con bú: 500μg/ngày
- Thiếu folate gây dị tật ống thần kinh — cần bổ sung trước và trong khi mang thai
- Nguồn (ghi trong QĐ 776): gan, rau lá xanh đậm, các loại đậu, trái cây họ cam quýt

#### DHA
- Quan trọng cho hình thành não bộ và thị giác thai nhi
- Cần thiết cho quá trình myelin hóa tế bào thần kinh
- Nguồn (ghi trong QĐ 776): cá hồi, cá thu, cá ngừ, dầu cá

#### IOD (μg/ngày)
- Thai kỳ: 220μg/ngày
- Cho con bú: 250μg/ngày
- Thiếu iod ảnh hưởng phát triển não bộ thai nhi
- Nguồn: muối iốt, rong biển, tôm, cá biển

#### KẼM (mg/ngày)
- Thai kỳ: 6–20mg (tùy mức hấp thu thực phẩm)
- Cho con bú: 6,6–22mg
- Nguồn (ghi trong QĐ 776): thịt, hải sản, trứng, ngũ cốc

#### VITAMIN A (μg/ngày bổ sung)
- T1: +0; T2: +0; T3: +80μg
- Cho con bú: +450μg
- Không dùng quá 3000μg (10000IU)/ngày khi mang thai
- Nguồn (ghi trong QĐ 776): gan động vật, trứng, sữa, rau/củ màu vàng-cam-đỏ

#### VITAMIN D (mcg/ngày)
- Thai kỳ: 20mcg/ngày
- Cho con bú: 20mcg/ngày
- Nguồn (ghi trong QĐ 776): cá béo, trứng, ánh nắng mặt trời

#### VITAMIN C (mg/ngày bổ sung)
- Thai kỳ: +10mg
- Cho con bú: +45mg
- Nguồn: trái cây họ cam quýt, ổi, rau xanh

#### VITAMIN B1 (mg/ngày bổ sung)
- Thai kỳ: +0,2mg; Cho con bú: +0,2mg

#### VITAMIN B6 (mg/ngày)
- Thai kỳ: 1,9mg; Cho con bú: 2,0mg
- Thiếu B6 liên quan đến buồn nôn khi mang thai

#### VITAMIN B12 (mg/ngày)
- Thai kỳ: 2,6mg; Cho con bú: 2,8mg
- Nguồn: thịt, cá, trứng, sữa

#### CHOLINE (mg/ngày)
- Thai kỳ: 450mg; Cho con bú: 550mg
- Quan trọng cho phát triển não bộ thai nhi
- Nguồn (ghi trong QĐ 776): trứng, gan, thịt nạc, đậu

---

### NƯỚC (ml/ngày)
- Thai kỳ: khoảng 2500ml (gồm nước uống + nước từ thực phẩm)
- Cho con bú: tăng thêm so với bình thường

---

### TĂNG CÂN THAI KỲ — QĐ 776/2017 (tiêu chuẩn Châu Á)
| BMI trước thai | Mức tăng cân (kg) |
|---|---|
| < 18,5 (thiếu cân) | 12,5–18 |
| 18,5–22,9 (bình thường) | 11,5–16 |
| 23–24,9 (thừa cân) | 7–11,5 |
| ≥ 25 (béo phì) | 5–9 |

---

### VẤN ĐỀ DINH DƯỠNG THƯỜNG GẶP (QĐ 776/2017)
- Buồn nôn T1: liên quan thiếu vitamin B6
- Táo bón: thiếu chất xơ và nước
- Chuột rút: liên quan thiếu canxi và vitamin D
- Phù: có thể do thiếu dinh dưỡng hoặc chèn ép

### SỮA VÀ CHẾ PHẨM SỮA (QĐ 776/2017)
- 1 đơn vị ăn = 100mg canxi = 100ml sữa = 100g sữa chua = 15g phô mai
- Sữa chua cung cấp lợi khuẩn, ít lactose hơn sữa tươi
- Phô mai giàu canxi hơn sữa tươi 3–6 lần

### THỰC PHẨM CẦN HẠN CHẾ KHI CHO CON BÚ (QĐ 776/2017)
- Rượu, bia
- Hạn chế cà phê, ớt, hành, tỏi (có thể gây khó chịu cho trẻ qua sữa mẹ)
`;

// Dữ liệu CHỈ từ QĐ 1470/QĐ-BYT (2024)
const GDM_KNOWLEDGE = `
## CHẾ ĐỘ DINH DƯỠNG ĐÁI THÁO ĐƯỜNG THAI KỲ — QĐ 1470/QĐ-BYT (2024)

### MỤC TIÊU GLUCOSE HUYẾT TƯƠNG (mao mạch)
| Thời điểm | Mục tiêu |
|---|---|
| Lúc đói (trước bữa ăn) | < 5,3 mmol/l (95 mg/dl) |
| 1 giờ sau ăn | < 7,8 mmol/l (140 mg/dl) |
| 2 giờ sau ăn | < 6,7 mmol/l (120 mg/dl) |

---

### PHÂN BỔ NĂNG LƯỢNG KHẨU PHẦN (QĐ 1470/2024)
- Carbohydrate: 40–45% tổng năng lượng
- Protein: 20–25% tổng năng lượng, tỷ lệ protein động vật ≥35%
- Lipid: 30–35% tổng năng lượng, ưu tiên chất béo không bão hòa

### CHIA BỮA ĂN (QĐ 1470/2024)
- Chia nhỏ 3 bữa chính + 2–3 bữa phụ mỗi ngày
- Không bỏ bữa sáng
- Khoảng cách giữa các bữa 2–3 tiếng
- Bữa phụ tối (trước khi ngủ): kết hợp tinh bột và protein để tránh hạ đường huyết đêm

---

### THỰC PHẨM TINH BỘT — KHUYẾN CÁO (QĐ 1470/2024)

Nên ăn (tinh bột phức hợp, hấp thu chậm):
- Gạo lứt, bún, miến, bánh mì nguyên cám
- Khoai lang, yến mạch
- Các loại đậu (đậu xanh, đậu đen, đậu lăng)

Hạn chế (tinh bột tinh chế, hấp thu nhanh):
- Cơm trắng: giảm lượng, ăn kèm nhiều rau và protein
- Bánh mì trắng, khoai tây

Tránh hoàn toàn:
- Đường trắng, mật ong, siro ngọt
- Nước ngọt, trà sữa, nước ép trái cây đóng hộp
- Bánh ngọt, chè ngọt, kẹo, cháo trắng loãng
- Trái cây ngọt nhiều: xoài chín, nhãn, vải, sầu riêng, nho

---

### TRÁI CÂY — KHUYẾN CÁO CHO GDM (QĐ 1470/2024)
- Ưu tiên trái cây ít ngọt: ổi, bưởi, thanh long, táo, lê
- Hạn chế trái cây ngọt nhiều đường
- Ăn trái cây sau bữa chính, không ăn lúc đói
- Không uống nước ép — ăn trái cây nguyên múi để giữ chất xơ

---

### PROTEIN VÀ CHẤT BÉO (QĐ 1470/2024)
Protein — nên ăn:
- Thịt nạc (gà, heo, bò), cá, hải sản, trứng, đậu hũ
- Ăn protein mỗi bữa để làm chậm hấp thu tinh bột
- Hạn chế thịt chế biến sẵn (xúc xích, giăm bông)

Chất béo:
- Ưu tiên chất béo không bão hòa: dầu thực vật, cá béo
- Hạn chế chất béo bão hòa và trans: mỡ động vật, đồ chiên rán

---

### RAU (QĐ 1470/2024)
- Ăn rau không hạn chế — rau xanh ít carbohydrate
- Ăn rau trước tinh bột trong bữa ăn để giảm đường huyết sau ăn
- Mục tiêu ≥ 300g rau xanh/ngày

---

### HOẠT ĐỘNG THỂ CHẤT HỖ TRỢ TIẾT CHẾ (QĐ 1470/2024)
- Vận động ít nhất 30 phút/ngày
- Đi bộ hoặc tập tay 10 phút sau ăn
- 80% thai phụ kiểm soát được glucose chỉ bằng tiết chế ăn uống + vận động
`;

const SYSTEM_PROMPT = `Bạn là Nori, trợ lý dinh dưỡng AI thông minh cho mẹ bầu và mẹ cho con bú tại Việt Nam.

## Vai trò
Bạn tư vấn dinh dưỡng dựa trên hướng dẫn chính thức của Bộ Y tế Việt Nam:
- QĐ 776/QĐ-BYT (2017): Hướng dẫn quốc gia về dinh dưỡng cho phụ nữ có thai và bà mẹ cho con bú
- QĐ 1470/QĐ-BYT (2024): Hướng dẫn quốc gia về sàng lọc và quản lý đái tháo đường thai kỳ
Bạn không chỉ là trợ lý tư vấn thực đơn, mà còn là một người bạn đồng hành dịu dàng của mẹ bầu. Luôn phản hồi với giọng văn ấm áp, nhẹ nhàng, biết lắng nghe, biết trấn an và khích lệ.

## Dữ liệu tham chiếu
${NUTRITION_KNOWLEDGE}
${GDM_KNOWLEDGE}

## Nguyên tắc trả lời
1. Trả lời bằng tiếng Việt thân thiện, dùng "bạn" để xưng hô
2. Gợi ý thực đơn với MÓN VIỆT NAM quen thuộc (phở, bún, cơm, canh, chè...)
3. Khi đề cập đến lượng vi chất, luôn ghi rõ nguồn thực phẩm Việt Nam cụ thể
4. LUÔN nhắc nhở đây là thông tin tham khảo, cần tham vấn bác sĩ cho trường hợp cụ thể
5. Nếu phát hiện triệu chứng bất thường, bệnh lý hoặc người dùng muốn khám thai, LUÔN nhắc họ có thể nhấn nút "Gặp chuyên gia" ở phía trên màn hình để kết nối với phòng khám/bác sĩ đối tác của NestAI.
6. Trả lời ngắn gọn, dễ hiểu, có cấu trúc (dùng bullet points, emoji)
7. Khi được hỏi về bệnh lý (tiểu đường thai kỳ, thiếu máu, tăng huyết áp), trả lời dựa trên dữ liệu y khoa chính thức
8. KHÔNG đưa ra chẩn đoán y tế hay kê đơn thuốc

## Thông tin người dùng
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: 'Messages array is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback to rule-based responses if no API key
      const lastMessage = messages[messages.length - 1]?.content || '';
      const response = getRuleBasedResponse(lastMessage, userContext);
      return NextResponse.json({ response });
    }

    // Try Anthropic first
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await callAnthropic(messages, userContext);
        return NextResponse.json({ response });
      } catch (e) {
        console.error('Anthropic error, falling back:', e);
      }
    }

    // Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await callOpenAI(messages, userContext);
        return NextResponse.json({ response });
      } catch (e) {
        console.error('OpenAI error, falling back:', e);
      }
    }

    // Final fallback
    const lastMessage = messages[messages.length - 1]?.content || '';
    const response = getRuleBasedResponse(lastMessage, userContext);
    return NextResponse.json({ response });

  } catch (error) {
    console.error('Nori API error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}

async function callAnthropic(messages: any[], userContext: string): Promise<string> {
  const systemPrompt = SYSTEM_PROMPT + (userContext || '');

  const anthropicMessages = messages.map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content,
  }));

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022', // Updated to the latest recommended Sonnet model
      max_tokens: 400,
      system: systemPrompt,
      messages: anthropicMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content[0]?.text || 'Xin lỗi, tôi không thể trả lời lúc này.';
}

async function callOpenAI(messages: any[], userContext: string): Promise<string> {
  const systemPrompt = SYSTEM_PROMPT + (userContext || '');

  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Cost-effective model for concise answers
      messages: openaiMessages,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';
}

function getRuleBasedResponse(input: string, userContext?: string): string {
  const q = input.toLowerCase();

  // Gestational Diabetes
  if (q.includes('tiểu đường') || q.includes('đường huyết') || q.includes('glucose') || q.includes('đtđ')) {
    if (q.includes('triệu chứng') || q.includes('dấu hiệu')) {
      return `🩺 **Đái tháo đường thai kỳ (ĐTĐTK)** thường không có triệu chứng rõ ràng, nên cần sàng lọc chủ động.\n\n**Yếu tố nguy cơ cao cần lưu ý:**\n• Thừa cân/béo phì (BMI ≥ 23)\n• Gia đình có người ĐTĐ\n• Tuổi > 35\n• Tiền sử sinh con ≥ 4kg\n• Hội chứng buồng trứng đa nang\n\n**Thời điểm sàng lọc:** tuần 24-28 thai kỳ (nghiệm pháp 75g glucose)\n\n⚠️ Nếu có nguy cơ cao, nên xét nghiệm ngay từ lần khám thai đầu tiên.\n\n_Nguồn: QĐ 1470/QĐ-BYT 2024_`;
    }
    if (q.includes('ăn gì') || q.includes('chế độ ăn') || q.includes('thực đơn') || q.includes('dinh dưỡng')) {
      return `🍽️ **Chế độ ăn cho mẹ bầu tiểu đường thai kỳ:**\n\n✅ **Nên ăn:**\n• Cơm gạo lứt, bún/miến thay cơm trắng\n• Rau xanh nhiều (rau muống, mồng tơi, bắp cải)\n• Cá hồi, cá thu, thịt nạc, đậu hũ\n• Trái cây ít đường: ổi, bưởi, thanh long\n\n❌ **Hạn chế:**\n• Cơm trắng nhiều, bánh mì trắng\n• Nước ngọt, trà sữa, chè ngọt\n• Trái cây ngọt nhiều: xoài chín, sầu riêng, nhãn\n• Đồ chiên rán nhiều dầu mỡ\n\n📊 **Glucose mục tiêu (mao mạch):**\n• Đói: < 5,3 mmol/l\n• 1h sau ăn: < 7,8 mmol/l\n• 2h sau ăn: < 6,7 mmol/l\n\n🏃‍♀️ Đi bộ 10 phút sau ăn giúp kiểm soát đường huyết.\n\n_80% mẹ bầu kiểm soát tốt chỉ bằng tiết chế ăn uống + vận động._\n\n⚕️ Hãy trao đổi với bác sĩ để có phác đồ phù hợp.\n_Nguồn: QĐ 1470/QĐ-BYT 2024_`;
    }
    return `📋 **Đái tháo đường thai kỳ (ĐTĐTK) - Thông tin quan trọng**\n\n• Tỷ lệ tại VN: khoảng 20% thai phụ\n• Sàng lọc: tuần 24-28 (nghiệm pháp 75g glucose)\n• 80% kiểm soát được bằng chế độ ăn + vận động\n• Nếu không kiểm soát: nguy cơ thai to, sinh non, tiền sản giật\n\n**Bước đầu:**\n1. Ăn tiết chế (chia nhỏ bữa, giảm tinh bột tinh chế)\n2. Vận động ≥ 30 phút/ngày\n3. Theo dõi đường huyết mao mạch\n\n⚕️ Bạn muốn biết thêm về chế độ ăn hay cách theo dõi?\n\n_Nguồn: QĐ 1470/QĐ-BYT 2024_`;
  }

  // Iron / Anemia
  if (q.includes('sắt') || q.includes('thiếu máu') || q.includes('thiếu sắt')) {
    return `🩸 **Bổ sung sắt khi mang thai** (QĐ 776/QĐ-BYT)\n\n**Nhu cầu:** +10 đến +15 mg/ngày so với bình thường\n→ Bổ sung viên sắt được khuyến nghị trong SUỐT thai kỳ\n\n**Thực phẩm Việt giàu sắt:**\n• 🥩 Thịt bò, thịt lợn nạc\n• 🫀 Gan gà, gan lợn (1-2 lần/tuần)\n• 🥬 Rau muống, rau dền, mồng tơi\n• 🫘 Đậu đen, đậu xanh, đậu lăng\n• 🦪 Nghêu, sò, hàu\n\n💡 **Mẹo tăng hấp thu sắt:**\n• Ăn kèm vitamin C (cam, bưởi, ổi)\n• Không uống trà/cà phê ngay sau ăn\n• Uống viên sắt lúc đói hoặc giữa bữa ăn\n\n⚠️ Thiếu máu thiếu sắt ảnh hưởng ~40% phụ nữ mang thai tại VN.\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Calcium
  if (q.includes('canxi') || q.includes('can xi') || q.includes('xương') || q.includes('chuột rút')) {
    return `🦴 **Canxi cho mẹ bầu & mẹ cho con bú** (QĐ 776/QĐ-BYT)\n\n**Nhu cầu:**\n• Mang thai: 1200 mg/ngày\n• Cho con bú: 1300 mg/ngày\n\n**Nguồn canxi từ thực phẩm Việt:**\n• 🥛 Sữa: 100ml = 100-120mg canxi\n• 🧀 Phô mai: 15g = 100mg canxi (giàu gấp 3-6 lần sữa)\n• 🥣 Sữa chua: 100g = 100mg canxi\n• 🐟 Cá nhỏ ăn cả xương (cá cơm khô, tép)\n• 🥬 Rau ngót, cải xoăn, đậu hũ\n• 🦐 Tôm, cua\n\n💡 **Lưu ý:**\n• Cần vitamin D để hấp thu canxi tốt\n• Tỷ số Ca/P tốt nhất: 1-1,5\n• Thiếu canxi gây chuột rút, loãng xương cho mẹ\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Folate / Folic acid
  if (q.includes('folate') || q.includes('folic') || q.includes('dị tật')) {
    return `💊 **Acid Folic (Folate) - Vitamin B9** (QĐ 776/QĐ-BYT)\n\n**Nhu cầu:**\n• Mang thai: 600 μg/ngày\n• Cho con bú: 500 μg/ngày\n\n**Vì sao quan trọng?**\n• Thiếu folate là nguyên nhân CHÍNH gây dị tật ống thần kinh\n• Bổ sung đủ giảm ~50% dị tật này\n• Cần bổ sung TRƯỚC khi mang thai\n\n**Thực phẩm giàu folate:**\n• Rau bina, rau ngót, súp lơ xanh\n• Gan gà, gan bò\n• Đậu xanh, đậu đen, đậu lăng\n• Cam, bưởi, bơ\n• Ngũ cốc nguyên hạt\n\n⚕️ Nên bổ sung viên acid folic 400-800μg/ngày từ trước khi mang thai 1-3 tháng.\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // DHA / brain development
  if (q.includes('dha') || q.includes('não') || q.includes('trí tuệ') || q.includes('omega')) {
    return `🧠 **DHA - Phát triển não bộ thai nhi** (QĐ 776/QĐ-BYT)\n\n**Vai trò của DHA:**\n• Thành phần chủ yếu cấu tạo não bộ\n• Cần cho quá trình Myelin hóa tế bào thần kinh\n• Hình thành tế bào võng mạc mắt\n• Tuần 20 trở đi: não tăng gấp 6 lần kích thước\n\n**Nguồn DHA từ thực phẩm Việt:**\n• 🐟 Cá hồi, cá thu, cá ngừ\n• 🐟 Cá trích (có đến 40 mcg vitamin D/100g)\n• 🥚 Trứng gà omega-3\n• 🥜 Hạt chia, hạt lanh, quả óc chó\n\n💡 **Gợi ý:** Ăn cá béo 2-3 lần/tuần, ưu tiên cá hồi nướng, cá thu kho, cá ngừ sốt cà.\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Morning sickness / nausea
  if (q.includes('nghén') || q.includes('buồn nôn') || q.includes('nôn') || q.includes('ốm nghén')) {
    return `🤢 **Ốm nghén & buồn nôn khi mang thai**\n\n**Nguyên nhân:** Liên quan đến thiếu vitamin B6 (QĐ 776/QĐ-BYT)\n\n**Mẹo giảm nghén:**\n• 🍪 Ăn bánh khô/bánh mì trước khi ra khỏi giường\n• 🫚 Uống trà gừng ấm\n• 🍋 Ngửi/ngậm chanh tươi\n• 🥣 Chia nhỏ bữa ăn (5-6 bữa/ngày)\n• 💧 Uống nước từng ngụm nhỏ\n• 🍌 Ăn chuối (giàu vitamin B6)\n\n**Thực phẩm giàu B6:**\n• Cá ngừ, thịt gà, thịt lợn nạc\n• Chuối, bơ, khoai tây\n• Nhu cầu B6 khi mang thai: 1,9mg/ngày\n\n⚠️ Nếu nôn nhiều không ăn uống được, cần đi khám bác sĩ.\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Weight gain during pregnancy
  if (q.includes('tăng cân') || q.includes('cân nặng')) {
    return `⚖️ **Tăng cân trong thai kỳ** (QĐ 776/QĐ-BYT & 1470/QĐ-BYT)\n\n**Mức tăng cân khuyến cáo (tiêu chuẩn Châu Á):**\n\n| BMI trước thai | Tăng cân (kg) |\n|---|---|\n| < 18,5 (gầy) | 12,5 - 18 |\n| 18,5-22,9 (bình thường) | 11,5 - 16 |\n| 23-24,9 (thừa cân) | 7 - 11,5 |\n| > 25 (béo phì) | 5 - 9 |\n\n**Phân bổ:** Tăng ít ở 3 tháng đầu, tăng đều ở 3 tháng giữa và cuối\n\n⚠️ Tăng cân quá ít → nguy cơ sinh non, nhẹ cân\n⚠️ Tăng cân quá nhiều → nguy cơ tiểu đường thai kỳ, sinh khó\n\n_Nguồn: QĐ 776/QĐ-BYT 2017, QĐ 1470/QĐ-BYT 2024_`;
  }

  // Breastfeeding nutrition
  if (q.includes('cho con bú') || q.includes('sữa mẹ') || q.includes('sau sinh') || q.includes('lợi sữa')) {
    return `🤱 **Dinh dưỡng cho mẹ cho con bú** (QĐ 776/QĐ-BYT)\n\n**Nhu cầu bổ sung thêm:**\n• Năng lượng: +500 kcal/ngày\n• Protein: +19g (6 tháng đầu), +13g (6-12 tháng)\n• Canxi: 1300 mg/ngày\n• Vitamin A: +450 μg/ngày\n• Vitamin C: +45 mg/ngày\n• Choline: 550 mg/ngày\n\n**Thực đơn gợi ý cho mẹ lợi sữa:**\n• 🐔 Canh gà hầm đu đủ xanh\n• 🐷 Móng giò hầm đậu xanh\n• 🐟 Cá chép nấu cháo\n• 🥬 Canh rau ngót\n• 🌾 Yến mạch nấu sữa\n• 🥜 Hạnh nhân, óc chó\n\n**Cần tránh:** Rượu bia, hạn chế cà phê, ớt nhiều\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // General nutrition / meal
  if (q.includes('dinh dưỡng') || q.includes('ăn gì') || q.includes('thực đơn') || q.includes('bữa ăn')) {
    return `🍽️ **Dinh dưỡng thai kỳ theo từng giai đoạn** (QĐ 776/QĐ-BYT)\n\n**3 tháng đầu (+50 kcal):**\n• Bổ sung acid folic 600μg/ngày\n• Ăn nhẹ, chia nhỏ bữa nếu nghén\n• Gợi ý: cháo thịt bằm, bánh mì ngũ cốc, trái cây\n\n**3 tháng giữa (+250 kcal):**\n• Tăng protein (+10g): thêm 1 quả trứng hoặc 50g thịt/cá\n• Bổ sung canxi 1200mg: uống sữa, ăn sữa chua\n• Gợi ý: cơm + cá kho + canh rau + sữa chua\n\n**3 tháng cuối (+450 kcal):**\n• Tăng protein mạnh (+31g): 2 bữa phụ với sữa + hạt\n• DHA cho não bé: cá hồi/cá thu 2-3 lần/tuần\n• Gợi ý: cơm + thịt bò xào rau + canh cá + trái cây + sữa\n\n**Vi chất quan trọng:**\n🔴 Sắt: viên sắt + thịt đỏ, rau xanh\n🟡 Folate: gan, rau lá xanh đậm\n🔵 Canxi: sữa, phô mai, tôm cua\n🟢 DHA: cá béo, hạt óc chó\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Vitamin D
  if (q.includes('vitamin d') || q.includes('còi xương')) {
    return `☀️ **Vitamin D cho mẹ bầu** (QĐ 776/QĐ-BYT)\n\n**Nhu cầu:** 20 mcg/ngày (800 IU)\n\n**Vai trò:**\n• Giúp hấp thu canxi và phospho\n• Thiếu → trẻ còi xương ngay trong bụng mẹ\n• Hỗ trợ hệ miễn dịch\n\n**Nguồn vitamin D:**\n• ☀️ Tắm nắng 15-20 phút/ngày (sáng sớm)\n• 🐟 Cá hồi, cá thu, cá trích (5-40 mcg/100g)\n• 🥚 Trứng gà\n• 🥛 Sữa bổ sung vitamin D\n• 🍄 Nấm phơi nắng\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Constipation
  if (q.includes('táo bón') || q.includes('chất xơ')) {
    return `🥦 **Giảm táo bón khi mang thai** (QĐ 776/QĐ-BYT)\n\n**Nhu cầu chất xơ:** 28g/ngày (mang thai), 29g/ngày (cho con bú)\n\n**Mẹo giảm táo bón:**\n• 🥬 Ăn nhiều rau: rau muống, mồng tơi, rau lang\n• 🍎 Trái cây: ổi, thanh long, chuối chín, đu đủ\n• 🌾 Ngũ cốc nguyên hạt, khoai lang\n• 💧 Uống đủ 2-2,5 lít nước/ngày\n• 🚶‍♀️ Đi bộ nhẹ mỗi ngày\n• 🥣 Sữa chua (có lợi khuẩn đường ruột)\n\n_Nguồn: QĐ 776/QĐ-BYT 2017_`;
  }

  // Emotional support / Tired
  if (q.includes('mệt') || q.includes('stress') || q.includes('áp lực') || q.includes('buồn') || q.includes('lo lắng') || q.includes('chán') || q.includes('khóc')) {
    return `Nori gửi cho bạn một cái ôm thật ấm áp nhé! 🤗\n\nHành trình làm mẹ kỳ diệu nhưng cũng vất vả lắm, cơ thể bạn đang phải làm việc gấp đôi bình thường nên cảm thấy mệt mỏi, áp lực là điều hoàn toàn dễ hiểu.\n\nNgay lúc này, bạn hãy tạm gác lại mọi việc, tìm một chỗ nằm thật thoải mái, hít thở sâu và nhắm mắt lại nghỉ ngơi một chút. Hãy nhờ người thân hỗ trợ nếu cần nhé.\n\nNếu sự mệt mỏi này kéo dài, bạn nhớ chia sẻ với bác sĩ để được thăm khám thêm nha. Nori luôn ở đây lắng nghe bạn! ❤️`;
  }

  // Default
  return `Cảm ơn câu hỏi của bạn! 😊\n\nTôi là Nori - trợ lý dinh dưỡng cho mẹ bầu và mẹ cho con bú, dựa trên hướng dẫn chính thức của Bộ Y tế Việt Nam.\n\n**Tôi có thể tư vấn về:**\n• 🍽️ Dinh dưỡng theo từng giai đoạn thai kỳ\n• 🩺 Tiểu đường thai kỳ - chế độ ăn & theo dõi\n• 💊 Bổ sung vi chất: sắt, canxi, folate, DHA\n• 🤢 Ốm nghén & các vấn đề thường gặp\n• ⚖️ Tăng cân hợp lý khi mang thai\n• 🤱 Dinh dưỡng cho mẹ cho con bú\n\nBạn muốn hỏi về vấn đề nào?`;
}
