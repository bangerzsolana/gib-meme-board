"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Item {
  id: number;
  category: string;
  description: string;
  image_file_id: string | null;
  added_by: string | null;
  status: string;
  created_at: string;
}

const COLUMNS: Record<string, { label: string; accentColor: string; countColor: string }> = {
  backlog:     { label: "Backlog",      accentColor: "#4ade80", countColor: "#16a34a" },
  bug:         { label: "Bugs",         accentColor: "#f87171", countColor: "#dc2626" },
  biccs:       { label: "Biccs",        accentColor: "#c084fc", countColor: "#9333ea" },
  c4:          { label: "C4",           accentColor: "#67e8f9", countColor: "#0891b2" },
  newfeatures: { label: "New Features", accentColor: "#fbbf24", countColor: "#d97706" },
};

const COLUMN_ORDER = ["backlog", "bug", "biccs", "c4", "newfeatures"];

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
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
        <span>{item.added_by ? `@${item.added_by}` : "unknown"}</span>
        <span>{formatDate(item.created_at)}</span>
      </div>
    </div>
  );
}

function Column({ category, items }: { category: string; items: Item[] }) {
  const col = COLUMNS[category] ?? { label: category, accentColor: "#94a3b8", countColor: "#64748b" };
  return (
    <div className="flex-shrink-0 w-72">
      <div
        style={{ backgroundColor: "#0f3460" }}
        className="rounded-t-lg px-4 py-3 flex items-center justify-between border border-slate-600"
      >
        <h2 className="font-bold text-base tracking-wide uppercase" style={{ color: col.accentColor }}>
          {col.label}
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: col.countColor, color: "#fff" }}
        >
          {items.length}
        </span>
      </div>
      <div
        style={{ backgroundColor: "#0f1b36" }}
        className="rounded-b-lg p-3 min-h-32 border border-t-0 border-slate-600"
      >
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">Nothing here yet</p>
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

export default function BoardClient({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const router = useRouter();

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data);
      setLastUpdated(new Date());
    } catch {
      // silently ignore — keep showing last known data
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

  const totalByCategory = COLUMN_ORDER.reduce((acc, cat) => {
    acc[cat] = grouped[cat].length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Stats bar */}
      <div className="flex items-center gap-4">
        {COLUMN_ORDER.map((cat) => {
          const col = COLUMNS[cat];
          return (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: col.accentColor }}></span>
              {col.label}: {totalByCategory[cat]}
            </span>
          );
        })}
        <button
          onClick={fetchItems}
          className="text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded px-3 py-1 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Board */}
      <div className="px-6 py-8 overflow-x-auto">
        <div className="flex gap-5" style={{ minWidth: "max-content" }}>
          {COLUMN_ORDER.map((cat) => (
            <Column key={cat} category={cat} items={grouped[cat]} />
          ))}
        </div>
      </div>

      <p className="px-6 text-xs text-slate-600">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </p>
    </>
  );
}
