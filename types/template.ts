export type FieldConfig = {
  display?: string;
  color?: string;
  font?: string;
  size?: string;
};

export type TemplateVariable = {
  key: string;
  id?: number;
  label?: string;
  labelVi?: string;
  labelEn?: string;
  placeHolder?: string;
  itemSchema?: Record<string, any>;
  type?: 'text' | 'date' | 'image' | 'url' | 'richtext' | 'gallery' | 'map' | 'json' | 'raw' | string;
  scope?: 'event' | 'guest' | 'system';
  required?: boolean;
  defaultValue?: any;
  config?: FieldConfig;
};

export type TemplateTheme = {
  accent?: string;
  accentSoft?: string;
  ink?: string;
  muted?: string;
  bg?: string;
  bgSoft?: string;
  onAccent?: string;
  fontDisplay?: string;
  fontScript?: string;
  fontBody?: string;
  fontSans?: string;
};

export interface Template {
  id?: string;
  name: string;
  slug?: string;
  type?: string;
  thumbnailUrl?: string;
  htmlContent?: string;
  cssContent?: string;

  isPublished?: boolean;
  isPremium?: boolean;
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  description?: string;
  reviewNote?: string;
  layoutJson?: Record<string, any>;
  editorMode?: 'visual' | 'code';
  createdAt?: Date;
  updatedAt?: Date;
  data?: Record<string, any>;
}
