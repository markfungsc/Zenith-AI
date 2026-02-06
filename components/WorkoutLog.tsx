
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Save, Trash2, Dumbbell, Search, ChevronDown, Check, Sparkles, BrainCircuit, History, Timer, Map, Zap, CheckCircle2 } from 'lucide-react';
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
      const exercisesWithCheckboxes = prefill.exercises?.map(ex => ({
        ...ex,
        completedSets: Array(ex.sets).fill(false)
      })) || [];

      setNewWorkout({
        ...newWorkout,
        ...prefill,
        exercises: exercisesWithCheckboxes,
        cardio: prefill.cardio || []
      });
      setIsAdding(true);
    }
  }, [prefill]);

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises?.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, completedSets: ex.completedSets?.map((c, i) => i === setIndex ? !c : c) }
          : ex
      )
    }));
  };

  const addStrength = () => {
    if (!currentExercise.name) return;
    const sets = currentExercise.sets || 3;
    const ex: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: currentExercise.name,
      sets: sets,
      reps: currentExercise.reps!,
      weight: currentExercise.weight!,
      muscleGroup: currentExercise.muscleGroup!,
      completedSets: Array(sets).fill(false)
    };
    setNewWorkout(prev => ({ ...prev, exercises: [...(prev.exercises || []), ex] }));
    setExerciseSearch('');
    setCurrentExercise({ name: '', sets: 3, reps: 10, weight: 0, muscleGroup: 'Misc' });
  };

  const addCardio = () => {
    const act: CardioActivity = {
      id: Math.random().toString(36).substr(2, 9),
      type: currentCardio.type!,
      duration: currentCardio.duration!,
      distance: currentCardio.distance,
      intensity: currentCardio.intensity!,
      completed: false
    };
    setNewWorkout(prev => ({ ...prev, cardio: [...(prev.cardio || []), act] }));
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

  const totalSets = newWorkout.exercises?.reduce((acc, ex) => acc + (ex.sets || 0), 0) || 0;
  const completedSetsCount = newWorkout.exercises?.reduce((acc, ex) => acc + (ex.completedSets?.filter(c => c).length || 0), 0) || 0;
  const progressPercent = totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Fitness Diary</h2>
        {!isAdding && (
          <button 
            onClick={() => { setIsAdding(true); onClearPrefill?.(); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Plus size={20} /> New Session
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-widest">
               <Sparkles size={20} className="text-indigo-400" /> Active Session
            </h3>
            <button onClick={() => { setIsAdding(false); onClearPrefill?.(); }} className="p-2 text-slate-500 hover:text-white transition-colors"><X /></button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">
               <span>Session Progress</span>
               <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500" 
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Session Title</label>
              <input 
                type="text" placeholder="Morning Routine"
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

          {/* Current Exercises Checklist */}
          <div className="space-y-6 mb-8">
            {newWorkout.exercises?.map((ex) => (
              <div key={ex.id} className="bg-slate-950/50 border border-slate-800 rounded-[2rem] p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                      <Dumbbell size={16} className="text-indigo-400" />
                    </div>
                    <h4 className="font-bold text-slate-200">{ex.name}</h4>
                  </div>
                  <button 
                    onClick={() => setNewWorkout(prev => ({ ...prev, exercises: prev.exercises?.filter(e => e.id !== ex.id) }))}
                    className="text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {ex.completedSets?.map((isDone, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isDone ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/40 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-slate-500 w-4">{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-300">{ex.weight}kg</span>
                          <span className="text-[10px] text-slate-600">x</span>
                          <span className="text-sm font-bold text-slate-300">{ex.reps} reps</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleSet(ex.id, idx)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isDone 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                            : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
                        }`}
                      >
                        <Check size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {newWorkout.cardio?.map((act) => (
              <div key={act.id} className={`bg-slate-950/50 border rounded-[2rem] p-6 flex justify-between items-center transition-all ${act.completed ? 'border-emerald-500/30' : 'border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{act.type}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{act.duration} min | {act.distance} km</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNewWorkout(prev => ({
                    ...prev,
                    cardio: prev.cardio?.map(c => c.id === act.id ? { ...c, completed: !c.completed } : c)
                  }))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    act.completed 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  <Check size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Controls to add more to active session */}
          <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl mb-6 border border-slate-800">
            <button onClick={() => setLogMode('strength')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${logMode === 'strength' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>+ Strength</button>
            <button onClick={() => setLogMode('cardio')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${logMode === 'cardio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>+ Cardio</button>
          </div>

          {logMode === 'strength' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div className="md:col-span-2 relative">
                  <input 
                    placeholder="Search exercise..."
                    value={exerciseSearch}
                    onChange={e => { setExerciseSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white"
                  />
                  {showDropdown && exerciseSearch && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[60] max-h-40 overflow-y-auto">
                      {COMMON_EXERCISES.filter(ex => ex.toLowerCase().includes(exerciseSearch.toLowerCase())).map(ex => (
                        <button key={ex} onClick={() => { setCurrentExercise({...currentExercise, name: ex}); setExerciseSearch(ex); setShowDropdown(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 text-sm border-b border-slate-700/50">{ex}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Sets</span>
                  <input type="number" value={currentExercise.sets} onChange={e => setCurrentExercise({...currentExercise, sets: parseInt(e.target.value) || 0})} className="w-full bg-transparent font-bold outline-none text-sm" />
                </div>
                <button onClick={addStrength} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm">Add</button>
            </div>
          )}

          <button 
            onClick={saveWorkout}
            disabled={!newWorkout.title || (newWorkout.exercises?.length === 0 && newWorkout.cardio?.length === 0)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={24} /> Finish Workout
          </button>
        </div>
      )}

      {/* List logged history */}
      {!isAdding && (
        <div className="space-y-6">
            {[...workouts].reverse().map(w => (
                <div key={w.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-white">{w.title}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                                {new Date(w.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
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
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutLog;
