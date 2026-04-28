import React from 'react';
import { Calculator } from 'lucide-react';
import { clsx } from 'clsx';

export function Logo({ className, iconSize = 18, textSize = "text-lg" }) {
  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 shadow-inner">
        <Calculator className="text-blue-500" size={iconSize} />
      </div>
      <span className={clsx("font-bold tracking-tight text-slate-100", textSize)}>
        Balanço<span className="text-blue-500 font-extrabold">Digital</span>
      </span>
    </div>
  );
}
