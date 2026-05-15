import { NextRequest, NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase';

/**
 * GET /api/wellness/today?user_id=...
 * Trả về wellness entry hôm nay của user (sleep_hours, water_intake_ml, mood, energy_level).
 * Dùng Supabase trực tiếp (server-side) — không phụ thuộc NEXT_PUBLIC_API_URL.
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

    const today = new Date().toISOString().split('T')[0];

    const { data: entry, error } = await supabaseService
      .from('wellness_entries')
      .select('sleep_hours, water_intake_ml, energy_level, mood, milk_score')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .maybeSingle();

    if (error) {
      console.error('wellness/today error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry: entry ?? null });
  } catch (error) {
    console.error('GET /api/wellness/today error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}

/**
 * POST /api/wellness/today?user_id=...
 * Upsert wellness entry cho hôm nay.
 * Body: { sleep_hours?, water_intake_ml?, mood?, energy_level?, milk_score?, notes? }
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

    const body = await request.json();
    const today = new Date().toISOString().split('T')[0];

    const payload: Record<string, any> = {
      user_id: userId,
      entry_date: today,
      updated_at: new Date().toISOString(),
    };

    if (body.sleep_hours    !== undefined) payload.sleep_hours    = body.sleep_hours;
    if (body.water_intake_ml !== undefined) payload.water_intake_ml = body.water_intake_ml;
    if (body.mood            !== undefined) payload.mood           = body.mood;
    if (body.energy_level    !== undefined) payload.energy_level   = body.energy_level;
    if (body.milk_score      !== undefined) payload.milk_score     = body.milk_score;
    if (body.notes           !== undefined) payload.notes          = body.notes;

    const { data, error } = await supabaseService
      .from('wellness_entries')
      .upsert(payload, { onConflict: 'user_id,entry_date' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok', entry: data });
  } catch (error) {
    console.error('POST /api/wellness/today error:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
