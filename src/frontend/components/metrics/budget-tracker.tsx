'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/** Định dạng số tiền VNĐ gọn gàng: 1.500.000 → "1,5tr" */
function fmtVnd(n: number): string {
  if (n === 0) return '0₫';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}tr₫`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}k₫`;
  return `${n}₫`;
}

export function BudgetTracker() {
  const { user } = useApp();
  const [totalVnd, setTotalVnd]       = useState(0);
  const [budgetVnd, setBudgetVnd]     = useState(0);
  const [shopping, setShopping]       = useState(0);
  const [mealPlans, setMealPlans]     = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/spending?user_id=${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setTotalVnd(data.total_vnd   ?? 0);
        setBudgetVnd(data.budget_vnd ?? 0);
        setShopping(data.breakdown?.shopping   ?? 0);
        setMealPlans(data.breakdown?.meal_plans ?? 0);
      })
      .catch(() => null);
  }, [user?.id]);

  if (!user) return null;

  const remaining  = budgetVnd - totalVnd;
  const percentage = budgetVnd > 0 ? Math.min(100, Math.round((totalVnd / budgetVnd) * 100)) : 0;
  const hasData    = totalVnd > 0 || budgetVnd > 0;

  if (!hasData) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground space-y-1">
        <p>Chưa có dữ liệu chi tiêu</p>
        <p className="text-xs">Lưu thực đơn hoặc đánh dấu mua sắm để theo dõi</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Đã chi</p>
          <p className="text-xl font-bold text-foreground">{fmtVnd(totalVnd)}</p>
        </div>
        {budgetVnd > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Ngân sách</p>
            <p className="text-xl font-bold text-primary">{fmtVnd(budgetVnd)}</p>
          </div>
        )}
      </div>

      {budgetVnd > 0 && (
        <div className="space-y-1">
          <Progress
            value={percentage}
            className={cn('h-3', remaining < 0 && '[&>div]:bg-red-500')}
          />
          <div className="flex justify-between text-xs">
            <span className={cn('font-medium', remaining < 0 ? 'text-destructive' : 'text-muted-foreground')}>
              {remaining >= 0 ? `Còn lại: ${fmtVnd(remaining)}` : `Vượt: ${fmtVnd(Math.abs(remaining))}`}
            </span>
            <span className="text-muted-foreground">{percentage}%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded-lg bg-muted p-2">
          <p className="text-muted-foreground">🛒 Mua sắm</p>
          <p className="font-semibold">{fmtVnd(shopping)}</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <p className="text-muted-foreground">🍽️ Thực đơn</p>
          <p className="font-semibold">{fmtVnd(mealPlans)}</p>
        </div>
      </div>
    </div>
  );
}
