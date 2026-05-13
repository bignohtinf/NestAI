'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Step = 'role' | 'partner-info';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<'mother' | 'father' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [partnerInfo, setPartnerInfo] = useState({ email: '', phone: '' });

  const handleRoleSelect = (role: 'mother' | 'father') => {
    setSelectedRole(role);
    if (role === 'mother') {
      handleConfirmRole(role);
    } else {
      setStep('partner-info');
    }
  };

  const handleConfirmRole = async (_role: 'mother' | 'father') => {
    setLoading(true);
    setError('');
    try {
      // TODO: Call API to update user role
      // const response = await fetch('/api/auth/set-role', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ role }),
      // });

      login(role, role === 'mother' ? 'Mẹ' : 'Bố');
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartnerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendPartnerRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!partnerInfo.email && !partnerInfo.phone) {
        throw new Error('Vui lòng nhập email hoặc số điện thoại của mẹ');
      }
      // TODO: Call API to send partnership request
      // const response = await fetch('/api/partnerships/request', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     partnerEmail: partnerInfo.email,
      //     partnerPhone: partnerInfo.phone,
      //   }),
      // });

      login('father', 'Bố');
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: 'linear-gradient(135deg, #fdf3f1 0%, #fff8f5 50%, #f5f0ff 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f5c5be, transparent)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4c5f5, transparent)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden">
            <Image
              src="/img_0174.png"
              alt="NestAI Logo"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 'role' ? 'Bạn là ai?' : 'Kết nối với mẹ'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {step === 'role'
              ? 'Chọn vai trò để nhận trải nghiệm phù hợp'
              : 'Nhập thông tin mẹ để kết nối theo dõi cùng nhau'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-deep p-6 sm:p-8">
          {step === 'role' ? (
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/8 text-destructive rounded-xl text-sm border border-destructive/20">
                  <span className="text-base">⚠️</span>
                  {error}
                </div>
              )}

              {/* Mother — PRIMARY (PRD core user) */}
              <button
                onClick={() => handleRoleSelect('mother')}
                disabled={loading}
                className="w-full rounded-2xl border-2 p-5 text-left transition-all hover:border-primary hover:bg-primary/4 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: '#c8564a', background: 'rgba(200,86,74,0.04)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                    style={{ background: 'linear-gradient(135deg, #fdf3f1, #ffe8e5)' }}>
                    🤰
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">Tôi là Mẹ</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Đang mang thai hoặc đang cho con bú
                    </p>
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#c8564a' }}>
                      ✨ Nhận thực đơn AI cá nhân hóa theo tuần thai
                    </p>
                  </div>
                </div>
              </button>

              {/* Father — secondary */}
              <button
                onClick={() => handleRoleSelect('father')}
                disabled={loading}
                className="w-full rounded-2xl border border-border/60 p-5 text-left transition-all hover:border-border hover:bg-muted/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-muted">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Tôi là Bố</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Hỗ trợ mẹ và theo dõi hành trình gia đình
                    </p>
                  </div>
                </div>
              </button>

              {loading && (
                <div className="flex justify-center pt-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground">
                Bạn có thể thay đổi trong cài đặt sau
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendPartnerRequest} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/8 text-destructive rounded-xl text-sm border border-destructive/20">
                  <span className="text-base">⚠️</span>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email của mẹ
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="me@email.com"
                  value={partnerInfo.email}
                  onChange={handlePartnerInfoChange}
                  disabled={loading}
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Hoặc số điện thoại của mẹ
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+84 9xx xxx xxx"
                  value={partnerInfo.phone}
                  onChange={handlePartnerInfoChange}
                  disabled={loading}
                  className="h-11 rounded-xl border-border/60 focus-visible:ring-primary/30"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Mẹ sẽ nhận yêu cầu kết nối và có thể chấp nhận hoặc từ chối.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl border border-border/60 font-semibold text-sm text-foreground hover:bg-muted transition-all disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #c8564a, #d46458)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi yêu cầu'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          NestAI — Đồng hành cùng hành trình thai kỳ của bạn
        </p>
      </div>
    </div>
  );
}
