import { IDataProvider } from './dataProvider';
import { 
  User, UserRole, Class, Subject, Topic, Lesson, Assignment, Submission, Announcement, Progress, Question 
} from '../types';

const STORAGE_KEY = 'lms_tinhoc7_data';

// Extended User type for internal DB usage (to store password)
interface DBUser extends User {
    password?: string;
}

interface DB {
  users: DBUser[];
  classes: Class[];
  subjects: Subject[];
  topics: Topic[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  progress: Progress[];
  questions: Question[];
}

const SEED_DB: DB = {
  users: [
    { id: 'u1', name: 'Nguyễn Văn An', email: 'gv.an@school.edu.vn', username: 'gv.an', password: '123', role: UserRole.TEACHER, avatar: 'https://picsum.photos/200' },
    { id: 'u2', name: 'Trần Thị Bình', email: 'hs.binh@school.edu.vn', username: 'hs.binh', password: '123', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://picsum.photos/201', dob: '2010-05-15', parentPhone: '0912345678' },
    { id: 'u3', name: 'Lê Hoàng Cường', email: 'hs.cuong@school.edu.vn', username: 'hs.cuong', password: '123', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://picsum.photos/202', dob: '2010-08-20', parentPhone: '0987654321' },
    { id: 'u4', name: 'Phạm Minh', email: 'hs.minh@school.edu.vn', username: 'hs.minh', password: '123', role: UserRole.STUDENT, classId: 'c2', avatar: 'https://picsum.photos/203', dob: '2010-02-10', parentPhone: '0909090909' },
  ],
  classes: [
    { id: 'c1', name: '7A1', teacherId: 'u1', studentCount: 2, schoolYear: '2023-2024', homeroomTeacher: 'Nguyễn Văn An', joinCode: 'ABC1234' },
    { id: 'c2', name: '7A2', teacherId: 'u1', studentCount: 1, schoolYear: '2023-2024', homeroomTeacher: 'Trần Thị Lan', joinCode: 'XYZ9876' },
  ],
  subjects: [
    { id: 's1', name: 'Tin học 7', description: 'Sách Kết nối tri thức với cuộc sống' }
  ],
  topics: [
    { id: 't1', subjectId: 's1', title: 'Chủ đề 1: Máy tính và cộng đồng', order: 1 },
    { id: 't2', subjectId: 's1', title: 'Chủ đề 2: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin', order: 2 },
    { id: 't3', subjectId: 's1', title: 'Chủ đề 4: Ứng dụng tin học', order: 3 },
  ],
  lessons: [
    { id: 'l1', topicId: 't1', title: 'Bài 1: Thiết bị vào - ra', order: 1, content: 'Nội dung bài học về các thiết bị nhập xuất cơ bản...', videoUrl: 'https://www.youtube.com/embed/placeholder', status: 'PUBLISHED', documentUrl: 'https://example.com/doc1.pdf' },
    { id: 'l2', topicId: 't1', title: 'Bài 2: Phần mềm máy tính', order: 2, content: 'Phân loại phần mềm hệ thống và phần mềm ứng dụng...', videoUrl: 'https://www.youtube.com/embed/placeholder', status: 'PUBLISHED' },
    { id: 'l3', topicId: 't2', title: 'Bài 4: Mạng xã hội và một số kênh trao đổi thông tin', order: 1, content: 'Tìm hiểu về Facebook, Zalo và văn hóa ứng xử...', videoUrl: 'https://www.youtube.com/embed/placeholder', status: 'DRAFT' },
    { id: 'l4', topicId: 't3', title: 'Bài 7: Phần mềm bảng tính', order: 1, content: 'Làm quen với Microsoft Excel, nhập dữ liệu...', videoUrl: 'https://www.youtube.com/embed/placeholder', status: 'PUBLISHED' },
  ],
  assignments: [
    { id: 'a1', lessonId: 'l1', title: 'Bài tập trắc nghiệm Thiết bị vào - ra', description: 'Hãy liệt kê 5 thiết bị vào và 5 thiết bị ra mà em biết.', dueDate: '2023-12-31', maxScore: 10, type: 'ESSAY', rubric: 'Đúng mỗi thiết bị được 1 điểm' },
    { id: 'a2', lessonId: 'l4', title: 'Thực hành tạo bảng điểm', description: 'Tạo bảng tính điểm tổng kết lớp em và dùng hàm AVERAGE.', dueDate: '2023-12-31', maxScore: 10, type: 'FILE', rubric: 'Trình bày đẹp: 2đ, Hàm đúng: 5đ, Dữ liệu đầy đủ: 3đ' },
  ],
  submissions: [
    { id: 'sub1', assignmentId: 'a1', studentId: 'u2', content: 'Thiết bị vào: Chuột, Phím, Mic... Thiết bị ra: Màn hình, Loa...', submittedAt: '2023-10-10', grade: 9, feedback: 'Làm tốt lắm' }
  ],
  announcements: [
    { id: 'ann1', classId: 'c1', teacherId: 'u1', title: 'Lịch kiểm tra 15 phút', content: 'Các em ôn tập bài 1 và 2 để chuẩn bị kiểm tra vào thứ 5 nhé.', target: 'STUDENT', createdAt: '2023-10-01' },
    { id: 'ann2', classId: 'c1', teacherId: 'u1', title: 'Họp phụ huynh đầu năm', content: 'Kính mời phụ huynh tham gia họp vào 8h sáng Chủ nhật.', target: 'PARENT', createdAt: '2023-09-15' }
  ],
  progress: [
    { studentId: 'u2', lessonId: 'l1', completed: true, lastAccess: '2023-10-01' }
  ],
  questions: [
      {
          id: 'q1',
          subjectId: 's1',
          topicId: 't1',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          content: 'Thiết bị nào sau đây là thiết bị VÀO?',
          options: ['Màn hình', 'Máy in', 'Bàn phím', 'Loa'],
          correctAnswer: 'Bàn phím',
          explanation: 'Bàn phím dùng để nhập dữ liệu vào máy tính.'
      },
      {
          id: 'q2',
          subjectId: 's1',
          topicId: 't1',
          type: 'SHORT_ANSWER',
          difficulty: 'MEDIUM',
          content: 'CPU là viết tắt của cụm từ tiếng Anh nào?',
          correctAnswer: 'Central Processing Unit',
          explanation: 'Bộ xử lý trung tâm.'
      },
      {
          id: 'q3',
          subjectId: 's1',
          topicId: 't1',
          type: 'FILL_IN_THE_BLANK',
          difficulty: 'MEDIUM',
          content: 'Máy quét (Scanner) là thiết bị ___',
          correctAnswer: 'vào',
          explanation: 'Máy quét đưa hình ảnh vào máy tính.'
      },
      {
          id: 'q4',
          subjectId: 's1',
          topicId: 't1',
          type: 'ORDERING',
          difficulty: 'HARD',
          content: 'Sắp xếp các bước tắt máy tính đúng quy trình:',
          options: ['Nhấn nút Start', 'Chọn Power', 'Chọn Shut down'],
          correctAnswer: ['Nhấn nút Start', 'Chọn Power', 'Chọn Shut down'],
          explanation: 'Đây là quy trình chuẩn trên Windows.'
      }
  ]
};

class MockProvider implements IDataProvider {
  private db: DB;
  private currentUser: User | null = null;

  constructor() {
    this.db = SEED_DB;
  }

  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.db = JSON.parse(stored);
    } else {
      this.seedData();
    }
  }

  seedData() {
    this.db = SEED_DB;
    this.save();
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  async login(username: string, password: string): Promise<User> {
    const user = this.db.users.find(u => u.username === username);
    
    // Check password (default 123)
    if (user && (user.password === password || password === '123')) {
        const { password, ...safeUser } = user;
        this.currentUser = safeUser;
        return safeUser;
    }
    throw new Error('Sai tên đăng nhập hoặc mật khẩu');
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  // --- Classes ---
  async getClasses(teacherId?: string): Promise<Class[]> {
    if (teacherId) {
      return this.db.classes.filter(c => c.teacherId === teacherId);
    }
    return this.db.classes;
  }

  async createClass(cls: Omit<Class, 'id' | 'studentCount'>): Promise<Class> {
    const newClass: Class = {
      ...cls,
      id: Math.random().toString(36).substr(2, 9),
      studentCount: 0
    };
    this.db.classes.push(newClass);
    this.save();
    return newClass;
  }

  async updateClass(cls: Class): Promise<Class> {
    const index = this.db.classes.findIndex(c => c.id === cls.id);
    if (index !== -1) {
      this.db.classes[index] = cls;
      this.save();
      return cls;
    }
    throw new Error("Class not found");
  }

  async deleteClass(classId: string): Promise<void> {
    this.db.classes = this.db.classes.filter(c => c.id !== classId);
    this.save();
  }

  // --- Students ---
  async getStudents(classId?: string): Promise<User[]> {
    if (classId) {
      return this.db.users.filter(u => u.role === UserRole.STUDENT && u.classId === classId);
    }
    return this.db.users.filter(u => u.role === UserRole.STUDENT);
  }

  async createStudent(student: Omit<User, 'id' | 'role' | 'avatar'>): Promise<User> {
    const newUser: DBUser = {
      ...student,
      id: Math.random().toString(36).substr(2, 9),
      role: UserRole.STUDENT,
      password: student.password || '123', // Use provided password or default '123'
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
    };
    this.db.users.push(newUser);
    if (student.classId) {
        const cls = this.db.classes.find(c => c.id === student.classId);
        if (cls) {
            cls.studentCount += 1;
        }
    }
    this.save();
    // Return safe user
    const { password, ...safeUser } = newUser;
    return safeUser;
  }

  async updateStudent(student: User): Promise<User> {
    const index = this.db.users.findIndex(u => u.id === student.id);
    if (index !== -1) {
        // Use new password if provided, otherwise keep existing
        const existingPassword = this.db.users[index].password;
        const newPassword = student.password || existingPassword;
        
        this.db.users[index] = { ...student, password: newPassword };
        this.save();
        return student;
    }
    throw new Error("Student not found");
  }

  async deleteStudent(studentId: string): Promise<void> {
    const user = this.db.users.find(u => u.id === studentId);
    if (user && user.classId) {
         const cls = this.db.classes.find(c => c.id === user.classId);
        if (cls) cls.studentCount = Math.max(0, cls.studentCount - 1);
    }
    this.db.users = this.db.users.filter(u => u.id !== studentId);
    this.save();
  }

  // --- Topics & Subjects ---
  async getSubjects(): Promise<Subject[]> {
    return this.db.subjects;
  }

  async getTopics(subjectId: string): Promise<Topic[]> {
    return this.db.topics.filter(t => t.subjectId === subjectId).sort((a,b) => a.order - b.order);
  }

  async createTopic(topic: Omit<Topic, 'id'>): Promise<Topic> {
    const newTopic = { ...topic, id: Math.random().toString(36).substr(2, 9) };
    this.db.topics.push(newTopic);
    this.save();
    return newTopic;
  }

  async updateTopic(topic: Topic): Promise<Topic> {
     const index = this.db.topics.findIndex(t => t.id === topic.id);
     if (index !== -1) {
         this.db.topics[index] = topic;
         this.save();
         return topic;
     }
     throw new Error("Topic not found");
  }

  async deleteTopic(topicId: string): Promise<void> {
      this.db.topics = this.db.topics.filter(t => t.id !== topicId);
      this.save();
  }

  // --- Lessons ---
  async getLessons(topicId?: string): Promise<Lesson[]> {
    if (topicId) {
        return this.db.lessons.filter(l => l.topicId === topicId).sort((a,b) => a.order - b.order);
    }
    return this.db.lessons.sort((a,b) => a.order - b.order);
  }

  async createLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson> {
    const newLesson = { ...lesson, id: Math.random().toString(36).substr(2, 9) };
    this.db.lessons.push(newLesson);
    this.save();
    return newLesson;
  }

  async updateLesson(lesson: Lesson): Promise<Lesson> {
    const index = this.db.lessons.findIndex(l => l.id === lesson.id);
    if (index !== -1) {
        this.db.lessons[index] = lesson;
        this.save();
        return lesson;
    }
    throw new Error("Lesson not found");
  }

  async deleteLesson(lessonId: string): Promise<void> {
    this.db.lessons = this.db.lessons.filter(l => l.id !== lessonId);
    this.save();
  }

  // --- Assignments & Submissions ---
  async getAssignments(classId?: string): Promise<Assignment[]> {
    return this.db.assignments;
  }

  async createAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment = { ...assignment, id: Math.random().toString(36).substr(2, 9) };
    this.db.assignments.push(newAssignment);
    this.save();
    return newAssignment;
  }

  async updateAssignment(assignment: Assignment): Promise<Assignment> {
    const index = this.db.assignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
        this.db.assignments[index] = assignment;
        this.save();
        return assignment;
    }
    throw new Error("Assignment not found");
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    this.db.assignments = this.db.assignments.filter(a => a.id !== assignmentId);
    this.db.submissions = this.db.submissions.filter(s => s.assignmentId !== assignmentId);
    this.save();
  }

  // --- Announcements ---
  async getAnnouncements(classId?: string): Promise<Announcement[]> {
    if (classId) return this.db.announcements.filter(a => a.classId === classId);
    return this.db.announcements; 
  }

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    const newAnn = {
      ...announcement,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0] // Simple YYYY-MM-DD
    };
    this.db.announcements.unshift(newAnn); // Add to top
    this.save();
    return newAnn;
  }

  // --- Submissions ---
  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    return this.db.submissions.filter(s => s.assignmentId === assignmentId);
  }

  async getMySubmissions(studentId: string): Promise<Submission[]> {
    return this.db.submissions.filter(s => s.studentId === studentId);
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return this.db.submissions;
  }

  async submitAssignment(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> {
    const existingIndex = this.db.submissions.findIndex(s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId);
    
    if (existingIndex > -1) {
       const updated = {
         ...this.db.submissions[existingIndex],
         ...submission,
         submittedAt: new Date().toISOString()
       };
       this.db.submissions[existingIndex] = updated;
       this.save();
       return updated;
    }

    const newSub: Submission = {
      ...submission,
      id: Math.random().toString(36).substr(2, 9),
      submittedAt: new Date().toISOString()
    };
    this.db.submissions.push(newSub);
    this.save();
    return newSub;
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string): Promise<Submission> {
    const subIndex = this.db.submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) throw new Error("Submission not found");
    
    this.db.submissions[subIndex].grade = grade;
    this.db.submissions[subIndex].feedback = feedback;
    this.save();
    return this.db.submissions[subIndex];
  }

  // --- Progress ---
  async getProgress(studentId: string): Promise<Progress[]> {
    return this.db.progress.filter(p => p.studentId === studentId);
  }

  async getAllProgress(): Promise<Progress[]> {
    return this.db.progress;
  }

  async markLessonComplete(studentId: string, lessonId: string): Promise<Progress> {
    const existingIndex = this.db.progress.findIndex(p => p.studentId === studentId && p.lessonId === lessonId);
    const prog: Progress = {
        studentId, 
        lessonId,
        completed: true,
        lastAccess: new Date().toISOString()
    };

    if (existingIndex > -1) {
        this.db.progress[existingIndex] = prog;
    } else {
        this.db.progress.push(prog);
    }
    this.save();
    return prog;
  }

  // --- Question Bank ---
  async getQuestions(subjectId?: string, topicId?: string): Promise<Question[]> {
      let result = this.db.questions;
      if (subjectId) {
          result = result.filter(q => q.subjectId === subjectId);
      }
      if (topicId) {
          result = result.filter(q => q.topicId === topicId);
      }
      return result;
  }

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
      const newQuestion = {
          ...question,
          id: Math.random().toString(36).substr(2, 9)
      };
      this.db.questions.push(newQuestion);
      this.save();
      return newQuestion;
  }

  async updateQuestion(question: Question): Promise<Question> {
      const index = this.db.questions.findIndex(q => q.id === question.id);
      if (index !== -1) {
          this.db.questions[index] = question;
          this.save();
          return question;
      }
      throw new Error("Question not found");
  }

  async deleteQuestion(questionId: string): Promise<void> {
      this.db.questions = this.db.questions.filter(q => q.id !== questionId);
      this.save();
  }
}

export const mockProvider = new MockProvider();
