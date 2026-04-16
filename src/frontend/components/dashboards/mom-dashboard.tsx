'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MilkScoreGauge } from '@/components/metrics/milk-score-gauge';
import { QuickStats } from '@/components/metrics/quick-stats';
import { QuestCard } from '@/components/gamification/quest-card';
import { LayoutGrid } from 'lucide-react';

export function MomDashboard() {
  const { user, quests } = useApp();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const activeQuests = (quests || []).filter((q) => !q.completed).slice(0, 3);

  if (!user || !isHydrated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Chào mừng, {user?.name}!</h2>
        <p className="text-muted-foreground">
          Tuần {user?.weeksPostpartum} sau sinh • Điểm: {user?.points}
        </p>
      </div>

      {/* Main Metrics Grid */}
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
            <CardTitle className="text-lg">Tóm tắt Hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickStats />
          </CardContent>
        </Card>
      </div>

      {/* Active Quests */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Nhiệm vụ Hoạt động</h3>
        {activeQuests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Không có nhiệm vụ hoạt động</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Gợi ý:</strong> Sử dụng sidebar để truy cập các tính năng chi tiết như Smart Scan, Dinh dưỡng, Sữa & Bé
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
