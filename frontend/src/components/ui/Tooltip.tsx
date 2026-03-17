"use client";

import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  content: string;
  children?: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children || <Info size={14} className="text-slate-400 hover:text-blue-500 transition-colors" />}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-lg">
          {content}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-b border-r border-slate-200 bg-white" />
        </span>
      )}
    </span>
  );
}

// Pre-defined metric tooltips
export const METRIC_TOOLTIPS: Record<string, string> = {
  MAPE: "Mean Absolute Percentage Error — lower is better",
  RMSE: "Root Mean Squared Error — measures prediction accuracy",
  MAE: "Mean Absolute Error — average prediction deviation",
  "R²": "R-squared — proportion of variance explained (0-1)",
  "Conformal": "Prediction intervals with guaranteed coverage",
  "MILP": "Mixed Integer Linear Programming — optimal scheduling",
};
