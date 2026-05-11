'use client';

import { useEffect, useState } from 'react';
import { Users2, TrendingUp, UserCheck, UserPlus, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

interface UserAnalytics {
  totalUsers: number;
  newUsersThisPeriod: number;
  activeUsersThisPeriod: number;
  usersByRole: Record<string, number>;
  retentionRate: number;
  churnRate: number;
  trends: Array<{ date: string; newUsers: number; activeUsers: number }>;
}

const PERIODS = [
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'quarter', label: '3 tháng' },
  { value: 'year', label: '1 năm' },
];

const roleLabels: Record<string, string> = {
  mother: 'Mẹ bỉm sữa',
  father: 'Ba bỉm sữa',
  admin: 'Quản trị viên',
};

const roleColors: Record<string, string> = {
  mother: 'bg-pink-100 text-pink-700',
  father: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function UserAnalyticsPage() {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getUserAnalytics(period);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch user analytics:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="h-8 w-8 text-rose-500" />
            Thống kê người dùng
          </h1>
          <p className="text-gray-500 mt-2">Phân tích chi tiết về người dùng và hoạt động của họ</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  period === p.value
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Stats cards */}
      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Users2 className="h-4 w-4" />
                  Tổng người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Tất cả tài khoản đã đăng ký</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  Người dùng mới
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{data.newUsersThisPeriod.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Trong {PERIODS.find(p => p.value === period)?.label}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  Người dùng hoạt động
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{data.activeUsersThisPeriod.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Đã đăng nhập trong kỳ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Tỷ lệ giữ chân
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{data.retentionRate.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 mt-1">
                  Churn: {data.churnRate.toFixed(1)}% &nbsp;·&nbsp;
                  <span title="% user (không tính admin) có last_login trong kỳ">dựa theo last_login</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Role distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ theo vai trò</CardTitle>
              <CardDescription>Số lượng người dùng theo từng vai trò trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(data.usersByRole).length === 0 ? (
                <p className="text-center text-gray-400 py-6">Không có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.usersByRole).map(([role, count]) => {
                    const pct = data.totalUsers > 0 ? Math.round((count / data.totalUsers) * 100) : 0;
                    return (
                      <div key={role}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-700'}`}>
                            {roleLabels[role] || role}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">{count.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              role === 'mother' ? 'bg-pink-400' : role === 'father' ? 'bg-blue-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng người dùng</CardTitle>
              <CardDescription>Người dùng mới và hoạt động theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              {data.trends.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Chưa có dữ liệu xu hướng cho kỳ này
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-gray-500 font-medium">Ngày</th>
                        <th className="text-right py-2 pr-4 text-emerald-600 font-medium">Mới</th>
                        <th className="text-right py-2 text-blue-600 font-medium">Hoạt động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trends.slice(-14).map((t) => (
                        <tr key={t.date} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-600">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                          <td className="py-2 pr-4 text-right font-semibold text-emerald-600">{t.newUsers}</td>
                          <td className="py-2 text-right font-semibold text-blue-600">{t.activeUsers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
