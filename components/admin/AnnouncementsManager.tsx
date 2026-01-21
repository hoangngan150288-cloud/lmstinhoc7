import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Announcement, Class } from '../../types';
import { Megaphone, Plus, Users, User, UserCheck, Calendar } from 'lucide-react';
import { Modal } from '../common/Modal';

export const AnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'ALL' as 'ALL' | 'STUDENT' | 'PARENT',
    classId: ''
  });

  useEffect(() => {
    const loadData = async () => {
        const u = await dataProvider.getCurrentUser();
        setCurrentUser(u);
        const anns = await dataProvider.getAnnouncements('');
        setAnnouncements(anns);
        const cls = await dataProvider.getClasses();
        setClasses(cls);
        if (cls.length > 0) {
            setFormData(prev => ({ ...prev, classId: cls[0].id }));
        }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;

      await dataProvider.createAnnouncement({
          ...formData,
          teacherId: currentUser.id
      });

      setIsModalOpen(false);
      setFormData({ ...formData, title: '', content: '' });
      const anns = await dataProvider.getAnnouncements('');
      setAnnouncements(anns);
  };

  const getTargetLabel = (target: string) => {
      switch(target) {
          case 'ALL': return { label: 'Tất cả', icon: Users, color: 'bg-purple-100 text-purple-700' };
          case 'STUDENT': return { label: 'Học sinh', icon: User, color: 'bg-blue-100 text-blue-700' };
          case 'PARENT': return { label: 'Phụ huynh', icon: UserCheck, color: 'bg-orange-100 text-orange-700' };
          default: return { label: 'Tất cả', icon: Users, color: 'bg-gray-100' };
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Thông báo & Tin tức</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={20} /> Tạo thông báo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {announcements.map(ann => {
              const target = getTargetLabel(ann.target);
              const TargetIcon = target.icon;
              const className = classes.find(c => c.id === ann.classId)?.name || 'Toàn trường';

              return (
                  <div key={ann.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                      <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex-shrink-0">
                          <Megaphone size={24} />
                      </div>
                      <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">{ann.title}</h3>
                              <div className="flex gap-2">
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${target.color}`}>
                                      <TargetIcon size={12} /> {target.label}
                                  </span>
                                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                      {className}
                                  </span>
                              </div>
                          </div>
                          <p className="text-gray-600 mb-2 whitespace-pre-wrap">{ann.content}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar size={14} /> {ann.createdAt}
                          </div>
                      </div>
                  </div>
              );
          })}
          {announcements.length === 0 && (
              <div className="text-center py-12 text-gray-400">Chưa có thông báo nào được tạo.</div>
          )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo thông báo mới"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gửi đến lớp</label>
                <select
                    value={formData.classId}
                    onChange={e => setFormData({...formData, classId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng nhận</label>
                <select
                    value={formData.target}
                    onChange={e => setFormData({...formData, target: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                >
                    <option value="ALL">Tất cả (Học sinh & Phụ huynh)</option>
                    <option value="STUDENT">Chỉ Học sinh</option>
                    <option value="PARENT">Chỉ Phụ huynh</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Nhắc nhở nộp bài tập"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <textarea 
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập nội dung thông báo..."
                />
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Gửi thông báo
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
