import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: { category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.category) return NextResponse.json({ error: "category required" }, { status: 400 });

  try {
    await pool.query("UPDATE items SET category = $1 WHERE id = $2", [body.category, id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Patch error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

const DELETE_PASSWORDS = [
  process.env.DELETE_PASSWORD || "jkl;'",
  "jklñ´",
  "jklñ´ç",
];

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!DELETE_PASSWORDS.includes(body.password ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await pool.query(
      "SELECT category, description FROM items WHERE id = $1",
      [id]
    );
    const item = rows[0];

    await pool.query("DELETE FROM items WHERE id = $1", [id]);

    if (item && process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_GROUP_ID) {
      const text = `🗑 Item #${id} deleted from board\n\nCategory: ${item.category}\nDescription: ${item.description}`;
      fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_GROUP_ID, text }),
        }
      ).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
