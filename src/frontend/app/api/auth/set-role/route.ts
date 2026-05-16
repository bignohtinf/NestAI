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

    // Also cache role in app_metadata so the client can read it from the JWT
    // without a separate DB round-trip on every login.
    // app_metadata is only writable via the service-role admin API (not by users).
    const { error: metaError } = await supabaseService.auth.admin.updateUserById(userId, {
      app_metadata: { role },
    });
    if (metaError) {
      // Non-fatal: users table is the source of truth; app_metadata is a cache.
      console.warn('set-role: could not update app_metadata, role still saved in DB:', metaError.message);
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
