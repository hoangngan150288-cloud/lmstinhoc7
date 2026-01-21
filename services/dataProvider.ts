import { 
  User, Class, Subject, Topic, Lesson, Assignment, Submission, Announcement, Progress, Question 
} from '../types';

export interface IDataProvider {
  // User
  getCurrentUser(): Promise<User | null>;
  login(username: string, password: string): Promise<User>;
  getStudents(classId?: string): Promise<User[]>;
  createStudent(student: Omit<User, 'id' | 'role' | 'avatar'>): Promise<User>;
  updateStudent(student: User): Promise<User>;
  deleteStudent(studentId: string): Promise<void>;
  
  // Core Data
  getClasses(teacherId?: string): Promise<Class[]>;
  createClass(cls: Omit<Class, 'id' | 'studentCount'>): Promise<Class>;
  updateClass(cls: Class): Promise<Class>;
  deleteClass(classId: string): Promise<void>;

  getSubjects(): Promise<Subject[]>;
  
  getTopics(subjectId: string): Promise<Topic[]>;
  createTopic(topic: Omit<Topic, 'id'>): Promise<Topic>;
  updateTopic(topic: Topic): Promise<Topic>;
  deleteTopic(topicId: string): Promise<void>;

  getLessons(topicId?: string): Promise<Lesson[]>; 
  createLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson>;
  updateLesson(lesson: Lesson): Promise<Lesson>;
  deleteLesson(lessonId: string): Promise<void>;
  
  // Specifics
  getAnnouncements(classId?: string): Promise<Announcement[]>;
  createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement>; 
  
  // Assignments
  getAssignments(classId?: string): Promise<Assignment[]>;
  createAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment>;
  updateAssignment(assignment: Assignment): Promise<Assignment>;
  deleteAssignment(assignmentId: string): Promise<void>;
  
  getSubmissions(assignmentId: string): Promise<Submission[]>;
  getMySubmissions(studentId: string): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;

  // Actions
  submitAssignment(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission>;
  gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission>;
  
  // Progress
  getProgress(studentId: string): Promise<Progress[]>;
  getAllProgress(): Promise<Progress[]>;
  markLessonComplete(studentId: string, lessonId: string): Promise<Progress>;

  // --- Question Bank ---
  getQuestions(subjectId?: string, topicId?: string): Promise<Question[]>;
  createQuestion(question: Omit<Question, 'id'>): Promise<Question>;
  updateQuestion(question: Question): Promise<Question>;
  deleteQuestion(questionId: string): Promise<void>;
  
  // Init
  init(): void;
}
