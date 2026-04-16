'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { FamilyStatus } from '@/components/metrics/family-status';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FamilyStatusPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'father') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gia đình</h1>
          <p className="text-muted-foreground">Radar của bố - theo dõi tình trạng mẹ và bé</p>
        </div>

        <FamilyStatus />
      </div>
    </MainLayout>
  );
}
