import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Class } from '../../types';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { Modal } from '../common/Modal';

export const ClassesManager: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    schoolYear: '',
    homeroomTeacher: '',
    joinCode: ''
  });

  const fetchClasses = () => {
    dataProvider.getClasses().then(setClasses);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        name: cls.name,
        schoolYear: cls.schoolYear || '',
        homeroomTeacher: cls.homeroomTeacher || '',
        joinCode: cls.joinCode || ''
      });
    } else {
      setEditingClass(null);
      setFormData({ name: '', schoolYear: '', homeroomTeacher: '', joinCode: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await dataProvider.updateClass({
          ...editingClass,
          ...formData
        });
      } else {
        await dataProvider.createClass({
          ...formData,
          teacherId: 'u1' // Defaulting to current user for demo
        });
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lớp này?')) {
      await dataProvider.deleteClass(id);
      fetchClasses();
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.homeroomTeacher?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Lớp học</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={20} /> Thêm lớp mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên lớp, GVCN..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Tên lớp</th>
                <th className="px-6 py-4">Niên khóa</th>
                <th className="px-6 py-4">GVCN</th>
                <th className="px-6 py-4">Sĩ số</th>
                <th className="px-6 py-4">Mã tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4">{cls.schoolYear}</td>
                  <td className="px-6 py-4">{cls.homeroomTeacher}</td>
                  <td className="px-6 py-4">{cls.studentCount}</td>
                  <td className="px-6 py-4 font-mono bg-gray-50 rounded px-2">{cls.joinCode}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenModal(cls)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cls.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                    Không tìm thấy lớp học nào
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
        title={editingClass ? "Cập nhật lớp học" : "Thêm lớp học mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="VD: 7A1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niên khóa</label>
            <input 
              required
              type="text"
              value={formData.schoolYear}
              onChange={e => setFormData({...formData, schoolYear: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="VD: 2023-2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên chủ nhiệm</label>
            <input 
              required
              type="text"
              value={formData.homeroomTeacher}
              onChange={e => setFormData({...formData, homeroomTeacher: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Họ tên GVCN"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã tham gia</label>
            <input 
              required
              type="text"
              value={formData.joinCode}
              onChange={e => setFormData({...formData, joinCode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="VD: CODE123"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
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
              {editingClass ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
