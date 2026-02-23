import React, { useState, useEffect } from 'react';
import { User, Weight, Ruler, Save, Award, Target, Mail, Phone, MessageSquare, Loader2, Check } from 'lucide-react';
import { UserProfile } from '../types';
import {
  getUserIdentities,
  initiatePhoneLinking,
  completePhoneLinking,
  completeEmailLinking,
  formatPhoneNumber,
  validatePhoneNumber,
} from '../services/supabaseClient';

interface MeProfileProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const MeProfile: React.FC<MeProfileProps> = ({ profile, onUpdateProfile }) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...profile });
  const [activeSection, setActiveSection] = useState<'bio' | 'prs' | 'account'>('bio');
  const [identities, setIdentities] = useState<{ email: string | null; phone: string | null } | null>(null);
  const [loadingIdentities, setLoadingIdentities] = useState(false);
  
  // Phone linking state
  const [linkingPhone, setLinkingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  // Email linking state
  const [linkingEmail, setLinkingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    loadIdentities();
  }, [activeSection]);

  const loadIdentities = async () => {
    setLoadingIdentities(true);
    try {
      const userIdentities = await getUserIdentities();
      setIdentities(userIdentities);
    } catch (error) {
      console.error('Failed to load identities:', error);
    } finally {
      setLoadingIdentities(false);
    }
  };

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    alert('Profile saved successfully!');
  };

  const updatePR = (type: 'oneRepMax' | 'eightRepMax', lift: string, val: string) => {
    setEditedProfile({
      ...editedProfile,
      [type]: { ...editedProfile[type], [lift]: val },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">
          Your Profile
        </h2>
        <p className="text-slate-400 font-medium">
          Manage your biometrics and strength milestones.
        </p>
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
        <button
          onClick={() => setActiveSection('account')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${activeSection === 'account' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Account
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
                onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <Target size={14} /> Goal
              </label>
              <select
                value={editedProfile.goal}
                onChange={e => setEditedProfile({ ...editedProfile, goal: e.target.value })}
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
                onChange={e => setEditedProfile({ ...editedProfile, height: e.target.value })}
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
                onChange={e => setEditedProfile({ ...editedProfile, weight: e.target.value })}
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
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-white uppercase tracking-widest">
                <Award size={20} className="text-yellow-500" /> 1 Rep Max Estimates
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Squat', 'Bench', 'Deadlift', 'Overhead Press'].map(lift => (
                  <div
                    key={lift}
                    className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700"
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">
                      {lift}
                    </label>
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
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-white uppercase tracking-widest">
                <Award size={20} className="text-indigo-400" /> Working Set (8RM)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Squat', 'Bench', 'Deadlift', 'Overhead Press'].map(lift => (
                  <div
                    key={lift}
                    className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700"
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">
                      {lift}
                    </label>
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

        {activeSection === 'account' && (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <div>
              <h3 className="text-lg font-black mb-6 flex items-center gap-3 text-white uppercase tracking-widest">
                Linked Accounts
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Link your email and phone number to sign in with either method.
              </p>

              {loadingIdentities ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Email Identity */}
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="text-indigo-400" size={20} />
                        <div>
                          <p className="text-white font-bold text-sm">Email</p>
                          <p className="text-slate-400 text-xs">
                            {identities?.email || 'Not linked'}
                          </p>
                        </div>
                      </div>
                      {identities?.email ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check size={16} />
                          <span className="text-xs font-bold">Linked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLinkingEmail(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Link Email
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone Identity */}
                  <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="text-indigo-400" size={20} />
                        <div>
                          <p className="text-white font-bold text-sm">Phone</p>
                          <p className="text-slate-400 text-xs">
                            {identities?.phone || 'Not linked'}
                          </p>
                        </div>
                      </div>
                      {identities?.phone ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check size={16} />
                          <span className="text-xs font-bold">Linked</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLinkingPhone(true)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Link Phone
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Linking UI */}
              {linkingPhone && (
                <div className="mt-6 p-6 bg-slate-800/60 border border-indigo-500/20 rounded-2xl space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">
                    Link Phone Number
                  </h4>
                  {!otpSent ? (
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        setPhoneError(null);
                        try {
                          const formatted = formatPhoneNumber(phoneInput);
                          if (!validatePhoneNumber(formatted)) {
                            throw new Error('Invalid phone number. Include country code (e.g., +1234567890)');
                          }
                          await initiatePhoneLinking(formatted);
                          setPhoneInput(formatted);
                          setOtpSent(true);
                        } catch (err: any) {
                          setPhoneError(err.message || 'Failed to send verification code');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={e => setPhoneInput(e.target.value)}
                          placeholder="+1234567890"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Include country code (e.g., +1 for US)
                        </p>
                      </div>
                      {phoneError && (
                        <p className="text-red-400 text-xs">{phoneError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Send Code
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLinkingPhone(false);
                            setOtpSent(false);
                            setPhoneInput('');
                            setPhoneError(null);
                          }}
                          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form
                      onSubmit={async e => {
                        e.preventDefault();
                        setPhoneError(null);
                        try {
                          await completePhoneLinking(phoneInput, otpCode);
                          setLinkingPhone(false);
                          setOtpSent(false);
                          setPhoneInput('');
                          setOtpCode('');
                          await loadIdentities();
                          alert('Phone number linked successfully!');
                        } catch (err: any) {
                          setPhoneError(err.message || 'Failed to link phone number');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-center">
                          Enter the 6-digit code sent to {phoneInput}
                        </p>
                      </div>
                      {phoneError && (
                        <p className="text-red-400 text-xs">{phoneError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={otpCode.length !== 6}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          Verify & Link
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('');
                            setPhoneError(null);
                          }}
                          className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Back
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Email Linking UI */}
              {linkingEmail && (
                <div className="mt-6 p-6 bg-slate-800/60 border border-indigo-500/20 rounded-2xl space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-widest">
                    Link Email Address
                  </h4>
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      setEmailError(null);
                      try {
                        await completeEmailLinking(emailInput, emailPassword);
                        setLinkingEmail(false);
                        setEmailInput('');
                        setEmailPassword('');
                        await loadIdentities();
                        alert('Email linked successfully!');
                      } catch (err: any) {
                        setEmailError(err.message || 'Failed to link email');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        value={emailPassword}
                        onChange={e => setEmailPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-400 text-xs">{emailError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={!emailInput || !emailPassword}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        Link Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkingEmail(false);
                          setEmailInput('');
                          setEmailPassword('');
                          setEmailError(null);
                        }}
                        className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeProfile;
