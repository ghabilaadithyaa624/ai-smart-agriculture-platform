import { NextResponse } from "next/server";
import { db } from "@/db";
import { plots } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plotId = Number(id);
    const body = await req.json();

    const updated = await db
      .update(plots)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.acreage !== undefined && { acreage: Number(body.acreage) }),
        ...(body.cropType !== undefined && { cropType: body.cropType }),
        ...(body.variety !== undefined && { variety: body.variety }),
        ...(body.plantingDate !== undefined && { plantingDate: body.plantingDate }),
        ...(body.expectedHarvestDate !== undefined && { expectedHarvestDate: body.expectedHarvestDate }),
        ...(body.growthStage !== undefined && { growthStage: body.growthStage }),
        ...(body.healthStatus !== undefined && { healthStatus: body.healthStatus }),
        ...(body.soilType !== undefined && { soilType: body.soilType }),
      })
      .where(eq(plots.id, plotId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    return NextResponse.json({ plot: updated[0] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plotId = Number(id);

    await db.delete(plots).where(eq(plots.id, plotId));
    return NextResponse.json({ success: true, message: "Plot deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
