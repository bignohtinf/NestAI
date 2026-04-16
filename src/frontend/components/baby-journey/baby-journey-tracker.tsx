'use client';

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useApp } from '@/lib/context';

export function BabyJourneyTracker() {
  const { user } = useApp();

  const babyAge = useMemo(() => {
    if (!user?.babyDob) {
      return { days: 0, weeks: 0, months: 0, years: 0 };
    }

    const babyDate = new Date(user.babyDob);
    const today = new Date();
    const timeDiff = today.getTime() - babyDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    return { days, weeks, months, years };
  }, [user?.babyDob]);

  const upcomingMilestones: any[] = [];
  const completedMilestones: any[] = [];

  const progressPercentage = (babyAge.days / 180) * 100;

  return (
    <div className="space-y-6">
      {/* Baby Age Display */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Hành trình của bé yêu
            </h2>
            <p className="text-muted-foreground">
              Ngày sinh: {user?.babyDob || 'Chưa cập nhật'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{babyAge.days}</div>
              <div className="text-xs text-muted-foreground">Ngày tuổi</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-2xl font-bold text-secondary">{babyAge.months}</div>
              <div className="text-xs text-muted-foreground">Tháng tuổi</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Tiến độ đến 6 tháng</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Upcoming Milestones */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Các mốc phát triển sắp tới</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Baby Growth Visualization */}
          <div className="flex flex-col items-center justify-center">
            <Card className="w-full p-8 bg-gradient-to-b from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20">
              <div className="space-y-6">
                <h4 className="text-center font-semibold text-foreground mb-6">Quá trình phát triển của bé</h4>
                
                {/* Growth stages visualization */}
                <div className="space-y-4">
                  {/* 0-2 months */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${babyAge.months < 2 ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="text-3xl mb-2">👶</div>
                    <p className="font-semibold text-sm">0-2 tháng</p>
                    <p className="text-xs text-muted-foreground">Sơ sinh</p>
                  </div>

                  {/* 2-4 months */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${babyAge.months >= 2 && babyAge.months < 4 ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="text-3xl mb-2">😊</div>
                    <p className="font-semibold text-sm">2-4 tháng</p>
                    <p className="text-xs text-muted-foreground">Bắt đầu cười</p>
                  </div>

                  {/* 4-6 months */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${babyAge.months >= 4 && babyAge.months < 6 ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="text-3xl mb-2">🤲</div>
                    <p className="font-semibold text-sm">4-6 tháng</p>
                    <p className="text-xs text-muted-foreground">Nắm chặt tay</p>
                  </div>

                  {/* 6+ months */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${babyAge.months >= 6 ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="text-3xl mb-2">🍽️</div>
                    <p className="font-semibold text-sm">6+ tháng</p>
                    <p className="text-xs text-muted-foreground">Ăn dặm</p>
                  </div>
                </div>

                {/* Current stage indicator */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-muted-foreground text-center mb-2">Giai đoạn hiện tại</p>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{babyAge.months}</p>
                    <p className="text-xs text-muted-foreground">tháng tuổi</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Upcoming Milestones List */}
          <div className="grid gap-4">
            {upcomingMilestones.length > 0 ? (
              upcomingMilestones.map((milestone, index) => {
                const daysUntil = milestone.ageInDays - babyAge.days;
                return (
                  <Card key={milestone.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{milestone.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{milestone.title}</h4>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            {milestone.age}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Sẽ xảy ra trong {daysUntil} ngày
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Bé đã vượt qua tất cả các mốc phát triển theo dõi!</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Completed Milestones */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Các mốc đã hoàn thành ({completedMilestones.length})
        </h3>
        <div className="space-y-2">
          {completedMilestones.length > 0 ? (
            completedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3"
              >
                <div className="text-2xl">{milestone.icon}</div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-foreground text-sm">{milestone.title}</h5>
                  <p className="text-xs text-muted-foreground">{milestone.age}</p>
                </div>
                <div className="text-green-600 dark:text-green-400 text-lg">✓</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có mốc phát triển hoàn thành
            </p>
          )}
        </div>
      </div>

      {/* Tips for Current Stage */}
      <Card className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <h4 className="font-semibold text-foreground mb-3">💡 Lời khuyên cho giai đoạn hiện tại</h4>
        <ul className="space-y-2 text-sm text-foreground">
          {babyAge.months < 2 && (
            <>
              <li>• Bé cần được bú thường xuyên (8-12 lần/ngày)</li>
              <li>• Theo dõi dấu hiệu vàng da</li>
              <li>• Mẹ nên có đủ giấc ngủ và ăn uống đầy đủ</li>
            </>
          )}
          {babyAge.months >= 2 && babyAge.months < 4 && (
            <>
              <li>• Bé bắt đầu cười và tương tác nhiều hơn</li>
              <li>• Tăng cường giao tiếp và kích thích phát triển</li>
              <li>• Mẹ có thể bắt đầu tập thể dục nhẹ</li>
            </>
          )}
          {babyAge.months >= 4 && babyAge.months < 6 && (
            <>
              <li>• Bé có thể cần thêm được hỗ trợ khi giữ đầu</li>
              <li>• Bắt đầu giới thiệu các vật sạch để bé khám phá</li>
              <li>• Chuẩn bị cho giai đoạn ăn dặm sắp tới</li>
            </>
          )}
          {babyAge.months >= 6 && (
            <>
              <li>• Bé sẵn sàng ăn dặm - bắt đầu với các loại cháo mịn</li>
              <li>• Giới thiệu từng thực phẩm mới một cách chậm rãi</li>
              <li>• Tiếp tục cho con bú để cung cấp thêm dinh dưỡng</li>
            </>
          )}
        </ul>
      </Card>
    </div>
  );
}
