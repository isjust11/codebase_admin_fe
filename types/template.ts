export type TemplateVariable = {
  key: string;
  label?: string;
  type?: 'text' | 'date' | 'image' | 'url' | 'richtext';
  scope?: 'event' | 'guest' | 'system';
  required?: boolean;
  defaultValue?: string;
};

export interface Template {
  id?: string;
  name: string;
  slug?: string;
  type?: string;
  thumbnailUrl?: string;
  htmlContent: string;
  cssContent?: string;
  variablesSchema?: TemplateVariable[];
  isPublished?: boolean;
  isPremium?: boolean;
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  description?: string;
  reviewNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
