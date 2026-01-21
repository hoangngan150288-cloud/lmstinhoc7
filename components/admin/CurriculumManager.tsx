import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Subject, Topic, Lesson } from '../../types';
import { Edit, Trash2, Plus, Book, ChevronRight, FileText, ChevronDown, ChevronUp, Video, Link as LinkIcon, Save, Presentation } from 'lucide-react';
import { Modal } from '../common/Modal';

export const CurriculumManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  // Topic Modal State
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [topicForm, setTopicForm] = useState({ title: '', order: 1 });

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    topicId: '',
    content: '',
    videoUrl: '',
    slideUrl: '',
    documentUrl: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    order: 1
  });

  // Expand/Collapse State for Topics
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    dataProvider.getSubjects().then(subs => {
      setSubjects(subs);
      if (subs.length > 0) {
        setSelectedSubjectId(subs[0].id);
      }
    });
  }, []);

  useEffect(() => {
    refreshData();
  }, [selectedSubjectId]);

  const refreshData = async () => {
    if (selectedSubjectId) {
      const fetchedTopics = await dataProvider.getTopics(selectedSubjectId);
      setTopics(fetchedTopics);
      
      // Auto expand all topics initially
      setExpandedTopics(new Set(fetchedTopics.map(t => t.id)));

      // Fetch all lessons (inefficient for large DB, but fine for mock/small app)
      // Filter filtering client side or fetch by topic loop
      let allLessons: Lesson[] = [];
      for (const t of fetchedTopics) {
          const ls = await dataProvider.getLessons(t.id);
          allLessons.push(...ls);
      }
      setLessons(allLessons);
    }
  };

  const toggleTopicExpand = (topicId: string) => {
      const newSet = new Set(expandedTopics);
      if (newSet.has(topicId)) newSet.delete(topicId);
      else newSet.add(topicId);
      setExpandedTopics(newSet);
  };

  // --- Topic Handlers ---
  const handleOpenTopicModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({ title: topic.title, order: topic.order });
    } else {
      setEditingTopic(null);
      setTopicForm({ title: '', order: topics.length + 1 });
    }
    setIsTopicModalOpen(true);
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    try {
      if (editingTopic) {
        await dataProvider.updateTopic({ ...editingTopic, ...topicForm });
      } else {
        await dataProvider.createTopic({ subjectId: selectedSubjectId, ...topicForm });
      }
      setIsTopicModalOpen(false);
      refreshData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTopicDelete = async (id: string) => {
    if (confirm('Xóa chủ đề này sẽ xóa cả các bài học bên trong. Bạn có chắc không?')) {
      await dataProvider.deleteTopic(id);
      refreshData();
    }
  };

  // --- Lesson Handlers ---
  const handleOpenLessonModal = (topicId: string, lesson?: Lesson) => {
      if (lesson) {
          setEditingLesson(lesson);
          setLessonForm({
              title: lesson.title,
              topicId: lesson.topicId,
              content: lesson.content,
              videoUrl: lesson.videoUrl || '',
              slideUrl: lesson.slideUrl || '',
              documentUrl: lesson.documentUrl || '',
              status: lesson.status,
              order: lesson.order
          });
      } else {
          // New Lesson
          const lessonsInTopic = lessons.filter(l => l.topicId === topicId);
          setEditingLesson(null);
          setLessonForm({
              title: '',
              topicId: topicId,
              content: '',
              videoUrl: '',
              slideUrl: '',
              documentUrl: '',
              status: 'DRAFT',
              order: lessonsInTopic.length + 1
          });
      }
      setIsLessonModalOpen(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingLesson) {
              await dataProvider.updateLesson({ ...editingLesson, ...lessonForm });
          } else {
              await dataProvider.createLesson(lessonForm);
          }
          setIsLessonModalOpen(false);
          refreshData();
      } catch (error) {
          console.error(error);
          alert('Có lỗi xảy ra khi lưu bài học');
      }
  };

  const handleLessonDelete = async (id: string) => {
      if (confirm('Bạn chắc chắn muốn xóa bài học này?')) {
          await dataProvider.deleteLesson(id);
          refreshData();
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý Chương trình học</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Subjects List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700">Môn học</h3>
          </div>
          <div className="divide-y divide-gray-100">
             {subjects.map(sub => (
               <button
                 key={sub.id}
                 onClick={() => setSelectedSubjectId(sub.id)}
                 className={`w-full text-left p-4 flex items-center justify-between transition-colors ${
                   selectedSubjectId === sub.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                 }`}
               >
                 <span className="font-medium">{sub.name}</span>
                 {selectedSubjectId === sub.id && <ChevronRight size={16} />}
               </button>
             ))}
          </div>
        </div>

        {/* Right: Topics & Lessons Hierarchy */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
           <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Book size={18} />
                Nội dung: {subjects.find(s => s.id === selectedSubjectId)?.name}
             </h3>
             <button 
                onClick={() => handleOpenTopicModal()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
             >
                <Plus size={16} /> Thêm chủ đề
             </button>
           </div>
           
           <div className="p-4 space-y-4">
             {topics.map(topic => {
               const topicLessons = lessons.filter(l => l.topicId === topic.id).sort((a,b) => a.order - b.order);
               const isExpanded = expandedTopics.has(topic.id);

               return (
                 <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Topic Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 group hover:bg-gray-100 transition-colors">
                        <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                            onClick={() => toggleTopicExpand(topic.id)}
                        >
                             <button className="text-gray-400">
                                 {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                             </button>
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
                                {topic.order}
                             </div>
                             <h4 className="font-bold text-gray-800">{topic.title}</h4>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleOpenLessonModal(topic.id)}
                                className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 mr-2 flex items-center gap-1"
                            >
                                <Plus size={12}/> Thêm bài
                            </button>
                            <button 
                                onClick={() => handleOpenTopicModal(topic)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleTopicDelete(topic.id)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Lessons List */}
                    {isExpanded && (
                        <div className="bg-white divide-y divide-gray-50">
                            {topicLessons.map(lesson => (
                                <div key={lesson.id} className="pl-12 pr-4 py-3 flex items-center justify-between group hover:bg-blue-50/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText size={16} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Bài {lesson.order}: {lesson.title}</p>
                                            <div className="flex gap-2 mt-0.5">
                                                <span className={`text-[10px] px-1.5 rounded border ${
                                                    lesson.status === 'PUBLISHED' 
                                                    ? 'bg-green-50 text-green-600 border-green-100' 
                                                    : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}>
                                                    {lesson.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                                                </span>
                                                {lesson.videoUrl && <span className="text-[10px] flex items-center gap-0.5 text-blue-500"><Video size={10}/> Video</span>}
                                                {lesson.slideUrl && <span className="text-[10px] flex items-center gap-0.5 text-yellow-600"><Presentation size={10}/> Slide</span>}
                                                {lesson.documentUrl && <span className="text-[10px] flex items-center gap-0.5 text-orange-500"><LinkIcon size={10}/> Tài liệu</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenLessonModal(topic.id, lesson)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded"
                                            title="Sửa bài học"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleLessonDelete(lesson.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                            title="Xóa bài học"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {topicLessons.length === 0 && (
                                <div className="pl-12 py-3 text-xs text-gray-400 italic">Chưa có bài học nào trong chủ đề này.</div>
                            )}
                            {/* Quick Add Button at bottom of list */}
                            <div className="pl-12 py-2">
                                <button 
                                    onClick={() => handleOpenLessonModal(topic.id)}
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                >
                                    <Plus size={12}/> Thêm bài học mới
                                </button>
                            </div>
                        </div>
                    )}
                 </div>
               );
             })}
             
             {topics.length === 0 && (
               <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                  <Book size={48} className="mb-2 opacity-20"/>
                  <p>Chưa có chủ đề nào.</p>
                  <button onClick={() => handleOpenTopicModal()} className="mt-2 text-blue-600 hover:underline">Thêm chủ đề đầu tiên</button>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* --- Topic Modal --- */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title={editingTopic ? "Cập nhật chủ đề" : "Thêm chủ đề mới"}
      >
        <form onSubmit={handleTopicSubmit} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ đề</label>
             <input 
               required
               type="text"
               value={topicForm.title}
               onChange={e => setTopicForm({...topicForm, title: e.target.value})}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder="VD: Chủ đề 1: Máy tính"
             />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
             <input 
               required
               type="number"
               value={topicForm.order}
               onChange={e => setTopicForm({...topicForm, order: parseInt(e.target.value)})}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>
          <div className="pt-4 flex justify-end gap-3">
             <button type="button" onClick={() => setIsTopicModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
             <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{editingTopic ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </Modal>

      {/* --- Lesson Modal --- */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title={editingLesson ? "Cập nhật bài học" : "Thêm bài học mới"}
      >
        <form onSubmit={handleLessonSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
           <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học</label>
               <input 
                 required
                 type="text"
                 value={lessonForm.title}
                 onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="VD: Bài 1: Thông tin và dữ liệu"
               />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự (Bài số)</label>
                   <input 
                     required
                     type="number"
                     value={lessonForm.order}
                     onChange={e => setLessonForm({...lessonForm, order: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   />
               </div>
               <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                   <select
                       value={lessonForm.status}
                       onChange={e => setLessonForm({...lessonForm, status: e.target.value as any})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   >
                       <option value="DRAFT">Bản nháp</option>
                       <option value="PUBLISHED">Xuất bản</option>
                   </select>
               </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung (HTML)</label>
              <textarea 
                rows={4}
                value={lessonForm.content}
                onChange={e => setLessonForm({...lessonForm, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="<p>Nội dung bài học...</p>"
              />
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Youtube Embed)</label>
              <input 
                type="text"
                value={lessonForm.videoUrl}
                onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://www.youtube.com/embed/..."
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Slide URL (Embed Link)</label>
              <input 
                type="text"
                value={lessonForm.slideUrl}
                onChange={e => setLessonForm({...lessonForm, slideUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://docs.google.com/presentation/d/.../embed..."
              />
           </div>
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tài liệu tham khảo (Link tải/xem)</label>
              <input 
                type="text"
                value={lessonForm.documentUrl}
                onChange={e => setLessonForm({...lessonForm, documentUrl: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://drive.google.com/..."
              />
           </div>

           <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
               <button type="button" onClick={() => setIsLessonModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium">Hủy</button>
               <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                   <Save size={16}/> {editingLesson ? 'Lưu thay đổi' : 'Tạo bài học'}
               </button>
           </div>
        </form>
      </Modal>
    </div>
  );
};
