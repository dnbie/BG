import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  UserProfile, StepEntry, BodyMeasurement, PREntry,
  SleepEntry, NutritionEntry, ProgressPhoto, WorkoutSession
} from '../types';
import {
  defaultProfile, defaultSteps, defaultMeasurements, defaultPRs,
  defaultSleep, defaultNutrition, defaultPhotos, defaultWorkouts
} from '../data/defaults';

interface AppContextValue {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  steps: StepEntry[];
  setSteps: (s: StepEntry[]) => void;
  measurements: BodyMeasurement[];
  setMeasurements: (m: BodyMeasurement[]) => void;
  prs: PREntry[];
  setPRs: (p: PREntry[]) => void;
  sleep: SleepEntry[];
  setSleep: (s: SleepEntry[]) => void;
  nutrition: NutritionEntry[];
  setNutrition: (n: NutritionEntry[]) => void;
  photos: ProgressPhoto[];
  setPhotos: (p: ProgressPhoto[]) => void;
  workouts: WorkoutSession[];
  setWorkouts: (w: WorkoutSession[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [steps, setSteps] = useState<StepEntry[]>(defaultSteps);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(defaultMeasurements);
  const [prs, setPRs] = useState<PREntry[]>(defaultPRs);
  const [sleep, setSleep] = useState<SleepEntry[]>(defaultSleep);
  const [nutrition, setNutrition] = useState<NutritionEntry[]>(defaultNutrition);
  const [photos, setPhotos] = useState<ProgressPhoto[]>(defaultPhotos);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(defaultWorkouts);

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      steps, setSteps,
      measurements, setMeasurements,
      prs, setPRs,
      sleep, setSleep,
      nutrition, setNutrition,
      photos, setPhotos,
      workouts, setWorkouts,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
