import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, rightSlot, children }: SectionCardProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#0b1222]/85 p-5 shadow-soft backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_120px_at_20%_0%,rgba(90,170,255,0.14),transparent_60%)] opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent" />
      <div className="pointer-events-none absolute right-5 top-0 h-10 w-px bg-cyan-300/30" />

      <header className="relative mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase text-slate-100">{title}</h2>
          {subtitle ? <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </header>

      <div className="relative">{children}</div>
    </section>
  );
}
