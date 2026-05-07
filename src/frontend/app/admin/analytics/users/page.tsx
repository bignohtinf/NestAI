'use client';

import { Users2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users2 className="h-8 w-8" />
          Thống kê người dùng
        </h1>
        <p className="text-gray-500 mt-2">Phân tích chi tiết về người dùng và hoạt động của họ</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Tổng số người dùng đã đăng ký</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Người dùng hoạt động hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Trends</CardTitle>
          <CardDescription>Xu hướng người dùng theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            User trends chart will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
