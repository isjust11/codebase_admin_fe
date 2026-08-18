export type LayoutTheme = {
  primaryColor: string;
  fontHeading: string;
  fontBody: string;
  background: string;
};

export type LayoutSection = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
};

export type LayoutJson = {
  version: 1;
  theme: LayoutTheme;
  sections: LayoutSection[];
};

export const DEFAULT_THEME: LayoutTheme = {
  primaryColor: '#c9a227',
  fontHeading: '"Playfair Display", serif',
  fontBody: '"Source Sans 3", "Noto Sans", sans-serif',
  background: '#f7f0e8',
};

export const SECTION_CATALOG: Array<{ type: string; label: string; group: 'core' | 'extra' }> = [
  { type: 'cover', label: 'Cover', group: 'core' },
  { type: 'inviteHero', label: 'Kính mời', group: 'core' },
  { type: 'countdown', label: 'Countdown', group: 'extra' },
  { type: 'couple', label: 'Cô dâu & chú rể', group: 'core' },
  { type: 'families', label: 'Hai bên gia đình', group: 'core' },
  { type: 'loveStory', label: 'Chuyện tình', group: 'extra' },
  { type: 'gallery', label: 'Album', group: 'core' },
  { type: 'eventInfo', label: 'Lễ & tiệc', group: 'core' },
  { type: 'map', label: 'Bản đồ', group: 'core' },
  { type: 'dressCode', label: 'Dress code', group: 'extra' },
  { type: 'wishes', label: 'Lời của cặp đôi', group: 'extra' },
  { type: 'guestbook', label: 'Sổ lời chúc', group: 'extra' },
  { type: 'rsvp', label: 'RSVP', group: 'core' },
  { type: 'footer', label: 'Footer', group: 'core' },
  { type: 'audio', label: 'Nhạc nền', group: 'extra' },
];

const FULL = [
  'cover',
  'inviteHero',
  'countdown',
  'couple',
  'families',
  'loveStory',
  'gallery',
  'eventInfo',
  'map',
  'wishes',
  'guestbook',
  'rsvp',
  'footer',
];

const MINIMAL = ['cover', 'inviteHero', 'couple', 'families', 'eventInfo', 'gallery', 'map', 'rsvp', 'footer'];

function makeLayout(types: string[]): LayoutJson {
  return {
    version: 1,
    theme: { ...DEFAULT_THEME },
    sections: types.map((type, index) => ({ id: `${type}-${index + 1}`, type, props: {} })),
  };
}

export const defaultWeddingLayout = (variant: 'full' | 'minimal' = 'full'): LayoutJson =>
  makeLayout(variant === 'minimal' ? MINIMAL : FULL);

export const FONT_OPTIONS = [
  { value: '"Playfair Display", serif', label: 'Playfair Display' },
  { value: '"Great Vibes", cursive', label: 'Great Vibes' },
  { value: '"Noto Serif", serif', label: 'Noto Serif' },
  { value: '"Source Sans 3", sans-serif', label: 'Source Sans' },
];
