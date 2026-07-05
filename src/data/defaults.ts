import type { UserProfile, StepEntry, BodyMeasurement, PREntry, SleepEntry, NutritionEntry, ProgressPhoto, WorkoutSession } from '../types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => fmt(new Date(today.getTime() - n * 86400000));

export const defaultProfile: UserProfile = {
  id: '1',
  name: 'Alex Johnson',
  age: 28,
  gender: 'male',
  height: 178,
  weight: 82,
  email: 'alex@example.com',
  phone: '+1 234 567 8900',
  emergencyContact: 'Sarah Johnson – +1 234 567 8901',
  medicalHistory: 'No known conditions',
  allergies: 'None',
  currentMedications: 'None',
  fitnessGoal: 'bodybuilding',
  joinDate: '2024-01-15',
  program: 'Bodybuilding – 12-week hypertrophy',
};

export const defaultSteps: StepEntry[] = Array.from({ length: 7 }, (_, i) => ({
  date: daysAgo(6 - i),
  steps: Math.floor(6000 + Math.random() * 6000),
  goal: 10000,
}));

export const defaultMeasurements: BodyMeasurement[] = Array.from({ length: 8 }, (_, i) => ({
  date: daysAgo((7 - i) * 7),
  weight: 90 - i * 0.9 + (Math.random() - 0.5) * 0.5,
  chest: 102 - i * 0.3,
  waist: 88 - i * 0.6,
  hips: 98 - i * 0.3,
  thighs: 60 - i * 0.2,
  arms: 36 + i * 0.2,
  bodyFat: 24 - i * 0.4,
}));

export const defaultPRs: PREntry[] = [
  { id: '1', exercise: 'Bench Press', weight: 100, reps: 5, date: daysAgo(2), notes: 'New PR!' },
  { id: '2', exercise: 'Squat', weight: 140, reps: 3, date: daysAgo(5) },
  { id: '3', exercise: 'Deadlift', weight: 180, reps: 1, date: daysAgo(9), notes: 'Belt used' },
  { id: '4', exercise: 'Overhead Press', weight: 70, reps: 5, date: daysAgo(14) },
  { id: '5', exercise: 'Pull-ups', weight: 0, reps: 15, date: daysAgo(3), notes: 'Bodyweight' },
  { id: '6', exercise: 'Romanian Deadlift', weight: 120, reps: 8, date: daysAgo(7) },
];

export const defaultSleep: SleepEntry[] = Array.from({ length: 7 }, (_, i) => ({
  date: daysAgo(6 - i),
  hoursSlept: 5.5 + Math.random() * 3,
  quality: (['poor', 'fair', 'good', 'excellent'] as const)[Math.floor(Math.random() * 4)],
  bedtime: '22:30',
  wakeTime: '06:30',
}));

export const defaultNutrition: NutritionEntry[] = Array.from({ length: 7 }, (_, i) => ({
  date: daysAgo(6 - i),
  calories: 1800 + Math.floor(Math.random() * 600),
  protein: 140 + Math.floor(Math.random() * 40),
  carbs: 200 + Math.floor(Math.random() * 60),
  fat: 60 + Math.floor(Math.random() * 20),
  water: 1.5 + Math.random() * 1.5,
  meals: [],
}));

export const defaultPhotos: ProgressPhoto[] = [];

export const defaultWorkouts: WorkoutSession[] = [
  {
    id: '1',
    date: daysAgo(1),
    name: 'Push Day A',
    duration: 65,
    exercises: [
      { id: '1', name: 'Bench Press', sets: [{ reps: 5, weight: 100, completed: true }, { reps: 5, weight: 100, completed: true }, { reps: 4, weight: 100, completed: true }] },
      { id: '2', name: 'Incline DB Press', sets: [{ reps: 10, weight: 35, completed: true }, { reps: 9, weight: 35, completed: true }] },
    ],
  },
];
