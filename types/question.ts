import { SkillType } from "@/enums/skill-type.enum";
import { ExamQuestion } from "./exam-question";
import { QuestionType } from "@/enums/question-type.enum";


export interface Question {
  id?: string;

  content: string;

  skill?: SkillType;

  type?: QuestionType;

  options?: string[];

  answer?: string;

  explanation?: string;

  isActive: boolean;

  examQuestions: ExamQuestion[];
} 