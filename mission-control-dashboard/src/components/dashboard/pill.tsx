import clsx from 'clsx';
import type { ReactNode } from 'react';

type PillTone = 'default' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'danger';

interface PillProps {
  children: ReactNode;
  tone?: PillTone;
}

const toneClassMap: Record<PillTone, string> = {
  default: 'border-cyan-200/25 bg-[#132038]/70 text-slate-200',
  high: 'border-rose-300/35 bg-rose-400/15 text-rose-100',
  medium: 'border-amber-300/35 bg-amber-400/15 text-amber-100',
  low: 'border-slate-400/35 bg-slate-500/20 text-slate-200',
  success: 'border-emerald-300/35 bg-emerald-400/15 text-emerald-100',
  warning: 'border-yellow-300/35 bg-yellow-400/15 text-yellow-100',
  danger: 'border-rose-300/35 bg-rose-400/15 text-rose-100'
};

export function Pill({ children, tone = 'default' }: PillProps) {
  return (
    <span
      className={clsx(
        'font-display inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]',
        toneClassMap[tone]
      )}
    >
      {children}
    </span>
  );
}
