
import React, { useState, useEffect } from 'react';
import { Quest, QuestType, QuestDifficulty } from '../types';
import { Swords, Loader, Zap, X } from 'lucide-react';
import { playSound } from '../services/audioService';
import { useDuel } from '../hooks/useDuel';

interface DuelLobbyProps {
  onStartDuel: (quest: Quest, opponent: any, matchId: string) => void;
  onCancel: () => void;
  currentUser?: { id: string; username: string; avatarSeed: string; level: number; rank: string };
}

const DuelLobby: React.FC<DuelLobbyProps> = ({ onStartDuel, onCancel, currentUser }) => {
  const { matchState, opponent, joinQueue, leaveQueue } = useDuel(currentUser?.id);
  const [timer, setTimer] = useState(3);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (matchState === 'active' && opponent && !hasStarted) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setHasStarted(true);
            const duelQuest: Quest = {
              id: `duel-${Date.now()}`,
              title: "Flash Target",
              description: "Be the first to secure the target!",
              type: QuestType.COMPETITIVE,
              difficulty: QuestDifficulty.HARD,
              xpReward: 200,
              coinReward: 100,
              imagePrompt: "A colorful container",
              coverImage: "/assets/quests/competitive_battle.png",
              roleTags: ['Competitor'],
              difficultyTier: 4
            };
            onStartDuel(duelQuest, opponent, `match-${Date.now()}`);
            return 0;
          }
          playSound('click');
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [matchState, opponent, onStartDuel, hasStarted]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchState === 'searching') leaveQueue();
    };
  }, [matchState, leaveQueue]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#020617] font-sans overflow-hidden text-white">
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {matchState === 'idle' && (
          <div className="w-full max-w-sm space-y-10 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 mx-auto bg-primary rounded-3xl flex items-center justify-center shadow-2xl border border-white/20"><Swords size={44} className="text-white" /></div>
            <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">Photo Challenge</h1>
            <p className="text-slate-400 text-sm">Compete in real-time to find an item first.</p>
            <button onClick={joinQueue} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Find Opponent</button>
            <button onClick={onCancel} className="text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-white">Back to Feed</button>
          </div>
        )}

        {matchState === 'searching' && (
          <div className="flex flex-col items-center gap-8 animate-pulse text-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <Swords size={32} className="absolute inset-0 m-auto text-primary" />
            </div>
            <div>
              <p className="font-black text-primary uppercase tracking-[0.3em] mb-2">Matchmaking...</p>
              <p className="text-slate-500 text-xs font-medium">Scanning for active agents in your region</p>
            </div>
            <button onClick={leaveQueue} className="mt-12 flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors">
              <X size={14} /> Cancel Search
            </button>
          </div>
        )}

        {matchState === 'active' && opponent && (
          <div className="flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-primary overflow-hidden bg-surface shadow-2xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.avatarSeed}`} alt="Me" className="w-full h-full" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">{currentUser?.username}</span>
              </div>
              <div className="text-4xl font-display font-black text-primary opacity-50 italic">VS</div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-slate-700 overflow-hidden bg-surface shadow-2xl">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent}`} alt="Them" className="w-full h-full" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Opponent</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2">Incoming Challenge</p>
              <div className="text-7xl font-display font-black text-white animate-bounce drop-shadow-glow">{timer}</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
          .drop-shadow-glow {
              filter: drop-shadow(0 0 10px rgba(129, 140, 248, 0.5));
          }
      `}</style>
    </div>
  );
};

export default DuelLobby;
