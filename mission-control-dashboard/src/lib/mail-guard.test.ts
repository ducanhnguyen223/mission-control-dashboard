import { describe, expect, it } from 'vitest';

import { buildCleanupQueue, isProtectedMail } from './mail-guard';
import type { PriorityInboxItem } from './types';

const protectedMail: PriorityInboxItem = {
  id: 'm-protected',
  account: 'anhndgch220882@fpt.edu.vn',
  sender: 'jobs-noreply@linkedin.com',
  subject: '12 new Cloud Engineer roles in Hanoi',
  receivedAt: '2026-03-25T08:14:00.000Z',
  tag: 'job alert',
  priority: 'high',
  unread: true
};

const promoMail: PriorityInboxItem = {
  id: 'm-promo',
  account: 'ducanhtq88@gmail.com',
  sender: 'news@frontendweekly.dev',
  subject: 'This week in frontend trends',
  receivedAt: '2026-03-24T21:10:00.000Z',
  tag: 'newsletter',
  priority: 'low',
  unread: true
};

describe('isProtectedMail', () => {
  it('returns true for LinkedIn job alerts', () => {
    expect(isProtectedMail(protectedMail)).toBe(true);
  });

  it('returns false for generic newsletter mail', () => {
    expect(isProtectedMail(promoMail)).toBe(false);
  });
});

describe('buildCleanupQueue', () => {
  it('excludes protected job and school mail from cleanup queue', () => {
    const cleanup = buildCleanupQueue([
      protectedMail,
      {
        ...protectedMail,
        id: 'm-school',
        sender: 'no-reply@classroom.google.com',
        subject: 'FPT assignment deadline update',
        tag: 'school'
      },
      promoMail
    ]);

    expect(cleanup).toHaveLength(1);
    expect(cleanup[0]?.sender).toBe('news@frontendweekly.dev');
  });
});
