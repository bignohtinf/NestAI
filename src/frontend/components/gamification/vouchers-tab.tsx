'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { vouchersData } from '@/lib/mock-data';
import { Gift, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function VouchersTab() {
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {vouchersData.map((voucher) => (
          <Card key={voucher.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{voucher.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Expires: {voucher.expires}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {categoryEmoji[voucher.category as keyof typeof categoryEmoji]}
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-3">
                  <p className="text-center text-3xl font-bold text-primary">
                    {voucher.discount}%
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    Discount
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyCode(voucher.id, `VOUCHER${voucher.id}`)}
                  className="w-full"
                >
                  {copiedCode === voucher.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>

                <Button size="sm" className="w-full bg-primary">
                  <Gift className="mr-2 h-4 w-4" />
                  Claim Voucher
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
