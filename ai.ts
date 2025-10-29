import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Simulated AI waste classification
export const classifyWasteImage = action({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // In a real implementation, this would call an AI service
    // For now, we'll simulate classification with random results
    
    const wasteTypes = ["plastic", "organic", "paper", "glass", "metal", "electronic"] as const;
    const randomType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      wasteType: randomType,
      confidence: Math.round(confidence * 100) / 100,
      suggestions: [
        `This appears to be ${randomType} waste`,
        `Confidence: ${Math.round(confidence * 100)}%`,
        `Please verify the classification before logging`,
      ],
    };
  },
});

export const trainClassifier = mutation({
  args: {
    imageId: v.id("_storage"),
    actualType: v.union(
      v.literal("plastic"),
      v.literal("organic"),
      v.literal("paper"),
      v.literal("glass"),
      v.literal("metal"),
      v.literal("electronic")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Store training data
    await ctx.db.insert("wasteClassifierData", {
      imageId: args.imageId,
      actualType: args.actualType,
      features: [], // In real implementation, extract image features
      verified: true,
    });

    return { success: true };
  },
});

export const getClassifierStats = query({
  args: {},
  handler: async (ctx) => {
    const trainingData = await ctx.db.query("wasteClassifierData").collect();
    
    const stats = {
      totalSamples: trainingData.length,
      byType: {} as Record<string, number>,
      accuracy: 0.85 + Math.random() * 0.1, // Simulated accuracy
    };

    for (const data of trainingData) {
      stats.byType[data.actualType] = (stats.byType[data.actualType] || 0) + 1;
    }

    return stats;
  },
});

export const generateInsights = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{ insights: string[]; tips: string[] }> => {
    // ✅ Correct way to query another Convex function
    const entries = await ctx.runQuery(api.waste.getUserWasteEntries, { limit: 100 });

    if (entries.length === 0) {
      return {
        insights: [
          "Start logging your waste to get personalized insights!",
          "Every small action counts towards a greener planet.",
        ],
        tips: [
          "Try to reduce plastic usage by using reusable bags",
          "Compost organic waste to create nutrient-rich soil",
        ],
      };
    }

    const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const totalCo2Saved = entries.reduce((sum, e) => sum + (e.co2Saved || 0), 0);
    const mostCommonType = entries.reduce((acc, e) => {
      acc[e.wasteType] = (acc[e.wasteType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topWasteType = Object.entries(mostCommonType)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "plastic";

    const insights = [
      `You've logged ${totalWeight.toFixed(1)}kg of waste this month - great job tracking!`,
      `Your efforts have saved ${totalCo2Saved.toFixed(1)}kg of CO₂ emissions`,
      `Your most logged waste type is ${topWasteType}`,
    ];

    const tips = [
      "Consider reducing single-use plastics to lower your environmental impact",
      "Organic waste can be composted to create valuable fertilizer",
      "Recycling paper saves trees and reduces landfill waste",
    ];

    return { insights, tips };
  },
});
