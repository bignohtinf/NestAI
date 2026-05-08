'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface DishDetail {
  name: string;
  matched_food?: { dish_name_vi?: string; dish_name_en?: string } | null;
  estimated_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  pregnancy_benefit?: string;
}

interface FoodScanData {
  meal_name?: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  dishes?: DishDetail[];
  pregnancy_guidance?: string | null;
  meal_context?: string | null;
  mother_name?: string;
  scanned_at?: string;
}

interface FoodScanNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificationTitle: string;
  data: FoodScanData;
  isRead: boolean;
  onMarkAsRead?: () => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function FoodScanNotificationDialog({
  open,
  onOpenChange,
  notificationTitle,
  data,
  isRead,
  onMarkAsRead,
}: FoodScanNotificationDialogProps) {
  const dishes: DishDetail[] = data.dishes || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 border-b px-6 py-4">
          <DialogHeader>
            <div className="flex items-center gap-3 pr-6">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <span className="text-xl">🍽️</span>
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base leading-snug">{notificationTitle}</DialogTitle>
                {data.scanned_at && (
                  <DialogDescription className="text-xs mt-0.5">
                    {formatTime(data.scanned_at)}
                    {data.meal_context && ` · Bữa ${data.meal_context}`}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Tổng dinh dưỡng */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Tổng dinh dưỡng cả bữa
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Calo', value: data.total_calories ?? 0, unit: 'kcal', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
                { label: 'Protein', value: data.total_protein ?? 0, unit: 'g', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                { label: 'Carbs', value: data.total_carbs ?? 0, unit: 'g', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                { label: 'Béo', value: data.total_fat ?? 0, unit: 'g', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              ].map((n) => (
                <div key={n.label} className={`${n.bg} border rounded-xl p-2.5 text-center`}>
                  <p className="text-[10px] text-muted-foreground mb-0.5">{n.label}</p>
                  <p className={`text-base font-bold ${n.color}`}>{n.value}</p>
                  <p className="text-[10px] text-muted-foreground">{n.unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nhận xét thai kỳ */}
          {data.pregnancy_guidance && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
              <span className="text-xl shrink-0">🤰</span>
              <div>
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                  Nhận xét thai kỳ
                </p>
                <p className="text-sm text-emerald-900 mt-0.5">{data.pregnancy_guidance}</p>
              </div>
            </div>
          )}

          {/* Chi tiết từng món */}
          {dishes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Chi tiết từng món ({dishes.length} món)
              </p>
              <div className="space-y-2.5">
                {dishes.map((dish, idx) => (
                  <div key={idx} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {dish.matched_food?.dish_name_vi || dish.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{dish.estimated_grams}g</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-orange-600 shrink-0">{dish.calories} kcal</p>
                    </div>
                    <div className="px-4 py-2.5 grid grid-cols-3 gap-2">
                      {[
                        { label: 'Protein', value: dish.protein, color: 'text-blue-600' },
                        { label: 'Carbs', value: dish.carbs, color: 'text-amber-600' },
                        { label: 'Béo', value: dish.fat, color: 'text-emerald-600' },
                      ].map((m) => (
                        <div key={m.label} className="text-center">
                          <p className={`text-sm font-semibold ${m.color}`}>{m.value}g</p>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>
                    {dish.pregnancy_benefit && (
                      <div className="px-4 pb-2.5">
                        <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5">
                          🤰 {dish.pregnancy_benefit}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action */}
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
