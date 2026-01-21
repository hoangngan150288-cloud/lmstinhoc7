import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Assignment, Class, Submission, User } from '../../types';
import { Filter, Download } from 'lucide-react';

export const Gradebook: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  useEffect(() => {
    const initData = async () => {
        const [cls, assigns, allSubs] = await Promise.all([
            dataProvider.getClasses(),
            dataProvider.getAssignments(),
            dataProvider.getAllSubmissions()
        ]);
        setClasses(cls);
        setAssignments(assigns);
        setSubmissions(allSubs);
        
        if (cls.length > 0) {
            setSelectedClassId(cls[0].id);
        }
    };
    initData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
        dataProvider.getStudents(selectedClassId).then(setStudents);
    } else {
        setStudents([]);
    }
  }, [selectedClassId]);

  const getScore = (studentId: string, assignmentId: string) => {
      const sub = submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
      if (!sub) return { text: '-', className: 'text-gray-300' };
      if (sub.grade === undefined) return { text: 'Chấm', className: 'text-orange-500 font-medium text-xs bg-orange-50 px-2 py-1 rounded' };
      return { text: sub.grade.toString(), className: 'font-bold text-gray-800' };
  };

  const calculateAverage = (studentId: string) => {
      const studentSubs = submissions.filter(s => s.studentId === studentId && s.grade !== undefined);
      if (studentSubs.length === 0) return '-';
      
      const total = studentSubs.reduce((sum, s) => sum + (s.grade || 0), 0);
      return (total / studentSubs.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Sổ điểm lớp học</h2>
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Filter size={18} className="text-gray-500" />
                <select 
                    value={selectedClassId}
                    onChange={e => setSelectedClassId(e.target.value)}
                    className="bg-transparent outline-none text-sm text-gray-700 font-medium"
                >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                 <Download size={18} /> Xuất Excel
             </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                 <tr>
                    <th className="px-6 py-4 sticky left-0 bg-gray-50 min-w-[200px] z-10 border-r border-gray-100">Họ và tên</th>
                    {assignments.map(a => (
                        <th key={a.id} className="px-4 py-4 min-w-[120px] text-center">
                            <div className="line-clamp-1" title={a.title}>{a.title}</div>
                            <div className="text-[10px] text-gray-400 font-normal">Max: {a.maxScore}</div>
                        </th>
                    ))}
                    <th className="px-6 py-4 text-center font-black text-blue-600 min-w-[100px] bg-blue-50/50">Trung bình</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {students.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-100 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                               {student.name.charAt(0)}
                           </div>
                           {student.name}
                       </td>
                       {assignments.map(a => {
                           const { text, className } = getScore(student.id, a.id);
                           return (
                               <td key={a.id} className="px-4 py-4 text-center">
                                   <span className={className}>{text}</span>
                               </td>
                           );
                       })}
                       <td className="px-6 py-4 text-center font-bold text-blue-700 bg-blue-50/20">
                           {calculateAverage(student.id)}
                       </td>
                    </tr>
                 ))}
                 {students.length === 0 && (
                     <tr>
                         <td colSpan={assignments.length + 2} className="px-6 py-10 text-center text-gray-400 italic">
                             Chọn lớp học để xem danh sách điểm
                         </td>
                     </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
