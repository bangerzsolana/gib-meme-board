"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="text-xs text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded px-3 py-1 transition-colors"
    >
      ↻ Refresh
    </button>
  );
}
