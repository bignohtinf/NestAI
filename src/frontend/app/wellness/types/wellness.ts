// Wellness Types

export interface WellnessProfile {
  id: string;
  user_id: string;
  health_focus: string[];
  last_sleep_hours: number;
  current_mood: number;
  health_concerns?: string;
  reminder_time?: string;
  personalization_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WellnessEntry {
  id: string;
  user_id: string;
  entry_date: string;
  milk_score?: number;
  mood: number;
  sleep_hours: number;
  water_intake_ml: number;
  energy_level: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WellnessChallenge {
  id: string;
  user_id: string;
  challenge_type: string;
  challenge_text: string;
  challenge_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface HealthScore {
  score: number;
  color: 'red' | 'yellow' | 'light-green' | 'green';
  message: string;
  components?: {
    milk_score: number;
    mood: number;
    sleep: number;
    energy: number;
  };
}

export interface WellnessTrend {
  trend_data: WellnessEntry[];
  date_range: {
    from: string;
    to: string;
  };
  metrics: {
    avg_milk_score: number;
    avg_mood: number;
    avg_sleep: number;
  };
}

export interface ChallengesResponse {
  challenges: WellnessChallenge[];
  completed: number;
  total: number;
  date: string;
}

export interface StreakData {
  streak: number;
  last_entry: string | null;
}

export interface PersonalizationAnswers {
  health_focus: string[];
  last_sleep_hours: number;
  current_mood: number;
  health_concerns: string;
  reminder_time: string;
}
