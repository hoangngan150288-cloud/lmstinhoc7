import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Lesson, Topic, Subject } from '../../types';
import { Edit, Trash2, Plus, FileText, CheckCircle, EyeOff, Search } from 'lucide-react';
import { Modal } from '../common/Modal';

export const LessonsManager: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    topicId: '',
    content: '',
    videoUrl: '',
    slideUrl: '',
    documentUrl: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    order: 1
  });

  const fetchData = async () => {
    // Basic init data
    const subs = await dataProvider.getSubjects();
    setSubjects(subs);
    if (subs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subs[0].id);
    }
  };

  const fetchTopicsAndLessons = async () => {
    if (!selectedSubjectId) return;
    const tps = await dataProvider.getTopics(selectedSubjectId);
    setTopics(tps);
    
    // Fetch all lessons for these topics
    let allLessons: Lesson[] = [];
    for (const t of tps) {
        const ls = await dataProvider.getLessons(t.id);
        allLessons.push(...ls);
    }
    setLessons(allLessons);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTopicsAndLessons();
  }, [selectedSubjectId]);

  const handleOpenModal = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
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
      setEditingLesson(null);
      setFormData({
        title: '',
        topicId: selectedTopicId || (topics[0]?.id || ''),
        content: '',
        videoUrl: '',
        slideUrl: '',
        documentUrl: '',
        status: 'DRAFT',
        order: lessons.filter(l => l.topicId === selectedTopicId).length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await dataProvider.updateLesson({
          ...editingLesson,
          ...formData
        });
      } else {
        await dataProvider.createLesson(formData);
      }
      setIsModalOpen(false);
      fetchTopicsAndLessons();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài giảng này?')) {
      await dataProvider.deleteLesson(id);
      fetchTopicsAndLessons();
    }
  };

  const toggleStatus = async (lesson: Lesson) => {
      const newStatus = lesson.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await dataProvider.updateLesson({ ...lesson, status: newStatus });
      fetchTopicsAndLessons();
  };

  const filteredLessons = lessons.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = selectedTopicId ? l.topicId === selectedTopicId : true;
      return matchesSearch && matchesTopic;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Bài giảng (Học liệu)</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={20} /> Tạo bài giảng mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 font-medium uppercase">Môn học</label>
              <select 
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
              >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
          </div>
          <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 font-medium uppercase">Chủ đề</label>
              <select 
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
              >
                  <option value="">Tất cả chủ đề</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
          </div>
          <div className="flex-1">
             <label className="block text-xs text-gray-500 mb-1 font-medium uppercase">Tìm kiếm</label>
             <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tên bài học..."
                    className="w-full pl-9 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
                 />
             </div>
          </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Tên bài giảng</th>
                <th className="px-6 py-4">Chủ đề</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLessons.map((lesson) => {
                  const topicName = topics.find(t => t.id === lesson.topicId)?.title || '---';
                  return (
                    <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} /></div>
                         {lesson.title}
                      </td>
                      <td className="px-6 py-4 text-xs">{topicName}</td>
                      <td className="px-6 py-4 text-center">
                          <button 
                             onClick={() => toggleStatus(lesson)}
                             className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                                 lesson.status === 'PUBLISHED' 
                                 ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                 : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                             }`}
                          >
                             {lesson.status === 'PUBLISHED' ? <CheckCircle size={12}/> : <EyeOff size={12}/>}
                             {lesson.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                          </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(lesson)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
              })}
              {filteredLessons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                    Chưa có bài giảng nào trong danh sách
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? "Chỉnh sửa bài giảng" : "Soạn bài giảng mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề bài học</label>
            <select
                required
                value={formData.topicId}
                onChange={e => setFormData({...formData, topicId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
                {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài giảng</label>
            <input 
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="VD: Bài 1: Thông tin và dữ liệu"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
             <input 
               type="number"
               value={formData.order}
               onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung (HTML)</label>
            <textarea 
              rows={5}
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              placeholder="<p>Nội dung bài học...</p>"
            />
            <p className="text-xs text-gray-400 mt-1">Hỗ trợ định dạng HTML cơ bản.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Video (Youtube Embed)</label>
                <input 
                  type="text"
                  value={formData.videoUrl}
                  onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Slide (Embed Link)</label>
                <input 
                  type="text"
                  value={formData.slideUrl}
                  onChange={e => setFormData({...formData, slideUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://docs.google.com/presentation/d/.../embed..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Tài liệu</label>
                <input 
                  type="text"
                  value={formData.documentUrl}
                  onChange={e => setFormData({...formData, documentUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://drive.google.com/..."
                />
              </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
              <input 
                 type="checkbox"
                 id="statusCheck"
                 checked={formData.status === 'PUBLISHED'}
                 onChange={e => setFormData({...formData, status: e.target.checked ? 'PUBLISHED' : 'DRAFT'})}
                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="statusCheck" className="text-sm font-medium text-gray-700">Xuất bản ngay (Học sinh sẽ nhìn thấy)</label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {editingLesson ? 'Lưu thay đổi' : 'Tạo bài giảng'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
