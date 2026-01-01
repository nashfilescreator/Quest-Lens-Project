
import React, { useState } from 'react';
import { Quest, AppRole, QuestType } from '../types';
import { Camera, ChevronLeft, Volume2, Zap, Award, MapPin, Check, Coins, TrendingUp, BookOpen } from 'lucide-react';
import { playSound, ensureAudioContext } from '../services/audioService';
import { speakResponse } from '../services/geminiService';
import OptimizedImage from './OptimizedImage';
import { useUIStore } from '../store/uiStore';

interface QuestDetailProps {
  quest: Quest;
  isCompleted: boolean;
  activeRoles?: AppRole[];
}

const QuestDetail: React.FC<QuestDetailProps> = ({ quest, isCompleted }) => {
  const { changeView, openCamera } = useUIStore(state => state);

  const playBriefing = async () => {
      playSound('click');
      try {
          const text = `Mission: ${quest.title}. ${quest.description}. Find ${quest.imagePrompt}.`;
          const audioBuffer = await speakResponse(text);
          if (audioBuffer) {
              const ctx = await ensureAudioContext();
              if (!ctx) return;
              
              const dataInt16 = new Int16Array(audioBuffer);
              const audioBufferObj = ctx.createBuffer(1, dataInt16.length, 24000);
              const channelData = audioBufferObj.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) {
                  channelData[i] = dataInt16[i] / 32768.0;
              }

              const source = ctx.createBufferSource();
              source.buffer = audioBufferObj;
              source.connect(ctx.destination);
              source.start();
          }
      } catch (e) {}
  };

  const getButtonText = () => {
    if (isCompleted) {
      if (quest.type === QuestType.COMPETITIVE) return 'Challenge Completed';
      if (quest.type === QuestType.STORY) return 'Story Completed';
      return 'Quest Completed';
    }

    if (quest.type === QuestType.STORY) {
      return (quest.currentStep && quest.currentStep > 1) ? 'Continue Story' : 'Start Story';
    }

    if (quest.type === QuestType.COMPETITIVE) return 'Begin Challenge';

    return 'Start Quest';
  };

  const getObjectiveColorClass = (type: QuestType) => {
    switch (type) {
      case QuestType.STORY:
        return 'text-creation-500'; // Purple
      case QuestType.COMPETITIVE:
        return 'text-challenge-500'; // Red
      case QuestType.TEAM:
        return 'text-discovery-500'; // Green/Teal
      case QuestType.BOUNTY:
        return 'text-learning-500'; // Amber/Orange
      case QuestType.DAILY:
        return 'text-blue-400'; // A distinct blue for daily
      case QuestType.COMMUNITY:
        return 'text-cyan-400'; // Cyan for community
      default:
        return 'text-primary'; // Default primary color
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-txt-main pb-40 overflow-x-hidden">
      {/* Immersive Header */}
      <div className="relative h-[45vh] w-full overflow-hidden">
          <OptimizedImage 
              src={quest.coverImage || ''} 
              alt={quest.title} 
              className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
          
          <div className="absolute top-0 left-0 right-0 p-6 pt-safe flex items-center justify-between z-20">
              <button 
                  onClick={() => changeView('feed')} 
                  className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl text-white hover:bg-black/60 transition-all active:scale-90 shadow-xl border border-white/10"
              >
                  <ChevronLeft size={24} />
              </button>
              <button 
                  onClick={playBriefing} 
                  className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl text-white hover:bg-white/20 transition-all active:scale-90 shadow-xl border border-white/10"
              >
                  <Volume2 size={24} />
              </button>
          </div>

          <div className="absolute bottom-8 left-6 right-6 z-20">
              <div className="flex items-center gap-3 mb-3">
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                      {quest.type.replace('_', ' ')}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/30"></div>
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
                      {quest.difficulty}
                  </span>
              </div>
              <h1 className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-xl">{quest.title}</h1>
          </div>
      </div>

      {/* Content Section - Frameless & Minimal */}
      <div className="px-6 space-y-12 mt-8">
          
          {/* Briefing Section */}
          <div className="space-y-3">
              <div className="flex items-center gap-2 text-txt-dim">
                  <BookOpen size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Briefing</h3>
              </div>
              <p className="text-lg text-txt-sub leading-relaxed font-medium">
                  {quest.description}
              </p>
          </div>

          {/* Objective Section - Frameless and Centered */}
          <div className="space-y-4 text-center">
              <h3 className="text-[10px] font-black text-txt-dim uppercase tracking-[0.2em]">Objective</h3>
              <span className={`text-xl font-bold ${getObjectiveColorClass(quest.type)}`}>{quest.imagePrompt}</span>
          </div>

          {/* Reward Summary */}
          <div className="space-y-6">
              <div className="flex items-center gap-2 text-txt-dim">
                  <Award size={16} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Rewards</h3>
              </div>
              
              <div className="flex justify-between items-center py-6 border-y border-white/5">
                  <div className="text-center flex-1">
                      <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-2xl font-black">{quest.xpReward}</span>
                      </div>
                      <span className="text-[9px] font-black text-txt-dim uppercase tracking-widest">Experience</span>
                  </div>
                  
                  <div className="w-px h-8 bg-white/5"></div>
                  
                  <div className="text-center flex-1">
                      <div className="flex items-center justify-center gap-1.5 text-amber-500 mb-1">
                        <Coins size={14} fill="currentColor" />
                        <span className="text-2xl font-black">{quest.coinReward}</span>
                      </div>
                      <span className="text-[9px] font-black text-txt-dim uppercase tracking-widest">Coins</span>
                  </div>

                  <div className="w-px h-8 bg-white/5"></div>

                  <div className="text-center flex-1">
                      <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                        <TrendingUp size={14} />
                        <span className="text-2xl font-black">25</span>
                      </div>
                      <span className="text-[9px] font-black text-txt-dim uppercase tracking-widest">Influence</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-background via-background/90 to-transparent z-50">
        <button 
            onClick={() => !isCompleted && openCamera()} 
            disabled={isCompleted}
            className={`w-full h-16 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${
                isCompleted 
                ? 'bg-white/10 text-white/40 cursor-default border border-white/10' 
                : 'bg-primary text-white hover:brightness-110 shadow-primary/20'
            }`}
        >
            {!isCompleted && <Camera size={20} />}
            {isCompleted && <Check size={20} />}
            {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default QuestDetail;
