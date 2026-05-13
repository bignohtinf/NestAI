'use client';

import { Bookmark } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { usePaginatedData } from '@/lib/use-api-data';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function RecommendationLogsPage() {
  const { data: logs, total, page, pageSize, totalPages, loading, goToPage } = usePaginatedData({
    key: ['admin', 'recommendation-logs'],
    fetcher: async (limit, offset) => {
      const res = await adminApi.getRecommendationLogs({ limit, offset });
      return { items: res.logs || [], total: res.total || 0 };
    },
    pageSize: 20,
  });

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
          <CardDescription>
            Danh sách các gợi ý gần đây
            {total > 0 && <span className="ml-2 text-gray-400">({total} tổng)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500 italic">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu gợi ý nào.</div>
          ) : (
            <>
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
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-[10px] text-gray-400">
                        {log.user_id?.substring(0, 8)}...
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
