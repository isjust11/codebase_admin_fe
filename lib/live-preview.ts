/**
 * postMessage contract mirrored from Host `wedding-invite/lib/live-preview.ts`.
 */
export const LIVE_PREVIEW_SOURCE_ADMIN = 'eventlab-admin' as const;
export const LIVE_PREVIEW_SOURCE_HOST = 'eventlab-host' as const;

export const LIVE_PREVIEW_MSG = {
  UPDATE: 'eventlab:live-preview',
  READY: 'eventlab:preview-ready',
  REQUEST: 'eventlab:preview-request',
} as const;

export type LivePreviewPayload = {
  templateId: string;
  title?: string;
  slug?: string;
  data: Record<string, unknown>;
};

export function isLivePreviewReady(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const msg = data as Record<string, unknown>;
  return msg.source === LIVE_PREVIEW_SOURCE_HOST && msg.type === LIVE_PREVIEW_MSG.READY;
}

export function buildLivePreviewMessage(payload: LivePreviewPayload) {
  return {
    source: LIVE_PREVIEW_SOURCE_ADMIN,
    type: LIVE_PREVIEW_MSG.UPDATE,
    payload,
  };
}

export function getLivePreviewHostUrl(): string {
  const base = (
    process.env.NEXT_PUBLIC_REACT_TEMPLATE_HOST_URL ||
    process.env.NEXT_PUBLIC_INVITE_HOST_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
  return `${base}/preview`;
}
