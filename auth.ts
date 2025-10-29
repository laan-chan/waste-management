import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    // Get user profile data
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    // Return user with profile data if it exists
    if (profile) {
      const { _id: profileId, userId: profileUserId, ...profileData } = profile;
      return { ...user, ...profileData };
    }
    
    // Return user with default profile values if no profile exists
    return { 
      ...user, 
      role: "resident" as const,
      mode: "adult" as const,
      totalPoints: 0,
      level: 1,
      preferences: {
        notifications: true,
        theme: "light" as const,
      },
    };
  },
});

// Separate mutation to create user profile
export const createUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (existingProfile) {
      return existingProfile;
    }
    
    // Create new profile
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: "resident",
      mode: "adult",
      totalPoints: 0,
      level: 1,
      preferences: {
        notifications: true,
        theme: "light",
      },
    });
    
    return await ctx.db.get(profileId);
  },
});
