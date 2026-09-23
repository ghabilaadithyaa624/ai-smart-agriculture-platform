import { NextResponse } from "next/server";
import { db } from "@/db";
import { soilRecords, plots, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plotIdParam = searchParams.get("plotId");

    let query = db.select().from(soilRecords).orderBy(desc(soilRecords.testedAt));
    if (plotIdParam) {
      query = db.select().from(soilRecords).where(eq(soilRecords.plotId, Number(plotIdParam))).orderBy(desc(soilRecords.testedAt)) as typeof query;
    }

    const records = await query;
    const allPlots = await db.select().from(plots);

    const enriched = records.map((record) => {
      const plot = allPlots.find((p) => p.id === record.plotId);
      return {
        ...record,
        plotName: plot ? plot.name : `Plot #${record.plotId}`,
        cropType: plot ? plot.cropType : "Unknown",
        farmId: plot ? plot.farmId : null,
      };
    });

    return NextResponse.json({ soilRecords: enriched });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      plotId,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      moisture,
      organicMatter,
      electricalConductivity,
      temperature,
      notes,
    } = body;

    if (!plotId || nitrogen === undefined || phosphorus === undefined || potassium === undefined || ph === undefined || moisture === undefined) {
      return NextResponse.json(
        { error: "Plot ID, N, P, K, pH, and moisture are required." },
        { status: 400 }
      );
    }

    const newRecord = await db
      .insert(soilRecords)
      .values({
        plotId: Number(plotId),
        nitrogen: Number(nitrogen),
        phosphorus: Number(phosphorus),
        potassium: Number(potassium),
        ph: Number(ph),
        moisture: Number(moisture),
        organicMatter: organicMatter ? Number(organicMatter) : 3.5,
        electricalConductivity: electricalConductivity ? Number(electricalConductivity) : 1.2,
        temperature: temperature ? Number(temperature) : 21.0,
        notes: notes || "Standard periodic agronomic lab test.",
      })
      .returning();

    // Check if soil moisture or pH warrants an automatic notification alert
    const targetPlot = await db.select().from(plots).where(eq(plots.id, Number(plotId))).limit(1);
    if (targetPlot.length > 0) {
      if (Number(moisture) < 20.0) {
        await db.insert(notifications).values({
          farmId: targetPlot[0].farmId,
          title: `Low Soil Moisture Alert: ${targetPlot[0].name}`,
          message: `Soil moisture dropped to ${moisture}% for ${targetPlot[0].cropType}. Immediate drip irrigation cycle suggested.`,
          type: "warning",
          category: "soil",
        });
      }
      if (Number(ph) < 5.8 || Number(ph) > 7.5) {
        await db.insert(notifications).values({
          farmId: targetPlot[0].farmId,
          title: `Soil pH Imbalance in ${targetPlot[0].name}`,
          message: `Soil pH measured at ${ph}. Nutrient availability may be locked out. Agricultural lime or elemental sulfur recommended.`,
          type: "info",
          category: "soil",
        });
      }
    }

    return NextResponse.json({ soilRecord: newRecord[0] }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
