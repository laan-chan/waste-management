import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const getUserNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("reminder"),
      v.literal("achievement"),
      v.literal("alert"),
      v.literal("tip")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      read: false,
    });
  },
});

export const sendDailyReminders = action({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(api.notifications.getActiveUsers);
    
    const reminders = [
      "Don't forget to segregate your waste today! 🌱",
      "Today is a great day to make a difference - log your waste! ♻️",
      "Remember: Every piece of waste sorted helps our planet! 🌍",
    ];

    for (const user of users) {
      if (user.preferences.notifications) {
        const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
        
        await ctx.runMutation(api.notifications.createNotification, {
          userId: user.userId,
          title: "Daily Reminder",
          message: randomReminder,
          type: "reminder",
        });
      }
    }
  },
});

export const getActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    const users = [];
    
    for (const profile of profiles) {
      const user = await ctx.db.get(profile.userId);
      if (user) {
        users.push({ ...user, ...profile });
      }
    }
    
    return users;
  },
});
