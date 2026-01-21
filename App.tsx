import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardTeacher } from './components/DashboardTeacher';
import { ClassesManager } from './components/admin/ClassesManager';
import { StudentsManager } from './components/admin/StudentsManager';
import { CurriculumManager } from './components/admin/CurriculumManager';
import { LessonsManager } from './components/admin/LessonsManager';
import { AssignmentsManager } from './components/admin/AssignmentsManager';
import { QuestionBankManager } from './components/admin/QuestionBankManager';
import { Gradebook } from './components/admin/Gradebook';
import { AnnouncementsManager } from './components/admin/AnnouncementsManager';
import { Reports } from './components/admin/Reports';
import { StudentLearning } from './components/StudentLearning';
import { StudentAssignments } from './components/StudentAssignments';
import { StudentDashboard } from './components/StudentDashboard';
import { dataProvider } from './services/provider';
import { User, UserRole } from './types';
import { LogIn, User as UserIcon, Lock, KeyRound } from 'lucide-react';

// Landing/Login Page
const LandingPage: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
          const user = await dataProvider.login(username, password);
          onLogin(user);
      } catch (err: any) {
          setError(err.message || 'Đăng nhập thất bại');
      } finally {
          setLoading(false);
      }
  };

  const fillCredentials = (type: 'TEACHER' | 'STUDENT') => {
      if (type === 'TEACHER') {
          setUsername('gv.an');
          setPassword('123');
      } else {
          setUsername('hs.binh');
          setPassword('123');
      }
      setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 transform -rotate-3">
                <span className="text-2xl font-bold">LMS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Tin Học 7</h1>
            <p className="text-gray-500 text-sm mt-1">Kết nối tri thức với cuộc sống</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-100 animate-pulse">
                    {error}
                </div>
            )}
            
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 pl-1">Tên đăng nhập</label>
                <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="VD: hs.nam"
                    />
                </div>
            </div>
            
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 pl-1">Mật khẩu</label>
                <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="••••••"
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {loading ? 'Đang xử lý...' : <><LogIn size={20} /> Đăng nhập</>}
            </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 uppercase font-bold tracking-wider mb-3">Tài khoản Demo</p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    type="button"
                    onClick={() => fillCredentials('TEACHER')}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                >
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">Giáo viên</span>
                    <span className="text-[10px] text-gray-400 mt-1">gv.an</span>
                </button>
                <button 
                    type="button"
                    onClick={() => fillCredentials('STUDENT')}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                >
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">Học sinh</span>
                    <span className="text-[10px] text-gray-400 mt-1">hs.binh</span>
                </button>
            </div>
            <div className="text-center mt-3 text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <KeyRound size={10} /> Mật khẩu chung: 123
            </div>
        </div>
      </div>
    </div>
  );
};

const MainLayout: React.FC<{ user: User | null, onLogout: () => void }> = ({ user, onLogout }) => {
    if (!user) return <Navigate to="/" />;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar user={user} onLogout={onLogout} />
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (u: User) => {
      setUser(u);
  };

  const handleLogout = () => {
      setUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
            !user 
            ? <LandingPage onLogin={handleLogin} /> 
            : <Navigate to={user.role === UserRole.TEACHER ? "/admin" : "/app"} />
        } />

        {/* Teacher Routes */}
        <Route path="/admin" element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<DashboardTeacher />} />
            <Route path="classes" element={<ClassesManager />} />
            <Route path="students" element={<StudentsManager />} />
            <Route path="subjects" element={<CurriculumManager />} />
            <Route path="lessons" element={<LessonsManager />} />
            <Route path="questions" element={<QuestionBankManager />} />
            <Route path="assignments" element={<AssignmentsManager />} />
            <Route path="gradebook" element={<Gradebook />} />
            <Route path="announcements" element={<AnnouncementsManager />} />
            <Route path="reports" element={<Reports />} />
        </Route>

        {/* Student Routes */}
        <Route path="/app" element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<StudentDashboard />} />
            <Route path="lessons" element={<StudentLearning />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="progress" element={<div className="text-center mt-10">Bảng theo dõi tiến độ (Chi tiết đang phát triển)</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
