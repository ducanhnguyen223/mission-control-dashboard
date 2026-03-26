import { buildCleanupQueue } from '@/lib/mail-guard';
import type {
  AgentTaskItem,
  DashboardSnapshot,
  JobSchoolItem,
  OpenClawStatus,
  PriorityInboxItem,
  QuickAction
} from '@/lib/types';

const priorityInbox: PriorityInboxItem[] = [
  {
    id: 'pri-1',
    account: 'anhndgch220882@fpt.edu.vn',
    sender: 'jobs-noreply@linkedin.com',
    subject: '18 DevOps Engineer roles matching your profile',
    receivedAt: '2026-03-25T08:18:00.000Z',
    tag: 'job alert',
    priority: 'high',
    unread: true
  },
  {
    id: 'pri-2',
    account: 'anhndgch220882@fpt.edu.vn',
    sender: 'career.services@fpt.edu.vn',
    subject: 'Career Fair 2026: Cloud & Platform internships',
    receivedAt: '2026-03-25T07:31:00.000Z',
    tag: 'school',
    priority: 'high',
    unread: true
  },
  {
    id: 'pri-3',
    account: 'ducanhtq88@gmail.com',
    sender: 'security-noreply@google.com',
    subject: 'New sign-in blocked from unknown device',
    receivedAt: '2026-03-25T04:08:00.000Z',
    tag: 'security',
    priority: 'high',
    unread: true
  },
  {
    id: 'pri-4',
    account: 'ducanhtq88@gmail.com',
    sender: 'billing@digitalocean.com',
    subject: 'Invoice ready for March usage',
    receivedAt: '2026-03-25T02:42:00.000Z',
    tag: 'billing',
    priority: 'medium',
    unread: false
  },
  {
    id: 'pri-5',
    account: 'anhndgch220882@fpt.edu.vn',
    sender: 'recruiter@katalon.com',
    subject: 'Interview slot confirmation - Junior Cloud Engineer',
    receivedAt: '2026-03-24T23:20:00.000Z',
    tag: 'interview',
    priority: 'high',
    unread: true
  },
  {
    id: 'pri-6',
    account: 'ducanhtq88@gmail.com',
    sender: 'news@frontendweekly.dev',
    subject: 'Weekly frontend trends and tooling',
    receivedAt: '2026-03-24T21:16:00.000Z',
    tag: 'newsletter',
    priority: 'low',
    unread: true
  },
  {
    id: 'pri-7',
    account: 'ducanhtq88@gmail.com',
    sender: 'offers@cloudshop.io',
    subject: 'Save 60% on annual dev tools bundle',
    receivedAt: '2026-03-24T20:45:00.000Z',
    tag: 'promotion',
    priority: 'low',
    unread: true
  },
  {
    id: 'pri-8',
    account: 'ducanhtq88@gmail.com',
    sender: 'digest@devopsweekly.com',
    subject: 'Top platform engineering reads this week',
    receivedAt: '2026-03-24T18:09:00.000Z',
    tag: 'newsletter',
    priority: 'low',
    unread: false
  }
];

const jobsSchool: JobSchoolItem[] = [
  {
    id: 'job-1',
    source: 'LinkedIn',
    title: 'Cloud Operations Intern - Shopee Vietnam',
    account: 'anhndgch220882@fpt.edu.vn',
    receivedAt: '2026-03-25T08:18:00.000Z',
    type: 'linkedin',
    priority: 'high'
  },
  {
    id: 'job-2',
    source: 'Recruiter Outreach',
    title: 'Initial screening invitation - Katalon',
    account: 'anhndgch220882@fpt.edu.vn',
    receivedAt: '2026-03-24T23:20:00.000Z',
    type: 'interview',
    priority: 'high'
  },
  {
    id: 'job-3',
    source: 'Google Classroom',
    title: 'Cloud Computing Lab - submission due Friday 23:59',
    account: 'anhndgch220882@fpt.edu.vn',
    receivedAt: '2026-03-24T16:50:00.000Z',
    type: 'school',
    priority: 'high'
  },
  {
    id: 'job-4',
    source: 'LinkedIn',
    title: 'Platform Engineer role update - VNG',
    account: 'anhndgch220882@fpt.edu.vn',
    receivedAt: '2026-03-24T10:04:00.000Z',
    type: 'linkedin',
    priority: 'medium'
  }
];

const openclawStatus: OpenClawStatus = {
  gateway: 'online',
  heartbeat: 'healthy',
  lastAlert: 'No critical alerts in last 6h',
  sessionsActive: 4,
  lastSyncAt: '2026-03-25T08:24:00.000Z'
};

const tasksAgents: AgentTaskItem[] = [
  {
    id: 'task-1',
    name: 'Inbox triage sweep',
    owner: 'agent-mailbox-alpha',
    status: 'running',
    updatedAt: '2026-03-25T08:22:00.000Z',
    duration: '04m 18s'
  },
  {
    id: 'task-2',
    name: 'OpenClaw heartbeat diagnostic',
    owner: 'agent-gateway-watch',
    status: 'completed',
    updatedAt: '2026-03-25T08:15:00.000Z',
    duration: '01m 52s'
  },
  {
    id: 'task-3',
    name: 'Cleanup queue scoring',
    owner: 'agent-cleanup-beta',
    status: 'completed',
    updatedAt: '2026-03-25T08:09:00.000Z',
    duration: '02m 31s'
  },
  {
    id: 'task-4',
    name: 'Gateway reconnect fallback',
    owner: 'agent-runtime-ops',
    status: 'failed',
    updatedAt: '2026-03-25T07:52:00.000Z',
    duration: '00m 37s'
  }
];

const quickActions: QuickAction[] = [
  {
    id: 'qa-1',
    label: 'Check inbox now',
    description: 'Refresh both Gmail snapshots and reprioritize cards',
    tone: 'primary',
    command: 'gog.mail.sync --accounts all'
  },
  {
    id: 'qa-2',
    label: 'Clean promos',
    description: 'Batch archive low-value promo/newsletter candidates',
    tone: 'neutral',
    command: 'gog.mail.cleanup --mode safe'
  },
  {
    id: 'qa-3',
    label: 'Run heartbeat',
    description: 'Execute OpenClaw health check and publish summary',
    tone: 'neutral',
    command: 'openclaw.heartbeat.run'
  },
  {
    id: 'qa-4',
    label: 'Restart gateway',
    description: 'Restart mission gateway service if status degrades',
    tone: 'danger',
    command: 'openclaw.gateway.restart'
  }
];

export const dashboardData: DashboardSnapshot = {
  priorityInbox,
  cleanupQueue: buildCleanupQueue(priorityInbox),
  jobsSchool,
  openclawStatus,
  tasksAgents,
  quickActions
};
