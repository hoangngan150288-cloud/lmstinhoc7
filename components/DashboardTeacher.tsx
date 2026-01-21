import React, { useEffect, useState } from 'react';
import { dataProvider } from '../services/provider';
import { Class, Announcement, Assignment } from '../types';
import { Users, Bell, BookOpen, Clock, AlertCircle } from 'lucide-react';

export const DashboardTeacher: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [assignmentsDueSoon, setAssignmentsDueSoon] = useState(0);

  useEffect(() => {
    const loadData = async () => {
        const cls = await dataProvider.getClasses();
        setClasses(cls);
        
        // Calculate total students across all classes
        // In a real app we might count unique User objects, but using class.studentCount is faster
        const count = cls.reduce((acc, c) => acc + c.studentCount, 0);
        setTotalStudents(count);

        const anns = await dataProvider.getAnnouncements('');
        setAnnouncements(anns);

        // Assignments due soon (within next 7 days or overdue)
        const allAssignments = await dataProvider.getAssignments();
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        
        const dueSoon = allAssignments.filter(a => {
            const d = new Date(a.dueDate);
            return d >= now && d <= nextWeek;
        }).length;
        setAssignmentsDueSoon(dueSoon);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan lớp học</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng số lớp</p>
            <p className="text-2xl font-bold text-gray-800">{classes.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng học sinh</p>
            <p className="text-2xl font-bold text-gray-800">
                {totalStudents}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bài tập sắp đến hạn</p>
              <p className="text-2xl font-bold text-gray-800">{assignmentsDueSoon}</p>
            </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Danh sách lớp phụ trách</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">Xem tất cả</button>
          </div>
          <div className="p-5">
            <div className="space-y-4">
                {classes.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <p className="font-bold text-lg text-gray-800">{c.name}</p>
                            <p className="text-sm text-gray-500">GVCN: {c.homeroomTeacher || '---'}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-mono font-bold text-gray-700">{c.studentCount}</p>
                           <p className="text-xs text-gray-400">Học sinh</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Thông báo gần đây</h3>
            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50">
                <Bell size={20} />
            </button>
          </div>
          <div className="p-5">
             <div className="space-y-4">
                {announcements.map(a => (
                    <div key={a.id} className="border-l-4 border-blue-500 pl-4 py-1">
                        <h4 className="font-semibold text-gray-800">{a.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.content}</p>
                        <p className="text-xs text-gray-400 mt-2">{a.createdAt}</p>
                    </div>
                ))}
                {announcements.length === 0 && <p className="text-gray-400 italic">Chưa có thông báo nào.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
