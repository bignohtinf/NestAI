'use client';

import { useApp } from '@/lib/context';
import { formatGestationAge } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetTracker } from '@/components/metrics/budget-tracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { DadDashboardTimeline } from './dad-dashboard-timeline';
import { DadPriorityTasks } from './dad-priority-tasks';
import { MomHealthStatus } from './mom-health-status';
import {
  ShoppingCart,
  ChefHat,
  Dumbbell,
  BedDouble,
  Star,
  TrendingUp,
  Heart,
  Baby,
  MessageCircle,
  ChevronRight,
  CalendarCheck,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: 'health' | 'household' | 'emotional';
  priority: 'urgent' | 'high' | 'normal';
  completed: boolean;
  description?: string;
  dueTime?: string;
}

interface BabyData {
  id: string;
  name: string;
  status: 'pregnant' | 'born';
  date_of_birth?: string;
  gestation_weeks?: number;
  gender?: string;
}

const SUPPORT_ACTIONS = [
  {
    icon: <ChefHat className="h-5 w-5 text-orange-500" />,
    bg: 'bg-orange-50 border-orange-100',
    title: 'Nấu ăn dinh dưỡng',
    desc: 'Chuẩn bị các công thức được khuyến nghị cho mẹ',
    href: '/nutrition-scan',
  },
  {
    icon: <ShoppingCart className="h-5 w-5 text-emerald-500" />,
    bg: 'bg-emerald-50 border-emerald-100',
    title: 'Đi chợ hộ mẹ',
    desc: 'Mua các thực phẩm và đồ dùng cần thiết',
    href: '/shopping',
  },
  {
    icon: <Dumbbell className="h-5 w-5 text-blue-500" />,
    bg: 'bg-blue-50 border-blue-100',
    title: 'Hỗ trợ vận động',
    desc: 'Đồng hành cùng mẹ đi dạo hoặc tập nhẹ',
    href: '/chat',
  },
  {
    icon: <BedDouble className="h-5 w-5 text-violet-500" />,
    bg: 'bg-violet-50 border-violet-100',
    title: 'Đảm bảo nghỉ ngơi',
    desc: 'Giúp mẹ có giấc ngủ đủ giấc mỗi tối',
    href: '/chat',
  },
];

export function DadDashboard() {
  const { user } = useApp();
  const [milkScore, setMilkScore] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [baby, setBaby] = useState<BabyData | null>(null);
  const [momHealthData, setMomHealthData] = useState({
    sleepHours: 0,
    hydrationLevel: 0,
    activityLevel: 0,
    stressLevel: 0,
    mood: 'neutral' as 'happy' | 'neutral' | 'sad',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const timeoutId = setTimeout(() => setLoading(false), 5000);

        // Use apiCall helper instead of direct fetch to avoid Mixed Content
        const { apiCall } = await import('@/lib/api');
        const results = await Promise.allSettled([
          apiCall<any>(`/api/health/current-score?user_id=${user.id}`).catch(() => null),
          apiCall<any>(`/api/health/daily-stats?user_id=${user.id}`).catch(() => null),
          apiCall<any>(`/api/babies?user_id=${user.id}`).catch(() => null),
          apiCall<any>(`/api/tasks?user_id=${user.id}`).catch(() => null),
        ]);

        if (results[0].status === 'fulfilled' && results[0].value) {
          setMilkScore(results[0].value.score || 0);
        }
        if (results[1].status === 'fulfilled' && results[1].value) {
          const d = results[1].value;
          setMomHealthData({
            sleepHours: d.sleep_hours || 0,
            hydrationLevel: d.hydration_level || 0,
            activityLevel: d.activity_level || 0,
            stressLevel: d.stress_level || 0,
            mood: d.mood || 'neutral',
          });
        }
        if (results[2].status === 'fulfilled' && results[2].value?.babies?.length > 0) {
          setBaby(results[2].value.babies[0]);
        }
        if (results[3].status === 'fulfilled' && results[3].value?.tasks) {
          setTasks(results[3].value.tasks);
        }

        clearTimeout(timeoutId);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  if (!user) return null;

  // Ưu tiên babyStatus từ context (đã được tính qua medical profile + baby API)
  // Fallback sang baby local state nếu context chưa load xong
  const babyStatus = user.babyStatus ?? baby?.status ?? 'born';
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Chào {user?.name}! 💪
          </h2>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' '}• Hỗ trợ mẹ và bé tốt nhất có thể
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(user?.points ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full border border-amber-200 font-medium text-sm">
              <Star className="h-3.5 w-3.5" />
              <span>{user.points} điểm</span>
            </div>
          )}
          {totalTasks > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              <CalendarCheck className="h-3 w-3 mr-1" />
              {completedTasks}/{totalTasks} nhiệm vụ
            </Badge>
          )}
        </div>
      </div>

      {/* ── KPI summary bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: <Heart className="h-4 w-4 text-rose-500" />,
            label: 'Điểm sữa',
            value: milkScore || '—',
            suffix: '/100',
            color: 'bg-rose-50 text-rose-700 border-rose-100',
          },
          {
            icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
            label: 'Vận động mẹ',
            value: `${momHealthData.activityLevel}%`,
            suffix: '',
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          },
          {
            icon: <Baby className="h-4 w-4 text-blue-500" />,
            label: babyStatus === 'pregnant' ? 'Tuần thai' : 'Tuần sau sinh',
            value: babyStatus === 'pregnant'
              ? formatGestationAge(user.gestationWeeks, user.daysInWeek)
              : user.weeksPostpartum != null ? `${user.weeksPostpartum} tuần` : '—',
            suffix: '',
            color: 'bg-blue-50 text-blue-700 border-blue-100',
          },
          {
            icon: <MessageCircle className="h-4 w-4 text-violet-500" />,
            label: 'Tâm trạng mẹ',
            value: momHealthData.mood === 'happy' ? '😊 Vui' : momHealthData.mood === 'sad' ? '😔 Buồn' : '😐 Bình thường',
            suffix: '',
            color: 'bg-violet-50 text-violet-700 border-violet-100',
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl border p-3 shadow-sm flex items-center gap-3 ${kpi.color}`}>
            <div className="shrink-0">{kpi.icon}</div>
            <div className="min-w-0">
              <p className="text-xs opacity-70 truncate">{kpi.label}</p>
              <p className="text-sm font-bold truncate">
                {kpi.value}{kpi.suffix && <span className="text-xs font-normal ml-0.5">{kpi.suffix}</span>}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 3-column grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left/center columns (xl:col-span-2) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Timeline + Tasks in a 2-col at lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DadDashboardTimeline
              weeksPostpartum={babyStatus === 'born' ? (user.weeksPostpartum || 0) : undefined}
              weeksPregnant={babyStatus === 'pregnant' ? (user.gestationWeeks || baby?.gestation_weeks || 0) : undefined}
              babyStatus={babyStatus}
            />

            {/* Support actions */}
            <Card className="border border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Bạn có thể giúp gì?
                </CardTitle>
                <CardDescription className="text-xs">Những cách để hỗ trợ mẹ hôm nay</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {SUPPORT_ACTIONS.map((action) => (
                  <a key={action.title} href={action.href} className="group flex items-center gap-3 p-2.5 rounded-xl border hover:shadow-sm transition-all cursor-pointer bg-white hover:bg-muted/20" style={{ textDecoration: 'none' }}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${action.bg} group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{action.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug truncate">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Priority tasks */}
          <DadPriorityTasks
            tasks={tasks}
            momHealthScore={milkScore}
            onTaskComplete={handleTaskComplete}
          />

        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Mom's health */}
          <MomHealthStatus
            milkScore={milkScore}
            sleepHours={momHealthData.sleepHours}
            hydrationLevel={momHealthData.hydrationLevel}
            activityLevel={momHealthData.activityLevel}
            stressLevel={momHealthData.stressLevel}
            mood={momHealthData.mood}
            alerts={milkScore > 0 && milkScore < 60 ? ['Điểm sữa thấp – cần tăng cường hỗ trợ dinh dưỡng'] : []}
          />

          {/* Budget tracker */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">📊 Theo dõi kinh phí</CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs rounded-full px-3 text-primary hover:bg-primary/10">
                  <a href="/budget">
                    Chi tiết <ChevronRight className="h-3 w-3 ml-0.5" />
                  </a>
                </Button>
              </div>
              <CardDescription className="text-xs">Quản lý chi tiêu cho mẹ và bé</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <BudgetTracker />
            </CardContent>
          </Card>

          {/* Tip for dad */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">💡 Gợi ý cho bố hôm nay</p>
            <p className="text-sm text-blue-900 leading-relaxed">
              {momHealthData.stressLevel > 70
                ? 'Mẹ đang căng thẳng. Hãy sắp xếp để mẹ có 30 phút thư giãn một mình.'
                : momHealthData.sleepHours < 5
                ? 'Mẹ ngủ ít quá! Hãy trông bé tối nay để mẹ ngủ đủ giấc nhé.'
                : momHealthData.hydrationLevel < 50
                ? 'Nhắc mẹ uống nước đều đặn – ít nhất 8–10 ly mỗi ngày.'
                : 'Mẹ đang trong trạng thái tốt! Tiếp tục hỗ trợ nhé 💪'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
