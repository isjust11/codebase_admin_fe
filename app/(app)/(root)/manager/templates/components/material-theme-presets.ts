import type { TemplateTheme } from '@/types/template';

/** Coordinated color tokens derived from Material Design hue families. */
export type MaterialThemePreset = {
  id: string;
  /** i18n key under TemplatePage.theme.presets.* */
  labelKey: string;
  swatch: string;
  colors: Pick<
    TemplateTheme,
    'accent' | 'accentSoft' | 'ink' | 'muted' | 'bg' | 'bgSoft' | 'onAccent'
  >;
};

/**
 * Material-inspired wedding/event palettes (50 / 100 / 200 / 500 / 700 / 800 / 900).
 * Applying a preset only overwrites color tokens — fonts & effects stay as-is.
 */
export const MATERIAL_THEME_PRESETS: MaterialThemePreset[] = [
  {
    id: 'pink',
    labelKey: 'pink',
    swatch: '#E91E63',
    colors: {
      accent: '#E91E63',
      accentSoft: '#F8BBD0',
      ink: '#880E4F',
      muted: '#C2185B',
      bg: '#FCE4EC',
      bgSoft: '#F8BBD0',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'red',
    labelKey: 'red',
    swatch: '#F44336',
    colors: {
      accent: '#F44336',
      accentSoft: '#FFCDD2',
      ink: '#B71C1C',
      muted: '#D32F2F',
      bg: '#FFEBEE',
      bgSoft: '#FFCDD2',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'deepOrange',
    labelKey: 'deepOrange',
    swatch: '#FF5722',
    colors: {
      accent: '#FF5722',
      accentSoft: '#FFCCBC',
      ink: '#BF360C',
      muted: '#E64A19',
      bg: '#FBE9E7',
      bgSoft: '#FFCCBC',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'amber',
    labelKey: 'amber',
    swatch: '#FFC107',
    colors: {
      accent: '#FFC107',
      accentSoft: '#FFECB3',
      ink: '#FF6F00',
      muted: '#FFA000',
      bg: '#FFF8E1',
      bgSoft: '#FFECB3',
      onAccent: '#3E2723',
    },
  },
  {
    id: 'green',
    labelKey: 'green',
    swatch: '#4CAF50',
    colors: {
      accent: '#4CAF50',
      accentSoft: '#C8E6C9',
      ink: '#1B5E20',
      muted: '#388E3C',
      bg: '#E8F5E9',
      bgSoft: '#C8E6C9',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'teal',
    labelKey: 'teal',
    swatch: '#009688',
    colors: {
      accent: '#009688',
      accentSoft: '#B2DFDB',
      ink: '#004D40',
      muted: '#00796B',
      bg: '#E0F2F1',
      bgSoft: '#B2DFDB',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'cyan',
    labelKey: 'cyan',
    swatch: '#00BCD4',
    colors: {
      accent: '#00BCD4',
      accentSoft: '#B2EBF2',
      ink: '#006064',
      muted: '#0097A7',
      bg: '#E0F7FA',
      bgSoft: '#B2EBF2',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'blue',
    labelKey: 'blue',
    swatch: '#2196F3',
    colors: {
      accent: '#2196F3',
      accentSoft: '#BBDEFB',
      ink: '#0D47A1',
      muted: '#1976D2',
      bg: '#E3F2FD',
      bgSoft: '#BBDEFB',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'indigo',
    labelKey: 'indigo',
    swatch: '#3F51B5',
    colors: {
      accent: '#3F51B5',
      accentSoft: '#C5CAE9',
      ink: '#1A237E',
      muted: '#303F9F',
      bg: '#E8EAF6',
      bgSoft: '#C5CAE9',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'purple',
    labelKey: 'purple',
    swatch: '#9C27B0',
    colors: {
      accent: '#9C27B0',
      accentSoft: '#E1BEE7',
      ink: '#4A148C',
      muted: '#7B1FA2',
      bg: '#F3E5F5',
      bgSoft: '#E1BEE7',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'deepPurple',
    labelKey: 'deepPurple',
    swatch: '#673AB7',
    colors: {
      accent: '#673AB7',
      accentSoft: '#D1C4E9',
      ink: '#311B92',
      muted: '#512DA8',
      bg: '#EDE7F6',
      bgSoft: '#D1C4E9',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'brown',
    labelKey: 'brown',
    swatch: '#795548',
    colors: {
      accent: '#795548',
      accentSoft: '#D7CCC8',
      ink: '#3E2723',
      muted: '#5D4037',
      bg: '#EFEBE9',
      bgSoft: '#D7CCC8',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'blueGrey',
    labelKey: 'blueGrey',
    swatch: '#607D8B',
    colors: {
      accent: '#607D8B',
      accentSoft: '#CFD8DC',
      ink: '#263238',
      muted: '#455A64',
      bg: '#ECEFF1',
      bgSoft: '#CFD8DC',
      onAccent: '#FFFFFF',
    },
  },
  {
    id: 'grey',
    labelKey: 'grey',
    swatch: '#9E9E9E',
    colors: {
      accent: '#757575',
      accentSoft: '#E0E0E0',
      ink: '#212121',
      muted: '#616161',
      bg: '#FAFAFA',
      bgSoft: '#F5F5F5',
      onAccent: '#FFFFFF',
    },
  },
];

export function matchMaterialPresetId(theme: Partial<TemplateTheme>): string | null {
  const accent = (theme.accent || '').toLowerCase();
  if (!accent) return null;
  return MATERIAL_THEME_PRESETS.find((p) => p.colors?.accent?.toLowerCase() === accent)?.id ?? null;
}
