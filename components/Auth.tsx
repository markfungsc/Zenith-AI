import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  sendOTP,
  verifyOTP,
  linkPhoneToAccount,
  linkEmailToAccount,
  validatePhoneNumber,
  formatPhoneNumber,
  getUserIdentities,
  initiatePhoneLinking,
  completePhoneLinking,
  completeEmailLinking,
} from '../services/supabaseClient';
import { Mail, Lock, Loader2, Activity, ArrowRight, Phone, MessageSquare } from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkMethod, setLinkMethod] = useState<'phone' | 'email' | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formattedPhone = formatPhoneNumber(phone);
      if (!validatePhoneNumber(formattedPhone)) {
        throw new Error('Invalid phone number. Please include country code (e.g., +1234567890)');
      }

      await sendOTP(formattedPhone);
      setOtpSent(true);
      setPhone(formattedPhone);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyOTP(phone, otp);
      // Check if user has other identities and prompt to link
      const identities = await getUserIdentities();
      if (identities) {
        const hasEmail = identities.email && identities.email !== phone;
        if (hasEmail) {
          setShowLinkPrompt(true);
          setLinkMethod('email');
        }
      }
    } catch (err: any) {
      // Check if error suggests account exists with different method
      if (err.message?.includes('already registered')) {
        setError('An account with this phone number already exists. Try signing in with email or link accounts.');
        setShowLinkPrompt(true);
        setLinkMethod('email');
      } else {
        setError(err.message || 'Invalid verification code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPhone = async () => {
    if (!phone || !otp) {
      setError('Please complete the phone verification process first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await completePhoneLinking(phone, otp);
      setShowLinkPrompt(false);
      setOtpSent(false);
      setOtp('');
      setPhone('');
      alert('Phone number linked successfully! You can now sign in with either email or phone.');
    } catch (err: any) {
      setError(err.message || 'Failed to link phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkEmail = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await completeEmailLinking(email, password);
      setShowLinkPrompt(false);
      setEmail('');
      setPassword('');
      alert('Email linked successfully! You can now sign in with either email or phone.');
    } catch (err: any) {
      if (err.message?.includes('already associated')) {
        setError('This email is already linked to another account.');
      } else {
        setError(err.message || 'Failed to link email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert('Check your email for the confirmation link!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        // Check if user wants to link phone
        const identities = await getUserIdentities();
        if (identities && !identities.phone) {
          setShowLinkPrompt(true);
          setLinkMethod('phone');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendOTP(phone);
      setOtp('');
      alert('Verification code resent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40 transform -rotate-6">
            <Activity className="text-white w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
              Zenith <span className="text-indigo-500 italic">AI</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
              The Future of Human Performance
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
          {/* Auth Method Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setOtpSent(false);
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                authMethod === 'email'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Mail size={14} className="inline mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setOtpSent(false);
                setError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                authMethod === 'phone'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Phone size={14} className="inline mr-2" />
              Phone
            </button>
          </div>

          {authMethod === 'email' ? (
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                      size={18}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isSignUp ? (
                  'Initialize Account'
                ) : (
                  'Authenticate'
                )}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          ) : (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                          size={18}
                        />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+1234567890"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 ml-4">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        Send Verification Code
                        <MessageSquare size={18} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                        Verification Code
                      </label>
                      <div className="relative">
                        <MessageSquare
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                          size={18}
                        />
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 ml-4 text-center">
                        Enter the 6-digit code sent to {phone}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          Verify Code
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="w-full text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      Resend Code
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setError(null);
                      }}
                      className="w-full text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Account Linking Prompt */}
          {showLinkPrompt && linkMethod === 'phone' && (
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-indigo-400 text-center">
                Link your phone number for easier access?
              </p>
              <p className="text-[10px] text-slate-500 text-center">
                You can link your phone number later from your profile settings.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAuthMethod('phone');
                    setOtpSent(false);
                    setShowLinkPrompt(false);
                    setError(null);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Link Now
                </button>
                <button
                  onClick={() => setShowLinkPrompt(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {showLinkPrompt && linkMethod === 'email' && (
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-indigo-400 text-center">
                Link your email for password recovery?
              </p>
              <p className="text-[10px] text-slate-500 text-center">
                You can link your email later from your profile settings.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && linkMethod === 'email' && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleLinkEmail}
                  disabled={!email || !password || loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {loading ? 'Linking...' : 'Link Email'}
                </button>
                <button
                  onClick={() => {
                    setShowLinkPrompt(false);
                    setError(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
            >
              {isSignUp ? 'Already have an account? Login' : 'New to Zenith? Sign Up'}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest px-8">
          By continuing, you agree to Zenith's Terms of Service and Privacy Protocol.
        </p>
      </div>
    </div>
  );
};

export default Auth;
