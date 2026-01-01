
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .unique();
  },
});

export const getByIds = query({
  args: { uids: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = [];
    for (const uid of args.uids) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_uid", (q) => q.eq("uid", uid))
        .unique();
      if (user) {
        users.push({
          id: user.uid,
          username: user.username,
          avatarSeed: user.avatarSeed,
          rank: user.rank,
          level: user.level,
          xp: user.xp,
          status: 'online' as const,
        });
      }
    }
    return users;
  },
});

export const getLeaderboard = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_xp")
      .order("desc")
      .take(50);
    return users.map((u, index) => ({
      id: u.uid,
      username: u.username,
      avatarSeed: u.avatarSeed,
      xp: u.xp,
      rank: index + 1,
      change: 'same' as const,
    }));
  },
});

export const create = mutation({
  args: {
    uid: v.string(),
    username: v.string(),
    avatarSeed: v.string(),
    initialStats: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("users", {
      uid: args.uid,
      username: args.username,
      avatarSeed: args.avatarSeed,
      friends: [],
      incomingFriendRequests: [],
      outgoingFriendRequests: [],
      journal: [],
      artifacts: [],
      transactions: [],
      skillCooldowns: {},
      ...args.initialStats,
    });
  },
});

export const update = mutation({
  args: { id: v.id("users"), updates: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
  },
});

export const updateSettings = mutation({
  args: { userId: v.id("users"), settings: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { settings: args.settings });
  },
});

export const stopMatchmaking = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userId)).unique();
    if (user) await ctx.db.patch(user._id, { isMatchmaking: false });
  }
});

export const purchaseItem = mutation({
  args: { userId: v.id("users"), itemId: v.string(), price: v.number(), itemName: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.coins < args.price) throw new Error("Insufficient funds");
    
    const tx = {
      id: `tx-${Date.now()}`,
      amount: args.price,
      type: "spend",
      source: args.itemName,
      date: new Date().toLocaleDateString()
    };

    await ctx.db.patch(args.userId, {
      coins: user.coins - args.price,
      inventory: [...user.inventory, args.itemId],
      transactions: [tx, ...(user.transactions || [])]
    });
  }
});

export const craftItem = mutation({
  args: { userId: v.id("users"), recipe: v.any() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    
    const currentMaterials = user.materials || [];
    
    for (const ing of args.recipe.ingredients) {
      const userMat = currentMaterials.find((m: any) => m.id === ing.materialId);
      if (!userMat || userMat.count < ing.count) {
          throw new Error(`Insufficient materials: ${ing.materialId}`);
      }
    }

    const nextMaterials = currentMaterials.map((m: any) => {
      const ing = args.recipe.ingredients.find((i: any) => i.materialId === m.id);
      return ing ? { ...m, count: Math.max(0, m.count - ing.count) } : m;
    });

    await ctx.db.patch(args.userId, {
      materials: nextMaterials,
      inventory: [...user.inventory, args.recipe.resultItemId]
    });
  }
});

export const useSkill = mutation({
  args: { userId: v.id("users"), skill: v.any() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    
    const cooldowns = { ...user.skillCooldowns };
    const now = Date.now();
    
    if (cooldowns[args.skill.id] && now < cooldowns[args.skill.id]) {
        throw new Error("Skill is still recharging.");
    }

    cooldowns[args.skill.id] = now + (args.skill.cooldown * 1000);
    const newBuff = {
      id: `skill-buff-${now}`,
      name: args.skill.name,
      type: args.skill.effectType || 'xp_multiplier',
      value: 1.5,
      expiresAt: now + 60000,
      icon: args.skill.icon
    };
    await ctx.db.patch(args.userId, {
      skillCooldowns: cooldowns,
      activeBuffs: [...(user.activeBuffs || []), newBuff]
    });
  }
});

export const logDiscovery = mutation({
  args: { userId: v.id("users"), discovery: v.any(), image: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    const newArtifact = {
      id: `art-${Date.now()}`,
      ...args.discovery,
      image: args.image,
      discoveredAt: new Date().toLocaleDateString(),
    };
    
    const roleAffinity = { ...user.roleAffinity };
    roleAffinity.Explorer = (roleAffinity.Explorer || 0) + 10;

    await ctx.db.patch(args.userId, {
      xp: (user.xp || 0) + args.discovery.xpValue,
      artifacts: [newArtifact, ...(user.artifacts || [])],
      roleAffinity
    });
  }
});

export const completeQuestStep = mutation({
  args: { userId: v.id("users"), questId: v.string(), rewards: v.any(), journalEntry: v.any(), isFinalStep: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    const updates: any = {
      xp: (user.xp || 0) + args.rewards.xp,
      coins: (user.coins || 0) + args.rewards.coins,
      influence: (user.influence || 0) + (args.rewards.influence || 0),
      level: args.rewards.newLevel,
      journal: [args.journalEntry, ...(user.journal || [])],
    };
    if (args.isFinalStep) {
      updates.completedQuestIds = [...(user.completedQuestIds || []), args.questId];
      updates.activeQuestIds = (user.activeQuestIds || []).filter((id: string) => id !== args.questId);
    }
    await ctx.db.patch(args.userId, updates);
  }
});

export const claimDaily = mutation({
  args: { id: v.id("users"), reward: v.object({ type: v.string(), value: v.number() }) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return;
    const updates: any = { streak: (user.streak || 0) + 1 };
    if (args.reward.type === 'coins') updates.coins = (user.coins || 0) + args.reward.value;
    else updates.xp = (user.xp || 0) + args.reward.value;
    await ctx.db.patch(args.id, updates);
  },
});

export const sendFriendRequest = mutation({
  args: { senderUid: v.string(), receiverUid: v.string() },
  handler: async (ctx, args) => {
    const sender = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.senderUid)).unique();
    const receiver = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.receiverUid)).unique();
    if (!sender || !receiver) return;
    if (!sender.outgoingFriendRequests.includes(args.receiverUid)) {
      await ctx.db.patch(sender._id, { outgoingFriendRequests: [...sender.outgoingFriendRequests, args.receiverUid] });
    }
    if (!receiver.incomingFriendRequests.includes(args.senderUid)) {
      await ctx.db.patch(receiver._id, { incomingFriendRequests: [...receiver.incomingFriendRequests, args.senderUid] });
      await ctx.db.insert("notifications", {
        userId: args.receiverUid,
        title: "Friend Request",
        message: `${sender.username} wants to be friends!`,
        type: "invite",
        timestamp: "Just now",
        read: false,
        actionPayload: { type: "friend_request", senderUid: args.senderUid }
      });
    }
  },
});

export const acceptFriendRequest = mutation({
  args: { userUid: v.string(), requesterUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userUid)).unique();
    const requester = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.requesterUid)).unique();
    if (!user || !requester) return;
    await ctx.db.patch(user._id, {
      friends: [...user.friends, args.requesterUid],
      incomingFriendRequests: user.incomingFriendRequests.filter(uid => uid !== args.requesterUid)
    });
    await ctx.db.patch(requester._id, {
      friends: [...requester.friends, args.userUid],
      outgoingFriendRequests: requester.outgoingFriendRequests.filter(uid => uid !== args.userUid)
    });
  },
});

export const declineFriendRequest = mutation({
  args: { userUid: v.string(), requesterUid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.userUid)).unique();
    const requester = await ctx.db.query("users").withIndex("by_uid", q => q.eq("uid", args.requesterUid)).unique();
    if (!user || !requester) return;
    await ctx.db.patch(user._id, {
      incomingFriendRequests: user.incomingFriendRequests.filter(uid => uid !== args.requesterUid)
    });
    await ctx.db.patch(requester._id, {
      outgoingFriendRequests: requester.outgoingFriendRequests.filter(uid => uid !== args.userUid)
    });
  },
});
