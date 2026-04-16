'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, AlertCircle } from 'lucide-react';

const weeklyData = [
  { day: 'T2', planned: 150, actual: 145 },
  { day: 'T3', planned: 150, actual: 160 },
  { day: 'T4', planned: 150, actual: 155 },
  { day: 'T5', planned: 150, actual: 140 },
  { day: 'T6', planned: 150, actual: 170 },
  { day: 'T7', planned: 150, actual: 165 },
  { day: 'CN', planned: 150, actual: 150 },
];

const categoryData = [
  { name: 'Protein', value: 35, color: '#3b82f6' },
  { name: 'Rau', value: 25, color: '#10b981' },
  { name: 'Sữa', value: 20, color: '#f59e0b' },
  { name: 'Khác', value: 20, color: '#8b5cf6' },
];

export function BudgetOptimization() {
  const totalPlanned = weeklyData.reduce((sum, d) => sum + d.planned, 0);
  const totalActual = weeklyData.reduce((sum, d) => sum + d.actual, 0);
  const savings = totalPlanned - totalActual;
  const savingsPercent = ((savings / totalPlanned) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Dự tính</p>
            <p className="text-2xl font-bold text-primary">{totalPlanned}k</p>
            <p className="text-xs text-muted-foreground mt-1">Tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Thực tế</p>
            <p className="text-2xl font-bold text-orange-600">{totalActual}k</p>
            <p className="text-xs text-muted-foreground mt-1">Đã chi</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Tiết kiệm</p>
            <p className="text-2xl font-bold text-green-600">{savings}k</p>
            <p className="text-xs text-muted-foreground mt-1">{savingsPercent}% dự tính</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>So sánh Dự tính vs Thực tế</CardTitle>
          <CardDescription>Chi tiêu hàng ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#3b82f6" name="Dự tính" />
              <Bar dataKey="actual" fill="#f59e0b" name="Thực tế" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Phân bố Chi tiêu</CardTitle>
          <CardDescription>Theo danh mục</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardContent className="p-4 space-y-2">
          <p className="text-sm text-green-900 dark:text-green-200">
            💰 <strong>Gợi ý tiết kiệm:</strong> Mua cá hồi vào thứ 2-3 khi có khuyến mãi
          </p>
          <p className="text-sm text-green-900 dark:text-green-200">
            💰 <strong>Gợi ý tiết kiệm:</strong> Thay rau xanh bằng rau mùa để giảm 20%
          </p>
          <p className="text-sm text-green-900 dark:text-green-200">
            💰 <strong>Gợi ý tiết kiệm:</strong> Mua sữa theo combo tiết kiệm 15%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
