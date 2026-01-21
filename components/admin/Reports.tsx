import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Class, User, Submission, Assignment, Progress, Lesson } from '../../types';
import { AlertTriangle, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export const Reports: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Stats
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [onTimeRate, setOnTimeRate] = useState(0);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);

  useEffect(() => {
    dataProvider.getClasses().then(cls => {
        setClasses(cls);
        if (cls.length > 0) setSelectedClassId(cls[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    calculateStats();
  }, [selectedClassId]);

  const calculateStats = async () => {
      setLoading(true);
      const [students, assignments, submissions, allProgress, allLessons] = await Promise.all([
          dataProvider.getStudents(selectedClassId),
          dataProvider.getAssignments(), // In real app, filter by class
          dataProvider.getAllSubmissions(),
          dataProvider.getAllProgress(),
          dataProvider.getLessons() // To count published lessons
      ]);

      const publishedLessonsCount = allLessons.filter(l => l.status === 'PUBLISHED').length;

      // 1. Completion Rate (Lessons)
      let totalExpectedLessons = students.length * publishedLessonsCount;
      let totalCompletedLessons = 0;
      
      students.forEach(s => {
          const sProgress = allProgress.filter(p => p.studentId === s.id && p.completed);
          totalCompletedLessons += sProgress.length;
      });
      
      const compRate = totalExpectedLessons > 0 ? Math.round((totalCompletedLessons / totalExpectedLessons) * 100) : 0;
      setCompletionRate(compRate);

      // 2. On-Time Submission Rate & At Risk Logic
      let totalSubmissions = 0;
      let onTimeSubmissions = 0;
      const riskList: any[] = [];

      for (const student of students) {
          let lateCount = 0;
          let totalScore = 0;
          let gradedCount = 0;

          // Check assignments
          for (const assign of assignments) {
             const sub = submissions.find(s => s.studentId === student.id && s.assignmentId === assign.id);
             
             if (sub) {
                 totalSubmissions++;
                 const isLate = new Date(sub.submittedAt) > new Date(assign.dueDate);
                 if (!isLate) {
                     onTimeSubmissions++;
                 } else {
                     lateCount++;
                 }

                 if (sub.grade !== undefined) {
                     totalScore += sub.grade;
                     gradedCount++;
                 }
             } else {
                 // Not submitted yet
                 const isOverdue = new Date() > new Date(assign.dueDate);
                 if (isOverdue) lateCount++;
             }
          }

          const avgScore = gradedCount > 0 ? (totalScore / gradedCount) : 0;
          
          // Risk Condition: > 2 late/missing assignments OR Avg Score < 5.0 (if graded)
          if (lateCount > 2 || (gradedCount > 0 && avgScore < 5.0)) {
              riskList.push({
                  ...student,
                  lateCount,
                  avgScore: avgScore.toFixed(1)
              });
          }
      }

      const timeRate = totalSubmissions > 0 ? Math.round((onTimeSubmissions / totalSubmissions) * 100) : 0;
      setOnTimeRate(timeRate);
      setAtRiskStudents(riskList);
      setLoading(false);
  };

  if (loading && !selectedClassId) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Báo cáo & Thống kê</h2>
          <select 
             value={selectedClassId}
             onChange={e => setSelectedClassId(e.target.value)}
             className="px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white font-medium"
          >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <TrendingUp size={24} />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{completionRate}%</span>
              </div>
              <h3 className="font-bold text-gray-700">Tiến độ học tập</h3>
              <p className="text-sm text-gray-500 mb-4">Tỷ lệ hoàn thành bài giảng toàn lớp</p>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${completionRate}%` }}></div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                      <Clock size={24} />
                  </div>
                  <span className="text-2xl font-bold text-green-600">{onTimeRate}%</span>
              </div>
              <h3 className="font-bold text-gray-700">Nộp bài đúng hạn</h3>
              <p className="text-sm text-gray-500 mb-4">Tỷ lệ bài tập được nộp trước deadline</p>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${onTimeRate}%` }}></div>
              </div>
          </div>
      </div>

      {/* At Risk Section */}
      <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="p-5 border-b border-red-50 bg-red-50/50 flex items-center gap-3">
              <AlertTriangle className="text-red-500" />
              <h3 className="font-bold text-red-700">Học sinh cần hỗ trợ (At Risk)</h3>
          </div>
          <div className="p-0">
             {atRiskStudents.length > 0 ? (
                 <table className="w-full text-left text-sm text-gray-600">
                     <thead className="bg-gray-50 text-gray-700 font-semibold">
                         <tr>
                             <th className="px-6 py-4">Học sinh</th>
                             <th className="px-6 py-4">Vấn đề gặp phải</th>
                             <th className="px-6 py-4 text-center">Điểm TB</th>
                             <th className="px-6 py-4 text-center">Bài nộp muộn/thiếu</th>
                             <th className="px-6 py-4 text-right">Hành động</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {atRiskStudents.map(s => (
                             <tr key={s.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 font-bold text-gray-800">{s.name}</td>
                                 <td className="px-6 py-4 text-red-600">
                                     {Number(s.avgScore) < 5.0 && <span className="block">• Điểm trung bình thấp</span>}
                                     {s.lateCount > 2 && <span className="block">• Thường xuyên nộp muộn</span>}
                                 </td>
                                 <td className="px-6 py-4 text-center font-mono">{s.avgScore}</td>
                                 <td className="px-6 py-4 text-center font-mono">{s.lateCount}</td>
                                 <td className="px-6 py-4 text-right">
                                     <button className="text-blue-600 hover:underline text-xs font-medium">Gửi nhắc nhở</button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             ) : (
                 <div className="p-8 text-center text-green-600 flex flex-col items-center gap-2">
                     <CheckCircle size={32} />
                     <p className="font-medium">Tuyệt vời! Không có học sinh nào trong nhóm nguy cơ.</p>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};
