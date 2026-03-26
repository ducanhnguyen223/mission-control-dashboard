export type MailTag =
  | 'security'
  | 'billing'
  | 'school'
  | 'recruiter'
  | 'interview'
  | 'cloud'
  | 'job alert'
  | 'account'
  | 'newsletter'
  | 'promotion';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface PriorityInboxItem {
  id: string;
  account: string;
  sender: string;
  subject: string;
  receivedAt: string;
  tag: MailTag;
  priority: PriorityLevel;
  unread: boolean;
}

export interface CleanupQueueItem extends PriorityInboxItem {
  reason: 'promotion' | 'newsletter' | 'bulk';
  confidence: number;
}

export interface JobSchoolItem {
  id: string;
  source: string;
  title: string;
  account: string;
  receivedAt: string;
  type: 'linkedin' | 'recruiter' | 'interview' | 'school';
  priority: PriorityLevel;
}

export interface OpenClawStatus {
  gateway: 'online' | 'degraded' | 'offline';
  heartbeat: 'healthy' | 'warning' | 'critical';
  lastAlert: string;
  sessionsActive: number;
  lastSyncAt: string;
}

export interface AgentTaskItem {
  id: string;
  name: string;
  owner: string;
  status: 'running' | 'completed' | 'failed';
  updatedAt: string;
  duration: string;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  tone: 'primary' | 'neutral' | 'danger';
  command: string;
}

export interface DashboardSnapshot {
  priorityInbox: PriorityInboxItem[];
  cleanupQueue: CleanupQueueItem[];
  jobsSchool: JobSchoolItem[];
  openclawStatus: OpenClawStatus;
  tasksAgents: AgentTaskItem[];
  quickActions: QuickAction[];
}
