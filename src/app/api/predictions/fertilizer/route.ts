import { NextResponse } from "next/server";
import { db } from "@/db";
import { fertilizerPlans, modelMetrics } from "@/db/schema";
import { calculateFertilizerPlan } from "@/lib/ml-models";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(fertilizerPlans).orderBy(desc(fertilizerPlans.createdAt));
    return NextResponse.json({ fertilizerPlans: list });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const startTime = performance.now();
  try {
    const body = await req.json();
    const {
      farmId = 1,
      plotId = 1,
      crop = "Roma Tomatoes",
      growthStage = "Fruit Formation",
      nitrogen = 94,
      phosphorus = 68,
      potassium = 135,
      ph = 6.4,
      moisture = 24,
      scheduledDate,
    } = body;

    const soil = {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture),
    };

    const plan = calculateFertilizerPlan(crop, growthStage, soil);
    const durationMs = Number((performance.now() - startTime).toFixed(1));

    const saved = await db
      .insert(fertilizerPlans)
      .values({
        farmId: Number(farmId),
        plotId: plotId ? Number(plotId) : null,
        crop,
        growthStage,
        currentN: soil.nitrogen,
        currentP: soil.phosphorus,
        currentK: soil.potassium,
        recommendedNPKRatio: plan.recommendedNPKRatio,
        fertilizerType: plan.syntheticBlend.name,
        dosageKgPerAcre: plan.syntheticBlend.dosageKgPerAcre,
        organicAlternative: plan.organicAlternative.name,
        applicationMethod: plan.applicationMethod,
        scheduledDate: scheduledDate || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        status: "Planned",
      })
      .returning();

    await db.insert(modelMetrics).values({
      modelName: "NutriBalance-Fertilizer-v2.1",
      taskType: "fertilizer_prescript",
      inferenceTimeMs: durationMs,
      confidenceScore: 0.95,
      inputSummary: `${crop} (${growthStage}) N:${soil.nitrogen} P:${soil.phosphorus} K:${soil.potassium}`,
      predictionResult: `${plan.recommendedNPKRatio} | ${plan.syntheticBlend.dosageKgPerAcre} kg/ac`,
      driftScore: 0.019,
    });

    return NextResponse.json({
      result: plan,
      plan: saved[0],
      inferenceTimeMs: durationMs,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
