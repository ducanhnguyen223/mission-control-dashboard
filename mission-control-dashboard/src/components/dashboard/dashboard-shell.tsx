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
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-12 pt-8 sm:px-7 lg:px-10 lg:pt-10">
      <header className="mb-7 rounded-3xl border border-slate-600/35 bg-slate-900/70 p-6 shadow-[0_16px_44px_rgba(2,6,23,0.34)] backdrop-blur-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-medium text-slate-300">Mission Control · OpenClaw</p>
            <h1 className="font-display mt-2 text-3xl font-semibold leading-tight text-slate-100 md:text-[2.15rem]">
              Operator Dashboard v1
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Local-first cockpit for Gmail triage, OpenClaw runtime visibility, and high-priority action flows.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-400/35 bg-blue-500/12 px-3 py-1.5 text-xs font-medium text-blue-200">
              <Zap className="h-3.5 w-3.5" />
              Mission state stable · {criticalCount} high-priority inbox events
            </div>
          </div>

          <div className="grid min-w-[240px] grid-cols-2 gap-2.5 text-xs sm:min-w-[300px]">
            <MetricChip icon={Shield} label="Priority items" value={`${dashboardData.priorityInbox.length}`} />
            <MetricChip icon={Bell} label="Cleanup queue" value={`${dashboardData.cleanupQueue.length}`} />
            <MetricChip icon={Cpu} label="Active sessions" value={`${dashboardData.openclawStatus.sessionsActive}`} />
            <MetricChip icon={ActivitySquare} label="Tasks tracked" value={`${dashboardData.tasksAgents.length}`} />
          </div>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <PriorityInbox items={dashboardData.priorityInbox} />
          <CleanupQueue items={dashboardData.cleanupQueue} />
        </div>

        <div className="space-y-5 lg:col-span-5">
          <JobsSchool items={dashboardData.jobsSchool} />
          <OpenClawStatus status={dashboardData.openclawStatus} />
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-12">
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
    <div className="rounded-xl border border-slate-600/35 bg-slate-900/65 px-3.5 py-3 shadow-[0_6px_20px_rgba(2,6,23,0.28)]">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5 text-slate-300" />
        {label}
      </p>
      <p className="mt-1.5 text-base font-semibold leading-none text-slate-100">{value}</p>
    </div>
  );
}
