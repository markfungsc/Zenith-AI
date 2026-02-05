
import { Workout, NutritionInfo, UserProfile, SavedPlan } from "../types";

/**
 * DATABASE INTEGRATION GUIDE:
 * To use a real database (like Supabase or a custom REST API):
 * 1. Install the client (e.g., `npm install @supabase/supabase-js`)
 * 2. Initialize it: const supabase = createClient(URL, KEY)
 * 3. Replace the 'localStorage' calls below with 'await supabase.from(...)...'
 */

const API_ENABLED = false; // Set to true when your backend is ready
const BASE_URL = 'https://your-api-endpoint.com/api';

const KEYS = {
  WORKOUTS: 'zenith_workouts',
  MEALS: 'zenith_meals',
  PROFILE: 'zenith_profile',
  PLANS: 'zenith_plans'
};

export const db = {
  // --- Profile ---
  getProfile: async (): Promise<UserProfile> => {
    if (API_ENABLED) {
      const res = await fetch(`${BASE_URL}/profile`);
      return res.json();
    }
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : {
      name: 'Athlete',
      height: '',
      weight: '75',
      oneRepMax: {},
      eightRepMax: {},
      goal: 'Build Muscle'
    };
  },
  saveProfile: async (profile: UserProfile): Promise<void> => {
    if (API_ENABLED) {
      await fetch(`${BASE_URL}/profile`, {
        method: 'POST',
        body: JSON.stringify(profile)
      });
      return;
    }
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  // --- Workouts ---
  getWorkouts: async (): Promise<Workout[]> => {
    if (API_ENABLED) {
      const res = await fetch(`${BASE_URL}/workouts`);
      return res.json();
    }
    const data = localStorage.getItem(KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  },
  saveWorkouts: async (workouts: Workout[]): Promise<void> => {
    if (API_ENABLED) {
      // Typically you'd send just the new/updated workout, 
      // but for this architecture we sync the full array.
      await fetch(`${BASE_URL}/workouts/sync`, {
        method: 'POST',
        body: JSON.stringify({ workouts })
      });
      return;
    }
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  // --- Meals ---
  getMeals: async (): Promise<NutritionInfo[]> => {
    if (API_ENABLED) {
      const res = await fetch(`${BASE_URL}/meals`);
      return res.json();
    }
    const data = localStorage.getItem(KEYS.MEALS);
    return data ? JSON.parse(data) : [];
  },
  saveMeals: async (meals: NutritionInfo[]): Promise<void> => {
    if (API_ENABLED) {
      await fetch(`${BASE_URL}/meals/sync`, {
        method: 'POST',
        body: JSON.stringify({ meals })
      });
      return;
    }
    localStorage.setItem(KEYS.MEALS, JSON.stringify(meals));
  },

  // --- Plans ---
  getPlans: async (): Promise<SavedPlan[]> => {
    if (API_ENABLED) {
      const res = await fetch(`${BASE_URL}/plans`);
      return res.json();
    }
    const data = localStorage.getItem(KEYS.PLANS);
    return data ? JSON.parse(data) : [];
  },
  savePlans: async (plans: SavedPlan[]): Promise<void> => {
    if (API_ENABLED) {
      await fetch(`${BASE_URL}/plans/sync`, {
        method: 'POST',
        body: JSON.stringify({ plans })
      });
      return;
    }
    localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
  }
};
