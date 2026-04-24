'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NutritionScoreGaugeProps {
  score: number;
  /** 'pregnancy' for pregnant users, 'postpartum' for breastfeeding */
  context?: 'pregnancy' | 'postpartum';
}

/** @deprecated Use MilkScoreGauge only for postpartum/breastfeeding users.
 * For pregnant mothers, the pregnancy micronutrient tracker in MomDashboard is preferred.
 */
export function MilkScoreGauge({ score, context = 'postpartum' }: NutritionScoreGaugeProps) {
  const getStatus = (score: number) => {
    if (score >= 80) return { label: 'Xuất sắc', color: 'text-green-600 dark:text-green-400' };
    if (score >= 60) return { label: 'Tốt', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 40) return { label: 'Khá', color: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Cần cải thiện', color: 'text-red-600 dark:text-red-400' };
  };

  const status = getStatus(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const criteriaItems =
    context === 'pregnancy'
      ? [
          'Nạp đủ vi chất (Sắt, Folate, Canxi, DHA)',
          'Tần suất bữa ăn đều đặn',
          'Chất lượng dinh dưỡng',
          'Đủ nước & nghỉ ngơi',
        ]
      : [
          'Tần suất cho bú',
          'Cân nặng bé tăng tốt',
          'Chất lượng dinh dưỡng',
          'Ngủ & uống đủ nước',
        ];

  const contextLabel = context === 'pregnancy' ? 'Dinh dưỡng thai kỳ' : 'Sức khỏe cho con bú';

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Circular gauge */}
      <div className="relative h-40 w-40">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-500',
              score >= 80
                ? 'text-green-500'
                : score >= 60
                ? 'text-blue-500'
                : score >= 40
                ? 'text-yellow-500'
                : 'text-red-500'
            )}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold">{Math.round(score)}</div>
          <div className="text-xs text-muted-foreground">/ 100</div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <p className={cn('text-lg font-semibold', status.color)}>{status.label}</p>
        <p className="text-xs text-muted-foreground">{contextLabel}</p>
      </div>

      {/* Criteria */}
      <div className="w-full space-y-2 rounded-lg bg-muted p-3 text-xs">
        <p className="font-semibold text-muted-foreground">Dựa trên:</p>
        <ul className="space-y-1 text-muted-foreground">
          {criteriaItems.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
