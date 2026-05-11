'use client';

import { useEffect, useState } from 'react';
import { Activity, Baby, ClipboardCheck, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api';

interface HealthAnalytics {
  pregnancyTracking: {
    totalPregnancies: number;
    ongoingTrimesters: Record<string, number>;
    avgHealthScore: number;
  };
  healthCheckIns: {
    thisMonth: number;
    compliance: number;
  };
  communityMetrics: {
    avgNutritionAdherence: number;
    avgActivityLevel: number;
    avgMealQuality: number;
  };
  alerts: Array<{ type: string; count: number }>;
}

const PERIODS = [
  { value: 'week', label: '7 ngày' },
  { value: 'month', label: '30 ngày' },
  { value: 'quarter', label: '3 tháng' },
  { value: 'year', label: '1 năm' },
];

const alertLabels: Record<string, string> = {
  malnutrition_risk: '⚠️ Nguy cơ suy dinh dưỡng',
  low_activity: '🏃 Hoạt động thể chất thấp',
  weight_concern: '⚖️ Vấn đề cân nặng',
  checkup_overdue: '📅 Trễ lịch khám',
};

const trimesterLabels: Record<string, string> = {
  '1st': 'Tam cá nguyệt 1',
  '2nd': 'Tam cá nguyệt 2',
  '3rd': 'Tam cá nguyệt 3',
};

export default function HealthAnalyticsPage() {
  const [data, setData] = useState<HealthAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('month');

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getHealthAnalytics(period);
      setData(result);
    } catch (err) {
      console.error('Failed to fetch health analytics:', err);
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
            <Activity className="h-8 w-8 text-rose-500" />
            Chỉ số sức khỏe cộng đồng
          </h1>
          <p className="text-gray-500 mt-2">Phân tích các chỉ số sức khỏe của cộng đồng người dùng</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span>Đang tải dữ liệu...</span>
        </div>
      )}

      {data && (
        <>
          {/* Alerts banner */}
          {data.alerts.filter(a => a.count > 0).length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Cảnh báo sức khỏe cộng đồng
              </div>
              <div className="flex flex-wrap gap-3">
                {data.alerts.filter(a => a.count > 0).map((alert, i) => (
                  <span key={i} className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                    {alertLabels[alert.type] || alert.type}: <strong>{alert.count}</strong> người dùng
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Baby className="h-4 w-4" />
                  Đang mang thai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-rose-600">
                  {data.pregnancyTracking.totalPregnancies.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Thai phụ đang theo dõi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Điểm sức khỏe TB
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">
                  {data.pregnancyTracking.avgHealthScore.toFixed(1)}
                  <span className="text-base font-normal text-gray-400">/10</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Trung bình toàn cộng đồng</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <ClipboardCheck className="h-4 w-4" />
                  Lần kiểm tra/tháng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {data.healthCheckIns.thisMonth.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">Tháng này</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tỷ lệ tuân thủ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {data.healthCheckIns.compliance.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Tuân thủ lịch khám</p>
              </CardContent>
            </Card>
          </div>

          {/* Trimesters + Community Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Theo dõi thai kỳ theo tam cá nguyệt</CardTitle>
                <CardDescription>Phân bổ số thai phụ theo từng giai đoạn</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(data.pregnancyTracking.ongoingTrimesters).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(data.pregnancyTracking.ongoingTrimesters).map(([key, count]) => {
                      const total = data.pregnancyTracking.totalPregnancies;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">{trimesterLabels[key] || key}</span>
                            <span className="text-sm font-semibold text-gray-700">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-rose-400 transition-all duration-500"
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

            <Card>
              <CardHeader>
                <CardTitle>Chỉ số cộng đồng</CardTitle>
                <CardDescription>Các chỉ số sức khỏe trung bình toàn cộng đồng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Tuân thủ dinh dưỡng',
                      value: data.communityMetrics.avgNutritionAdherence,
                      max: 100,
                      unit: '%',
                      color: 'bg-emerald-400',
                    },
                    {
                      label: 'Mức vận động',
                      value: data.communityMetrics.avgActivityLevel,
                      max: 10,
                      unit: '/10',
                      color: 'bg-blue-400',
                    },
                    {
                      label: 'Chất lượng bữa ăn',
                      value: data.communityMetrics.avgMealQuality,
                      max: 10,
                      unit: '/10',
                      color: 'bg-purple-400',
                    },
                  ].map((metric) => {
                    const pct = Math.min(100, (metric.value / metric.max) * 100);
                    return (
                      <div key={metric.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{metric.label}</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {metric.value.toFixed(1)}{metric.unit}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div
                            className={`h-2 rounded-full ${metric.color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
