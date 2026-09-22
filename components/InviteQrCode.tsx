'use client';

import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  value: string;
  label?: string;
  size?: number;
  fileName?: string;
};

export default function InviteQrCode({
  value,
  label,
  size = 180,
  fileName = 'invite-qr',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Đã sao chép link');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Không sao chép được link');
    }
  };

  const handleDownload = () => {
    const svgElement = wrapRef.current?.querySelector('svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = size;
    canvas.height = size;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  if (!value) {
    return <p className="text-sm text-stone-500">Chưa có link để tạo QR.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {label ? <p className="text-sm font-medium text-stone-700">{label}</p> : null}
      <div ref={wrapRef} className="rounded-xl border border-stone-200 bg-white p-4">
        <QRCode value={value} size={size} />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          Copy link
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleDownload}>
          <Download className="mr-1.5 h-4 w-4" />
          Tải QR
        </Button>
      </div>
    </div>
  );
}
