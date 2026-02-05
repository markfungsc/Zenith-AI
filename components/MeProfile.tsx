
import React, { useState } from 'react';
import { User, Weight, Ruler, Save, Award, Target } from 'lucide-react';
import { UserProfile } from '../types';

interface MeProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const MeProfile: React.FC<MeProfileProps> = ({ profile, onUpdateProfile }) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...profile });
  const [activeSection, setActiveSection] = useState<'bio' | 'prs'>('bio');

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    alert('Profile saved successfully!');
  };

  const updatePR = (type: 'oneRepMax' | 'eightRepMax', lift: string, val: string) => {
    setEditedProfile({
      ...editedProfile,
      [type]: { ...editedProfile[type], [lift]: val }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Your Profile</h2>
        <p className="text-slate-400 font-medium">Manage your biometrics and strength milestones.</p>
      </div>

      <div className="flex gap-3 p-1 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
        <button 
          onClick={() => setActiveSection('bio')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${activeSection === 'bio' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Biometrics
        </button>
        <button 
          onClick={() => setActiveSection('prs')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${activeSection === 'prs' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Personal Best
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 shadow-2xl">
        {activeSection === 'bio' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <User size={14} /> Name
              </label>
              <input 
                type="text" 
                value={editedProfile.name}
                onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <Target size={14} /> Goal
              </label>
              <select 
                value={editedProfile.goal}
                onChange={e => setEditedProfile({...editedProfile, goal: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option>Build Muscle</option>
                <option>Fat Loss</option>
                <option>Powerlifting</option>
                <option>Hybrid Athlete</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <Ruler size={14} /> Height (cm)
              </label>
              <input 
                type="number" 
                value={editedProfile.height}
                onChange={e => setEditedProfile({...editedProfile, height: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <Weight size={14} /> Current Weight (kg)
              </label>
              <input 
                type="number" 
                value={editedProfile.weight}
                onChange={e => setEditedProfile({...editedProfile, weight: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
                onClick={handleSave}
                className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
                <Save size={18} /> Save Biometrics
            </button>
          </div>
        )}

        {activeSection === 'prs' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div>
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-white uppercase tracking-widest"><Award size={20} className="text-yellow-500" /> 1 Rep Max Estimates</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Squat', 'Bench', 'Deadlift', 'Overhead Press'].map(lift => (
                  <div key={lift} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">{lift}</label>
                    <input 
                      type="number" 
                      value={editedProfile.oneRepMax[lift] || ''}
                      onChange={e => updatePR('oneRepMax', lift, e.target.value)}
                      className="w-full bg-transparent text-xl font-black text-indigo-400 outline-none"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-white uppercase tracking-widest"><Award size={20} className="text-indigo-400" /> Working Set (8RM)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Squat', 'Bench', 'Deadlift', 'Overhead Press'].map(lift => (
                  <div key={lift} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">{lift}</label>
                    <input 
                      type="number" 
                      value={editedProfile.eightRepMax[lift] || ''}
                      onChange={e => updatePR('eightRepMax', lift, e.target.value)}
                      className="w-full bg-transparent text-xl font-black text-purple-400 outline-none"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button 
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
                <Save size={18} /> Update Strength Records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeProfile;
