import type { CleanupQueueItem, PriorityInboxItem } from './types';

const PROTECTED_TAGS = new Set(['school', 'recruiter', 'interview', 'job alert', 'security']);

const PROTECTED_SENDER_PATTERNS = [
  /linkedin/i,
  /classroom\.google\.com/i,
  /recruit/i,
  /careers?/i,
  /interview/i
];

export function isProtectedMail(item: PriorityInboxItem): boolean {
  if (PROTECTED_TAGS.has(item.tag)) {
    return true;
  }

  const searchable = `${item.sender} ${item.subject}`;

  return PROTECTED_SENDER_PATTERNS.some((pattern) => pattern.test(searchable));
}

export function buildCleanupQueue(items: PriorityInboxItem[]): CleanupQueueItem[] {
  return items
    .filter((item) => !isProtectedMail(item))
    .map((item) => ({
      ...item,
      reason: item.tag === 'promotion' ? 'promotion' : item.tag === 'newsletter' ? 'newsletter' : 'bulk',
      confidence: item.tag === 'promotion' ? 0.96 : 0.88
    }));
}
