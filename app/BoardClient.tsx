"use client";

import { useEffect, useState, useCallback } from "react";

interface Item {
  id: number;
  category: string;
  description: string;
  image_file_id: string | null;
  added_by: string | null;
  status: string;
  created_at: string;
}

const COLUMNS: Record<string, { label: string; neon: string; glow: string }> = {
  backlog:     { label: "Backlog",      neon: "#39ff14", glow: "rgba(57,255,20,0.15)" },
  bug:         { label: "Bugs",         neon: "#ff2d78", glow: "rgba(255,45,120,0.15)" },
  biccs:       { label: "Biccs",        neon: "#bf5fff", glow: "rgba(191,95,255,0.15)" },
  c4:          { label: "C4",           neon: "#00f5ff", glow: "rgba(0,245,255,0.15)" },
  newfeatures: { label: "New Features", neon: "#ffe600", glow: "rgba(255,230,0,0.15)" },
  bangerz:     { label: "Bangerz",      neon: "#ff69b4", glow: "rgba(255,105,180,0.15)" },
};

const COLUMN_ORDER = ["backlog", "bug", "biccs", "c4", "newfeatures", "bangerz"];

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

function ItemCard({ item, neon, onDelete }: { item: Item; neon: string; onDelete: (id: number) => void }) {
  return (
    <div
      style={{
        backgroundColor: "#111120",
        borderLeft: `3px solid ${neon}`,
        boxShadow: `0 0 8px rgba(0,0,0,0.4)`,
        position: "relative",
      }}
      className="rounded-r-lg rounded-bl-lg p-4 mb-3 group"
    >
      <button
        onClick={() => onDelete(item.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "#555577", fontSize: "14px", lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
        title="Delete"
      >
        ✕
      </button>
      <p className="text-gray-100 text-sm font-medium leading-snug mb-3 pr-4">
        {item.description}
      </p>
      <div className="flex items-center justify-between text-xs" style={{ color: "#555577" }}>
        <span style={{ color: neon, opacity: 0.7 }}>{item.added_by ? `@${item.added_by}` : "unknown"}</span>
        <span>{formatDate(item.created_at)}</span>
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, error }: { onConfirm: (password: string) => void; onCancel: () => void; error: boolean }) {
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ backgroundColor: "#0d0d1c", border: "1px solid #1a1a3a", borderRadius: "12px", padding: "28px", width: "320px" }}>
        <h2 className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color: "#ffffff" }}>Delete item?</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%", backgroundColor: "#111120", border: "1px solid #1a1a3a",
              borderRadius: "8px", padding: "10px 12px", color: "#ffffff", fontSize: "14px", outline: "none",
              boxSizing: "border-box",
            }}
          />
          {error && <p style={{ color: "#ff2d78", fontSize: "12px", marginTop: "8px" }}>Incorrect password.</p>}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #1a1a3a", backgroundColor: "transparent", color: "#555577", cursor: "pointer", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ff2d7844", backgroundColor: "#ff2d7822", color: "#ff2d78", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Column({ category, items, onDelete }: { category: string; items: Item[]; onDelete: (id: number) => void }) {
  const col = COLUMNS[category] ?? { label: category, neon: "#ffffff", glow: "rgba(255,255,255,0.1)" };
  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column header */}
      <div
        style={{
          backgroundColor: col.glow,
          border: `1px solid ${col.neon}33`,
          borderBottom: `2px solid ${col.neon}`,
        }}
        className="rounded-t-lg px-4 py-3 flex items-center justify-between"
      >
        <h2
          className="font-bold text-sm tracking-widest uppercase"
          style={{ color: col.neon, textShadow: `0 0 10px ${col.neon}` }}
        >
          {col.label}
        </h2>
        <span
          className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: col.neon, color: "#08080f" }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div
        style={{
          backgroundColor: "#0d0d1c",
          border: `1px solid ${col.neon}22`,
          borderTop: "none",
          minHeight: "8rem",
        }}
        className="rounded-b-lg p-3 flex-1"
      >
        {items.length === 0 ? (
          <p className="text-center py-6 text-xs tracking-widest uppercase" style={{ color: "#333355" }}>
            empty
          </p>
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} neon={col.neon} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}

export default function BoardClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data);
      setLastUpdated(new Date());
    } catch {
      // silently keep last known data
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchItems, 10000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  async function handleDeleteConfirm(password: string) {
    if (deleteTarget === null) return;
    const res = await fetch(`/api/items/${deleteTarget}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget));
      setDeleteTarget(null);
      setDeleteError(false);
    } else {
      setDeleteError(true);
    }
  }

  const grouped = COLUMN_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div style={{ backgroundColor: "#08080f", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {deleteTarget !== null && (
        <DeleteModal
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setDeleteTarget(null); setDeleteError(false); }}
        />
      )}

      {/* Header */}
      <header
        style={{
          backgroundColor: "#0d0d1c",
          borderBottom: "1px solid #1a1a3a",
          backgroundImage: "linear-gradient(135deg, #0d0d1c 0%, #110d1f 100%)",
        }}
        className="px-6 py-4 flex items-center justify-between flex-shrink-0"
      >
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "#ffffff", letterSpacing: "-0.5px" }}
          >
            Gib Meme{" "}
            <span style={{ color: "#bf5fff", textShadow: "0 0 20px #bf5fff" }}>
              Backlog
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats pills */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {COLUMN_ORDER.map((cat) => {
              const col = COLUMNS[cat];
              return (
                <span
                  key={cat}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: `${col.neon}18`, border: `1px solid ${col.neon}44`, color: col.neon }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: col.neon, boxShadow: `0 0 4px ${col.neon}` }} />
                  {col.label}: {grouped[cat].length}
                </span>
              );
            })}
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchItems}
            className="text-xs font-semibold px-4 py-2 rounded-full transition-all"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #333355",
              color: "#555577",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "#555577")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "#333355")}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Board — fills remaining height, scrolls horizontally, scrollbar stays at bottom */}
      <div
        style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: "24px 24px 0 24px" }}
      >
        <div style={{ display: "flex", gap: "20px", height: "100%", paddingBottom: "24px" }}>
          {COLUMN_ORDER.map((cat) => (
            <Column key={cat} category={cat} items={grouped[cat]} onDelete={(id) => { setDeleteTarget(id); setDeleteError(false); }} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-2 flex-shrink-0 text-right">
        <span className="text-xs" style={{ color: "#222244" }}>
          last updated {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
