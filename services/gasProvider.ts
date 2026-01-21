import { IDataProvider } from './dataProvider';
import { 
  User, Class, Subject, Topic, Lesson, Assignment, Submission, Announcement, Progress, Question 
} from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbwbkW9w4BbJ40EO8l91tFifoh3N5KRAa_oY_nTTbqwzr67LpvB-ngjM5sfurcJiguFC/exec";

class GasProvider implements IDataProvider {
  private currentUser: User | null = null;

  constructor() {
    try {
        const saved = localStorage.getItem('lms_user');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to restore user session", e);
    }
  }

  init() {
    // No specific initialization needed for REST
  }

  private async callAPI(action: string, payload: any = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            // Google Apps Script Web App default behavior with CORS often requires text/plain content type 
            // to skip the OPTIONS preflight request which GAS doesn't handle natively.
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ action, payload })
        });

        const json = await response.json();
        
        if (!json.ok) {
            throw new Error(json.error || 'Unknown error from server');
        }
        
        return json.data;
    } catch (error) {
        console.error(`API Call Failed [${action}]:`, error);
        throw error;
    }
  }

  // --- Auth ---
  async login(username: string, password: string): Promise<User> {
      const user = await this.callAPI('login', { username, password });
      this.currentUser = user;
      localStorage.setItem('lms_user', JSON.stringify(user));
      return user;
  }

  async getCurrentUser(): Promise<User | null> {
      return this.currentUser;
  }

  // --- Students ---
  async getStudents(classId?: string): Promise<User[]> {
      return this.callAPI('students.list', { classId });
  }

  async createStudent(student: any): Promise<User> {
      return this.callAPI('students.create', student);
  }

  async updateStudent(student: User): Promise<User> {
      return this.callAPI('students.update', student);
  }

  async deleteStudent(id: string): Promise<void> {
      return this.callAPI('students.delete', { id });
  }

  // --- Classes ---
  async getClasses(teacherId?: string): Promise<Class[]> {
      const classes = await this.callAPI('classes.list');
      // Client-side filter if needed, as backend 'classes.list' returns all
      if (teacherId) {
          return classes.filter((c: Class) => c.teacherId === teacherId);
      }
      return classes;
  }

  async createClass(cls: any): Promise<Class> {
      return this.callAPI('classes.create', cls);
  }

  async updateClass(cls: Class): Promise<Class> {
      return this.callAPI('classes.update', cls);
  }

  async deleteClass(id: string): Promise<void> {
      return this.callAPI('classes.delete', { id });
  }

  // --- Subjects / Topics ---
  async getSubjects(): Promise<Subject[]> {
      return this.callAPI('subjects.list');
  }

  async getTopics(subjectId: string): Promise<Topic[]> {
      return this.callAPI('topics.list', { subjectId });
  }

  async createTopic(topic: any): Promise<Topic> {
      return this.callAPI('topics.create', topic);
  }

  async updateTopic(topic: Topic): Promise<Topic> {
      return this.callAPI('topics.update', topic);
  }

  async deleteTopic(id: string): Promise<void> {
      return this.callAPI('topics.delete', { id });
  }

  // --- Lessons ---
  async getLessons(topicId?: string): Promise<Lesson[]> {
      return this.callAPI('lessons.list', { topicId });
  }

  async createLesson(lesson: any): Promise<Lesson> {
      return this.callAPI('lessons.create', lesson);
  }

  async updateLesson(lesson: Lesson): Promise<Lesson> {
      return this.callAPI('lessons.update', lesson);
  }

  async deleteLesson(id: string): Promise<void> {
      return this.callAPI('lessons.delete', { id });
  }

  // --- Assignments ---
  async getAssignments(classId?: string): Promise<Assignment[]> {
      // Backend returns all currently
      return this.callAPI('assignments.list');
  }

  async createAssignment(assignment: any): Promise<Assignment> {
      return this.callAPI('assignments.create', assignment);
  }

  async updateAssignment(assignment: Assignment): Promise<Assignment> {
      return this.callAPI('assignments.update', assignment);
  }

  async deleteAssignment(id: string): Promise<void> {
      return this.callAPI('assignments.delete', { id });
  }

  // --- Submissions ---
  async getSubmissions(assignmentId: string): Promise<Submission[]> {
      return this.callAPI('submissions.list', { assignmentId });
  }

  async getMySubmissions(studentId: string): Promise<Submission[]> {
      return this.callAPI('submissions.list', { studentId });
  }

  async getAllSubmissions(): Promise<Submission[]> {
      return this.callAPI('submissions.list', {});
  }

  async submitAssignment(submission: any): Promise<Submission> {
      return this.callAPI('submissions.submit', submission);
  }

  async gradeSubmission(id: string, grade: number, feedback: string): Promise<Submission> {
      return this.callAPI('submissions.grade', { id, grade, feedback });
  }

  // --- Progress ---
  async getProgress(studentId: string): Promise<Progress[]> {
      return this.callAPI('progress.list', { studentId });
  }

  async getAllProgress(): Promise<Progress[]> {
      return this.callAPI('progress.list', {});
  }

  async markLessonComplete(studentId: string, lessonId: string): Promise<Progress> {
      return this.callAPI('progress.update', { studentId, lessonId, completed: true });
  }

  // --- Announcements ---
  async getAnnouncements(classId?: string): Promise<Announcement[]> {
      return this.callAPI('announcements.list', { classId });
  }

  async createAnnouncement(ann: any): Promise<Announcement> {
      return this.callAPI('announcements.create', ann);
  }

  // --- Question Bank ---
  async getQuestions(subjectId?: string, topicId?: string): Promise<Question[]> {
      let result = await this.callAPI('questions.list');
      if (subjectId) {
          result = result.filter((q: Question) => q.subjectId === subjectId);
      }
      if (topicId) {
          result = result.filter((q: Question) => q.topicId === topicId);
      }
      return result;
  }

  async createQuestion(question: any): Promise<Question> {
      return this.callAPI('questions.create', question);
  }

  async updateQuestion(question: Question): Promise<Question> {
      // Note: If backend does not implement questions.update, this will throw an error.
      // Based on typical CRUD generation, check backend capabilities.
      return this.callAPI('questions.update', question);
  }

  async deleteQuestion(id: string): Promise<void> {
      return this.callAPI('questions.delete', { id });
  }
}

export const gasProvider = new GasProvider();
