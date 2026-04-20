import { NextRequest, NextResponse } from 'next/server';

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

    // Bypass auth: allow any email/password
    return NextResponse.json(
      {
        message: 'Đăng nhập thành công',
        user: {
          id: 'mock-user-id',
          email: email,
          name: email.split('@')[0],
          role: 'mother',
        },
        session: { access_token: 'mock-token' },
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
