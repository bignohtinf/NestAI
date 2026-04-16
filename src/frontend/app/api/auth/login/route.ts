import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Sign in user
    const { data, error } = await supabaseAdmin.signIn(email, password);

    console.log('SignIn response:', { error: error?.message, userId: data?.user?.id });

    if (error) {
      console.error('SignIn error:', error);
      return NextResponse.json(
        { message: error.message || 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      );
    }

    if (!data.user) {
      console.error('No user returned from signin');
      return NextResponse.json(
        { message: 'Không thể đăng nhập' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin.getUser(data.user.id);

    console.log('GetUser response:', { error: userError?.message, userData: userData?.id });

    if (userError || !userData) {
      console.error('GetUser error:', userError);
      return NextResponse.json(
        { message: 'Không tìm thấy thông tin người dùng' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Đăng nhập thành công',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.full_name,
          role: userData.role,
        },
        session: data.session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi đăng nhập' },
      { status: 500 }
    );
  }
}
