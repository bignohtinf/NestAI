'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { MomDashboard } from '@/components/dashboards/mom-dashboard';
import { DadDashboard } from '@/components/dashboards/dad-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      {user.role === 'admin' ? (
        <AdminDashboard />
      ) : user.role === 'mother' ? (
        <MomDashboard />
      ) : (
        <DadDashboard />
      )}
    </MainLayout>
  );
}
