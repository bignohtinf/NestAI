'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';

interface Stat {
  label: string;
  value: string;
  unit: string;
  icon: string;
}

export function QuickStats() {
  const { user } = useApp();
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Water', value: '-', unit: 'cups', icon: '💧' },
    { label: 'Protein', value: '-', unit: 'intake', icon: '🥚' },
    { label: 'Calcium', value: '-', unit: 'consumed', icon: '🥛' },
    { label: 'Sleep', value: '-', unit: 'last night', icon: '😴' },
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/health/daily-stats?user_id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStats([
          { label: 'Water', value: `${data.water || 0}`, unit: 'cups', icon: '💧' },
          { label: 'Protein', value: `${data.protein || 0}g`, unit: 'intake', icon: '🥚' },
          { label: 'Calcium', value: `${data.calcium || 0}mg`, unit: 'consumed', icon: '🥛' },
          { label: 'Sleep', value: `${data.sleep || 0}h`, unit: 'last night', icon: '😴' },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default values on error
      }
    };
    fetchStats();
  }, [user?.id]);

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
