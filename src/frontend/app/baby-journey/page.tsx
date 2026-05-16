'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { BabyJourneyTracker } from '@/components/baby-journey/baby-journey-tracker';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';

export default function BabyJourneyPage() {
  const { ready } = useAuthGuard({ blockedRoles: ['admin'] });
  if (!ready) return null;

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
