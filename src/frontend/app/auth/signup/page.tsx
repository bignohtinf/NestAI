'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Mật khẩu không khớp');
      }

      if (formData.password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }

      // Call API to create user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Redirect to role selection
      router.push('/auth/role-selection');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #fdf3f1 0%, #fff8f5 50%, #f5f0ff 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f5c5be, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4c5f5, transparent)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <Image
              src="/IMG_0174.PNG"
              alt="NestAI Logo"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Đăng ký</h1>
          <p className="text-muted-foreground text-sm mt-1">Tạo tài khoản mới để bắt đầu</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-deep p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/8 text-destructive rounded-xl text-sm border border-destructive/20">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium">Họ và tên</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại (tùy chọn)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+84 9xx xxx xxx"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          NestAI — Đồng hành cùng hành trình thai kỳ của bạn
        </p>
      </div>
    </div>
  );
}
