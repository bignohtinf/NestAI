import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { adminId, action, targetType, targetId, details } = await request.json();

    // Validate required fields
    if (!adminId || !action) {
      return NextResponse.json(
        { error: 'adminId and action are required' },
        { status: 400 }
      );
    }

    // Insert admin log record
    const { data, error } = await supabase
      .from('admin_logs')
      .insert([
        {
          admin_id: adminId,
          action,
          target_type: targetType,
          target_id: targetId,
          details: details || {},
        },
      ])
      .select();

    if (error) {
      console.error('Admin log error:', error);
      return NextResponse.json(
        { error: 'Failed to log admin action' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, log: data?.[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error logging admin action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminId = request.nextUrl.searchParams.get('adminId');
    const limit = request.nextUrl.searchParams.get('limit') || '50';

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId is required' },
        { status: 400 }
      );
    }

    // Fetch admin logs
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Admin log fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admin logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
