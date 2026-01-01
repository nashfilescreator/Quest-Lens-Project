
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("worldEvents")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const contribute = mutation({
  args: { eventId: v.id("worldEvents"), amount: v.number() },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) return;
    const newHealth = Math.min(event.targetHealth, event.currentHealth + args.amount);
    await ctx.db.patch(args.eventId, { 
        currentHealth: newHealth,
        isActive: newHealth < event.targetHealth
    });
  },
});
