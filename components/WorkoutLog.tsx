
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Save, Trash2, Dumbbell, Search, ChevronDown, Check, Sparkles, BrainCircuit, History, Timer, Map, Zap } from 'lucide-react';
import { Workout, Exercise, UserProfile, CardioActivity } from '../types';

interface WorkoutLogProps {
  workouts: Workout[];
  profile: UserProfile;
  onUpdateWorkouts: (workouts: Workout[]) => void;
  prefill?: Partial<Workout> | null;
  onClearPrefill?: () => void;
}

const COMMON_EXERCISES = [
  'Barbell Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Pull Ups', 'Dips', 'Lunges', 'Lat Pulldown', 'Leg Press', 'Incline Press',
  'Bicep Curls', 'Tricep Pushdown', 'Leg Extensions', 'Leg Curls', 'Plank',
  'Face Pulls', 'Cable Flyes', 'Lateral Raises', 'Hammer Curls', 'Romanian Deadlift',
  'Bulgarian Split Squat', 'Chest Fly', 'Front Squat', 'Shrugs', 'Rows'
];

const COMMON_CARDIO = ['Running', 'Swimming', 'Cycling', 'Rowing', 'Walking', 'HIIT', 'Jump Rope', 'Stair Climber'];

const WorkoutLog: React.FC<WorkoutLogProps> = ({ workouts, profile, onUpdateWorkouts, prefill, onClearPrefill }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [logMode, setLogMode] = useState<'strength' | 'cardio'>('strength');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState<'pr' | 'history' | 'default' | null>(null);
  
  const [newWorkout, setNewWorkout] = useState<Partial<Workout>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'strength',
    exercises: [],
    cardio: []
  });

  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({
    name: '', sets: 3, reps: 10, weight: 0, muscleGroup: 'Misc'
  });

  const [currentCardio, setCurrentCardio] = useState<Partial<CardioActivity>>({
    type: 'Running', duration: 30, distance: 5, intensity: 'Moderate'
  });

  useEffect(() => {
    if (prefill) {
      setNewWorkout({
        ...newWorkout,
        ...prefill,
        exercises: prefill.exercises || [],
        cardio: prefill.cardio || []
      });
      setIsAdding(true);
    }
  }, [prefill]);

  const handleSelectExercise = (name: string) => {
    setIsAiSuggesting(true);
    setExerciseSearch(name);
    setShowDropdown(false);
    
    // Suggestion logic (same as before)
    const normalizedName = name.toLowerCase().trim();
    let suggestedWeight = 0;
    let suggestedReps = 10;
    let suggestedSets = 3;
    let source: 'pr' | 'history' | 'default' = 'default';

    const liftKeyMap: Record<string, string> = { 'squat': 'Squat', 'bench': 'Bench', 'deadlift': 'Deadlift', 'overhead press': 'Overhead Press' };
    const matchedKey = Object.keys(liftKeyMap).find(k => normalizedName.includes(k));
    
    if (matchedKey) {
      const prKey = liftKeyMap[matchedKey];
      const oneRM = parseFloat(profile.oneRepMax[prKey] || '0');
      if (oneRM > 0) { suggestedWeight = Math.round((oneRM * 0.7) / 2.5) * 2.5; source = 'pr'; }
    }

    const lastSession = [...workouts].reverse().find(w => w.exercises?.some(e => e.name.toLowerCase() === normalizedName));
    if (lastSession) {
      const lastEx = lastSession.exercises?.find(e => e.name.toLowerCase() === normalizedName);
      if (lastEx) { suggestedWeight = lastEx.weight; suggestedReps = lastEx.reps; suggestedSets = lastEx.sets; source = 'history'; }
    }

    setCurrentExercise({ name, sets: suggestedSets, reps: suggestedReps, weight: suggestedWeight, muscleGroup: 'Misc' });
    setSuggestionSource(source);
    setTimeout(() => setIsAiSuggesting(false), 800);
  };

  const addStrength = () => {
    if (!currentExercise.name) return;
    const ex: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentExercise.name,
      sets: currentExercise.sets!,
      reps: currentExercise.reps!,
      weight: currentExercise.weight!,
      muscleGroup: currentExercise.muscleGroup!
    };
    setNewWorkout(prev => ({ ...prev, type: 'strength', exercises: [...(prev.exercises || []), ex] }));
    setExerciseSearch('');
    setCurrentExercise({ name: '', sets: 3, reps: 10, weight: 0, muscleGroup: 'Misc' });
  };

  const addCardio = () => {
    const act: CardioActivity = {
      id: Math.random().toString(36).substr(2, 9),
      type: currentCardio.type!,
      duration: currentCardio.duration!,
      distance: currentCardio.distance,
      intensity: currentCardio.intensity!
    };
    setNewWorkout(prev => ({ ...prev, type: 'cardio', cardio: [...(prev.cardio || []), act] }));
  };

  const saveWorkout = () => {
    if (!newWorkout.title || (newWorkout.exercises?.length === 0 && newWorkout.cardio?.length === 0)) return;
    const finalType = (newWorkout.exercises?.length && newWorkout.cardio?.length) ? 'mixed' : (newWorkout.exercises?.length ? 'strength' : 'cardio');
    const workout: Workout = {
      id: Date.now().toString(),
      title: newWorkout.title!,
      date: newWorkout.date!,
      type: finalType,
      exercises: newWorkout.exercises,
      cardio: newWorkout.cardio,
      notes: newWorkout.notes
    };
    onUpdateWorkouts([...workouts, workout]);
    setIsAdding(false);
    onClearPrefill?.();
    setNewWorkout({ title: '', date: new Date().toISOString().split('T')[0], exercises: [], cardio: [] });
  };

  const filteredExercises = useMemo(() => COMMON_EXERCISES.filter(ex => 
    ex.toLowerCase().includes(exerciseSearch.toLowerCase())
  ), [exerciseSearch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Fitness Diary</h2>
        <button 
          onClick={() => { setIsAdding(true); onClearPrefill?.(); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={20} /> Log Activity
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
               Log Your Session
            </h3>
            <button onClick={() => { setIsAdding(false); onClearPrefill?.(); }} className="p-2 text-slate-500 hover:text-white transition-colors"><X /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Session Title</label>
              <input 
                type="text" placeholder="Morning Run, Heavy Chest, etc."
                value={newWorkout.title}
                onChange={e => setNewWorkout({...newWorkout, title: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Date</label>
              <input 
                type="date" value={newWorkout.date}
                onChange={e => setNewWorkout({...newWorkout, date: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl mb-8 border border-slate-800">
            <button 
                onClick={() => setLogMode('strength')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${logMode === 'strength' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Strength
            </button>
            <button 
                onClick={() => setLogMode('cardio')}
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${logMode === 'cardio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Cardio / Activity
            </button>
          </div>

          {/* Strength Form Section */}
          {logMode === 'strength' && (
            <div className="space-y-6 mb-8 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
                <div className="relative mb-4">
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-indigo-500">
                    <Search size={18} className="text-slate-500 mr-3" />
                    <input 
                      placeholder="Search strength exercises..."
                      value={exerciseSearch}
                      onChange={e => { setExerciseSearch(e.target.value); setShowDropdown(true); }}
                      onFocus={() => setShowDropdown(true)}
                      className="bg-transparent text-white w-full outline-none"
                    />
                  </div>
                  {showDropdown && exerciseSearch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[60] max-h-48 overflow-y-auto">
                      {filteredExercises.map(ex => (
                        <button key={ex} onClick={() => handleSelectExercise(ex)} className="w-full text-left px-5 py-4 hover:bg-slate-700 text-slate-300 border-b border-slate-700/50">
                          {ex}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Sets</span>
                    <input type="number" value={currentExercise.sets} onChange={e => setCurrentExercise({...currentExercise, sets: parseInt(e.target.value) || 0})} className="w-full bg-transparent font-bold outline-none" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Reps</span>
                    <input type="number" value={currentExercise.reps} onChange={e => setCurrentExercise({...currentExercise, reps: parseInt(e.target.value) || 0})} className="w-full bg-transparent font-bold outline-none" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Weight (kg)</span>
                    <input type="number" value={currentExercise.weight} onChange={e => setCurrentExercise({...currentExercise, weight: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-bold text-indigo-400 outline-none" />
                  </div>
                  <button onClick={addStrength} className="bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold border border-slate-700">Add Exercise</button>
                </div>
            </div>
          )}

          {/* Cardio Form Section */}
          {logMode === 'cardio' && (
            <div className="space-y-6 mb-8 bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Activity Type</label>
                        <select 
                            value={currentCardio.type}
                            onChange={e => setCurrentCardio({...currentCardio, type: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none"
                        >
                            {COMMON_CARDIO.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Intensity</label>
                        <div className="flex gap-2">
                            {['Low', 'Moderate', 'High'].map(int => (
                                <button 
                                    key={int}
                                    onClick={() => setCurrentCardio({...currentCardio, intensity: int as any})}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${currentCardio.intensity === int ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                                >
                                    {int}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 flex items-center gap-3">
                        <Timer size={18} className="text-indigo-400" />
                        <div className="flex-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Duration (min)</span>
                            <input type="number" value={currentCardio.duration} onChange={e => setCurrentCardio({...currentCardio, duration: parseInt(e.target.value) || 0})} className="w-full bg-transparent font-bold outline-none" />
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 flex items-center gap-3">
                        <Map size={18} className="text-emerald-400" />
                        <div className="flex-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">Distance (km)</span>
                            <input type="number" step="0.1" value={currentCardio.distance} onChange={e => setCurrentCardio({...currentCardio, distance: parseFloat(e.target.value) || 0})} className="w-full bg-transparent font-bold outline-none" />
                        </div>
                    </div>
                </div>
                <button onClick={addCardio} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold border border-slate-700">Add to Session</button>
            </div>
          )}

          {/* Current Session Summary */}
          <div className="space-y-4 mb-8">
              {newWorkout.exercises?.map(ex => (
                  <div key={ex.id} className="flex justify-between items-center p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                      <span className="font-bold text-slate-200 flex items-center gap-2"><Dumbbell size={14}/> {ex.name}</span>
                      <span className="text-sm font-black text-indigo-400">{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                  </div>
              ))}
              {newWorkout.cardio?.map(act => (
                  <div key={act.id} className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <span className="font-bold text-slate-200 flex items-center gap-2"><Zap size={14}/> {act.type} ({act.intensity})</span>
                      <span className="text-sm font-black text-emerald-400">{act.duration}min / {act.distance}km</span>
                  </div>
              ))}
          </div>

          <button 
            onClick={saveWorkout}
            disabled={!newWorkout.title || (newWorkout.exercises?.length === 0 && newWorkout.cardio?.length === 0)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/30"
          >
            Complete Session
          </button>
        </div>
      )}

      {/* List logged workouts */}
      <div className="space-y-6">
          {[...workouts].reverse().map(w => (
              <div key={w.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-2xl font-black text-white">{w.title}</h3>
                          <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                              {new Date(w.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                              {w.type === 'cardio' && <span className="ml-2 text-emerald-500">· Cardio Session</span>}
                              {w.type === 'strength' && <span className="ml-2 text-indigo-500">· Strength Session</span>}
                              {w.type === 'mixed' && <span className="ml-2 text-purple-500">· Mixed Session</span>}
                          </p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {w.exercises?.map(ex => (
                          <div key={ex.id} className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 flex justify-between items-center">
                              <span className="font-bold text-slate-300">{ex.name}</span>
                              <span className="text-sm font-black text-indigo-400">{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                          </div>
                      ))}
                      {w.cardio?.map(act => (
                          <div key={act.id} className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 flex justify-between items-center">
                              <span className="font-bold text-slate-300">{act.type} <span className="text-[10px] text-slate-500">({act.intensity})</span></span>
                              <span className="text-sm font-black text-emerald-400">{act.duration}m | {act.distance}km</span>
                          </div>
                      ))}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default WorkoutLog;
