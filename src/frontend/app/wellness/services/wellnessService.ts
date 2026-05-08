import { WellnessProfile, WellnessEntry, HealthScore, WellnessTrend, ChallengesResponse, StreakData, PersonalizationAnswers } from '../types/wellness';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const wellnessService = {
  // Profile
  getProfile: async (userId: string): Promise<{ profile: WellnessProfile }> => {
    const res = await fetch(`${API_BASE}/wellness/profile/${userId}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json();
  },

  updateProfile: async (userId: string, data: Partial<PersonalizationAnswers>): Promise<{ status: string; profile: WellnessProfile }> => {
    const res = await fetch(`${API_BASE}/wellness/profile/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Entries
  getEntries: async (userId: string, days: number = 7): Promise<{ entries: WellnessEntry[]; count: number }> => {
    const res = await fetch(`${API_BASE}/wellness/entries/${userId}?days=${days}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to get entries');
    return res.json();
  },

  createEntry: async (userId: string, data: Partial<WellnessEntry>): Promise<{ status: string; entry: WellnessEntry }> => {
    const res = await fetch(`${API_BASE}/wellness/entries/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create entry');
    return res.json();
  },

  // Health Score
  getHealthScore: async (userId: string): Promise<HealthScore> => {
    const res = await fetch(`${API_BASE}/wellness/health-score/${userId}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to get health score');
    return res.json();
  },

  // Trend
  getTrend: async (userId: string, days: number = 7): Promise<WellnessTrend> => {
    const res = await fetch(`${API_BASE}/wellness/trend/${userId}?days=${days}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to get trend');
    return res.json();
  },

  // Challenges
  getChallenges: async (userId: string, date?: string): Promise<ChallengesResponse> => {
    const url = date
      ? `${API_BASE}/wellness/challenges/${userId}?date=${date}`
      : `${API_BASE}/wellness/challenges/${userId}`;

    const res = await fetch(url, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to get challenges');
    return res.json();
  },

  completeChallenge: async (userId: string, challengeId: string, completed: boolean): Promise<{ status: string; challenge: any }> => {
    const res = await fetch(`${API_BASE}/wellness/challenges/${userId}/complete?challenge_id=${challengeId}&completed=${completed}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to update challenge');
    return res.json();
  },

  // Streak
  getStreak: async (userId: string): Promise<StreakData> => {
    const res = await fetch(`${API_BASE}/wellness/streak/${userId}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to get streak');
    return res.json();
  },

  // Consultation
  requestConsultation: async (userId: string, message: string): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${API_BASE}/wellness/consultation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId, message })
    });
    if (!res.ok) throw new Error('Failed to submit consultation request');
    return res.json();
  }
};
