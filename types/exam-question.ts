import { Exam } from "./exam";
import { Question } from "./question";

export interface ExamQuestion {
    id: number;
    
    exam: Exam;
    
    examId: number;
  
    question: Question;
  
    questionId: number;

    order?: number;
} 