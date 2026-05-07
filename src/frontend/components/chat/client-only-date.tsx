'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyDateProps {
  dateStr: string;
  className?: string;
}

export function ClientOnlyDate({ dateStr, className }: ClientOnlyDateProps) {
  const [formatted, setFormatted] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) setFormatted('Vừa xong');
    else if (diffMins < 60) setFormatted(`${diffMins}m trước`);
    else if (diffHours < 24) setFormatted(`${diffHours}h trước`);
    else if (diffDays < 7) setFormatted(`${diffDays}d trước`);
    else setFormatted(date.toLocaleDateString('vi-VN'));
  }, [dateStr]);

  // Return empty string during SSR to prevent hydration mismatch
  if (!mounted) return null;

  return <span className={className}>{formatted}</span>;
}
