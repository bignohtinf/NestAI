'use client';

import { useState } from 'react';
import { MessageSquare, Camera, Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AILogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhật ký hoạt động AI</h1>
        <p className="text-gray-500 mt-2">Theo dõi tất cả các hoạt động của các hệ thống AI</p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Logs
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scan Logs
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Chat Nori</CardTitle>
              <CardDescription>Xem tất cả các cuộc hội thoại với Nori AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Chat logs will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Scan món ăn</CardTitle>
              <CardDescription>Xem tất cả các lần scan nhận diện thực phẩm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Scan logs will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử Gợi ý thực đơn</CardTitle>
              <CardDescription>Xem tất cả các gợi ý thực đơn được tạo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Recommendation logs will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
