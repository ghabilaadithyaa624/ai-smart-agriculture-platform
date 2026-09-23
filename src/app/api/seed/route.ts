import { NextResponse } from "next/server";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export async function POST() {
  try {
    const res = await seedDatabaseIfEmpty();
    return NextResponse.json(res);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to seed database" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await seedDatabaseIfEmpty();
    return NextResponse.json(res);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Failed to seed database" }, { status: 500 });
  }
}
