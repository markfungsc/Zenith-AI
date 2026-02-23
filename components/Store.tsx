import React, { useState } from 'react';
import {
  ShoppingBag,
  Star,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Zap,
  X,
  Loader2,
  Sparkles,
  Smartphone,
  QrCode,
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  tagline: string;
  price: number;
  duration: string;
  features: string[];
  color: string;
  rating: number;
}

const PROGRAMS: Program[] = [
  {
    id: 'aesthetic-shred',
    name: '30-Day Aesthetic Shred',
    tagline: 'Rapid fat loss while maintaining peak muscle mass.',
    price: 499,
    duration: '4 Weeks',
    features: [
      'Custom Macro Protocol',
      'Daily Video Guidance',
      'Weak Point Analysis',
      'Access to Elite Group',
    ],
    color: 'from-indigo-600 to-purple-600',
    rating: 4.9,
  },
  {
    id: 'power-blueprint',
    name: 'Strength Blueprint v2',
    tagline: 'Scientific powerlifting protocol for total plateaus.',
    price: 899,
    duration: '12 Weeks',
    features: [
      'RPE-Based Programming',
      'Form Review Feedback',
      'Competition Peaking',
      '1-on-1 Strategy Call',
    ],
    color: 'from-amber-500 to-orange-600',
    rating: 5.0,
  },
  {
    id: 'hybrid-athlete',
    name: 'The Hybrid Pro',
    tagline: 'Elite conditioning meets bodybuilding volume.',
    price: 649,
    duration: '8 Weeks',
    features: [
      'VO2 Max Development',
      'Hypertrophy Cycles',
      'Mobility Maintenance',
      'Nutrition Automation',
    ],
    color: 'from-emerald-500 to-teal-600',
    rating: 4.8,
  },
];

const Store: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'payme' | 'alipay'>('card');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handlePurchase = (program: Program) => {
    setSelectedProgram(program);
    setIsCheckingOut(true);
  };

  const processPayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
    }, 2500);
  };

  const closeCheckout = () => {
    setIsCheckingOut(false);
    setSelectedProgram(null);
    setPaymentStatus('idle');
  };

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            Elite Programs
          </h2>
          <p className="text-slate-400 mt-2 font-medium">
            Transform your physique with world-class protocols.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
          <ShieldCheck className="text-indigo-400" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Secure Global Payments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROGRAMS.map(program => (
          <div
            key={program.id}
            className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-indigo-500/50 transition-all shadow-2xl"
          >
            <div className={`h-2 bg-gradient-to-r ${program.color}`} />
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
                  Pro Program
                </span>
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  <span className="text-sm font-bold text-white">{program.rating}</span>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight mb-2">{program.name}</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">{program.tagline}</p>

              <div className="space-y-3 mb-8">
                {program.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-indigo-500 flex-shrink-0" />
                    <span className="text-xs text-slate-300 font-bold">{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    Investment
                  </p>
                  <p className="text-2xl font-black text-white">HKD ${program.price}</p>
                </div>
                <button
                  onClick={() => handlePurchase(program)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Gateway Modal */}
      {isCheckingOut && selectedProgram && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {paymentStatus === 'success' ? (
              <div className="p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle size={48} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                  Payment Successful
                </h3>
                <p className="text-slate-400 font-medium">
                  Your program <strong>{selectedProgram.name}</strong> is now unlocked in your
                  'Plans' tab.
                </p>
                <button
                  onClick={closeCheckout}
                  className="w-full bg-indigo-600 py-5 rounded-3xl font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <ShoppingBag className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-lg uppercase tracking-tight">
                        Secure Checkout
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        Order ID: #{Math.floor(Math.random() * 900000)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeCheckout}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Summary Bar */}
                  <div className="bg-slate-800/40 p-5 rounded-2xl flex justify-between items-center border border-slate-700/50">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Item</p>
                      <p className="text-sm font-bold text-white">{selectedProgram.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase">Total</p>
                      <p className="text-xl font-black text-indigo-400">
                        HKD ${selectedProgram.price}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                      <CreditCard size={20} />
                      <span className="text-[10px] font-bold uppercase">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('payme')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'payme' ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                      <Smartphone size={20} />
                      <span className="text-[10px] font-bold uppercase">PayMe</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('alipay')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${paymentMethod === 'alipay' ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                    >
                      <QrCode size={20} />
                      <span className="text-[10px] font-bold uppercase">Alipay</span>
                    </button>
                  </div>

                  {/* Forms */}
                  <div className="min-h-[220px]">
                    {paymentMethod === 'card' && (
                      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="•••• •••• •••• ••••"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              Expiry
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              CVC
                            </label>
                            <input
                              type="text"
                              placeholder="•••"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'payme' && (
                      <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20">
                          <Smartphone size={40} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-black text-xl uppercase tracking-tighter">
                            Pay with HSBC PayMe
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            Open PayMe on your phone to authorize.
                          </p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'alipay' && (
                      <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl shadow-blue-500/10">
                          <div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300">
                            <QrCode className="text-slate-400" size={48} />
                            <span className="text-[8px] font-black text-slate-400">
                              SCAN TO PAY
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-black text-xl uppercase tracking-tighter">
                            Alipay / WeChat Pay
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            Scan the QR code with your wallet app.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={processPayment}
                    disabled={paymentStatus === 'processing'}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all"
                  >
                    {paymentStatus === 'processing' ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Validating Transaction...
                      </>
                    ) : (
                      <>
                        <Zap size={20} fill="currentColor" />
                        Authorize Payment
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      End-to-End Encrypted Checkout
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
