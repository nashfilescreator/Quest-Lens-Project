
export enum QuestType {
  DAILY = 'DAILY',
  STORY = 'STORY',
  COMMUNITY = 'COMMUNITY',
  COMPETITIVE = 'COMPETITIVE',
  TEAM = 'TEAM',
  BOUNTY = 'BOUNTY'
}

export enum QuestDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  LEGENDARY = 'LEGENDARY'
}

export type PlayerRoleLevel = 'Novice' | 'Explorer' | 'Expert' | 'Master';
export type AppRole = 'Explorer' | 'Competitor' | 'Creator' | 'Student';

export interface RoleAffinity {
  Explorer: number;
  Competitor: number;
  Creator: number;
  Student: number;
}

export type CreatorTheme = 'Sci-Fi' | 'Fantasy' | 'Modern' | 'Historical' | 'Nature';

export interface RolePreferences {
  Explorer: {
    terrain: 'Urban' | 'Nature' | 'Industrial' | 'Mixed';
    range: 'Walking' | 'Cycling' | 'Driving';
  };
  Competitor: {
    duelFrequency: 'Frequent' | 'Balanced' | 'Rare';
    intensity: number; // 1-5
  };
  Creator: {
    defaultTheme: CreatorTheme;
    autoPublish: boolean;
  };
  Student: {
    academicLevel: 'Primary' | 'Secondary' | 'Higher' | 'Professional' | 'Lifelong Learner';
    curriculum: string; 
    grade: string; 
    subjects: string[]; 
    syncGrounding: boolean;
    isAutoCalibrated: boolean;
  };
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number; 
  lastUsed?: number;
  icon: string;
}

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  targetHealth: number;
  currentHealth: number;
  expiresAt: number;
  isActive: boolean;
  rewardTier: string;
  imagePrompt: string;
  roleTags: AppRole[];
}

export interface StoryStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  imagePrompt: string;
  rewardXP: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  xpReward: number;
  coinReward: number;
  imagePrompt: string; 
  coverImage?: string;
  expiry?: number; 
  creator?: string; 
  creatorId?: string;
  steps?: number; 
  currentStep?: number;
  storyLine?: StoryStep[]; 
  controllingTeam?: 'ally' | 'enemy' | 'neutral'; 
  roleTags: AppRole[];
  difficultyTier: number; 
  location?: { lat: number; lng: number };
  sources?: { uri: string; title: string }[];
}

export interface JournalEntry {
  id: string;
  questTitle: string;
  image: string;
  date: string;
  rewards: { xp: number; coins: number; sxp?: number };
  location?: string;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  discoveredAt: string;
  xpValue: number;
  infusionLevel?: number;
}

export interface Material {
  id: string;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  image: string;
  count: number;
}

export interface Recipe {
  id: string;
  name: string;
  resultItemId: string; 
  ingredients: { materialId: string; count: number }[];
  duration: number; 
  description: string;
  type?: 'craft' | 'infuse';
}

export interface Friend {
  id: string;
  username: string;
  avatarSeed: string;
  status: 'online' | 'offline' | 'in-quest';
  currentActivity?: string;
  rank: string;
}

export interface ActiveBuff {
  id: string; 
  name: string;
  type: 'xp_multiplier' | 'radar_boost' | 'streak_shield' | 'influence_bonus' | 'combat_stim';
  value: number; 
  expiresAt: number; 
  icon: string;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  senderName: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  source: string;
  date: string;
}

export interface ValidationResult {
  success: boolean;
  confidence: number;
  message: string;
  detectedItems: string[];
}

export interface DiscoveryResult {
  name: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  xpValue: number;
}

export interface MarketItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'powerup' | 'cosmetic' | 'ticket';
  image: string;
}

export interface TeamMission {
  id: string;
  title: string;
  description: string;
  targetMaterialId: string;
  targetMaterialName: string;
  targetMaterialImage: string;
  currentAmount: number;
  targetAmount: number;
  rewardXp: number;
  timeLeft: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarSeed: string;
  xp: number;
  rank: number;
  change: 'up' | 'down' | 'same';
}

export interface AppSettings {
  dailyQuestLimit: number;
  questFrequency: string;
  notifications: boolean;
  sound: boolean;
  haptics: boolean;
  autoSavePhotos: boolean;
  profileVisibility: string;
  country: string;
  streamerMode?: boolean;
  ghostMode?: boolean;
}

export interface UserStats {
  username: string;
  avatarSeed: string;
  profileImage?: string | null; 
  dashboardCover?: string | null; 
  role: PlayerRoleLevel;
  level: number;
  xp: number;
  studyXp: number;
  coins: number;
  streak: number;
  winStreak: number;
  influence: number; 
  totalWins: number;
  rank: string;
  inventory: string[]; 
  activeBuffs: ActiveBuff[]; 
  activeQuestIds: string[]; 
  completedQuestIds: string[];
  equippedFrame?: string | null; 
  journal: JournalEntry[];
  transactions: Transaction[];
  artifacts: Artifact[]; 
  materials: Material[]; 
  friends: Friend[];
  badges: string[];
  teamInvites: TeamInvite[];
  notifications: Notification[];
  outgoingFriendRequests: string[];
  // Fix: Added missing incomingFriendRequests property
  incomingFriendRequests: string[];
  skillCooldowns: Record<string, number>; 
  currentTeamId?: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: string | null;
  activeRoles: AppRole[];
  roleAffinity: RoleAffinity;
  rolePreferences: RolePreferences;
  settings: AppSettings;
  lastAiQuestSync?: number;
  cachedAiQuests?: Quest[];
}

export interface Team {
  id: string;
  name: string;
  description: string;
  avatar: string;
  members: { id: string; name: string; avatar: string; role: 'leader' | 'member' }[];
  rank: number;
  totalXp: number;
  activeMission?: TeamMission;
  joinRequests: any[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatarSeed: string;
  text: string;
  timestamp: string;
  questId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'invite' | 'info';
  timestamp: string;
  read: boolean;
  actionPayload?: {
    type: string;
    teamId?: string;
    requestId?: string;
  };
}

export interface FeedPost {
  id: string;
  userId: string;
  username: string;
  avatarSeed: string;
  questTitle: string;
  caption: string;
  image: string;
  likes: number;
  isLiked: boolean;
  timeAgo: string;
  userRank: string;
  comments?: {
    id: string;
    username: string;
    text: string;
    timeAgo: string;
  }[];
}

export type ViewState = 'onboarding' | 'auth' | 'role-selection' | 'feed' | 'active-quest' | 'social' | 'profile' | 'create' | 'map' | 'wallet' | 'duel' | 'team' | 'team-chat' | 'settings' | 'market' | 'ar-lens' | 'journal' | 'crafting' | 'my-quests' | 'oracle' | 'story-path' | 'edit-profile' | 'create-team' | 'region-selection';
