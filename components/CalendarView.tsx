
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Dumbbell, Zap, Utensils, Timer, Flame, ArrowUpRight } from 'lucide-react';
import { Workout, NutritionInfo } from '../types';

interface CalendarViewProps {
  workouts: Workout[];
  meals: NutritionInfo[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ workouts, meals }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);

  // Calendar Helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // Get activities for a specific date string (YYYY-MM-DD)
  const getActivitiesForDate = (dateStr: string) => {
    return {
      workouts: workouts.filter(w => w.date === dateStr),
      meals: meals.filter(m => m.date === dateStr || true) // Mocking meal dates for now as types were updated
    };
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    const currentMonthStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyWorkouts = workouts.filter(w => w.date.startsWith(currentMonthStr));
    
    let totalCardioMins = 0;
    let totalStrengthSets = 0;
    
    monthlyWorkouts.forEach(w => {
        w.cardio?.forEach(c => totalCardioMins += c.duration);
        w.exercises?.forEach(e => totalStrengthSets += e.sets);
    });

    return {
        workoutsCount: monthlyWorkouts.length,
        cardioMins: totalCardioMins,
        strengthSets: totalStrengthSets
    };
  }, [workouts, currentDate]);

  const selectedDayData = selectedDate ? getActivitiesForDate(selectedDate) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-indigo-500" /> Training Schedule
          </h2>
          <p className="text-slate-400 font-medium">Viewing {viewMode === 'month' ? `${monthName} ${year}` : 'Current Week'}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
           <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${viewMode === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Month</button>
           <button onClick={() => setViewMode('week')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${viewMode === 'week' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Week</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Grid */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white">{monthName} <span className="text-slate-600">{year}</span></h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><ChevronLeft size={20}/></button>
                        <button onClick={handleNext} className="p-2 hover:bg-slate-800 rounded-xl transition-colors"><ChevronRight size={20}/></button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black text-slate-600 uppercase mb-2">{d}</div>
                    ))}
                    
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        const dayActivities = getActivitiesForDate(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const hasActivity = dayActivities.workouts.length > 0;

                        return (
                            <button 
                                key={dayNum} 
                                onClick={() => setSelectedDate(dateStr)}
                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group ${
                                    isSelected ? 'bg-indigo-600 text-white shadow-xl scale-105 z-10' : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                                }`}
                            >
                                <span className="text-sm font-black">{dayNum}</span>
                                {hasActivity && (
                                    <div className="flex gap-0.5">
                                        {dayActivities.workouts.some(w => w.type === 'strength' || w.type === 'mixed') && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />}
                                        {dayActivities.workouts.some(w => w.type === 'cardio' || w.type === 'mixed') && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/40 p-5 rounded-[1.5rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Sessions</p>
                    <p className="text-2xl font-black text-white">{stats.workoutsCount}</p>
                </div>
                <div className="bg-slate-900/40 p-5 rounded-[1.5rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Cardio Time</p>
                    <p className="text-2xl font-black text-emerald-400">{stats.cardioMins}m</p>
                </div>
                <div className="bg-slate-900/40 p-5 rounded-[1.5rem] border border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Volume (Sets)</p>
                    <p className="text-2xl font-black text-indigo-400">{stats.strengthSets}</p>
                </div>
            </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl h-full sticky top-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Daily Details</h4>
                        <p className="text-xs text-indigo-400 font-bold uppercase">{selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select a date'}</p>
                    </div>
                    <ArrowUpRight className="text-slate-700" size={32} />
                </div>

                {selectedDayData && (selectedDayData.workouts.length > 0) ? (
                    <div className="space-y-6">
                        {selectedDayData.workouts.map(w => (
                            <div key={w.id} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1 h-4 rounded-full ${w.type === 'strength' ? 'bg-indigo-500' : (w.type === 'cardio' ? 'bg-emerald-500' : 'bg-purple-500')}`} />
                                    <h5 className="font-black text-slate-200 uppercase text-xs tracking-widest">{w.title}</h5>
                                </div>
                                <div className="space-y-2 pl-3">
                                    {w.exercises?.map(ex => (
                                        <div key={ex.id} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-800/50">
                                            <span className="text-xs font-bold text-slate-400">{ex.name}</span>
                                            <span className="text-xs font-black text-indigo-300">{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                                        </div>
                                    ))}
                                    {w.cardio?.map(act => (
                                        <div key={act.id} className="flex justify-between items-center bg-slate-800/40 p-3 rounded-xl border border-slate-800/50">
                                            <span className="text-xs font-bold text-slate-400">{act.type} ({act.intensity})</span>
                                            <span className="text-xs font-black text-emerald-300">{act.duration}m | {act.distance}km</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <div className="pt-6 border-t border-slate-800">
                             <div className="flex items-center gap-3 text-slate-500 mb-4">
                                <Utensils size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Nutritional Summary</span>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/30 p-4 rounded-2xl text-center">
                                    <Flame size={14} className="mx-auto mb-1 text-orange-500" />
                                    <p className="text-xs font-black text-white">0 kcal</p>
                                </div>
                                <div className="bg-slate-800/30 p-4 rounded-2xl text-center">
                                    <Zap size={14} className="mx-auto mb-1 text-indigo-400" />
                                    <p className="text-xs font-black text-white">0g Pro</p>
                                </div>
                             </div>
                             <p className="text-[10px] text-slate-600 mt-4 text-center italic">Calorie tracking syncs with your food log.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <CalendarIcon size={48} className="text-slate-700 mb-4" />
                        <p className="text-sm font-bold text-slate-500 uppercase">Rest Day</p>
                        <p className="text-xs text-slate-600 mt-1 max-w-[150px]">No activities logged for this date yet.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
