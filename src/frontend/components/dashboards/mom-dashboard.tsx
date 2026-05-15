'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { formatGestationAge } from '@/lib/utils';
import { nutritionApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestCard } from '@/components/gamification/quest-card';
import {
  Sparkles,
  Camera,
  HeartPulse,
  AlertCircle,
  ChevronRight,
  MessageCircle,
  Droplets,
  Moon,
  Footprints,
  Flame,
  Baby,
  CalendarDays,
  Utensils,
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
    bar: 'bg-red-400',
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
    bar: 'bg-green-400',
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
    bar: 'bg-blue-400',
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
    bar: 'bg-indigo-400',
    border: 'border-indigo-100',
  },
];

const QUICK_ACTIONS = [
  {
    href: '/nutrition-scan',
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    bg: 'from-primary/10 to-primary/5',
    iconBg: 'bg-white',
    title: 'Thực đơn AI',
    desc: 'Gợi ý món ăn chuẩn y khoa',
  },
  {
    href: '/nutrition-scan',
    icon: <Camera className="h-5 w-5 text-emerald-600" />,
    bg: 'from-emerald-50 to-emerald-100/50',
    iconBg: 'bg-white',
    title: 'Quét bữa ăn',
    desc: 'Phân tích dinh dưỡng từ ảnh',
  },
  {
    href: '/chat',
    icon: <MessageCircle className="h-5 w-5 text-violet-600" />,
    bg: 'from-violet-50 to-violet-100/50',
    iconBg: 'bg-white',
    title: 'Hỏi Nori',
    desc: 'Trợ lý AI đồng hành 24/7',
  },
];

const DAILY_STATS = [
  { icon: <Flame className="h-4 w-4 text-orange-500" />, label: 'Calo', value: '0', target: '2200', unit: 'kcal', color: 'bg-orange-100 text-orange-700' },
  { icon: <Droplets className="h-4 w-4 text-blue-500" />, label: 'Nước', value: '0', target: '2.5', unit: 'lít', color: 'bg-blue-100 text-blue-700' },
  { icon: <Footprints className="h-4 w-4 text-teal-500" />, label: 'Bước chân', value: '0', target: '7000', unit: 'bước', color: 'bg-teal-100 text-teal-700' },
  { icon: <Moon className="h-4 w-4 text-indigo-500" />, label: 'Giấc ngủ', value: '0', target: '8', unit: 'giờ', color: 'bg-indigo-100 text-indigo-700' },
];

const HEALTH_TIPS: Record<string, string[]> = {
  pregnant: [
    '🧘 Tập yoga nhẹ giúp giảm đau lưng và cải thiện giấc ngủ.',
    '💊 Uống bổ sung sắt và folate đúng giờ mỗi ngày.',
    '🚶 Đi bộ 15–20 phút mỗi sáng giúp kiểm soát đường huyết.',
    '🍵 Uống đủ 2–3 lít nước, tránh caffeine quá 200mg/ngày.',
  ],
  born: [
    '🤱 Cho bé bú đúng giờ giúp duy trì nguồn sữa ổn định.',
    '😴 Tranh thủ ngủ khi bé ngủ để phục hồi năng lượng.',
    '🥗 Ăn thực phẩm giàu protein để hỗ trợ tiết sữa.',
    '🧘 15 phút thiền mỗi ngày giảm stress sau sinh hiệu quả.',
  ],
};

/** Trả về ngày đầu tuần (thứ 2) của một ngày bất kỳ — ISO string yyyy-MM-dd */
function getWeekMonday(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

export function MomDashboard() {
  const { user } = useApp();
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Dữ liệu dinh dưỡng hôm nay ──
  const [todayCalories, setTodayCalories] = useState(0);
  const [microNutrients, setMicroNutrients] = useState({ iron: 0, calcium: 0 });

  // ── Wellness hôm nay (nước + giấc ngủ) ──
  const [wellnessToday, setWellnessToday] = useState({ waterLiters: 0, sleepHours: 0 });

  // ── Quests ──
  const [quests, setQuests] = useState<import('@/lib/context').Quest[]>([]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ── Fetch dinh dưỡng hôm nay (meal plan + nutrition summary) ──
  const fetchTodayNutrition = useCallback(async () => {
    if (!user?.id) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = getWeekMonday(new Date());

      // 1. Lấy thực đơn ngày hôm nay để hiển thị calories/macros
      const weekRes = await nutritionApi.getWeeklyMealPlans(user.id, weekStart);
      const todayPlan = (weekRes.plans as Record<string, any>)?.[today];
      if (todayPlan?.plan_data?.nutrition_summary?.total) {
        const t = todayPlan.plan_data.nutrition_summary.total;
        setTodayCalories(Math.round(t.energy || 0));
      }

      // 2. Lấy vi chất từ nutrition_summary (đọc từ food_scan_logs + nutrition_logs)
      try {
        const summary = await nutritionApi.getSummary(user.id, 1);
        const micros: any[] = summary?.micro_nutrients ?? [];
        const ironPct  = micros.find(m => m.name.includes('Iron') || m.name.includes('Sắt'))?.value ?? 0;
        const calciumPct = micros.find(m => m.name.includes('Calcium') || m.name.includes('Canxi'))?.value ?? 0;
        // Chuyển % RDA → mg thực tế (RDA iron=27mg, calcium=1000mg)
        setMicroNutrients({
          iron:    Math.round(ironPct    * 27   / 100 * 10) / 10,
          calcium: Math.round(calciumPct * 1000 / 100),
        });
      } catch {
        // Vi chất là tuỳ chọn — silent fail
      }
    } catch {
      // Silently fail, dashboard hiển thị 0
    }
  }, [user?.id]);

  // ── Fetch wellness entry hôm nay ──
  const fetchWellnessToday = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/wellness/today?user_id=${user.id}`);
      if (!res.ok) return;
      const { entry } = await res.json();
      if (!entry) return;
      setWellnessToday({
        waterLiters: entry.water_intake_ml ? Math.round(entry.water_intake_ml / 100) / 10 : 0,
        sleepHours:  entry.sleep_hours     ?? 0,
      });
    } catch {
      // silent fail
    }
  }, [user?.id]);

  // ── Fetch quests ──
  const fetchQuests = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/quests?user_id=${user.id}`);
      if (!res.ok) return;
      const { quests: data } = await res.json();
      setQuests(data ?? []);
    } catch {
      // silent fail
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isHydrated || !user?.id) return;
    fetchTodayNutrition();
    fetchWellnessToday();
    fetchQuests();

    const handleUpdate = () => fetchTodayNutrition();
    window.addEventListener('mealPlanSaved',    handleUpdate);
    window.addEventListener('nutritionLogSaved', handleUpdate);
    return () => {
      window.removeEventListener('mealPlanSaved',    handleUpdate);
      window.removeEventListener('nutritionLogSaved', handleUpdate);
    };
  }, [isHydrated, user?.id, fetchTodayNutrition, fetchWellnessToday, fetchQuests]);

  const activeQuests = (quests || []).filter((q) => !q.completed).slice(0, 3);

  if (!user || !isHydrated) {
    return null;
  }

  const babyStatus = user.babyStatus ?? 'pregnant';

  let weekLabel = 'Thai kỳ';
  let weekNumber = 0;
  let totalWeeks = 40;
  if (babyStatus === 'pregnant' && user.gestationWeeks != null) {
    weekLabel = formatGestationAge(user.gestationWeeks, user.daysInWeek);
    weekNumber = user.gestationWeeks;
    totalWeeks = 40;
  } else if (babyStatus === 'born' && user.weeksPostpartum != null) {
    weekLabel = `Tuần ${user.weeksPostpartum} sau sinh`;
    weekNumber = user.weeksPostpartum;
    totalWeeks = 52;
  }

  const weekProgress = Math.min(100, Math.round((weekNumber / totalWeeks) * 100));
  const isProfileIncomplete = !user.dob;
  const tips = HEALTH_TIPS[babyStatus] ?? HEALTH_TIPS.pregnant;
  const todayTip = tips[new Date().getDay() % tips.length];

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Xin chào, {user?.name}! 👋
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md text-sm">
              {weekLabel}
            </span>
            <span className="text-sm">
              • {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(user?.points ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-200 font-medium text-sm">
              <span>🌟</span>
              <span>{user.points} điểm</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs font-normal">
            {babyStatus === 'pregnant' ? '🤰 Đang mang thai' : '👶 Sau sinh'}
          </Badge>
        </div>
      </div>

      {/* ── Profile incomplete warning ── */}
      {isProfileIncomplete && (
        <div className="flex items-center gap-2 bg-blue-50/50 text-blue-800 px-3 py-2 rounded-lg border border-blue-100/50 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
          <p>
            💡 <Link href="/profile" className="font-medium underline underline-offset-2 hover:text-blue-900">Hoàn thiện hồ sơ cá nhân</Link> để AI cá nhân hóa thực đơn chính xác hơn cho bạn.
          </p>
        </div>
      )}

      {/* ── Daily stats bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DAILY_STATS.map((stat) => {
          // Cập nhật giá trị thực tế theo từng stat
          const value =
            stat.label === 'Calo'      && todayCalories             > 0 ? todayCalories.toString() :
            stat.label === 'Nước'      && wellnessToday.waterLiters  > 0 ? wellnessToday.waterLiters.toFixed(1) :
            stat.label === 'Giấc ngủ' && wellnessToday.sleepHours   > 0 ? wellnessToday.sleepHours.toFixed(1) :
            stat.value;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-border/60 p-3 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-foreground truncate">
                  {value}<span className="text-xs font-normal text-muted-foreground ml-1">/{stat.target} {stat.unit}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href + action.title} href={action.href} className="block group">
            <Card className={`h-full border-0 bg-gradient-to-br ${action.bg} shadow-sm hover:shadow-md transition-all duration-300`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-11 h-11 ${action.iconBg} rounded-2xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground mb-0.5">{action.title}</h3>
                  <p className="text-xs text-muted-foreground leading-snug">{action.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── Main 2-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Vi chất + week progress */}
        <div className="space-y-5">

          {/* Vi chất */}
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" />
                  Mục tiêu vi chất hôm nay
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs rounded-full px-3 text-primary hover:bg-primary/10">
                  <Link href="/nutrition-scan">Cập nhật</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {PREGNANCY_MICROS.map((micro) => {
                // Map dữ liệu thực tế vào từng vi chất
                const current =
                  micro.key === 'iron'    ? microNutrients.iron :
                  micro.key === 'calcium' ? microNutrients.calcium :
                  0; // folate & DHA chưa có nguồn dữ liệu
                const pct = Math.min(100, Math.round((current / micro.target) * 100));
                return (
                  <div key={micro.key} className="flex items-center gap-3">
                    <span className="text-xl w-7 text-center shrink-0">{micro.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">{micro.label}</span>
                        <span className={`text-xs font-bold ${micro.color}`}>{current} / {micro.target} {micro.unit}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${micro.bar} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Thai kỳ / Sau sinh progress */}
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Baby className="h-4 w-4 text-rose-500" />
                {babyStatus === 'pregnant' ? 'Hành trình thai kỳ' : 'Hành trình sau sinh'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tuần {weekNumber}</span>
                <span className="font-semibold text-foreground">{weekProgress}%</span>
                <span className="text-muted-foreground">Tuần {totalWeeks}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-primary rounded-full transition-all"
                  style={{ width: `${weekProgress}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="text-center p-2 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="text-xs text-muted-foreground">Tuần hiện tại</p>
                  <p className="text-lg font-bold text-rose-600">{weekNumber}</p>
                </div>
                <div className="text-center p-2 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground">Còn lại</p>
                  <p className="text-lg font-bold text-primary">{totalWeeks - weekNumber}</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs text-muted-foreground">Hoàn thành</p>
                  <p className="text-lg font-bold text-amber-600">{weekProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right: Quests + health tip */}
        <div className="space-y-5">

          {/* Nhiệm vụ hôm nay */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  Nhiệm vụ hôm nay
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs rounded-full px-3 text-primary hover:bg-primary/10">
                  <Link href="/quests">
                    Xem tất cả <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {activeQuests.length > 0 ? (
                <div className="space-y-3">
                  {activeQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HeartPulse className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm font-medium">Bạn đã hoàn thành tất cả nhiệm vụ hôm nay! 🎉</p>
                  <p className="text-xs mt-1">Tiếp tục duy trì thói quen tốt nhé.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lịch & nhắc nhở */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-violet-500" />
                  Nhắc nhở sắp tới
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { emoji: '💊', label: 'Uống viên sắt & folate', time: '08:00', done: false },
                { emoji: '🥛', label: 'Uống sữa bầu', time: '10:00', done: false },
                { emoji: '🧘', label: 'Tập yoga nhẹ 15 phút', time: '17:00', done: false },
                { emoji: '💤', label: 'Nghỉ ngơi buổi trưa', time: '13:00', done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <span className="text-lg w-7 text-center shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.done ? 'bg-green-400' : 'bg-amber-400'}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tip of the day */}
          <div className="bg-gradient-to-br from-primary/5 to-rose-50 border border-primary/10 rounded-2xl p-4 flex gap-3">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Mẹo sức khoẻ hôm nay</p>
              <p className="text-sm text-foreground leading-relaxed">{todayTip}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
