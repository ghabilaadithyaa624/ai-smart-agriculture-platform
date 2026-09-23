import { NextResponse } from "next/server";
import { db } from "@/db";
import { yieldPredictions, modelMetrics } from "@/db/schema";
import { predictYield } from "@/lib/ml-models";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(yieldPredictions).orderBy(desc(yieldPredictions.createdAt));
    return NextResponse.json({ yieldPredictions: list });
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
      crop = "Corn (Maize)",
      acreage = 25,
      nitrogen = 95,
      phosphorus = 60,
      potassium = 85,
      ph = 6.5,
      moisture = 24,
      temperature = 23,
      rainfall = 550,
    } = body;

    const soil = {
      nitrogen: Number(nitrogen),
      phosphorus: Number(phosphorus),
      potassium: Number(potassium),
      ph: Number(ph),
      moisture: Number(moisture),
    };

    const weather = {
      temperature: Number(temperature),
      rainfall: Number(rainfall),
    };

    const prediction = predictYield(crop, Number(acreage), soil, weather);
    const durationMs = Number((performance.now() - startTime).toFixed(1));

    const saved = await db
      .insert(yieldPredictions)
      .values({
        farmId: Number(farmId),
        plotId: plotId ? Number(plotId) : null,
        crop,
        acreage: Number(acreage),
        predictedYieldTons: prediction.predictedYieldTons,
        yieldPerAcreTons: prediction.yieldPerAcreTons,
        historicalAverageTons: prediction.historicalAverageTons,
        weatherFactorScore: prediction.weatherFactorScore,
        soilHealthFactorScore: prediction.soilHealthFactorScore,
        riskFactors: prediction.riskFactors.join("; "),
        recommendations: prediction.recommendations.join("; "),
        marketValueEstimate: prediction.marketValueEstimate,
        harvestWindow: prediction.harvestWindow,
      })
      .returning();

    await db.insert(modelMetrics).values({
      modelName: "YieldForecaster-XGBoost-v1.8",
      taskType: "yield_forecasting",
      inferenceTimeMs: durationMs,
      confidenceScore: prediction.weatherFactorScore / 100,
      inputSummary: `${crop} ${acreage}ac | N:${soil.nitrogen} P:${soil.phosphorus} K:${soil.potassium}`,
      predictionResult: `${prediction.predictedYieldTons} Tons ($${prediction.marketValueEstimate.toLocaleString()})`,
      driftScore: 0.031,
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
