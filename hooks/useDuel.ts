
import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { playSound } from '../services/audioService';

export const useDuel = (userId: string | undefined) => {
  const activeDuel = useQuery(api.duels.getActiveDuel, { userId: userId || '' });
  const startMatchmaking = useMutation(api.duels.startMatchmaking);
  const completeDuel = useMutation(api.duels.completeDuel);
  const stopMatchmaking = useMutation(api.users.stopMatchmaking);
  
  const [matchState, setMatchState] = useState<'idle' | 'searching' | 'active' | 'concluded' | null>('idle');
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (activeDuel) {
      setMatchState('active');
      playSound('hero');
    }
  }, [activeDuel]);

  const joinQueue = useCallback(async () => {
    if (!userId) return;
    setMatchState('searching');
    await startMatchmaking({ userId });
  }, [userId, startMatchmaking]);

  const leaveQueue = useCallback(async () => {
    if (!userId) return;
    setMatchState('idle');
    await stopMatchmaking({ userId });
  }, [userId, stopMatchmaking]);

  const reportVictory = useCallback(async () => {
    if (!activeDuel || !userId) return;
    setWinner(userId);
    setMatchState('concluded');
    await completeDuel({ duelId: activeDuel._id, winnerId: userId });
    playSound('success');
  }, [activeDuel, userId, completeDuel]);

  return { 
    matchState, 
    opponent: activeDuel ? (activeDuel.player1 === userId ? activeDuel.player2 : activeDuel.player1) : null, 
    winner, 
    isMatchReady: !!activeDuel, 
    reportVictory,
    joinQueue,
    leaveQueue
  };
};
