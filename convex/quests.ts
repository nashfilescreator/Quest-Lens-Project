
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("quests").collect();
  },
});

export const createQuest = mutation({
  args: { quest: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quests", args.quest);
  },
});

export const batchCreate = mutation({
  args: { quests: v.array(v.any()) },
  handler: async (ctx, args) => {
    for (const q of args.quests) {
      await ctx.db.insert("quests", q);
    }
  },
});
