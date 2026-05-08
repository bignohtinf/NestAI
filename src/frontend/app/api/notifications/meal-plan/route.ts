import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const body = await request.json();
    const { mother_id, plan_date, plan_data, target } = body;

    if (!mother_id || !plan_data) {
      return NextResponse.json({ message: 'mother_id và plan_data là bắt buộc' }, { status: 400 });
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

    // 2. Xác định father_id
    const father_id = partnership.father_id === mother_id
      ? partnership.mother_id
      : partnership.father_id;

    if (!father_id || father_id === mother_id) {
      return NextResponse.json({ message: 'Không tìm thấy bố trong partnership', skipped: true });
    }

    // 3. Lấy tên mẹ
    const { data: motherUser } = await supabaseService
      .from('users')
      .select('full_name, email')
      .eq('id', mother_id)
      .single();

    const motherName = motherUser?.full_name || motherUser?.email || 'Mẹ';

    // 4. Build tiêu đề & nội dung
    const dateLabel = plan_date
      ? new Date(plan_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'hôm nay';

    const targetLabel = target === 'baby' ? 'cho bé' : 'thai kỳ';
    const totalEnergy = Math.round(plan_data.nutrition_summary?.total?.energy ?? 0);

    const title = `📋 ${motherName} đã lưu thực đơn ${dateLabel}`;
    const message = `Thực đơn ${targetLabel} — ${totalEnergy} kcal/ngày. Bấm để xem chi tiết 3 bữa.`;

    // 5. Build danh sách món gọn cho từng bữa
    const MEAL_KEYS = [
      { key: 'breakfast', label: 'Bữa sáng' },
      { key: 'lunch',     label: 'Bữa trưa' },
      { key: 'dinner',    label: 'Bữa tối'  },
    ];

    const meals = MEAL_KEYS.map(({ key, label }) => {
      const meal = plan_data[key] || {};
      return {
        key,
        label,
        dishes: (meal.dishes || []).map((d: any) => ({
          name: d.dish_name_vi || d.dish_name_vietnamese || '',
          dish_type: d.dish_type || '',
          grams: d.grams ?? 100,
          energy: d.energy ?? 0,
          protein: d.protein ?? 0,
          fat: d.fat ?? 0,
          carbohydrate: d.carbohydrate ?? 0,
        })),
        nutrition: plan_data.nutrition_summary?.[key] ?? null,
      };
    });

    // 6. Insert notification cho bố
    const { data: notification, error: insertError } = await supabaseService
      .from('notifications')
      .insert({
        user_id: father_id,
        type: 'meal_plan_generated',
        title,
        message,
        is_read: false,
        data: {
          plan_date: plan_date ?? null,
          target: target ?? 'mother',
          meals,
          total_nutrition: plan_data.nutrition_summary?.total ?? null,
          estimated_cost: plan_data.estimated_cost?.total ?? null,
          mother_name: motherName,
          saved_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert meal-plan notification error:', insertError);
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification_id: notification.id });
  } catch (error) {
    console.error('Meal plan notification error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
