
import { internalMutation } from "./_generated/server";

/**
 * Maintenance Functions (Internal)
 * 
 * These are internal functions called by cron jobs.
 * They handle cleanup and maintenance tasks.
 */

// Clean up expired world events
export const cleanupExpiredEvents = internalMutation({
    handler: async (ctx) => {
        const now = Date.now();
        const expiredEvents = await ctx.db
            .query("worldEvents")
            .filter((q) => q.lt(q.field("expiresAt"), now))
            .collect();

        for (const event of expiredEvents) {
            await ctx.db.patch(event._id, { isActive: false });
        }

        return { cleaned: expiredEvents.length };
    },
});

// Clean up old notifications (older than 30 days)
export const cleanupOldNotifications = internalMutation({
    handler: async (ctx) => {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        // Get all notifications and filter by timestamp
        // Note: In production, you'd want a proper timestamp field indexed
        const allNotifications = await ctx.db.query("notifications").collect();

        let deleted = 0;
        for (const notif of allNotifications) {
            // Parse timestamp if it's a string like "Just now" or ISO date
            const created = notif._creationTime;
            if (created && created < thirtyDaysAgo) {
                await ctx.db.delete(notif._id);
                deleted++;
            }
        }

        return { deleted };
    },
});

// Clean up abandoned duels (active duels older than 1 hour)
export const cleanupAbandonedDuels = internalMutation({
    handler: async (ctx) => {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        const activeDuels = await ctx.db
            .query("duels")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        let cleaned = 0;
        for (const duel of activeDuels) {
            if (duel._creationTime < oneHourAgo) {
                await ctx.db.patch(duel._id, {
                    status: "expired",
                    winner: undefined
                });
                cleaned++;
            }
        }

        return { cleaned };
    },
});

// Check daily streaks and reset for inactive users
export const checkDailyStreaks = internalMutation({
    handler: async (ctx) => {
        const now = Date.now();
        const fortyEightHoursAgo = now - (48 * 60 * 60 * 1000);

        // Find users with streaks who haven't been active in 48 hours
        const inactiveUsers = await ctx.db
            .query("users")
            .collect(); // In production, we'd want an index on lastActiveAt

        let reset = 0;
        for (const user of inactiveUsers) {
            if (user.streak > 0 && (!user.lastActiveAt || user.lastActiveAt < fortyEightHoursAgo)) {
                await ctx.db.patch(user._id, { streak: 0 });
                reset++;
            }
        }

        return { usersChecked: inactiveUsers.length, streaksReset: reset };
    },
});

// Utility: Clear all user matchmaking flags (admin function)
export const clearAllMatchmaking = internalMutation({
    handler: async (ctx) => {
        const matchmakingUsers = await ctx.db
            .query("users")
            .withIndex("by_matchmaking", (q) => q.eq("isMatchmaking", true))
            .collect();

        for (const user of matchmakingUsers) {
            await ctx.db.patch(user._id, { isMatchmaking: false });
        }

        return { cleared: matchmakingUsers.length };
    },
});
