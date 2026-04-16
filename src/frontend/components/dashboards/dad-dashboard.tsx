'use client';

import { useApp } from '@/lib/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MilkScoreGauge } from '@/components/metrics/milk-score-gauge';
import { BudgetTracker } from '@/components/metrics/budget-tracker';
import { ActionChecklist } from '@/components/metrics/action-checklist';
import { FamilyStatus } from '@/components/metrics/family-status';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DadDashboard() {
  const { user } = useApp();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'checklist' | 'family'>('checklist');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'family') {
      setActiveTab('family');
    } else {
      setActiveTab('checklist');
    }
  }, [searchParams]);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Chào mừng, {user?.name}!</h2>
        <p className="text-muted-foreground">
          Hỗ trợ mẹ khỏe mạnh • Điểm: {user?.points}
        </p>
      </div>

      {/* Support Section with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Hỗ trợ</CardTitle>
          <CardDescription>Checklist hôm nay và radar gia đình</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <ActionChecklist />
            </div>
          )}

          {activeTab === 'family' && (
            <div className="space-y-4">
              <FamilyStatus />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Mom's Milk Score */}
        <Card className="border-2 border-secondary">
          <CardHeader>
            <CardTitle>Điểm Sữa của Mẹ</CardTitle>
            <CardDescription>Theo dõi và hỗ trợ</CardDescription>
          </CardHeader>
          <CardContent>
            <MilkScoreGauge score={user?.milkScore || 82} />
            <p className="mt-4 text-sm text-muted-foreground">
              Giữ điểm sữa trên 80 để cung cấp dinh dưỡng tối ưu
            </p>
          </CardContent>
        </Card>

        {/* Budget Tracker */}
        <Card className="border-2 border-secondary">
          <CardHeader>
            <CardTitle>Theo dõi Kinh phí</CardTitle>
            <CardDescription>Quản lý chi tiêu</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetTracker />
            <Button className="mt-4 w-full" variant="outline">
              Xem Chi tiết
            </Button>
          </CardContent>
        </Card>
      </div>

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
