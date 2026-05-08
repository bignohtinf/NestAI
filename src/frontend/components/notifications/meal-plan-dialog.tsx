'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface DishDetail {
  name: string;
  dish_type: string;
  grams: number;
  energy: number;
  protein: number;
  fat: number;
  carbohydrate: number;
}

interface MealSection {
  key: string;
  label: string;
  dishes: DishDetail[];
  nutrition: {
    energy?: number;
    protein?: number;
    fat?: number;
    carbohydrate?: number;
  } | null;
}

interface TotalNutrition {
  energy?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
}

interface MealPlanData {
  plan_date?: string | null;
  target?: string;
  meals?: MealSection[];
  total_nutrition?: TotalNutrition | null;
  estimated_cost?: number | null;
  mother_name?: string;
  saved_at?: string;
}

interface MealPlanNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationTitle: string;
  data: MealPlanData;
  isRead: boolean;
  onMarkAsRead?: () => void;
}

const MEAL_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  breakfast: { icon: '🌅', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  lunch:     { icon: '☀️', color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-100' },
  dinner:    { icon: '🌙', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100' },
};

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatSavedAt(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function MealPlanNotificationDialog({
  open,
  onOpenChange,
  notificationTitle,
  data,
  isRead,
  onMarkAsRead,
}: MealPlanNotificationDialogProps) {
  const meals = data.meals || [];
  const total = data.total_nutrition;
  const targetLabel = data.target === 'baby' ? 'cho bé' : 'thai kỳ';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto p-0 gap-0">
        {/* Header sticky */}
        <div className="sticky top-0 bg-background z-10 border-b px-6 py-4">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-xl">
                📋
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base leading-snug">{notificationTitle}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5 space-x-2">
                  {data.plan_date && <span>{formatDate(data.plan_date)}</span>}
                  {data.saved_at && <span>· Lưu {formatSavedAt(data.saved_at)}</span>}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 align-middle">
                    {targetLabel}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Tổng dinh dưỡng ngày */}
          {total && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tổng dinh dưỡng cả ngày
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Năng lượng', value: Math.round(total.energy ?? 0), unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
                  { label: 'Protein',    value: (total.protein ?? 0).toFixed(1),   unit: 'g', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
                  { label: 'Fat',        value: (total.fat ?? 0).toFixed(1),       unit: 'g', color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
                  { label: 'Carbs',      value: (total.carbohydrate ?? 0).toFixed(1), unit: 'g', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                ].map((n) => (
                  <div key={n.label} className={`${n.bg} border rounded-xl p-2.5 text-center`}>
                    <p className="text-[10px] text-muted-foreground mb-0.5">{n.label}</p>
                    <p className={`text-sm font-bold ${n.color}`}>{n.value}</p>
                    <p className="text-[10px] text-muted-foreground">{n.unit}</p>
                  </div>
                ))}
              </div>

              {data.estimated_cost != null && data.estimated_cost > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  💰 Chi phí ước tính:{' '}
                  <span className="font-semibold text-foreground">
                    {Number(data.estimated_cost).toLocaleString('vi-VN')}đ
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Chi tiết từng bữa */}
          {meals.map((meal) => {
            const meta = MEAL_META[meal.key] || { icon: '🍽️', color: 'text-foreground', bg: 'bg-muted', border: 'border-border' };
            const mealKcal = meal.nutrition?.energy != null
              ? Math.round(meal.nutrition.energy)
              : meal.dishes.reduce((s, d) => s + (d.energy ?? 0) * ((d.grams ?? 100) / 100), 0);

            return (
              <div key={meal.key}>
                {/* Meal header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl ${meta.bg} border ${meta.border}`}>
                  <p className={`text-sm font-semibold ${meta.color} flex items-center gap-1.5`}>
                    <span>{meta.icon}</span> {meal.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {meal.dishes.length} món · <span className="font-medium text-orange-600">{Math.round(mealKcal)} kcal</span>
                  </p>
                </div>

                {/* Dishes */}
                <div className="border border-t-0 border-border/50 rounded-b-xl overflow-hidden divide-y divide-border/30">
                  {meal.dishes.length > 0 ? meal.dishes.map((dish, i) => {
                    const scale = (dish.grams ?? 100) / 100;
                    const kcal = Math.round((dish.energy ?? 0) * scale);
                    const p = ((dish.protein ?? 0) * scale).toFixed(1);
                    const f = ((dish.fat ?? 0) * scale).toFixed(1);
                    const c = ((dish.carbohydrate ?? 0) * scale).toFixed(1);

                    return (
                      <div key={i} className="px-3 py-2.5 bg-card flex items-start gap-2">
                        <Badge variant="default" className="mt-0.5 text-[9px] uppercase px-1.5 h-4 shrink-0">
                          {(dish.dish_type || '').replace('món ', '')}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{dish.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {dish.grams}g · <span className="text-orange-600 font-medium">{kcal} kcal</span>
                            {' '}· P:{p}g · F:{f}g · C:{c}g
                          </p>
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-muted-foreground italic text-center py-3 bg-card">
                      Không có món nào
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {!isRead && onMarkAsRead && (
              <Button size="sm" variant="secondary" className="gap-1.5" onClick={onMarkAsRead}>
                <Check className="h-3.5 w-3.5" />
                Đánh dấu đã đọc
              </Button>
            )}
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
