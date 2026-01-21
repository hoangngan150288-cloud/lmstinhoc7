import React, { useEffect, useState } from 'react';
import { dataProvider } from '../services/provider';
import { Assignment, Submission } from '../types';
import { FileText, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Modal } from './common/Modal';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
        const u = await dataProvider.getCurrentUser();
        setUser(u);
        if (u) {
            const [assigns, subs] = await Promise.all([
                dataProvider.getAssignments(),
                dataProvider.getMySubmissions(u.id)
            ]);
            setAssignments(assigns);
            setMySubmissions(subs);
        }
    };
    loadData();
  }, []);

  const getStatus = (assignment: Assignment) => {
      const sub = mySubmissions.find(s => s.assignmentId === assignment.id);
      if (sub) return { label: 'Đã nộp', color: 'text-green-600 bg-green-50', icon: CheckCircle };
      
      const isOverdue = new Date(assignment.dueDate) < new Date();
      if (isOverdue) return { label: 'Quá hạn', color: 'text-red-600 bg-red-50', icon: AlertCircle };
      
      return { label: 'Chưa làm', color: 'text-gray-600 bg-gray-100', icon: Clock };
  };

  const handleOpenAssignment = (assign: Assignment) => {
      setSelectedAssignment(assign);
      const sub = mySubmissions.find(s => s.assignmentId === assign.id);
      setSubmissionContent(sub?.content || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAssignment || !user) return;

      await dataProvider.submitAssignment({
          assignmentId: selectedAssignment.id,
          studentId: user.id,
          content: submissionContent
      });

      // Refresh data
      const subs = await dataProvider.getMySubmissions(user.id);
      setMySubmissions(subs);
      setSelectedAssignment(null); // Close modal
      alert("Nộp bài thành công!");
  };

  const currentSubmission = selectedAssignment ? mySubmissions.find(s => s.assignmentId === selectedAssignment.id) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Bài tập của tôi</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(assign => {
              const status = getStatus(assign);
              const StatusIcon = status.icon;
              return (
                  <div key={assign.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800 line-clamp-1">{assign.title}</h3>
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${status.color}`}>
                              <StatusIcon size={12} /> {status.label}
                          </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{assign.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Hạn nộp: {assign.dueDate}</span>
                          {/* Score badge if graded */}
                          {mySubmissions.find(s => s.assignmentId === assign.id)?.grade !== undefined && (
                              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                                  Điểm: {mySubmissions.find(s => s.assignmentId === assign.id)?.grade}
                              </span>
                          )}
                      </div>
                      <button 
                        onClick={() => handleOpenAssignment(assign)}
                        className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                      >
                          Xem chi tiết
                      </button>
                  </div>
              );
          })}
          {assignments.length === 0 && <p className="text-gray-500 italic col-span-2 text-center py-10">Bạn chưa có bài tập nào.</p>}
      </div>

      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title || ''}
      >
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                <p className="font-semibold mb-1">Yêu cầu:</p>
                <p>{selectedAssignment?.description}</p>
                {selectedAssignment?.rubric && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-900">Tiêu chí chấm:</span> <span className="text-gray-600 italic">{selectedAssignment.rubric}</span>
                    </div>
                )}
            </div>

            {currentSubmission ? (
                <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2"><CheckCircle size={18}/> Bài làm của bạn</h4>
                    <p className="text-sm text-gray-800 mb-2 break-all">
                        {currentSubmission.content.startsWith('http') ? (
                            <a href={currentSubmission.content} target="_blank" rel="noreferrer" className="text-blue-600 flex items-center gap-1 hover:underline">
                                <ExternalLink size={14}/> Mở liên kết bài làm
                            </a>
                        ) : currentSubmission.content}
                    </p>
                    <p className="text-xs text-gray-500">Nộp lúc: {new Date(currentSubmission.submittedAt).toLocaleString('vi-VN')}</p>
                    
                    {currentSubmission.grade !== undefined && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-700">Kết quả:</span>
                                <span className="text-xl font-bold text-blue-600">{currentSubmission.grade}/{selectedAssignment?.maxScore}</span>
                            </div>
                            {currentSubmission.feedback && (
                                <p className="text-sm text-gray-600 italic">" {currentSubmission.feedback} "</p>
                            )}
                        </div>
                    )}
                    <div className="mt-4 text-center">
                         <button 
                            type="button" 
                            disabled={currentSubmission.grade !== undefined}
                            onClick={() => { /* Allow resubmit logic? For now just show disabled if graded */ }}
                            className={`text-sm underline ${currentSubmission.grade !== undefined ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'}`}
                         >
                            {currentSubmission.grade !== undefined ? 'Đã chấm điểm, không thể sửa' : 'Chỉnh sửa bài nộp (Đang phát triển)'}
                         </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {selectedAssignment?.type === 'FILE' ? 'Dán liên kết bài làm (Google Drive, Docs...)' : 'Nhập nội dung bài làm'}
                        </label>
                        {selectedAssignment?.type === 'FILE' ? (
                            <input 
                                required
                                type="url"
                                value={submissionContent}
                                onChange={e => setSubmissionContent(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        ) : (
                            <textarea 
                                required
                                rows={5}
                                value={submissionContent}
                                onChange={e => setSubmissionContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Em hãy trình bày..."
                            />
                        )}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm">
                            Nộp bài
                        </button>
                    </div>
                </form>
            )}
        </div>
      </Modal>
    </div>
  );
};
