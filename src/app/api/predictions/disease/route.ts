import { NextResponse } from "next/server";
import { db } from "@/db";
import { diseaseScans, modelMetrics, notifications, plots } from "@/db/schema";
import { classifyPlantDisease } from "@/lib/ml-models";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const scans = await db.select().from(diseaseScans).orderBy(desc(diseaseScans.createdAt));
    return NextResponse.json({ scans });
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
      imageUrl = "/images/diseases/tomato-early-blight.jpg",
      cropHint = "Roma Tomato",
      farmId = 1,
      plotId = 1,
      userId = 1,
    } = body;

    const classification = classifyPlantDisease(imageUrl, cropHint);
    const durationMs = Number((performance.now() - startTime).toFixed(1));

    const saved = await db
      .insert(diseaseScans)
      .values({
        farmId: farmId ? Number(farmId) : null,
        plotId: plotId ? Number(plotId) : null,
        userId: Number(userId),
        cropName: classification.cropName,
        imageUrl,
        detectedDisease: classification.detectedDisease,
        confidence: classification.confidence,
        severity: classification.severity,
        affectedArea: classification.affectedArea,
        pathogenType: classification.pathogenType,
        symptoms: classification.symptoms,
        organicRemedy: classification.organicRemedy,
        chemicalRemedy: classification.chemicalRemedy,
        preventiveAction: classification.preventiveAction,
        status: classification.pathogenType === "Healthy" ? "Resolved" : "Detected",
      })
      .returning();

    // If moderate or severe disease, trigger alert
    if (classification.severity === "Moderate" || classification.severity === "Severe") {
      let targetPlotName = "Field plot";
      if (plotId) {
        const foundPlot = await db.select().from(plots).where(eq(plots.id, Number(plotId))).limit(1);
        if (foundPlot.length > 0) targetPlotName = foundPlot[0].name;
      }

      await db.insert(notifications).values({
        userId: Number(userId),
        farmId: farmId ? Number(farmId) : null,
        title: `Disease Outbreak Alert: ${classification.detectedDisease}`,
        message: `High confidence (${Math.round(classification.confidence * 100)}%) detection in ${targetPlotName}. Organic & chemical treatments recommended immediately.`,
        type: classification.severity === "Severe" ? "critical" : "warning",
        category: "disease",
      });
    }

    // Telemetry log
    await db.insert(modelMetrics).values({
      modelName: "AgriVision-DiseaseNet-v2.4",
      taskType: "disease_detection",
      inferenceTimeMs: durationMs,
      confidenceScore: classification.confidence,
      inputSummary: `Image: ${imageUrl.slice(0, 40)} | Crop: ${cropHint}`,
      predictionResult: `${classification.detectedDisease} (${Math.round(classification.confidence * 100)}%)`,
      driftScore: 0.024,
    });

    return NextResponse.json({
      result: classification,
      scan: saved[0],
      inferenceTimeMs: durationMs,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
