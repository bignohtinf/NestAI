'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { NutritionRecommendations } from '@/components/metrics/nutrition-recommendations';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NutritionPage() {
  const { user } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'mother') {
      router.push('/');
    }
  }, [user, router]);

  if (!mounted || !user || user.role !== 'mother') {
    return null;
  }

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
