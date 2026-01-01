
import React, { useMemo } from 'react';
import { Quest, QuestDifficulty, QuestType, TeamMission } from '../types';
import { ArrowLeft, Play, Trash2, Clock, Target, Shield, Zap, BookOpen, ChevronRight, X, MapPin } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface ActiveQuestsProps {
  allQuests: Quest[];
  activeQuestIds: string[];
  activeTeamMission?: TeamMission;
  onBack: () => void;
  onResume: (quest: Quest) => void;
  onAbandon: (questId: string) => void;
  onAbandonTeamMission?: () => void;
}

const ActiveQuests: React.FC<ActiveQuestsProps> = ({ allQuests, activeQuestIds, activeTeamMission, onBack, onResume, onAbandon, onAbandonTeamMission }) => {
  const activeQuestsList = useMemo(() => {
    return allQuests.filter(q => activeQuestIds.includes(q.id));
  }, [allQuests, activeQuestIds]);

  const getTheme = (type: QuestType) => {
    switch (type) {
      case QuestType.STORY: return { bg: 'bg-creation-50', text: 'text-creation-600', border: 'border-creation-100', icon: 'text-creation-500', accent: 'bg-creation-500' };
      case QuestType.COMPETITIVE: return { bg: 'bg-challenge-50', text: 'text-challenge-600', border: 'border-challenge-100', icon: 'text-challenge-500', accent: 'bg-challenge-500' };
      case QuestType.TEAM: return { bg: 'bg-discovery-50', text: 'text-discovery-600', border: 'border-discovery-100', icon: 'text-discovery-500', accent: 'bg-discovery-500' };
      default: return { bg: 'bg-white', text: 'text-slate-500', border: 'border-slate-100', icon: 'text-slate-400', accent: 'bg-slate-700' };
    }
  };

  const handleResumeTeamMission = () => {
      if (!activeTeamMission) return;
      const teamQuest: Quest = {
          id: activeTeamMission.id,
          title: activeTeamMission.title,
          description: activeTeamMission.description,
          type: QuestType.TEAM,
          difficulty: QuestDifficulty.HARD,
          xpReward: activeTeamMission.rewardXp,
          coinReward: 0,
          imagePrompt: activeTeamMission.targetMaterialName,
          coverImage: activeTeamMission.targetMaterialImage,
          roleTags: ['Explorer'],
          difficultyTier: 3
      };
      onResume(teamQuest);
  };

  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-background pb-20 relative font-sans flex flex-col h-full overflow-hidden text-txt-main">
      
      <div className="shrink-0 sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-ln-base p-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-left">
           <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white active:scale-90">
              <ArrowLeft size={24} />
           </button>
           <div>
             <h2 className="text-xl font-bold text-white leading-none">
               Active Quests
             </h2>
             <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">
               {activeQuestsList.length + (activeTeamMission ? 1 : 0)} active missions
             </p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-hide pb-32">
         
         {activeTeamMission && (
            <div className="bg-white border border-discovery-100 rounded-[2.5rem] overflow-hidden group relative shadow-lg shadow-discovery-500/5">
                <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1 pr-4 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-discovery-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                                    <Shield size={10} fill="currentColor" /> Team Goal
                                </span>
                                <span className="text-[10px] font-bold text-discovery-600 bg-discovery-50 px-2 py-0.5 rounded-lg border border-discovery-100">{activeTeamMission.timeLeft} left</span>
                            </div>
                            <h3 className="font-extrabold text-xl text-slate-900 leading-tight">{activeTeamMission.title}</h3>
                        </div>
                        {activeTeamMission.targetMaterialImage && (
                            <div className="w-16 h-16 rounded-3xl overflow-hidden border border-discovery-100 bg-gray-50 shadow-sm shrink-0">
                                <OptimizedImage src={activeTeamMission.targetMaterialImage} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-6 bg-discovery-50 p-4 rounded-3xl border border-discovery-100">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-discovery-600 mb-2">
                            <span>Shared Progress</span>
                            <span>{Math.round((activeTeamMission.currentAmount / activeTeamMission.targetAmount) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden border border-discovery-100">
                            <div className="h-full bg-discovery-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${(activeTeamMission.currentAmount / activeTeamMission.targetAmount) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                           onClick={() => { playSound('click'); handleResumeTeamMission(); }}
                           className="flex-1 py-4 bg-discovery-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-discovery-500/20 active:scale-[0.98] transition-all"
                        >
                           <Play size={14} fill="currentColor" /> Contribute
                        </button>
                        <button 
                           onClick={() => { playSound('error'); onAbandonTeamMission?.(); }}
                           className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-rose-500 font-bold rounded-2xl flex items-center justify-center hover:bg-rose-50 transition-all border border-slate-100 active:scale-95"
                        >
                           <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
         )}

         {activeQuestsList.length === 0 && !activeTeamMission ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-40">
               <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 text-slate-400 border border-white/5">
                  <Target size={40} />
               </div>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Active Missions</p>
               <p className="text-slate-500 text-[10px] font-medium mt-2 max-w-[180px] text-center leading-relaxed">Accept a discovery mission from your dashboard to get started.</p>
            </div>
         ) : (
            activeQuestsList.map((quest) => {
               const theme = getTheme(quest.type);
               return (
               <div key={quest.id} className={`bg-white border ${theme.border} rounded-[2.5rem] overflow-hidden group shadow-soft transition-all hover:shadow-lg`}>
                  <div className="relative h-32 overflow-hidden">
                     <OptimizedImage 
                        src={quest.coverImage || ''} 
                        className="w-full h-full object-cover opacity-100 transition-transform duration-700 group-hover:scale-105" 
                        alt="Cover"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
                     <div className="absolute top-4 left-4 flex gap-2">
                         <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border backdrop-blur-md shadow-sm bg-white/90 text-slate-800 border-white/50`}>
                            {quest.difficulty}
                         </span>
                     </div>
                  </div>
                  
                  <div className="p-6 pt-2 text-left">
                     <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h3 className="font-extrabold text-xl text-slate-900 leading-tight">{quest.title}</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <span className={`${theme.text} bg-opacity-10 px-2 py-0.5 rounded-md ${theme.bg}`}>{quest.type.replace('_', ' ')}</span>
                                {quest.type === QuestType.STORY && (
                                    <span className="flex items-center gap-1 text-slate-400">
                                        <BookOpen size={10} /> Step {quest.currentStep || 1} / {quest.steps || 3}
                                    </span>
                                )}
                            </div>
                        </div>
                     </div>
                     
                     <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">{quest.description}</p>
                     
                     <div className="flex items-center gap-3">
                        <button 
                           onClick={() => { playSound('click'); onResume(quest); }}
                           className={`flex-1 h-14 ${theme.accent} text-white font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-lg active:scale-[0.98] transition-all`}
                        >
                           <Play size={14} fill="currentColor" /> Continue
                        </button>
                        <button 
                           onClick={() => { playSound('error'); onAbandon(quest.id); }}
                           className="w-14 h-14 bg-slate-50 text-slate-400 font-bold rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 active:scale-95"
                        >
                           <Trash2 size={20} />
                        </button>
                     </div>
                  </div>
               </div>
            )})
         )}
      </div>

    </div>
  );
};

export default ActiveQuests;
