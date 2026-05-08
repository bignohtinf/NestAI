'use client';

import { SectionHeader } from '../SectionHeader';
import { HealthScoreBanner } from '../cards/HealthScoreBanner';
import { MetricCard } from '../cards/MetricCard';
import { ChallengeCard } from '../cards/ChallengeCard';
import { Button } from '@/components/ui/button';
import { useWellnessData } from '../../hooks/useWellnessData';
import { Heart, Moon, Zap } from 'lucide-react';

interface DashboardSectionProps {
  userId: string;
  onTrackClick: () => void;
}

export const DashboardSection = ({ userId, onTrackClick }: DashboardSectionProps) => {
  const { healthScore, entries, challenges, loading, completeChallenge } = useWellnessData(userId);

  const todayEntry = entries?.[0];

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        icon="📊"
        title="Tổng Quan Sức Khỏe"
        description="Xem tổng quát sức khỏe hôm nay, điểm số wellness và các thử thách"
      />

      {/* Health Score Banner */}
      {healthScore && <HealthScoreBanner score={healthScore} />}

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Các Chỉ Số Hôm Nay</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Chỉ Số Sữa"
            value={todayEntry?.milk_score ?? 0}
            unit="/100"
            icon={<Heart className="w-5 h-5" />}
            color="rose"
          />
          <MetricCard
            label="Giấc Ngủ"
            value={todayEntry?.sleep_hours ?? 0}
            unit="giờ"
            icon={<Moon className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            label="Năng Lượng"
            value={todayEntry?.energy_level ?? 0}
            unit="/5"
            icon={<Zap className="w-5 h-5" />}
            color="amber"
          />
        </div>
      </div>

      {/* Today's Challenges Preview */}
      {challenges && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              🔥 Thử Thách Hôm Nay ({challenges.completed}/{challenges.total})
            </h3>
            <span className="text-sm text-muted-foreground">
              {challenges.total - challenges.completed} còn lại
            </span>
          </div>
          <div className="space-y-2">
            {challenges.challenges.slice(0, 3).map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={completeChallenge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Action */}
      <Button onClick={onTrackClick} className="w-full mt-4" size="lg" variant="default">
        📝 Bắt đầu theo dõi
      </Button>
    </div>
  );
};
