export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  email: string;
  phone: string;
  emergencyContact: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  fitnessGoal: ProgramType;
  joinDate: string;
  avatarUrl?: string;
  program?: string;
}

export type ProgramType =
  | 'weight_loss'
  | 'weight_gain'
  | 'fat_loss'
  | 'post_pregnancy'
  | 'pre_wedding'
  | 'lifestyle'
  | 'strength'
  | 'bodybuilding';

export interface StepEntry {
  date: string;
  steps: number;
  goal: number;
}

export interface BodyMeasurement {
  date: string;
  weight: number;
  chest: number;
  waist: number;
  hips: number;
  thighs: number;
  arms: number;
  bodyFat?: number;
}

export interface PREntry {
  id: string;
  exercise: string;
  weight: number; // kg
  reps: number;
  date: string;
  notes?: string;
}

export interface SleepEntry {
  date: string;
  hoursSlept: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  bedtime: string;
  wakeTime: string;
}

export interface NutritionEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // litres
  meals: MealEntry[];
}

export interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  url: string;
  tag: 'front' | 'side' | 'back' | 'other';
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  duration: number; // minutes
  exercises: ExerciseLog[];
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: SetLog[];
}

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}
