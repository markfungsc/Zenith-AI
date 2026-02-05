
import React from 'react';
import { Workout, NutritionInfo, UserProfile } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { Flame, Zap, Trophy, Clock, User } from 'lucide-react';

interface DashboardProps {
  workouts: Workout[];
  meals: NutritionInfo[];
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, meals, profile }) => {
  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalWorkouts = workouts.length;
  const recentWorkouts = [...workouts].reverse().slice(0, 3);

  const macroData = [
    { name: 'Protein', value: meals.reduce((sum, m) => sum + m.protein, 0), color: '#6366f1' },
    { name: 'Carbs', value: meals.reduce((sum, m) => sum + m.carbs, 0), color: '#8b5cf6' },
    { name: 'Fat', value: meals.reduce((sum, m) => sum + m.fat, 0), color: '#ec4899' },
  ];

  const workoutByDay = [
    { day: 'M', count: 1 },
    { day: 'T', count: 0 },
    { day: 'W', count: 2 },
    { day: 'T', count: 1 },
    { day: 'F', count: 3 },
    { day: 'S', count: 0 },
    { day: 'S', count: 1 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-white">Hey, {profile.name}.</h2>
        <p className="text-slate-400">Current goal: <span className="text-indigo-400 font-bold">{profile.goal}</span></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="text-orange-500" />} label="Calories Today" value={Math.round(totalCalories)} />
        <StatCard icon={<Trophy className="text-yellow-500" />} label="Workouts" value={totalWorkouts} />
        <StatCard icon={<User className="text-blue-500" />} label="Weight" value={profile.weight ? `${profile.weight}kg` : '—'} />
        <StatCard icon={<Zap className="text-purple-500" />} label="Streak" value="5d" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
          <h3 className="text-lg font-black mb-8 flex items-center gap-2 uppercase tracking-widest text-slate-300">
            <TrendingUp size={18} className="text-indigo-400" />
            Activity
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
          <h3 className="text-lg font-black mb-8 flex items-center gap-2 uppercase tracking-widest text-slate-300">
            <Utensils size={18} className="text-indigo-400" />
            Macros
          </h3>
          <div className="h-[250px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4 pl-4 min-w-[100px]">
               {macroData.map(m => (
                 <div key={m.name} className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                   <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">{m.name}</p>
                    <p className="text-sm font-black text-white">{Math.round(m.value)}g</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800 flex flex-col gap-1 shadow-sm">
    <div className="mb-3">{icon}</div>
    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">{label}</span>
    <span className="text-2xl font-black text-white">{value}</span>
  </div>
);

import { TrendingUp, Utensils, Dumbbell, ChevronRight } from 'lucide-react';

export default Dashboard;
