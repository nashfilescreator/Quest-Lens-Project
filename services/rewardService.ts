
import { UserStats, ActiveBuff, Quest, StoryStep } from '../types';
import { LEVEL_THRESHOLDS } from '../constants';

export interface RewardCalculation {
  xp: number;
  studyXp: number;
  coins: number;
  influence: number;
  levelUp: boolean;
  newLevel: number;
  isLiberation: boolean;
}

/**
 * Centrally manages all reward logic.
 * Scales rewards based on active roles and skills/buffs.
 */
export const calculateQuestRewards = (
  stats: UserStats,
  quest: Quest,
  storyStep?: StoryStep | null
): RewardCalculation => {
  let xpEarned = storyStep ? storyStep.rewardXP : quest.xpReward;
  let coinsEarned = storyStep ? 0 : (quest.coinReward || 25);
  let sxpEarned = 0;
  let influenceEarned = storyStep ? 5 : 25;
  
  const isStudent = stats.activeRoles.includes('Student');
  const isCreator = stats.activeRoles.includes('Creator');
  const isCompetitor = stats.activeRoles.includes('Competitor');

  // 1. Role Buffs
  if (isStudent && (quest.roleTags?.includes('Student') || quest.id.includes('map-'))) {
    sxpEarned = Math.floor(xpEarned * 0.5);
    xpEarned = Math.floor(xpEarned * 1.1);
  }

  if (isCompetitor && quest.type === 'COMPETITIVE') {
    influenceEarned += 20;
    coinsEarned = Math.floor(coinsEarned * 1.5);
  }

  // 2. Active Skill Buffs
  stats.activeBuffs.forEach(buff => {
    if (Date.now() < buff.expiresAt) {
        if (buff.type === 'xp_multiplier') xpEarned = Math.floor(xpEarned * buff.value);
        if (buff.type === 'influence_bonus') influenceEarned = Math.floor(influenceEarned * buff.value);
        if (buff.type === 'combat_stim') coinsEarned = Math.floor(coinsEarned * buff.value);
    }
  });

  const totalXp = stats.xp + xpEarned;
  const currentLevel = stats.level;
  const newLevel = calculateLevelFromXp(totalXp);

  return {
    xp: xpEarned,
    studyXp: sxpEarned,
    coins: coinsEarned,
    influence: influenceEarned,
    levelUp: newLevel > currentLevel,
    newLevel,
    isLiberation: false
  };
};

export const calculateLevelFromXp = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
};
