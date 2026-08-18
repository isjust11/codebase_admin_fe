import { axiosInstance } from '@/lib/axios';
import { Template } from '@/types/template';
import { TemplateDto } from '@/types/dto/TemplateDto';

type TemplateQuery = PaginationParams & { status?: string };

export const getTemplates = async (params?: TemplateQuery): Promise<PaginatedResponse<Template>> => {
  try {
    const response = await axiosInstance.get('/templates', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getMyTemplates = async (params?: PaginationParams): Promise<PaginatedResponse<Template>> => {
  try {
    const response = await axiosInstance.get('/templates/mine', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my templates:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getTemplate = async (id: string): Promise<Template> => {
  const response = await axiosInstance.get(`/templates/${id}`);
  return response.data;
};

export const createTemplate = async (data: TemplateDto): Promise<Template> => {
  const response = await axiosInstance.post('/templates', data);
  return response.data;
};

export const updateTemplate = async (id?: string, data?: TemplateDto): Promise<Template> => {
  const response = await axiosInstance.put(`/templates/${id}`, data);
  return response.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/templates/${id}`);
};

export const publishTemplate = async (id: string, isPublished = true): Promise<Template> => {
  const response = await axiosInstance.post(`/templates/${id}/publish`, { isPublished });
  return response.data;
};

export const submitTemplate = async (id: string): Promise<Template> => {
  const response = await axiosInstance.post(`/templates/${id}/submit`);
  return response.data;
};

export const approveTemplate = async (id: string): Promise<Template> => {
  const response = await axiosInstance.post(`/templates/${id}/approve`);
  return response.data;
};

export const rejectTemplate = async (id: string, note?: string): Promise<Template> => {
  const response = await axiosInstance.post(`/templates/${id}/reject`, { note });
  return response.data;
};

export const previewTemplate = async (id: string, sampleData?: Record<string, any>): Promise<{ html: string; template: Template }> => {
  const response = await axiosInstance.post(`/templates/${id}/preview`, { sampleData: sampleData || {} });
  return response.data;
};

export const previewTemplateDraft = async (payload: {
  htmlContent?: string;
  cssContent?: string;
  layoutJson?: Record<string, any>;
  editorMode?: string;
  name?: string;
  sampleData?: Record<string, any>;
}): Promise<{ html: string; compiled?: { htmlContent: string; cssContent: string; variablesSchema: any[] } }> => {
  const response = await axiosInstance.post('/templates/preview-draft', payload);
  return response.data;
};

export const getTemplateStarters = async (): Promise<{
  sections: Array<{ type: string; label: string }>;
  starters: Array<{
    id: string;
    name: string;
    description?: string;
    html: string;
    css: string;
    layoutJson: Record<string, any>;
    variablesSchema: any[];
  }>;
}> => {
  const response = await axiosInstance.get('/templates/starters');
  return response.data;
};
