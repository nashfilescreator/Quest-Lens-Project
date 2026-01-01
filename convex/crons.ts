
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Scheduled Jobs (Cron)
 * 
 * These jobs run on a schedule to perform maintenance tasks:
 * - Clean up expired world events
 * - Reset daily streaks for inactive users
 * - Remove old notifications
 * - Clean up abandoned duels
 */

const crons = cronJobs();

// Clean up expired world events - runs every hour
crons.interval(
    "cleanup expired world events",
    { hours: 1 },
    internal.maintenance.cleanupExpiredEvents
);

// Clean up old notifications - runs daily at midnight
crons.daily(
    "cleanup old notifications",
    { hourUTC: 0, minuteUTC: 0 },
    internal.maintenance.cleanupOldNotifications
);

// Clean up abandoned duels - runs every 30 minutes
crons.interval(
    "cleanup abandoned duels",
    { minutes: 30 },
    internal.maintenance.cleanupAbandonedDuels
);

// Check and reset streaks for users who missed their daily - runs daily at 6 AM UTC
crons.daily(
    "check daily streaks",
    { hourUTC: 6, minuteUTC: 0 },
    internal.maintenance.checkDailyStreaks
);

export default crons;
