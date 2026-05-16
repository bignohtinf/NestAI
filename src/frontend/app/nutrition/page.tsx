'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { NutritionRecommendations } from '@/components/metrics/nutrition-recommendations';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';

export default function NutritionPage() {
  const { ready } = useAuthGuard({ allowedRoles: ['mother'] });
  if (!ready) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Khuyến Nghị Dinh Dưỡng</h1>
          <p className="text-muted-foreground">Nhận khuyến nghị dinh dưỡng cá nhân hóa</p>
        </div>

        <NutritionRecommendations />
      </div>
    </MainLayout>
  );
}
