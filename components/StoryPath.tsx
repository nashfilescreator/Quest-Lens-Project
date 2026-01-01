
import React, { useState, useEffect, useRef } from 'react';
import { Quest, StoryStep } from '../types';
import { CheckCircle, Lock, MapPin, ChevronRight, Play, ChevronLeft, BookOpen, Flag, Loader } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface StoryPathProps {
  quest: Quest;
  onStartStep: (step: StoryStep) => void;
  onBack: () => void;
}

const StoryPath: React.FC<StoryPathProps> = ({ quest, onStartStep, onBack }) => {
  const [shakingStepId, setShakingStepId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [quest.id]);

  const handleLockedClick = (id: number) => {
      setShakingStepId(id);
      playSound('error');
      setTimeout(() => setShakingStepId(null), 500);
  };

  if (!quest.storyLine || quest.storyLine.length === 0) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <BookOpen size={64} className="text-txt-dim mb-6" strokeWidth={1} />
            <h2 className="text-2xl font-bold text-txt-main mb-2">Loading story details...</h2>
            <p className="text-txt-sub text-sm max-w-xs leading-relaxed mb-8">
                We're preparing your next adventure path.
            </p>
            <button 
                onClick={onBack}
                className="px-8 py-3 bg-surface border border-ln-base text-txt-main rounded-full font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
            >
                Go Back
            </button>
        </div>
    );
  }

  const completedCount = quest.storyLine.filter(s => s.isCompleted).length;
  const totalCount = quest.storyLine.length;

  return (
    <div ref={containerRef} className="animate-in fade-in duration-500 min-h-screen bg-background relative overflow-y-auto scroll-smooth">
      
      <div className="fixed inset-0 z-0">
         <OptimizedImage 
            src={quest.coverImage || ''} 
            alt="Background" 
            className="w-full h-full object-cover opacity-10" 
         />
         <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
      </div>

      <div className="relative z-10 p-4 pb-32">
        <div className="flex items-center gap-4 mb-8 pt-4">
            <button onClick={onBack} className="p-3 bg-surface rounded-full hover:bg-glass transition-colors active:scale-90 border border-ln-base shadow-sm">
                <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={14} className="text-primary" />
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest block">Story Map</span>
                </div>
                <h2 className="text-2xl font-bold text-txt-main leading-none">{quest.title}</h2>
            </div>
        </div>

        <div className="bg-surface border border-ln-base rounded-[2.5rem] p-6 mb-10 shadow-sm">
            <div className="flex justify-between items-end mb-4">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-txt-dim uppercase tracking-widest">Your Progress</p>
                    <span className="text-sm font-bold text-txt-main">{completedCount} of {totalCount} chapters found</span>
                </div>
                <span className="text-xl font-bold text-primary">{Math.round((completedCount/totalCount)*100)}%</span>
            </div>
            <div className="h-2 w-full bg-glass rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${(completedCount/totalCount)*100}%` }}
                ></div>
            </div>
        </div>

        <div className="relative pl-6 pr-2">
            <div className="absolute left-10 top-6 bottom-10 w-0.5 bg-ln-base opacity-50"></div>

            {quest.storyLine.map((step, index) => {
            const isActive = !step.isCompleted && !step.isLocked;
            const isCompleted = step.isCompleted;
            const isShake = shakingStepId === step.id;
            
            return (
                <div 
                key={step.id} 
                className={`relative flex gap-6 mb-10 group ${step.isLocked ? 'opacity-40' : 'opacity-100'} ${isShake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                onClick={() => step.isLocked && handleLockedClick(step.id)}
                >
                <div className={`
                    relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 shadow-md
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isActive ? 'bg-white border-primary text-primary scale-110 shadow-lg' : ''}
                    ${step.isLocked ? 'bg-surface border-ln-base text-txt-dim cursor-not-allowed' : 'bg-surface border-ln-base text-txt-sub'}
                `}>
                    {isCompleted && <CheckCircle size={20} strokeWidth={3} />}
                    {step.isLocked && <Lock size={16} />}
                    {isActive && <Play size={16} fill="currentColor" />}
                    {!isCompleted && !isActive && !step.isLocked && <div className="w-2 h-2 bg-txt-dim rounded-full"></div>}
                </div>

                <div 
                    className={`
                    flex-1 bg-surface border rounded-[2rem] p-6 transition-all duration-300 relative overflow-hidden
                    ${isActive ? 'border-primary shadow-lg scale-[1.02]' : 'border-ln-base'}
                    `}
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-txt-dim">Chapter {index + 1}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isCompleted ? 'text-green-600 border-green-100 bg-green-50' : 'text-primary border-primary/10 bg-primary/5'}`}>
                            +{step.rewardXP} XP
                        </span>
                    </div>
                    
                    <h3 className={`font-bold text-lg mb-2 leading-tight ${isActive ? 'text-txt-main' : 'text-txt-sub'}`}>
                        {step.title}
                    </h3>
                    
                    <p className="text-sm text-txt-sub mb-6 leading-relaxed font-medium">
                        {step.description}
                    </p>

                    {isActive && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onStartStep(step); }}
                            className="w-full py-4 bg-primary text-white font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-lg active:scale-95 transition-all"
                        >
                            Find Objective
                        </button>
                    )}
                    {isCompleted && (
                        <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase tracking-widest">
                            <CheckCircle size={14} strokeWidth={3} /> Found and Logged
                        </div>
                    )}
                </div>
                </div>
            );
            })}
        </div>
        
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `}</style>
      </div>
    </div>
  );
};

export default StoryPath;
