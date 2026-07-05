import type { ProgramType } from '../types';

export type ClientStatus = 'active' | 'inactive' | 'paused' | 'new';

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  joinDate: string;
  lastSeen: string; // ISO date
  status: ClientStatus;
  program: ProgramType;
  programLabel: string;
  currentWeight: number;
  startWeight: number;
  targetWeight: number;
  weeklySteps: number;
  avgSleep: number;
  workoutsThisMonth: number;
  bodyFat?: number;
  notes?: string;
  membershipExpiry: string;
  progress: number; // 0-100 overall program progress
}

export const mockClients: ClientRecord[] = [
  {
    id: 'c1', name: 'Sarah Mitchell', email: 'sarah.m@email.com', age: 32, gender: 'female',
    joinDate: '2025-01-10', lastSeen: '2026-06-23', status: 'active',
    program: 'fat_loss', programLabel: 'Fat Loss – 10 Weeks',
    currentWeight: 68, startWeight: 76, targetWeight: 62,
    weeklySteps: 62400, avgSleep: 7.2, workoutsThisMonth: 14,
    bodyFat: 28, membershipExpiry: '2026-09-10', progress: 72,
    notes: 'Making excellent progress. Consistent with nutrition tracking.',
  },
  {
    id: 'c2', name: 'James Okafor', email: 'james.o@email.com', age: 25, gender: 'male',
    joinDate: '2025-03-22', lastSeen: '2026-06-22', status: 'active',
    program: 'bodybuilding', programLabel: 'Bodybuilding – 20 Weeks',
    currentWeight: 84, startWeight: 78, targetWeight: 90,
    weeklySteps: 45200, avgSleep: 6.8, workoutsThisMonth: 18,
    bodyFat: 14, membershipExpiry: '2026-10-22', progress: 55,
  },
  {
    id: 'c3', name: 'Priya Sharma', email: 'priya.s@email.com', age: 28, gender: 'female',
    joinDate: '2026-01-05', lastSeen: '2026-06-24', status: 'active',
    program: 'post_pregnancy', programLabel: 'Post-Pregnancy – 16 Weeks',
    currentWeight: 72, startWeight: 80, targetWeight: 65,
    weeklySteps: 38500, avgSleep: 5.9, workoutsThisMonth: 10,
    bodyFat: 32, membershipExpiry: '2026-07-05', progress: 38,
    notes: 'Sleep quality needs attention – new baby. Adjusting program intensity.',
  },
  {
    id: 'c4', name: 'Daniel Torres', email: 'daniel.t@email.com', age: 35, gender: 'male',
    joinDate: '2024-11-01', lastSeen: '2026-06-18', status: 'inactive',
    program: 'strength', programLabel: 'Strength – 16 Weeks',
    currentWeight: 95, startWeight: 92, targetWeight: 100,
    weeklySteps: 28000, avgSleep: 6.1, workoutsThisMonth: 3,
    bodyFat: 18, membershipExpiry: '2026-08-01', progress: 80,
    notes: 'Travel schedule affecting consistency. Follow up required.',
  },
  {
    id: 'c5', name: 'Emma Williams', email: 'emma.w@email.com', age: 26, gender: 'female',
    joinDate: '2026-05-14', lastSeen: '2026-06-24', status: 'new',
    program: 'pre_wedding', programLabel: 'Pre-Wedding – 12 Weeks',
    currentWeight: 66, startWeight: 66, targetWeight: 59,
    weeklySteps: 52000, avgSleep: 7.8, workoutsThisMonth: 8,
    membershipExpiry: '2026-11-14', progress: 12,
    notes: 'New client – wedding in November. High motivation.',
  },
  {
    id: 'c6', name: 'Marcus Reid', email: 'marcus.r@email.com', age: 42, gender: 'male',
    joinDate: '2025-08-30', lastSeen: '2026-06-10', status: 'paused',
    program: 'lifestyle', programLabel: 'Lifestyle – Ongoing',
    currentWeight: 88, startWeight: 96, targetWeight: 82,
    weeklySteps: 0, avgSleep: 0, workoutsThisMonth: 0,
    bodyFat: 22, membershipExpiry: '2026-12-30', progress: 60,
    notes: 'On medical hold – knee surgery recovery. Resume July 2026.',
  },
  {
    id: 'c7', name: 'Aisha Patel', email: 'aisha.p@email.com', age: 30, gender: 'female',
    joinDate: '2025-09-15', lastSeen: '2026-06-23', status: 'active',
    program: 'weight_loss', programLabel: 'Weight Loss – 12 Weeks',
    currentWeight: 74, startWeight: 82, targetWeight: 68,
    weeklySteps: 71300, avgSleep: 7.5, workoutsThisMonth: 15,
    bodyFat: 30, membershipExpiry: '2026-09-15', progress: 85,
    notes: 'Fantastic consistency. Near target – discuss maintenance plan.',
  },
  {
    id: 'c8', name: 'Chris Lambert', email: 'chris.l@email.com', age: 22, gender: 'male',
    joinDate: '2026-04-01', lastSeen: '2026-06-21', status: 'active',
    program: 'weight_gain', programLabel: 'Weight Gain – 16 Weeks',
    currentWeight: 72, startWeight: 67, targetWeight: 80,
    weeklySteps: 35000, avgSleep: 8.1, workoutsThisMonth: 16,
    bodyFat: 11, membershipExpiry: '2026-10-01', progress: 44,
  },
];
