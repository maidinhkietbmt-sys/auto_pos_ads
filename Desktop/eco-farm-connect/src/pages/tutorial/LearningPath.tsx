import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

interface PhaseProps {
  number: number;
  title: string;
  duration: string;
  goal: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Phase: React.FC<PhaseProps> = ({ number, title, duration, goal, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm shrink-0">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {duration}
            </span>
            <span className="text-[10px] text-gray-400 truncate">{goal}</span>
          </div>
        </div>
        <span className={`text-gray-300 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && <div className="px-4 pb-4 border-t border-gray-50 pt-3">{children}</div>}
    </div>
  );
};

const SkillTable: React.FC<{ headers: string[]; rows: [string, string][] }> = ({ headers, rows }) => (
  <div className="overflow-x-auto -mx-1">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-100">
          {headers.map((h, i) => (
            <th key={i} className="text-left font-semibold text-gray-500 pb-2 pr-3">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([topic, detail], i) => (
          <tr key={i} className="border-b border-gray-50 last:border-0">
            <td className="py-2 pr-3 font-medium text-gray-700 whitespace-nowrap">{topic}</td>
            <td className="py-2 text-gray-500">{detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CheckList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="space-y-1.5 mt-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
        <span className="text-emerald-500 mt-0.5 shrink-0">✔️</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

const Tag: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-primary-50 text-primary-700' }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${color} mr-1.5 mb-1`}>
    {children}
  </span>
);

const Resources: React.FC<{ items: { label: string; url: string }[] }> = ({ items }) => (
  <div className="space-y-1 mt-2">
    {items.map((item, i) => (
      <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
        className="block text-xs text-primary-600 hover:underline">
        📖 {item.label} ↗
      </a>
    ))}
  </div>
);

export const LearningPath: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/farmer/tutorial')} className="text-white/80">←</button>
          <h1 className="text-lg font-bold">Lộ trình học Python</h1>
        </div>
        <p className="text-blue-100 text-xs leading-relaxed">
          Từ người mới bắt đầu đến Senior Engineer — lộ trình 5 giai đoạn, 24+ tháng
        </p>
      </div>

      {/* Timeline */}
      <div className="px-4 mt-5 space-y-3">
        {/* Phase 1 */}
        <Phase number={1} title="Nền tảng căn bản" duration="0 → 3 tháng" goal="Tự tin viết script Python giải quyết bài toán nhỏ" defaultOpen>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">🧠 Kiến thức cốt lõi</p>
              <SkillTable
                headers={['Chủ đề', 'Chi tiết']}
                rows={[
                  ['Cài đặt môi trường', 'Cài Python 3.x, VS Code, extension Python'],
                  ['Biến & Kiểu dữ liệu', 'int, float, str, bool, None, ép kiểu, f-strings'],
                  ['Nhập xuất dữ liệu', 'print(), input(), định dạng chuỗi'],
                  ['Toán tử', '+ - * / // % ** == != > < and or not'],
                  ['Cấu trúc điều khiển', 'if/elif/else, for loop, while, break, continue'],
                  ['Hàm (Function)', 'def, tham số, return, scope, global'],
                  ['Cấu trúc dữ liệu', 'list, dict, tuple, set — CRUD cơ bản'],
                  ['List Comprehension', '[x for x in range(10)], lồng comprehension'],
                  ['Xử lý chuỗi', 'split(), join(), replace(), strip(), slicing'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">✅ Thực hành</p>
              <CheckList items={[
                'Bài 1: Máy tính đơn giản (cộng, trừ, nhân, chia)',
                'Bài 2: Game đoán số (random, vòng lặp, điều kiện)',
                'Bài 3: Quản lý danh bạ (CRUD với list/dict)',
                'Bài 4: Xử lý chuỗi — đảo ngược, đếm ký tự, palindrome',
              ]} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">📚 Tài liệu tham khảo</p>
              <Resources items={[
                { label: 'Python.org Tutorial (miễn phí)', url: 'https://docs.python.org/3/tutorial/' },
                { label: 'Automate the Boring Stuff (miễn phí)', url: 'https://automatetheboringstuff.com/' },
                { label: 'freeCodeCamp Python for Beginners', url: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
              ]} />
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Tiêu chí đánh giá hoàn thành</p>
              <p className="text-xs text-emerald-600">Viết được 10+ script Python, hiểu list/dict/tuple/set, tự tin debug lỗi cơ bản</p>
            </div>
          </div>
        </Phase>

        {/* Phase 2 */}
        <Phase number={2} title="Lập trình có cấu trúc" duration="3 → 6 tháng" goal="Viết code sạch, có tổ chức, biết debug & xử lý lỗi">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">🧠 Kiến thức cốt lõi</p>
              <SkillTable
                headers={['Chủ đề', 'Chi tiết']}
                rows={[
                  ['Hàm nâng cao', '*args, **kwargs, lambda, map/filter/reduce, decorators, generators'],
                  ['Xử lý ngoại lệ', 'try/except/finally, raise, custom exception'],
                  ['Module & Package', 'import, __init__.py, if __name__ == "__main__"'],
                  ['Làm việc với file', 'open(), text/JSON/CSV, json/csv modules'],
                  ['OOP căn bản', 'class, __init__, self, inheritance, super()'],
                  ['Virtual Environment', 'venv, pip, requirements.txt, pip freeze'],
                  ['Debugging', 'VS Code debugger, pdb module, print() debugging'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">✅ Thực hành</p>
              <CheckList items={[
                'Bài 1: CLI To-Do List app (lưu file JSON, CRUD, menu tương tác)',
                'Bài 2: Weather Fetcher — gọi API thời tiết (dùng requests)',
                'Bài 3: Web scraper đơn giản với beautifulsoup4',
                'Bài 4: Class quản lý thư viện sách (OOP, file I/O)',
              ]} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">📚 Tài liệu tham khảo</p>
              <Resources items={[
                { label: 'Real Python (realpython.com)', url: 'https://realpython.com/' },
                { label: '\"Python Crash Course\" by Eric Matthes', url: 'https://nostarch.com/pythoncrashcourse2e' },
                { label: 'Python Standard Library docs', url: 'https://docs.python.org/3/library/' },
              ]} />
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Tiêu chí đánh giá hoàn thành</p>
              <p className="text-xs text-emerald-600">Viết được CLI app hoàn chỉnh với menu, lưu dữ liệu. Biết dùng venv và pip. Hiểu OOP cơ bản.</p>
            </div>
          </div>
        </Phase>

        {/* Phase 3 */}
        <Phase number={3} title="Lập trình viên thực thụ" duration="6 → 12 tháng" goal="Xây dựng ứng dụng hoàn chỉnh, biết testing & Git">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">🧠 Kiến thức cốt lõi</p>
              <SkillTable
                headers={['Chủ đề', 'Chi tiết']}
                rows={[
                  ['Git & GitHub', 'clone, commit, push, pull, branch, merge, PR, .gitignore'],
                  ['Testing', 'unittest/pytest, assert, fixtures, code coverage'],
                  ['OOP nâng cao', 'Abstract class, dunder methods, SOLID principles'],
                  ['Type Hints', 'Annotations, typing module (List, Dict, Optional), mypy'],
                  ['Libraries', 'requests, beautifulsoup4, pandas, matplotlib, SQLAlchemy'],
                  ['Database', 'SQLite, SQL cơ bản (SELECT, INSERT, UPDATE, DELETE)'],
                  ['REST API', 'HTTP methods, JSON, authentication (API key, JWT), Postman'],
                  ['Async cơ bản', 'asyncio, async def, await, asyncio.run()'],
                ]}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">✅ Thực hành</p>
              <CheckList items={[
                'Bài 1: Blog API với Flask/FastAPI (CRUD, database, authentication)',
                'Bài 2: ETL pipeline — scrape → clean với pandas → save to database',
                'Bài 3: Discord bot (commands, events, database)',
                'Bài 4: Unit test cho toàn bộ project cũ, coverage ≥ 80%',
              ]} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">📚 Tài liệu tham khảo</p>
              <Resources items={[
                { label: '\"Fluent Python\" by Luciano Ramalho', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/' },
                { label: '\"Test-Driven Development with Python\" by Harry Percival', url: 'https://www.obeythetestinggoat.com/' },
                { label: 'FastAPI Official Documentation', url: 'https://fastapi.tiangolo.com/' },
              ]} />
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Tiêu chí đánh giá hoàn thành</p>
              <p className="text-xs text-emerald-600">Có ít nhất 1 project hoàn chỉnh trên GitHub. Biết viết unit test. Sử dụng được type hints.</p>
            </div>
          </div>
        </Phase>

        {/* Phase 4 */}
        <Phase number={4} title="Chuyên sâu" duration="12 → 24 tháng" goal="Chọn 1-2 hướng chuyên môn hóa, xây dựng production-grade app">
          <div className="space-y-4">
            {/* Path A */}
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-2">🅰 Hướng 1: Web Backend</p>
              <div className="flex flex-wrap gap-1.5">
                <Tag color="bg-blue-100 text-blue-700">FastAPI</Tag>
                <Tag color="bg-blue-100 text-blue-700">Django</Tag>
                <Tag color="bg-blue-100 text-blue-700">PostgreSQL</Tag>
                <Tag color="bg-blue-100 text-blue-700">Docker</Tag>
                <Tag color="bg-blue-100 text-blue-700">Redis</Tag>
                <Tag color="bg-blue-100 text-blue-700">Celery</Tag>
              </div>
            </div>
            {/* Path B */}
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-purple-700 mb-2">🅱 Hướng 2: Data Science / ML</p>
              <div className="flex flex-wrap gap-1.5">
                <Tag color="bg-purple-100 text-purple-700">NumPy</Tag>
                <Tag color="bg-purple-100 text-purple-700">pandas</Tag>
                <Tag color="bg-purple-100 text-purple-700">scikit-learn</Tag>
                <Tag color="bg-purple-100 text-purple-700">Matplotlib</Tag>
                <Tag color="bg-purple-100 text-purple-700">Jupyter</Tag>
                <Tag color="bg-purple-100 text-purple-700">TensorFlow</Tag>
              </div>
            </div>
            {/* Path C */}
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-2">🅲 Hướng 3: DevOps / Automation</p>
              <div className="flex flex-wrap gap-1.5">
                <Tag color="bg-amber-100 text-amber-700">Docker Compose</Tag>
                <Tag color="bg-amber-100 text-amber-700">CI/CD</Tag>
                <Tag color="bg-amber-100 text-amber-700">Terraform</Tag>
                <Tag color="bg-amber-100 text-amber-700">Ansible</Tag>
                <Tag color="bg-amber-100 text-amber-700">Linux</Tag>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">📚 Kiến thức chung</p>
              <div className="flex flex-wrap gap-1.5">
                <Tag>Design Patterns</Tag>
                <Tag>Concurrency</Tag>
                <Tag>Advanced SQL</Tag>
                <Tag>Performance</Tag>
                <Tag>Logging</Tag>
                <Tag>Security</Tag>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">✅ Thực hành</p>
              <CheckList items={[
                'Deploy web app lên cloud (AWS / DigitalOcean / Railway)',
                'Set up CI/CD pipeline tự động build, test, deploy',
                'Xây dựng REST API với rate limiting, caching, logging',
                'Tối ưu performance: profiling, caching, query optimization',
              ]} />
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Tiêu chí đánh giá hoàn thành</p>
              <p className="text-xs text-emerald-600">Build được production-grade app có CI/CD. Hiểu và áp dụng design patterns.</p>
            </div>
          </div>
        </Phase>

        {/* Phase 5 */}
        <Phase number={5} title="Senior Engineer" duration="24+ tháng" goal="Dẫn dắt kỹ thuật, thiết kế hệ thống, mentoring">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">🧠 Kiến thức Senior</p>
              <SkillTable
                headers={['Chủ đề', 'Chi tiết']}
                rows={[
                  ['System Design', 'Microservices, event-driven, CQRS, scalability'],
                  ['Architecture', 'Clean architecture, hexagonal architecture, DDD'],
                  ['Performance', 'Horizontal scaling, caching strategies, CDN'],
                  ['Monitoring', 'Prometheus, Grafana, ELK stack, tracing'],
                  ['Security', 'OWASP Top 10, penetration testing, zero-trust'],
                  ['Mentoring', 'Code review, technical writing, knowledge sharing'],
                  ['Project Management', 'Agile/Scrum, estimation, technical debt management'],
                ]}
              />
            </div>
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-amber-700 mb-2">🌟 Kỹ năng mềm</p>
              <div className="flex flex-wrap gap-1.5">
                <Tag color="bg-amber-100 text-amber-700">Leadership</Tag>
                <Tag color="bg-amber-100 text-amber-700">Communication</Tag>
                <Tag color="bg-amber-100 text-amber-700">Code Review</Tag>
                <Tag color="bg-amber-100 text-amber-700">Technical Writing</Tag>
                <Tag color="bg-amber-100 text-amber-700">Architecture Design</Tag>
                <Tag color="bg-amber-100 text-amber-700">Estimation</Tag>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">✅ Tiêu chí đánh giá hoàn thành</p>
              <p className="text-xs text-emerald-600">Thiết kế và dẫn dắt hệ thống lớn. Mentor junior. Đưa ra quyết định kiến trúc.</p>
            </div>
          </div>
        </Phase>
      </div>

      {/* Suggested Schedule */}
      <div className="px-4 mt-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">📅 Lịch trình đề xuất</p>
        <Card>
          <div className="space-y-2">
            {[
              { day: 'Thứ 2-4-6', focus: 'Học kiến thức mới (30-45 phút)' },
              { day: 'Thứ 3-5', focus: 'Thực hành bài tập (30-60 phút)' },
              { day: 'Thứ 7', focus: 'Làm project cá nhân (1-2 giờ)' },
              { day: 'Chủ nhật', focus: 'Ôn tập, đọc tài liệu, nghỉ ngơi' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-xs font-semibold text-primary-600 shrink-0">{item.day}</span>
                <span className="text-xs text-gray-600">{item.focus}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tips */}
      <div className="px-4 mt-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">💡 Mẹo quan trọng</p>
        <Card>
          <div className="space-y-3">
            {[
              { icon: '🎯', tip: 'Học theo dự án — làm project thực tế thay vì chỉ đọc lý thuyết' },
              { icon: '📝', tip: 'Ghi chép lại những gì học được — giải thích lại cho người khác' },
              { icon: '🐛', tip: 'Đọc và debug code của người khác — học từ open source' },
              { icon: '🤝', tip: 'Tham gia cộng đồng: Stack Overflow, Reddit r/learnpython, Python Việt Nam' },
              { icon: '🏆', tip: 'Làm 1 project hoàn chỉnh từ đầu đến cuối — không bỏ dở giữa chừng' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <p className="text-xs text-gray-600">{item.tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
