'use client';

import { cn } from '@/lib/utils';

interface WeekCalendarProps {
  weekStart: string;
  selectedDate: string;
  savedDates: Set<string>;
  onSelectDate: (date: string) => void;
  onWeekChange: (direction: -1 | 1) => void;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function WeekCalendar({ weekStart, selectedDate, savedDates, onSelectDate, onWeekChange }: WeekCalendarProps) {
  const start = new Date(weekStart);
  const today = new Date().toISOString().split('T')[0];

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const formatMonth = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-white p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <button onClick={() => onWeekChange(-1)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{formatMonth(weekStart)}</span>
        <button onClick={() => onWeekChange(1)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const isSelected = date === selectedDate;
          const isToday = date === today;
          const hasPlan = savedDates.has(date);
          const dayNum = new Date(date).getDate();

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all text-center',
                isSelected
                  ? 'bg-primary text-white shadow-md'
                  : isToday
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-muted/60 text-foreground',
              )}
            >
              <span className="text-[10px] font-medium opacity-70">{DAY_LABELS[i]}</span>
              <span className="text-sm font-semibold">{dayNum}</span>
              <span className={cn('h-1.5 w-1.5 rounded-full', hasPlan ? (isSelected ? 'bg-white' : 'bg-green-500') : 'bg-transparent')} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
