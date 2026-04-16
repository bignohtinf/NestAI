import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnershipId, action, motherId } = body;

    // Validation
    if (!partnershipId || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { message: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      );
    }

    if (!motherId) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin mẹ' },
        { status: 400 }
      );
    }

    // Respond to partnership request
    const { data, error } = await supabaseAdmin.respondToPartnershipRequest(
      partnershipId,
      motherId,
      action as 'accept' | 'reject'
    );

    if (error) {
      return NextResponse.json(
        { message: error.message || 'Không thể xử lý yêu cầu' },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    return NextResponse.json(
      {
        message: `Yêu cầu kết nối đã được ${action === 'accept' ? 'chấp nhận' : 'từ chối'}`,
        partnership: data?.[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Partnership response error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
