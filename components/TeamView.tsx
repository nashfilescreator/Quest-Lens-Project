
import React, { useState, useRef } from 'react';
import { Team, Material, Quest, TeamMission, QuestType } from '../types';
import { Users, Plus, Crown, MessageSquare, UserPlus, X, ChevronLeft, Target, Copy, Shield, Camera, MoreHorizontal, UserMinus } from 'lucide-react';
import { playSound } from '../services/audioService';
import { MATERIALS } from '../constants';
import OptimizedImage from './OptimizedImage';

interface TeamViewProps {
  teamData: Team;
  currentUsername: string;
  onBack: () => void;
  userMaterials: Material[];
  onContribute: (mission: TeamMission) => void;
  onOpenTeamChat: () => void;
  allQuests: Quest[];
  onUpdateMission: (mission: TeamMission) => void;
  onCancelMission?: () => void;
  onKickMember?: (memberId: string) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ 
    teamData, 
    currentUsername, 
    onBack, 
    onContribute, 
    onOpenTeamChat, 
    allQuests, 
    onUpdateMission, 
    onKickMember
}) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'members'>('goals');
  const [showInvite, setShowInvite] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isLeader = teamData.members?.find(m => m.name === currentUsername)?.role === 'leader'; 
  const activeGoal = teamData.activeMission;
  
  const progressPercent = activeGoal && activeGoal.targetAmount > 0 
    ? Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100) 
    : 0;

  const handleCopyInvite = () => {
    const code = `JOIN-${teamData.id.substring(0, 8)}`;
    navigator.clipboard.writeText(code);
    setInviteCopied(true);
    playSound('success');
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const handleSelectGoal = (quest: Quest) => {
    onUpdateMission({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      targetMaterialId: 'discovery',
      targetMaterialName: quest.imagePrompt, 
      targetMaterialImage: quest.coverImage || MATERIALS[0].image,
      currentAmount: 0,
      targetAmount: 25, 
      rewardXp: quest.xpReward * 2, 
      timeLeft: '48h'
    });
    setShowGoalSelector(false);
  };

  return (
    <div className="animate-in fade-in duration-300 min-h-screen bg-background text-txt-main flex flex-col font-sans relative overflow-hidden">
      
      <div className="sticky top-0 left-0 right-0 p-4 pt-safe flex justify-between items-center z-50 bg-background/90 backdrop-blur-md border-b border-ln-base">
        <button onClick={onBack} aria-label="Go back" className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors text-slate-800">
            <ChevronLeft size={28} />
        </button>
        <h1 className="font-extrabold text-lg tracking-tight text-slate-900">Team Hub</h1>
        <div className="flex gap-1">
            <button onClick={onOpenTeamChat} className="p-2 hover:bg-white/50 rounded-full text-primary transition-colors">
                <MessageSquare size={24} />
            </button>
            <button className="p-2 hover:bg-white/50 rounded-full text-slate-400">
                <MoreHorizontal size={24} />
            </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide relative z-10 pb-32">
        
        <div className="px-6 pt-10 pb-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden mb-6 shadow-xl border-4 border-white relative bg-white">
                <OptimizedImage src={teamData.avatar} alt="Team Logo" className="w-full h-full object-cover" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{teamData.name}</h2>
            <p className="text-sm text-slate-500 max-w-xs mb-8 font-medium">
                {teamData.description || 'Exploring the neighborhood together.'}
            </p>
            
            <div className="grid grid-cols-3 w-full max-w-md bg-white rounded-4xl p-6 border border-slate-100 shadow-sm">
                <div className="text-center border-r border-slate-100">
                    <span className="text-xl font-black text-slate-900">#{teamData.rank}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mt-1 tracking-widest">Rank</span>
                </div>
                <div className="text-center border-r border-slate-100">
                    <span className="text-xl font-black text-primary">{teamData.totalXp.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mt-1 tracking-widest">Points</span>
                </div>
                <div className="text-center">
                    <span className="text-xl font-black text-slate-900">{teamData.members?.length || 0}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-black block mt-1 tracking-widest">Members</span>
                </div>
            </div>
        </div>

        <div className="px-6 mb-8 flex p-1.5 bg-white border border-slate-200 rounded-2xl mx-6">
            <button 
                onClick={() => setActiveTab('goals')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'goals' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Goals
            </button>
            <button 
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'members' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Members
            </button>
        </div>

        <div className="px-6">
            {activeTab === 'goals' && (
                <section className="animate-in fade-in slide-in-from-bottom duration-500">
                    {activeGoal ? (
                        <div className="bg-white rounded-5xl overflow-hidden shadow-lg border border-slate-100">
                            <div className="h-48 w-full relative">
                                <OptimizedImage src={activeGoal.targetMaterialImage} className="w-full h-full object-cover" alt="Quest Target" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-900 border border-white/50 uppercase tracking-widest shadow-sm">
                                    {activeGoal.timeLeft} LEFT
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <h4 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">{activeGoal.title}</h4>
                                <p className="text-sm text-slate-500 mb-8 font-medium leading-relaxed">{activeGoal.description}</p>

                                <div className="mb-8 p-5 bg-sky-50 rounded-3xl border border-sky-100">
                                    <div className="flex justify-between text-[10px] font-black text-primary mb-3 uppercase tracking-widest">
                                        <span>Team Progress</span>
                                        <span>{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-sky-100">
                                        <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                                    </div>
                                    <div className="mt-4 text-[10px] font-bold text-primary text-center uppercase tracking-widest">
                                        {activeGoal.currentAmount} of {activeGoal.targetAmount} items found
                                    </div>
                                </div>

                                <button 
                                    onClick={() => onContribute(activeGoal)}
                                    className="w-full py-5 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-sky-200 hover:brightness-110"
                                >
                                    <Camera size={20} /> Share Discovery
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 bg-white rounded-5xl flex flex-col items-center text-center px-10 border border-slate-100 shadow-sm">
                            <Target size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No Active Goal</h3>
                            <p className="text-sm text-slate-500 mb-10 max-w-[240px]">Start a team quest to earn bonus points and climb the rankings together.</p>
                            {isLeader && (
                                <button 
                                    onClick={() => setShowGoalSelector(true)}
                                    className="px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-sky-200"
                                >
                                    <Plus size={18} /> Pick a Goal
                                </button>
                            )}
                        </div>
                    )}
                </section>
            )}

            {activeTab === 'members' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="space-y-3">
                        {teamData.members?.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                                            <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} alt={member.name} className="w-full h-full" />
                                        </div>
                                        {member.role === 'leader' && (
                                            <div className="absolute -top-2 -left-2 bg-amber-400 text-white p-1 rounded-lg border-2 border-white shadow-sm">
                                                <Crown size={10} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-extrabold text-slate-900 text-sm">{member.name}</div>
                                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{member.role === 'leader' ? 'Founder' : 'Member'}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isLeader && member.role !== 'leader' && (
                                        <button 
                                            onClick={() => onKickMember?.(member.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <UserMinus size={20} />
                                        </button>
                                    )}
                                    <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                                        <MessageSquare size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setShowInvite(true)}
                        className="w-full py-8 border-2 border-dashed border-slate-200 rounded-4xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/30 transition-all bg-slate-50/50 group"
                    >
                        <div className="w-12 h-12 rounded-3xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            <UserPlus size={24} />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest">Invite Neighbors</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      {showGoalSelector && (
          <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in slide-in-from-bottom duration-400">
              <div className="p-6 pt-safe border-b border-ln-base bg-background flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Available Quests</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select a team mission</p>
                  </div>
                  <button onClick={() => setShowGoalSelector(false)} className="p-3 hover:bg-white/50 rounded-2xl text-slate-500 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {allQuests.filter(q => q.type === QuestType.TEAM).map(q => (
                    <button 
                      key={q.id} 
                      onClick={() => handleSelectGoal(q)} 
                      className="w-full flex items-center gap-5 p-5 text-left bg-white rounded-4xl hover:shadow-lg border border-slate-100 transition-all active:scale-98"
                    >
                        <div className="w-20 h-20 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                          <OptimizedImage src={q.coverImage || ''} className="w-full h-full object-cover" alt="Cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-slate-900 truncate mb-1 text-lg">{q.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1 mb-3 font-medium">{q.description}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-black text-primary bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 uppercase tracking-widest">+{q.xpReward * 2} XP</span>
                             <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">+{q.coinReward * 2} QC</span>
                          </div>
                        </div>
                    </button>
                ))}
              </div>
          </div>
      )}

      {showInvite && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl relative border border-white/20">
                  <button onClick={() => setShowInvite(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                  
                  <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-8 text-primary shadow-inner">
                    <UserPlus size={40} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Add Friends</h3>
                  <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed">Share your unique team code with friends to let them join your community instantly.</p>
                  
                  <div 
                    className="bg-slate-50 rounded-4xl p-8 mb-10 border-2 border-dashed border-slate-200 cursor-pointer active:scale-95 transition-all group" 
                    onClick={handleCopyInvite}
                  >
                    <span className="text-[10px] text-slate-400 uppercase font-black block mb-3 tracking-widest">Join Code</span>
                    <span className="text-3xl font-black text-primary tracking-widest uppercase group-hover:scale-105 transition-transform block">
                        {teamData.id.substring(0, 8)}
                    </span>
                    {inviteCopied && <p className="text-xs text-emerald-500 font-extrabold mt-4 animate-in slide-in-from-bottom-2 uppercase">Copied!</p>}
                  </div>

                  <button onClick={() => setShowInvite(false)} className="w-full py-5 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs rounded-3xl hover:bg-slate-200 transition-colors">
                    Close
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default TeamView;
