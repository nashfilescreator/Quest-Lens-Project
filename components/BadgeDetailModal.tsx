import React, { useState } from 'react';
import { Award, X, Lock, CheckCircle } from 'lucide-react';

interface BadgeDetailModalProps {
   badge: { title: string; description: string; progress: number; target: number; icon: any };
   onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
   const isUnlocked = badge.progress >= badge.target;
   const percentage = Math.min(100, (badge.progress / badge.target) * 100);

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-surface border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl">

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
               <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
               <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 ${isUnlocked ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                  <Award size={48} />
               </div>

               <h2 className="text-xl font-display font-bold text-white mb-1">{badge.title}</h2>
               <p className="text-sm text-gray-400 px-4">{badge.description}</p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-6">
               <div className="flex justify-between text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  <span>Progress</span>
                  <span>{badge.progress} / {badge.target}</span>
               </div>
               <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                     className={`h-full transition-all duration-500 ${isUnlocked ? 'bg-green-500' : 'bg-purple-500'}`}
                     style={{ width: `${percentage}%` }}
                  ></div>
               </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-bold">
               {isUnlocked ? (
                  <span className="text-green-500 flex items-center gap-1"><CheckCircle size={16} /> Unlocked</span>
               ) : (
                  <span className="text-gray-500 flex items-center gap-1"><Lock size={16} /> Locked</span>
               )}
            </div>

         </div>
      </div>
   );
};

export default BadgeDetailModal;