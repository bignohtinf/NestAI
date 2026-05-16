'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseAdmin } from './supabase';

/**
 * Distinguishes "auth check in progress / failed / done" so guard components
 * (admin layout, protected pages) can decide whether to redirect vs. wait vs.
 * show an error. Using `isLoading` alone is ambiguous: a slow user-record
 * fetch on a valid session would flip `isLoading=false` while `user` is still
 * null, causing protected pages to redirect the user as if they had been
 * logged out.
 */
export type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'error';

// How long we'll wait for the user record fetch before treating it as a
// transient error (keeps the user on the page with a retry option instead of
// kicking them out to the landing page).
// 30s covers Supabase free-tier cold starts which can exceed 12s.
const GET_USER_TIMEOUT_MS = 30_000;
// Hard ceiling: if the auth listener never fires at all (lib stuck refreshing
// token across tabs, network broken at SDK layer), fail open as unauthenticated.
const AUTH_LISTENER_SAFETY_MS = 60_000;

/**
 * Fetches the user record with a single automatic retry if the first attempt
 * times out or fails. The retry fires after a 1 s back-off so we don't
 * hammer a cold-starting DB.
 */
async function getUserWithRetry(userId: string) {
  const makeRace = () =>
    Promise.race([
      supabaseAdmin.getUser(userId),
      new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(
          () => resolve({ data: null, error: new Error('getUser timeout') }),
          GET_USER_TIMEOUT_MS,
        ),
      ),
    ]);

  const first = await makeRace();
  if (!first.error) return first;

  // First attempt timed-out or errored — wait briefly, then retry once.
  console.warn('getUser first attempt failed, retrying in 1 s…', first.error.message);
  await new Promise((r) => setTimeout(r, 1_000));
  return makeRace();
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  /** null = user has not completed role-selection yet */
  role: 'mother' | 'father' | 'admin' | null;
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
  /**
   * Use this for redirect / guard decisions in protected pages instead of
   * combining `!isLoading && !user` (which incorrectly treats transient fetch
   * errors as a logout).
   */
  sessionStatus: SessionStatus;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('checking');
  const mountedRef = useRef(false);

  const fetchBabyInfo = async (userId: string) => {
    try {
      // Hard 15s timeout — prevents the UI from waiting forever on a
      // cold-starting / stuck backend.
      const res = await fetch(`/api/babies/?user_id=${userId}`, {
        signal: AbortSignal.timeout(15_000),
      });
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
      const res = await fetch(`/api/medical-profile/me?user_id=${userId}`, {
        signal: AbortSignal.timeout(15_000),
      });
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
    // Used as a manual refetch (e.g. from the "Thử lại" button on the admin
    // error screen). Keeps sessionStatus in sync so guards behave correctly.
    if (mountedRef.current) {
      setIsLoading(true);
      setSessionStatus('checking');
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (mountedRef.current) {
          setUser(null);
          setSessionStatus('unauthenticated');
          setIsLoading(false);
        }
        return;
      }

      const userResult = await getUserWithRetry(session.user.id);

      if (userResult.error || !userResult.data) {
        console.error('fetchUserData failed:', userResult.error);
        if (mountedRef.current) {
          // Session is valid but the user record fetch failed — keep them
          // logged in conceptually and let the UI surface a retry option.
          setSessionStatus('error');
          setIsLoading(false);
        }
        return;
      }

      const userData = userResult.data;
      if (mountedRef.current) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.full_name || 'User',
          role: (userData.role as UserData['role']) ?? null,
          dob: userData.dob,
          allergies: userData.allergies,
          dislikes: userData.dislikes,
          condition: userData.condition,
          foodPreference: userData.food_preference,
        });
        setSessionStatus('authenticated');

        fetchBabyInfo(userData.id);
        fetchMedicalProfile(userData.id);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      if (mountedRef.current) {
        // We don't know whether the session is valid here. Be conservative
        // and surface an error state rather than logging the user out.
        setSessionStatus('error');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    setSessionStatus('checking');

    // Tracks whether the auth listener has fired at all. If not within
    // AUTH_LISTENER_SAFETY_MS, we assume the SDK is broken and fail open as
    // unauthenticated. If it HAS fired but the user-record fetch is slow,
    // we keep the spinner — we do NOT flip to "unauthenticated" because that
    // would kick the user out of protected pages (e.g. /admin) mid-load.
    const authEventReceivedRef = { current: false };

    const safetyTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      if (!authEventReceivedRef.current) {
        console.warn('Supabase auth listener never fired — treating as unauthenticated');
        setUser(null);
        setSessionStatus('unauthenticated');
        setIsLoading(false);
      }
      // If auth event was received, we're already in the right state via the
      // callback below — nothing to do here.
    }, AUTH_LISTENER_SAFETY_MS);

    // Supabase fires INITIAL_SESSION right after subscribing, so we rely on
    // this single source of truth instead of calling fetchUserData() in
    // parallel (which would duplicate every backend call and worsen cold
    // starts). The public fetchUserData() remains available for manual
    // refetch via the context.
    // Track whether we've completed the initial auth check. Subsequent events
    // (TOKEN_REFRESHED when returning to a tab) should NOT reset the UI to a
    // loading/white state — they enrich in the background instead.
    const initialCheckDoneRef = { current: false };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      authEventReceivedRef.current = true;

      // ─── Optimisation: skip redundant DB fetch on TOKEN_REFRESHED ───────
      // When the user returns to the tab after it was backgrounded, Supabase
      // fires TOKEN_REFRESHED. If we already have a valid user, there's no
      // need to re-fetch from DB (which often times out on cold starts and
      // causes the white-screen bug). We just confirm the session is still
      // valid and keep the existing state.
      const isBackgroundRefresh =
        initialCheckDoneRef.current &&
        (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
        session?.user;

      if (isBackgroundRefresh) {
        // Session is still valid — keep existing user state, don't flash white.
        if (mountedRef.current) {
          setSessionStatus('authenticated');
          setIsLoading(false);
        }
        // Optional: silently refresh user data in background without blocking UI
        if (session?.user?.id) {
          getUserWithRetry(session.user.id).then((result) => {
            if (!mountedRef.current || result.error || !result.data) return;
            const userData = result.data;
            setUser((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                id: userData.id,
                email: userData.email,
                name: userData.full_name || prev.name,
                role: (userData.role as UserData['role']) ?? prev.role,
                dob: userData.dob ?? prev.dob,
                allergies: userData.allergies ?? prev.allergies,
                dislikes: userData.dislikes ?? prev.dislikes,
                condition: userData.condition ?? prev.condition,
                foodPreference: userData.food_preference ?? prev.foodPreference,
              };
            });
          }).catch(() => {
            // Silent fail — user keeps their existing data
          });
        }
        return;
      }

      try {
        if (session?.user) {
          const meta = session.user.user_metadata ?? {};
          const appMeta = session.user.app_metadata ?? {};
          // Role cached in app_metadata by /api/auth/set-role after first onboarding.
          // app_metadata is server-only writable (service role) so it can be trusted.
          const cachedRole = (appMeta.role ?? null) as UserData['role'];

          // ── Phase 1: instant render from session JWT (zero DB latency) ──────
          // Set a partial user immediately so the UI can render without waiting
          // for the DB. Guards use sessionStatus to decide whether to redirect.
          if (mountedRef.current) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              name: (meta.full_name as string) || 'User',
              role: cachedRole,
            });
            if (cachedRole) {
              // Role is known → the app can render right now; DB enrichment
              // (Phase 2) fills in the remaining profile fields in the background.
              setSessionStatus('authenticated');
              setIsLoading(false);
            }
            // If no cachedRole → stay in 'checking' until Phase 2 resolves,
            // so OnboardingGuard can decide whether to redirect to role-selection.
          }

          // ── Phase 2: DB enrichment (background when role cached, blocking otherwise) ──
          const userResult = await getUserWithRetry(session.user.id);

          if (!mountedRef.current) return;

          if (userResult.error) {
            console.error('Failed to load user record:', userResult.error);
            if (!cachedRole) {
              // Role unknown and DB failed → surface error so guards don't redirect blindly.
              setSessionStatus('error');
            }
            // If cachedRole was already set, user is authenticated — DB enrichment
            // failure is non-fatal; they'll just see their name/role only.
          } else if (userResult.data) {
            const userData = userResult.data;
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.full_name || (meta.full_name as string) || 'User',
              // DB is source of truth for role; fall back to JWT cache, then null.
              role: (userData.role as UserData['role']) ?? cachedRole ?? null,
              dob: userData.dob,
              allergies: userData.allergies,
              dislikes: userData.dislikes,
              condition: userData.condition,
              foodPreference: userData.food_preference,
            });
            setSessionStatus('authenticated');
            // Fire-and-forget; these have their own 15s timeouts and must not
            // block the loading state.
            fetchBabyInfo(userData.id);
            fetchMedicalProfile(userData.id);
          } else {
            // No data, no error — defensive branch.
            if (!cachedRole) setSessionStatus('error');
          }

          initialCheckDoneRef.current = true;
        } else {
          // INITIAL_SESSION with no session, SIGNED_OUT, or token expired.
          if (mountedRef.current) {
            setUser(null);
            setSessionStatus('unauthenticated');
          }
          initialCheckDoneRef.current = true;
        }
      } catch (err) {
        console.error('Auth state change handler failed:', err);
        if (mountedRef.current) {
          // If we already had a user and this is just a refresh failure,
          // don't kick them out — keep existing state.
          if (initialCheckDoneRef.current && session?.user) {
            // Silent fail: keep current authenticated state
            console.warn('Background auth refresh failed, keeping existing session');
          } else {
            setSessionStatus(session?.user ? 'error' : 'unauthenticated');
            if (!session?.user) setUser(null);
          }
        }
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(safetyTimer);
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
          role: (userData.role as UserData['role']) ?? null,
          dob: userData.dob,
          allergies: userData.allergies,
          dislikes: userData.dislikes,
          condition: userData.condition,
          foodPreference: userData.food_preference,
        });
        setSessionStatus('authenticated');
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
    setSessionStatus('unauthenticated');

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
        sessionStatus,
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
