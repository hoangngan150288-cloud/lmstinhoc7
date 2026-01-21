export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu (cho phép quản lý)
  role: UserRole;
  avatar?: string;
  classId?: string; // For students
  dob?: string; // Date of birth
  parentPhone?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface Class {
  id: string;
  name: string; // e.g., "7A1"
  teacherId: string;
  studentCount: number;
  schoolYear?: string;
  homeroomTeacher?: string; // Tên GVCN
  joinCode?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string; // e.g., "Chủ đề 1: Máy tính và cộng đồng"
  order: number;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string; // e.g., "Bài 1: Thiết bị vào - ra"
  content: string; // HTML or Markdown content
  videoUrl?: string;
  slideUrl?: string; // Link Google Slide Embed
  documentUrl?: string; // Link tài liệu tham khảo
  status: 'DRAFT' | 'PUBLISHED'; // Trạng thái
  order: number;
}

export interface Assignment {
  id: string;
  lessonId?: string; // Optional: linked to a lesson
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  type: 'ESSAY' | 'FILE'; // Tự luận hoặc Nộp file
  rubric?: string; // Tiêu chí chấm
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string; // Helper for display
  content: string; // Could be text or file link
  submittedAt: string;
  grade?: number;
  feedback?: string;
}

export interface Announcement {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  content: string;
  target: 'ALL' | 'STUDENT' | 'PARENT'; // Đối tượng nhận tin
  createdAt: string;
}

export interface Progress {
  studentId: string;
  lessonId: string;
  completed: boolean;
  lastAccess: string;
}

// --- Question Bank Types ---
export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ORDERING' | 'FILL_IN_THE_BLANK';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface Question {
  id: string;
  subjectId?: string;
  topicId?: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  content: string; // Nội dung câu hỏi (HTML/Text)
  
  // Dữ liệu tùy biến theo loại câu hỏi
  options?: string[]; // Dùng cho Trắc nghiệm (Danh sách đáp án) hoặc Sắp xếp (Danh sách mục cần xếp)
  correctAnswer: string | string[]; // Đáp án đúng (String cho trắc nghiệm/điền từ, Array cho sắp xếp)
  
  explanation?: string; // Giải thích đáp án
}
