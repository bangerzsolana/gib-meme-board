import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, category, description, image_file_id, image_url, added_by, status, created_at
       FROM items
       WHERE status = 'open'
       ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("API DB error:", err);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
