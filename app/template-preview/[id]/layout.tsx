import { Metadata } from 'next';
import { fetchPublicTemplatePreview } from '@/services/public-template-api';
import '../../globals.css';

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const preview = await fetchPublicTemplatePreview(id);
    const title = preview.template?.name ? `${preview.template.name} — EventLab` : 'EventLab';
    return {
      title,
      description: preview.template?.description || 'Mẫu thiệp EventLab',
      openGraph: {
        title,
        description: preview.template?.description || 'Mẫu thiệp EventLab',
        images: preview.template?.thumbnailUrl ? [preview.template.thumbnailUrl] : undefined,
      },
    };
  } catch {
    return { title: 'EventLab' };
  }
}

export default function PublicTemplatePreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
