'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export function BudgetTracker() {
  const { user } = useApp();
  const spent = user.totalSpending;
  const budget = user.budget;
  const remaining = budget - spent;
  const percentage = (spent / budget) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className="text-2xl font-bold text-foreground">${spent}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Budget</p>
          <p className="text-2xl font-bold text-primary">${budget}</p>
        </div>
      </div>

      <div className="space-y-1">
        <Progress
          value={percentage}
          className={cn('h-3', remaining < 0 && 'bg-red-100 dark:bg-red-900')}
        />
        <div className="flex justify-between text-xs">
          <span className={cn(
            'font-medium',
            remaining < 0 ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {remaining > 0 ? (
              <>Remaining: ${remaining}</>
            ) : (
              <>Over budget: ${Math.abs(remaining)}</>
            )}
          </span>
          <span className="text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded bg-muted p-2">
          <p className="text-muted-foreground">Food</p>
          <p className="font-semibold">$280</p>
        </div>
        <div className="rounded bg-muted p-2">
          <p className="text-muted-foreground">Supplements</p>
          <p className="font-semibold">$120</p>
        </div>
        <div className="rounded bg-muted p-2">
          <p className="text-muted-foreground">Other</p>
          <p className="font-semibold">$50</p>
        </div>
      </div>
    </div>
  );
}
