import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

console.log('Supabase config:', {
  url: supabaseUrl ? 'loaded' : 'missing',
  anonKey: supabaseAnonKey ? 'loaded' : 'missing',
  serviceKey: supabaseServiceKey ? 'loaded' : 'missing',
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations (server-side only)
export const supabaseService = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper functions for common operations
export const supabaseAdmin = {
  // Auth
  async signUp(email: string, password: string, fullName: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Users
  async createUser(userId: string, email: string, fullName: string, phone?: string, role: string = 'mother') {
    // Use anon key - RLS policy should allow insert
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          full_name: fullName,
          phone,
          role,
        },
      ])
      .select();
    
    if (error) {
      console.error('Insert error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('User created successfully:', data);
    }
    
    return { data, error };
  },

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async createUserProfile(userId: string, fullName: string, phone?: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          full_name: fullName,
          phone,
        },
      ])
      .select();
    return { data, error };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Partnerships
  async createPartnershipRequest(
    fatherId: string,
    motherEmail: string,
    motherPhone?: string
  ) {
    // First, find mother by email or phone
    const { data: motherData, error: motherError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${motherEmail},phone.eq.${motherPhone}`)
      .single();

    if (motherError || !motherData) {
      return { data: null, error: new Error('Không tìm thấy tài khoản mẹ') };
    }

    // Create partnership request
    const { data, error } = await supabase
      .from('partnerships')
      .insert([
        {
          father_id: fatherId,
          mother_id: motherData.id,
          status: 'pending',
          requested_by: fatherId,
        },
      ])
      .select();

    return { data, error };
  },

  async respondToPartnershipRequest(
    partnershipId: string,
    motherId: string,
    action: 'accept' | 'reject'
  ) {
    const { data, error } = await supabase
      .from('partnerships')
      .update({
        status: action === 'accept' ? 'accepted' : 'rejected',
        responded_at: new Date().toISOString(),
        responded_by: motherId,
      })
      .eq('id', partnershipId)
      .select();

    return { data, error };
  },

  async getPendingPartnershipRequests(motherId: string) {
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .eq('mother_id', motherId)
      .eq('status', 'pending');

    return { data, error };
  },

  async getActivePartnership(userId: string) {
    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .or(`father_id.eq.${userId},mother_id.eq.${userId}`)
      .eq('status', 'accepted')
      .single();

    return { data, error };
  },

  // Babies
  async createBaby(
    partnershipId: string,
    name: string,
    dateOfBirth: string,
    gender?: string
  ) {
    const { data, error } = await supabase
      .from('babies')
      .insert([
        {
          partnership_id: partnershipId,
          name,
          date_of_birth: dateOfBirth,
          gender,
        },
      ])
      .select();

    return { data, error };
  },

  async getBabiesByPartnership(partnershipId: string) {
    const { data, error } = await supabase
      .from('babies')
      .select('*')
      .eq('partnership_id', partnershipId);

    return { data, error };
  },

  // Daily Entries
  async createDailyEntry(
    babyId: string,
    recordedBy: string,
    entryDate: string,
    milkScore?: number,
    weight?: number,
    height?: number,
    notes?: string
  ) {
    const { data, error } = await supabase
      .from('daily_entries')
      .insert([
        {
          baby_id: babyId,
          recorded_by: recordedBy,
          entry_date: entryDate,
          milk_score: milkScore,
          weight,
          height,
          notes,
        },
      ])
      .select();

    return { data, error };
  },

  async getDailyEntriesByBaby(babyId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('baby_id', babyId)
      .order('entry_date', { ascending: false })
      .limit(limit);

    return { data, error };
  },
};
