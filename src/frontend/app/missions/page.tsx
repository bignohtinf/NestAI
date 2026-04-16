'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  reward: number;
}

const missions: Mission[] = [
  {
    id: '1',
    title: 'Nấu 5 bữa/tuần',
    description: 'Nấu ăn cho mẹ',
    icon: '🍳',
    progress: 3,
    total: 5,
    reward: 100,
  },
  {
    id: '2',
    title: 'Tiết kiệm 200k',
    description: 'Giảm chi tiêu',
    icon: '💰',
    progress: 80,
    total: 200,
    reward: 150,
  },
  {
    id: '3',
    title: 'Chồng chuẩn 5⭐',
    description: 'Hoàn thành tất cả nhiệm vụ',
    icon: '⭐',
    progress: 4,
    total: 5,
    reward: 200,
  },
];

export default function MissionsPage() {
  const { user } = useApp();
  const router = useRouter();
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role !== 'father') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'father') {
    return null;
  }

  const totalReward = missions.reduce((sum, m) => sum + m.reward, 0);
  const completedCount = completedMissions.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nhiệm vụ</h1>
          <p className="text-muted-foreground">Hoàn thành nhiệm vụ để nhận điểm thưởng</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Hoàn thành</p>
              <p className="text-2xl font-bold text-primary">{completedCount}/{missions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Tổng thưởng</p>
              <p className="text-2xl font-bold text-green-600">{totalReward}</p>
              <p className="text-xs text-muted-foreground">điểm</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Tiến độ</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((completedCount / missions.length) * 100)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Missions */}
        <div className="space-y-4">
          {missions.map((mission) => {
            const isCompleted = mission.progress >= mission.total;
            const percentage = (mission.progress / mission.total) * 100;

            return (
              <Card key={mission.id} className={isCompleted ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{mission.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{mission.title}</h3>
                        <p className="text-sm text-muted-foreground">{mission.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">+{mission.reward} điểm</p>
                      {isCompleted && (
                        <p className="text-xs text-green-600 dark:text-green-400">✓ Hoàn thành</p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tiến độ</span>
                      <span className="text-xs font-bold">
                        {mission.progress}/{mission.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-600' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim Button */}
                  {isCompleted && !completedMissions.includes(mission.id) && (
                    <Button
                      onClick={() => setCompletedMissions([...completedMissions, mission.id])}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Nhận thưởng
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
