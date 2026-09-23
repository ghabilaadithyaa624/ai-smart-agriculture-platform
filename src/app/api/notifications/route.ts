import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(notifications).orderBy(desc(notifications.createdAt));
    return NextResponse.json({ notifications: list });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await db.update(notifications).set({ isRead: true });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, Number(id)));
      return NextResponse.json({ success: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Missing id or markAllAsRead flag" }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, type = "info", category = "general", userId, farmId } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const created = await db
      .insert(notifications)
      .values({
        title,
        message,
        type,
        category,
        userId: userId ? Number(userId) : null,
        farmId: farmId ? Number(farmId) : null,
      })
      .returning();

    return NextResponse.json({ notification: created[0] }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
