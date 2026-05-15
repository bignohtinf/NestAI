import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json(
        { message: 'Cấu hình máy chủ không hợp lệ (thiếu service key)' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'Thiếu userId' },
        { status: 400 }
      );
    }

    if (!role || !['mother', 'father', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Role không hợp lệ. Chọn "mother" hoặc "father".' },
        { status: 400 }
      );
    }

    const { error } = await supabaseService
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('set-role update error:', error);
      return NextResponse.json(
        { message: 'Không thể cập nhật role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Cập nhật role thành công', role }, { status: 200 });
  } catch (error) {
    console.error('set-role error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi cập nhật role' },
      { status: 500 }
    );
  }
}
