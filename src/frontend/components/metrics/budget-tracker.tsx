'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SpendingBreakdown {
  food: number;
  supplements: number;
  other: number;
}

export function BudgetTracker() {
  const { user } = useApp();
  const [breakdown, setBreakdown] = useState<SpendingBreakdown>({
    food: 0,
    supplements: 0,
    other: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchBreakdown = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API}/api/admin/spending-breakdown?user_id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setBreakdown(data);
      } catch (error) {
        console.error('Failed to fetch spending breakdown:', error);
        // Keep default values on error
      }
    };
    fetchBreakdown();
  }, [user?.id]);
  
  if (!user) return null;

  const spent = user.totalSpending || 0;
  const budget = user.budget || 0;
  const remaining = budget - spent;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

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
          <p className="font-semibold">${breakdown.food}</p>
        </div>
        <div className="rounded bg-muted p-2">
          <p className="text-muted-foreground">Supplements</p>
          <p className="font-semibold">${breakdown.supplements}</p>
        </div>
        <div className="rounded bg-muted p-2">
          <p className="text-muted-foreground">Other</p>
          <p className="font-semibold">${breakdown.other}</p>
        </div>
      </div>
    </div>
  );
}
