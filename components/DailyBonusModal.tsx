
import React, { useState } from 'react';
import { Check, Gift, X, Flame, Coins, Zap, Lock } from 'lucide-react';
import { playSound } from '../services/audioService';

interface DailyBonusModalProps {
  streak: number;
  onClaim: (reward: { type: 'coins' | 'xp'; value: number }) => void;
  onClose: () => void;
}

const DailyBonusModal: React.FC<DailyBonusModalProps> = ({ streak, onClaim, onClose }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  // Cycle streak 1-7 logic
  // e.g. Streak 1 -> Day 1. Streak 7 -> Day 7. Streak 8 -> Day 1.
  const currentDay = ((streak - 1) % 7) + 1;
  
  const REWARDS = [
    { day: 1, value: 50, type: 'coins' as const },
    { day: 2, value: 75, type: 'coins' as const },
    { day: 3, value: 100, type: 'xp' as const },
    { day: 4, value: 100, type: 'coins' as const },
    { day: 5, value: 200, type: 'xp' as const },
    { day: 6, value: 150, type: 'coins' as const },
    { day: 7, value: 500, type: 'coins' as const }, // Jackpot
  ];

  const todayReward = REWARDS.find(r => r.day === currentDay) || REWARDS[0];

  const handleClaim = () => {
    setIsClaiming(true);
    playSound('click');
    setTimeout(() => {
        onClaim({ type: todayReward.type, value: todayReward.value });
        // Auto close after showing claimed state briefly
        setTimeout(onClose, 800);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      
      {/* Container */}
      <div className="relative w-full max-w-sm bg-surface border border-white/10 rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b from-primary/20 to-transparent blur-[60px] pointer-events-none"></div>

        <div className="relative bg-surface backdrop-blur-xl rounded-[2.3rem] p-6 border border-white/5">
            
            {/* Close */}
            <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-10">
                <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8 relative pt-2">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] mb-4 animate-pulse">
                    <Flame size={40} className="text-white fill-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white leading-none mb-2">Daily Login</h2>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                    <span className="text-xs text-orange-400 font-bold uppercase tracking-widest">{streak} Day Streak</span>
                </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-4 gap-2 mb-8">
                {REWARDS.map((reward) => {
                    const isCollected = reward.day < currentDay;
                    const isToday = reward.day === currentDay;
                    const isBigPrize = reward.day === 7;

                    return (
                        <div 
                            key={reward.day}
                            className={`
                                relative rounded-2xl flex flex-col items-center justify-center border transition-all duration-500
                                ${isBigPrize ? 'col-span-2 aspect-[2/1] flex-row gap-3 p-0' : 'col-span-1 aspect-square p-1'}
                                ${isToday 
                                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)] z-10 scale-105 ring-1 ring-primary/50' 
                                    : 'bg-white/[0.03] border-white/5'
                                }
                                ${isCollected ? 'opacity-50 grayscale' : ''}
                            `}
                        >
                            {/* Status Icon Overlay */}
                            {isCollected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl z-20">
                                    <Check size={isBigPrize ? 24 : 16} className="text-green-500" strokeWidth={4} />
                                </div>
                            )}
                            
                            {/* Future Lock */}
                            {reward.day > currentDay && !isBigPrize && (
                                <div className="absolute top-1 right-1">
                                    <Lock size={8} className="text-white/20" />
                                </div>
                            )}

                            {/* Content */}
                            {isBigPrize ? (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                        <Gift size={20} className={isToday ? 'animate-bounce' : ''} />
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Day 7</span>
                                        <span className="text-lg font-display font-bold text-white leading-none">{reward.value}</span>
                                        <span className="text-[8px] font-bold text-yellow-500 uppercase block">{reward.type}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-primary' : 'text-gray-600'}`}>
                                        Day {reward.day}
                                    </span>
                                    
                                    <div className="mb-1">
                                        {reward.type === 'coins' ? (
                                            <Coins size={16} className={isToday ? 'text-yellow-400' : 'text-gray-500'} />
                                        ) : (
                                            <Zap size={16} className={isToday ? 'text-blue-400' : 'text-gray-500'} />
                                        )}
                                    </div>

                                    <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-gray-500'}`}>{reward.value}</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Main Action */}
            <button 
                onClick={handleClaim}
                disabled={isClaiming}
                className={`w-full py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-widest transition-all shadow-lg overflow-hidden relative group ${
                    isClaiming 
                    ? 'bg-green-500 text-white scale-95' 
                    : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
                {isClaiming ? (
                    <div className="flex items-center justify-center gap-2">
                        <Check size={18} strokeWidth={3} /> Claimed
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                        Claim Reward
                    </div>
                )}
                {!isClaiming && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DailyBonusModal;
