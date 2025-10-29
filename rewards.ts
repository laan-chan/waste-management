import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserRewards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("rewards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const claimReward = mutation({
  args: {
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const reward = await ctx.db.get(args.rewardId);
    if (!reward || reward.userId !== userId) {
      throw new Error("Reward not found");
    }

    if (reward.claimed) {
      throw new Error("Reward already claimed");
    }

    await ctx.db.patch(args.rewardId, { claimed: true });
    return reward;
  },
});

export const checkAchievements = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const entries = await ctx.db
      .query("wasteEntries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalEntries = entries.length;
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);

    const achievements = [
      {
        condition: totalEntries >= 1,
        title: "First Steps",
        description: "Logged your first waste entry!",
        points: 50,
        category: "milestone" as const,
      },
      {
        condition: totalEntries >= 10,
        title: "Getting Started",
        description: "Logged 10 waste entries!",
        points: 100,
        category: "milestone" as const,
      },
      {
        condition: totalEntries >= 50,
        title: "Eco Warrior",
        description: "Logged 50 waste entries!",
        points: 250,
        category: "milestone" as const,
      },
      {
        condition: totalWeight >= 10,
        title: "10kg Milestone",
        description: "Sorted 10kg of waste!",
        points: 200,
        category: "milestone" as const,
      },
      {
        condition: totalPoints >= 1000,
        title: "Point Master",
        description: "Earned 1000 points!",
        points: 300,
        category: "milestone" as const,
      },
    ];

    for (const achievement of achievements) {
      if (achievement.condition) {
        // Check if reward already exists
        const existingReward = await ctx.db
          .query("rewards")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .filter((q) => q.eq(q.field("title"), achievement.title))
          .first();

        if (!existingReward) {
          await ctx.db.insert("rewards", {
            userId: args.userId,
            title: achievement.title,
            description: achievement.description,
            points: achievement.points,
            category: achievement.category,
            claimed: false,
          });

          // Create notification
          await ctx.db.insert("notifications", {
            userId: args.userId,
            title: "Achievement Unlocked!",
            message: `You earned "${achievement.title}" - ${achievement.description}`,
            type: "achievement",
            read: false,
          });
        }
      }
    }
  },
});
