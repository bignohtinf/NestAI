'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { MomDashboard } from '@/components/dashboards/mom-dashboard';
import { DadDashboard } from '@/components/dashboards/dad-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isLoading } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router, mounted]);

  // Render loading state only on client after mount to avoid hydration mismatch
  if (!mounted || isLoading) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Only render dashboard after mount and user is loaded
  if (!user) {
    return null;
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
