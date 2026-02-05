
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  muscleGroup: string;
}

export interface CardioActivity {
  id: string;
  type: string; // Run, Swim, Cycle, etc.
  duration: number; // minutes
  distance?: number; // km
  intensity: 'Low' | 'Moderate' | 'High';
}

export interface Workout {
  id: string;
  date: string;
  title: string;
  type: 'strength' | 'cardio' | 'mixed';
  exercises?: Exercise[];
  cardio?: CardioActivity[];
  notes?: string;
}

export interface NutritionInfo {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  date?: string; // Added date to meals for calendar tracking
}

export interface AIAnalysis {
  muscleImbalances: string[];
  recommendations: string[];
  progressScore: number;
}

export interface PlannerRoutine {
  day: string;
  exercises: { 
    name: string; 
    sets: string; 
    reps: string; 
    target: string;
    suggestedWeight?: string;
    suggestedReps?: string;
    notes?: string;
  }[];
}

export interface SavedPlan {
  id: string;
  name: string;
  routines: PlannerRoutine[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  height: string;
  weight: string;
  oneRepMax: Record<string, string>;
  eightRepMax: Record<string, string>;
  goal: string;
}
