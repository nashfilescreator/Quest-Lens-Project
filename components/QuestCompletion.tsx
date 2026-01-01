
import React from 'react';
import { Quest, ValidationResult, DiscoveryResult, AppRole } from '../types';
import { Check, Zap, X, Share2, Coins, TrendingUp } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface QuestCompletionProps {
  quest: Quest | null;
  discovery?: DiscoveryResult | null;
  validation: ValidationResult;
  capturedImage: string;
  rewards: { xp: number; coins: number; studyXp?: number; influence?: number };
  onShare: (caption: string) => void;
  onClose: () => void;
  activeRoles?: AppRole[];
}

const QuestCompletion: React.FC<QuestCompletionProps> = ({ quest, discovery, validation, capturedImage, rewards, onShare, onClose, activeRoles = [] }) => {
  const isDiscovery = !!discovery && !quest;
  const hasInfluence = (rewards.influence || 0) > 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-400">
      <div className="w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
        
        <div className="relative mb-12">
           <div className="w-64 h-64 rounded-5xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-1">
                <OptimizedImage src={capturedImage} className="w-full h-full object-cover" alt="Captured Find" />
           </div>
           <div className="absolute -bottom-6 -right-4 w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white border-4 border-white dark:border-slate-800 shadow-xl -rotate-6">
              <Check size={32} strokeWidth={3} />
           </div>
        </div>

        <div className="space-y-2 mb-10">
            <h2 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">
                {isDiscovery ? 'Discovery Logged' : 'Quest Complete'}
            </h2>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {discovery?.name || quest?.title || 'Great Find!'}
            </h1>
            <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed">
                {validation.message}
            </p>
        </div>

        <div className="w-full flex justify-around mb-12">
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Points</span>
                <span className="text-2xl font-black text-indigo-600">+{rewards.xp}</span>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 self-center"></div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Coins</span>
                <span className="text-2xl font-black text-amber-500">+{rewards.coins}</span>
            </div>
            {hasInfluence && (
                <>
                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 self-center"></div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Influence</span>
                        <span className="text-2xl font-black text-emerald-500">+{rewards.influence}</span>
                    </div>
                </>
            )}
        </div>

        <div className="w-full space-y-4">
            <button onClick={onClose} className="w-full h-16 bg-indigo-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                Keep Exploring
            </button>
            <button 
                onClick={() => onShare('Found something cool with Quest Lens today!')}
                className="w-full h-14 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
                <Share2 size={16} /> Share with Friends
            </button>
        </div>

        <button onClick={onClose} className="absolute top-0 right-0 p-6 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={28} />
        </button>
      </div>
    </div>
  );
};

export default QuestCompletion;
