'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Loader2,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  description: string;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await adminApi.getStats();
        
        // Map backend response to StatCard objects
        const mappedStats: StatCard[] = [
          {
            title: 'Tổng người dùng',
            value: data.totalUsers.toLocaleString(),
            change: '+12.5%', // Mock change for now
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
        
        setStats(mappedStats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
        <span className="ml-2 text-sm text-gray-500">Đang tải thống kê...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 text-sm">
        {error}
      </div>
    );
  }

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
