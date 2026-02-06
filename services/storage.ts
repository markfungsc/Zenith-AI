
import { Workout, NutritionInfo, UserProfile, SavedPlan } from "../types";
import { supabase, getCurrentUser } from "./supabaseClient";

/**
 * USER-SCOPED DATABASE INTEGRATION:
 * All methods now fetch the current authenticated user first.
 * Tables are expected to have a 'user_id' column for scoping.
 */

export const db = {
  // --- Profile ---
  getProfile: async (): Promise<UserProfile | null> => {
    try {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return {
          name: user.email?.split('@')[0] || 'Athlete',
          height: '',
          weight: '75',
          oneRepMax: {},
          eightRepMax: {},
          goal: 'Build Muscle'
        };
      }
      return data.data as UserProfile;
    } catch (e) {
      console.error("Supabase Profile Fetch Error:", e);
      return null;
    }
  },

  saveProfile: async (profile: UserProfile): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .upsert({ id: user.id, data: profile });
  },

  // --- Workouts ---
  getWorkouts: async (): Promise<Workout[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workouts')
      .select('data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return [];
    return (data || []).map(row => row.data as Workout);
  },

  saveWorkouts: async (workouts: Workout[]): Promise<void> => {
    const user = await getCurrentUser();
    const latestWorkout = workouts[workouts.length - 1];
    if (!user || !latestWorkout) return;

    await supabase
      .from('workouts')
      .upsert({ 
        id: latestWorkout.id, 
        user_id: user.id, 
        data: latestWorkout 
      });
  },

  // --- Meals ---
  getMeals: async (): Promise<NutritionInfo[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('meals')
      .select('data')
      .eq('user_id', user.id);

    if (error) return [];
    return (data || []).map(row => row.data as NutritionInfo);
  },

  saveMeals: async (meals: NutritionInfo[]): Promise<void> => {
    const user = await getCurrentUser();
    const latestMeal = meals[meals.length - 1];
    if (!user || !latestMeal) return;

    await supabase
      .from('meals')
      .insert({ 
        user_id: user.id, 
        data: latestMeal 
      });
  },

  // --- Plans ---
  getPlans: async (): Promise<SavedPlan[]> => {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('plans')
      .select('data')
      .eq('user_id', user.id);

    if (error) return [];
    return (data || []).map(row => row.data as SavedPlan);
  },

  savePlans: async (plans: SavedPlan[]): Promise<void> => {
    const user = await getCurrentUser();
    const latestPlan = plans[plans.length - 1];
    if (!user || !latestPlan) return;

    await supabase
      .from('plans')
      .upsert({ 
        id: latestPlan.id, 
        user_id: user.id, 
        data: latestPlan 
      });
  }
};
