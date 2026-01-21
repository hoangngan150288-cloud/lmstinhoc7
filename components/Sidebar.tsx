import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, Home, Layout, Settings, Users, LogOut, GraduationCap, Layers, ClipboardList, Megaphone, PieChart, Database } from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isTeacher = user.role === UserRole.TEACHER;
  const basePath = isTeacher ? '/admin' : '/app';

  const menuItems = isTeacher ? [
    { label: 'Tổng quan', icon: Home, path: '/admin' },
    { label: 'Lớp học', icon: Layers, path: '/admin/classes' },
    { label: 'Học sinh', icon: Users, path: '/admin/students' },
    { label: 'Chương trình', icon: BookOpen, path: '/admin/subjects' },
    { label: 'Ngân hàng câu hỏi', icon: Database, path: '/admin/questions' },
    { label: 'Bài tập', icon: Layout, path: '/admin/assignments' },
    { label: 'Sổ điểm', icon: ClipboardList, path: '/admin/gradebook' },
    { label: 'Thông báo', icon: Megaphone, path: '/admin/announcements' },
    { label: 'Báo cáo', icon: PieChart, path: '/admin/reports' },
  ] : [
    { label: 'Tổng quan', icon: Home, path: '/app' },
    { label: 'Bài học', icon: BookOpen, path: '/app/lessons' },
    { label: 'Bài tập', icon: Layout, path: '/app/assignments' },
    { label: 'Tiến độ', icon: Calendar, path: '/app/progress' },
  ];

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="text-blue-400" />
          LMS Tin Học 7
        </h1>
        <p className="text-xs text-slate-400 mt-1">Kết nối tri thức</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-4 px-2">
           <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full bg-slate-600" />
           <div>
             <p className="text-sm font-semibold">{user.name}</p>
             <p className="text-xs text-slate-400">{isTeacher ? 'Giáo viên' : 'Học sinh'}</p>
           </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors"
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};
