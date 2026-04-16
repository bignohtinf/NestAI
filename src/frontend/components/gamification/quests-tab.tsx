'use client';

import React from 'react';
import { useApp } from '@/lib/context';
import { QuestCard } from '@/components/gamification/quest-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function QuestsTab() {
  const { quests, user } = useApp();
  const completedQuests = quests.filter((q) => q.completed);
  const activeQuests = quests.filter((q) => !q.completed);
  const totalReward = activeQuests.reduce((sum, q) => sum + q.reward, 0);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{user.points}</div>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completedQuests.length}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{activeQuests.length}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalReward}</div>
              <p className="text-xs text-muted-foreground">Potential Reward</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Quests */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Active Quests</h3>
        {activeQuests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No active quests. Complete some to earn points!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Quests */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">Completed Quests</h3>
        {completedQuests.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No completed quests yet. Start completing quests to appear here!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
