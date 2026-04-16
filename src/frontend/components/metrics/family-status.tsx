'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp, Heart } from 'lucide-react';

export function FamilyStatus() {
  return (
    <div className="space-y-6">
      {/* Mom Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>👩</span>
            Tình trạng Mẹ
          </CardTitle>
          <CardDescription>Theo dõi sức khỏe và dinh dưỡng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Milk Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Điểm Sữa</span>
              <span className="text-sm font-bold text-primary">82/100</span>
            </div>
            <Progress value={82} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Tốt - Sữa chất lượng cao</p>
          </div>

          {/* Nutrition */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Dinh dưỡng</span>
              <span className="text-sm font-bold text-yellow-600">75/100</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Thiếu protein - cần ăn thêm</p>
          </div>

          {/* Energy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Năng lượng</span>
              <span className="text-sm font-bold text-orange-600">65/100</span>
            </div>
            <Progress value={65} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Mẹ cần nghỉ ngơi nhiều hơn</p>
          </div>
        </CardContent>
      </Card>

      {/* Baby Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>👶</span>
            Tình trạng Bé
          </CardTitle>
          <CardDescription>Phản ứng và phát triển</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div>
              <p className="font-semibold text-sm">Tâm trạng</p>
              <p className="text-xs text-muted-foreground">Bé vui vẻ</p>
            </div>
            <span className="text-2xl">😊</span>
          </div>

          {/* Sleep */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <p className="font-semibold text-sm">Giấc ngủ</p>
              <p className="text-xs text-muted-foreground">Ngủ sâu, ít quấy</p>
            </div>
            <span className="text-2xl">😴</span>
          </div>

          {/* Feeding */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div>
              <p className="font-semibold text-sm">Bú</p>
              <p className="text-xs text-muted-foreground">Bé ăn tốt</p>
            </div>
            <span className="text-2xl">🍼</span>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>Insight:</strong> Khi mẹ ăn cá hồi, bé ngủ sâu hơn
            </p>
            <p className="text-sm text-blue-900 dark:text-blue-200">
              ⚠️ <strong>Cảnh báo:</strong> Mẹ thiếu protein - hãy mua thêm trứng hoặc cá
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
