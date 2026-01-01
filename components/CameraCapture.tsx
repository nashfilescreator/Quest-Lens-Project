
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, X, Zap, AlertCircle, ZoomIn, Mic, MicOff, Camera, Sparkles, Target, Scan } from 'lucide-react';
import { validateQuestImage } from '../services/geminiService';
import { LiveService } from '../services/liveService';
import { ValidationResult, UserStats } from '../types';
import { playSound } from '../services/audioService';

interface LiveLabel {
    id: string;
    text: string;
    x: number;
    y: number;
}

interface CameraCaptureProps {
  objective: string;
  onClose: () => void;
  onSuccess: (result: ValidationResult, image: string) => void;
  userStats?: UserStats;
  isDuel?: boolean;
  opponentName?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  objective, onClose, onSuccess, userStats, isDuel, opponentName 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [flashMode, setFlashMode] = useState(false);
  
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveLabels, setLiveLabels] = useState<LiveLabel[]>([]);
  const liveService = useMemo(() => new LiveService(), []);

  useEffect(() => {
    let localStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        const constraints = { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } };
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
          await videoRef.current.play();
        }
      } catch (err) { setError("Camera access failed."); }
    };
    startCamera();
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      liveService.disconnect();
    };
  }, [liveService]);

  const toggleLiveConnection = useCallback(async () => {
    if (isLiveActive) {
      liveService.disconnect();
      setIsLiveActive(false);
      setLiveLabels([]);
    } else {
      playSound('open');
      await liveService.connect(
        () => setIsLiveActive(true),
        () => setIsLiveActive(false),
        (e) => setError("Connection lost."),
        (level) => setAudioLevel(level),
        undefined,
        (labels) => {
            const newLabels = labels.map(text => ({
                id: Math.random().toString(36).substr(2, 9),
                text,
                x: 20 + Math.random() * 60,
                y: 30 + Math.random() * 40
            }));
            setLiveLabels(prev => [...newLabels, ...prev].slice(0, 5));
            setTimeout(() => {
                setLiveLabels(prev => prev.filter(l => !newLabels.some(nl => nl.id === l.id)));
            }, 4000);
        }
      );
    }
  }, [isLiveActive, liveService]);

  useEffect(() => {
    if (!isLiveActive || !!capturedImage) return;
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = 480; 
        canvas.height = 270;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, 480, 270);
        liveService.sendVideoFrame(canvas.toDataURL('image/jpeg', 0.5));
      }
    }, 1200); 
    return () => clearInterval(interval);
  }, [isLiveActive, capturedImage, liveService]);

  const captureImage = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      playSound('click');
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      setIsAnalyzing(true);

      try {
        const result = await validateQuestImage(dataUrl, objective, userStats);
        if (result.success) {
          playSound('success');
          onSuccess(result, dataUrl);
        } else {
          playSound('error');
          setError(result.message);
          setIsAnalyzing(false);
          setTimeout(() => setCapturedImage(null), 2500);
        }
      } catch (e) {
        setError("Connection issue.");
        setIsAnalyzing(false);
        setTimeout(() => setCapturedImage(null), 2500);
      }
    }
  }, [objective, userStats, onSuccess]);

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col font-sans overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transition-transform" style={{ transform: `scale(${zoom})` }} />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Tactical HUD Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Scanline Animation */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,.25)_50%),linear-gradient(90deg,rgba(255,0,0,.06),rgba(0,255,0,.02),rgba(0,0,255,.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
          
          {/* Moving Scanning Bar */}
          {!capturedImage && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/30 shadow-[0_0_15px_#818cf8] animate-[scan_3s_linear_infinite] z-20"></div>
          )}

          {/* HUD Corners */}
          <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-white/20"></div>
          <div className="absolute top-6 right-6 w-10 h-10 border-t-2 border-r-2 border-white/20"></div>
          <div className="absolute bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-white/20"></div>
          <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-white/20"></div>

          {/* Technical Labels */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60">
              <span className="text-[8px] font-black tracking-[0.4em] uppercase text-primary">Targeting_Lens_v2.5</span>
              <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 bg-primary/40 rounded-full"></div>)}
              </div>
          </div>
      </div>
      
      {/* Visual Feedback Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {liveLabels.map(label => (
              <div 
                  key={label.id}
                  className="absolute animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500"
                  style={{ left: `${label.x}%`, top: `${label.y}%` }}
              >
                  <div className="bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                      <Scan size={10} className="text-white" />
                      <span className="text-[10px] font-bold text-white whitespace-nowrap">{label.text}</span>
                  </div>
              </div>
          ))}
      </div>

      {/* Guide Interface */}
      <div className="relative z-20 flex-1 flex flex-col justify-between p-6 pt-safe pb-safe pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="flex flex-col gap-3">
            <button onClick={() => setFlashMode(!flashMode)} className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all ${flashMode ? 'bg-amber-400 border-amber-400 text-white' : 'bg-black/30 border-white/10'}`}><Zap size={20} fill={flashMode ? "currentColor" : "none"} /></button>
            <button onClick={toggleLiveConnection} className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all ${isLiveActive ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-black/30 border-white/10 text-white/50'}`}>{isLiveActive ? <div className="flex gap-0.5">{[1,2,3].map(i=><div key={i} className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}}/>)}</div> : <Mic size={20} />}</button>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/10 flex items-center justify-center"><X size={24} /></button>
        </div>

        <div className="flex flex-col items-center gap-6 mb-12">
            <div className="bg-black/60 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl text-center min-w-[200px]">
               <div className="flex items-center justify-center gap-2 mb-2">
                   <Target size={12} className="text-primary animate-pulse" />
                   <span className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Active Objective</span>
               </div>
               <h2 className="text-lg font-bold text-white uppercase tracking-tight">{objective}</h2>
               <div className="mt-2 h-0.5 w-full bg-white/5 overflow-hidden">
                   <div className="h-full bg-primary animate-[progress_2s_ease-in-out_infinite]"></div>
               </div>
            </div>

            {error && (
                <div className="bg-rose-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-2xl animate-in zoom-in border border-rose-400/30">
                    <AlertCircle size={18} />
                    <span className="font-bold text-[10px] uppercase tracking-widest">{error}</span>
                </div>
            )}
        </div>

        <div className="flex flex-col items-center gap-8 pointer-events-auto">
            <div className="flex items-center gap-8">
                <div className="w-12" />
                <button onClick={captureImage} disabled={isAnalyzing || !!capturedImage} className="relative w-20 h-20 group disabled:opacity-50">
                    <div className="absolute inset-0 rounded-full border-[4px] border-white/50 transition-all duration-300 group-active:scale-110" />
                    <div className={`absolute inset-2 rounded-full bg-white transition-all duration-200 ${isAnalyzing ? 'scale-50 opacity-0' : 'scale-100'}`} />
                    {isAnalyzing && <RefreshCw className="absolute inset-0 m-auto text-white animate-spin" size={32} />}
                </button>
                <div className="flex flex-col items-center gap-2">
                   <ZoomIn size={18} className="text-white/60" />
                   <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="h-24 w-1.5 bg-white/20 rounded-full appearance-none accent-white" style={{ writingMode: 'bt-lr' } as any} />
                </div>
            </div>
        </div>
      </div>

      <style>{`
          @keyframes scan {
              0% { top: 0%; }
              100% { top: 100%; }
          }
          @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
          }
      `}</style>
    </div>
  );
};
