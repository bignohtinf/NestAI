'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockUser, mockHealthMetrics, mockDailyLog } from '@/lib/mock-data';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Droplets, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  // Prepare weight data
  const weightData = mockHealthMetrics.map((metric) => ({
    date: new Date(metric.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    weight: metric.weight,
    bmi: metric.bmi,
  }));

  // Nutrition breakdown data
  const nutritionData = [
    {
      name: 'Protein',
      value: mockDailyLog.totalNutrition.protein,
      color: '#FF8C42',
    },
    {
      name: 'Carbs',
      value: mockDailyLog.totalNutrition.carbs,
      color: '#06B6D4',
    },
    {
      name: 'Fat',
      value: mockDailyLog.totalNutrition.fat,
      color: '#FBBF24',
    },
  ];

  const currentWeight = mockHealthMetrics[mockHealthMetrics.length - 1].weight || 0;
  const previousWeight = mockHealthMetrics[mockHealthMetrics.length - 2]?.weight || 0;
  const weightChange = currentWeight - previousWeight;
  const isWeightDecreasing = weightChange < 0;

  const currentBMI = mockHealthMetrics[mockHealthMetrics.length - 1].bmi || 0;
  const bmiCategory =
    currentBMI < 18.5
      ? 'Thiếu cân'
      : currentBMI < 25
        ? 'Bình thường'
        : currentBMI < 30
          ? 'Thừa cân'
          : 'Béo phì';

  return (
    <MainLayout user={mockUser}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Bảng điều khiển</h1>
          <p className="text-muted-foreground">Theo dõi tiến độ sức khỏe và dinh dưỡng của bạn</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weight */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cân nặng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-foreground">{currentWeight}</div>
                <div className="text-sm text-muted-foreground">kg</div>
              </div>
              <div className="flex items-center gap-2">
                {isWeightDecreasing ? (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isWeightDecreasing ? 'text-green-500' : 'text-red-500'}`}>
                  {isWeightDecreasing ? '-' : '+'}{Math.abs(weightChange).toFixed(1)} kg
                </span>
              </div>
            </CardContent>
          </Card>

          {/* BMI */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chỉ số BMI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-foreground">{currentBMI.toFixed(1)}</div>
              </div>
              <div className="text-sm text-muted-foreground">{bmiCategory}</div>
            </CardContent>
          </Card>

          {/* Daily Calories */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Calo hôm nay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-primary">{mockDailyLog.totalNutrition.calories.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">kcal</div>
              </div>
              <div className="text-sm text-muted-foreground">Mục tiêu: 2000 kcal</div>
            </CardContent>
          </Card>

          {/* Water Intake */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Nước uống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-blue-500">{mockDailyLog.waterIntake}</div>
                <div className="text-sm text-muted-foreground">L</div>
              </div>
              <div className="text-sm text-muted-foreground">Mục tiêu: 2.5 L</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weight Trend */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Xu hướng cân nặng</CardTitle>
              <CardDescription>Cân nặng 7 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" domain={[70, 76]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-primary)"
                    dot={{ fill: 'var(--color-primary)', r: 5 }}
                    name="Cân nặng (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* BMI Trend */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Chỉ số BMI</CardTitle>
              <CardDescription>Theo dõi BMI 7 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" domain={[23, 25]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Bar dataKey="bmi" fill="var(--color-accent)" name="BMI" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Nutrition Breakdown */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Phân tích dinh dưỡng</CardTitle>
              <CardDescription>Phân bổ macronutrient hôm nay</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nutritionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}g`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {nutritionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Thống kê hôm nay</CardTitle>
              <CardDescription>Chi tiết dinh dưỡng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">Protein</span>
                  <span className="text-sm font-bold text-primary">{mockDailyLog.totalNutrition.protein.toFixed(0)}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">Carbohydrates</span>
                  <span className="text-sm font-bold text-sky-500">{mockDailyLog.totalNutrition.carbs.toFixed(0)}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">Chất béo</span>
                  <span className="text-sm font-bold text-yellow-500">{mockDailyLog.totalNutrition.fat.toFixed(0)}g</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium text-foreground">Fiber</span>
                  <span className="text-sm font-bold text-green-500">{mockDailyLog.totalNutrition.fiber?.toFixed(0) || '0'}g</span>
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">Xem chi tiết</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
