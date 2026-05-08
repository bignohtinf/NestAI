'use client';

import { NutritionRecommendations } from '@/components/metrics/nutrition-recommendations';
import { Utensils } from 'lucide-react';

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0075de]/10 flex items-center justify-center shrink-0">
          <Utensils className="w-6 h-6 text-[#0075de]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thiết kế thực đơn cá nhân</h1>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            AI tự động thiết kế thực đơn món Việt theo ngày và tuần, đảm bảo cân bằng dinh dưỡng theo tam cá nguyệt và tình trạng sức khỏe cụ thể của bạn.
          </p>
        </div>
      </div>

      <NutritionRecommendations />
    </div>
  );
}
