'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function VouchersTab() {
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const vouchersData: any[] = [];

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const categoryEmoji = {
    dairy: '🥛',
    vegetable: '🥗',
    protein: '🥚',
    fruit: '🍎',
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 Earn points by completing quests and redeem them for shopping vouchers!
        </p>
      </div>

      {vouchersData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No vouchers available yet. Complete quests to earn points and unlock rewards!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
