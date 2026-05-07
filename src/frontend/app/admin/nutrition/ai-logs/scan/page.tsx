'use client';

import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ScanLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await adminApi.getScanLogs();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to fetch scan logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Camera className="h-8 w-8" />
          Lịch sử Scan món ăn
        </h1>
        <p className="text-gray-500 mt-2">Xem chi tiết tất cả các lần scan nhận diện thực phẩm</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Recognition Scans</CardTitle>
          <CardDescription>Danh sách các lần scan gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500 italic">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu scan nào.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Phiên</TableHead>
                  <TableHead>Món ăn</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Dinh dưỡng (P/C/F)</TableHead>
                  <TableHead>Ngày thực hiện</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-[10px] text-gray-400">
                      {log.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{log.meal_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                        {log.calories} kcal
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-600">
                        {log.protein || 0}g / {log.carbs || 0}g / {log.fat || 0}g
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
