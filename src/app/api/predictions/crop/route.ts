import { NextResponse } from "next/server";
import { db } from "@/db";
import { cropRecommendations, modelMetrics } from "@/db/schema";
import { predictBestCrops, SoilInput } from "@/lib/ml-models";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(cropRecommendations).orderBy(desc(cropRecommendations.createdAt));
    return NextResponse.json({ recommendations: list });
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
      userId = 1,
      farmId = 1,
      soilType = "Loamy",
      nitrogen = 90,
      phosphorus = 60,
      potassium = 80,
      ph = 6.5,
      moisture = 25,
      rainfall = 550,
      temperature = 24,
      humidity = 60,
    } = body;

    const soil: SoilInput = {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture),
      soilType,
    };

    const weather = {
      temperature: Number(temperature),
      rainfall: Number(rainfall),
      humidity: Number(humidity),
    };

    const prediction = predictBestCrops(soil, weather);
    const durationMs = Number((performance.now() - startTime).toFixed(1));

    // Save record
    const saved = await db
      .insert(cropRecommendations)
      .values({
        farmId: farmId ? Number(farmId) : null,
        userId: Number(userId),
        soilType,
        nitrogen: soil.nitrogen,
        phosphorus: soil.phosphorus,
        potassium: soil.potassium,
        ph: soil.ph,
        rainfall: weather.rainfall,
        temperature: weather.temperature,
        humidity: weather.humidity,
        topRecommendation: prediction.topRecommendation,
        confidenceScore: prediction.confidenceScore,
        expectedYieldPerAcre: prediction.expectedYieldPerAcre,
        estimatedRoi: prediction.estimatedRoi,
        waterRequirement: prediction.waterRequirement,
        growingDurationDays: prediction.growingDurationDays,
        rankedAlternatives: JSON.stringify(prediction.rankedAlternatives),
      })
      .returning();

    // Log model telemetry
    await db.insert(modelMetrics).values({
      modelName: "CropRecommender-Ensemble-v3.1",
      taskType: "crop_recommendation",
      inferenceTimeMs: durationMs,
      confidenceScore: prediction.confidenceScore,
      inputSummary: `Soil N:${soil.nitrogen} P:${soil.phosphorus} K:${soil.potassium} pH:${soil.ph} Temp:${weather.temperature}C Rain:${weather.rainfall}mm`,
      predictionResult: `${prediction.topRecommendation} (${Math.round(prediction.confidenceScore * 100)}%)`,
      driftScore: 0.015,
    });

    return NextResponse.json({
      result: prediction,
      record: saved[0],
      inferenceTimeMs: durationMs,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
