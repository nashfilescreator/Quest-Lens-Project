
import React, { useState } from 'react';
import { Team, TeamMission, Quest, Material } from '../types';
import { Shield, Target, MessageSquare, ChevronLeft, Plus, Crown, Camera, Globe, Info } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { playSound } from '../services/audioService';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface TeamHubProps {
  team: Team;
  userMaterials: Material[];
  onBack: () => void;
  onContribute: (mission: TeamMission) => void;
  onOpenChat: () => void;
  allQuests: Quest[];
  onUpdateMission: (mission: TeamMission) => void;
}

const TeamHub: React.FC<TeamHubProps> = ({ team, onBack, onContribute, onOpenChat, allQuests, onUpdateMission }) => {
  const [tab, setTab] = useState<'OPS' | 'ROSTER'>('OPS');
  const activeMission = team.activeMission;
  
  // Real-time Intel Feed from Team Messages
  const intelMessages = useQuery(api.messages.getChannel, { channelId: team.id }) || [];

  return (
    <div className="min-h-screen bg-background text-txt-main flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden">
      {/* Tactical Header */}
      <div className="relative h-[25vh] w-full shrink-0">
          <OptimizedImage src={team.avatar} alt="Team" className="w-full h-full object-cover opacity-30 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          
          <div className="absolute top-0 left-0 right-0 p-6 pt-safe flex justify-between items-center z-20">
              <button onClick={onBack} className="p-2.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-white hover:bg-white/10 transition-all"><ChevronLeft size={24} /></button>
              <button onClick={onOpenChat} className="p-2.5 bg-primary/20 border border-primary/40 rounded-xl backdrop-blur-md text-primary hover:bg-primary/30 transition-all relative">
                  <MessageSquare size={24} />
                  {intelMessages.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-background"></span>}
              </button>
          </div>

          <div className="absolute bottom-6 left-8 right-8 z-20 flex justify-between items-end">
              <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                      <Shield size={14} className="text-primary fill-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Squadron Command</span>
                  </div>
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{team.name}</h1>
              </div>
              <div className="text-right">
                  <span className="text-2xl font-black text-white block leading-none">#{team.rank}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-txt-dim">Ranked</span>
              </div>
          </div>
      </div>

      {/* Roster / Ops Switch */}
      <div className="flex px-6 pt-4 gap-2 shrink-0">
          {['OPS', 'ROSTER'].map(t => (
              <button 
                key={t}
                onClick={() => { setTab(t as any); playSound('click'); }}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${tab === t ? 'bg-primary border-primary text-white shadow-glow' : 'bg-white/5 border-white/10 text-txt-dim'}`}
              >
                  {t === 'OPS' ? 'Tactical Ops' : 'Agent Roster'}
              </button>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
          {tab === 'OPS' ? (
              <div className="space-y-8 animate-in slide-in-from-left duration-400">
                  {activeMission ? (
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden p-8 shadow-2xl relative group">
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                              <Target size={120} strokeWidth={1} />
                          </div>
                          
                          <div className="relative z-10 space-y-6">
                              <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Active Directive</span>
                                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">{activeMission.timeLeft} REMAINING</span>
                                  </div>
                                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{activeMission.title}</h2>
                                  <p className="text-sm text-txt-sub font-medium leading-relaxed max-w-xs">{activeMission.description}</p>
                              </div>

                              <div className="space-y-3">
                                  <div className="flex justify-between items-end">
                                      <span className="text-[9px] font-black uppercase text-txt-dim tracking-widest">Global Progress</span>
                                      <span className="text-xl font-mono font-bold text-white">{Math.round((activeMission.currentAmount/activeMission.targetAmount)*100)}%</span>
                                  </div>
                                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                      <div className="h-full bg-primary shadow-[0_0_15px_#818cf8] transition-all duration-1000 ease-out" style={{ width: `${(activeMission.currentAmount/activeMission.targetAmount)*100}%` }}></div>
                                  </div>
                                  <div className="text-[9px] font-bold text-primary/70 text-center uppercase tracking-[0.2em]">{activeMission.currentAmount} / {activeMission.targetAmount} ITEMS SECURED</div>
                              </div>

                              <button 
                                onClick={() => onContribute(activeMission)}
                                className="w-full h-16 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                              >
                                  <Camera size={18} strokeWidth={3} /> Upload Intel
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="py-20 border border-dashed border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-10 gap-4 group hover:border-primary/50 transition-colors">
                          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-txt-dim group-hover:text-primary transition-colors">
                              <Globe size={40} strokeWidth={1} />
                          </div>
                          <div className="space-y-1">
                              <h3 className="text-lg font-bold text-white uppercase tracking-tight">No Active Mission</h3>
                              <p className="text-xs text-txt-dim font-medium max-w-[200px]">Unlock new objectives by discovering rare items in the neighborhood.</p>
                          </div>
                          <button className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all">Scan Available Signals</button>
                      </div>
                  )}

                  <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-txt-dim uppercase tracking-[0.3em] ml-2">Recent Intel Feed</h3>
                      <div className="space-y-3">
                          {intelMessages.length > 0 ? (
                            intelMessages.slice(0, 5).map(msg => (
                              <div key={msg.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl animate-in slide-in-from-right duration-300">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                      <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatarSeed}`} className="w-full h-full" alt="" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-white leading-none mb-1 uppercase tracking-tight truncate">{msg.senderName}</p>
                                      <p className="text-[10px] text-txt-dim line-clamp-1 italic">"{msg.text}"</p>
                                  </div>
                                  <span className="text-[9px] font-mono text-txt-dim whitespace-nowrap">{msg.timestamp}</span>
                              </div>
                            ))
                          ) : (
                            <div className="py-10 text-center opacity-20">
                                <p className="text-[10px] font-black uppercase tracking-widest">No recent data logs</p>
                            </div>
                          )}
                      </div>
                  </div>
              </div>
          ) : (
              <div className="space-y-4 animate-in slide-in-from-right duration-400">
                  {team.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-3xl hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                              <div className="relative">
                                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface border border-white/10">
                                      <OptimizedImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatar}`} alt={member.name} className="w-full h-full" />
                                  </div>
                                  {member.role === 'leader' && (
                                      <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-lg border-2 border-background shadow-lg">
                                          <Crown size={12} fill="white" />
                                      </div>
                                  )}
                              </div>
                              <div>
                                  <h4 className="font-bold text-white text-base leading-none mb-1 uppercase tracking-tight">{member.name}</h4>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black uppercase text-txt-dim tracking-widest">{member.role}</span>
                                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                                  </div>
                              </div>
                          </div>
                          <button className="p-3 bg-white/5 rounded-xl text-txt-sub hover:text-white hover:bg-white/10 transition-all">
                              <Info size={18} />
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Bottom HUD Bar */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-white/10 p-6 flex justify-between items-center z-20">
          <div className="flex flex-col">
              <span className="text-[9px] font-black text-txt-dim uppercase tracking-widest">Squad Influence</span>
              <span className="text-xl font-black text-primary uppercase">Elite Tier</span>
          </div>
          <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-txt-dim hover:text-white transition-colors"><Plus size={20} /></button>
          </div>
      </div>
    </div>
  );
};

export default TeamHub;
