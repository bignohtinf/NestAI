// API client for backend requests
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer 
  ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

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

export const adminApi = {
  // Stats
  async getStats() {
    return apiCall<any>('/api/admin/stats');
  },

  // Analytics
  async getUserAnalytics(period = 'month', role?: string) {
    const params = new URLSearchParams({ period });
    if (role) params.append('role', role);
    return apiCall<any>(`/api/admin/analytics/users?${params}`);
  },

  async getChatAnalytics(period = 'month') {
    return apiCall<any>(`/api/admin/analytics/chat?period=${period}`);
  },

  async getHealthAnalytics(period = 'month') {
    return apiCall<any>(`/api/admin/analytics/health?period=${period}`);
  },

  // Users
  async getUsers(options: { 
    limit?: number; 
    offset?: number; 
    role?: string; 
    status?: string; 
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.role) params.append('role', options.role);
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    
    return apiCall<any>(`/api/admin/users?${params}`);
  },

  async getUserDetail(userId: string) {
    return apiCall<any>(`/api/admin/users/${userId}`);
  },

  async getMedicalProfiles(options: {
    limit?: number;
    offset?: number;
    pregnancyStatus?: string;
    trimester?: number;
    search?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    // Always send pregnancyStatus - use 'all' as default to show all records
    params.append('pregnancyStatus', options.pregnancyStatus || 'all');
    if (options.trimester) params.append('trimester', String(options.trimester));
    if (options.search) params.append('search', options.search);

    return apiCall<any>(`/api/admin/users/medical-profiles?${params}`);
  },

  // Stores
  async getStores(options: { limit?: number; offset?: number; search?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.search) params.append('search', options.search);
    return apiCall<any>(`/api/admin/stores?${params}`);
  },

  // AI Hub
  async getAlgorithms() {
    return apiCall<any[]>('/api/admin/ai-hub/algorithms');
  },

  async getAIMonitoring(period = 'month') {
    return apiCall<any>(`/api/admin/ai-hub/monitoring?period=${period}`);
  },

  // System
  async getCMSItems(options: { limit?: number; offset?: number; type?: string; status?: string; search?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.type) params.append('type', options.type);
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    return apiCall<any>(`/api/admin/system/cms?${params}`);
  },

  async getSystemSettings() {
    return apiCall<any>('/api/admin/system/settings');
  },

  async updateSystemSettings(settings: any) {
    return apiCall<any>('/api/admin/system/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async getAuditLogs(options: { limit?: number; offset?: number; action?: string; adminId?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.action) params.append('action', options.action);
    if (options.adminId) params.append('adminId', options.adminId);
    return apiCall<any>(`/api/admin/system/audit-logs?${params}`);
  },

  // Nutrition Database
  async getNutritionDatabase(options: { limit?: number; offset?: number; search?: string; dishType?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.search) params.append('search', options.search);
    if (options.dishType) params.append('dish_type', options.dishType);
    return apiCall<any>(`/api/admin/nutrition-database?${params}`);
  },

  async saveNutritionItem(stt: number | null, data: any) {
    const url = stt ? `/api/admin/nutrition-database/${stt}` : '/api/admin/nutrition-database';
    const method = stt ? 'PUT' : 'POST';
    return apiCall<any>(url, {
      method,
      body: JSON.stringify(data),
    });
  },

  async deleteNutritionItem(stt: number) {
    return apiCall<any>(`/api/admin/nutrition-database/${stt}`, {
      method: 'DELETE',
    });
  },

  // Nutrition Profiles
  async getNutritionProfiles(options: { limit?: number; offset?: number; condition?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.condition) params.append('condition', options.condition);
    return apiCall<any>(`/api/admin/nutrition-profiles?${params}`);
  },

  async saveNutritionProfile(stt: number | null, data: any) {
    const method = stt ? 'PUT' : 'POST';
    const url = stt ? `/api/admin/nutrition-profiles/${stt}` : '/api/admin/nutrition-profiles';
    return apiCall<any>(url, {
      method,
      body: JSON.stringify(data),
    });
  },

  async deleteNutritionProfile(stt: number) {
    return apiCall<any>(`/api/admin/nutrition-profiles/${stt}`, {
      method: 'DELETE',
    });
  },

  // Nutrition Recommendations
  async getNutritionRecommendations(profileStt: number) {
    return apiCall<any>(`/api/admin/nutrition-recommendations/${profileStt}`);
  },

  async saveNutritionRecommendation(data: any) {
    return apiCall<any>('/api/admin/nutrition-recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteNutritionRecommendation(recId: string) {
    return apiCall<any>(`/api/admin/nutrition-recommendations/${recId}`, {
      method: 'DELETE',
    });
  },

  // AI Logs
  async getChatLogs(options: { limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    return apiCall<any>(`/api/admin/ai-logs/chat?${params}`);
  },

  async getChatMessages(chatId: string) {
    return apiCall<{ messages: any[] }>(`/api/admin/ai-logs/chat/${chatId}`);
  },

  async getScanLogs(options: { limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    return apiCall<any>(`/api/admin/ai-logs/scan?${params}`);
  },

  async getRecommendationLogs(options: { limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    return apiCall<any>(`/api/admin/ai-logs/recommendations?${params}`);
  },
};
