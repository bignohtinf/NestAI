'use client';

import React from 'react';

export function QuickStats() {
  const stats = [
    { label: 'Water', value: '6/8', unit: 'cups', icon: '💧' },
    { label: 'Protein', value: '45g', unit: 'intake', icon: '🥚' },
    { label: 'Calcium', value: '1100mg', unit: 'consumed', icon: '🥛' },
    { label: 'Sleep', value: '6h', unit: 'last night', icon: '😴' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-muted p-4 text-center">
          <div className="text-2xl">{stat.icon}</div>
          <p className="mt-2 text-sm font-medium text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
