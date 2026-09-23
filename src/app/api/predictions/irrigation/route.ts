import { NextResponse } from "next/server";
import { db } from "@/db";
import { irrigationSchedules, modelMetrics } from "@/db/schema";
import { calculateSmartIrrigation } from "@/lib/ml-models";
import { getFarmWeatherData } from "@/lib/weather";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(irrigationSchedules).orderBy(desc(irrigationSchedules.createdAt));
    return NextResponse.json({ schedules: list });
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
      plotAcreage = 25,
      soilMoisture = 22.5,
      locationName = "Salinas Valley, CA",
    } = body;

    const farmWeather = getFarmWeatherData(locationName);
    const weatherData = {
      temperature: farmWeather.temperature,
      humidity: farmWeather.humidity,
      rainfall: farmWeather.rainfallMm,
      windSpeed: farmWeather.windSpeedKmH,
      forecast: farmWeather.forecast.map((f) => ({
        day: f.day,
        tempMax: f.tempMax,
        tempMin: f.tempMin,
        condition: f.condition,
        rainProb: f.rainProb,
        rainMm: f.rainMm,
        humidity: f.humidity,
      })),
    };
    const result = calculateSmartIrrigation(Number(plotAcreage), Number(soilMoisture), weatherData);
    const durationMs = Number((performance.now() - startTime).toFixed(1));

    const saved = await db
      .insert(irrigationSchedules)
      .values({
        farmId: Number(farmId),
        plotId: Number(plotId),
        waterVolumeLiters: result.waterVolumeLiters,
        durationMinutes: result.durationMinutes,
        method: result.method,
        soilMoistureBefore: result.soilMoistureBefore,
        et0Reference: result.et0Reference,
        rainForecastMm: result.rainForecastMm,
        recommendedTime: result.recommendedTime,
        status: result.status,
      })
      .returning();

    await db.insert(modelMetrics).values({
      modelName: "HydroSmart-ET0-v2.0",
      taskType: "irrigation_optim",
      inferenceTimeMs: durationMs,
      confidenceScore: 0.98,
      inputSummary: `Plot: ${plotAcreage}ac | SoilMoisture: ${soilMoisture}% | ET0: ${result.et0Reference}mm`,
      predictionResult: `${result.waterVolumeLiters.toLocaleString()} L (${result.durationMinutes} min)`,
      driftScore: 0.012,
    });

    return NextResponse.json({
      result,
      schedule: saved[0],
      inferenceTimeMs: durationMs,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
