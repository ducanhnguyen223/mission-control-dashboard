export function formatRelativeTime(isoDate: string, now = new Date()): string {
  const then = new Date(isoDate);
  const deltaMs = now.getTime() - then.getTime();

  const minutes = Math.floor(deltaMs / 1000 / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
