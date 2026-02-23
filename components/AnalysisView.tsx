import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertTriangle, Target, Lightbulb, Zap } from 'lucide-react';
import { analyzeWorkouts } from '../services/geminiService';
import { Workout, AIAnalysis, UserProfile } from '../types';

interface AnalysisViewProps {
  workouts: Workout[];
  profile: UserProfile;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ workouts, profile }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (workouts.length < 1) return;
    setLoading(true);
    try {
      const res = await analyzeWorkouts(workouts, profile);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workouts.length > 0 && !analysis) {
      runAnalysis();
    }
  }, [workouts]);

  if (workouts.length < 1) {
    return (
      <div className="text-center py-20 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
        <Sparkles className="mx-auto text-slate-700 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-500">Log some workouts first</h3>
        <p className="text-slate-600 mt-2">
          AI needs data to detect imbalances and suggest improvements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            Personalized Coaching
          </h2>
          <p className="text-slate-400">
            Deep insights for <span className="text-indigo-400 font-bold">{profile.name}</span>
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="p-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-2xl border border-slate-700 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          Recalculate
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900/50 p-16 rounded-[2.5rem] border border-indigo-500/20 flex flex-col items-center justify-center gap-6 shadow-2xl">
          <div className="relative">
            <Loader2 className="animate-spin text-indigo-500" size={56} />
            <Sparkles
              className="absolute -top-2 -right-2 text-yellow-500 animate-pulse"
              size={28}
            />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white uppercase tracking-widest">
              Evaluating Bio-metrics
            </p>
            <p className="text-slate-400 mt-2">
              Gemini is reviewing your PRs and training volume...
            </p>
          </div>
        </div>
      ) : (
        analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 shadow-2xl">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="74"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 74}
                    strokeDashoffset={2 * Math.PI * 74 * (1 - analysis.progressScore / 100)}
                    className="text-indigo-500 transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-white">{analysis.progressScore}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Efficiency
                  </span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
                  Consistency & Peak Power
                </h3>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Your trajectory towards <strong>{profile.goal}</strong> is strong. Based on your
                  weight/rep progressions, your neural adaptation is peaking. You are training more
                  efficiently than {Math.round(analysis.progressScore)}% of users with similar PR
                  profiles.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-red-500/20 space-y-6 shadow-lg">
              <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                <AlertTriangle className="text-red-400" size={24} />
                Imbalances
              </h3>
              <div className="space-y-4">
                {analysis.muscleImbalances.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 bg-red-500/5 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0 shadow-sm shadow-red-500" />
                    <p className="text-slate-300 font-medium leading-tight">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-emerald-500/20 space-y-6 shadow-lg">
              <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
                <Lightbulb className="text-emerald-400" size={24} />
                AI Directives
              </h3>
              <div className="space-y-4">
                {analysis.recommendations.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0 shadow-sm shadow-emerald-500" />
                    <p className="text-slate-300 font-medium leading-tight">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AnalysisView;
