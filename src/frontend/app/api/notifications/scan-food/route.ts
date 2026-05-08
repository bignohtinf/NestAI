import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const body = await request.json();
    const { mother_id, meal_data } = body;

    if (!mother_id || !meal_data) {
      return NextResponse.json({ message: 'mother_id và meal_data là bắt buộc' }, { status: 400 });
    }

    // 1. Tìm active partnership của mẹ
    const { data: partnership, error: partnershipError } = await supabaseService
      .from('partnerships')
      .select('id, father_id, mother_id')
      .or(`father_id.eq.${mother_id},mother_id.eq.${mother_id}`)
      .eq('status', 'accepted')
      .maybeSingle();

    if (partnershipError) {
      console.error('Partnership lookup error:', partnershipError);
      return NextResponse.json({ message: partnershipError.message }, { status: 500 });
    }

    if (!partnership) {
      return NextResponse.json({ message: 'Chưa có kết nối gia đình', skipped: true });
    }

    // 2. Xác định father_id (người nhận thông báo)
    const father_id = partnership.father_id === mother_id
      ? partnership.mother_id   // nếu mother_id trùng father slot → lấy slot còn lại
      : partnership.father_id;

    if (!father_id || father_id === mother_id) {
      return NextResponse.json({ message: 'Không tìm thấy bố trong partnership', skipped: true });
    }

    // 3. Lấy tên mẹ để hiển thị trong thông báo
    const { data: motherUser } = await supabaseService
      .from('users')
      .select('full_name, email')
      .eq('id', mother_id)
      .single();

    const motherName = motherUser?.full_name || motherUser?.email || 'Mẹ';

    // 4. Build tiêu đề & nội dung thông báo
    const mealName = meal_data.meal_name || 'Bữa ăn';
    const title = `🍽️ ${motherName} vừa lưu bữa ăn`;
    const message = `${mealName} — ${meal_data.total_calories ?? 0} kcal | Protein: ${meal_data.total_protein ?? 0}g | Carbs: ${meal_data.total_carbs ?? 0}g | Béo: ${meal_data.total_fat ?? 0}g`;

    // 5. Insert notification cho bố
    const { data: notification, error: insertError } = await supabaseService
      .from('notifications')
      .insert({
        user_id: father_id,
        type: 'scan_food',
        title,
        message,
        is_read: false,
        data: {
          meal_name: meal_data.meal_name,
          total_calories: meal_data.total_calories,
          total_protein: meal_data.total_protein,
          total_carbs: meal_data.total_carbs,
          total_fat: meal_data.total_fat,
          dishes: meal_data.dishes || [],
          pregnancy_guidance: meal_data.pregnancy_guidance || null,
          meal_context: meal_data.meal_context || null,
          mother_name: motherName,
          scanned_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert notification error:', insertError);
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification_id: notification.id });
  } catch (error) {
    console.error('Scan food notification error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
