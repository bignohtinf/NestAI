'use client';

import { Camera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { usePaginatedData } from '@/lib/use-api-data';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function ScanLogsPage() {
  const { data: logs, total, page, pageSize, totalPages, loading, goToPage } = usePaginatedData({
    key: ['admin', 'scan-logs'],
    fetcher: async (limit, offset) => {
      const res = await adminApi.getScanLogs({ limit, offset });
      return { items: res.logs || [], total: res.total || 0 };
    },
    pageSize: 20,
  });

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
          <CardDescription>
            Danh sách các lần scan gần đây
            {total > 0 && <span className="ml-2 text-gray-400">({total} tổng)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500 italic">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu scan nào.</div>
          ) : (
            <>
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
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-[10px] text-gray-400">
                        {log.user_id?.substring(0, 8)}...
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
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={goToPage}
                loading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
