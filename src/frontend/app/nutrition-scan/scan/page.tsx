'use client';

import { SmartScan } from '@/components/metrics/smart-scan';
import { Camera } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0075de]/10 flex items-center justify-center shrink-0">
          <Camera className="w-6 h-6 text-[#0075de]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Phân tích bữa ăn AI</h1>
          <p className="text-muted-foreground text-sm max-w-2xl mt-1">
            Chụp ảnh hoặc tải lên hình ảnh bữa ăn. AI nhận diện từng món và tính calo, dinh dưỡng tức thì.
          </p>
        </div>
      </div>

      <SmartScan splitLayout />
    </div>
  );
}
