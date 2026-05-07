'use client';

import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart2 className="h-8 w-8" />
          Thống kê Analytics
        </h1>
        <p className="text-gray-500 mt-2">Phân tích chi tiết về các chỉ số hệ thống</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="chat">Hội thoại AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview Analytics</CardTitle>
              <CardDescription>Tổng quan các chỉ số chính của hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Analytics overview will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Thống kê chi tiết về người dùng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                User analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Analytics</CardTitle>
              <CardDescription>Thống kê hội thoại với AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Chat analytics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
