'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseAdmin } from './supabase';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'mother' | 'father' | 'admin';
  age?: number;
  weeksPostpartum?: number;
  points?: number;
  milkScore?: number;
  totalSpending?: number;
  budget?: number;
  babyDob?: string;
  babyStatus?: 'born' | 'pregnant';
  gestationWeeks?: number;   // computed from dueDate; also fetched from DB
  dueDate?: string;          // ISO date string e.g. '2025-08-15' — source of truth
  condition?: string;        // PRD: 'none' | 'gdm' | 'anemia' | 'hypertension'
  foodPreference?: string;   // PRD: food restriction preference
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addPoints: (points: number) => void;
  updateMilkScore: (score: number) => void;
  updateBudget: (amount: number) => void;
  updateBabyInfo: (babyDob: string) => void;
  updateQuest: (questId: string, completed: boolean) => void;
  updatePregnancyProfile: (dueDate: string | null, condition: string, foodPreference: string) => void;
  fetchUserData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBabyInfo = async (userId: string) => {
    try {
      const res = await fetch(`/api/babies/?user_id=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      const babies: { date_of_birth?: string; gestation_weeks?: number }[] = data.babies || [];
      if (babies.length === 0) return;

      const baby = babies[0];
      if (baby.date_of_birth) {
        const now = new Date();
        const birthDate = new Date(baby.date_of_birth);
        const weeks = Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        setUser((prev) => prev ? { ...prev, babyStatus: 'born', weeksPostpartum: weeks } : prev);
      } else if (baby.gestation_weeks != null) {
        setUser((prev) => prev ? { ...prev, babyStatus: 'pregnant', gestationWeeks: baby.gestation_weeks } : prev);
      }
    } catch {
      // baby info is optional, ignore errors
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        return;
      }

      const { data: userData, error: userError } = await supabaseAdmin.getUser(session.user.id);
      if (userError || !userData) {
        setUser(null);
        return;
      }

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.full_name || 'User',
        role: userData.role || 'mother',
      });

      fetchBabyInfo(userData.id);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const { data: userData } = await supabaseAdmin.getUser(session.user.id);
        if (userData && mounted) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.full_name || 'User',
            role: userData.role || 'mother',
          });
          fetchBabyInfo(userData.id);
        }
      } else {
        setUser(null);
      }
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabaseAdmin.signIn(email, password);
      if (error) throw error;

      if (data?.user) {
        const { data: userData, error: userError } = await supabaseAdmin.getUser(data.user.id);
        if (userError || !userData) throw new Error('Không tìm thấy thông tin người dùng');

        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.full_name || 'User',
          role: userData.role || 'mother',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setQuests([]);

    await supabase.auth.signOut({ scope: 'local' }).catch((e) => {
      console.error('Logout error:', e);
    });

    if (typeof window !== 'undefined') {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('sb-'))
        .forEach((key) => localStorage.removeItem(key));
    }

    router.push('/');
  };

  const addPoints = (points: number) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        points: (prevUser.points || 0) + points,
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
        totalSpending: (prevUser.totalSpending || 0) + amount,
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

  // PRD Need #1: update pregnancy profile from the Profile page.
  // Accepts dueDate (ngày dự sinh), computes gestationWeeks automatically.
  // Dashboard banner auto-dismisses once dueDate is set.
  const updatePregnancyProfile = (
    dueDate: string | null,
    condition: string,
    foodPreference: string,
  ) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;

      let computedWeeks: number | undefined = prevUser.gestationWeeks;
      if (dueDate) {
        // Standard: full-term = 40 weeks = 280 days from LMP
        // gestationWeeks = 40 - ceil(daysUntilDue / 7)
        const due = new Date(dueDate);
        const today = new Date();
        const daysRemaining = Math.ceil(
          (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        const weeks = 40 - Math.round(daysRemaining / 7);
        computedWeeks = Math.min(44, Math.max(1, weeks));
      }

      return {
        ...prevUser,
        babyStatus: 'pregnant' as const,
        dueDate: dueDate ?? prevUser.dueDate,
        gestationWeeks: computedWeeks,
        condition,
        foodPreference,
      };
    });
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
        updatePregnancyProfile,
        fetchUserData,
        isLoading,
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
