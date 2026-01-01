
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * File Storage Functions
 * 
 * These functions handle uploading and managing files (images) in Convex storage.
 * Used for profile pictures, quest cover images, and discovery photos.
 */

// Generate upload URL for client-side uploads
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

// Store file reference after upload
export const saveFileReference = mutation({
    args: {
        storageId: v.id("_storage"),
        userId: v.string(),
        fileType: v.union(
            v.literal("profile"),
            v.literal("cover"),
            v.literal("discovery"),
            v.literal("quest")
        ),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const url = await ctx.storage.getUrl(args.storageId);

        // For profile images, update the user directly
        if (args.fileType === "profile") {
            const user = await ctx.db
                .query("users")
                .withIndex("by_uid", (q) => q.eq("uid", args.userId))
                .unique();
            if (user) {
                await ctx.db.patch(user._id, { profileImage: url });
            }
        }

        // For dashboard covers
        if (args.fileType === "cover") {
            const user = await ctx.db
                .query("users")
                .withIndex("by_uid", (q) => q.eq("uid", args.userId))
                .unique();
            if (user) {
                await ctx.db.patch(user._id, { dashboardCover: url });
            }
        }

        return { url, storageId: args.storageId };
    },
});

// Get file URL by storage ID
export const getFileUrl = query({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.storageId);
    },
});

// Delete a file from storage
export const deleteFile = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        await ctx.storage.delete(args.storageId);
    },
});

// Get all files for a user (useful for cleanup)
export const getUserFiles = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_uid", (q) => q.eq("uid", args.userId))
            .unique();

        if (!user) return null;

        return {
            profileImage: user.profileImage,
            dashboardCover: user.dashboardCover,
        };
    },
});
