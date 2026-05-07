'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function RecommendationLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await adminApi.getRecommendationLogs();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to fetch recommendation logs:', error);
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
          <Bookmark className="h-8 w-8" />
          Lịch sử Gợi ý thực đơn
        </h1>
        <p className="text-gray-500 mt-2">Xem chi tiết tất cả các gợi ý thực đơn được tạo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menu Recommendations</CardTitle>
          <CardDescription>Danh sách các gợi ý gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500 italic">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu gợi ý nào.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Phiên</TableHead>
                  <TableHead>Ngày thực đơn</TableHead>
                  <TableHead>Đối tượng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-[10px] text-gray-400">
                      {log.user_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{log.plan_date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {log.target === 'mother' ? 'Mẹ' : 'Bé'}
                      </Badge>
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
