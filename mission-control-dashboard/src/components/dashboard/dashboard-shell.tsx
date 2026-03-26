import type { ComponentType } from 'react';

import { ActivitySquare, Bell, Cpu, Shield, Zap } from 'lucide-react';

import { getDashboardSnapshot } from '@/lib/dashboard-source';

import { CleanupQueue } from './cleanup-queue';
import { JobsSchool } from './jobs-school';
import { OpenClawStatus } from './openclaw-status';
import { PriorityInbox } from './priority-inbox';
import { QuickActions } from './quick-actions';
import { TasksAgents } from './tasks-agents';

export async function DashboardShell() {
  const dashboardData = await getDashboardSnapshot();

  const criticalCount = dashboardData.priorityInbox.filter((item) => item.priority === 'high').length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1500px] px-6 pb-8 pt-7 lg:px-8">
      <header className="relative mb-6 overflow-hidden rounded-2xl border border-cyan-300/25 bg-[linear-gradient(130deg,rgba(7,14,30,0.95),rgba(10,23,48,0.92))] p-5 shadow-soft">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_220px_at_95%_0%,rgba(130,196,255,0.28),transparent_60%)]" />
        <div className="pointer-events-none absolute left-4 top-4 h-7 w-7 rounded-full border border-cyan-300/35" />
        <div className="pointer-events-none absolute left-6 top-6 h-3 w-3 rounded-full bg-cyan-300/60 blur-[2px]" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-[11px] uppercase text-cyan-200/85">Mission Control // OpenClaw</p>
            <h1 className="font-display mt-2 text-[1.6rem] font-semibold uppercase tracking-[0.08em] text-slate-100 md:text-[1.85rem]">
              Operator Dashboard v1
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Local-first cockpit for Gmail triage, OpenClaw runtime visibility, and high-priority action flows.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-200/10 px-3 py-1 text-[11px] uppercase tracking-wide text-cyan-100">
              <Zap className="h-3.5 w-3.5" />
              mission state: stable / {criticalCount} high-priority inbox events
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetricChip icon={Shield} label="Priority items" value={`${dashboardData.priorityInbox.length}`} />
            <MetricChip icon={Bell} label="Cleanup queue" value={`${dashboardData.cleanupQueue.length}`} />
            <MetricChip icon={Cpu} label="Active sessions" value={`${dashboardData.openclawStatus.sessionsActive}`} />
            <MetricChip icon={ActivitySquare} label="Tasks tracked" value={`${dashboardData.tasksAgents.length}`} />
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <PriorityInbox items={dashboardData.priorityInbox} />
          <CleanupQueue items={dashboardData.cleanupQueue} />
        </div>

        <div className="space-y-4 lg:col-span-5">
          <JobsSchool items={dashboardData.jobsSchool} />
          <OpenClawStatus status={dashboardData.openclawStatus} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TasksAgents items={dashboardData.tasksAgents} />
        </div>
        <div className="lg:col-span-5">
          <QuickActions actions={dashboardData.quickActions} />
        </div>
      </section>
    </main>
  );
}

interface MetricChipProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function MetricChip({ icon: Icon, label, value }: MetricChipProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-cyan-300/20 bg-[#0c162a]/80 px-3 py-2">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
      <p className="font-display inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5 text-cyan-200" />
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
