import { NextResponse } from "next/server";
import { db } from "@/db";
import { farms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const farmId = Number(id);
    const result = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    return NextResponse.json({ farm: result[0] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const farmId = Number(id);
    const body = await req.json();

    const updated = await db
      .update(farms)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.totalAcreage !== undefined && { totalAcreage: Number(body.totalAcreage) }),
        ...(body.climateZone !== undefined && { climateZone: body.climateZone }),
        ...(body.waterSource !== undefined && { waterSource: body.waterSource }),
        ...(body.status !== undefined && { status: body.status }),
      })
      .where(eq(farms.id, farmId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Farm not found" }, { status: 404 });
    }

    return NextResponse.json({ farm: updated[0] });
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
    const farmId = Number(id);

    await db.delete(farms).where(eq(farms.id, farmId));
    return NextResponse.json({ success: true, message: "Farm deleted successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
