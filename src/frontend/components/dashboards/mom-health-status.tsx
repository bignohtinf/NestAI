'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Droplets, Moon, Activity, Brain, TrendingDown, TrendingUp } from 'lucide-react';

interface HealthMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

interface MomHealthStatusProps {
  milkScore?: number;
  sleepHours?: number;
  hydrationLevel?: number;
  activityLevel?: number;
  stressLevel?: number;
  mood?: 'happy' | 'neutral' | 'sad';
  alerts?: string[];
  suggestions?: string[];
}

const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
  switch (status) {
    case 'good':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }
};

const getStatusTextColor = (status: 'good' | 'warning' | 'critical') => {
  switch (status) {
    case 'good':
      return 'text-green-700 dark:text-green-300';
    case 'warning':
      return 'text-amber-700 dark:text-amber-300';
    case 'critical':
      return 'text-red-700 dark:text-red-300';
  }
};

const getMoodEmoji = (mood?: string) => {
  switch (mood) {
    case 'happy':
      return '😊';
    case 'sad':
      return '😔';
    default:
      return '😐';
  }
};

export function MomHealthStatus({
  milkScore = 82,
  sleepHours = 5,
  hydrationLevel = 60,
  activityLevel = 40,
  stressLevel = 65,
  mood = 'neutral',
  alerts = [],
  suggestions = [],
}: MomHealthStatusProps) {
  // Determine health metrics and statuses
  const metrics: HealthMetric[] = [
    {
      label: 'Nước uống',
      value: hydrationLevel,
      max: 100,
      unit: '%',
      icon: <Droplets className="h-4 w-4" />,
      status: hydrationLevel >= 70 ? 'good' : hydrationLevel >= 50 ? 'warning' : 'critical',
      trend: hydrationLevel > 60 ? 'up' : 'down',
    },
    {
      label: 'Giấc ngủ',
      value: sleepHours,
      max: 8,
      unit: 'giờ',
      icon: <Moon className="h-4 w-4" />,
      status: sleepHours >= 6 ? 'good' : sleepHours >= 4 ? 'warning' : 'critical',
      trend: sleepHours > 5 ? 'up' : 'down',
    },
    {
      label: 'Vận động',
      value: activityLevel,
      max: 100,
      unit: '%',
      icon: <Activity className="h-4 w-4" />,
      status: activityLevel >= 50 ? 'good' : activityLevel >= 30 ? 'warning' : 'critical',
      trend: activityLevel > 40 ? 'up' : 'down',
    },
    {
      label: 'Căng thẳng',
      value: stressLevel,
      max: 100,
      unit: '%',
      icon: <Brain className="h-4 w-4" />,
      status: stressLevel <= 40 ? 'good' : stressLevel <= 70 ? 'warning' : 'critical',
      trend: stressLevel < 60 ? 'down' : 'up',
    },
  ];

  // Generate actionable suggestions based on metrics
  const autoSuggestions = [];
  if (sleepHours < 5) {
    autoSuggestions.push('Bố nên trông con vào ban đêm để mẹ có thêm giấc ngủ');
  }
  if (hydrationLevel < 60) {
    autoSuggestions.push('Nhắc mẹ uống nước thường xuyên - cần ít nhất 2-3 lít/ngày');
  }
  if (stressLevel > 70) {
    autoSuggestions.push('Mẹ đang căng thẳng - hãy giúp mẹ thư giãn hoặc đi dạo');
  }
  if (activityLevel < 30) {
    autoSuggestions.push('Khuyến khích mẹ tập nhẹ - yoga hoặc đi bộ 15-20 phút');
  }

  const allSuggestions = [...autoSuggestions, ...suggestions];

  return (
    <Card className="border-2 border-rose-200 dark:border-rose-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(mood)}</span>
              Trạng thái sức khỏe của mẹ
            </CardTitle>
            <CardDescription>Cập nhật hôm nay</CardDescription>
          </div>
          <Badge variant="default" className="bg-rose-500">
            Điểm sữa: {milkScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`border rounded-lg p-3 ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={getStatusTextColor(metric.status)}>
                    {metric.icon}
                  </div>
                  <p className="text-xs font-semibold text-foreground">{metric.label}</p>
                </div>
                {metric.trend && (
                  <div className={getStatusTextColor(metric.status)}>
                    {metric.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/40 dark:bg-black/20 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className={`h-full transition-all ${
                    metric.status === 'good'
                      ? 'bg-green-500'
                      : metric.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                />
              </div>

              <p className="text-sm font-semibold text-foreground">
                {metric.value} <span className="text-xs text-muted-foreground">{metric.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Cảnh báo</p>
            {alerts.map((alert, idx) => (
              <Alert key={idx} variant="error" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
                  {alert}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Actionable Suggestions */}
        {allSuggestions.length > 0 && (
          <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 uppercase">Gợi ý hành động</p>
            <ul className="space-y-1.5">
              {allSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-blue-800 dark:text-blue-200">
                  <span className="shrink-0 mt-0.5">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compact Milk Score Info */}
        <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900/20 rounded p-2 border border-border">
          <p>
            <span className="font-semibold">Điểm sữa:</span> {milkScore}/100 - 
            {milkScore >= 80 ? ' Tuyệt vời! 🎉' : milkScore >= 60 ? ' Tốt, tiếp tục hỗ trợ' : ' Cần chú ý'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
