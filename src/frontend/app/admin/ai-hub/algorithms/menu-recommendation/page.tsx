'use client';

import { Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MenuRecommendationAlgoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-8 w-8" />
          Thuật toán gợi ý thực đơn
        </h1>
        <p className="text-gray-500 mt-2">Cấu hình chi tiết thuật toán gợi ý thực đơn thông minh</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Recommendation Algorithm Configuration</CardTitle>
          <CardDescription>Thiết lập tham số và cấu hình thuật toán</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Menu recommendation algorithm configuration details will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
