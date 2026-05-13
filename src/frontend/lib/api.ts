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

  async createMealPlanNotification(
    motherId: string,
    planDate: string,
    planData: any,
    target: 'mother' | 'baby'
  ) {
    return apiCall<{ success: boolean; notification_id?: string; skipped?: boolean }>(
      '/api/notifications/meal-plan',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mother_id: motherId, plan_date: planDate, plan_data: planData, target }),
      }
    );
  },

  async createScanFoodNotification(
    motherId: string,
    mealData: {
      meal_name: string;
      total_calories: number;
      total_protein: number;
      total_carbs: number;
      total_fat: number;
      dishes: any[];
      pregnancy_guidance?: string | null;
      meal_context?: string | null;
    }
  ) {
    return apiCall<{ success: boolean; notification_id?: string; skipped?: boolean }>(
      '/api/notifications/scan-food',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mother_id: motherId, meal_data: mealData }),
      }
    );
  },

  // ─── Nutrition Report ──────────────────────────────────────────────────

  async getSummary(userId: string, days = 7) {
    return apiCall<{
      summary: { avg_calories: number; total_protein: number; total_carbs: number; total_fat: number; log_count: number };
      history: { date: string; calories: number }[];
      macro_ratios: { name: string; value: number; color: string }[];
      micro_nutrients: { name: string; value: number; target: number; unit: string; icon: string }[];
      nutrition_score: number;
      ai_insights: { type: string; title: string; message: string }[];
    }>(`/api/nutrition/summary?user_id=${userId}&days=${days}`);
  },

  async getLogs(userId: string, limit = 30) {
    return apiCall<{
      logs: {
        id: string;
        meal_name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        image_url: string | null;
        source: string;
        meal_type: string | null;
        created_at: string;
      }[];
    }>(`/api/nutrition/logs?user_id=${userId}&limit=${limit}`);
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
  // Expose generic apiCall for custom admin endpoints
  apiCall,

  // Consolidated dashboard — single request for all dashboard data
  async getDashboard() {
    return apiCall<{
      stats: any;
      analytics: { users: any; chat: any };
      auditLogs: { logs: any[]; total: number };
      recentPosts: { items: any[]; total: number };
    }>('/api/admin/dashboard');
  },

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
  async getStores(options: { limit?: number; offset?: number; search?: string; status?: string; city?: string } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.search) params.append('search', options.search);
    if (options.status) params.append('status', options.status);
    if (options.city) params.append('city', options.city);
    return apiCall<any>(`/api/admin/stores?${params}`);
  },

  async createStore(data: any) {
    return apiCall<any>('/api/admin/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStore(storeId: string, data: any) {
    return apiCall<any>(`/api/admin/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStore(storeId: string) {
    return apiCall<any>(`/api/admin/stores/${storeId}`, {
      method: 'DELETE',
    });
  },

  async getStoreMappings(options: { storeId?: string; limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    if (options.storeId) params.append('storeId', options.storeId);
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    return apiCall<any>(`/api/admin/stores/mapping?${params}`);
  },

  async addStoreMapping(data: { store_id: string; dish_stt: number; price_at_store?: number; availability?: boolean }) {
    return apiCall<any>('/api/admin/stores/mapping', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteStoreMapping(mappingId: string) {
    return apiCall<any>(`/api/admin/stores/mapping/${mappingId}`, {
      method: 'DELETE',
    });
  },

  // AI Hub
  async getAlgorithms() {
    return apiCall<any[]>('/api/admin/ai-hub/algorithms');
  },

  async getMenuRecommendationAlgo() {
    return apiCall<any>('/api/admin/ai-hub/algorithms/menu-recommendation');
  },

  async updateMenuRecommendationAlgo(updates: { status?: string; configJson?: Record<string, any>; modelVersion?: string }) {
    return apiCall<any>('/api/admin/ai-hub/algorithms/menu-recommendation', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getFoodRecognitionAlgo() {
    return apiCall<any>('/api/admin/ai-hub/algorithms/food-recognition');
  },

  async updateFoodRecognitionAlgo(updates: { status?: string; configJson?: Record<string, any>; modelVersion?: string }) {
    return apiCall<any>('/api/admin/ai-hub/algorithms/food-recognition', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
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
    params.append('limit', String(options.limit || 20));
    params.append('offset', String(options.offset || 0));
    return apiCall<{ logs: any[]; total: number; limit: number; offset: number }>(`/api/admin/ai-logs/chat?${params}`);
  },

  async getChatMessages(chatId: string) {
    return apiCall<{ messages: any[] }>(`/api/admin/ai-logs/chat/${chatId}`);
  },

  async getScanLogs(options: { limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    params.append('limit', String(options.limit || 20));
    params.append('offset', String(options.offset || 0));
    return apiCall<{ logs: any[]; total: number; limit: number; offset: number }>(`/api/admin/ai-logs/scan?${params}`);
  },

  async getRecommendationLogs(options: { limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    params.append('limit', String(options.limit || 20));
    params.append('offset', String(options.offset || 0));
    return apiCall<{ logs: any[]; total: number; limit: number; offset: number }>(`/api/admin/ai-logs/recommendations?${params}`);
  },
};

// ── Public Stores API ────────────────────────────────────────────────────────
export const storesApi = {
  async searchNearby(options: {
    dish?: string;
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (options.dish) params.append('dish', options.dish);
    params.append('lat', String(options.lat));
    params.append('lng', String(options.lng));
    if (options.radius) params.append('radius', String(options.radius));
    if (options.limit) params.append('limit', String(options.limit));
    return apiCall<any>(`/api/stores/nearby?${params}`);
  },

  async getStoreDetail(storeId: string) {
    return apiCall<any>(`/api/stores/${storeId}`);
  },
};

export const blogApi = {
  async getCategories() {
    return apiCall<any[]>('/api/blog/categories');
  },

  async getPosts(options: { 
    limit?: number; 
    offset?: number; 
    category?: string; 
    tag?: string; 
    search?: string 
  } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    if (options.category) params.append('category', options.category);
    if (options.tag) params.append('tag', options.tag);
    if (options.search) params.append('search', options.search);
    
    return apiCall<any>(`/api/blog/posts?${params}`);
  },

  async getPostDetail(slugOrId: string) {
    return apiCall<any>(`/api/blog/posts/${slugOrId}`);
  },

  async getComments(postId: string, options: { limit?: number; offset?: number } = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', String(options.limit));
    if (options.offset) params.append('offset', String(options.offset));
    return apiCall<any>(`/api/blog/posts/${postId}/comments?${params}`);
  },

  async addComment(data: { post_id: string; content: string; parent_id?: string }) {
    return apiCall<any>('/api/blog/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleReaction(data: { post_id: string; reaction_type: string }) {
    return apiCall<any>('/api/blog/reactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
