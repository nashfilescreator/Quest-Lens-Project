
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all quests
export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("quests").collect();
  },
});

// Get a single quest by its Convex ID
export const getById = query({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get quests created by a specific user
export const getByCreator = query({
  args: { creatorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quests")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

// Get quests filtered by type
export const getByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quests")
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();
  },
});

// Get quests filtered by difficulty
export const getByDifficulty = query({
  args: { difficulty: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quests")
      .filter((q) => q.eq(q.field("difficulty"), args.difficulty))
      .collect();
  },
});

// Create a new quest
export const createQuest = mutation({
  args: { quest: v.any() },
  handler: async (ctx, args) => {
    const questWithId = {
      ...args.quest,
      id: args.quest.id || `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    return await ctx.db.insert("quests", questWithId);
  },
});

// Batch create multiple quests
export const batchCreate = mutation({
  args: { quests: v.array(v.any()) },
  handler: async (ctx, args) => {
    const ids = [];
    for (const q of args.quests) {
      const questWithId = {
        ...q,
        id: q.id || `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const id = await ctx.db.insert("quests", questWithId);
      ids.push(id);
    }
    return ids;
  },
});

// Update an existing quest
export const updateQuest = mutation({
  args: {
    id: v.id("quests"),
    updates: v.any()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Quest not found");

    await ctx.db.patch(args.id, args.updates);
    return args.id;
  },
});

// Delete a quest
export const deleteQuest = mutation({
  args: { id: v.id("quests") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Quest not found");

    await ctx.db.delete(args.id);
    return true;
  },
});

// Update a story step within a quest
export const updateStoryStep = mutation({
  args: {
    questId: v.id("quests"),
    stepId: v.number(),
    updates: v.any()
  },
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest || !quest.storyLine) throw new Error("Quest or storyline not found");

    const updatedStoryLine = quest.storyLine.map((step: any, index: number) =>
      index === args.stepId ? { ...step, ...args.updates } : step
    );

    await ctx.db.patch(args.questId, { storyLine: updatedStoryLine });
    return args.questId;
  },
});

// Get recommended quests based on user roles
export const getRecommended = query({
  args: { roles: v.array(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const allQuests = await ctx.db.query("quests").collect();

    // Score quests based on role match
    const scored = allQuests.map(quest => {
      let score = 0;
      for (const role of args.roles) {
        if (quest.roleTags?.includes(role)) {
          score += 10;
        }
      }
      return { quest, score };
    });

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit || 10)
      .map(s => s.quest);
  },
});

