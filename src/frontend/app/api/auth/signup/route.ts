import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body;

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Sign up user in Supabase Auth
    const { data, error } = await supabaseAdmin.signUp(email, password, fullName, phone);

    console.log('SignUp response:', { error, userId: data?.user?.id });

    if (error) {
      console.error('SignUp error:', error);
      return NextResponse.json(
        { message: error.message || 'Đã xảy ra lỗi khi đăng ký' },
        { status: 400 }
      );
    }

    if (!data.user) {
      console.error('No user returned from signup');
      return NextResponse.json(
        { message: 'Không thể tạo tài khoản' },
        { status: 400 }
      );
    }

    // Create user record in users table using service role to bypass RLS
    const adminClient = supabaseService;
    if (!adminClient) {
      console.error('Missing SUPABASE_SECRET_KEY — cannot insert user record');
      return NextResponse.json(
        { message: 'Cấu hình server thiếu service key' },
        { status: 500 }
      );
    }

    // role intentionally omitted — user will select it on first login via /auth/role-selection
    const { error: userError } = await adminClient
      .from('users')
      .insert([{ id: data.user.id, email, full_name: fullName, phone }]);

    if (userError) {
      console.error('Error creating user record:', JSON.stringify(userError, null, 2));
      return NextResponse.json(
        { message: 'Đã xảy ra lỗi khi lưu thông tin người dùng' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận.',
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName,
          phone,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Đã xảy ra lỗi khi đăng ký' },
      { status: 500 }
    );
  }
}
