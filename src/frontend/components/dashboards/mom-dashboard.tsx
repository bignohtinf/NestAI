'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MilkScoreGauge } from '@/components/metrics/milk-score-gauge';
import { QuickStats } from '@/components/metrics/quick-stats';
import { QuestCard } from '@/components/gamification/quest-card';
import { Sparkles, Camera, ChevronRight, Utensils, HeartPulse } from 'lucide-react';

export function MomDashboard() {
  const { user, quests } = useApp();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const activeQuests = (quests || []).filter((q) => !q.completed).slice(0, 2);

  if (!user || !isHydrated) {
    return null;
  }

  const weekLabel = (user?.weeksPostpartum ?? 0) > 0
    ? `Tuần ${user.weeksPostpartum} sau sinh`
    : `Đang mang thai`;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Xin chào, {user?.name}! 👋</h2>
          <p className="text-muted-foreground text-sm">{weekLabel} • {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Badge variant="default" className="text-xs">{user?.points} điểm</Badge>
      </div>

      {/* ===== HERO: Sinh Thực Đơn ===== */}
      <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-background to-green-50 dark:to-green-950/20 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">Thực đơn dinh dưỡng AI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                AI sinh thực đơn món Việt cá nhân hóa theo tuần thai, bệnh lý và sở thích của bạn
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="default" className="text-xs">🤰 Theo tuần thai</Badge>
                <Badge variant="default" className="text-xs">🩺 Theo bệnh lý</Badge>
                <Badge variant="default" className="text-xs">🍚 Món Việt</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                <Link href="/nutrition-scan?tab=recommendations">
                  <Utensils className="h-4 w-4" />
                  Sinh thực đơn hôm nay
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="gap-2 w-full sm:w-auto">
                <Link href="/nutrition-scan?tab=scan">
                  <Camera className="h-4 w-4" />
                  Quét ảnh bữa ăn
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary: Vi chất + Sức khỏe */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Vi chất hôm nay</CardTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Link href="/nutrition-scan?tab=scan">
                  <Camera className="h-3 w-3" />
                  Thêm bữa ăn
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MilkScoreGauge score={user?.milkScore || 82} />
          </CardContent>
        </Card>

        {/* Milk Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Điểm Sữa Mẹ</CardTitle>
            <CardDescription className="text-xs">Chất lượng dinh dưỡng cho bé</CardDescription>
          </CardHeader>
          <CardContent>
            <MilkScoreGauge score={user?.milkScore || 82} />
          </CardContent>
        </Card>
      </div>

      {/* Tertiary: Quests */}
      {activeQuests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              Nhiệm vụ sức khỏe
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
