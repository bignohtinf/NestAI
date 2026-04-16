import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerEmail, partnerPhone, fatherId } = body;

    // Validation
    if (!partnerEmail && !partnerPhone) {
      return NextResponse.json(
        { message: 'Vui lòng nhập email hoặc số điện thoại' },
        { status: 400 }
      );
    }

    if (!fatherId) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin bố' },
        { status: 400 }
      );
    }

    // Create partnership request
    const { data, error } = await supabaseAdmin.createPartnershipRequest(
      fatherId,
      partnerEmail,
      partnerPhone
    );

    if (error) {
      return NextResponse.json(
        { message: error.message || 'Không thể gửi yêu cầu kết nối' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Yêu cầu kết nối đã được gửi. Vui lòng chờ mẹ chấp nhận.',
        partnership: data?.[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Partnership request error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi gửi yêu cầu' },
      { status: 500 }
    );
  }
}
