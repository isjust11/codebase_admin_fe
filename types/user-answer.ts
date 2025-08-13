import { Exam } from "./exam";
import { ExamQuestion } from "./exam-question";
import { Question } from "./question";
import { User } from "./user";
import { UserExam } from "./user-exam";


export interface UserAnswer {
  id: number;

  userExam: UserExam;

  userExamId: number;

  question: Question;

  questionId: number;

  answer?: string;

  isCorrect?: boolean;

} 