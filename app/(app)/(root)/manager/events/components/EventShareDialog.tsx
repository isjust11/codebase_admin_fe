'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import InviteQrCode from '@/components/InviteQrCode';
import { reactInviteUrl } from '@/services/event-guest-api';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

type EventLike = {
  id?: string | number;
  title?: string;
  slug?: string;
  reactInviteUrl?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventLike | null;
};

export default function EventShareDialog({ open, onOpenChange, event }: Props) {
  const publicUrl =
    event?.reactInviteUrl || reactInviteUrl(event?.slug) || '';

  const copy = async () => {
    if (!publicUrl) {
      toast.error('Sự kiện chưa có slug / link thiệp');
      return;
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Đã sao chép link thiệp công khai');
    } catch {
      toast.error('Không sao chép được');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chia sẻ thiệp sự kiện</DialogTitle>
          <DialogDescription>
            Link mở thiệp React Host (`/invite/:slug`) cho khách xem chung. Link cá nhân theo khách nằm ở trang Quản lý khách mời.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-xs uppercase tracking-wide text-stone-500">
              {event?.title || 'Event'}
            </Label>
            <div className="flex gap-2">
              <Input readOnly value={publicUrl || 'Chưa có slug — cập nhật sự kiện trước'} />
              <Button type="button" variant="outline" size="icon" onClick={copy} disabled={!publicUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              {publicUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publicUrl, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            {event?.slug ? (
              <p className="mt-1 font-mono text-xs text-stone-500">slug: {event.slug}</p>
            ) : null}
          </div>

          {publicUrl ? (
            <InviteQrCode
              value={publicUrl}
              label="Mã QR thiệp công khai"
              fileName={`invite-${event?.slug || 'event'}`}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
