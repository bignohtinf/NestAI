'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetTracker } from '@/components/metrics/budget-tracker';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { DadDashboardTimeline } from './dad-dashboard-timeline';
import { DadPriorityTasks } from './dad-priority-tasks';
import { MomHealthStatus } from './mom-health-status';

interface Task {
  id: string;
  title: string;
  category: 'health' | 'household' | 'emotional';
  priority: 'urgent' | 'high' | 'normal';
  completed: boolean;
  description?: string;
  dueTime?: string;
}

interface Baby {
  id: string;
  name: string;
  status: 'pregnant' | 'born';
  date_of_birth?: string;
  gestation_weeks?: number;
  gender?: string;
}

export function DadDashboard() {
  const { user } = useApp();
  const [milkScore, setMilkScore] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [baby, setBaby] = useState<Baby | null>(null);
  const [momHealthData, setMomHealthData] = useState({
    sleepHours: 0,
    hydrationLevel: 0,
    activityLevel: 0,
    stressLevel: 0,
    mood: 'neutral' as const,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set a timeout to stop loading after 5 seconds
        const timeoutId = setTimeout(() => {
          setLoading(false);
        }, 5000);

        // Fetch all data in parallel with Promise.allSettled for better error handling
        const results = await Promise.allSettled([
          fetch(`http://localhost:8000/api/health/current-score?user_id=${user.id}`).then(r => r.ok ? r.json() : null),
          fetch(`http://localhost:8000/api/health/daily-stats?user_id=${user.id}`).then(r => r.ok ? r.json() : null),
          fetch(`http://localhost:8000/api/babies?user_id=${user.id}`).then(r => r.ok ? r.json() : null),
          fetch(`http://localhost:8000/api/tasks?user_id=${user.id}`).then(r => r.ok ? r.json() : null),
        ]);

        // Process results
        if (results[0].status === 'fulfilled' && results[0].value) {
          setMilkScore(results[0].value.score || 0);
        }

        if (results[1].status === 'fulfilled' && results[1].value) {
          const statsData = results[1].value;
          setMomHealthData(prev => ({
            ...prev,
            sleepHours: statsData.sleep_hours || 0,
            hydrationLevel: statsData.hydration_level || 0,
            activityLevel: statsData.activity_level || 0,
            stressLevel: statsData.stress_level || 0,
            mood: statsData.mood || 'neutral',
          }));
        }

        if (results[2].status === 'fulfilled' && results[2].value?.babies?.length > 0) {
          setBaby(results[2].value.babies[0]);
        }

        if (results[3].status === 'fulfilled' && results[3].value?.tasks) {
          setTasks(results[3].value.tasks);
        }

        clearTimeout(timeoutId);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Chào mừng, {user?.name}!</h2>
        <p className="text-muted-foreground">
          Hỗ trợ mẹ khỏe mạnh • Điểm: {user?.points || 0}
        </p>
      </div>

      {/* Main Grid: Timeline + Health Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Development Timeline */}
        <DadDashboardTimeline
          weeksPostpartum={baby?.status === 'born' ? (user.weeksPostpartum || 0) : undefined}
          weeksPregnant={baby?.status === 'pregnant' ? (baby.gestation_weeks || 0) : undefined}
          babyStatus={baby?.status || 'born'}
        />

        {/* Mom's Health Status */}
        <MomHealthStatus
          milkScore={milkScore}
          sleepHours={momHealthData.sleepHours}
          hydrationLevel={momHealthData.hydrationLevel}
          activityLevel={momHealthData.activityLevel}
          stressLevel={momHealthData.stressLevel}
          mood={momHealthData.mood}
          alerts={milkScore < 60 ? ['Điểm sữa thấp - cần tăng cường hỗ trợ'] : []}
        />
      </div>

      {/* Priority Tasks */}
      <DadPriorityTasks
        tasks={tasks}
        momHealthScore={milkScore}
        onTaskComplete={handleTaskComplete}
      />

      {/* Budget Tracker */}
      <Card className="border-2 border-secondary">
        <CardHeader>
          <CardTitle>Theo dõi Kinh phí</CardTitle>
          <CardDescription>Quản lý chi tiêu</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetTracker />
          <Button className="mt-4 w-full" variant="secondary">
            Xem Chi tiết
          </Button>
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card>
        <CardHeader>
          <CardTitle>Bạn có thể giúp gì?</CardTitle>
          <CardDescription>Những cách để hỗ trợ mẹ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🍳</span>
            <div>
              <p className="font-semibold">Nấu ăn Dinh dưỡng</p>
              <p className="text-sm text-muted-foreground">Chuẩn bị các công thức được khuyến nghị</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="font-semibold">Xử lý Mua sắm</p>
              <p className="text-sm text-muted-foreground">Mua các mục được đề xuất</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💪</span>
            <div>
              <p className="font-semibold">Hỗ trợ Tập luyện</p>
              <p className="text-sm text-muted-foreground">Khuyến khích hoạt động hàng ngày</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💤</span>
            <div>
              <p className="font-semibold">Đảm bảo Nghỉ ngơi</p>
              <p className="text-sm text-muted-foreground">Giúp chăm sóc bé vào ban đêm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            💡 <strong>Gợi ý:</strong> Sử dụng sidebar để truy cập Mua sắm & Nấu ăn, Kinh phí & Nhiệm vụ
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
