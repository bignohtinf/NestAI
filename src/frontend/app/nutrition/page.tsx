'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { NutritionRecommendations } from '@/components/metrics/nutrition-recommendations';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NutritionPage() {
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
          <h1 className="text-3xl font-bold">Dinh dưỡng</h1>
          <p className="text-muted-foreground">Gợi ý món ăn và tìm cửa hàng gần đó</p>
        </div>

        <NutritionRecommendations />
      </div>
    </MainLayout>
  );
}
