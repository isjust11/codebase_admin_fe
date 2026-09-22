import { axiosInstance } from '@/lib/axios';

export type RsvpStatus = 'PENDING' | 'ATTENDING' | 'DECLINED' | 'MAYBE';

export type EventGuest = {
  id: string | number;
  name: string;
  phone?: string;
  email?: string;
  group?: string;
  source?: string;
  publicToken?: string;
  invitationUrl?: string;
  rsvpStatus?: RsvpStatus;
  rsvpNote?: string;
  plusOnes?: number;
  viewedAt?: string;
  respondedAt?: string;
  createdAt?: string;
};

export type GuestInput = {
  name: string;
  phone?: string;
  email?: string;
  group?: string;
};

export type RsvpStats = {
  PENDING?: number;
  ATTENDING?: number;
  DECLINED?: number;
  MAYBE?: number;
  total?: number;
};

type GuestQuery = {
  page?: number;
  size?: number;
  search?: string;
};

export function reactInviteUrl(slug?: string | null): string | null {
  if (!slug) return null;
  const base = (
    process.env.NEXT_PUBLIC_REACT_TEMPLATE_HOST_URL ||
    process.env.NEXT_PUBLIC_INVITE_HOST_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
  return `${base}/invite/${encodeURIComponent(slug)}`;
}

export function personalInviteUrl(token?: string | null, invitationUrl?: string | null): string | null {
  if (invitationUrl) return invitationUrl;
  if (!token) return null;
  const base = (
    process.env.NEXT_PUBLIC_PUBLIC_INVITE_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'http://localhost:3200'
  ).replace(/\/$/, '');
  return `${base}/e/${encodeURIComponent(token)}`;
}

export async function getEventGuests(eventId: string, params?: GuestQuery): Promise<any> {
  const response = await axiosInstance.get(`/events/${eventId}/guests`, { params });
  return response.data;
}

export async function createEventGuest(eventId: string, data: GuestInput): Promise<EventGuest> {
  const response = await axiosInstance.post(`/events/${eventId}/guests`, data);
  return response.data;
}

export async function updateEventGuest(
  eventId: string,
  guestId: string,
  data: Partial<GuestInput>,
): Promise<EventGuest> {
  const response = await axiosInstance.put(`/events/${eventId}/guests/${guestId}`, data);
  return response.data;
}

export async function deleteEventGuest(eventId: string, guestId: string): Promise<void> {
  await axiosInstance.delete(`/events/${eventId}/guests/${guestId}`);
}

export async function getEventRsvpStats(eventId: string): Promise<RsvpStats> {
  const response = await axiosInstance.get(`/events/${eventId}/rsvp-stats`);
  return response.data;
}

export async function importEventGuests(eventId: string, guests: GuestInput[]): Promise<any> {
  const response = await axiosInstance.post(`/events/${eventId}/guests/import`, { guests });
  return response.data;
}
