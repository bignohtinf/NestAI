'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context';

type Step = 'role' | 'partner-info';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { login } = useApp();
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<'mother' | 'father' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [partnerInfo, setPartnerInfo] = useState({
    email: '',
    phone: '',
  });

  const handleRoleSelect = (role: 'mother' | 'father') => {
    setSelectedRole(role);
    if (role === 'mother') {
      // Mother doesn't need to add partner info now
      handleConfirmRole(role);
    } else {
      // Father needs to provide mother's contact info
      setStep('partner-info');
    }
  };

  const handleConfirmRole = async (role: 'mother' | 'father') => {
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
    setPartnerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        {step === 'role' ? (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Chọn vai trò</CardTitle>
              <CardDescription>Bạn là bố hay mẹ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleRoleSelect('mother')}
                disabled={loading}
                className="w-full h-24 text-lg"
                variant="outline"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">👩</div>
                  <div>Tôi là Mẹ</div>
                </div>
              </Button>

              <Button
                onClick={() => handleRoleSelect('father')}
                disabled={loading}
                className="w-full h-24 text-lg"
                variant="outline"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">👨</div>
                  <div>Tôi là Bố</div>
                </div>
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Bạn có thể thay đổi vai trò sau trong cài đặt
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Thông tin mẹ</CardTitle>
              <CardDescription>
                Nhập thông tin liên hệ của mẹ để gửi yêu cầu kết nối
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendPartnerRequest} className="space-y-4">
                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email của mẹ</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mother@email.com"
                    value={partnerInfo.email}
                    onChange={handlePartnerInfoChange}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Hoặc số điện thoại của mẹ</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+84 9xx xxx xxx"
                    value={partnerInfo.phone}
                    onChange={handlePartnerInfoChange}
                    disabled={loading}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Mẹ sẽ nhận được yêu cầu kết nối và có thể chấp nhận hoặc từ chối.
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('role')}
                    disabled={loading}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
