'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { MomDashboard } from '@/components/dashboards/mom-dashboard';
import { DadDashboard } from '@/components/dashboards/dad-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { LandingPage } from '@/components/landing/landing-page';
import { useApp } from '@/lib/context';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isLoading, sessionStatus, fetchUserData } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Session check failed (have a session but couldn't load user record).
  // Don't show the LandingPage — that would look like a forced logout.
  if (sessionStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf3f1]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Không tải được phiên đăng nhập</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Có thể do mạng chậm hoặc máy chủ đang quá tải. Phiên đăng nhập của bạn vẫn còn hiệu lực.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fetchUserData()}
              className="px-4 py-2 rounded-lg bg-[#c8564a] hover:bg-[#b04a40] text-white text-sm font-medium"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mounted || sessionStatus === 'checking' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf3f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8564a] mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Admin users → redirect to admin section
  if (user.role === 'admin') {
    if (typeof window !== 'undefined') window.location.href = '/admin';
    return null;
  }

  // Role not selected yet → OnboardingGuard handles redirect to /auth/role-selection
  if (!user.role) return null;

  return (
    <HomeLayout fullWidth>
      {user.role === 'mother' ? <MomDashboard /> : <DadDashboard />}
    </HomeLayout>
  );
}
