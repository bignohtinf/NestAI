'use client';

import { ChallengeCard } from '../cards/ChallengeCard';
import { useWellnessData } from '../../hooks/useWellnessData';
import { Flame } from 'lucide-react';

interface ChallengesSectionProps {
  userId: string;
}

export const ChallengesSection = ({ userId }: ChallengesSectionProps) => {
  const { challenges, streak, loading, completeChallenge } = useWellnessData(userId);

  if (loading) {
    return <div>Loading challenges...</div>;
  }

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-slate-400';
    if (streak < 3) return 'text-yellow-500';
    if (streak < 7) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Streak Badge */}
      {streak && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className={`w-8 h-8 ${getStreakColor(streak.streak)}`} />
            <h3 className="text-3xl font-bold text-amber-700">{streak.streak}</h3>
          </div>
          <p className="text-slate-700 font-semibold">Day Streak!</p>
          <p className="text-sm text-slate-600 mt-1">Keep up the great work!</p>
        </div>
      )}

      {/* Today's Challenges */}
      {challenges && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Today's Challenges</h3>
            <span className="text-sm text-slate-600">
              {challenges.completed} of {challenges.total} completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(challenges.completed / challenges.total) * 100}%` }}
            />
          </div>

          {/* Challenges List */}
          <div className="space-y-3">
            {challenges.challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={completeChallenge}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
