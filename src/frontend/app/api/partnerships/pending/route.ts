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

    // Lấy requests pending mà user là người nhận (không phải người gửi)
    const { data, error } = await supabaseService
      .from('partnerships')
      .select('id, status, created_at, requested_by, father_id, mother_id')
      .or(`mother_id.eq.${userId},father_id.eq.${userId}`)
      .eq('status', 'pending')
      .neq('requested_by', userId);

    if (error) {
      console.error('Pending partnerships error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Lấy thêm thông tin người gửi
    const partnerships = await Promise.all(
      (data || []).map(async (p) => {
        const { data: sender } = await supabaseService!
          .from('users')
          .select('full_name, email')
          .eq('id', p.requested_by)
          .single();
        return { ...p, sender };
      })
    );

    return NextResponse.json({ partnerships });
  } catch (error) {
    console.error('Get pending partnerships error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
