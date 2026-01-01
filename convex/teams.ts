
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const teams = await ctx.db.query("teams").collect();
    if (!args.userId) return teams;
    
    return teams.map(team => ({
      ...team,
      isPending: team.joinRequests?.some(r => r.userId === args.userId) || false
    }));
  },
});

export const getById = query({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: { team: v.any() },
  handler: async (ctx, args) => {
    const teamId = await ctx.db.insert("teams", {
      ...args.team,
      joinRequests: [],
      members: args.team.members || [],
      rank: args.team.rank || 999,
      totalXp: args.team.totalXp || 0,
      privacy: args.team.privacy || 'apply'
    });
    
    const leaderId = args.team.members?.[0]?.id;
    if (leaderId) {
      const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", leaderId)).unique();
      if (user) await ctx.db.patch(user._id, { currentTeamId: teamId });
    }
    
    return teamId;
  },
});

export const requestToJoin = mutation({
  args: { teamId: v.id("teams"), userId: v.string(), username: v.string(), avatar: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return;
    const requests = team.joinRequests || [];
    if (requests.some(r => r.userId === args.userId)) return;
    
    await ctx.db.patch(args.teamId, {
      joinRequests: [...requests, {
        userId: args.userId,
        username: args.username,
        avatar: args.avatar,
        timestamp: new Date().toISOString()
      }]
    });
  }
});

export const cancelRequest = mutation({
  args: { teamId: v.id("teams"), userId: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return;
    await ctx.db.patch(args.teamId, {
      joinRequests: (team.joinRequests || []).filter(r => r.userId !== args.userId)
    });
  }
});

export const acceptJoinRequest = mutation({
  args: { teamId: v.id("teams"), userId: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return;
    const request = team.joinRequests.find(r => r.userId === args.userId);
    if (!request) return;

    const nextMembers = [...team.members, { 
      id: request.userId, 
      name: request.username, 
      avatar: request.avatar, 
      role: 'member' 
    }];
    
    await ctx.db.patch(args.teamId, {
      members: nextMembers,
      joinRequests: team.joinRequests.filter(r => r.userId !== args.userId)
    });

    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userId)).unique();
    if (user) await ctx.db.patch(user._id, { currentTeamId: args.teamId });
  }
});

export const declineJoinRequest = mutation({
  args: { teamId: v.id("teams"), userId: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return;
    await ctx.db.patch(args.teamId, {
      joinRequests: team.joinRequests.filter(r => r.userId !== args.userId)
    });
  }
});

export const join = mutation({
  args: { teamId: v.id("teams"), userId: v.string(), username: v.string(), avatar: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return;
    if (team.members.some(m => m.id === args.userId)) return;
    
    if (team.privacy === 'open') {
        const members = [...team.members, { id: args.userId, name: args.username, avatar: args.avatar, role: 'member' }];
        await ctx.db.patch(args.teamId, { members });
        const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userId)).unique();
        if (user) await ctx.db.patch(user._id, { currentTeamId: args.teamId });
    } else {
        const requests = team.joinRequests || [];
        if (requests.some(r => r.userId === args.userId)) return;
        await ctx.db.patch(args.teamId, {
          joinRequests: [...requests, {
            userId: args.userId,
            username: args.username,
            avatar: args.avatar,
            timestamp: new Date().toISOString()
          }]
        });
    }
  },
});

export const leave = mutation({
  args: { teamId: v.id("teams"), userId: v.string() },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return;
    const members = team.members.filter(m => m.id !== args.userId);
    await ctx.db.patch(args.teamId, { members });
    
    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userId)).unique();
    if (user) {
      await ctx.db.patch(user._id, { currentTeamId: undefined });
    }
  },
});

export const updateMission = mutation({
  args: { teamId: v.id("teams"), mission: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.teamId, { activeMission: args.mission });
  },
});

export const addProgress = mutation({
  args: { 
    teamId: v.id("teams"), 
    userId: v.string(), // The UID of the contributor
    amount: v.number() 
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team || !team.activeMission) return;
    
    // Update Team Progress
    const mission = { ...team.activeMission };
    mission.currentAmount += args.amount;
    await ctx.db.patch(args.teamId, { activeMission: mission });

    // Atomic User Reward
    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userId)).unique();
    if (user) {
      await ctx.db.patch(user._id, {
        xp: user.xp + 100,
        coins: user.coins + 25,
        influence: user.influence + 10
      });
    }
  },
});
