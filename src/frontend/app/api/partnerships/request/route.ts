import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json(
        { message: 'Cấu hình máy chủ không hợp lệ' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { partnerEmail, partnerPhone, fatherId } = body;

    if (!partnerEmail && !partnerPhone) {
      return NextResponse.json(
        { message: 'Vui lòng nhập email hoặc số điện thoại' },
        { status: 400 }
      );
    }

    if (!fatherId) {
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 400 }
      );
    }

    // Find partner by email or phone
    let query = supabaseService.from('users').select('id, role');
    if (partnerEmail) {
      query = query.eq('email', partnerEmail);
    } else {
      query = query.eq('phone', partnerPhone);
    }

    const { data: partnerData, error: partnerError } = await query.single();

    if (partnerError || !partnerData) {
      return NextResponse.json(
        { message: 'Không tìm thấy tài khoản người dùng với thông tin đã nhập' },
        { status: 404 }
      );
    }

    if (partnerData.id === fatherId) {
      return NextResponse.json(
        { message: 'Không thể kết nối với chính mình' },
        { status: 400 }
      );
    }

    // Check for existing partnership
    const { data: existing } = await supabaseService
      .from('partnerships')
      .select('id, status')
      .or(
        `and(father_id.eq.${fatherId},mother_id.eq.${partnerData.id}),and(father_id.eq.${partnerData.id},mother_id.eq.${fatherId})`
      )
      .in('status', ['pending', 'accepted'])
      .maybeSingle();

    if (existing) {
      const msg = existing.status === 'accepted'
        ? 'Đã có mối quan hệ với người dùng này'
        : 'Đã có yêu cầu kết nối đang chờ xử lý';
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    // Create partnership
    const { data, error } = await supabaseService
      .from('partnerships')
      .insert({
        father_id: fatherId,
        mother_id: partnerData.id,
        status: 'pending',
        requested_by: fatherId,
      })
      .select()
      .single();

    if (error) {
      console.error('Partnership insert error:', error);
      return NextResponse.json(
        { message: 'Không thể gửi yêu cầu kết nối' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Yêu cầu kết nối đã được gửi. Vui lòng chờ đối phương chấp nhận.', partnership: data },
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
