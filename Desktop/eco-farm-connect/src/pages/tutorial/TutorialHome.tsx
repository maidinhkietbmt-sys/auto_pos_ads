import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

const tutorialSections = [
  {
    icon: '🗺️',
    title: 'Lộ trình học Python',
    description: 'Từ người mới bắt đầu đến Senior — lộ trình bài bản từ 0 đến 24+ tháng',
    path: '/farmer/tutorial/learning-path',
    color: 'from-blue-500 to-cyan-500',
    tags: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  },
  {
    icon: '🏋️',
    title: 'Bài tập Python',
    description: '25+ bài tập từ cơ bản đến nâng cao, có gợi ý và mức độ khó',
    path: '/farmer/tutorial/exercises',
    color: 'from-emerald-500 to-teal-500',
    tags: ['Thực hành', 'Dự án', 'Challenge'],
  },
];

export const TutorialHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 pt-6 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/farmer/profile')} className="text-white/80">←</button>
          <h1 className="text-lg font-bold">Học Python</h1>
        </div>
        <p className="text-primary-200 text-sm leading-relaxed">
          Tài liệu học Python miễn phí — từ cài đặt môi trường đến xây dựng ứng dụng production-grade.
          Phù hợp cho người mới bắt đầu!
        </p>
      </div>

      {/* Progress Overview */}
      <div className="px-4 -mt-5">
        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐍</span>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Lộ trình 5 giai đoạn</p>
              <p className="text-xs text-gray-500 mt-1">Nền tảng → Chuyên sâu → Senior</p>
            </div>
            <span className="text-2xl font-bold text-primary-600">5</span>
          </div>
        </Card>
      </div>

      {/* Section Cards */}
      <div className="px-4 mt-5 space-y-4">
        {tutorialSections.map((section, i) => (
          <button
            key={i}
            onClick={() => navigate(section.path)}
            className="w-full text-left active:scale-[0.98] transition-transform"
          >
            <div className={`rounded-2xl p-5 bg-gradient-to-br ${section.color} text-white`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{section.icon}</span>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {section.tags.map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1">{section.title}</h2>
              <p className="text-white/80 text-sm leading-relaxed">{section.description}</p>
              <div className="mt-3 flex items-center gap-1 text-white/70 text-xs font-medium">
                <span>Bắt đầu ngay</span>
                <span>→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="px-4 mt-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Mẹo học tập</p>
        <Card>
          <div className="space-y-3">
            {[
              { icon: '⏰', tip: 'Dành 30-60 phút mỗi ngày, học đều đặn' },
              { icon: '✍️', tip: 'Code tay từng bài tập — không copy-paste' },
              { icon: '🔄', tip: 'Ôn lại kiến thức cũ mỗi tuần' },
              { icon: '💬', tip: 'Tham gia cộng đồng Python để hỏi đáp' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Resources */}
      <div className="px-4 mt-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Tài nguyên tham khảo</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Python.org', url: 'https://python.org' },
            { label: 'Real Python', url: 'https://realpython.com' },
            { label: 'freeCodeCamp', url: 'https://freecodecamp.org' },
            { label: 'W3Schools', url: 'https://w3schools.com/python' },
          ].map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white rounded-xl border border-gray-100 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
            >
              {resource.label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 mt-8 text-center">
        <p className="text-[10px] text-gray-400">Tài liệu được tổng hợp và cập nhật liên tục</p>
      </div>
    </div>
  );
};
