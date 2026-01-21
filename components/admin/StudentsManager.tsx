import React, { useEffect, useState } from 'react';
import { dataProvider } from '../../services/provider';
import { Class, User } from '../../types';
import { Edit, Trash2, Plus, Search, Filter, KeyRound } from 'lucide-react';
import { Modal } from '../common/Modal';

export const StudentsManager: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    parentPhone: '',
    classId: '',
    password: ''
  });

  const fetchData = async () => {
    const [fetchedStudents, fetchedClasses] = await Promise.all([
      dataProvider.getStudents(),
      dataProvider.getClasses()
    ]);
    setStudents(fetchedStudents);
    setClasses(fetchedClasses);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (student?: User) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        dob: student.dob || '',
        parentPhone: student.parentPhone || '',
        classId: student.classId || '',
        password: student.password || '' // Load existing password if available
      });
    } else {
      setEditingStudent(null);
      setFormData({ 
          name: '', 
          email: '', 
          dob: '', 
          parentPhone: '', 
          classId: filterClass || (classes[0]?.id || ''),
          password: '123' // Default for new student
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await dataProvider.updateStudent({
          ...editingStudent,
          ...formData
        });
      } else {
        // Auto-generate username from email
        await dataProvider.createStudent({
            ...formData,
            username: formData.email.split('@')[0]
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa học sinh này?')) {
      await dataProvider.deleteStudent(id);
      fetchData();
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass ? s.classId === filterClass : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Học sinh</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus size={20} /> Thêm học sinh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <Search size={20} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, username, email..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
            >
              <option value="">Tất cả các lớp</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Họ tên</th>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Mật khẩu</th>
                <th className="px-6 py-4">Lớp</th>
                <th className="px-6 py-4">SĐT Phụ huynh</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={student.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt="" />
                    <div>
                        <span className="block font-medium text-gray-900">{student.name}</span>
                        <span className="block text-xs text-gray-400">{student.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-blue-600 font-medium">
                      {student.username}
                  </td>
                  <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                          <KeyRound size={10} /> {student.password || '***'}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {classes.find(c => c.id === student.classId)?.name || 'Chưa xếp lớp'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{student.parentPhone || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenModal(student)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                    Không tìm thấy học sinh nào
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
        title={editingStudent ? "Cập nhật thông tin học sinh" : "Thêm học sinh mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Sẽ tự tạo Username từ email)</label>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="vd: hs.nam@school.edu.vn"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
                <input 
                    required
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-blue-700"
                    placeholder="Mật khẩu"
                />
                <KeyRound size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
              <input 
                type="date"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Lớp học</label>
               <select
                 value={formData.classId}
                 onChange={e => setFormData({...formData, classId: e.target.value})}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
               >
                 <option value="">Chọn lớp</option>
                 {classes.map(c => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SĐT Phụ huynh</label>
            <input 
              type="tel"
              value={formData.parentPhone}
              onChange={e => setFormData({...formData, parentPhone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              {editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
