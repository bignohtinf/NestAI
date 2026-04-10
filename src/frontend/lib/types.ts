// User & Auth
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  dietaryPreferences?: string[];
  allergies?: string[];
}

// Meal & Nutrition
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  image?: string;
  ingredients: string[];
  instructions?: string[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  nutrition: NutritionInfo;
  cuisine?: string;
  tags?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

export interface MealPlan {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  meals: {
    [key in 'breakfast' | 'lunch' | 'dinner' | 'snack']?: Meal[];
  };
  totalNutrition?: NutritionInfo;
}

// Food Image Analysis
export interface AnalyzedFood {
  id: string;
  imagePath: string;
  foods: {
    name: string;
    confidence: number;
    servingSize?: string;
    nutrition: NutritionInfo;
  }[];
  totalNutrition: NutritionInfo;
  analyzedAt: Date;
}

// Daily Log
export interface DailyLog {
  id: string;
  userId: string;
  date: Date;
  meals: Meal[];
  totalNutrition: NutritionInfo;
  waterIntake?: number;
  notes?: string;
}

// Nutrition Goals
export interface NutritionGoal {
  userId: string;
  dailyCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  waterIntakeLiters?: number;
}

export interface HealthMetric {
  userId: string;
  date: Date;
  weight?: number;
  bmi?: number;
  bloodPressure?: string;
  notes?: string;
}
