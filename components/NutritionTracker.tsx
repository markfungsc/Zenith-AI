import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Plus, Sparkles, Utensils, AlertCircle } from 'lucide-react';
import { analyzeFoodImage } from '../services/geminiService';
import { NutritionInfo } from '../types';

interface NutritionTrackerProps {
  meals: NutritionInfo[];
  onUpdateMeals: (meals: NutritionInfo[]) => void;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ meals, onUpdateMeals }) => {
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraActive(false);
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.message.includes('Permission dismissed')
      ) {
        setCameraError(
          'Camera access denied. Please enable camera permissions in your browser settings and refresh.'
        );
      } else {
        setCameraError('Could not access camera. Make sure no other app is using it.');
      }
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);

    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    setCameraActive(false);

    try {
      const result = await analyzeFoodImage(base64Image);
      onUpdateMeals([...meals, result]);
    } catch (err) {
      console.error('AI Analysis failed:', err);
      alert('Failed to analyze food. Try again with a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Food Analysis</h2>
        <div className="flex gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black shadow-lg shadow-indigo-600/20"
            >
              <Camera size={20} /> Analyze Meal
            </button>
          ) : (
            <button
              onClick={captureAndAnalyze}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black shadow-lg shadow-emerald-600/20"
            >
              <Sparkles size={20} /> Scan Food
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl flex items-start gap-4 text-red-400">
          <AlertCircle size={24} className="flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold">Camera Issue</p>
            <p className="text-sm opacity-80">{cameraError}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 p-12 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 animate-pulse">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <div className="text-center">
            <p className="font-black text-xl text-white">Gemini AI is scanning...</p>
            <p className="text-sm text-slate-400 font-medium">Identifying macros and portions</p>
          </div>
        </div>
      )}

      {cameraActive && (
        <div className="relative rounded-[2.5rem] overflow-hidden bg-black border-4 border-indigo-500/30 aspect-square md:aspect-video mb-8 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none">
            <div className="w-full h-full border-2 border-indigo-500/50 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white" />
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...meals].reverse().map((meal, i) => (
          <div
            key={i}
            className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 hover:border-slate-700 transition-all group"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                <Utensils className="text-indigo-400" size={20} />
              </div>
              <h3 className="font-black text-white truncate text-lg">{meal.foodName}</h3>
            </div>

            <div className="flex justify-between items-end mb-6">
              <div className="text-4xl font-black text-white">
                {meal.calories}
                <span className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-tighter">
                  kcal
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">P</p>
                <p className="text-sm font-black text-indigo-400">{meal.protein}g</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">C</p>
                <p className="text-sm font-black text-purple-400">{meal.carbs}g</p>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-2xl text-center border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-black uppercase mb-1">F</p>
                <p className="text-sm font-black text-pink-400">{meal.fat}g</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionTracker;
