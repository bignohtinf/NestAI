'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestCard } from '@/components/gamification/quest-card';
import {
  Sparkles,
  Camera,
  Utensils,
  HeartPulse,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

const PREGNANCY_MICROS = [
  {
    key: 'iron',
    label: 'Sắt',
    unit: 'mg',
    target: 27,
    icon: '🩸',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  {
    key: 'folate',
    label: 'Folate',
    unit: 'mcg',
    target: 600,
    icon: '🥬',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    key: 'calcium',
    label: 'Canxi',
    unit: 'mg',
    target: 1000,
    icon: '🥛',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    key: 'dha',
    label: 'DHA',
    unit: 'mg',
    target: 200,
    icon: '🐟',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
];

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

  let weekLabel = 'Thai kỳ';
  if (user.babyStatus === 'pregnant' && user.gestationWeeks != null) {
    weekLabel = `Tuần ${user.gestationWeeks} thai kỳ`;
  } else if (user.babyStatus === 'born' && user.weeksPostpartum != null) {
    weekLabel = `Tuần ${user.weeksPostpartum} sau sinh`;
  }

  const isProfileIncomplete = !user.babyStatus || (!user.gestationWeeks && !user.dueDate);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Xin chào, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md text-sm">
              {weekLabel}
            </span>
            <span className="text-sm">
              • {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>
        {(user?.points ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-200 font-medium text-sm">
            <span>🌟</span>
            <span>{user.points} điểm</span>
          </div>
        )}
      </div>

      {isProfileIncomplete && (
        <Link href="/profile" className="block">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 px-5 py-4 transition-colors hover:bg-amber-100/50">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                Hoàn thiện hồ sơ để cá nhân hóa thực đơn
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500" />
          </div>
        </Link>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Link href="/nutrition-scan" className="block group">
          <Card className="h-full border-0 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-0.5 truncate">
                  Thực đơn AI
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Gợi ý món ăn chuẩn y khoa cho mẹ bầu
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nutrition-scan" className="block group">
          <Card className="h-full border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-0.5 truncate">
                  Quét bữa ăn
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Phân tích dinh dưỡng từ ảnh chụp
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Vi chất */}
      <Card className="border border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Mục tiêu vi chất</CardTitle>
            <Button asChild variant="outline" size="sm" className="h-8 rounded-full border-border/60">
              <Link href="/nutrition-scan">
                <Utensils className="h-3.5 w-3.5 mr-1.5" />
                Cập nhật
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PREGNANCY_MICROS.map((micro) => (
              <div
                key={micro.key}
                className={`${micro.bg} border ${micro.border} rounded-2xl p-4 flex flex-col items-center justify-center text-center`}
              >
                <span className="text-2xl mb-2">{micro.icon}</span>
                <span className={`text-sm font-bold ${micro.color} mb-1`}>0 / {micro.target}</span>
                <span className="text-xs font-medium text-muted-foreground">{micro.label} ({micro.unit})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quests */}
      {activeQuests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            Nhiệm vụ hôm nay
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
