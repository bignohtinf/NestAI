'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { MomDashboard } from '@/components/dashboards/mom-dashboard';
import { DadDashboard } from '@/components/dashboards/dad-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { LandingPage } from '@/components/landing/landing-page';
import { useApp } from '@/lib/context';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isLoading } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
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

  return (
    <HomeLayout>
      {user.role === 'admin' ? (
        <AdminDashboard />
      ) : user.role === 'mother' ? (
        <MomDashboard />
      ) : (
        <DadDashboard />
      )}
    </HomeLayout>
  );
}
