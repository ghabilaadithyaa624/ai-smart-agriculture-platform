import { NextResponse } from "next/server";
import { getFarmWeatherData } from "@/lib/weather";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location") || "Salinas Valley, CA";
    const data = getFarmWeatherData(location);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
