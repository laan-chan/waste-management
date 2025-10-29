import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBinStatus = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bins").collect();
  },
});

export const updateBinLevel = mutation({
  args: {
    binId: v.id("bins"),
    currentLevel: v.number(),
  },
  handler: async (ctx, args) => {
    const bin = await ctx.db.get(args.binId);
    if (!bin) throw new Error("Bin not found");

    const percentage = (args.currentLevel / bin.capacity) * 100;
    let status: "normal" | "warning" | "full" | "maintenance" = "normal";

    if (percentage >= 90) status = "full";
    else if (percentage >= 75) status = "warning";

    await ctx.db.patch(args.binId, {
      currentLevel: args.currentLevel,
      status,
    });

    // Create alert if bin is full
    if (status === "full") {
      // In a real app, this would trigger admin notifications
      console.log(`Bin at ${bin.location} is full and needs collection`);
    }

    return { status, percentage };
  },
});

export const initializeBins = mutation({
  args: {},
  handler: async (ctx) => {
    const existingBins = await ctx.db.query("bins").collect();
    if (existingBins.length > 0) return;

    const locations = [
      "Main Street Park",
      "Community Center",
      "Shopping Mall",
      "Residential Area A",
      "Residential Area B",
      "School Campus",
    ];

    const wasteTypes = ["plastic", "organic", "paper", "glass", "metal"] as const;

    for (const location of locations) {
      for (const wasteType of wasteTypes) {
        await ctx.db.insert("bins", {
          location,
          wasteType,
          capacity: 100,
          currentLevel: Math.floor(Math.random() * 60), // Random initial level
          lastCollection: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          sensorId: `${location.replace(/\s+/g, '_')}_${wasteType}`,
          status: "normal",
        });
      }
    }
  },
});
