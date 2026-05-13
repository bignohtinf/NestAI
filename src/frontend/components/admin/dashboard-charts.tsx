'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface DashboardChartsProps {
  data?: {
    users: { trends: any[] };
    chat: { trends: any[] };
  };
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  if (!data) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-950 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-800 h-80 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          </div>
        ))}
      </div>
    );
  }

  const userTrend = (data.users?.trends || []).map((t: any) => ({
    ...t,
    date: new Date(t.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
  }));

  const chatTrend = (data.chat?.trends || []).map((t: any) => ({
    ...t,
    date: new Date(t.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
  }));

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
      {/* User Growth Chart */}
      <div className="bg-white dark:bg-gray-950 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-800 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Tăng trưởng người dùng
          </h3>
          <span className="text-xs sm:text-sm text-gray-500">30 ngày qua</span>
        </div>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userTrend}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" fontSize={10} tick={{ fill: '#888' }} />
              <YAxis fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Area
                type="monotone"
                dataKey="newUsers"
                stroke="rgb(244, 63, 94)"
                fillOpacity={1}
                fill="url(#colorUsers)"
                name="Người dùng mới"
              />
              <Area
                type="monotone"
                dataKey="activeUsers"
                stroke="rgb(16, 185, 129)"
                fillOpacity={0}
                name="Người dùng hoạt động"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Chat Activity Chart */}
      <div className="bg-white dark:bg-gray-950 rounded-xl p-3 sm:p-6 border border-gray-200 dark:border-gray-800 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Hoạt động Nori Chat AI
          </h3>
          <span className="text-xs sm:text-sm text-gray-500">Tương tác 30 ngày</span>
        </div>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chatTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" fontSize={10} tick={{ fill: '#888' }} />
              <YAxis fontSize={10} tick={{ fill: '#888' }} />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Bar
                dataKey="conversations"
                name="Cuộc hội thoại"
                fill="rgb(99, 102, 241)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="messages"
                name="Tin nhắn"
                fill="rgb(244, 63, 94)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
