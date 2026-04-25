'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mounted, setMounted] = useState(false);

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
      if (!formData.email || !formData.password) throw new Error('Vui lòng điền đầy đủ thông tin');
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

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
                Đồng hành cùng<br />hành trình của bạn
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
            Chào mừng trở lại
          </h1>
          <p
            className={`text-gray-400 text-sm mb-6 transition-all duration-500 delay-[350ms] ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
          >
            Chưa có tài khoản?{' '}
            <Link
              href="/auth/signup"
              className="text-rose-500 font-medium hover:text-rose-600 transition-colors duration-300"
            >
              Đăng ký ngay
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100">
                <span>⚠️</span> {error}
              </div>
            )}

            <div
              className={`transition-all duration-500 delay-[450ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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
              className={`relative transition-all duration-500 delay-[500ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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
              className={`flex justify-end transition-all duration-500 delay-[540ms] ${mounted ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <Link
                href="#"
                className="text-xs text-gray-400 hover:text-rose-500 transition-colors duration-300"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <div
              className={`transition-all duration-500 delay-[600ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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
                  'Đăng nhập'
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
