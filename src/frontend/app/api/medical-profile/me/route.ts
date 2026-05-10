import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const userId = request.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ message: 'user_id là bắt buộc' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseService
      .from('medical_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Medical profile error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!profile) {
      const { data: newProfile, error: insertError } = await supabaseService
        .from('medical_profiles')
        .insert({ user_id: userId, pregnancy_status: 'not_pregnant' })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ message: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ profile: newProfile });
    }

    // Tính tuần thai live nếu đang mang thai
    // Nếu user là bố → lấy LMP/due_date từ profile mẹ qua partnership
    // (bố có thể có pregnancy_status chưa được sync → kiểm tra role trước)
    let profileToEnrich = { ...profile };

    // Kiểm tra role — nếu là bố, luôn thử lấy data từ mẹ
    const needsFatherLookup = !profile.last_menstrual_period;
    if (needsFatherLookup) {
      try {
        const { data: userData } = await supabaseService
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();

        if (userData?.role === 'father') {
          const { data: partnershipData } = await supabaseService
            .from('partnerships')
            .select('mother_id')
            .eq('father_id', userId)
            .eq('status', 'accepted')
            .maybeSingle();

          if (partnershipData?.mother_id) {
            const { data: motherProfile } = await supabaseService
              .from('medical_profiles')
              .select('last_menstrual_period, due_date, pregnancy_status')
              .eq('user_id', partnershipData.mother_id)
              .maybeSingle();

            if (motherProfile) {
              // Dùng LMP/due_date/pregnancy_status của mẹ để tính tuần thai cho bố
              profileToEnrich = {
                ...profileToEnrich,
                last_menstrual_period: motherProfile.last_menstrual_period || profileToEnrich.last_menstrual_period,
                due_date: profileToEnrich.due_date || motherProfile.due_date,
                // Sync pregnancy_status từ mẹ nếu bố chưa được set
                pregnancy_status: motherProfile.pregnancy_status === 'pregnant'
                  ? 'pregnant'
                  : profileToEnrich.pregnancy_status,
              };
            }
          }
        }
      } catch (err) {
        console.error('Could not fetch mother profile for father:', err);
      }
    }

    const enrichedProfile = calculatePregnancyWeek(profileToEnrich);

    return NextResponse.json({ profile: enrichedProfile });
  } catch (error) {
    console.error('Get medical profile error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const userId = request.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ message: 'user_id là bắt buộc' }, { status: 400 });
    }

    const body = await request.json();

    // Chỉ lưu anchor dates và các fields thực sự cần persist
    // KHÔNG lưu week_of_pregnancy, trimester, days_in_week — chúng được tính live khi GET
    const { week_of_pregnancy, trimester, days_in_week, ...persistableData } = body;

    const updateData = {
      ...persistableData,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabaseService
      .from('medical_profiles')
      .upsert({ user_id: userId, ...updateData }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Trả về profile đã được enrich với tuần thai tính live
    const enrichedProfile = calculatePregnancyWeek(profile);

    return NextResponse.json({ status: 'updated', profile: enrichedProfile });
  } catch (error) {
    console.error('Update medical profile error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

/**
 * Tính tuần thai và số ngày lẻ live từ LMP hoặc EDD.
 * - Ưu tiên last_menstrual_period (LMP) nếu có → chính xác tuyệt đối
 * - Fallback sang due_date nếu không có LMP (dùng cho role father)
 * - Trả về week_of_pregnancy, days_in_week, trimester, due_date
 * - KHÔNG ghi vào DB
 */
function calculatePregnancyWeek(profile: Record<string, any>) {
  // Khi không tính được tuần thai → null out các field tính toán
  // để context KHÔNG dùng DB default (days_in_week DEFAULT 0)
  if (profile.pregnancy_status !== 'pregnant') {
    return { ...profile, week_of_pregnancy: null, days_in_week: null, trimester: null };
  }

  const lmpStr = profile.last_menstrual_period;
  const dueDateStr = profile.due_date;

  if (!lmpStr && !dueDateStr) {
    return { ...profile, week_of_pregnancy: null, days_in_week: null, trimester: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let weekOfPregnancy: number | undefined;
  let daysInWeek: number | undefined;
  let trimester: number | undefined;
  let dueDate: string | undefined;

  if (lmpStr) {
    // Tính từ LMP — chính xác nhất
    const lmp = new Date(lmpStr);
    lmp.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
    weekOfPregnancy = Math.max(0, Math.min(42, Math.floor(daysDiff / 7)));
    daysInWeek = Math.max(0, daysDiff % 7);

    if (!dueDateStr) {
      const dd = new Date(lmp);
      dd.setDate(dd.getDate() + 280);
      dueDate = dd.toISOString().split('T')[0];
    } else {
      dueDate = dueDateStr;
    }
  } else if (dueDateStr) {
    // Fallback: tính từ EDD (dùng cho bố — chỉ có due_date được sync)
    const dd = new Date(dueDateStr);
    dd.setHours(0, 0, 0, 0);
    const daysToGo = Math.floor((dd.getTime() - today.getTime()) / 86400000);
    const totalDays = 280 - daysToGo;
    weekOfPregnancy = Math.max(0, Math.min(42, Math.floor(totalDays / 7)));
    daysInWeek = Math.max(0, totalDays % 7);
    dueDate = dueDateStr;
  }

  if (weekOfPregnancy === undefined) return profile;

  trimester = weekOfPregnancy <= 13 ? 1 : weekOfPregnancy <= 26 ? 2 : 3;

  return {
    ...profile,
    week_of_pregnancy: weekOfPregnancy,
    days_in_week: daysInWeek,
    trimester,
    due_date: dueDate ?? profile.due_date,
  };
}
