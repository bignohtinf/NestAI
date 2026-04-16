'use client';

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface DailyChecklistProps {
  dadView?: boolean;
}

export function DailyChecklist({ dadView = false }: DailyChecklistProps) {
  const [items, setItems] = useState([
    { id: 1, label: dadView ? 'Prepare healthy breakfast' : 'Eat nutritious breakfast', completed: true },
    { id: 2, label: dadView ? 'Encourage hydration' : 'Drink 8 glasses of water', completed: true },
    { id: 3, label: dadView ? 'Support exercise' : 'Take 30-minute walk', completed: false },
    { id: 4, label: dadView ? 'Help with meals' : 'Eat balanced meals', completed: false },
  ]);

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {completedCount}/{items.length} completed
        </p>
        <div className="h-2 flex-1 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-lg p-3 transition-colors',
              item.completed ? 'bg-muted/50' : 'hover:bg-muted/30'
            )}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
            />
            <label
              className={cn(
                'flex-1 cursor-pointer text-sm',
                item.completed && 'line-through text-muted-foreground'
              )}
            >
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
