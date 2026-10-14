export type InviteEffectKind = 'burst' | 'ambient' | 'gate' | 'scroll' | 'audio';

export type InviteEffect = {
  id: string;
  slug: string;
  themeKey: string;
  name: string;
  description?: string;
  kind: InviteEffectKind;
  defaultEnabled: boolean;
  options?: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
};
