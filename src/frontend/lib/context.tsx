'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
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
  gestationWeeks?: number;
  dob?: string;
  allergies?: string[];
  dislikes?: string[];
  condition?: string;
  foodPreference?: string;
  lastMenstrualPeriod?: string;
  dueDate?: string;
  trimester?: number;
  daysInWeek?: number;
  weightGain?: number;
  bmi?: number;
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
  fetchUserData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  const fetchBabyInfo = async (userId: string) => {
    try {
      const res = await fetch(`/api/babies/?user_id=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      const babies: {
        status?: string;
        date_of_birth?: string;
        gestation_weeks?: number;
        days_in_week?: number;
        lmp?: string;
        edd?: string;
      }[] = data.babies || [];
      if (babies.length === 0) return;

      // Ưu tiên baby đang mang thai, nếu không có thì lấy baby đầu tiên
      const pregnantBaby = babies.find(b => b.status === 'pregnant');
      const baby = pregnantBaby ?? babies[0];

      if (baby.status === 'born' && baby.date_of_birth) {
        const now = new Date();
        const birthDate = new Date(baby.date_of_birth);
        const weeks = Math.floor((now.getTime() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (mountedRef.current) {
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              babyStatus: 'born',
              weeksPostpartum: prev.weeksPostpartum ?? weeks,
              babyDob: prev.babyDob ?? baby.date_of_birth,
            };
          });
        }
      } else if (baby.status === 'pregnant') {
        // gestation_weeks được tính live từ backend (từ lmp/edd), có thể null nếu chưa có anchor dates
        if (mountedRef.current) {
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              babyStatus: 'pregnant',
              // Chỉ set nếu medical profile chưa set (medical profile sẽ override sau)
              gestationWeeks: prev.gestationWeeks ?? baby.gestation_weeks ?? undefined,
              daysInWeek: prev.daysInWeek ?? baby.days_in_week ?? undefined,
              // Extract dueDate + trimester từ baby data (enrich_baby trả về)
              dueDate: prev.dueDate ?? baby.due_date ?? baby.edd ?? undefined,
              trimester: prev.trimester ?? baby.trimester ?? undefined,
            };
          });
        }
      }
    } catch {
      // baby info is optional
    }
  };

  const fetchMedicalProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/medical-profile/me?user_id=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        if (mountedRef.current) {
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              babyStatus: p.pregnancy_status === 'pregnant'
                ? 'pregnant'
                : p.pregnancy_status === 'postpartum'
                ? 'born'
                : prev.babyStatus,
              gestationWeeks: p.week_of_pregnancy ?? prev.gestationWeeks,
              // days_in_week: dùng ?? để null từ API (khi không tính được) KHÔNG ghi đè giá trị đúng từ baby API
              // Giá trị 0 hợp lệ (ngày 0 trong tuần) vẫn được giữ nhờ ?? chỉ skip null/undefined
              daysInWeek: p.days_in_week ?? prev.daysInWeek,
              dueDate: p.due_date ?? prev.dueDate,
              lastMenstrualPeriod: p.last_menstrual_period ?? prev.lastMenstrualPeriod,
              trimester: p.trimester ?? prev.trimester,
              weightGain: p.weight_gain_kg ?? prev.weightGain,
              bmi: p.bmi ?? prev.bmi,
            };
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch medical profile:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const { data: userData, error: userError } = await supabaseAdmin.getUser(session.user.id);
      
      if (userError || !userData) {
        if (mountedRef.current) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (mountedRef.current) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.full_name || 'User',
          role: (userData.role as any) || 'mother',
          dob: userData.dob,
          allergies: userData.allergies,
          dislikes: userData.dislikes,
          condition: userData.condition,
          foodPreference: userData.food_preference,
        });

        fetchBabyInfo(userData.id);
        fetchMedicalProfile(userData.id);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      if (mountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      if (session?.user) {
        const { data: userData } = await supabaseAdmin.getUser(session.user.id);
        if (userData && mountedRef.current) {
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.full_name || 'User',
            role: (userData.role as any) || 'mother',
            dob: userData.dob,
            allergies: userData.allergies,
            dislikes: userData.dislikes,
            condition: userData.condition,
            foodPreference: userData.food_preference,
          });
          fetchBabyInfo(userData.id);
          fetchMedicalProfile(userData.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      if (mountedRef.current) setIsLoading(false);
    });

    return () => {
      mountedRef.current = false;
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
          role: (userData.role as any) || 'mother',
          dob: userData.dob,
          allergies: userData.allergies,
          dislikes: userData.dislikes,
          condition: userData.condition,
          foodPreference: userData.food_preference,
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
