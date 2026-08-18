export type PublicInvitePayload = {
  html: string;
  invitationUrl?: string;
  event?: {
    title?: string;
    eventDate?: string;
    venue?: string;
    coverImageUrl?: string;
    type?: string;
  } | null;
  guest?: {
    name?: string;
    rsvpStatus?: string;
    rsvpNote?: string;
    plusOnes?: number;
  };
};

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchPublicInvite(token: string): Promise<PublicInvitePayload> {
  const res = await fetch(`${apiBase()}/public/e/${token}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Invite not found');
  }
  return res.json();
}

export async function markInviteViewed(token: string): Promise<void> {
  await fetch(`${apiBase()}/public/e/${token}/view`, { method: 'POST' });
}

export async function fetchWishes(token: string): Promise<Array<{ id: string; name: string; message: string }>> {
  const res = await fetch(`${apiBase()}/public/e/${token}/wishes`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

export async function submitWish(token: string, body: { name?: string; message: string }): Promise<void> {
  const res = await fetch(`${apiBase()}/public/e/${token}/wishes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Wish failed');
  }
}

export async function submitRsvp(
  token: string,
  body: { status: string; note?: string; plusOnes?: number },
): Promise<void> {
  const res = await fetch(`${apiBase()}/public/e/${token}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('RSVP failed');
  }
}
