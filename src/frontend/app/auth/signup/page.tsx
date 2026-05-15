'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Mật khẩu không khớp');
      }
      if (formData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Đăng ký thành công → hiện màn hình kiểm tra email (KHÔNG tự login,
      // vì Supabase yêu cầu xác nhận email trước khi có thể đăng nhập)
      setRegisteredEmail(formData.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  // Màn hình xác nhận email — hiện sau khi đăng ký thành công
  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #fdf3f1 0%, #fff8f5 50%, #fef0ee 100%)' }}>
        <div className={`w-full max-w-md bg-white rounded-3xl p-8 shadow-xl shadow-rose-100/60 border border-rose-100/40 text-center transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#fdf0ed' }}>
              <Mail className="w-9 h-9 text-rose-400" />
            </div>
          </div>

          <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto -mt-3 mb-4" />

          <h1 className="text-gray-900 text-2xl font-bold mb-2 tracking-tight">Kiểm tra email của bạn</h1>
          <p className="text-gray-500 text-sm mb-1">
            Chúng tôi đã gửi email xác nhận đến
          </p>
          <p className="text-rose-500 font-semibold text-sm mb-6 break-all">{registeredEmail}</p>

          <div className="bg-rose-50 rounded-2xl p-4 text-left mb-6 space-y-2">
            <p className="text-gray-700 text-sm font-medium">Làm theo các bước sau:</p>
            <ol className="text-gray-500 text-sm space-y-1.5 list-decimal list-inside">
              <li>Mở hộp thư email của bạn</li>
              <li>Tìm email từ <span className="font-medium text-gray-700">NestAI</span></li>
              <li>Nhấn nút <span className="font-medium text-rose-500">Xác nhận email</span> trong thư</li>
              <li>Quay lại đây để đăng nhập</li>
            </ol>
          </div>

          <p className="text-gray-400 text-xs mb-5">
            Không thấy email? Kiểm tra thư mục <span className="font-medium">Spam / Junk</span> hoặc chờ vài phút.
          </p>

          <Link
            href="/auth/login"
            className="block w-full text-white font-medium py-2.5 rounded-xl text-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'linear-gradient(135deg, #e05a50, #f07060)', boxShadow: '0 4px 14px rgba(224,90,80,0.35)' }}
          >
            Đi đến trang đăng nhập
          </Link>

          <button
            onClick={() => { setRegisteredEmail(''); setFormData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' }); }}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-300 underline underline-offset-2"
          >
            Đăng ký bằng email khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fdf3f1 0%, #fff8f5 50%, #fef0ee 100%)' }}>
      <div
        className={`w-full max-w-4xl bg-white rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-xl shadow-rose-100/60 border border-rose-100/40 transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
      >
        {/* Left Panel */}
        <div className="lg:w-[45%] flex flex-col" style={{ background: '#fdf0ed' }}>
          <div
            className={`p-5 flex items-center transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
          >
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent text-xl font-bold tracking-wider">
              NestAI
            </span>
          </div>

          <div
            className={`flex-1 relative overflow-hidden min-h-[260px] transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <Image
              src="/kinh-nghiem-sinh-con-dau-long.jpg"
              alt="Hành trình làm mẹ"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(253,240,237,0.92) 0%, rgba(253,240,237,0.15) 50%, transparent 100%)' }}
            />

            <div
              className={`absolute bottom-6 left-0 right-0 text-center px-6 transition-all duration-500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <h2 className="text-rose-900/80 text-xl font-semibold leading-tight tracking-tight drop-shadow-sm">
                Bắt đầu hành trình<br />cùng gia đình bạn
              </h2>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-[55%] p-6 lg:p-10 flex flex-col justify-center bg-white">
          <h1
            className={`text-gray-900 text-2xl lg:text-3xl font-bold mb-1 tracking-tight transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
          >
            Tạo tài khoản
          </h1>
          <p
            className={`text-gray-400 text-sm mb-6 transition-all duration-500 delay-[350ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
          >
            Đã có tài khoản?{' '}
            <Link
              href="/auth/login"
              className="text-rose-500 font-medium hover:text-rose-600 transition-colors duration-300"
            >
              Đăng nhập
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100">
                <span>⚠️</span> {error}
              </div>
            )}

            <div
              className={`transition-all duration-500 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <input
                name="fullName"
                type="text"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300/40 transition-all duration-300 disabled:opacity-50"
              />
            </div>

            <div
              className={`transition-all duration-500 delay-[440ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300/40 transition-all duration-300 disabled:opacity-50"
              />
            </div>

            <div
              className={`transition-all duration-500 delay-[480ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <input
                name="phone"
                type="tel"
                placeholder="Số điện thoại (tùy chọn)"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300/40 transition-all duration-300 disabled:opacity-50"
              />
            </div>

            <div
              className={`relative transition-all duration-500 delay-[520ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300/40 transition-all duration-300 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div
              className={`relative transition-all duration-500 delay-[560ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full bg-rose-50/50 border border-rose-100 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300/40 transition-all duration-300 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div
              className={`transition-all duration-500 delay-[620ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-medium py-2.5 rounded-xl transition-all duration-300 text-sm hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #e05a50, #f07060)', boxShadow: '0 4px 14px rgba(224,90,80,0.35)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Đăng ký'
                )}
              </button>
            </div>
          </form>

          <p
            className={`text-center text-xs text-gray-300 mt-8 transition-all duration-500 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'
              }`}
          >
            NestAI — Đồng hành cùng hành trình thai kỳ của bạn
          </p>
        </div>
      </div>
    </div>
  );
}
