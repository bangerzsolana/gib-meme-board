export const dynamic = "force-dynamic";

import pool from "@/lib/db";
import BoardClient from "./BoardClient";

export default async function Home() {
  let initialItems = [];
  try {
    const result = await pool.query(
      `SELECT id, category, description, image_file_id, added_by, status, created_at
       FROM items WHERE status = 'open' ORDER BY created_at DESC`
    );
    initialItems = result.rows;
  } catch (err) {
    console.error("DB error on initial load:", err);
  }

  return <BoardClient initialItems={initialItems} />;
}
