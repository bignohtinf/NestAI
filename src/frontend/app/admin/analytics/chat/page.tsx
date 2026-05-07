'use client';

import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ChatAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Thống kê hội thoại AI
        </h1>
        <p className="text-gray-500 mt-2">Phân tích chi tiết về hội thoại với hệ thống AI Nori</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Conversations</CardTitle>
            <CardDescription>Tổng số cuộc hội thoại</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Messages</CardTitle>
            <CardDescription>Trung bình tin nhắn/cuộc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Duration</CardTitle>
            <CardDescription>Thời gian trung bình</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0m</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat Activity Over Time</CardTitle>
          <CardDescription>Hoạt động hội thoại theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Chat activity chart will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
