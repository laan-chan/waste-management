import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRandomEcoFact = query({
  args: {
    forChildren: v.optional(v.boolean()),
    category: v.optional(v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("general")
    )),
  },
  handler: async (ctx, args) => {
    let facts;
    
    if (args.forChildren !== undefined && args.category) {
      facts = await ctx.db
        .query("ecoFacts")
        .withIndex("by_audience", (q) => q.eq("forChildren", args.forChildren!))
        .filter((q) => q.eq(q.field("category"), args.category))
        .collect();
    } else if (args.forChildren !== undefined) {
      facts = await ctx.db
        .query("ecoFacts")
        .withIndex("by_audience", (q) => q.eq("forChildren", args.forChildren!))
        .collect();
    } else if (args.category) {
      facts = await ctx.db
        .query("ecoFacts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      facts = await ctx.db.query("ecoFacts").collect();
    }
    
    if (facts.length === 0) return null;
    
    return facts[Math.floor(Math.random() * facts.length)];
  },
});

export const initializeEcoFacts = mutation({
  args: {},
  handler: async (ctx) => {
    const existingFacts = await ctx.db.query("ecoFacts").collect();
    if (existingFacts.length > 0) return "Eco facts already initialized";

    const facts = [
      // General facts for adults
      {
        fact: "Recycling one aluminum can saves enough energy to power a TV for 3 hours",
        category: "metal" as const,
        forChildren: false,
        icon: "⚡",
      },
      {
        fact: "It takes 450 years for a plastic bottle to decompose in a landfill",
        category: "plastic" as const,
        forChildren: false,
        icon: "🍾",
      },
      {
        fact: "Composting organic waste can reduce methane emissions by up to 50%",
        category: "organic" as const,
        forChildren: false,
        icon: "🌱",
      },
      {
        fact: "Recycling one ton of paper saves 17 trees and 7,000 gallons of water",
        category: "paper" as const,
        forChildren: false,
        icon: "🌳",
      },
      {
        fact: "Glass can be recycled infinitely without losing quality",
        category: "glass" as const,
        forChildren: false,
        icon: "♻️",
      },

      // Fun facts for children
      {
        fact: "Recycling 1 plastic bottle saves enough energy to power a light bulb for 3 hours! 💡",
        category: "plastic" as const,
        forChildren: true,
        icon: "💡",
      },
      {
        fact: "Banana peels and apple cores can become super soil for plants! 🍌🍎",
        category: "organic" as const,
        forChildren: true,
        icon: "🌱",
      },
      {
        fact: "Old newspapers can become new books and notebooks! 📚",
        category: "paper" as const,
        forChildren: true,
        icon: "📚",
      },
      {
        fact: "Glass jars can be melted and made into new jars forever! ✨",
        category: "glass" as const,
        forChildren: true,
        icon: "✨",
      },
      {
        fact: "Aluminum cans can become new cans in just 60 days! 🥤",
        category: "metal" as const,
        forChildren: true,
        icon: "🥤",
      },
      {
        fact: "Every piece of trash you sort helps save animals and their homes! 🐻",
        category: "general" as const,
        forChildren: true,
        icon: "🐻",
      },
      {
        fact: "When you recycle, you're like a superhero saving the planet! 🦸‍♀️",
        category: "general" as const,
        forChildren: true,
        icon: "🦸‍♀️",
      },
    ];

    for (const fact of facts) {
      await ctx.db.insert("ecoFacts", fact);
    }
    
    return "Eco facts initialized successfully";
  },
});
