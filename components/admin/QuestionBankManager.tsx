import React, { useEffect, useState, useRef } from 'react';
import { dataProvider } from '../../services/provider';
import { Question, QuestionType, Topic, Subject, DifficultyLevel } from '../../types';
import { Edit, Trash2, Plus, Search, HelpCircle, List, AlignLeft, ArrowDownUp, CheckSquare, X, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { Modal } from '../common/Modal';
import * as XLSX from 'xlsx';

export const QuestionBankManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  // Filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
      content: string;
      type: QuestionType;
      difficulty: DifficultyLevel;
      topicId: string;
      explanation: string;
      options: string[];
      correctAnswer: string | string[]; // Can be index (MCQ), text (Short), or array (Ordering)
  }>({
      content: '',
      type: 'MULTIPLE_CHOICE',
      difficulty: 'MEDIUM',
      topicId: '',
      explanation: '',
      options: ['', '', '', ''],
      correctAnswer: ''
  });

  useEffect(() => {
      const init = async () => {
          const subs = await dataProvider.getSubjects();
          setSubjects(subs);
          if (subs.length > 0) setFilterSubject(subs[0].id);
      };
      init();
  }, []);

  useEffect(() => {
      if (filterSubject) {
          dataProvider.getTopics(filterSubject).then(setTopics);
          fetchQuestions();
      }
  }, [filterSubject, filterTopic]);

  const fetchQuestions = async () => {
      const qs = await dataProvider.getQuestions(filterSubject, filterTopic || undefined);
      setQuestions(qs);
  };

  const handleOpenModal = (q?: Question) => {
      if (q) {
          setEditingQuestion(q);
          setFormData({
              content: q.content,
              type: q.type,
              difficulty: q.difficulty,
              topicId: q.topicId || '',
              explanation: q.explanation || '',
              options: q.options || ['', '', '', ''],
              correctAnswer: q.correctAnswer
          });
      } else {
          setEditingQuestion(null);
          setFormData({
              content: '',
              type: 'MULTIPLE_CHOICE',
              difficulty: 'MEDIUM',
              topicId: filterTopic || (topics[0]?.id || ''),
              explanation: '',
              options: ['', '', '', ''],
              correctAnswer: ''
          });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Basic validation
      if (!formData.content) return alert("Vui lòng nhập nội dung câu hỏi");
      if (formData.type === 'MULTIPLE_CHOICE' && !formData.correctAnswer) return alert("Vui lòng chọn đáp án đúng");
      
      const payload: any = {
          ...formData,
          subjectId: filterSubject
      };

      try {
          if (editingQuestion) {
              await dataProvider.updateQuestion({ ...editingQuestion, ...payload });
          } else {
              await dataProvider.createQuestion(payload);
          }
          setIsModalOpen(false);
          fetchQuestions();
      } catch (err) {
          console.error(err);
          alert("Có lỗi xảy ra");
      }
  };

  const handleDelete = async (id: string) => {
      if(confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) {
          await dataProvider.deleteQuestion(id);
          fetchQuestions();
      }
  };

  const handleOptionChange = (index: number, value: string) => {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
      
      // For Ordering type, update correctAnswer array to match if needed (not strictly necessary if we assume correctAnswer matches options on save)
      if (formData.type === 'ORDERING') {
          const newCorrect = [...(formData.correctAnswer as string[])];
          if (newCorrect[index]) newCorrect[index] = value;
          setFormData(prev => ({ ...prev, options: newOptions, correctAnswer: newOptions })); 
      }
  };

  // --- Excel Import/Export Logic ---

  const handleDownloadTemplate = () => {
      const headers = [
          'Nội dung câu hỏi (Bắt buộc)', 
          'Loại câu hỏi (MULTIPLE_CHOICE | SHORT_ANSWER | ORDERING | FILL_IN_THE_BLANK)', 
          'Độ khó (EASY | MEDIUM | HARD)',
          'Đáp án đúng (Nếu trắc nghiệm nhập y hệt text lựa chọn)',
          'Giải thích',
          'Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3', 'Lựa chọn 4'
      ];
      
      const sampleData = [
          ['Thiết bị nào là thiết bị ra?', 'MULTIPLE_CHOICE', 'EASY', 'Màn hình', 'Giải thích...', 'Màn hình', 'Bàn phím', 'Chuột', 'Micro'],
          ['CPU là viết tắt của gì?', 'SHORT_ANSWER', 'MEDIUM', 'Central Processing Unit', 'Là bộ xử lý trung tâm', '', '', '', ''],
          ['Điền vào chỗ trống: ___ là thiết bị vào.', 'FILL_IN_THE_BLANK', 'MEDIUM', 'Bàn phím', 'Dấu ___ đại diện chỗ trống', '', '', '', ''],
          ['Sắp xếp quy trình bật máy', 'ORDERING', 'HARD', 'Cắm điện,Bấm nút nguồn,Đăng nhập', 'Cách nhau dấu phẩy', 'Cắm điện', 'Bấm nút nguồn', 'Đăng nhập', ''],
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mau_Cau_Hoi");
      XLSX.writeFile(wb, "Mau_Nhap_Cau_Hoi_LMS.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          
          // Remove header row
          const rows = data.slice(1) as any[][];
          
          let successCount = 0;
          const targetTopicId = filterTopic || (topics[0]?.id || '');
          const targetSubjectId = filterSubject;

          if (!targetTopicId || !targetSubjectId) {
              alert("Vui lòng chọn Chủ đề trước khi nhập file.");
              return;
          }

          for (const row of rows) {
              if (!row[0]) continue; // Skip empty content

              const content = row[0];
              const type = (row[1] || 'MULTIPLE_CHOICE').toString().trim() as QuestionType;
              const difficulty = (row[2] || 'MEDIUM').toString().trim() as DifficultyLevel;
              const rawCorrectAnswer = row[3] ? row[3].toString().trim() : '';
              const explanation = row[4] ? row[4].toString() : '';
              
              // Get Options
              const options = [
                  row[5]?.toString() || '',
                  row[6]?.toString() || '',
                  row[7]?.toString() || '',
                  row[8]?.toString() || ''
              ].filter(o => o !== '');

              let correctAnswer: string | string[] = rawCorrectAnswer;
              
              if (type === 'ORDERING') {
                  correctAnswer = rawCorrectAnswer.split(',').map((s: string) => s.trim());
                  // If options are empty in excel but correct answer is provided as comma list, use correct answer as options too
                  if (options.length === 0) {
                      options.push(...(correctAnswer as string[]));
                  }
              }

              // Create Question
              await dataProvider.createQuestion({
                  content,
                  type,
                  difficulty,
                  explanation,
                  options,
                  correctAnswer,
                  topicId: targetTopicId,
                  subjectId: targetSubjectId
              });
              successCount++;
          }

          alert(`Đã nhập thành công ${successCount} câu hỏi.`);
          fetchQuestions();
          if(fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
  };

  // Helper to get type label
  const getTypeInfo = (type: QuestionType) => {
      switch(type) {
          case 'MULTIPLE_CHOICE': return { label: 'Trắc nghiệm', icon: List, color: 'text-blue-600 bg-blue-50' };
          case 'SHORT_ANSWER': return { label: 'Trả lời ngắn', icon: AlignLeft, color: 'text-green-600 bg-green-50' };
          case 'ORDERING': return { label: 'Sắp xếp', icon: ArrowDownUp, color: 'text-purple-600 bg-purple-50' };
          case 'FILL_IN_THE_BLANK': return { label: 'Điền khuyết', icon: CheckSquare, color: 'text-orange-600 bg-orange-50' };
          default: return { label: type, icon: HelpCircle, color: 'text-gray-600 bg-gray-50' };
      }
  };

  const getDifficultyColor = (level: string) => {
      switch(level) {
          case 'EASY': return 'bg-green-100 text-green-700';
          case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
          case 'HARD': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100';
      }
  };

  const filteredQuestions = questions.filter(q => {
      const matchSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType ? q.type === filterType : true;
      return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Ngân hàng câu hỏi</h2>
        
        <div className="flex flex-wrap gap-2">
            {/* Import Buttons */}
            <button 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-green-600 text-green-700 rounded-lg hover:bg-green-50 font-medium text-sm transition-colors"
                title="Tải file Excel mẫu"
            >
                <Download size={18} /> Tải mẫu
            </button>
            <div className="relative">
                <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleImportExcel}
                    className="hidden"
                    id="excel-upload"
                />
                <label 
                    htmlFor="excel-upload"
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer text-sm transition-colors"
                >
                    <FileSpreadsheet size={18} /> Nhập Excel
                </label>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
                <Plus size={20} /> Tạo thủ công
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Chủ đề (Chọn để nhập Excel)</label>
              <select 
                value={filterTopic}
                onChange={e => setFilterTopic(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none bg-blue-50/20 border-blue-200 text-blue-800 font-medium"
              >
                  <option value="">-- Chọn chủ đề --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Loại câu hỏi</label>
              <select 
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none"
              >
                  <option value="">Tất cả loại</option>
                  <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                  <option value="SHORT_ANSWER">Trả lời ngắn</option>
                  <option value="ORDERING">Sắp xếp</option>
                  <option value="FILL_IN_THE_BLANK">Điền khuyết</option>
              </select>
          </div>
          <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Tìm kiếm nội dung</label>
              <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 p-2 border border-gray-200 rounded-lg text-sm outline-none"
                    placeholder="Nhập nội dung câu hỏi..."
                  />
              </div>
          </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredQuestions.map((q, index) => {
              const TypeIcon = getTypeInfo(q.type).icon;
              return (
                  <div key={q.id} className={`p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex gap-4 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <div className={`p-2 rounded-lg h-fit flex-shrink-0 ${getTypeInfo(q.type).color}`}>
                          <TypeIcon size={20} />
                      </div>
                      <div className="flex-1">
                          <div className="flex flex-wrap justify-between gap-2 mb-1">
                              <h4 className="font-medium text-gray-800 line-clamp-2">{q.content}</h4>
                              <div className="flex gap-2 items-center flex-shrink-0">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getDifficultyColor(q.difficulty)}`}>
                                      {q.difficulty}
                                  </span>
                                  <div className="flex gap-1">
                                      <button onClick={() => handleOpenModal(q)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded bg-white border border-gray-200"><Edit size={14}/></button>
                                      <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded bg-white border border-gray-200"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                          </div>
                          
                          {/* Preview Answer based on Type */}
                          <div className="text-sm text-gray-500 mt-2">
                              {q.type === 'MULTIPLE_CHOICE' && (
                                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                                      {q.options?.map((opt, i) => (
                                          <li key={i} className={`flex items-center gap-1 ${opt === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                              {opt === q.correctAnswer ? <CheckSquare size={12}/> : <span className="w-3 h-3 rounded-full border border-gray-300 block"></span>}
                                              {opt}
                                          </li>
                                      ))}
                                  </ul>
                              )}
                              {(q.type === 'SHORT_ANSWER' || q.type === 'FILL_IN_THE_BLANK') && (
                                  <p className="flex items-center gap-1"><CheckSquare size={14} className="text-green-500"/> Đáp án: <span className="font-mono bg-gray-100 px-1 rounded">{q.correctAnswer as string}</span></p>
                              )}
                              {q.type === 'ORDERING' && (
                                  <div className="flex gap-2 items-center flex-wrap">
                                      <span className="text-xs font-bold">Thứ tự đúng:</span>
                                      {(q.correctAnswer as string[]).map((it, i) => (
                                          <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">{i+1}. {it}</span>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              );
          })}
          {filteredQuestions.length === 0 && (
              <div className="p-10 text-center text-gray-400 italic">Không tìm thấy câu hỏi nào.</div>
          )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? "Cập nhật câu hỏi" : "Tạo câu hỏi mới"}
      >
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                      <select 
                        value={formData.type}
                        onChange={e => {
                            const newType = e.target.value as QuestionType;
                            setFormData({
                                ...formData, 
                                type: newType,
                                // Reset answer specific fields when type changes
                                options: newType === 'ORDERING' || newType === 'MULTIPLE_CHOICE' ? ['', '', '', ''] : [],
                                correctAnswer: newType === 'ORDERING' ? [] : ''
                            });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                      >
                          <option value="MULTIPLE_CHOICE">Trắc nghiệm (1 đáp án)</option>
                          <option value="SHORT_ANSWER">Trả lời ngắn</option>
                          <option value="ORDERING">Sắp xếp thứ tự</option>
                          <option value="FILL_IN_THE_BLANK">Điền khuyết</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
                      <select 
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: e.target.value as DifficultyLevel})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                      >
                          <option value="EASY">Dễ</option>
                          <option value="MEDIUM">Trung bình</option>
                          <option value="HARD">Khó</option>
                      </select>
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                  <select 
                    value={formData.topicId}
                    onChange={e => setFormData({...formData, topicId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  >
                      {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder={formData.type === 'FILL_IN_THE_BLANK' ? 'Ví dụ: Thủ đô của Việt Nam là ___' : 'Nhập nội dung câu hỏi...'}
                  />
              </div>

              {/* Dynamic Answer Fields */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <h4 className="font-bold text-gray-700 text-sm border-b border-gray-200 pb-2">Cấu hình đáp án</h4>
                  
                  {formData.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2">
                          {formData.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                  <input 
                                    type="radio" 
                                    name="correctAnswer"
                                    checked={formData.correctAnswer === opt && opt !== ''}
                                    onChange={() => setFormData({...formData, correctAnswer: opt})}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Đáp án ${idx + 1}`}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
                                  />
                                  <button type="button" onClick={() => {
                                      const newOpts = formData.options.filter((_, i) => i !== idx);
                                      setFormData({...formData, options: newOpts});
                                  }} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                              </div>
                          ))}
                          <button type="button" onClick={() => setFormData({...formData, options: [...formData.options, '']})} className="text-xs text-blue-600 font-medium hover:underline">+ Thêm lựa chọn</button>
                      </div>
                  )}

                  {formData.type === 'SHORT_ANSWER' && (
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Đáp án đúng</label>
                          <input 
                            type="text"
                            value={formData.correctAnswer as string}
                            onChange={e => setFormData({...formData, correctAnswer: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded outline-none"
                            placeholder="Nhập câu trả lời chính xác..."
                          />
                      </div>
                  )}

                  {formData.type === 'FILL_IN_THE_BLANK' && (
                      <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Từ cần điền (Đáp án đúng)</label>
                          <input 
                            type="text"
                            value={formData.correctAnswer as string}
                            onChange={e => setFormData({...formData, correctAnswer: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded outline-none"
                            placeholder="Nhập từ còn thiếu..."
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Trong nội dung câu hỏi, hãy sử dụng dấu "___" để biểu thị chỗ trống.</p>
                      </div>
                  )}

                  {formData.type === 'ORDERING' && (
                      <div className="space-y-2">
                          <p className="text-xs text-gray-500 mb-1">Nhập các bước theo <span className="font-bold text-green-600">thứ tự đúng</span> (Hệ thống sẽ tự xáo trộn khi hiển thị cho học sinh):</p>
                          {formData.options.map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                  <input 
                                    type="text"
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Bước ${idx + 1}`}
                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-purple-500"
                                  />
                                   <button type="button" onClick={() => {
                                      const newOpts = formData.options.filter((_, i) => i !== idx);
                                      setFormData({...formData, options: newOpts, correctAnswer: newOpts}); // Sync correct answer array
                                  }} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                              </div>
                          ))}
                          <button type="button" onClick={() => {
                              const newOpts = [...formData.options, ''];
                              setFormData({...formData, options: newOpts, correctAnswer: newOpts});
                          }} className="text-xs text-purple-600 font-medium hover:underline">+ Thêm bước</button>
                      </div>
                  )}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích (Tùy chọn)</label>
                  <textarea 
                    rows={2}
                    value={formData.explanation}
                    onChange={e => setFormData({...formData, explanation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                    placeholder="Giải thích vì sao đáp án này đúng..."
                  />
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      {editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
                  </button>
              </div>
          </form>
      </Modal>
    </div>
  );
};
