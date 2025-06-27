import { Exam } from "./exam";
import { ExamQuestion } from "./exam-question";
import { Question } from "./question";
import { User } from "./user";
import { UserExams } from "./user-exams";


export interface UserAnswer {
  id: number;

  userExam: UserExams;

  userExamId: number;

  question: Question;

  questionId: number;

  answer?: string;

  isCorrect?: boolean;

} 