
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  UserStats, AppSettings, Quest, MarketItem, Recipe, ActiveBuff, DiscoveryResult, Skill
} from '../types';
import { INITIAL_STATS, INITIAL_SETTINGS, MARKET_ITEMS } from '../constants';
import { useQuestSystem } from './useQuestSystem';
import { useSocialSystem } from './useSocialSystem';
import { playSound } from '../services/audioService';

export const useGameLogic = (settings: AppSettings) => {
  const localUid = localStorage.getItem('questlens_local_uid') || 'anonymous';
  const user = useQuery(api.users.getByUid, { uid: localUid });
  const convexNotifications = useQuery(api.notifications.getByUser, { userId: localUid }) || [];
  
  const updateUserMutation = useMutation(api.users.update);
  const claimBonus = useMutation(api.users.claimDaily);
  const addConvexNotif = useMutation(api.notifications.add);
  const markNotifRead = useMutation(api.notifications.markRead);
  const clearNotifs = useMutation(api.notifications.clearAll);
  const purchaseMutation = useMutation(api.users.purchaseItem);
  const logDiscoveryMutation = useMutation(api.users.logDiscovery);
  const useSkillMutation = useMutation(api.users.useSkill);
  const craftMutation = useMutation(api.users.craftItem);
  const contributeEventMutation = useMutation(api.worldEvents.contribute);

  const stats: UserStats = useMemo(() => {
    if (user) return user as unknown as UserStats;
    const saved = localStorage.getItem('questlens_user_profile');
    if (saved) return JSON.parse(saved);
    return { ...INITIAL_STATS, settings: settings || INITIAL_SETTINGS };
  }, [user, settings]);

  const updateProfile = useCallback((updates: Partial<UserStats>) => {
    if (!user) return;
    updateUserMutation({ id: user._id, updates });
  }, [user, updateUserMutation]);

  const addNotification = useCallback(async (title: string, message: string, type: any) => {
      await addConvexNotif({
          userId: localUid,
          title,
          message,
          type,
          timestamp: 'Just now',
      });
  }, [localUid, addConvexNotif]);

  const {
    team, posts, sharePost, leaderboard, globalTeams, friendRequests, friends,
    handleSocialAction, likePost, commentPost, updateTeamMission, cancelTeamMission,
    contributeToTeamMission, createTeam, joinTeam, manageTeamRequest, userRank, kickMember,
    cancelJoinTeam
  } = useSocialSystem(stats, updateProfile, localUid);

  const { 
    quests, worldEvents, isRefreshing, refreshAIQuests, processQuestCompletion, createQuest, updateQuest
  } = useQuestSystem(stats, updateProfile, stats.settings, addNotification, localUid, user?._id);

  const handleDiscovery = useCallback(async (res: DiscoveryResult, img: string) => {
      if (!user) return;
      await logDiscoveryMutation({
          userId: user._id,
          discovery: res,
          image: img
      });
      addNotification("Discovery Logged", `You found a ${res.rarity} artifact: ${res.name}`, "success");
  }, [user, logDiscoveryMutation, addNotification]);

  const handlePurchase = useCallback(async (item: MarketItem) => {
      if (!user || user.coins < item.price) return;
      await purchaseMutation({
          userId: user._id,
          itemId: item.id,
          price: item.price,
          itemName: item.name
      });
      playSound('success');
  }, [user, purchaseMutation]);

  const claimDailyBonus = useCallback(async (reward: { type: 'coins' | 'xp', value: number }) => {
    if (user && user._id) {
      await claimBonus({ id: user._id, reward });
      localStorage.setItem('questlens_last_bonus', new Date().toDateString());
    }
  }, [user, claimBonus]);

  const handleUseItem = useCallback(async (itemId: string) => {
    if (!user) return;
    const item = MARKET_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    let newBuff: ActiveBuff | null = null;
    if (itemId === 'boost_xp') {
        newBuff = {
            id: `buff-${Date.now()}`, name: "Double XP", type: 'xp_multiplier', value: 2.0, expiresAt: Date.now() + (3600 * 1000), icon: 'Zap'
        };
    }

    const inventory = [...user.inventory];
    const index = inventory.indexOf(itemId);
    if (index === -1) return;
    inventory.splice(index, 1);

    await updateUserMutation({
        id: user._id,
        updates: {
            inventory,
            activeBuffs: newBuff ? [...(user.activeBuffs || []), newBuff] : user.activeBuffs
        }
    });
    playSound('success');
  }, [user, updateUserMutation]);

  const handleUseSkill = useCallback(async (skill: Skill) => {
    if (!user) return;
    try {
      await useSkillMutation({ userId: user._id, skill });
      playSound('hero');
    } catch (e: any) {
      playSound('error');
    }
  }, [user, useSkillMutation]);

  const handleCrafting = useCallback(async (recipe: Recipe) => {
    if (!user) return;
    try {
      await craftMutation({ userId: user._id, recipe });
      playSound('success');
    } catch (e) {
      playSound('error');
    }
  }, [user, craftMutation]);

  const contributeToWorldEvent = useCallback(async (eventId: string, amount: number) => {
    await contributeEventMutation({ eventId: eventId as any, amount });
    playSound('click');
  }, [contributeEventMutation]);

  return useMemo(() => ({
    stats, setStats: updateProfile, quests, worldEvents, isRefreshing, refreshAIQuests,
    team, posts, setPosts: sharePost, leaderboard, globalTeams, 
    notifications: convexNotifications, 
    markNotificationRead: (id: string) => markNotifRead({ id: id as any }), 
    clearAllNotifications: () => clearNotifs({ userId: localUid }),
    friends, friendRequests,
    processQuestCompletion, handleDiscovery, 
    handleCrafting, 
    handleSocialAction, likePost, commentPost, updateTeamMission, 
    cancelTeamMission, contributeToTeamMission, createTeam, joinTeam, manageTeamRequest, 
    handlePurchase, claimDailyBonus, createQuest, updateQuest,
    handleUseItem, handleEquipItem: (id: string) => updateProfile({ equippedFrame: id }), 
    handleUpdateProfile: (updates: any) => updateProfile(updates), 
    handleUpdateSettings: (s: AppSettings) => updateProfile({ settings: s }), 
    userRank, kickMember,
    handleUseSkill, cancelJoinTeam, addNotification,
    contributeToWorldEvent
  }), [stats, quests, worldEvents, isRefreshing, team, posts, sharePost, leaderboard, globalTeams, convexNotifications, friendRequests, friends, userRank, handleSocialAction, likePost, commentPost, updateTeamMission, cancelTeamMission, contributeToTeamMission, createTeam, joinTeam, manageTeamRequest, handlePurchase, claimDailyBonus, handleUseItem, kickMember, cancelJoinTeam, addNotification, markNotifRead, clearNotifs, localUid, updateProfile, handleUseSkill, handleCrafting, contributeToWorldEvent]);
};
