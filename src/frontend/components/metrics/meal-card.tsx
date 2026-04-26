'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';

interface DishData {
  stt: number;
  dish_name_vi?: string;
  dish_name_vietnamese?: string;
  dish_type: string;
  group_name_vi?: string;
  group_name_vietnamese?: string;
  energy?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
  units?: number;
  grams?: number;
}

interface MealCardProps {
  mealKey: string;
  label: string;
  icon: string;
  time: string;
  dishes: DishData[];
  stts: number[];
  nutritionSummary?: { energy?: number; protein?: number; fat?: number; carbohydrate?: number };
  isLocked: boolean;
  onToggleLock: (mealKey: string, stts: number[]) => void;
  defaultExpanded?: boolean;
}

export function MealCard({ mealKey, label, icon, time, dishes, stts, nutritionSummary, isLocked, onToggleLock, defaultExpanded }: MealCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  const totalKcal = nutritionSummary?.energy ?? dishes.reduce((s, d) => s + (d.energy ?? 0) * ((d.grams ?? 100) / 100), 0);

  return (
    <Card className={`overflow-hidden transition-all ${isLocked ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <button className="flex-1 text-left flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-sm font-semibold flex items-center gap-2">
              {label}
              {isLocked && <Lock className="h-3 w-3 text-amber-500" />}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {time} • {dishes.length} món • {Math.round(totalKcal)} kcal
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 ${isLocked ? 'text-amber-600' : 'text-muted-foreground'}`} onClick={() => onToggleLock(mealKey, stts)}>
            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </Button>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/40 p-3 bg-white/50 space-y-2">
          {dishes.length > 0 ? dishes.map((dish, i) => {
            const name = dish.dish_name_vi || dish.dish_name_vietnamese || '';
            const group = dish.group_name_vi || dish.group_name_vietnamese || '';
            const grams = dish.grams ?? 100;
            const scale = grams / 100;
            const kcal = (dish.energy ?? 0) * scale;
            const p = (dish.protein ?? 0) * scale;
            const f = (dish.fat ?? 0) * scale;
            const c = (dish.carbohydrate ?? 0) * scale;

            return (
              <div key={i} className="flex flex-col gap-1 p-2.5 rounded-lg bg-white border border-border/40 shadow-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="default" className="mt-0.5 text-[9px] uppercase px-1.5 h-4 shrink-0">
                    {dish.dish_type.replace('món ', '')}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{name}</p>
                    {group && <p className="text-[10px] text-muted-foreground mt-0.5">{group}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground pl-1 mt-0.5">
                  <span className="font-semibold text-foreground/70">{grams}g</span>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">{Math.round(kcal)} kcal</span>
                  <span>•</span>
                  <span>P:{p.toFixed(1)}g</span>
                  <span>F:{f.toFixed(1)}g</span>
                  <span>C:{c.toFixed(1)}g</span>
                </div>
              </div>
            );
          }) : (
            <p className="text-xs text-muted-foreground italic text-center py-2">Không tìm thấy tổ hợp món phù hợp</p>
          )}
        </div>
      )}
    </Card>
  );
}
