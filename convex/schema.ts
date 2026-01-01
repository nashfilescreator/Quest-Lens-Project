
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    uid: v.string(),
    username: v.string(),
    avatarSeed: v.string(),
    profileImage: v.optional(v.string()),
    dashboardCover: v.optional(v.string()),
    level: v.number(),
    xp: v.number(),
    studyXp: v.number(),
    coins: v.number(),
    streak: v.number(),
    influence: v.number(),
    rank: v.string(),
    activeRoles: v.array(v.string()),
    inventory: v.array(v.string()),
    completedQuestIds: v.array(v.string()),
    activeQuestIds: v.array(v.string()),
    currentTeamId: v.optional(v.string()),
    roleAffinity: v.any(),
    rolePreferences: v.any(),
    settings: v.any(),
    bio: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    lastAiQuestSync: v.optional(v.number()),
    friends: v.array(v.string()),
    incomingFriendRequests: v.array(v.string()),
    outgoingFriendRequests: v.array(v.string()),
    journal: v.array(v.any()),
    artifacts: v.array(v.any()),
    transactions: v.array(v.any()),
    skillCooldowns: v.any(),
    isMatchmaking: v.optional(v.boolean()),
  }).index("by_uid", ["uid"]).index("by_xp", ["xp"]).index("by_matchmaking", ["isMatchmaking"]),

  quests: defineTable({
    id: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    type: v.string(),
    difficulty: v.string(),
    xpReward: v.number(),
    coinReward: v.number(),
    imagePrompt: v.string(),
    coverImage: v.optional(v.string()),
    creator: v.string(),
    creatorId: v.optional(v.string()),
    roleTags: v.array(v.string()),
    difficultyTier: v.number(),
    storyLine: v.optional(v.array(v.any())),
    location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
  }).index("by_creator", ["creatorId"]),

  worldEvents: defineTable({
    title: v.string(),
    description: v.string(),
    targetHealth: v.number(),
    currentHealth: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
    rewardTier: v.string(),
    imagePrompt: v.string(),
    roleTags: v.array(v.string()),
  }),

  teams: defineTable({
    name: v.string(),
    description: v.string(),
    avatar: v.string(),
    rank: v.number(),
    totalXp: v.number(),
    members: v.array(v.object({ 
      id: v.string(), 
      name: v.string(), 
      avatar: v.string(), 
      role: v.string() 
    })),
    joinRequests: v.array(v.object({
      userId: v.string(),
      username: v.string(),
      avatar: v.string(),
      timestamp: v.string()
    })),
    activeMission: v.optional(v.any()),
    privacy: v.string(),
  }),

  duels: defineTable({
    player1: v.string(), // UID
    player2: v.string(), // UID
    status: v.string(), // 'pending' | 'active' | 'completed'
    quest: v.any(),
    winner: v.optional(v.string()),
    p1StartTime: v.optional(v.number()),
    p2StartTime: v.optional(v.number()),
    p1FinishTime: v.optional(v.number()),
    p2FinishTime: v.optional(v.number()),
  }).index("by_player", ["player1", "player2"]),

  posts: defineTable({
    userId: v.string(),
    username: v.string(),
    avatarSeed: v.string(),
    questTitle: v.string(),
    caption: v.string(),
    image: v.string(),
    likes: v.number(),
    likedBy: v.array(v.string()),
    timeAgo: v.string(),
    userRank: v.string(),
    comments: v.optional(v.array(v.any())),
  }),

  messages: defineTable({
    channelId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    avatarSeed: v.string(),
    text: v.string(),
    timestamp: v.string(),
    questId: v.optional(v.string()),
  }).index("by_channel", ["channelId"]),
  
  notifications: defineTable({
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    timestamp: v.string(),
    read: v.boolean(),
    actionPayload: v.optional(v.any()),
  }).index("by_user", ["userId"]),
});
