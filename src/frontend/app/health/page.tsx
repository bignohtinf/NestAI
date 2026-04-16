'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MilkScoreGauge } from '@/components/metrics/milk-score-gauge';
import { NutritionTracker } from '@/components/metrics/nutrition-tracker';
import { DailyChecklist } from '@/components/metrics/daily-checklist';
import { QuickStats } from '@/components/metrics/quick-stats';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HealthPage() {
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
          <h1 className="text-3xl font-bold">Sức khỏe</h1>
          <p className="text-muted-foreground">Theo dõi sức khỏe và dinh dưỡng của mẹ</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Milk Score */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Điểm Sữa</CardTitle>
              <CardDescription>Sức khỏe nuôi con bằng sữa mẹ</CardDescription>
            </CardHeader>
            <CardContent>
              <MilkScoreGauge score={user?.milkScore || 82} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Chỉ số Sức khỏe</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickStats />
            </CardContent>
          </Card>
        </div>

        {/* Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Theo dõi Dinh dưỡng chi tiết</CardTitle>
            <CardDescription>Lượng nạp từng bữa ăn</CardDescription>
          </CardHeader>
          <CardContent>
            <NutritionTracker />
          </CardContent>
        </Card>

        {/* Daily Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách Kiểm tra Hàng ngày</CardTitle>
            <CardDescription>Giữ cho mẹ khỏe mạnh</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyChecklist />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
