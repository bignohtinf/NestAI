'use client';

import React from 'react';
import { leaderboardData } from '@/lib/mock-data';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LeaderboardTab() {
  const { user } = useApp();

  return (
    <div className="space-y-6">
      {/* Your Rank Card */}
      <Card className="border-2 border-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-center">Your Rank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-5xl font-bold text-primary">4th</div>
              <p className="text-sm text-muted-foreground">Current Position</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
              🎯
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Community Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((entry) => {
              const isCurrentUser = entry.rank === 4;
              return (
                <div
                  key={entry.rank}
                  className={cn(
                    'flex items-center justify-between rounded-lg p-4 transition-colors',
                    isCurrentUser
                      ? 'bg-primary/10 ring-1 ring-primary'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center">
                      <span className="text-2xl">{entry.badge}</span>
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-semibold',
                          isCurrentUser && 'text-primary'
                        )}
                      >
                        {entry.name}
                        {isCurrentUser && ' (You)'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rank #{entry.rank}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {entry.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips to Climb the Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span>1️⃣</span>
            <p>Complete daily quests to earn consistent points</p>
          </div>
          <div className="flex gap-2">
            <span>2️⃣</span>
            <p>Maintain a high milk score for bonus points</p>
          </div>
          <div className="flex gap-2">
            <span>3️⃣</span>
            <p>Unlock badges for additional rewards</p>
          </div>
          <div className="flex gap-2">
            <span>4️⃣</span>
            <p>Encourage friends and family to join</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
