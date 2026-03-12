export const dynamic = "force-dynamic";

import pool from "@/lib/db";
import BoardClient from "./BoardClient";

export default async function Home() {
  let initialItems = [];

  try {
    const result = await pool.query(
      `SELECT id, category, description, image_file_id, added_by, status, created_at
       FROM items
       WHERE status = 'open'
       ORDER BY created_at DESC`
    );
    initialItems = result.rows;
  } catch (err) {
    console.error("DB error on initial load:", err);
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1a1a2e" }}>
      <header
        style={{ backgroundColor: "#0f3460", borderBottom: "1px solid #1e3a6e" }}
        className="px-6 py-4 shadow-lg"
      >
        <h1 className="text-xl font-bold text-white tracking-tight">Gib Meme Board</h1>
        <p className="text-slate-400 text-xs mt-0.5">View-only — updates every 10s</p>
      </header>
      <BoardClient initialItems={initialItems} />
    </main>
  );
}
