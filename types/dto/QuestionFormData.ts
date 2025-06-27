export interface QuestionFormData {
    content: string;
    skill: string;
    type: string;
    options: string[];
    answer: string;
    explanation?: string;
}