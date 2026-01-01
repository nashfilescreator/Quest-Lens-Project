
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

export const share = mutation({
  args: { post: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", args.post);
  },
});

export const like = mutation({
  args: { postId: v.id("posts"), userId: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;
    const likedBy = post.likedBy || [];
    const index = likedBy.indexOf(args.userId);
    if (index === -1) {
      likedBy.push(args.userId);
      await ctx.db.patch(args.postId, { likedBy, likes: post.likes + 1 });
    } else {
      likedBy.splice(index, 1);
      await ctx.db.patch(args.postId, { likedBy, likes: post.likes - 1 });
    }
  },
});

// Fix: Added comment mutation
export const comment = mutation({
  args: { postId: v.id("posts"), username: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;
    const comments = post.comments || [];
    comments.push({
      id: `c-${Date.now()}`,
      username: args.username,
      text: args.text,
      timeAgo: "Just now",
    });
    await ctx.db.patch(args.postId, { comments });
  },
});
