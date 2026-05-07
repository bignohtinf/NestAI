'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NutritionScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother' && user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || (user.role !== 'mother' && user.role !== 'father')) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="pt-2">
          {children}
        </div>
      </div>
    </MainLayout>
  );
}
