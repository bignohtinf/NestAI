'use client';

import { useState, useEffect, useCallback } from 'react';
import { wellnessService } from '../services/wellnessService';
import { WellnessProfile, WellnessEntry, HealthScore, WellnessTrend, ChallengesResponse, StreakData } from '../types/wellness';

export const useWellnessData = (userId: string | null) => {
  const [profile, setProfile] = useState<WellnessProfile | null>(null);
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [trend, setTrend] = useState<WellnessTrend | null>(null);
  const [challenges, setChallenges] = useState<ChallengesResponse | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [profileRes, entriesRes, scoreRes, trendRes, challengesRes, streakRes] = await Promise.all([
        wellnessService.getProfile(userId),
        wellnessService.getEntries(userId, 7),
        wellnessService.getHealthScore(userId),
        wellnessService.getTrend(userId, 7),
        wellnessService.getChallenges(userId),
        wellnessService.getStreak(userId)
      ]);

      setProfile(profileRes.profile);
      setEntries(entriesRes.entries);
      setHealthScore(scoreRes);
      setTrend(trendRes);
      setChallenges(challengesRes);
      setStreak(streakRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const updateProfile = useCallback(async (data: any) => {
    if (!userId) return;
    try {
      const result = await wellnessService.updateProfile(userId, data);
      setProfile(result.profile);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  }, [userId]);

  const createEntry = useCallback(async (data: Partial<WellnessEntry>) => {
    if (!userId) return;
    try {
      const result = await wellnessService.createEntry(userId, data);
      setEntries((prev) => [result.entry, ...prev]);
      // Refresh health score and trend
      fetchAllData();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    }
  }, [userId, fetchAllData]);

  const completeChallenge = useCallback(async (challengeId: string, completed: boolean) => {
    if (!userId) return;
    try {
      const result = await wellnessService.completeChallenge(userId, challengeId, completed);
      // Update challenges list
      if (challenges) {
        setChallenges({
          ...challenges,
          challenges: challenges.challenges.map((c) =>
            c.id === challengeId ? { ...c, completed, completed_at: completed ? new Date().toISOString() : undefined } : c
          ),
          completed: completed ? challenges.completed + 1 : challenges.completed - 1
        });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
      throw err;
    }
  }, [userId, challenges]);

  const refresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    profile,
    entries,
    healthScore,
    trend,
    challenges,
    streak,
    loading,
    error,
    updateProfile,
    createEntry,
    completeChallenge,
    refresh
  };
};
