'use client';

import React from 'react';
import { useApp, Quest } from '@/lib/context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
}

const categoryEmoji = {
  nutrition: '🥗',
  health: '❤️',
  exercise: '🏃',
  social: '👥',
};

export function QuestCard({ quest }: QuestCardProps) {
  const { updateQuest } = useApp();

  const handleComplete = () => {
    updateQuest(quest.id, true);
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        quest.completed && 'border-green-500 bg-green-50 dark:bg-green-950/20'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{categoryEmoji[quest.category]}</span>
              <h3 className="font-semibold text-foreground">{quest.title}</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{quest.description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-primary">{quest.reward}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </div>

          {quest.completed ? (
            <Button
              disabled
              size="sm"
              variant="outline"
              className="border-green-500 bg-green-50 text-green-600 hover:bg-green-50 dark:bg-green-950/30 dark:text-green-400"
            >
              <Check className="mr-1 h-4 w-4" />
              Completed
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleComplete}
              className="bg-primary hover:bg-primary/90"
            >
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
