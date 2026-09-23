import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const allUsers = await db.select().from(users);
    return NextResponse.json({ users: allUsers });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, phone, organization, location } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ user: existing[0], message: "User already exists" });
    }

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        role: role || "farmer",
        phone: phone || null,
        organization: organization || null,
        location: location || "Salinas Valley, CA",
        avatarUrl: `https://images.pexels.com/photos/13566357/pexels-photo-13566357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=200&w=280`,
      })
      .returning();

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
