'use client';

import type React from 'react';
import {
  Users,
  Activity,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  description: string;
}

interface DashboardStatsProps {
  data?: {
    totalUsers: number;
    totalMothers: number;
    totalFathers: number;
    totalConversations: number;
    totalPartnerships: number;
    totalBabies: number;
    activePregnancies: number;
    activeUsers: number;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
        <span className="ml-2 text-sm text-gray-500">Đang tải thống kê...</span>
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      title: 'Tổng người dùng',
      value: data.totalUsers.toLocaleString(),
      change: '+12.5%',
      changeType: 'increase',
      icon: <Users className="h-4 w-4" />,
      description: `${data.activeUsers} hoạt động`,
    },
    {
      title: 'Mẹ bầu (Mothers)',
      value: data.totalMothers.toLocaleString(),
      change: '+5.2%',
      changeType: 'increase',
      icon: <Activity className="h-4 w-4" />,
      description: `${data.activePregnancies || 0} đang mang thai`,
    },
    {
      title: 'Người bố (Fathers)',
      value: data.totalFathers.toLocaleString(),
      change: '+8.2%',
      changeType: 'increase',
      icon: <Users className="h-4 w-4" />,
      description: 'Đồng hành',
    },
    {
      title: 'Hội thoại AI',
      value: (data.totalConversations || 0).toLocaleString(),
      change: '+15.7%',
      changeType: 'increase',
      icon: <Activity className="h-4 w-4" />,
      description: 'Nori ChatBot',
    },
    {
      title: 'Cặp đôi',
      value: data.totalPartnerships.toLocaleString(),
      change: '+3.1%',
      changeType: 'increase',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Đã kết nối',
    },
    {
      title: 'Em bé',
      value: data.totalBabies.toLocaleString(),
      change: '+4.5%',
      changeType: 'increase',
      icon: <Package className="h-4 w-4" />,
      description: 'Đang theo dõi',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white dark:bg-gray-950 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="text-gray-600 dark:text-gray-400 flex-shrink-0">
              {stat.icon}
            </div>
            <div className="flex items-center text-xs">
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span
                className={`font-medium ${
                  stat.changeType === 'increase'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {stat.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
