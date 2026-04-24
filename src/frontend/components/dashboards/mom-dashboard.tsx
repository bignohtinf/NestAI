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
  ChevronRight,
  Utensils,
  HeartPulse,
  AlertCircle,
  User,
} from 'lucide-react';

// Pregnancy micronutrients with PRD-aligned targets
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
    tip: 'T2-T3: 27mg/ngày',
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
    tip: 'Ngăn dị tật ống thần kinh',
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
    tip: 'Xương & răng thai nhi',
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
    tip: 'Não & mắt thai nhi',
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

  // Derive pregnancy week label — support both pregnant and postpartum
  let weekLabel = '';
  if (user.babyStatus === 'pregnant' && user.gestationWeeks != null) {
    weekLabel = `Tuần ${user.gestationWeeks} thai kỳ`;
  } else if (user.babyStatus === 'born' && user.weeksPostpartum != null) {
    weekLabel = `Tuần ${user.weeksPostpartum} sau sinh`;
  } else {
    weekLabel = 'Thai kỳ';
  }

  const isProfileIncomplete = !user.babyStatus || (!user.gestationWeeks && !user.dueDate);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Xin chào, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            {weekLabel} •{' '}
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        {(user?.points ?? 0) > 0 && (
          <Badge variant="default" className="text-xs">
            {user.points} điểm
          </Badge>
        )}
      </div>

      {/* Profile incomplete banner */}
      {isProfileIncomplete && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              Hoàn thiện hồ sơ thai kỳ để nhận thực đơn cá nhân hóa
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              AI cần biết tuần thai và tình trạng sức khỏe của bạn
            </p>
          </div>
          <Button asChild size="sm" variant="secondary" className="shrink-0 h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
            <Link href="/profile">
              <User className="h-3 w-3 mr-1" />
              Cập nhật
            </Link>
          </Button>
        </div>
      )}

      {/* ===== HERO: Sinh Thực Đơn ===== */}
      <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-background to-emerald-50 dark:to-emerald-950/20 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Thực đơn dinh dưỡng AI
                </span>
              </div>
              <p className="text-base font-semibold text-foreground">
                Sinh thực đơn hôm nay
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                AI gợi ý món Việt cá nhân hóa theo tuần thai, bệnh lý và sở thích của bạn
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="default" className="text-xs">
                  🤰 Theo tuần thai
                </Badge>
                <Badge variant="default" className="text-xs">
                  🩺 Theo bệnh lý
                </Badge>
                <Badge variant="default" className="text-xs">
                  🍚 Món Việt
                </Badge>
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
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <Link href="/nutrition-scan?tab=scan">
                  <Camera className="h-4 w-4" />
                  Quét ảnh bữa ăn
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vi chất thai kỳ hôm nay */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Vi chất thai kỳ hôm nay
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
            >
              <Link href="/nutrition-scan?tab=scan">
                <Camera className="h-3 w-3" />
                Thêm bữa ăn
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chụp ảnh bữa ăn để AI tự động tính — không cần nhập tay
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PREGNANCY_MICROS.map((micro) => (
              <div
                key={micro.key}
                className={`${micro.bg} border ${micro.border} rounded-xl p-3 text-center`}
              >
                <div className="text-xl mb-1">{micro.icon}</div>
                <p className={`text-sm font-bold ${micro.color}`}>—</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {micro.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  mục tiêu {micro.target}
                  {micro.unit}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Dữ liệu sẽ cập nhật sau khi bạn quét ảnh bữa ăn
          </p>
        </CardContent>
      </Card>

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
