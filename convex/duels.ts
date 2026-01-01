
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const startMatchmaking = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userId)).unique();
    if (!user) return;
    
    // Check for available opponent
    const opponent = await ctx.db
      .query("users")
      .withIndex("by_matchmaking", q => q.eq("isMatchmaking", true))
      .filter(q => q.neq(q.field("uid"), args.userId))
      .first();

    if (opponent) {
      // Found a match!
      await ctx.db.patch(opponent._id, { isMatchmaking: false });
      return await ctx.db.insert("duels", {
        player1: args.userId,
        player2: opponent.uid,
        status: "active",
        quest: { title: "Flash Target", imagePrompt: "A colorful container", difficulty: "HARD" },
      });
    } else {
      // Join queue
      await ctx.db.patch(user._id, { isMatchmaking: true });
      return null;
    }
  }
});

export const getActiveDuel = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("duels")
      .filter(q => q.and(
        q.or(q.eq(q.field("player1"), args.userId), q.eq(q.field("player2"), args.userId)),
        q.eq(q.field("status"), "active")
      ))
      .first();
  }
});

export const completeDuel = mutation({
  args: { duelId: v.id("duels"), winnerId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.duelId, {
      status: "completed",
      winner: args.winnerId,
    });
  }
});
