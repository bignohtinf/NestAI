'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { MilkBabyImpact } from '@/components/metrics/milk-baby-impact';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MilkBabyImpactPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'mother') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sữa & Bé</h1>
          <p className="text-muted-foreground">Theo dõi ảnh hưởng của dinh dưỡng đến sữa mẹ và bé</p>
        </div>

        <MilkBabyImpact />
      </div>
    </MainLayout>
  );
}
