
import React, { useState } from 'react';
import { Calendar, Sparkles, Loader2, CheckCircle2, ChevronRight, Save, Trash2, PlayCircle, Info } from 'lucide-react';
import { generatePlan } from '../services/geminiService';
import { PlannerRoutine, SavedPlan, UserProfile } from '../types';

interface WorkoutPlannerProps {
  profile: UserProfile;
  savedPlans: SavedPlan[];
  onSavePlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string) => void;
  onStartWorkout: (routine: PlannerRoutine, planName: string) => void;
}

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ profile, savedPlans, onSavePlan, onDeletePlan, onStartWorkout }) => {
  const [frequency, setFrequency] = useState(4);
  const [loading, setLoading] = useState(false);
  const [tempPlan, setTempPlan] = useState<PlannerRoutine[] | null>(null);
  const [planName, setPlanName] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await generatePlan(profile, frequency);
      setTempPlan(generated);
      setPlanName(`AI ${profile.goal} ${frequency}d`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!tempPlan) return;
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      name: planName || 'Unnamed Plan',
      routines: tempPlan,
      createdAt: new Date().toISOString()
    };
    onSavePlan(newPlan);
    setTempPlan(null);
    setPlanName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">AI Workout Planner</h2>
        <p className="text-slate-400">Personalized programs based on your PRs & Goal: <span className="text-indigo-400 font-bold">{profile.goal}</span></p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Target Goal</label>
            <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white/50 cursor-not-allowed">
              {profile.goal} (Change in 'Me' tab)
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-500">Frequency (Days/Week)</label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map(num => (
                <button 
                  key={num}
                  onClick={() => setFrequency(num)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                    frequency === num ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 shadow-xl shadow-indigo-600/10"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={22} />}
          {loading ? 'AI Calculating Routine...' : 'Build Custom Plan with PR-Weights'}
        </button>
      </div>

      {tempPlan && (
        <div className="bg-slate-900/80 border-2 border-indigo-500/30 p-8 rounded-[2.5rem] space-y-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex-1 w-full">
              <label className="text-[10px] text-slate-500 font-black uppercase mb-1 block">Plan Name</label>
              <input 
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white w-full text-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                placeholder="Enter plan name..."
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto self-end">
              <button onClick={handleSave} className="flex-1 md:flex-none bg-emerald-600 px-6 py-2 rounded-xl font-bold text-white flex items-center gap-2 justify-center hover:bg-emerald-500 transition-colors"><Save size={18}/> Save</button>
              <button onClick={() => setTempPlan(null)} className="flex-1 md:flex-none bg-slate-800 px-6 py-2 rounded-xl font-bold text-slate-400 justify-center">Discard</button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {tempPlan.map((day, i) => (
              <div key={i} className="bg-slate-800/20 rounded-2xl p-6 border border-slate-700/50">
                <h4 className="font-black text-indigo-400 mb-4 uppercase tracking-widest">{day.day}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {day.exercises.map((ex, j) => (
                    <div key={j} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                      <div className="mb-2 md:mb-0">
                        <p className="font-bold text-white">{ex.name}</p>
                        <p className="text-xs text-slate-500">{ex.target}</p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="text-right">
                          <p className="text-sm font-black text-indigo-400">{ex.suggestedWeight}kg</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{ex.sets} sets x {ex.suggestedReps || ex.reps} reps</p>
                        </div>
                        {ex.notes && (
                           <div className="group relative">
                             <Info size={14} className="text-slate-600 cursor-help" />
                             <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-[10px] rounded-lg border border-slate-700 shadow-xl z-50">
                               {ex.notes}
                             </div>
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedPlans.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white px-2">Your Saved Programs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPlans.map(plan => (
              <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col hover:border-indigo-500/40 transition-all group shadow-lg">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-black text-white">{plan.name}</h4>
                    <button onClick={() => onDeletePlan(plan.id)} className="text-slate-600 hover:text-red-500 p-1 transition-colors"><Trash2 size={18}/></button>
                  </div>
                  <div className="space-y-4">
                    {plan.routines.map((day, i) => (
                      <div key={i} className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 group/day hover:border-indigo-500/30 transition-all">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{day.day}</span>
                          <button 
                            onClick={() => onStartWorkout(day, plan.name)}
                            className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <PlayCircle size={14} /> Start session
                          </button>
                        </div>
                        <div className="space-y-2">
                          {day.exercises.slice(0, 3).map((ex, j) => (
                            <div key={j} className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-300 truncate pr-4">{ex.name}</span>
                              <span className="text-indigo-400/80 whitespace-nowrap">{ex.suggestedWeight}kg</span>
                            </div>
                          ))}
                          {day.exercises.length > 3 && <p className="text-[10px] text-slate-600 italic">+{day.exercises.length - 3} more exercises...</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanner;
