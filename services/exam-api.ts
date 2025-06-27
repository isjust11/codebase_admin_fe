import { axiosInstance } from '@/lib/axios';
import { QuestionFormData } from '@/types/dto/QuestionFormData';
import { Exam } from '@/types/exam';
import { Question } from '@/types/question';


export interface ExamDto {
  title: string;
  content: string;
  thumbnail?: string;
  description?: string;
  status?: string;
}


export const getExams = async (params?: PaginationParams): Promise<PaginatedResponse<Exam>> => {
  try {
    const response = await axiosInstance.get('/exam', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching Exams:', error);
    return { data: [], total: 0, page: 0, size: 10, totalPages: 0 };
  }
};

export const getAllExam = async (): Promise<Exam[]> => {
  const response = await axiosInstance.get(`/exam`);
  return response.data;
};

export const getExam = async (id: string): Promise<Exam> => {
  const response = await axiosInstance.get(`/exam/${id}`);
  return response.data;
};

export const createExam = async (data: ExamDto): Promise<Exam> => {
  const response = await axiosInstance.post('/exam', data);
  return response.data;
};

export const updateExam = async (id?: string, data?: ExamDto): Promise<Exam> => {
  const response = await axiosInstance.put(`/exam/${id}`, data);
  return response.data;
};

export const deleteExam = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/exam/${id}`);
};

export const createBulkQuestion = async (examId: string, data: Question[]): Promise<Exam[]> => {
  const response = await axiosInstance.post(`/exam/${examId}/questions`, { 'questions': data });
  return response.data;
};

export const deleteQuestion = async (examId: string, questionId: string): Promise<void> => {
  await axiosInstance.delete(`/exam/${examId}/questions/${questionId}`);
};

export const getExamQuestions = async (examId: string): Promise<Question[]> => {
  const response = await axiosInstance.get(`/exam/${examId}/questions`);
  return response.data;
};