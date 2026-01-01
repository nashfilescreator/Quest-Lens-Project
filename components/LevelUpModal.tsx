
import React from 'react';
import { Star, Zap, Share2, X, Award } from 'lucide-react';
import { UserStats } from '../types';

interface LevelUpModalProps {
  newStats: UserStats;
  onClose: () => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ newStats, onClose }) => {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500">
      
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 text-center shadow-2xl overflow-hidden border border-slate-100">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={24} />
        </button>

        <div className="mb-8 relative pt-4">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-primary to-blue-400 rounded-3xl flex items-center justify-center shadow-xl relative z-10 border-4 border-white">
                <span className="text-5xl font-display font-bold text-white leading-none">{newStats.level}</span>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        <h2 className="text-primary font-bold tracking-widest uppercase text-xs mb-2">New Milestone reached!</h2>
        <h1 className="text-3xl font-bold text-slate-900 mb-8 leading-tight">You are now level {newStats.level}</h1>
        
        <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Daily Quest Limit</span>
                <span className="text-primary font-bold flex items-center gap-1.5">
                    <Zap size={16} fill="currentColor" /> Increased
                </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-500 text-sm font-medium">Special Rewards</span>
                <span className="text-orange-500 font-bold flex items-center gap-1.5">
                    <Star size={16} fill="currentColor" /> Unlocked
                </span>
            </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Keep Exploring
          </button>
          
          <button className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 transition-colors">
             <Share2 size={16} /> Share with Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
