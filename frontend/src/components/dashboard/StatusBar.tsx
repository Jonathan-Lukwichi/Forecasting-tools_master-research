/**
 * Pipeline status indicators — shows which stages have data.
 */
"use client";

import { Check, Circle } from "lucide-react";

interface StatusItem {
  label: string;
  active: boolean;
  detail?: string;
}

export default function StatusBar({ items }: { items: StatusItem[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          {item.active ? (
            <Check size={14} className="text-emerald-400" />
          ) : (
            <Circle size={14} className="text-slate-600" />
          )}
          <span className={item.active ? "text-slate-300" : "text-slate-500"}>
            {item.label}
            {item.detail && (
              <span className="ml-1 text-slate-500">({item.detail})</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
