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
    { label: 'Sắt', value: '—', unit: 'mg', icon: '🩸' },
    { label: 'Folate', value: '—', unit: 'mcg', icon: '🥬' },
    { label: 'Canxi', value: '—', unit: 'mg', icon: '🥛' },
    { label: 'DHA', value: '—', unit: 'mg', icon: '🐟' },
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/health/daily-stats?user_id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setStats([
          { label: 'Sắt', value: `${data.iron ?? '—'}`, unit: 'mg', icon: '🩸' },
          { label: 'Folate', value: `${data.folate ?? '—'}`, unit: 'mcg', icon: '🥬' },
          { label: 'Canxi', value: `${data.calcium ?? '—'}`, unit: 'mg', icon: '🥛' },
          { label: 'DHA', value: `${data.dha ?? '—'}`, unit: 'mg', icon: '🐟' },
        ]);
      } catch {
        // Keep default "—" values on error — stat fetch is non-critical
      }
    };

    fetchStats();
  }, [user?.id]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg bg-muted p-4 text-center">
          <div className="text-2xl">{stat.icon}</div>
          <p className="mt-2 text-sm font-bold text-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          <p className="text-xs text-muted-foreground">{stat.unit}</p>
        </div>
      ))}
    </div>
  );
}
