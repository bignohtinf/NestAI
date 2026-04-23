import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const body = await request.json();
    const { partnershipId, action, userId } = body;

    if (!partnershipId || !['accept', 'reject'].includes(action) || !userId) {
      return NextResponse.json({ message: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    const { data, error } = await supabaseService
      .from('partnerships')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', partnershipId)
      .select()
      .single();

    if (error) {
      console.error('Partnership respond error:', error);
      return NextResponse.json({ message: 'Không thể xử lý yêu cầu' }, { status: 500 });
    }

    return NextResponse.json({
      message: action === 'accept' ? 'Đã chấp nhận kết nối' : 'Đã từ chối kết nối',
      partnership: data,
    });
  } catch (error) {
    console.error('Partnership response error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
