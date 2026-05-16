import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Zap, Info, Heart, TrendingUp,
  Baby, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { nutritionApi } from '@/lib/api';

interface NutritionDashboardProps {
  targetUserId: string | null;
  gestationWeeks?: number | null;
}

export function NutritionDashboard({ targetUserId, gestationWeeks: gestationWeeksProp }: NutritionDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!targetUserId) return;

    async function loadData() {
      try {
        const res = await nutritionApi.getSummary(targetUserId!, 7);
        setData(res);
      } catch (err) {
        console.error('Failed to load nutrition summary:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Refresh khi mẹ lưu scan hoặc thực đơn — cùng tab
    const handleRefresh = () => loadData();
    window.addEventListener('nutritionLogSaved', handleRefresh);
    window.addEventListener('mealPlanSaved', handleRefresh);

    // Auto-refresh mỗi 3 phút để bắt dữ liệu mới từ tab/thiết bị khác
    // + refresh khi user quay lại tab (visibilitychange)
    const pollInterval = setInterval(() => loadData(), 180_000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadData();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('nutritionLogSaved', handleRefresh);
      window.removeEventListener('mealPlanSaved', handleRefresh);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [targetUserId]);

  const gestationWeeks = gestationWeeksProp ?? 24;

  if (!targetUserId || loading) {
    return (
      <div className="w-full min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Đang tải báo cáo dinh dưỡng...</p>
      </div>
    );
  }

  // Format data for chart
  const calorieChartData = data?.history?.map((d: any) => ({
    day: d.date.split('-').slice(2).join('/'),
    intake: d.calories,
    target: 2100
  })) || [];

  const macroData = data?.macro_ratios || [
    { name: 'Protein', value: 33, color: '#0075de' },
    { name: 'Carbs', value: 34, color: '#f59e0b' },
    { name: 'Fat', value: 33, color: '#10b981' },
  ];

  // Vi chất từ API — fallback hiển thị "chưa có dữ liệu" nếu chưa có logs
  const microData = data?.micro_nutrients ?? [
    { name: 'Sắt (Iron)', value: 0, target: 100, unit: 'mg', icon: '🩸' },
    { name: 'Canxi (Calcium)', value: 0, target: 100, unit: 'mg', icon: '🦴' },
    { name: 'Vitamin C', value: 0, target: 100, unit: 'mg', icon: '🌿' },
    { name: 'Kẽm (Zinc)', value: 0, target: 100, unit: 'mg', icon: '🧠' },
  ];

  return (
    <div className="space-y-6">
      {/* --- Top Row: Quick Stats & Baby Growth Connection --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 overflow-hidden border-none shadow-premium bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <CardContent className="p-6 relative">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="h-5 w-5 text-indigo-200" />
                  <span className="text-sm font-medium text-indigo-100 uppercase tracking-wider">Tuần thai {gestationWeeks} • Sự phát triển của Bé</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {gestationWeeks < 13 ? 'Hình thành các cơ quan' : gestationWeeks < 27 ? 'Phát triển não bộ & Thị giác' : 'Hoàn thiện chức năng'}
                </h3>
                <p className="text-indigo-100 text-sm max-w-md leading-relaxed">
                  Tuần này não bộ của bé đang phát triển nhanh chóng. Mẹ hãy chú ý bổ sung thêm <strong>DHA và Choline</strong> từ cá hồi hoặc trứng để hỗ trợ bé nhé!
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md">
                  🧠 Cần thêm DHA
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-md">
                  🐟 Gợi ý: Cá hồi áp chảo
                </Badge>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-48 opacity-20 pointer-events-none">
                <Baby className="w-full h-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-none bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 uppercase tracking-wider">Điểm Dinh Dưỡng</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const score = data?.nutrition_score ?? 0;
              const hasData = (data?.summary?.log_count ?? 0) > 0;
              const ratio = score / 100;
              const scoreColor = score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-400';
              const scoreTextColor = score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-amber-700' : 'text-red-600';
              return (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-100" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - ratio)}
                        className={scoreColor}
                      />
                    </svg>
                    <span className={`absolute text-2xl font-bold ${scoreTextColor}`}>{hasData ? score : '—'}</span>
                  </div>
                  <p className="mt-3 text-xs text-center text-emerald-600 font-medium">
                    {hasData ? 'Dựa trên dữ liệu thật của bạn' : 'Chưa có dữ liệu — hãy ghi nhận bữa ăn'}
                  </p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* --- Second Row: Calorie Trend & Macro Breakdown --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-premium border-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Xu hướng Calo Tuần
                </CardTitle>
                <CardDescription>Mục tiêu: 2,100 kcal/ngày</CardDescription>
              </div>
              {data?.summary?.avg_calories > 0 && (
                <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                  TB: {Math.round(data.summary.avg_calories)} kcal
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calorieChartData}>
                  <defs>
                    <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0075de" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0075de" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intake" 
                    stroke="#0075de" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorIntake)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#e2e8f0" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Cân bằng Macro
            </CardTitle>
            <CardDescription>Tỉ lệ gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {macroData.every((m: any) => m.value === 0) ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-2">
                <Zap className="h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu dinh dưỡng</p>
                <p className="text-xs text-muted-foreground/60">Lưu thực đơn hoặc quét bữa ăn để xem tỉ lệ</p>
              </div>
            ) : (
              <>
                <div className="h-[200px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {macroData.map((m: any) => (
                    <div key={m.name} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{m.name}</span>
                      <span className="font-semibold" style={{color: m.color}}>{m.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Third Row: Micronutrients & AI Insights --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-premium border-none">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Vi Chất Thiết Yếu
            </CardTitle>
            <CardDescription>Chỉ số quan trọng cho thai kỳ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {microData.map(m => (
              <div key={m.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="font-medium">{m.name}</span>
                  </div>
                  <span className="text-muted-foreground font-medium">{m.value}% <span className="text-xs">/ {m.target}%</span></span>
                </div>
                <Progress value={m.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-premium border-none bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Gợi ý từ AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data?.ai_insights && data.ai_insights.length > 0) ? (
              data.ai_insights.map((insight: { type: string; title: string; message: string }, idx: number) => {
                const isWarning = insight.type === 'warning';
                const isSuccess = insight.type === 'success';
                const borderColor = isWarning ? 'border-amber-100' : isSuccess ? 'border-emerald-100' : 'border-blue-100';
                const Icon = isWarning ? AlertCircle : isSuccess ? CheckCircle2 : Info;
                const iconColor = isWarning ? 'text-amber-500' : isSuccess ? 'text-emerald-500' : 'text-blue-500';

                return (
                  <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl bg-white shadow-sm border ${borderColor}`}>
                    <Icon className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white shadow-sm border border-blue-100">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Chưa có phân tích</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ghi nhận bữa ăn hàng ngày để nhận phân tích dinh dưỡng và gợi ý cá nhân hóa từ AI.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
