'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { BabyJourneyTracker } from '@/components/baby-journey/baby-journey-tracker';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BabyJourneyPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role === 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <MainLayout fullWidth>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hành Trình Của Bé</h1>
          <p className="text-muted-foreground">Theo dõi sự phát triển và những cột mốc quan trọng của bé yêu</p>
        </div>
        <BabyJourneyTracker />
      </div>
    </MainLayout>
  );
}
