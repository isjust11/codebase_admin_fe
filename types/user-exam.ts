import { Exam } from "./exam";
import { User } from "./user";
import { UserAnswer } from "./user-answer";


export interface UserExam {
  id: number;

  user: User;


  userId: number;

  exam: Exam;

  examId: number;

  startedAt?: Date;

  finishedAt?: Date;

  score?: number;

  status: string;

  userAnswers: UserAnswer[];

  isPaid: boolean;

  paidAt: Date;

  paymentMethod: string;

  transactionId: string;

  paymentStatus: string; // 'pending', 'completed', 'failed', 'refunded'

  isActivated: boolean;
  activatedAt: Date;

} 