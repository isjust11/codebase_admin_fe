import { TemplateVariable } from '../template';

export interface TemplateDto {
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
  description?: string;
  layoutJson?: Record<string, any>;
  editorMode?: 'visual' | 'code';
  data?: Record<string, any>;
}
