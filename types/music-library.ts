export type MusicLibraryTrack = {
  id: string;
  slug: string;
  name: string;
  mood?: string | null;
  url: string;
  filename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicMusicTrack = {
  id: string;
  name: string;
  mood: string;
  url: string;
};
