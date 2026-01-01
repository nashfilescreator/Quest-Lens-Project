
import { useCallback, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Team, UserStats } from '../types';
import { playSound } from '../services/audioService';

export const useSocialSystem = (
  stats: UserStats,
  setStats: any,
  userId: string
) => {
  const globalPosts = useQuery(api.posts.list) || [];
  const sharePost = useMutation(api.posts.share);
  const likePostMutation = useMutation(api.posts.like);
  const commentPostMutation = useMutation(api.posts.comment);
  
  const allTeams = useQuery(api.teams.list, { userId }) || [];
  const createTeamMutation = useMutation(api.teams.create);
  const joinTeamMutation = useMutation(api.teams.join);
  const leaveTeamMutation = useMutation(api.teams.leave);
  const cancelRequestMutation = useMutation(api.teams.cancelRequest);
  const updateTeamMissionMutation = useMutation(api.teams.updateMission);
  const addTeamProgressMutation = useMutation(api.teams.addProgress);
  const acceptRequestTeam = useMutation(api.teams.acceptJoinRequest);
  const declineRequestTeam = useMutation(api.teams.declineJoinRequest);

  const leaderboardData = useQuery(api.users.getLeaderboard) || [];
  const sendRequestMutation = useMutation(api.users.sendFriendRequest);
  const acceptRequestMutation = useMutation(api.users.acceptFriendRequest);
  const declineRequestMutation = useMutation(api.users.declineFriendRequest);

  const friendsList = useQuery(api.users.getByIds, { uids: stats.friends || [] }) || [];
  const incomingRequestsList = useQuery(api.users.getByIds, { uids: stats.incomingFriendRequests || [] }) || [];

  const team = useMemo(() => {
    if (stats.currentTeamId) {
        const found = allTeams.find(t => (t as any)._id === stats.currentTeamId);
        if (found) return found as unknown as Team;
    }
    return null;
  }, [stats.currentTeamId, allTeams]);

  const globalTeamsMapped = useMemo(() => {
    return allTeams.map(t => ({
      id: (t as any)._id,
      name: t.name,
      rank: t.rank,
      avatar: t.avatar,
      members: t.members,
      isPending: (t as any).isPending,
      activity: `${t.totalXp} XP`
    }));
  }, [allTeams]);

  const handleSocialAction = useCallback(async (action: string, targetUid: string) => {
    switch (action) {
      case 'send_request':
        await sendRequestMutation({ senderUid: userId, receiverUid: targetUid });
        playSound('click');
        break;
      case 'accept_request':
        await acceptRequestMutation({ userUid: userId, requesterUid: targetUid });
        playSound('success');
        break;
      case 'decline_request':
      case 'cancel_request':
        await declineRequestMutation({ userUid: userId, requesterUid: targetUid });
        playSound('click');
        break;
    }
  }, [userId, sendRequestMutation, acceptRequestMutation, declineRequestMutation]);

  const likePost = useCallback(async (postId: string) => {
    await likePostMutation({ postId: postId as any, userId });
    playSound('click');
  }, [likePostMutation, userId]);

  const commentPost = useCallback(async (postId: string, text: string) => {
    await commentPostMutation({ postId: postId as any, username: stats.username, text });
    playSound('click');
  }, [commentPostMutation, stats.username]);

  const createTeam = useCallback(async (data: any) => {
      await createTeamMutation({ 
          team: {
            name: data.name,
            description: data.description,
            avatar: data.avatar,
            privacy: data.privacy || 'apply',
            members: [{ id: userId, name: stats.username, avatar: stats.avatarSeed, role: 'leader' }],
            rank: 999,
            totalXp: 0,
          }
      });
      playSound('hero');
  }, [stats.username, stats.avatarSeed, userId, createTeamMutation]);

  const joinTeam = useCallback(async (teamId: string) => {
    await joinTeamMutation({ 
        teamId: teamId as any, 
        userId, 
        username: stats.username, 
        avatar: stats.avatarSeed 
    });
    playSound('success');
  }, [joinTeamMutation, userId, stats.username, stats.avatarSeed]);

  const cancelJoinTeam = useCallback(async (teamId: string) => {
    await cancelRequestMutation({ teamId: teamId as any, userId });
    playSound('click');
  }, [cancelRequestMutation, userId]);

  const manageTeamRequest = useCallback(async (id: string, action: 'accept' | 'decline') => {
      const teamId = stats.currentTeamId;
      if (!teamId) return;
      if (action === 'accept') await acceptRequestTeam({ teamId: teamId as any, userId: id });
      else await declineRequestTeam({ teamId: teamId as any, userId: id });
      playSound('click');
  }, [stats.currentTeamId, acceptRequestTeam, declineRequestTeam]);

  const contributeToTeamMission = useCallback(async (confidence: number) => {
      const teamId = stats.currentTeamId;
      if (!team || !team.activeMission || !teamId) return { amountAdded: 0, isComplete: false };
      
      const amount = Math.ceil(confidence * 5);
      await addTeamProgressMutation({ 
        teamId: teamId as any, 
        userId, 
        amount 
      });

      return { 
          amountAdded: amount, 
          isComplete: (team.activeMission.currentAmount + amount) >= team.activeMission.targetAmount,
          personalXP: 100,
          personalInfluence: 10
      };
  }, [team, stats.currentTeamId, addTeamProgressMutation, userId]);

  const userRank = useMemo(() => {
    const idx = leaderboardData.findIndex(e => e.id === userId);
    return idx !== -1 ? idx + 1 : 999;
  }, [leaderboardData, userId]);

  return {
    team: team || ({} as Team), 
    posts: globalPosts, 
    leaderboard: leaderboardData, 
    globalTeams: globalTeamsMapped, 
    friends: friendsList,
    friendRequests: incomingRequestsList,
    userRank,
    handleSocialAction, 
    likePost, 
    commentPost,
    sharePost,
    updateTeamMission: (mission: any) => stats.currentTeamId && updateTeamMissionMutation({ teamId: stats.currentTeamId as any, mission }), 
    cancelTeamMission: () => stats.currentTeamId && updateTeamMissionMutation({ teamId: stats.currentTeamId as any, mission: null }), 
    contributeToTeamMission, 
    createTeam, 
    joinTeam, 
    manageTeamRequest, 
    kickMember: (memberId: string) => stats.currentTeamId && leaveTeamMutation({ teamId: stats.currentTeamId as any, userId: memberId }), 
    cancelJoinTeam
  };
};
