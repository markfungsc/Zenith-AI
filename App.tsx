
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BookOpen, 
  Utensils, 
  TrendingUp, 
  Calendar,
  User,
  Dumbbell,
  Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import WorkoutLog from './components/WorkoutLog';
import NutritionTracker from './components/NutritionTracker';
import WorkoutPlanner from './components/WorkoutPlanner';
import AnalysisView from './components/AnalysisView';
import MeProfile from './components/MeProfile';
import CalendarView from './components/CalendarView';
import { Workout, NutritionInfo, UserProfile, SavedPlan, PlannerRoutine } from './types';
import { db } from './services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diary' | 'nutrition' | 'planner' | 'analysis' | 'me' | 'schedule'>('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<NutritionInfo[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [pendingWorkout, setPendingWorkout] = useState<Partial<Workout> | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const initData = async () => {
      const [w, m, p, pl] = await Promise.all([
        db.getWorkouts(),
        db.getMeals(),
        db.getProfile(),
        db.getPlans()
      ]);
      setWorkouts(w);
      setMeals(m);
      setProfile(p);
      setSavedPlans(pl);
      setIsInitialLoad(false);
    };
    initData();
  }, []);

  const saveWorkouts = async (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts);
    await db.saveWorkouts(newWorkouts);
  };

  const saveMeals = async (newMeals: NutritionInfo[]) => {
    setMeals(newMeals);
    await db.saveMeals(newMeals);
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    await db.saveProfile(newProfile);
  };

  const savePlan = async (plan: SavedPlan) => {
    const updated = [...savedPlans, plan];
    setSavedPlans(updated);
    await db.savePlans(updated);
  };

  const deletePlan = async (id: string) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    await db.savePlans(updated);
  };

  const startWorkoutFromRoutine = (routine: PlannerRoutine, planName: string) => {
    const prefilled: Partial<Workout> = {
      title: `${planName} - ${routine.day}`,
      date: new Date().toISOString().split('T')[0],
      type: 'strength',
      exercises: routine.exercises.map(ex => ({
        id: Math.random().toString(36).substr(2, 9),
        name: ex.name,
        sets: parseInt(ex.sets) || 3,
        reps: parseInt(ex.suggestedReps || ex.reps) || 10,
        weight: parseFloat(ex.suggestedWeight || '0') || 0,
        muscleGroup: ex.target
      }))
    };
    setPendingWorkout(prefilled);
    setActiveTab('diary');
  };

  if (isInitialLoad || !profile) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Initializing Database...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard workouts={workouts} meals={meals} profile={profile} />;
      case 'diary': return <WorkoutLog workouts={workouts} profile={profile} onUpdateWorkouts={saveWorkouts} prefill={pendingWorkout} onClearPrefill={() => setPendingWorkout(null)} />;
      case 'schedule': return <CalendarView workouts={workouts} meals={meals} />;
      case 'nutrition': return <NutritionTracker meals={meals} onUpdateMeals={saveMeals} />;
      case 'planner': return <WorkoutPlanner profile={profile} savedPlans={savedPlans} onSavePlan={savePlan} onDeletePlan={deletePlan} onStartWorkout={startWorkoutFromRoutine} />;
      case 'analysis': return <AnalysisView workouts={workouts} profile={profile} />;
      case 'me': return <MeProfile profile={profile} onUpdateProfile={updateProfile} />;
      default: return <Dashboard workouts={workouts} meals={meals} profile={profile} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">Zenith <span className="text-indigo-500 italic">AI</span></h1>
        </div>
        <button onClick={() => setActiveTab('me')} className={`w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 transition-all ${activeTab === 'me' ? 'border-white scale-110' : 'border-transparent'}`} />
      </header>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-3 z-50 md:static md:bg-transparent md:border-t-0 md:p-6 md:flex md:justify-center">
        <div className="flex justify-between items-center w-full max-w-lg md:gap-4 bg-slate-950 md:bg-slate-900/50 p-2 rounded-[2rem] border border-slate-800 shadow-2xl overflow-x-auto no-scrollbar">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<TrendingUp size={18} />} label="Stats" />
          <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Calendar size={18} />} label="Schedule" />
          <NavButton active={activeTab === 'diary'} onClick={() => setActiveTab('diary')} icon={<BookOpen size={18} />} label="Diary" />
          <NavButton active={activeTab === 'nutrition'} onClick={() => setActiveTab('nutrition')} icon={<Utensils size={18} />} label="Food" />
          <NavButton active={activeTab === 'planner'} onClick={() => setActiveTab('planner')} icon={<Dumbbell size={18} />} label="Plans" />
          <NavButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<Activity size={18} />} label="Coaching" />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[64px] py-2 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon}
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
