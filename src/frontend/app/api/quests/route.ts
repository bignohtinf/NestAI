import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

/**
 * GET /api/quests?user_id=...
 * Trả về danh sách quests (active) với trạng thái hoàn thành của user.
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const userId = request.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ message: 'user_id là bắt buộc' }, { status: 400 });
    }

    // Lấy tất cả quests đang active
    const { data: quests, error: questsErr } = await supabaseService
      .from('quests')
      .select('id, title, description, category, reward')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (questsErr) {
      return NextResponse.json({ message: questsErr.message }, { status: 500 });
    }

    // Lấy user_quests để biết quest nào đã hoàn thành
    const { data: userQuests } = await supabaseService
      .from('user_quests')
      .select('quest_id, completed')
      .eq('user_id', userId);

    const completedIds = new Set(
      (userQuests ?? []).filter((uq) => uq.completed).map((uq) => uq.quest_id)
    );

    const result = (quests ?? []).map((q) => ({
      id: q.id,
      title: q.title,
      description: q.description ?? '',
      category: (q.category as 'nutrition' | 'health' | 'exercise' | 'social') ?? 'health',
      reward: q.reward ?? 0,
      completed: completedIds.has(q.id),
    }));

    return NextResponse.json({ quests: result });
  } catch (error) {
    console.error('GET /api/quests error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

/**
 * POST /api/quests/complete?user_id=...
 * Body: { quest_id: string, completed: boolean }
 * Cập nhật trạng thái hoàn thành của một quest.
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseService) {
      return NextResponse.json({ message: 'Cấu hình máy chủ không hợp lệ' }, { status: 500 });
    }

    const userId = request.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ message: 'user_id là bắt buộc' }, { status: 400 });
    }

    const { quest_id, completed } = await request.json();
    if (!quest_id) {
      return NextResponse.json({ message: 'quest_id là bắt buộc' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabaseService
      .from('user_quests')
      .upsert(
        {
          user_id: userId,
          quest_id,
          completed: completed ?? true,
          completed_at: completed ? now : null,
          updated_at: now,
        },
        { onConflict: 'user_id,quest_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok', data });
  } catch (error) {
    console.error('POST /api/quests error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
