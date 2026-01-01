
import React from 'react';
import { Quest, QuestType } from '../types';
import { ChevronRight, Zap, Coins, User, MapPin, Trophy, Users, Target, Scroll } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface QuestCardProps {
  quest: Quest;
  onJoin: (quest: Quest) => void;
  onEdit?: (quest: Quest) => void;
  isCompleted?: boolean;
  activeRoles?: string[];
  currentUserId?: string;
}

const QuestCard: React.FC<QuestCardProps> = React.memo(({ quest, onJoin, onEdit, currentUserId }) => {
  
  const getTypeConfig = (type: QuestType) => {
    switch (type) {
      case QuestType.STORY:
        return { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Scroll };
      case QuestType.COMPETITIVE:
        return { color: 'text-red-400', bg: 'bg-red-500/20', icon: Trophy };
      case QuestType.TEAM:
        return { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Users };
      case QuestType.BOUNTY:
        return { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Target };
      default:
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: MapPin };
    }
  };

  const theme = getTypeConfig(quest.type);
  const TypeIcon = theme.icon;

  return (
    <div 
      onClick={() => onJoin(quest)}
      className="group relative w-full h-[175px] rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl cursor-pointer bg-surface"
    >
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={quest.coverImage || ''} 
          alt={quest.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 h-full p-5 flex flex-col justify-between">
        
        {/* Top Header - Frameless */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md ${theme.bg}`}>
               <TypeIcon size={10} className={theme.color} />
               <span className={`text-[9px] font-black uppercase tracking-widest ${theme.color}`}>
                 {quest.type}
               </span>
            </div>
          </div>
          
          {quest.location && (
             <div className="flex items-center gap-1 text-white/90 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                <MapPin size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">Nearby</span>
             </div>
          )}
        </div>

        {/* Bottom Info - Frameless */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-black text-white leading-tight mb-1 drop-shadow-lg line-clamp-1">
                {quest.title}
            </h3>
            <div className="flex items-center gap-1.5 text-white/50">
                <User size={10} />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">{quest.creator || 'System'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-primary">
                  <Zap size={12} fill="currentColor" />
                  <span className="text-xs font-black tracking-tight">{quest.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Coins size={12} fill="currentColor" />
                  <span className="text-xs font-black tracking-tight">{quest.coinReward}</span>
                </div>
             </div>

             <button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95 shadow-lg shadow-white/10">
                <ChevronRight size={16} strokeWidth={4} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuestCard;
