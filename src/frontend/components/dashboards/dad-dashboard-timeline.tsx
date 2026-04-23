'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, Calendar, Zap } from 'lucide-react';

interface TimelineEvent {
  week: number;
  day: number;
  title: string;
  description: string;
  size?: string;
  icon: string;
}

// Sample development milestones - can be extended with more detailed data
const getPregnancyMilestones = (weeksPregnant: number): TimelineEvent[] => {
  const milestones: TimelineEvent[] = [
    { week: 8, day: 0, title: 'Nhịp tim bắt đầu', description: 'Tim bé bắt đầu đập', size: 'Hạt đậu', icon: '💓' },
    { week: 12, day: 0, title: 'Bé có thể nghe', description: 'Tai bé phát triển', size: 'Quả lê', icon: '👂' },
    { week: 16, day: 0, title: 'Bé bắt đầu cử động', description: 'Mẹ có thể cảm nhận', size: 'Quả táo', icon: '🤸' },
    { week: 20, day: 0, title: 'Siêu âm giữa kỳ', description: 'Kiểm tra phát triển', size: 'Quả chuối', icon: '🔍' },
    { week: 24, day: 0, title: 'Bé có thể sống ngoài tử cung', description: 'Phổi phát triển', size: 'Quả mango', icon: '🫁' },
    { week: 28, day: 0, title: 'Bé mở mắt', description: 'Mắt bé phát triển hoàn toàn', size: 'Quả dưa chuột', icon: '👀' },
    { week: 32, day: 0, title: 'Bé chuyển vị trí', description: 'Chuẩn bị cho sinh', size: 'Quả dưa lưới', icon: '🔄' },
    { week: 36, day: 0, title: 'Bé hạ xuống', description: 'Chuẩn bị cho ngày sinh', size: 'Quả bưởi', icon: '⬇️' },
  ];

  return milestones.filter(m => m.week <= weeksPregnant);
};

const getPostpartumMilestones = (weeksPostpartum: number): TimelineEvent[] => {
  const milestones: TimelineEvent[] = [
    { week: 0, day: 0, title: 'Bé vừa sinh', description: 'Chào mừng bé yêu', size: '3.5kg', icon: '👶' },
    { week: 1, day: 0, title: 'Kiểm tra sức khỏe lần 1', description: 'Khám sơ sinh', size: '3.2kg', icon: '🏥' },
    { week: 2, day: 0, title: 'Bé bắt đầu cười', description: 'Nụ cười đầu tiên', size: '3.5kg', icon: '😊' },
    { week: 4, day: 0, title: 'Tiêm chủng lần 1', description: 'Bảo vệ sức khỏe', size: '4.2kg', icon: '💉' },
    { week: 8, day: 0, title: 'Bé nhìn theo vật', description: 'Phát triển thị lực', size: '5.5kg', icon: '👁️' },
    { week: 12, day: 0, title: 'Bé cười to', description: 'Phát triển xã hội', size: '6.2kg', icon: '😄' },
  ];

  return milestones.filter(m => m.week <= weeksPostpartum);
};

interface DadDashboardTimelineProps {
  weeksPregnant?: number;
  weeksPostpartum?: number;
  babyStatus?: 'pregnant' | 'born';
  nextCheckup?: string;
  nextVaccine?: string;
}

export function DadDashboardTimeline({
  weeksPregnant = 0,
  weeksPostpartum = 0,
  babyStatus = 'born',
  nextCheckup,
  nextVaccine,
}: DadDashboardTimelineProps) {
  const milestones = babyStatus === 'pregnant' 
    ? getPregnancyMilestones(weeksPregnant)
    : getPostpartumMilestones(weeksPostpartum);

  const currentWeek = babyStatus === 'pregnant' ? weeksPregnant : weeksPostpartum;
  const lastMilestone = milestones[milestones.length - 1];
  const weeksUntilNext = lastMilestone ? lastMilestone.week - currentWeek : 0;

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-blue-500" />
              Lộ trình phát triển
            </CardTitle>
            <CardDescription>
              {babyStatus === 'pregnant' 
                ? `Tuần ${weeksPregnant} - Đang mang thai`
                : `Tuần ${weeksPostpartum} - Sau sinh`}
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-blue-500">
            {weeksUntilNext > 0 ? `${weeksUntilNext} tuần tới` : 'Cập nhật'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {lastMilestone?.icon} {lastMilestone?.title}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {lastMilestone?.description}
          </p>
          {lastMilestone?.size && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Kích thước: <span className="font-semibold">{lastMilestone.size}</span>
            </p>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Các cột mốc gần đây</p>
          <div className="space-y-2">
            {milestones.slice(-3).reverse().map((milestone, idx) => (
              <div key={`${milestone.week}-${idx}`} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                    {milestone.icon}
                  </div>
                  {idx < 2 && <div className="w-0.5 h-6 bg-blue-200 dark:bg-blue-800 mt-1" />}
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-foreground">{milestone.title}</p>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Dates */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          {nextCheckup && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Khám thai</p>
                <p className="text-muted-foreground">{nextCheckup}</p>
              </div>
            </div>
          )}
          {nextVaccine && (
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-foreground">Tiêm chủng</p>
                <p className="text-muted-foreground">{nextVaccine}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
