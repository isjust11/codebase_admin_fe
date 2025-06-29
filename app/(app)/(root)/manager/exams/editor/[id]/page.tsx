'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';
import { QuestionType } from '@/enums/question-type.enum';
import { Label } from '@/components/ui/label';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { createBulkQuestion, getExamQuestions } from '@/services/exam-api';
import { Question } from '@/types/question';
import { SkillType } from '@/enums/skill-type.enum';
import { toast } from 'sonner';

// Interface cho validation errors
interface ValidationErrors {
    content?: string;
    type?: string;
    skill?: string;
    options?: string;
    answer?: string;
    explanation?: string;
}

const QuestionEditor = () => {
    const router = useRouter();
    const params = useParams();
    const examId = params.id as string;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id:'',
        content: '',
        skill: SkillType.READING,
        type: QuestionType.CHOOSE_SINGLE_ANSWER,
        options: ['', '', '', ''],
        answer: '',
        explanation: '',
        isActive: true,
        examQuestions: []
    });

    const questionTypes = [
        { value: QuestionType.CHOOSE_SINGLE_ANSWER, label: 'Chọn một đáp án đúng' },
        { value: QuestionType.CHOOSE_MULTIPLE_ANSWERS, label: 'Chọn nhiều đáp án đúng' },
        { value: QuestionType.FILL_IN_THE_BLANK, label: 'Điền vào chỗ trống' },
        { value: QuestionType.MATCHING, label: 'Nối các cặp tương ứng' },
        { value: QuestionType.ORDERING, label: 'Sắp xếp các mục theo đúng thứ tự' },
        { value: QuestionType.SHORT_ANSWER, label: 'Trả lời câu hỏi ngắn' },
        { value: QuestionType.ESSAY, label: 'Viết một bài luận' },
        { value: QuestionType.IMAGE_DESCRIPTION, label: 'Mô tả một hình ảnh' },
        { value: QuestionType.VOICE_RECORDING, label: 'Ghi âm câu trả lời' }
    ];

    const skills = [
        { value: SkillType.LISTENING, label: 'Nghe' },
        { value: SkillType.READING, label: 'Đọc' },
        { value: SkillType.WRITING, label: 'Viết' },
        { value: SkillType.SPEAKING, label: 'Nói' },
        { value: SkillType.GRAMMAR, label: 'Ngữ pháp' },
        { value: SkillType.VOCABULARY, label: 'Từ vựng' }
    ];

    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    useEffect(() => {
        // Load existing questions if any
        loadQuestions();
    }, [examId]);

    const loadQuestions = async () => {
        try {
            // TODO: Implement API call to load existing questions
            const data = await getExamQuestions(examId);
            setQuestions(data || []);
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    };

    // Validation function
    const validateQuestion = (question: Question): ValidationErrors => {
        const errors: ValidationErrors = {};

        // Validate content
        if (!question.content || question.content.trim() === '') {
            errors.content = 'Nội dung câu hỏi không được để trống';
        } else if (question.content.length < 10) {
            errors.content = 'Nội dung câu hỏi phải có ít nhất 10 ký tự';
        }

        // Validate type
        if (!question.type) {
            errors.type = 'Vui lòng chọn loại câu hỏi';
        }

        // Validate skill
        if (!question.skill) {
            errors.skill = 'Vui lòng chọn kỹ năng';
        }

        // Validate options for multiple choice questions
        if (question.type === QuestionType.CHOOSE_SINGLE_ANSWER || question.type === QuestionType.CHOOSE_MULTIPLE_ANSWERS) {
            if (!question.options || question.options.length < 2) {
                errors.options = 'Phải có ít nhất 2 tùy chọn';
            } else {
                const emptyOptions = question.options.filter(opt => !opt || opt.trim() === '');
                if (emptyOptions.length > 0) {
                    errors.options = 'Tất cả các tùy chọn phải được điền đầy đủ';
                }
                
                // Check for duplicate options
                const uniqueOptions = new Set(question.options.map(opt => opt.trim().toLowerCase()));
                if (uniqueOptions.size !== question.options.length) {
                    errors.options = 'Các tùy chọn không được trùng lặp';
                }
            }
        }

        // Validate answer
        if (!question.answer || question.answer.trim() === '') {
            errors.answer = 'Đáp án không được để trống';
        } else {
            if (question.type === QuestionType.CHOOSE_SINGLE_ANSWER) {
                // Validate single answer format
                if (!optionLabels.includes(question.answer)) {
                    errors.answer = 'Đáp án phải là một trong các tùy chọn A, B, C, D...';
                }
            } else if (question.type === QuestionType.CHOOSE_MULTIPLE_ANSWERS) {
                // Validate multiple answers format
                const answers = question.answer.split(',').map(a => a.trim());
                const validAnswers = answers.every(a => optionLabels.includes(a));
                if (!validAnswers) {
                    errors.answer = 'Đáp án phải là các tùy chọn hợp lệ (VD: A,B,C)';
                }
                if (answers.length < 2) {
                    errors.answer = 'Phải chọn ít nhất 2 đáp án cho câu hỏi nhiều lựa chọn';
                }
            } else if (question.type === QuestionType.FILL_IN_THE_BLANK || 
                       question.type === QuestionType.SHORT_ANSWER) {
                if (question.answer.length < 2) {
                    errors.answer = 'Đáp án phải có ít nhất 2 ký tự';
                }
            } else if (question.type === QuestionType.ESSAY) {
                if (question.answer.length < 10) {
                    errors.answer = 'Đáp án cho bài luận phải có ít nhất 10 ký tự';
                }
            }
        }

        // Validate explanation (optional but if provided, should be meaningful)
        if (question.explanation && question.explanation.trim() !== '' && question.explanation.length < 5) {
            errors.explanation = 'Giải thích phải có ít nhất 5 ký tự nếu được cung cấp';
        }

        return errors;
    };

    const handleQuestionTypeChange = (type: QuestionType) => {
        setCurrentQuestion(prev => ({
            ...prev,
            type: type,
            options: type === QuestionType.CHOOSE_SINGLE_ANSWER || type === QuestionType.CHOOSE_MULTIPLE_ANSWERS
                ? ['', '', '', '']
                : []
        }));
        // Clear validation errors when type changes
        setValidationErrors(prev => ({ ...prev, type: undefined, options: undefined, answer: undefined }));
    };

    const handleOptionChange = (index: number, value: string) => {
        setCurrentQuestion(prev => ({
            ...prev,
            options: prev.options?.map((option, i) => i === index ? value : option)
        }));
        // Clear options validation error when user starts typing
        setValidationErrors(prev => ({ ...prev, options: undefined }));
    };

    const addOption = () => {
        if (currentQuestion.options?.length ?? 0 < 8) {
            setCurrentQuestion(prev => ({
                ...prev,
                options: [...prev.options ?? [], '']
            }));
        }
    };

    const removeOption = (index: number) => {
        if (currentQuestion.options?.length ?? 0 > 2) {
            setCurrentQuestion(prev => ({
                ...prev,
                options: prev.options?.filter((_, i) => i !== index)
            }));
        }
    };

    const saveCurrentQuestion = (): boolean => {
        const errors = validateQuestion(currentQuestion);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            // Show first error message
            const firstError = Object.values(errors)[0];
            if (firstError) {
                toast.error(firstError);
            }
            return false;
        }

        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = { ...currentQuestion };
        setQuestions(updatedQuestions);
        setValidationErrors({}); // Clear errors on successful save
        return true;
    };

    const nextQuestion = () => {
        const isValid = saveCurrentQuestion();
        if (!isValid) return;
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setCurrentQuestion(questions[nextIndex]);
        } else {
            // Add new question
            setCurrentQuestionIndex(nextIndex);
            setCurrentQuestion({
                content: '',
                skill: SkillType.READING,
                type: QuestionType.CHOOSE_SINGLE_ANSWER,
                options: ['', '', '', ''],
                answer: '',
                explanation: '',
                isActive: true,
                examQuestions: []
            });
            setQuestions(prev => [...prev, {
                content: '',
                skill: SkillType.READING,
                type: QuestionType.CHOOSE_SINGLE_ANSWER,
                options: ['', '', '', ''],
                answer: '',
                explanation: '',
                isActive: true,
                examQuestions: []
            }]);
        }
        setValidationErrors({}); // Clear errors when moving to next question
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            const isValid = saveCurrentQuestion();
            if (!isValid) return;
            const prevIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevIndex);
            setCurrentQuestion(questions[prevIndex]);
        }
        setValidationErrors({}); // Clear errors when moving to previous question
    };

    const deleteQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);

        if (currentQuestionIndex >= updatedQuestions.length) {
            setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
        }

        if (updatedQuestions.length > 0) {
            setCurrentQuestion(updatedQuestions[Math.max(0, updatedQuestions.length - 1)]);
        } else {
            setCurrentQuestion({
                content: '',
                skill: SkillType.READING,
                type: QuestionType.CHOOSE_SINGLE_ANSWER,
                options: ['', '', '', ''],
                answer: '',
                explanation: '',
                isActive: true,
                examQuestions: []
            });
        }
        setValidationErrors({}); // Clear errors when deleting
    };

    const saveAllQuestions = async () => {
        try {
            const isValid = saveCurrentQuestion();
            if (!isValid) return;
            
            if (questions.length == 0) {
                toast.warning('Vui lòng tạo ít nhất 1 câu hỏi!')
                return;
            }

            // Validate all questions before saving
            let hasErrors = false;
            for (let i = 0; i < questions.length; i++) {
                const errors = validateQuestion(questions[i]);
                if (Object.keys(errors).length > 0) {
                    toast.error(`Câu hỏi ${i + 1} có lỗi: ${Object.values(errors)[0]}`);
                    hasErrors = true;
                    break;
                }
            }

            if (hasErrors) return;

            // TODO: Implement API call to save all questions
            await createBulkQuestion(examId, questions);
            toast.success(`Đã lưu tất cả câu hỏi thành công! `);
        } catch (error) {
            console.error('Error saving questions:', error);
            toast.error('Có lỗi xảy ra khi lưu câu hỏi!');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Soạn thảo câu hỏi</h1>
                <div className="flex gap-2">
                     <Button onClick={()=>router.back()} className="flex items-center gap-2 bg-gray-400 ">
                        <ArrowLeft className="w-4 h-4 " />
                        Quay lại
                    </Button>
                    <Button onClick={saveAllQuestions} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Lưu tất cả
                    </Button>
                </div>
            </div>

            {/* Question Navigation */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Câu hỏi {currentQuestionIndex + 1}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={previousQuestion}
                                disabled={currentQuestionIndex === 0}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={nextQuestion}
                            >
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteQuestion(currentQuestionIndex)}
                                disabled={questions.length === 0}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Question Form */}
                        <div className="space-y-4">
                            {/* Question Type Selection */}
                            <div className="space-y-2">
                                <Label>Loại câu hỏi</Label>
                                <Select value={currentQuestion.type} onValueChange={handleQuestionTypeChange}>
                                    <SelectTrigger className={validationErrors.type ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn loại câu hỏi" />
                                    </SelectTrigger>
                                    <SelectContent className='bg-white z-[999991]'>
                                        {questionTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value} className='hover:bg-gray-100'>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.type && (
                                    <p className="text-sm text-red-500">{validationErrors.type}</p>
                                )}
                            </div>

                            {/* Skill Selection */}
                            <div className="space-y-2">
                                <Label>Kỹ năng</Label>
                                <Select value={currentQuestion.skill} onValueChange={(skill) => setCurrentQuestion(prev => ({ ...prev, skill: skill as SkillType }))}>
                                    <SelectTrigger className={validationErrors.skill ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Chọn kỹ năng" />
                                    </SelectTrigger>
                                    <SelectContent className='bg-white z-[999991]'>
                                        {skills.map(skill => (
                                            <SelectItem key={skill.value} value={skill.value} className='hover:bg-gray-100'>
                                                {skill.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validationErrors.skill && (
                                    <p className="text-sm text-red-500">{validationErrors.skill}</p>
                                )}
                            </div>

                            {/* Question Content */}
                            <div className="space-y-2">
                                <Label>Nội dung câu hỏi</Label>
                                <div className={validationErrors.content ? "border border-red-500 rounded-md" : ""}>
                                    <SimpleEditor
                                        key={'content-'+currentQuestion.id}
                                        initialContent={currentQuestion.content || ''}
                                        placeholder="Nhập nội dung câu hỏi..."
                                        onContentChange={(e) => {
                                            setCurrentQuestion(prev => ({ ...prev, content: e }));
                                            // Clear content validation error when user starts typing
                                            setValidationErrors(prev => ({ ...prev, content: undefined }));
                                        }}
                                    />
                                </div>
                                {validationErrors.content && (
                                    <p className="text-sm text-red-500">{validationErrors.content}</p>
                                )}
                            </div>

                            {/* Options for Multiple Choice */}
                            {(currentQuestion.type === QuestionType.CHOOSE_SINGLE_ANSWER || currentQuestion.type === QuestionType.CHOOSE_MULTIPLE_ANSWERS) && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Các tùy chọn</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addOption}
                                            disabled={(currentQuestion.options?.length ?? 0) >= 8}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Thêm tùy chọn
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {currentQuestion.options?.map((option, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Badge variant="outline" className="w-8 h-10 flex items-center justify-center">
                                                    {optionLabels[index]}
                                                </Badge>
                                                <Input
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                                    placeholder={`Tùy chọn ${optionLabels[index]}`}
                                                    className={`flex-1 ${validationErrors.options ? "border-red-500" : ""}`}
                                                />
                                                {(currentQuestion.options?.length ?? 0 > 2) && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeOption(index)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {validationErrors.options && (
                                        <p className="text-sm text-red-500">{validationErrors.options}</p>
                                    )}
                                </div>
                            )}

                            {/* Explanation */}
                            <div className="space-y-2">
                                <Label>Giải thích (tùy chọn)</Label>
                                <div className={validationErrors.explanation ? "border border-red-500 rounded-md" : ""}>
                                    <SimpleEditor
                                        key={'explanation-'+currentQuestion.id}
                                        initialContent={currentQuestion.explanation || ''}
                                        placeholder="Giải thích đáp án..."
                                        onContentChange={(e) => {
                                            setCurrentQuestion(prev => ({ ...prev, explanation: e }));
                                            // Clear explanation validation error when user starts typing
                                            setValidationErrors(prev => ({ ...prev, explanation: undefined }));
                                        }}
                                    />
                                </div>
                                {validationErrors.explanation && (
                                    <p className="text-sm text-red-500">{validationErrors.explanation}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Answer */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Đáp án đúng</Label>

                                {currentQuestion.type === QuestionType.CHOOSE_SINGLE_ANSWER && (
                                    <div>
                                        <Select 
                                            value={currentQuestion.answer} 
                                            onValueChange={(answer) => {
                                                setCurrentQuestion(prev => ({ ...prev, answer }));
                                                setValidationErrors(prev => ({ ...prev, answer: undefined }));
                                            }}
                                        >
                                            <SelectTrigger className={validationErrors.answer ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Chọn đáp án đúng" />
                                            </SelectTrigger>
                                            <SelectContent className='bg-white z-[999991]'>
                                                {currentQuestion.options?.map((option, index) => (
                                                    <SelectItem key={index} value={optionLabels[index]} className='hover:bg-gray-100'>
                                                        {optionLabels[index]}: {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.answer && (
                                            <p className="text-sm text-red-500">{validationErrors.answer}</p>
                                        )}
                                    </div>
                                )}

                                {currentQuestion.type === QuestionType.CHOOSE_MULTIPLE_ANSWERS && (
                                    <div className="space-y-2">
                                        {currentQuestion.options?.map((option, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Input
                                                    type="checkbox"
                                                    id={`answer-${index}`}
                                                    checked={currentQuestion.answer?.includes(optionLabels[index])}
                                                    onChange={(e) => {
                                                        const currentAnswers = currentQuestion.answer?.split(',').filter(a => a.trim());
                                                        let newAnswers;
                                                        if (e.target.checked) {
                                                            newAnswers = [...currentAnswers ?? '', optionLabels[index]];
                                                        } else {
                                                            newAnswers = currentAnswers?.filter(a => a !== optionLabels[index]);
                                                        }
                                                        setCurrentQuestion(prev => ({ ...prev, answer: newAnswers?.join(',') }));
                                                        setValidationErrors(prev => ({ ...prev, answer: undefined }));
                                                    }}
                                                />
                                                <Label htmlFor={`answer-${index}`} className="flex-1">
                                                    {optionLabels[index]}: {option}
                                                </Label>
                                            </div>
                                        ))}
                                        {validationErrors.answer && (
                                            <p className="text-sm text-red-500">{validationErrors.answer}</p>
                                        )}
                                    </div>
                                )}

                                {(currentQuestion.type === QuestionType.FILL_IN_THE_BLANK ||
                                    currentQuestion.type === QuestionType.SHORT_ANSWER ||
                                    currentQuestion.type === QuestionType.ESSAY) && (
                                        <div>
                                            <div className={validationErrors.answer ? "border border-red-500 rounded-md" : ""}>
                                                <SimpleEditor
                                                    key={'answer-'+currentQuestion.id}
                                                    initialContent={currentQuestion.answer || ''}
                                                    placeholder="Nhập đáp án đúng..."
                                                    onContentChange={(e) => {
                                                        setCurrentQuestion(prev => ({ ...prev, answer: e }));
                                                        setValidationErrors(prev => ({ ...prev, answer: undefined }));
                                                    }}
                                                />
                                            </div>
                                            {validationErrors.answer && (
                                                <p className="text-sm text-red-500">{validationErrors.answer}</p>
                                            )}
                                        </div>
                                    )}

                                {(currentQuestion.type === QuestionType.MATCHING ||
                                    currentQuestion.type === QuestionType.ORDERING) && (
                                        <div className="space-y-2">
                                            <div className={validationErrors.answer ? "border border-red-500 rounded-md" : ""}>
                                                <SimpleEditor
                                                    key={'answer-'+currentQuestion.id}
                                                    initialContent={currentQuestion.answer || ''}
                                                    placeholder="Nhập thứ tự đúng (VD: A-B-C-D hoặc 1-2-3-4)..."
                                                    onContentChange={(e) => {
                                                        setCurrentQuestion(prev => ({ ...prev, answer: e }));
                                                        setValidationErrors(prev => ({ ...prev, answer: undefined }));
                                                    }}
                                                />
                                            </div>
                                            {validationErrors.answer && (
                                                <p className="text-sm text-red-500">{validationErrors.answer}</p>
                                            )}
                                        </div>
                                    )}
                            </div>

                            {/* Question Preview */}
                            <div className="space-y-2">
                                <Label>Xem trước câu hỏi</Label>
                                <Card className="p-4 bg-gray-50">
                                    <div className="space-y-2">
                                        <span className="font-medium" dangerouslySetInnerHTML={{ __html: currentQuestion.content || 'Nội dung câu hỏi...' }}></span>
                                        {currentQuestion.type === QuestionType.CHOOSE_SINGLE_ANSWER && (
                                            <div className="space-y-1">
                                                {currentQuestion.options?.map((option, index) => (
                                                    <div key={index} className="flex items-center space-x-2">
                                                        <span className="font-medium">{optionLabels[index]}.</span>
                                                        <span>{option || `Tùy chọn ${optionLabels[index]}`}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions List */}
            {questions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách câu hỏi ({questions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {questions.map((question, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${index === currentQuestionIndex ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                    onClick={() => {
                                        saveCurrentQuestion();
                                        setCurrentQuestionIndex(index);
                                        setCurrentQuestion(question);
                                        setValidationErrors({}); // Clear errors when switching questions
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Badge variant="outline">Câu {index + 1}</Badge>
                                        <span className="font-medium" dangerouslySetInnerHTML={{ __html: question.content }}></span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">{question.type}</Badge>
                                        <Badge variant="outline">{question.skill}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default QuestionEditor;
