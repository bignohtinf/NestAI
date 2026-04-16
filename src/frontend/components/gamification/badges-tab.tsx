'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

export function BadgesTab() {
  const { badges } = useApp();
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">
          Badges Earned ({earnedBadges.length}/{badges.length})
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {earnedBadges.map((badge) => (
            <Card key={badge.id} className="border-2 border-green-500 bg-green-50/30 dark:bg-green-950/20">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="text-5xl">{badge.icon}</div>
                <h4 className="mt-3 text-sm font-semibold text-foreground">{badge.name}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{badge.earnedDate}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">Locked Badges</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {lockedBadges.map((badge) => (
              <Card key={badge.id} className="opacity-50">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative">
                    <div className="text-5xl opacity-50">{badge.icon}</div>
                    <Lock className="absolute -right-1 -top-1 h-5 w-5 text-muted-foreground" />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-muted-foreground">{badge.name}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
