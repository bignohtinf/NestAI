'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { WellnessChallenge } from '../../types/wellness';

interface ChallengeCardProps {
  challenge: WellnessChallenge;
  onComplete: (id: string, completed: boolean) => Promise<void>;
  loading?: boolean;
}

export const ChallengeCard = ({ challenge, onComplete, loading }: ChallengeCardProps) => {
  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'hydration':
        return '💧';
      case 'movement':
        return '🚶';
      case 'nutrition':
        return '🥗';
      case 'meditation':
        return '🧘';
      case 'sleep':
        return '😴';
      default:
        return '⭐';
    }
  };

  const handleToggle = async () => {
    await onComplete(challenge.id, !challenge.completed);
  };

  return (
    <div
      className={`border rounded-lg p-4 flex items-center gap-3 transition-all ${
        challenge.completed
          ? 'bg-green-50 border-green-200'
          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      }`}
    >
      <Checkbox
        checked={challenge.completed}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <span className="text-2xl">{getChallengeIcon(challenge.challenge_type)}</span>
      <div className="flex-1">
        <p
          className={`font-medium ${
            challenge.completed ? 'line-through text-slate-500' : 'text-slate-700'
          }`}
        >
          {challenge.challenge_text}
        </p>
      </div>
      {challenge.completed && <span className="text-green-600 text-sm font-semibold">✓ Done</span>}
    </div>
  );
};
