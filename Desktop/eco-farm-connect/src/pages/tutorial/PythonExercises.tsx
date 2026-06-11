import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Exercise {
  id: number;
  title: string;
  difficulty: number;
  phase: string;
  description: string;
  requirements: string[];
  hints?: string[];
  extras?: string[];
  tech?: string[];
  example?: string;
}

const exercises: Exercise[] = [
  // Phase 1: Beginner
  { id: 1, title: 'Hello World và Biến', difficulty: 1, phase: 'Nền tảng',
    description: 'In ra màn hình giới thiệu bản thân và thao tác với biến cơ bản.',
    requirements: [
      'In ra màn hình "Xin chào, tôi là [tên của bạn]"',
      'Tạo biến ten, tuoi, que_quan và in ra câu giới thiệu'
    ],
    hints: ['Dùng f-strings để định dạng: print(f"Xin chào, tôi là {ten}")'],
    example: 'ten = "Nguyen Van A"\ntuoi = 25\nque_quan = "Ha Noi"\nprint(f"Xin chao, toi la {ten}")'
  },
  { id: 2, title: 'Máy Tính Đơn Giản', difficulty: 1, phase: 'Nền tảng',
    description: 'Viết chương trình máy tính với 4 phép tính cơ bản.',
    requirements: [
      'Nhập 2 số và phép tính (+, -, *, /)',
      'In kết quả ra màn hình',
      'Xử lý trường hợp chia cho 0'
    ]
  },
  { id: 3, title: 'Kiểm Tra Số Nguyên Tố', difficulty: 1, phase: 'Nền tảng',
    description: 'Kiểm tra một số nguyên dương có phải số nguyên tố không.',
    requirements: ['Nhập số n', 'Kiểm tra và in kết quả']
  },
  { id: 4, title: 'Fibonacci', difficulty: 1, phase: 'Nền tảng',
    description: 'In ra n số đầu tiên của dãy Fibonacci.',
    requirements: ['Nhập n từ người dùng', 'In ra n số Fibonacci đầu tiên'],
    example: 'n = 7 → 0, 1, 1, 2, 3, 5, 8'
  },
  { id: 5, title: 'Game Đoán Số', difficulty: 1, phase: 'Nền tảng',
    description: 'Game đoán số tương tác với máy tính.',
    requirements: [
      'Máy tính random số từ 1-100',
      'Người dùng đoán, máy báo "lớn hơn" hoặc "nhỏ hơn"',
      'Khi đoán đúng, in số lần đã đoán'
    ]
  },
  { id: 6, title: 'Đếm Ký Tự', difficulty: 1, phase: 'Nền tảng',
    description: 'Đếm các loại ký tự trong chuỗi nhập vào.',
    requirements: [
      'Đếm số chữ cái in hoa',
      'Đếm số chữ cái in thường',
      'Đếm số chữ số',
      'Đếm số ký tự đặc biệt'
    ]
  },
  { id: 7, title: 'Quản Lý Danh Bạ', difficulty: 2, phase: 'Nền tảng',
    description: 'Chương trình quản lý danh bạ với menu tương tác.',
    requirements: [
      'Thêm liên hệ (tên, số điện thoại)',
      'Xem danh sách liên hệ',
      'Tìm kiếm theo tên',
      'Xóa liên hệ',
      'Thoát chương trình'
    ],
    hints: ['Dùng list of dicts để lưu danh bạ']
  },
  { id: 8, title: 'Xử Lý Ma Trận', difficulty: 2, phase: 'Nền tảng',
    description: 'Nhập và xử lý ma trận m×n.',
    requirements: [
      'In ma trận ra màn hình',
      'Tính tổng các phần tử',
      'Tìm phần tử lớn nhất/nhỏ nhất',
      'Tính tổng đường chéo (nếu ma trận vuông)'
    ]
  },
  { id: 9, title: 'Palindrome', difficulty: 1, phase: 'Nền tảng',
    description: 'Kiểm tra chuỗi có phải palindrome không.',
    requirements: ['Kiểm tra chuỗi đọc xuôi đọc ngược đều giống nhau']
  },
  { id: 10, title: 'Sinh Mật Khẩu Ngẫu Nhiên', difficulty: 2, phase: 'Nền tảng',
    description: 'Hàm sinh mật khẩu ngẫu nhiên an toàn.',
    requirements: [
      'Viết hàm generate_password(length=12)',
      'Gồm: chữ hoa, chữ thường, số, ký tự đặc biệt',
      'Đảm bảo có ít nhất 1 ký tự mỗi loại'
    ]
  },

  // Phase 2: Intermediate
  { id: 11, title: 'CLI To-Do List', difficulty: 2, phase: 'Có cấu trúc',
    description: 'Xây dựng ứng dụng To-Do List chạy trên terminal.',
    requirements: [
      'Thêm công việc (tiêu đề, mô tả, deadline, priority)',
      'Xem danh sách (có filter: all, done, pending)',
      'Đánh dấu hoàn thành',
      'Xóa công việc',
      'Lưu dữ liệu vào file JSON'
    ],
    extras: ['Dùng OOP (class Task, class TodoManager)', 'Dùng type hints', 'Dùng argparse cho CLI arguments']
  },
  { id: 12, title: 'Weather Fetcher', difficulty: 2, phase: 'Có cấu trúc',
    description: 'Lấy thông tin thời tiết từ OpenWeatherMap API.',
    requirements: [
      'Nhập tên thành phố',
      'Gọi API openweathermap',
      'In ra: nhiệt độ, độ ẩm, mô tả thời tiết',
      'Xử lý lỗi (thành phố không tồn tại, mất kết nối)'
    ],
    tech: ['requests', 'python-dotenv', '.env file'],
    extras: ['Lưu API key vào .env', 'Có fallback khi không có internet']
  },
  { id: 13, title: 'Web Scraper', difficulty: 3, phase: 'Có cấu trúc',
    description: 'Crawl thông tin sản phẩm từ trang thương mại điện tử.',
    requirements: [
      'Crawl: tên sản phẩm, giá, đánh giá, link hình ảnh',
      'Lưu kết quả vào file CSV',
      'Xử lý pagination (crawl nhiều trang)',
      'Random delay giữa các request'
    ],
    tech: ['requests', 'beautifulsoup4']
  },
  { id: 14, title: 'Hệ Thống Quản Lý Thư Viện', difficulty: 3, phase: 'Có cấu trúc',
    description: 'Xây dựng hệ thống quản lý thư viện với OOP.',
    requirements: [
      'Classes: Book, Member, Library',
      'Thêm/xóa/sửa sách',
      'Đăng ký thành viên',
      'Mượn/trả sách',
      'Tìm kiếm sách theo tên/tác giả',
      'Thống kê: sách đang mượn, quá hạn'
    ],
    extras: ['Dùng abstract class', 'Viết unit test với pytest', 'Lưu dữ liệu bằng SQLite']
  },
  { id: 15, title: 'File Organizer', difficulty: 2, phase: 'Có cấu trúc',
    description: 'Script tự động phân loại file trong thư mục.',
    requirements: [
      'Quét tất cả file trong thư mục chỉ định',
      'Phân loại theo đuôi: .jpg/.png → Images/, .mp3 → Audio/',
      'Tạo thư mục đích nếu chưa tồn tại',
      'Di chuyển file vào thư mục tương ứng'
    ]
  },
  { id: 16, title: 'CSV Report Generator', difficulty: 2, phase: 'Có cấu trúc',
    description: 'Đọc CSV bán hàng và tạo báo cáo thống kê.',
    requirements: [
      'Tổng doanh thu',
      'Sản phẩm bán chạy nhất',
      'Doanh thu theo tháng (vẽ biểu đồ)',
      'Top 5 khách hàng (nếu có)'
    ],
    tech: ['pandas', 'matplotlib'],
    extras: ['Dùng matplotlib vẽ biểu đồ']
  },

  // Phase 3: Advanced
  { id: 17, title: 'Blog API với FastAPI', difficulty: 4, phase: 'Thực thụ',
    description: 'Xây dựng RESTful API cho blog với FastAPI.',
    requirements: [
      'CRUD endpoints cho posts',
      'Đăng ký/đăng nhập user (JWT)',
      'Tìm kiếm bài viết',
      'Rate limiting',
      'Unit test + Integration test'
    ],
    tech: ['FastAPI', 'SQLAlchemy', 'PostgreSQL/SQLite', 'JWT', 'Pydantic']
  },
  { id: 18, title: 'ETL Pipeline', difficulty: 4, phase: 'Thực thụ',
    description: 'Xây dựng ETL pipeline xử lý dữ liệu đa nguồn.',
    requirements: [
      'Extract từ 3 nguồn (API, website, CSV)',
      'Clean dữ liệu, chuẩn hóa format',
      'Tính toán metrics',
      'Lưu vào database + export Excel'
    ],
    tech: ['pandas', 'matplotlib/plotly']
  },
  { id: 19, title: 'Discord Bot', difficulty: 3, phase: 'Thực thụ',
    description: 'Tạo Discord bot với đa chức năng.',
    requirements: [
      'Commands: !help, !ping, !weather, !translate',
      'Welcome message khi có member mới',
      'Music player (play, pause, skip, queue)',
      'Lưu settings vào database'
    ],
    tech: ['discord.py']
  },
  { id: 20, title: 'URL Shortener', difficulty: 3, phase: 'Thực thụ',
    description: 'Xây dựng URL shortener giống bit.ly.',
    requirements: [
      'POST /shorten — rút gọn URL',
      'GET /{short_code} — redirect',
      'GET /stats/{short_code} — thống kê click'
    ],
    tech: ['FastAPI', 'Redis'],
    extras: ['Theo dõi click với user-agent, IP, timestamp']
  },
  { id: 21, title: 'Multi-threaded Web Scraper', difficulty: 4, phase: 'Thực thụ',
    description: 'Web scraper crawl 100+ URLs cùng lúc.',
    requirements: [
      'Dùng ThreadPoolExecutor',
      'Crawl 100+ URLs song song',
      'Tự động retry khi fail (max 3 lần)',
      'Respect robots.txt',
      'Proxy rotation'
    ],
    tech: ['concurrent.futures', 'tqdm']
  },
  { id: 22, title: 'Unit Test cho Project Cũ', difficulty: 3, phase: 'Thực thụ',
    description: 'Viết unit test cho project Python đã làm trước đó.',
    requirements: [
      'Test tất cả functions (pytest)',
      'Mock external API calls',
      'Test coverage ≥ 80%',
      'CI pipeline với GitHub Actions'
    ],
    tech: ['pytest', 'pytest-cov', 'GitHub Actions']
  },

  // Phase 4: Expert
  { id: 23, title: 'E-Commerce Microservices', difficulty: 4, phase: 'Chuyên sâu',
    description: 'Hệ thống e-commerce với microservices architecture.',
    requirements: [
      'user-service, product-service, order-service, notification-service',
      'Mỗi service là 1 FastAPI app riêng',
      'Docker + docker-compose',
      'Message queue (RabbitMQ/Kafka)',
      'API Gateway (Traefik/Nginx)'
    ],
    tech: ['FastAPI', 'Docker', 'PostgreSQL', 'Redis', 'RabbitMQ', 'Prometheus']
  },
  { id: 24, title: 'Real-time Chat Application', difficulty: 4, phase: 'Chuyên sâu',
    description: 'Xây dựng real-time chat app với WebSocket.',
    requirements: [
      'WebSocket (FastAPI WebSocket)',
      'Redis Pub/Sub cho message broadcasting',
      'Lưu chat history vào PostgreSQL',
      'User online/offline status',
      'Typing indicator'
    ],
    tech: ['FastAPI WebSocket', 'Redis', 'PostgreSQL']
  },
  { id: 25, title: 'Data Pipeline với Apache Airflow', difficulty: 4, phase: 'Chuyên sâu',
    description: 'Xây dựng data pipeline với Apache Airflow.',
    requirements: [
      'Create DAGs with tasks',
      'Data extraction from multiple sources',
      'Data transformation and validation',
      'Load to data warehouse',
      'Monitoring và alerting'
    ],
    tech: ['Apache Airflow', 'PostgreSQL', 'Python']
  },
];

const difficultyLabels = ['', 'Dễ', 'Trung bình', 'Khó', 'Rất khó'];
const difficultyVariants: Record<string, 'green' | 'yellow' | 'red' | 'blue'> = {
  '1': 'green',
  '2': 'yellow',
  '3': 'red',
  '4': 'blue',
};

export const PythonExercises: React.FC = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  const phases = ['Nền tảng', 'Có cấu trúc', 'Thực thụ', 'Chuyên sâu'];
  const phaseColors = ['from-emerald-500', 'from-blue-500', 'from-purple-500', 'from-amber-500'];

  const filtered = activePhase ? exercises.filter(e => e.phase === activePhase) : exercises;

  const phaseCounts = phases.reduce((acc, p) => ({ ...acc, [p]: exercises.filter(e => e.phase === p).length }), {} as Record<string, number>);

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/farmer/tutorial')} className="text-white/80">←</button>
          <h1 className="text-lg font-bold">Bài tập Python</h1>
        </div>
        <p className="text-emerald-100 text-xs leading-relaxed">
          25 bài tập từ cơ bản đến nâng cao — mỗi bài đều có gợi ý và mức độ khó
        </p>
      </div>

      {/* Phase Filter */}
      <div className="px-4 -mt-4 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          <button
            onClick={() => setActivePhase(null)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              !activePhase ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'bg-white/70 text-gray-500'
            }`}
          >
            Tất cả ({exercises.length})
          </button>
          {phases.map((phase, i) => (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activePhase === phase
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'bg-white/70 text-gray-500'
              }`}
            >
              {phase} ({phaseCounts[phase]})
            </button>
          ))}
        </div>
      </div>

      {/* Phase Sections */}
      {phases.map((phase, pi) => {
        const phaseExercises = exercises.filter(e => e.phase === phase);
        if (activePhase && activePhase !== phase) return null;
        if (phaseExercises.length === 0) return null;

        return (
          <div key={phase} className="px-4 mt-5">
            <div className={`bg-gradient-to-r ${phaseColors[pi]} to-transparent rounded-2xl p-3 mb-3`}>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-bold">📂 {phase}</span>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {phaseExercises.length} bài tập
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {phaseExercises.map((ex) => (
                <div key={ex.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                      ${ex.difficulty <= 1 ? 'bg-emerald-50 text-emerald-600' :
                        ex.difficulty === 2 ? 'bg-yellow-50 text-yellow-600' :
                        ex.difficulty === 3 ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                      {ex.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ex.title}</p>
                        <Badge variant={difficultyVariants[ex.difficulty]}>
                          {'⭐'.repeat(ex.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ex.description}</p>
                    </div>
                    <span className={`text-gray-300 transition-transform shrink-0 ${
                      expandedExercise === ex.id ? 'rotate-180' : ''
                    }`}>▼</span>
                  </button>

                  {expandedExercise === ex.id && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      {/* Requirements */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1.5">📋 Yêu cầu</p>
                        <div className="space-y-1">
                          {ex.requirements.map((req, ri) => (
                            <div key={ri} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="text-gray-400 mt-0.5 shrink-0">{ri + 1}.</span>
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Example */}
                      {ex.example && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">💡 Ví dụ</p>
                          <pre className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-mono overflow-x-auto">
                            {ex.example}
                          </pre>
                        </div>
                      )}

                      {/* Hints */}
                      {ex.hints && ex.hints.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1.5">💡 Gợi ý</p>
                          <div className="space-y-1">
                            {ex.hints.map((hint, hi) => (
                              <div key={hi} className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl p-2">
                                <span>🔎</span>
                                <span>{hint}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tech */}
                      {ex.tech && ex.tech.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1.5">🔧 Công nghệ</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.tech.map((t, ti) => (
                              <span key={ti} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extras */}
                      {ex.extras && ex.extras.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1.5">🌟 Yêu cầu thêm</p>
                          <div className="space-y-1">
                            {ex.extras.map((extra, ei) => (
                              <div key={ei} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-purple-500 shrink-0">✦</span>
                                <span>{extra}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Back button */}
      <div className="px-4 mt-6">
        <button
          onClick={() => navigate('/farmer/tutorial')}
          className="w-full py-3 text-center text-primary-600 text-sm font-medium rounded-xl bg-white border border-primary-100 hover:bg-primary-50"
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
};
