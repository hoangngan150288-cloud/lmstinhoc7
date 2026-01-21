import React, { useEffect, useState } from 'react';
import { dataProvider } from '../services/provider';
import { Topic, Lesson, Progress } from '../types';
import { PlayCircle, CheckCircle, Circle, FileText, Check, Presentation } from 'lucide-react';

export const StudentLearning: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
        const user = await dataProvider.getCurrentUser();
        setCurrentUser(user);

        // Fetch Progress
        if (user) {
            const userProgress = await dataProvider.getProgress(user.id);
            setProgress(userProgress);
        }

        // Fetch Topics and Lessons
        const fetchedTopics = await dataProvider.getTopics('s1');
        setTopics(fetchedTopics);
      
        const allLessons: Lesson[] = [];
        for (const t of fetchedTopics) {
            const tLessons = await dataProvider.getLessons(t.id);
            // Filter only PUBLISHED lessons for students
            allLessons.push(...tLessons.filter(l => l.status === 'PUBLISHED'));
        }
        setLessons(allLessons);
        
        if (allLessons.length > 0) setSelectedLesson(allLessons[0]);
    };
    fetchData();
  }, []);

  const handleMarkComplete = async () => {
      if (!selectedLesson || !currentUser) return;
      
      await dataProvider.markLessonComplete(currentUser.id, selectedLesson.id);
      
      // Update local state
      const updatedProgress = await dataProvider.getProgress(currentUser.id);
      setProgress(updatedProgress);
  };

  const isCompleted = (lessonId: string) => {
      return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  if (!selectedLesson) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu hoặc chưa có bài học nào được xuất bản...</div>;

  const currentCompleted = isCompleted(selectedLesson.id);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6">
       {/* Sidebar Learning Path */}
       <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-800">Nội dung khóa học</h3>
          </div>
          <div className="p-2">
            {topics.map(topic => {
                const topicLessons = lessons.filter(l => l.topicId === topic.id);
                if (topicLessons.length === 0) return null; // Don't show empty topics

                return (
                    <div key={topic.id} className="mb-4">
                        <h4 className="px-2 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{topic.title}</h4>
                        <div className="space-y-1">
                            {topicLessons.map(lesson => {
                                const completed = isCompleted(lesson.id);
                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setSelectedLesson(lesson)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-start gap-2 transition-colors ${
                                            selectedLesson.id === lesson.id 
                                            ? 'bg-blue-50 text-blue-700 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {completed 
                                                ? <CheckCircle size={16} className="text-green-500" /> 
                                                : <Circle size={16} className={selectedLesson.id === lesson.id ? "text-blue-500" : "text-gray-300"} />
                                            }
                                        </div>
                                        <span className="line-clamp-2">{lesson.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start">
             <h2 className="text-xl font-bold text-gray-800 pr-4">{selectedLesson.title}</h2>
             {currentCompleted && <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full"><Check size={14}/> Đã hoàn thành</span>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {/* Video Placeholder */}
             {selectedLesson.videoUrl && (
                 <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white relative group cursor-pointer overflow-hidden shadow-sm">
                     <iframe 
                        src={selectedLesson.videoUrl} 
                        className="w-full h-full" 
                        title="Video bài giảng"
                        allowFullScreen
                     ></iframe>
                 </div>
             )}

             {/* Slide Placeholder */}
             {selectedLesson.slideUrl && (
                 <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden border border-gray-200 shadow-sm">
                     <iframe 
                        src={selectedLesson.slideUrl} 
                        className="w-full h-full" 
                        title="Bài giảng Slide"
                        allowFullScreen
                     ></iframe>
                 </div>
             )}

             <div className="prose max-w-none text-gray-700">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nội dung bài học</h3>
                <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
             </div>

             {selectedLesson.documentUrl && (
                 <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                     <div className="p-2 bg-white rounded-md text-blue-600 shadow-sm">
                         <FileText size={24} />
                     </div>
                     <div>
                         <p className="text-sm font-semibold text-gray-900">Tài liệu tham khảo</p>
                         <a href={selectedLesson.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                             Xem tài liệu đính kèm
                         </a>
                     </div>
                 </div>
             )}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-white text-sm font-medium">
                  Bài trước
              </button>
              <button 
                  onClick={handleMarkComplete}
                  disabled={currentCompleted}
                  className={`px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${
                      currentCompleted 
                      ? 'bg-green-100 text-green-700 cursor-default' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                  {currentCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học'}
              </button>
          </div>
       </div>
    </div>
  );
};
