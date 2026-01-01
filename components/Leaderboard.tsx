
import React from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank: number;
  onInspect?: (entry: LeaderboardEntry) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currentUserRank, onInspect }) => {
  // Guard against empty or small lists for the podium
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  if (entries.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
              <Trophy size={48} strokeWidth={1} className="mb-4" />
              <p className="font-bold text-sm uppercase tracking-widest">No data synced</p>
          </div>
      );
  }

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-20">
      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-2 mb-10 mt-4">
        {/* Second Place */}
        {second && (
            <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onInspect?.(second)}
            >
            <div className="w-16 h-16 rounded-full border-2 border-gray-400 p-1 mb-2 bg-surface relative transition-transform group-hover:scale-105">
                <OptimizedImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${second.avatarSeed}`} 
                    className="w-full h-full rounded-full bg-background" 
                    alt="2nd" 
                />
                <div className="absolute -bottom-2 w-6 h-6 rounded-full bg-gray-400 text-black font-bold flex items-center justify-center text-xs shadow-lg">2</div>
            </div>
            <span className="text-xs font-bold text-gray-300 mb-1 group-hover:text-white">{second.username}</span>
            <span className="text-[10px] text-primary font-mono">{second.xp} XP</span>
            <div className="h-24 w-16 bg-gradient-to-t from-gray-800/20 to-transparent rounded-t-lg mt-2 border-t border-gray-400/30"></div>
            </div>
        )}

        {/* First Place */}
        {first && (
            <div 
                className="flex flex-col items-center relative z-10 cursor-pointer group"
                onClick={() => onInspect?.(first)}
            >
            <div className="absolute -top-6 text-yellow-500 animate-bounce">
                <Trophy size={24} fill="currentColor" />
            </div>
            <div className="w-20 h-20 rounded-full border-2 border-yellow-500 p-1 mb-2 bg-surface shadow-[0_0_20px_rgba(234,179,8,0.3)] relative transition-transform group-hover:scale-105">
                <OptimizedImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${first.avatarSeed}`} 
                    className="w-full h-full rounded-full bg-background" 
                    alt="1st" 
                />
                <div className="absolute -bottom-2 w-7 h-7 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center text-sm shadow-lg">1</div>
            </div>
            <span className="text-sm font-bold text-white mb-1 group-hover:text-yellow-400">{first.username}</span>
            <span className="text-xs text-primary font-mono font-bold">{first.xp} XP</span>
            <div className="h-32 w-20 bg-gradient-to-t from-yellow-900/20 to-transparent rounded-t-lg mt-2 border-t border-yellow-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
            </div>
            </div>
        )}

        {/* Third Place */}
        {third && (
            <div 
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onInspect?.(third)}
            >
            <div className="w-16 h-16 rounded-full border-2 border-orange-700 p-1 mb-2 bg-surface relative transition-transform group-hover:scale-105">
                <OptimizedImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${third.avatarSeed}`} 
                    className="w-full h-full rounded-full bg-background" 
                    alt="3rd" 
                />
                <div className="absolute -bottom-2 w-6 h-6 rounded-full bg-orange-700 text-white font-bold flex items-center justify-center text-xs shadow-lg">3</div>
            </div>
            <span className="text-xs font-bold text-gray-300 mb-1 group-hover:text-white">{third.username}</span>
            <span className="text-[10px] text-primary font-mono">{third.xp} XP</span>
            <div className="h-16 w-16 bg-gradient-to-t from-orange-900/20 to-transparent rounded-t-lg mt-2 border-t border-orange-700/30"></div>
            </div>
        )}
      </div>

      {/* Rest of the list */}
      <div className="space-y-0">
        {entries.slice(3).map((entry) => (
          <div 
            key={entry.id}
            onClick={() => onInspect?.(entry)}
            className={`flex items-center p-4 border-b border-white/5 last:border-0 cursor-pointer transition-colors hover:bg-white/5 ${
              entry.rank === currentUserRank 
                ? 'bg-primary/5' 
                : ''
            }`}
          >
            <div className="w-8 font-display font-bold text-gray-500 text-center">{entry.rank}</div>
            
            <div className="w-10 h-10 rounded-full bg-surface border border-white/10 overflow-hidden mx-3">
              <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.avatarSeed}`} alt={entry.username} />
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {entry.username}
                {entry.rank === currentUserRank && <span className="text-[8px] bg-primary text-white px-1.5 rounded uppercase">You</span>}
              </div>
              <div className="text-xs text-gray-400 font-mono">{entry.xp.toLocaleString()} XP</div>
            </div>

            <div className="w-8 flex justify-center">
              {entry.change === 'up' && <ChevronUp size={16} className="text-green-500" />}
              {entry.change === 'down' && <ChevronDown size={16} className="text-red-500" />}
              {entry.change === 'same' && <Minus size={16} className="text-gray-600" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
