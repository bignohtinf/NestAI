'use client';

import { useState, useEffect } from 'react';
import { Monitor, Zap, Cpu, AlertCircle, Loader2, TrendingUp, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonitoringPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await adminApi.getAIMonitoring('month');
        setData(res);
      } catch (err) {
        console.error('Failed to fetch AI monitoring data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Monitor className="h-8 w-8 text-rose-500" />
            Giám sát Token & Model
          </h1>
          <p className="text-gray-500 mt-2">Theo dõi chi phí và hiệu năng hệ thống AI</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Token (Tháng)</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalTokens?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-500 mt-1">~${((data?.stats?.totalTokens || 0) * 0.000002).toFixed(2)} chi phí ước tính</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ trễ trung bình</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.avgLatency || '0'}s</div>
            <p className="text-xs text-green-500 mt-1">-0.2s so với hôm qua</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỉ lệ thành công</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.successRate || '0'}%</div>
            <p className="text-xs text-gray-500 mt-1">99.8% khả dụng</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mô hình chính</CardTitle>
            <Cpu className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">GPT-4o-mini</div>
            <p className="text-xs text-gray-500 mt-1">Cấu hình: Nori-Standard</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">Lưu lượng Token theo thời gian</CardTitle>
            <CardDescription>Số lượng token tiêu thụ hàng ngày</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.tokenHistory || []}>
                  <defs>
                    <linearGradient id="colorToken" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(244, 63, 94)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="rgb(244, 63, 94)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={10} hide />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey="tokens" stroke="rgb(244, 63, 94)" fillOpacity={1} fill="url(#colorToken)" name="Tokens" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base">Mức độ sử dụng theo Model</CardTitle>
            <CardDescription>Phân bổ token giữa các AI Models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.modelStats.map((model: any) => (
                <div key={model.model} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{model.model}</span>
                    <span className="text-gray-500">{model.tokens.toLocaleString()} tokens</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full" 
                      style={{ width: `${data?.stats?.totalTokens ? (model.tokens / data.stats.totalTokens) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
