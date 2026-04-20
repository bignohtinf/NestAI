'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'health' | 'exercise' | 'social';
  reward: number;
  completed: boolean;
}

interface AppContextType {
  user: UserData | null;
  quests: Quest[];
  setUser: (user: UserData) => void;
  login: (role: 'mother' | 'father' | 'admin', name?: string) => void;
  logout: () => void;
  addPoints: (points: number) => void;
  updateMilkScore: (score: number) => void;
  updateBudget: (amount: number) => void;
  updateBabyInfo: (babyDob: string) => void;
  updateQuest: (questId: string, completed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUserData: UserData = {
  id: 'user_1',
  name: 'Mom',
  role: 'mother',
  age: 28,
  weeksPostpartum: 0, // Đang mang thai tuần 8 (3 tháng đầu thai kỳ)
  points: 320,
  milkScore: 0,
  totalSpending: 150,
  budget: 500,
  // Ngày dự sinh: ~32 tuần nữa (tuần 8 thai kỳ → còn ~32 tuần đến ngày sinh)
  babyDob: new Date(Date.now() + 224 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);

  const login = (role: 'mother' | 'father' | 'admin', name?: string) => {
    const newUser: UserData = {
      ...initialUserData,
      role: role as 'mother' | 'father' | 'admin',
      name: name || (role === 'mother' ? 'Mom' : role === 'father' ? 'Dad' : 'Admin'),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const addPoints = (points: number) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        points: prevUser.points + points,
      };
    });
  };

  const updateMilkScore = (score: number) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        milkScore: Math.min(100, Math.max(0, score)),
      };
    });
  };

  const updateBudget = (amount: number) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        totalSpending: prevUser.totalSpending + amount,
      };
    });
  };

  const updateBabyInfo = (babyDob: string) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        babyDob,
      };
    });
  };

  const updateQuest = (questId: string, completed: boolean) => {
    setQuests((prevQuests) =>
      prevQuests.map((q) =>
        q.id === questId ? { ...q, completed } : q
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        quests,
        setUser,
        login,
        logout,
        addPoints,
        updateMilkScore,
        updateBudget,
        updateBabyInfo,
        updateQuest,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
