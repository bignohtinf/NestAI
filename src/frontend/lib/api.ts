// API client for backend requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

export const nutritionApi = {
  async getProfiles() {
    return apiCall<{ profiles: any[] }>('/api/recommendations/profiles');
  },
  
  async getFullDayRecommendations(
    profileStt: number,
    lockedMeals: Record<string, number[]> = {},
    excluded: number[] = [],
    dailyBudgetVnd?: number
  ) {
    return apiCall<{ plans: any[] }>('/api/recommendations/recommend', {
      method: 'POST',
      body: JSON.stringify({
        profile_stt: profileStt,
        locked_meals: lockedMeals,
        excluded: excluded,
        daily_budget_vnd: dailyBudgetVnd || null,
      })
    });
  },

  // ─── Meal Plans ───────────────────────────────────────────────────────

  async saveMealPlan(params: {
    userId: string;
    planDate: string;
    planData: Record<string, any>;
    nutritionSummary?: Record<string, any>;
    estimatedCost?: Record<string, any>;
    target: 'mother' | 'baby';
    profileStt: number;
    dailyBudgetVnd?: number;
  }) {
    return apiCall<{ success: boolean; plan_id: string }>('/api/recommendations/meal-plans', {
      method: 'POST',
      body: JSON.stringify({
        user_id: params.userId,
        plan_date: params.planDate,
        plan_data: params.planData,
        nutrition_summary: params.nutritionSummary,
        estimated_cost: params.estimatedCost,
        target: params.target,
        profile_stt: params.profileStt,
        daily_budget_vnd: params.dailyBudgetVnd || null,
      })
    });
  },

  async getWeeklyMealPlans(userId: string, weekStart: string) {
    return apiCall<{ week_start: string; plans: Record<string, any> }>(
      `/api/recommendations/meal-plans/week?user_id=${userId}&week_start=${weekStart}`
    );
  },

  async deleteMealPlan(planId: string) {
    return apiCall<{ success: boolean }>(`/api/recommendations/meal-plans/${planId}`, {
      method: 'DELETE',
    });
  },

  // ─── Notifications ────────────────────────────────────────────────────

  async getNotifications(userId: string, unreadOnly = false, limit = 20) {
    const params = new URLSearchParams({
      user_id: userId,
      unread_only: String(unreadOnly),
      limit: String(limit),
    });
    return apiCall<{ notifications: any[]; unread_count: number }>(
      `/api/recommendations/notifications?${params}`
    );
  },

  async markNotificationRead(notificationId: string) {
    return apiCall<{ success: boolean }>(
      `/api/recommendations/notifications/${notificationId}/read`,
      { method: 'PATCH' }
    );
  },

  async markAllNotificationsRead(userId: string) {
    return apiCall<{ success: boolean }>(
      `/api/recommendations/notifications/read-all?user_id=${userId}`,
      { method: 'PATCH' }
    );
  },

  // ─── Users & Babies ───────────────────────────────────────────────────

  async getMe(userId: string) {
    return apiCall<any>(`/api/users/me?user_id=${userId}`);
  },

  async getBabies(userId: string) {
    return apiCall<{ babies: any[] }>(`/api/babies?user_id=${userId}`);
  },
};
