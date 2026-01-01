
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const add = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    timestamp: v.string(),
    actionPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});

export const clearAll = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const n of notifs) {
      await ctx.db.delete(n._id);
    }
  },
});
