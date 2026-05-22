import { getApiUrl } from '$lib/config';

// Fire-and-forget POST to /api/threads/extract after an entry is saved.
// Failures are intentionally silent — threads are an enhancement, not a
// guarantee, and we don't want to surface backend hiccups in the save UI.
export function triggerThreadExtraction(entryId: string | null | undefined): void {
  if (!entryId) return;
  void fetch(getApiUrl('/api/threads/extract'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryId })
  }).catch(() => {});
}
