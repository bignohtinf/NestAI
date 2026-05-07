import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate input
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Valid User ID is required', isAdmin: false },
        { status: 400 }
      );
    }

    // Get user data from Supabase public.users table
    const { data: userData, error } = await supabaseAdmin.getUser(userId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error', isAdmin: false },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found', isAdmin: false },
        { status: 404 }
      );
    }

    // Check if user has admin role (role field from public.users table)
    const isAdmin = userData.role === 'admin';

    return NextResponse.json(
      {
        isAdmin,
        userId: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking admin role:', error);
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    );
  }
}
