import { NextResponse } from "next/server";
import { db } from "@/db";
import { plots, soilRecords, farms } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const farmIdParam = searchParams.get("farmId");

    let query = db.select().from(plots).orderBy(desc(plots.createdAt));
    if (farmIdParam) {
      query = db.select().from(plots).where(eq(plots.farmId, Number(farmIdParam))).orderBy(desc(plots.createdAt)) as typeof query;
    }

    const allPlots = await query;
    const allSoil = await db.select().from(soilRecords).orderBy(desc(soilRecords.testedAt));
    const allFarms = await db.select().from(farms);

    // Join with latest soil record and farm name
    const plotsWithSoil = allPlots.map((plot) => {
      const latestSoil = allSoil.find((s) => s.plotId === plot.id);
      const farm = allFarms.find((f) => f.id === plot.farmId);
      return {
        ...plot,
        farmName: farm ? farm.name : "Unknown Farm",
        latestSoil: latestSoil || null,
      };
    });

    return NextResponse.json({ plots: plotsWithSoil });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { farmId, name, acreage, cropType, variety, plantingDate, expectedHarvestDate, growthStage, healthStatus, soilType } = body;

    if (!farmId || !name || !acreage || !cropType) {
      return NextResponse.json(
        { error: "Farm, plot name, acreage, and crop type are required." },
        { status: 400 }
      );
    }

    const newPlot = await db
      .insert(plots)
      .values({
        farmId: Number(farmId),
        name,
        acreage: Number(acreage),
        cropType,
        variety: variety || "Standard Hybrid",
        plantingDate: plantingDate || new Date().toISOString().slice(0, 10),
        expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        growthStage: growthStage || "Vegetative",
        healthStatus: healthStatus || "Good",
        soilType: soilType || "Loamy",
      })
      .returning();

    return NextResponse.json({ plot: newPlot[0] }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
