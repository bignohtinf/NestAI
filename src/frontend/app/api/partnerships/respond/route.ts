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

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';

    const { data, error } = await supabaseService
      .from('partnerships')
      .update({ status: newStatus, responded_at: new Date().toISOString(), responded_by: userId })
      .eq('id', partnershipId)
      .select()
      .single();

    if (error) {
      console.error('Partnership respond error:', error);
      return NextResponse.json({ message: 'Không thể xử lý yêu cầu' }, { status: 500 });
    }

    // Khi ACCEPTED: tự động gắn partnership_id cho các babies solo của cả mẹ lẫn bố
    // (babies được tạo trước khi có partnership sẽ không có partnership_id)
    if (newStatus === 'accepted' && data) {
      const motherId = data.mother_id;
      const fatherId = data.father_id;

      const userIds = [motherId, fatherId].filter(Boolean);
      for (const uid of userIds) {
        const { error: linkErr } = await supabaseService
          .from('babies')
          .update({ partnership_id: partnershipId })
          .eq('created_by', uid)
          .is('partnership_id', null);

        if (linkErr) {
          console.error(`Failed to link babies for user ${uid}:`, linkErr);
        }
      }
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
