
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getChannel = query({
  args: { channelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .take(50);
  },
});

export const send = mutation({
  args: { 
    channelId: v.string(), 
    senderId: v.string(), 
    senderName: v.string(), 
    avatarSeed: v.string(), 
    text: v.string(), 
    timestamp: v.string(), 
    questId: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});
