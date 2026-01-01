
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Check, Camera, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { validateQuestImage } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { UserStats, Quest, StoryStep, ValidationResult } from '../types';
import OptimizedImage from './OptimizedImage';

interface ScannerProps {
  onClose: () => void;
  onQuestSuccess?: (result: ValidationResult, image: string) => void;
  userStats: UserStats;
  activeQuest?: Quest | null;
  activeStoryStep?: StoryStep | null;
}

const Scanner: React.FC<ScannerProps> = ({ onClose, onQuestSuccess, userStats, activeQuest, activeStoryStep }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const objective = activeStoryStep?.imagePrompt || activeQuest?.imagePrompt || "something interesting";

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) { setError("Please allow camera access to find items."); }
    };
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const handleCapture = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      setCapturedImage(dataUrl);
      setIsProcessing(true);
      playSound('click');

      try {
          const res = await validateQuestImage(dataUrl, objective, userStats);
          if (res.success) { 
            playSound('success'); 
            setResult(res); 
          } else { 
            playSound('error'); 
            setError(res.message); 
            setIsProcessing(false); 
          }
      } catch (e) { setError("Could not connect. Please try again."); } finally { setIsProcessing(false); }
    }
  }, [objective, userStats]);

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col font-sans overflow-hidden">
      <div className="absolute inset-0">
        {capturedImage ? (
            <OptimizedImage src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : (
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Clean Focus Frame */}
      {!capturedImage && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[70vw] aspect-square border-[1px] border-white/30 rounded-[2rem]"></div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 p-6 pt-safe flex justify-between items-center z-20">
         <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1 rounded-full">
             AI Vision Active
         </div>
         <button onClick={onClose} className="p-3 bg-black/20 backdrop-blur-md hover:bg-black/40 rounded-full text-white transition-all"><X size={24} /></button>
      </div>

      {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-40">
             <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mb-6"></div>
             <p className="text-white font-bold text-xs tracking-[0.2em] uppercase animate-pulse">Analyzing...</p>
          </div>
      )}

      {result && !isProcessing && !error && (
          <div className="absolute bottom-0 inset-x-0 p-6 z-50 animate-in slide-in-from-bottom duration-500">
             <div className="bg-surface/95 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border-t border-white/10">
                <div className="flex items-center gap-5 mb-6 text-left">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Check size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight">Identified</h3>
                        <p className="text-sm text-txt-dim font-medium leading-relaxed mt-1">{result.message}</p>
                    </div>
                </div>
                <button 
                  onClick={() => onQuestSuccess?.(result, capturedImage!)} 
                  className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-glow active:scale-95 transition-all"
                >
                    Log Discovery <ChevronRight size={16} />
                </button>
             </div>
          </div>
      )}

      {!capturedImage && !error && (
          <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-20 pb-safe px-6 pointer-events-none">
              <div className="mb-8 text-center max-w-xs pointer-events-auto">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Target</p>
                  <p className="text-lg font-bold text-white leading-tight drop-shadow-md">{objective}</p>
              </div>
              <button 
                onClick={handleCapture} 
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center pointer-events-auto bg-white/10 backdrop-blur-sm active:scale-90 transition-all shadow-2xl hover:bg-white/20"
              >
                  <div className="w-16 h-16 bg-white rounded-full"></div>
              </button>
          </div>
      )}
      
      {error && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-10 text-center z-50 backdrop-blur-sm">
             <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 text-rose-500">
                <AlertCircle size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Match</h3>
             <p className="text-txt-dim text-sm mb-10 leading-relaxed max-w-xs">{error}</p>
             <button 
               onClick={() => { setCapturedImage(null); setError(null); }} 
               className="px-8 py-3 bg-white text-black font-bold rounded-full uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all"
             >
                 Try Again
             </button>
          </div>
      )}
    </div>
  );
};

export default Scanner;
