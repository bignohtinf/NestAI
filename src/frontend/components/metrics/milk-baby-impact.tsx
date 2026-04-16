'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Baby, AlertCircle } from 'lucide-react';

interface MilkData {
  day: string;
  score: number;
  babyMood: number;
}

interface FoodImpact {
  food: string;
  milkChange: number;
  babyReaction: string;
  frequency: number;
}

const milkTrendData: MilkData[] = [
  { day: 'T2', score: 78, babyMood: 7 },
  { day: 'T3', score: 82, babyMood: 8 },
  { day: 'T4', score: 85, babyMood: 8 },
  { day: 'T5', score: 80, babyMood: 6 },
  { day: 'T6', score: 88, babyMood: 9 },
  { day: 'T7', score: 90, babyMood: 9 },
  { day: 'CN', score: 87, babyMood: 8 },
];

const foodImpacts: FoodImpact[] = [
  { food: 'Cá hồi', milkChange: 12, babyReaction: 'Rất tốt - Bé ngủ sâu', frequency: 3 },
  { food: 'Rau xanh', milkChange: 8, babyReaction: 'Tốt - Bé vui vẻ', frequency: 5 },
  { food: 'Hạnh nhân', milkChange: 10, babyReaction: 'Tốt - Bé ăn nhiều', frequency: 4 },
  { food: 'Cà phê', milkChange: -5, babyReaction: 'Bé quấy - Khó ngủ', frequency: 2 },
  { food: 'Sữa', milkChange: 9, babyReaction: 'Tốt - Bé khỏe', frequency: 7 },
];

interface MilkBabyImpactProps {
  activeTab?: 'trend' | 'impact';
}

export function MilkBabyImpact({ activeTab = 'trend' }: MilkBabyImpactProps = {}) {
  const [selectedFood, setSelectedFood] = useState<FoodImpact | null>(null);

  return (
    <div className="space-y-6">
      {/* Trend Tab */}
      {activeTab === 'trend' && (
        <div className="space-y-4">
          {/* Milk Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Điểm Sữa Tuần này</CardTitle>
              <CardDescription>Theo dõi chất lượng sữa hàng ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={milkTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    name="Điểm Sữa"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Baby Mood Correlation */}
          <Card>
            <CardHeader>
              <CardTitle>Tâm trạng Bé & Điểm Sữa</CardTitle>
              <CardDescription>Mối liên hệ giữa sữa mẹ và tâm trạng bé</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={milkTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#3b82f6" name="Điểm Sữa" />
                  <Bar dataKey="babyMood" fill="#ec4899" name="Tâm trạng Bé (1-10)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-green-900 dark:text-green-200">
                ✅ <strong>Tốt:</strong> Điểm sữa tăng 12 điểm từ thứ 2 đến chủ nhật
              </p>
              <p className="text-sm text-green-900 dark:text-green-200">
                ✅ <strong>Tốt:</strong> Bé vui vẻ hơn khi mẹ ăn cá hồi
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Impact Tab */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ảnh hưởng Thực phẩm</CardTitle>
              <CardDescription>Những thực phẩm ảnh hưởng đến sữa mẹ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {foodImpacts.map((impact, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-colors ${
                      impact.milkChange > 0
                        ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : 'border-l-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                    onClick={() => setSelectedFood(impact)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{impact.food}</h4>
                      <span
                        className={`text-lg font-bold ${
                          impact.milkChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {impact.milkChange > 0 ? '+' : ''}{impact.milkChange}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{impact.babyReaction}</p>
                    <p className="text-xs text-muted-foreground">
                      Ăn {impact.frequency} lần/tuần
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                💡 <strong>Gợi ý:</strong> Tăng cá hồi lên 4-5 lần/tuần để cải thiện chất lượng sữa
              </p>
              <p className="text-sm text-blue-900 dark:text-blue-200">
                ⚠️ <strong>Cảnh báo:</strong> Giảm cà phê - bé quấy nhiều khi mẹ uống cà phê
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
