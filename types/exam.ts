import { ExamQuestion } from "./exam-question";
import { UserExam } from "./user-exam";


export interface Exam {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  examQuestions: ExamQuestion[];
  updatedAt: string;
  userExams: UserExam[];
} 