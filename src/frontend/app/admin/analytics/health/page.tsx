'use client';

import { Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HealthAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Chỉ số sức khỏe cộng đồng
        </h1>
        <p className="text-gray-500 mt-2">Phân tích các chỉ số sức khỏe của cộng đồng người dùng</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pregnancy Tracking</CardTitle>
            <CardDescription>Số người theo dõi thai kỳ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Check-ins</CardTitle>
            <CardDescription>Số lần kiểm tra sức khỏe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Health Indicators</CardTitle>
          <CardDescription>Các chỉ số sức khỏe chính của cộng đồng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Community health indicators will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
