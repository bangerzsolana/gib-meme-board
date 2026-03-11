import pool from "@/lib/db";

interface Item {
  id: number;
  category: string;
  description: string;
  image_file_id: string | null;
  added_by: string | null;
  status: string;
  created_at: Date;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function ItemCard({ item }: { item: Item }) {
  return (
    <div
      style={{ backgroundColor: "#16213e" }}
      className="rounded-lg p-4 mb-3 border border-slate-700 shadow-md"
    >
      <p className="text-slate-100 text-sm font-medium leading-snug mb-3">
        {item.description}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {item.added_by ? `@${item.added_by}` : "unknown"}
        </span>
        <span>{formatDate(item.created_at)}</span>
      </div>
    </div>
  );
}

function Column({
  title,
  items,
  accentColor,
  countColor,
}: {
  title: string;
  items: Item[];
  accentColor: string;
  countColor: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      {/* Column header */}
      <div
        style={{ backgroundColor: "#0f3460" }}
        className="rounded-t-lg px-4 py-3 flex items-center justify-between mb-1 border border-slate-600"
      >
        <h2
          className="font-bold text-base tracking-wide uppercase"
          style={{ color: accentColor }}
        >
          {title}
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: countColor, color: "#fff" }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div
        style={{ backgroundColor: "#0f1b36" }}
        className="rounded-b-lg p-3 min-h-32 border border-t-0 border-slate-600"
      >
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">
            Nothing here yet
          </p>
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

export default async function Home() {
  let backlogItems: Item[] = [];
  let bugItems: Item[] = [];
  let error: string | null = null;

  try {
    const result = await pool.query<Item>(
      `SELECT id, category, description, image_file_id, added_by, status, created_at
       FROM items
       WHERE status = 'open'
       ORDER BY created_at DESC`
    );
    const rows = result.rows;
    backlogItems = rows.filter((r) => r.category === "backlog");
    bugItems = rows.filter((r) => r.category === "bug");
  } catch (err) {
    console.error("DB error:", err);
    error = "Could not connect to database. Make sure DATABASE_URL is set.";
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1a1a2e" }}>
      {/* Header */}
      <header
        style={{ backgroundColor: "#0f3460", borderBottom: "1px solid #1e3a6e" }}
        className="px-6 py-4 shadow-lg"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Gib Meme Board
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              View-only &mdash; auto-refreshes every 30s
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              Backlog: {backlogItems.length}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
              Bugs: {bugItems.length}
            </span>
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {error ? (
          <div className="rounded-lg bg-red-900 border border-red-700 p-4 text-red-200 text-sm">
            {error}
          </div>
        ) : (
          <div className="flex gap-6">
            <Column
              title="Backlog"
              items={backlogItems}
              accentColor="#4ade80"
              countColor="#16a34a"
            />
            <Column
              title="Bugs"
              items={bugItems}
              accentColor="#f87171"
              countColor="#dc2626"
            />
          </div>
        )}
      </div>
    </main>
  );
}
