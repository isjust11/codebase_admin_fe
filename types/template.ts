export type TemplateVariable = {
  key: string;
  label?: string;
  type?: 'text' | 'date' | 'image' | 'url' | 'richtext' | 'gallery' | 'map' | 'json';
  scope?: 'event' | 'guest' | 'system';
  required?: boolean;
  defaultValue?: any;
};

export interface Template {
  id?: string;
  name: string;
  slug?: string;
  type?: string;
  thumbnailUrl?: string;
  htmlContent?: string;
  cssContent?: string;
  variablesSchema?: TemplateVariable[];
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
