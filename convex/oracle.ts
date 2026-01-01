
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getHistory = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("oracleMessages")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("asc")
            .take(50);
    },
});

export const addMessage = mutation({
    args: {
        userId: v.string(),
        sender: v.union(v.literal("user"), v.literal("ai")),
        text: v.string(),
        sources: v.optional(v.array(v.object({ uri: v.string(), title: v.string() })))
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("oracleMessages", args);
    },
});

export const clearHistory = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("oracleMessages")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
        for (const msg of messages) {
            await ctx.db.delete(msg._id);
        }
    },
});
