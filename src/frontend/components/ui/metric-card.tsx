import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({
    className,
    value,
    label,
    description,
    icon,
    trend,
    trendValue,
    ...props
  }, ref) => (
    <Card ref={ref} className={cn('', className)} {...props}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-[2.5rem] font-bold leading-tight tracking-[-1.5px] text-[rgba(0,0,0,0.95)] mb-2">
              {value}
            </div>
            <p className="text-sm font-medium text-[#615d59] mb-1">
              {label}
            </p>
            {description && (
              <p className="text-xs text-[#a39e98]">
                {description}
              </p>
            )}
            {trend && trendValue && (
              <div className={cn(
                'text-xs font-semibold mt-2 inline-flex items-center gap-1',
                trend === 'up' ? 'text-[#1aae39]' : trend === 'down' ? 'text-[#dd5b00]' : 'text-[#615d59]'
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
);
MetricCard.displayName = 'MetricCard';

export { MetricCard };
