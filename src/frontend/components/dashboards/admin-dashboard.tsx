'use client';

import { useState } from 'react';
import AdminLayout from '../admin/admin-layout';
import DashboardStats from '../admin/dashboard-stats';
import DashboardCharts from '../admin/dashboard-charts';
import RecentPosts from '../admin/recent-activity';
import SystemHistory from '../admin/system-history';
import UserActivity from '../admin/user-activity';
import ContentCategories from '../admin/content-categories';
import { Calendar, Download, Loader2 } from 'lucide-react';
import { useApiData } from '@/lib/use-api-data';
import { adminApi } from '@/lib/api';

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState('week');

  // Single consolidated API call instead of 6+ separate calls
  const { data: dashboard, loading, error, refetch } = useApiData({
    key: ['admin', 'dashboard'],
    fetcher: () => adminApi.getDashboard(),
    ttl: 120_000, // 2 minute cache
  });

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 text-sm">
        Không thể tải dữ liệu dashboard. <button onClick={refetch} className="underline ml-1">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Bảng điều khiển NestAI
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Chào mừng trở lại! Đây là tổng quan về hệ thống NestAI.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm này</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-lg transition-shadow text-sm font-medium">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Overview Stats — data passed down, no separate fetch */}
      <DashboardStats data={dashboard?.stats} />

      {/* Charts — data passed down */}
      <DashboardCharts data={dashboard?.analytics} />

      {/* System History & User Activity — shared audit logs data */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <SystemHistory data={dashboard?.auditLogs} onRefresh={refetch} />
        <UserActivity data={dashboard?.auditLogs} onRefresh={refetch} />
      </div>

      {/* Recent Posts & Content Categories */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full min-w-0">
          <RecentPosts data={dashboard?.recentPosts} onRefresh={refetch} />
        </div>
        <div className="space-y-4 sm:space-y-6 w-full min-w-0">
          <ContentCategories />
        </div>
      </div>
    </div>
  );
}
