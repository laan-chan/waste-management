import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("resident"), v.literal("admin")),
    mode: v.union(v.literal("adult"), v.literal("child")),
    totalPoints: v.number(),
    level: v.number(),
    preferences: v.object({
      notifications: v.boolean(),
      theme: v.union(v.literal("light"), v.literal("dark")),
    }),
  }).index("by_user", ["userId"]),

  wasteEntries: defineTable({
    userId: v.id("users"),
    wasteType: v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("electronic")
    ),
    weight: v.number(),
    points: v.number(),
    co2Saved: v.number(),
    landfillReduced: v.number(),
    imageId: v.optional(v.id("_storage")),
    aiClassified: v.boolean(),
    aiConfidence: v.optional(v.number()),
    location: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_type", ["wasteType"]),

  rewards: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    points: v.number(),
    category: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("milestone"),
      v.literal("special")
    ),
    claimed: v.boolean(),
  }).index("by_user", ["userId"])
    .index("by_category", ["category"]),

  bins: defineTable({
    location: v.string(),
    wasteType: v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("electronic")
    ),
    capacity: v.number(),
    currentLevel: v.number(),
    lastCollection: v.number(),
    sensorId: v.string(),
    status: v.union(
      v.literal("normal"),
      v.literal("warning"),
      v.literal("full"),
      v.literal("maintenance")
    ),
  }).index("by_location", ["location"])
    .index("by_status", ["status"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("reminder"),
      v.literal("achievement"),
      v.literal("alert"),
      v.literal("tip")
    ),
    read: v.boolean(),
    scheduledFor: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_type", ["type"]),

  ecoFacts: defineTable({
    fact: v.string(),
    category: v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("general")
    ),
    forChildren: v.boolean(),
    icon: v.string(),
  }).index("by_category", ["category"])
    .index("by_audience", ["forChildren"]),

  wasteClassifierData: defineTable({
    imageId: v.id("_storage"),
    actualType: v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("electronic")
    ),
    predictedType: v.optional(v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("electronic")
    )),
    confidence: v.optional(v.number()),
    features: v.array(v.number()),
    verified: v.boolean(),
  }).index("by_type", ["actualType"]),

  analytics: defineTable({
    userId: v.optional(v.id("users")),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    wasteType: v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("electronic"),
      v.literal("total")
    ),
    totalWeight: v.number(),
    totalPoints: v.number(),
    co2Saved: v.number(),
    landfillReduced: v.number(),
    prediction: v.optional(v.number()),
    trend: v.union(v.literal("increasing"), v.literal("decreasing"), v.literal("stable")),
  }).index("by_user_period", ["userId", "period"])
    .index("by_period", ["period"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
