export type PublicTemplatePreview = {
  reactInviteUrl?: string;
  template: {
    id?: string;
    name?: string;
    slug?: string;
    type?: string;
    description?: string;
    thumbnailUrl?: string;
    status?: string;
  };
};

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchPublicTemplatePreview(id: string): Promise<PublicTemplatePreview> {
  const res = await fetch(`${apiBase()}/public/templates/${id}/preview`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Template not found');
  }
  return res.json();
}
