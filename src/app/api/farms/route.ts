import { NextResponse } from "next/server";
import { db } from "@/db";
import { farms, plots } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const allFarms = await db.select().from(farms).orderBy(desc(farms.createdAt));
    const allPlots = await db.select().from(plots);

    // Attach plot stats to each farm
    const enrichedFarms = allFarms.map((farm) => {
      const farmPlots = allPlots.filter((p) => p.farmId === farm.id);
      return {
        ...farm,
        plotCount: farmPlots.length,
        crops: Array.from(new Set(farmPlots.map((p) => p.cropType))),
        cultivatedAcreage: farmPlots.reduce((sum, p) => sum + p.acreage, 0),
      };
    });

    return NextResponse.json({ farms: enrichedFarms });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, location, latitude, longitude, totalAcreage, climateZone, waterSource, status } = body;

    if (!userId || !name || !location || !totalAcreage) {
      return NextResponse.json(
        { error: "User, farm name, location, and total acreage are required." },
        { status: 400 }
      );
    }

    const newFarm = await db
      .insert(farms)
      .values({
        userId: Number(userId),
        name,
        location,
        latitude: latitude ? Number(latitude) : 36.7468,
        longitude: longitude ? Number(longitude) : -119.7726,
        totalAcreage: Number(totalAcreage),
        climateZone: climateZone || "Temperate / Semi-Arid",
        waterSource: waterSource || "Deep Well & Drip System",
        status: status || "active",
      })
      .returning();

    return NextResponse.json({ farm: newFarm[0] }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
