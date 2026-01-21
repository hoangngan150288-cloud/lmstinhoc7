import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Assignment, Submission, User } from '../../types';
import { Edit, Trash2, Plus, Calendar, FileText, CheckCircle, Search, ArrowLeft, Save } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AssignmentsManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'GRADING'>('LIST');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // Grading State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '' });

  // Assignment Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 10,
    type: 'ESSAY' as 'ESSAY' | 'FILE',
    rubric: ''
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    dataProvider.getAssignments().then(setAssignments);
  };

  const handleOpenModal = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxScore: assignment.maxScore,
        type: assignment.type,
        rubric: assignment.rubric || ''
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        maxScore: 10,
        type: 'ESSAY',
        rubric: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAssignment) {
        await dataProvider.updateAssignment({
          ...editingAssignment,
          ...formData
        });
      } else {
        await dataProvider.createAssignment(formData);
      }
      setIsModalOpen(false);
      fetchAssignments();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa bài tập này sẽ xóa toàn bộ bài nộp của học sinh. Tiếp tục?')) {
      await dataProvider.deleteAssignment(id);
      fetchAssignments();
    }
  };

  const handleOpenGrading = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setViewMode('GRADING');
    // Fetch data for grading view
    const [subs, stus] = await Promise.all([
        dataProvider.getSubmissions(assignment.id),
        dataProvider.getStudents()
    ]);
    setSubmissions(subs);
    setStudents(stus);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!gradingSubmission) return;

      await dataProvider.gradeSubmission(gradingSubmission.id, gradeForm.grade, gradeForm.feedback);
      setGradingSubmission(null);
      // Refresh submissions
      if (selectedAssignment) {
          const subs = await dataProvider.getSubmissions(selectedAssignment.id);
          setSubmissions(subs);
      }
  };

  if (viewMode === 'GRADING' && selectedAssignment) {
      return (
          <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => setViewMode('LIST')} className="p-2 hover:bg-gray-200 rounded-lg">
                      <ArrowLeft size={20} />
                  </button>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800">Chấm bài: {selectedAssignment.title}</h2>
                      <p className="text-sm text-gray-500">Hạn nộp: {selectedAssignment.dueDate} | Điểm tối đa: {selectedAssignment.maxScore}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Submission List */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <table className="w-full text-left text-sm text-gray-600">
                          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                              <tr>
                                  <th className="px-6 py-4">Học sinh</th>
                                  <th className="px-6 py-4">Ngày nộp</th>
                                  <th className="px-6 py-4">Điểm số</th>
                                  <th className="px-6 py-4 text-right">Thao tác</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {submissions.map(sub => {
                                  const student = students.find(s => s.id === sub.studentId);
                                  return (
                                      <tr key={sub.id} className="hover:bg-gray-50">
                                          <td className="px-6 py-4 font-medium text-gray-900">
                                              {student ? student.name : 'Unknown Student'}
                                          </td>
                                          <td className="px-6 py-4">{new Date(sub.submittedAt).toLocaleDateString('vi-VN')}</td>
                                          <td className="px-6 py-4">
                                              {sub.grade !== undefined 
                                                ? <span className="font-bold text-blue-600">{sub.grade}/{selectedAssignment.maxScore}</span> 
                                                : <span className="text-gray-400 italic">Chưa chấm</span>
                                              }
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <button 
                                                onClick={() => {
                                                    setGradingSubmission(sub);
                                                    setGradeForm({ grade: sub.grade || 0, feedback: sub.feedback || '' });
                                                }}
                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold hover:bg-blue-200"
                                              >
                                                  Chấm bài
                                              </button>
                                          </td>
                                      </tr>
                                  );
                              })}
                              {submissions.length === 0 && (
                                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Chưa có bài nộp nào.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>

                  {/* Grading Panel */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
                      {gradingSubmission ? (
                          <form onSubmit={handleGradeSubmit} className="space-y-4">
                              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">
                                  Đang chấm: {students.find(s => s.id === gradingSubmission.studentId)?.name}
                              </h3>
                              
                              <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4">
                                  <p className="font-semibold text-gray-700 mb-1">Nội dung bài làm:</p>
                                  <div className="whitespace-pre-wrap text-gray-600">
                                    {selectedAssignment.type === 'FILE' ? (
                                        <a href={gradingSubmission.content} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                                            {gradingSubmission.content}
                                        </a>
                                    ) : (
                                        gradingSubmission.content
                                    )}
                                  </div>
                              </div>

                              {selectedAssignment.rubric && (
                                  <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200">
                                      <strong>Tiêu chí:</strong> {selectedAssignment.rubric}
                                  </div>
                              )}

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số (Max: {selectedAssignment.maxScore})</label>
                                  <input 
                                    type="number" 
                                    max={selectedAssignment.maxScore}
                                    min={0}
                                    value={gradeForm.grade}
                                    onChange={e => setGradeForm({...gradeForm, grade: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                              </div>

                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Lời phê</label>
                                  <textarea 
                                    rows={3}
                                    value={gradeForm.feedback}
                                    onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nhận xét của giáo viên..."
                                  />
                              </div>

                              <div className="flex gap-2 justify-end">
                                  <button type="button" onClick={() => setGradingSubmission(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                      <Save size={16} /> Lưu điểm
                                  </button>
                              </div>
                          </form>
                      ) : (
                          <div className="text-center text-gray-400 py-10">
                              Chọn một bài nộp để bắt đầu chấm.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Bài tập</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={20} /> Tạo bài tập mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assign => (
              <div key={assign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${assign.type === 'FILE' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                          <FileText size={20} />
                      </div>
                      <div className="flex gap-1">
                          <button onClick={() => handleOpenModal(assign)} className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-md"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(assign.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md"><Trash2 size={16}/></button>
                      </div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{assign.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{assign.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar size={14} />
                      <span>Hạn: {assign.dueDate}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">Max: {assign.maxScore}đ</span>
                  </div>

                  <button 
                    onClick={() => handleOpenGrading(assign)}
                    className="w-full py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                      Chấm bài & Xem kết quả
                  </button>
              </div>
          ))}
          {assignments.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-400 italic">Chưa có bài tập nào</div>
          )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? "Cập nhật bài tập" : "Tạo bài tập mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả yêu cầu</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp</label>
               <input 
                 required
                 type="date"
                 value={formData.dueDate}
                 onChange={e => setFormData({...formData, dueDate: e.target.value})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tối đa</label>
               <input 
                 required
                 type="number"
                 value={formData.maxScore}
                 onChange={e => setFormData({...formData, maxScore: Number(e.target.value)})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài tập</label>
            <select
               value={formData.type}
               onChange={e => setFormData({...formData, type: e.target.value as any})}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
                <option value="ESSAY">Tự luận (Nhập text)</option>
                <option value="FILE">Nộp File (Link online)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu chí chấm (Rubric đơn giản)</label>
            <textarea 
              rows={2}
              value={formData.rubric}
              onChange={e => setFormData({...formData, rubric: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="VD: Đúng định dạng: 2đ, Nội dung sáng tạo: 8đ..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingAssignment ? 'Cập nhật' : 'Tạo mới'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
