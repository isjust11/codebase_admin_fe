import { Metadata } from 'next';
import { fetchPublicInvite } from '@/services/public-invite-api';

type Props = { params: Promise<{ token: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  try {
    const invite = await fetchPublicInvite(token);
    const title = invite.event?.title ? `${invite.event.title} — EventLab` : 'EventLab';
    return {
      title,
      description: invite.event?.venue || 'Thiệp mời EventLab',
      openGraph: {
        title,
        description: invite.event?.venue || 'Thiệp mời EventLab',
        images: invite.event?.coverImageUrl ? [invite.event.coverImageUrl] : undefined,
      },
    };
  } catch {
    return { title: 'EventLab' };
  }
}

export default function PublicInviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
