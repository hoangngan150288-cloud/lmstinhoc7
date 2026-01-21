import React, { useEffect, useState } from 'react';
import { dataProvider } from '../services/provider';
import { Announcement, User } from '../types';
import { Bell, BookOpen, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudentLearning } from './StudentLearning';

export const StudentDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const u = await dataProvider.getCurrentUser();
        setUser(u);
        if (u) {
            // Get announcements for this student's class
            const allAnns = await dataProvider.getAnnouncements(u.classId || '');
            // Filter targets: ALL or STUDENT
            const filteredAnns = allAnns.filter(a => a.target === 'ALL' || a.target === 'STUDENT');
            setAnnouncements(filteredAnns);

            const prog = await dataProvider.getProgress(u.id);
            setProgress(prog);
        }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row gap-6">
           {/* Left Column: Welcome & Current Lesson */}
           <div className="flex-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Xin chào, {user?.name}! 👋</h2>
                    <p className="text-gray-500 mb-6">Chúc bạn một ngày học tập hiệu quả.</p>
                    
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-2 opacity-90">
                                 <BookOpen size={18} />
                                 <span className="text-sm font-medium uppercase tracking-wider">Bài học hiện tại</span>
                             </div>
                             <h3 className="text-2xl font-bold mb-4">Bài 1: Thiết bị vào - ra</h3>
                             <Link to="/app/lessons" className="inline-block px-5 py-2 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors">
                                 Tiếp tục học ngay
                             </Link>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                            <BookOpen size={200} />
                        </div>
                    </div>
                </div>
                
                {/* Inline Learning Component for quick access */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                     <div className="p-4 border-b border-gray-100 font-bold text-gray-800">Nội dung bài học</div>
                     <div className="h-96">
                        <StudentLearning />
                     </div>
                </div>
           </div>

           {/* Right Column: Announcements & Stats */}
           <div className="w-full md:w-80 space-y-6">
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-4 border-b border-gray-100 bg-red-50 flex items-center gap-2">
                       <Bell size={18} className="text-red-500" />
                       <h3 className="font-bold text-red-700">Thông báo mới</h3>
                   </div>
                   <div className="divide-y divide-gray-100">
                       {announcements.slice(0, 5).map(ann => (
                           <div key={ann.id} className="p-4 hover:bg-gray-50">
                               <h4 className="font-bold text-gray-800 text-sm mb-1">{ann.title}</h4>
                               <p className="text-xs text-gray-500 line-clamp-2 mb-2">{ann.content}</p>
                               <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                   <Calendar size={10} /> {ann.createdAt}
                               </div>
                           </div>
                       ))}
                       {announcements.length === 0 && (
                           <div className="p-6 text-center text-gray-400 text-sm">Không có thông báo mới.</div>
                       )}
                   </div>
               </div>

               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                   <h3 className="font-bold text-gray-800 mb-4">Tiến độ của tôi</h3>
                   <div className="flex items-center gap-4 mb-4">
                       <div className="p-3 bg-green-100 text-green-600 rounded-full">
                           <BookOpen size={20} />
                       </div>
                       <div>
                           <p className="text-2xl font-bold text-gray-800">{progress.filter(p => p.completed).length}</p>
                           <p className="text-xs text-gray-500">Bài đã hoàn thành</p>
                       </div>
                   </div>
                   <Link to="/app/progress" className="w-full py-2 flex items-center justify-center gap-1 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium">
                       Xem chi tiết <ChevronRight size={14} />
                   </Link>
               </div>
           </div>
       </div>
    </div>
  );
};
