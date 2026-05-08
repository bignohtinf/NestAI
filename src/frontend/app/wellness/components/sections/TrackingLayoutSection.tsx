'use client';

import { SectionHeader } from '../SectionHeader';
import { TrackingSection } from './TrackingSection';
import { ChallengesSection } from './ChallengesSection';
import { InsightsSection } from './InsightsSection';

interface TrackingLayoutSectionProps {
  userId: string;
}

export const TrackingLayoutSection = ({ userId }: TrackingLayoutSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <SectionHeader
        icon="📝"
        title="Theo Dõi & Thử Thách"
        description="Ghi nhận dữ liệu sức khỏe hàng ngày, hoàn thành các thử thách và xem phân tích chi tiết"
      />

      {/* Top Row: Tracking & Challenges Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tracking Section */}
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📋</span> Ghi Nhận Hôm Nay
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Cập nhật các chỉ số sức khỏe của bạn</p>
          <TrackingSection userId={userId} />
        </div>

        {/* Challenges Section */}
        <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-6 overflow-auto max-h-[600px]">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> Thử Thách Hôm Nay
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Hoàn thành các nhiệm vụ và xây dựng streak</p>
          <ChallengesSection userId={userId} />
        </div>
      </div>

      {/* Bottom: Insights Full Width */}
      <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>📊</span> Phân Tích & Lời Khuyên
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Xem xu hướng 7 ngày, lời khuyên wellness và phân tích sức khỏe</p>
        <InsightsSection userId={userId} />
      </div>
    </div>
  );
};
