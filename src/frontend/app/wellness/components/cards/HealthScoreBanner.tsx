'use client';

import { HealthScore } from '../../types/wellness';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HealthScoreBannerProps {
  score: HealthScore;
  loading?: boolean;
}

export const HealthScoreBanner = ({ score, loading }: HealthScoreBannerProps) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg p-6 h-48 animate-pulse" />
    );
  }

  const getGradient = () => {
    switch (score.color) {
      case 'green':
        return 'from-green-100 to-emerald-50';
      case 'light-green':
        return 'from-lime-100 to-green-50';
      case 'yellow':
        return 'from-amber-100 to-yellow-50';
      case 'red':
        return 'from-red-100 to-orange-50';
      default:
        return 'from-slate-100 to-slate-50';
    }
  };

  const getTextColor = () => {
    switch (score.color) {
      case 'green':
        return 'text-green-700';
      case 'light-green':
        return 'text-lime-700';
      case 'yellow':
        return 'text-amber-700';
      case 'red':
        return 'text-red-700';
      default:
        return 'text-slate-700';
    }
  };

  const getCircleColor = () => {
    switch (score.color) {
      case 'green':
        return 'text-green-600';
      case 'light-green':
        return 'text-lime-600';
      case 'yellow':
        return 'text-amber-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getGradient()} rounded-lg p-6 md:p-8`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-2">Health Score</p>
          <h2 className={`text-5xl md:text-6xl font-bold ${getTextColor()} mb-2`}>
            {score.score}
          </h2>
          <p className="text-lg font-semibold text-slate-700">{score.message}</p>
        </div>

        {/* Score Circle */}
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(score.score / 100) * 283} 283`}
              className={`${getCircleColor()} transition-all duration-500`}
              strokeLinecap="round"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-center`}>
            <div>
              <p className={`text-2xl md:text-3xl font-bold ${getTextColor()}`}>{score.score}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
