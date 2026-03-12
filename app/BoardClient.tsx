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
};

const COLUMN_ORDER = ["backlog", "bug", "biccs", "c4", "newfeatures"];

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

function ItemCard({ item, neon }: { item: Item; neon: string }) {
  return (
    <div
      style={{
        backgroundColor: "#111120",
        borderLeft: `3px solid ${neon}`,
        boxShadow: `0 0 8px rgba(0,0,0,0.4)`,
      }}
      className="rounded-r-lg rounded-bl-lg p-4 mb-3"
    >
      <p className="text-gray-100 text-sm font-medium leading-snug mb-3">
        {item.description}
      </p>
      <div className="flex items-center justify-between text-xs" style={{ color: "#555577" }}>
        <span style={{ color: neon, opacity: 0.7 }}>{item.added_by ? `@${item.added_by}` : "unknown"}</span>
        <span>{formatDate(item.created_at)}</span>
      </div>
    </div>
  );
}

function Column({ category, items }: { category: string; items: Item[] }) {
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
          items.map((item) => <ItemCard key={item.id} item={item} neon={col.neon} />)
        )}
      </div>
    </div>
  );
}

export default function BoardClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

  const grouped = COLUMN_ORDER.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <div style={{ backgroundColor: "#08080f", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

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
          <p className="text-xs mt-0.5 tracking-widest uppercase" style={{ color: "#333355" }}>
            live · updates every 10s
          </p>
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
              backgroundColor: "#bf5fff22",
              border: "1px solid #bf5fff66",
              color: "#bf5fff",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#bf5fff33")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#bf5fff22")}
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
            <Column key={cat} category={cat} items={grouped[cat]} />
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
