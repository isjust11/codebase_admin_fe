'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildLivePreviewMessage,
  getLivePreviewHostUrl,
  isLivePreviewReady,
  type LivePreviewPayload,
} from '@/lib/live-preview';
import { RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  templateId: string;
  title?: string;
  slug?: string;
  data: Record<string, unknown>;
  className?: string;
};

/**
 * Phone-framed iframe → Host `/preview`.
 * Pushes draft payload via postMessage whenever props change (debounced).
 */
export default function LivePreviewPanel({
  templateId,
  title,
  slug,
  data,
  className = '',
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const previewUrl = useMemo(() => getLivePreviewHostUrl(), []);

  const payload: LivePreviewPayload = useMemo(
    () => ({
      templateId: templateId || 'wedding-basic',
      title: title || 'Live preview',
      slug: slug || 'preview',
      data: data || {},
    }),
    [templateId, title, slug, data],
  );

  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  const postPayload = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage(buildLivePreviewMessage(payloadRef.current), '*');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'postMessage failed');
    }
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!isLivePreviewReady(event.data)) return;
      setReady(true);
      postPayload();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => postPayload(), 250);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, ready]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="mb-3 flex w-full max-w-[340px] items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
          <Smartphone className="h-3.5 w-3.5" />
          Live preview
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => {
            setReady(false);
            setReloadKey((k) => k + 1);
          }}
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          Reload
        </Button>
      </div>

      <div
        className="relative bg-neutral-900 shadow-2xl"
        style={{ width: 320, height: 690, borderRadius: 40, padding: 10 }}
      >
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-950" />
        <iframe
          key={reloadKey}
          ref={iframeRef}
          title="EventLab live preview"
          className="h-full w-full border-0 bg-white"
          style={{ borderRadius: 30 }}
          src={previewUrl}
          sandbox="allow-scripts allow-same-origin allow-popups"
          onLoad={() => {
            // Host may post READY; also nudge after load
            window.setTimeout(() => postPayload(), 300);
          }}
        />
      </div>

      <p className="mt-3 max-w-[320px] text-center text-[11px] text-stone-500">
        {ready ? (
          <>
            Đồng bộ với Host <code className="rounded bg-stone-100 px-1">{previewUrl}</code>
          </>
        ) : (
          <>Đang kết nối Host preview…</>
        )}
      </p>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {!templateId ? (
        <p className="mt-1 text-xs text-amber-700">Nhập slug package (vd. wedding-basic) để preview.</p>
      ) : null}
    </div>
  );
}
