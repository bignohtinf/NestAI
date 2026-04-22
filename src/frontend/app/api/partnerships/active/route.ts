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

    const { data: partnership, error } = await supabaseService
      .from('partnerships')
      .select('id, status, created_at, father_id, mother_id')
      .or(`father_id.eq.${userId},mother_id.eq.${userId}`)
      .eq('status', 'accepted')
      .maybeSingle();

    if (error) {
      console.error('Active partnership error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    if (!partnership) {
      return NextResponse.json({ partnership: null });
    }

    // Lấy thông tin đối phương
    const partnerId = partnership.father_id === userId ? partnership.mother_id : partnership.father_id;
    const { data: partner } = await supabaseService
      .from('users')
      .select('id, full_name, email, phone, role')
      .eq('id', partnerId)
      .single();

    return NextResponse.json({ partnership: { ...partnership, partner } });
  } catch (error) {
    console.error('Get active partnership error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
