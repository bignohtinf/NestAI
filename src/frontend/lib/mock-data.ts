// Mock Data for NextAI System - Minimal interfaces only

export interface UserData {
  id: string;
  name: string;
  role: 'mother' | 'father' | 'admin';
  age: number;
  weeksPostpartum: number;
  points: number;
  milkScore: number;
  totalSpending: number;
  budget: number;
  babyDob?: string;
}

// ============= USER INITIAL STATE =============
export const initialUserData: UserData = {
  id: 'user_1',
  name: 'Mom',
  role: 'mother',
  age: 28,
  weeksPostpartum: 6,
  points: 1950,
  milkScore: 82,
  totalSpending: 450,
  budget: 600,
  babyDob: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

// Empty databases - data should come from API
export const questsDatabase: any[] = [];
export const badgesDatabase: any[] = [];
export const dailyEntriesDatabase: any[] = [];
