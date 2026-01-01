
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Quest, UserStats, StoryStep, AppSettings } from '../types';
import { generateAIQuests } from '../services/geminiService';
import { calculateQuestRewards } from '../services/rewardService';

export const useQuestSystem = (
  stats: UserStats,
  setStats: any,
  settings: AppSettings,
  addNotification: (t: string, m: string, y: any) => void,
  userId: string,
  convexUserId?: any
) => {
  const communityQuests = useQuery(api.quests.listAll) || [];
  const worldEvents = useQuery(api.worldEvents.listActive) || [];
  const batchCreateQuests = useMutation(api.quests.batchCreate);
  const singleCreateQuest = useMutation(api.quests.createQuest);
  const completeStepMutation = useMutation(api.users.completeQuestStep);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileReference = useMutation(api.files.saveFileReference);

  const allQuests = useMemo(() => {
    const combined = [...(stats.cachedAiQuests || []), ...communityQuests];
    const seen = new Set();
    return combined.filter(q => {
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });
  }, [stats.cachedAiQuests, communityQuests]);

  const personalizedQuests = useMemo(() => {
    if (!stats || !stats.roleAffinity) return allQuests;
    return [...allQuests].sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      if (stats.completedQuestIds?.includes(a.id)) scoreA -= 50000;
      if (stats.completedQuestIds?.includes(b.id)) scoreB -= 50000;
      if (stats.activeQuestIds?.includes(a.id)) scoreA += 10000;
      if (stats.activeQuestIds?.includes(b.id)) scoreB += 10000;
      return scoreB - scoreA;
    });
  }, [allQuests, stats]);

  const refreshAIQuests = useCallback(async (syncToBackend: boolean = false) => {
    if (isRefreshing || !stats) return;

    // Add a cooldown check (e.g., 30 seconds) to prevent spamming
    const COOLDOWN_MS = 30 * 1000;
    const lastSync = stats.lastAiQuestSync || 0;
    const timeSinceLastSync = Date.now() - lastSync;

    if (timeSinceLastSync < COOLDOWN_MS && !syncToBackend) {
      console.warn(`[AI Refresh] Rate limiting: Please wait ${Math.ceil((COOLDOWN_MS - timeSinceLastSync) / 1000)}s`);
      return;
    }

    setIsRefreshing(true);
    try {
      const newQuests = await generateAIQuests("Missions", settings.dailyQuestLimit, stats.rolePreferences, settings, stats.activeRoles);
      if (newQuests?.length > 0) {
        setStats((prev: any) => ({ ...prev, cachedAiQuests: newQuests, lastAiQuestSync: Date.now() }));
        if (syncToBackend) {
          await batchCreateQuests({ quests: newQuests.map(q => ({ ...q, creatorId: userId })) });
        }
      }
    } catch (error) {
      console.error("AI Refresh Failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, stats, settings, batchCreateQuests, setStats, userId]);

  const processQuestCompletion = useCallback(async (quest: Quest, storyStep?: StoryStep | null, capturedImage?: string) => {
    if (!stats || !convexUserId) return;
    const rewards = calculateQuestRewards(stats, quest, storyStep);

    let storageIdOrUrl = capturedImage;

    if (capturedImage && capturedImage.startsWith('data:')) {
      try {
        // Upload to Convex Storage
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(capturedImage);
        const blob = await response.blob();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": blob.type },
          body: blob,
        });

        const { storageId } = await result.json();
        const { url } = await saveFileReference({
          storageId,
          userId: convexUserId,
          fileType: "quest",
          metadata: { questId: quest.id, stepId: storyStep?.id }
        });
        storageIdOrUrl = url;
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    }

    if (capturedImage) {
      const isFinalStep = !quest.storyLine || (storyStep && storyStep.id === quest.storyLine.length);
      const entry = {
        id: `entry-${Date.now()}`,
        questTitle: storyStep ? `${quest.title}: ${storyStep.title}` : quest.title,
        image: storageIdOrUrl, // Use the storage URL
        date: new Date().toLocaleDateString(),
        rewards: { xp: rewards.xp, coins: rewards.coins, influence: rewards.influence }
      };

      await completeStepMutation({
        userId: convexUserId,
        questId: quest.id,
        rewards,
        journalEntry: entry,
        isFinalStep
      });
    }
    return rewards;
  }, [stats, convexUserId, completeStepMutation, generateUploadUrl, saveFileReference]);

  const createQuest = useCallback(async (quest: Partial<Quest>) => {
    const finalQuest = {
      ...quest,
      creatorId: userId,
      creator: stats.username,
    };
    return await singleCreateQuest({ quest: finalQuest });
  }, [userId, stats.username, singleCreateQuest]);

  const updateQuestMutation = useMutation(api.quests.updateQuest);

  const updateQuest = useCallback(async (id: string, updates: Partial<Quest>) => {
    return await updateQuestMutation({ id: id as any, updates });
  }, [updateQuestMutation]);

  return {
    quests: personalizedQuests,
    worldEvents: worldEvents,
    isRefreshing,
    refreshAIQuests,
    processQuestCompletion,
    createQuest,
    updateQuest
  };
};
