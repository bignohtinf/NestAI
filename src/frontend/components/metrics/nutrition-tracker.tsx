'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';

export function NutritionTracker() {
  const nutrients = [
    { name: 'Protein', current: 45, target: 60, unit: 'g' },
    { name: 'Calcium', current: 1100, target: 1200, unit: 'mg' },
    { name: 'Iron', current: 12, target: 15, unit: 'mg' },
    { name: 'Water', current: 6, target: 8, unit: 'cups' },
  ];

  return (
    <div className="space-y-4">
      {nutrients.map((nutrient) => {
        const percentage = Math.min((nutrient.current / nutrient.target) * 100, 100);
        return (
          <div key={nutrient.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{nutrient.name}</span>
              <span className="text-muted-foreground">
                {nutrient.current}/{nutrient.target} {nutrient.unit}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}
