'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  UserData,
  initialUserData,
} from './mock-data';

interface AppContextType {
  user: UserData | null;
  setUser: (user: UserData) => void;
  login: (role: 'mother' | 'father' | 'admin', name?: string) => void;
  logout: () => void;
  addPoints: (points: number) => void;
  updateMilkScore: (score: number) => void;
  updateBudget: (amount: number) => void;
  updateBabyInfo: (babyDob: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

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

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        addPoints,
        updateMilkScore,
        updateBudget,
        updateBabyInfo,
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
