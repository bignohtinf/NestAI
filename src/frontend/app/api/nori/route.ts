import { NextRequest, NextResponse } from 'next/server';

// Vietnamese MOH nutrition knowledge base for pregnant/breastfeeding women
// Sourced from QD 776/QD-BYT (2017) and QD 1470/QD-BYT (2024)
const NUTRITION_KNOWLEDGE = `
## KIẾN THỨC DINH DƯỠNG THAI KỲ VÀ CHO CON BÚ (Bộ Y tế Việt Nam)

### NHU CẦU NĂNG LƯỢNG (kcal/ngày bổ sung thêm so với bình thường)
- 3 tháng đầu: +50 kcal
- 3 tháng giữa: +250 kcal
- 3 tháng cuối: +450 kcal
- Cho con bú: +500 kcal

### NHU CẦU PROTEIN (g/ngày bổ sung thêm)
- 3 tháng đầu: +1g, tỷ lệ protein động vật ≥35%
- 3 tháng giữa: +10g, tỷ lệ protein động vật ≥35%
- 3 tháng cuối: +31g, tỷ lệ protein động vật ≥35%
- Cho con bú 6 tháng đầu: +19g
- Cho con bú 6-12 tháng: +13g

### NHU CẦU LIPID (g/ngày bổ sung thêm)
- 3 tháng đầu: +1,5g
- 3 tháng giữa: +7,5g
- 3 tháng cuối: +15g
- Cho con bú: +10g
- Tỷ lệ lipid: 20-30% năng lượng tổng số

### NHU CẦU GLUCID (g/ngày bổ sung thêm)
- 3 tháng đầu: +7-10g
- 3 tháng giữa: +35-40g
- 3 tháng cuối: +65-70g
- Cho con bú: +50-55g

### NHU CẦU CHẤT XƠ
- Phụ nữ có thai: 28g/ngày
- Cho con bú: 29g/ngày

### CAN XI (mg/ngày)
- Phụ nữ có thai: 1200mg
- Cho con bú: 1300mg
- Nguồn: sữa (100ml = 100-120mg canxi), phô mai, sữa chua, cá nhỏ ăn cả xương, rau xanh đậm

### SẮT (mg/ngày bổ sung thêm)
- Phụ nữ có thai: +10 đến +15mg (tùy khẩu phần)
- Bà mẹ cho con bú: 8,9-26,1mg (tùy khẩu phần và kinh nguyệt)
- Bổ sung viên sắt khuyến nghị trong suốt thai kỳ
- Nguồn: thịt đỏ, gan, rau xanh, đậu

### KẼM (mg/ngày)
- Phụ nữ có thai: 6-20mg (tùy mức hấp thu)
- Cho con bú: 6,6-22mg
- Nguồn: thịt, hải sản, trứng, ngũ cốc

### IOD (μg/ngày)
- Phụ nữ có thai: 220μg
- Cho con bú: 250μg
- Thiếu iod gây ảnh hưởng não bộ thai nhi

### FOLATE/ACID FOLIC (μg/ngày)
- Phụ nữ có thai: 600μg
- Cho con bú: 500μg
- Thiếu folate gây dị tật ống thần kinh
- Cần bổ sung trước và trong khi mang thai

### VITAMIN A (μg/ngày bổ sung thêm)
- 3 tháng đầu: +0
- 3 tháng giữa: +0
- 3 tháng cuối: +80μg
- Cho con bú: +450μg
- CẢNH BÁO: Không dùng quá 3000μg (10000IU)/ngày khi mang thai

### VITAMIN D (mcg/ngày)
- Phụ nữ có thai: 20mcg
- Cho con bú: 20mcg
- Nguồn: cá béo, trứng, ánh nắng

### VITAMIN C (mg/ngày bổ sung thêm)
- Phụ nữ có thai: +10mg
- Cho con bú: +45mg

### VITAMIN B1 (mg/ngày bổ sung thêm)
- Phụ nữ có thai: +0,2mg
- Cho con bú: +0,2mg

### VITAMIN B6 (mg/ngày)
- Phụ nữ có thai: 1,9mg
- Cho con bú: 2,0mg
- Thiếu B6 liên quan buồn nôn khi mang thai

### VITAMIN B12 (mg/ngày)
- Phụ nữ có thai: 2,6mg
- Cho con bú: 2,8mg

### CHOLINE (mg/ngày)
- Phụ nữ có thai: 450mg
- Cho con bú: 550mg
- Quan trọng cho phát triển não bộ thai nhi

### DHA
- Quan trọng cho hình thành tế bào não và thị giác thai nhi
- Cần thiết cho quá trình Myelin hóa tế bào thần kinh
- Nguồn: cá hồi, cá thu, cá ngừ, dầu cá

### NƯỚC
- Cần khoảng 2500ml/ngày (bao gồm nước uống + nước từ thực phẩm)
- Phụ nữ có thai nên uống đủ nước, hạn chế natri để giảm nguy cơ tăng huyết áp

### TĂNG CÂN THAI KỲ (theo tiêu chuẩn Châu Á)
- BMI < 18,5 (thiếu cân): tăng 12,5-18 kg
- BMI 18,5-22,9 (bình thường): tăng 11,5-16 kg
- BMI 23-24,9 (thừa cân): tăng 7-11,5 kg
- BMI > 25 (béo phì): tăng 5-9 kg

### SỮA VÀ CHẾ PHẨM SỮA
- 1 đơn vị ăn = 100mg canxi = 100ml sữa = 100g sữa chua = 15g phô mai
- Sữa chua có lợi khuẩn đường ruột, ít lactose
- Phô mai giàu canxi gấp 3-6 lần sữa

### VẤN ĐỀ THƯỜNG GẶP KHI MANG THAI
- Buồn nôn: liên quan thiếu vitamin B6
- Táo bón: thiếu chất xơ, ít nước
- Chuột rút: thiếu canxi và vitamin D
- Phù: có thể do thiếu dinh dưỡng hoặc chèn ép

### THỰC PHẨM CẦN TRÁNH KHI CHO CON BÚ
- Rượu, bia
- Hạn chế cà phê, ớt, hành, tỏi (có thể gây khó chịu cho trẻ qua sữa)
`;

const GDM_KNOWLEDGE = `
## ĐÁI THÁO ĐƯỜNG THAI KỲ (QĐ 1470/QĐ-BYT 2024)

### ĐỊNH NGHĨA
- ĐTĐTK là tình trạng tăng glucose huyết tương phát hiện từ 3 tháng giữa thai kỳ trở đi
- Không có bằng chứng đái tháo đường từ trước
- Tỷ lệ tại Việt Nam: khoảng 20% thai phụ

### YẾU TỐ NGUY CƠ CAO
- Thừa cân/béo phì (BMI ≥ 23 theo tiêu chuẩn châu Á)
- Tiền sử gia đình có ĐTĐ thế hệ thứ nhất
- Tiền sử ĐTĐTK ở lần mang thai trước
- Tuổi > 35
- Tiền sử sinh con ≥ 4000g
- Hội chứng buồng trứng đa nang
- Tăng huyết áp (≥140/90 mmHg)
- HbA1C > 5,7% hoặc tiền ĐTĐ

### YẾU TỐ NGUY CƠ THẤP
- Tuổi < 25
- BMI bình thường
- Không có tiền sử gia đình ĐTĐ
- Không thuộc chủng tộc nguy cơ cao

### SÀNG LỌC VÀ CHẨN ĐOÁN
- Thời điểm chuẩn: tuần 24-28 thai kỳ
- Nghiệm pháp dung nạp 75g glucose - 2 giờ
- Chẩn đoán ĐTĐTK khi ≥1 giá trị bất thường:
  + Đói: ≥ 5,1 mmol/l (92 mg/dl)
  + 1 giờ: ≥ 10,0 mmol/l (180 mg/dl)
  + 2 giờ: ≥ 8,5 mmol/l (153 mg/dl)

### GLUCOSE HUYẾT TƯƠNG MỤC TIÊU (mao mạch)
- Lúc đói: < 5,3 mmol/l (95 mg/dl)
- 1 giờ sau ăn: < 7,8 mmol/l (140 mg/dl)
- 2 giờ sau ăn: < 6,7 mmol/l (120 mg/dl)

### HẬU QUẢ CHO MẸ
- Tăng huyết áp, tiền sản giật
- Sinh non (26% vs 9,7% bình thường)
- Đa ối (gấp 4 lần)
- Sẩy thai, thai lưu
- Nhiễm khuẩn niệu
- 17-63% tiến triển thành ĐTĐ týp 2 trong 5-16 năm sau sinh

### HẬU QUẢ CHO THAI NHI/TRẺ SƠ SINH
- Thai to (≥4000g)
- Hạ glucose huyết sơ sinh (15-25%)
- Dị tật bẩm sinh (8-13% nếu không kiểm soát)
- Suy hô hấp sơ sinh
- Vàng da (25%)
- Tăng hồng cầu
- Về lâu dài: tăng nguy cơ béo phì, ĐTĐ týp 2 gấp 8 lần

### ĐIỀU TRỊ TIẾT CHẾ (bước đầu)
- Chế độ ăn dành cho ĐTĐTK + vận động
- 80% thai phụ đạt glucose mục tiêu sau 5 ngày tiết chế
- Vận động ít nhất 30 phút/ngày
- Đi bộ hoặc tập tay 10 phút sau ăn

### KHI TIẾT CHẾ KHÔNG ĐỦ
- Sử dụng Insulin theo chỉ định bác sĩ Nội tiết
- Theo dõi glucose mao mạch đói + sau ăn

### DỰ PHÒNG
- Kiểm soát cân nặng trước mang thai
- Chế độ ăn lành mạnh, hạn chế đường, tinh bột tinh chế
- Vận động thể chất đều đặn
- Hạn chế muối < 5g/ngày, dùng muối iốt
- Không rượu bia, thuốc lá, chất kích thích

### SAU SINH
- Kiểm tra glucose 4-12 tuần sau sinh (nghiệm pháp 75g glucose)
- Nếu bình thường: tầm soát định kỳ 1 năm/lần
- Nếu bất thường: khám chuyên khoa Nội tiết
`;

const SYSTEM_PROMPT = `Bạn là Nori, trợ lý dinh dưỡng AI thông minh cho mẹ bầu và mẹ cho con bú tại Việt Nam.

## Vai trò
Bạn tư vấn dinh dưỡng dựa trên hướng dẫn chính thức của Bộ Y tế Việt Nam:
- QĐ 776/QĐ-BYT (2017): Hướng dẫn quốc gia về dinh dưỡng cho phụ nữ có thai và bà mẹ cho con bú
- QĐ 1470/QĐ-BYT (2024): Hướng dẫn quốc gia về sàng lọc và quản lý đái tháo đường thai kỳ

## Dữ liệu tham chiếu
${NUTRITION_KNOWLEDGE}
${GDM_KNOWLEDGE}

## Nguyên tắc trả lời
1. Trả lời bằng tiếng Việt thân thiện, dùng "bạn" để xưng hô
2. Gợi ý thực đơn với MÓN VIỆT NAM quen thuộc (phở, bún, cơm, canh, chè...)
3. Khi đề cập đến lượng vi chất, luôn ghi rõ nguồn thực phẩm Việt Nam cụ thể
4. LUÔN nhắc nhở đây là thông tin tham khảo, cần tham vấn bác sĩ cho trường hợp cụ thể
5. Nếu phát hiện triệu chứng nghiêm trọng, khuyên đi khám bác sĩ ngay
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
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
      model: 'gpt-4o',
      messages: openaiMessages,
      max_tokens: 1024,
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

  // Default
  return `Cảm ơn câu hỏi của bạn! 😊\n\nTôi là Nori - trợ lý dinh dưỡng cho mẹ bầu và mẹ cho con bú, dựa trên hướng dẫn chính thức của Bộ Y tế Việt Nam.\n\n**Tôi có thể tư vấn về:**\n• 🍽️ Dinh dưỡng theo từng giai đoạn thai kỳ\n• 🩺 Tiểu đường thai kỳ - chế độ ăn & theo dõi\n• 💊 Bổ sung vi chất: sắt, canxi, folate, DHA\n• 🤢 Ốm nghén & các vấn đề thường gặp\n• ⚖️ Tăng cân hợp lý khi mang thai\n• 🤱 Dinh dưỡng cho mẹ cho con bú\n\nBạn muốn hỏi về vấn đề nào?`;
}
