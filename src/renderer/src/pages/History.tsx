import React, { useState, useEffect } from 'react'
import { Clock, CheckCircle2, XCircle, Search, RefreshCw, X } from 'lucide-react'

function History(): JSX.Element {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await window.api.history.getAll()
      setHistory(data)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter(item =>
    item.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const today = new Date().toISOString().split('T')[0]
  const todayCount = history.filter(h => h.postedAt?.startsWith(today)).length
  const successCount = history.filter(h => h.status === 'success').length
  const failedCount = history.filter(h => h.status === 'failed').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lịch sử đăng bài</h1>
          <p className="text-dark-300 mt-1">Theo dõi tất cả bài đăng đã thực hiện</p>
        </div>
        <button onClick={loadHistory} className="btn-secondary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <p className="text-dark-400 text-sm">Hôm nay</p>
          <p className="text-2xl font-bold text-white mt-1">{todayCount}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-dark-400 text-sm">Thành công</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{successCount}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-dark-400 text-sm">Thất bại</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{failedCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm theo nhóm hoặc nội dung..."
          className="w-full bg-dark-700/50 border border-dark-500 rounded-xl pl-11 pr-12 py-3 text-white placeholder-dark-400 focus:border-brand-500/50 transition-colors"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* History List */}
      {loading ? (
        <div className="glass rounded-2xl divide-y divide-dark-600/30">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className="skeleton skeleton-circle w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="skeleton skeleton-badge" />
                    <div className="skeleton h-3 w-32 rounded" />
                  </div>
                  <div className="skeleton h-4 w-40 rounded" />
                  <div className="skeleton h-3 w-full rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredHistory.length === 0 && searchTerm ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Không tìm thấy kết quả</h3>
          <p className="text-dark-400">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Clock className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có lịch sử</h3>
          <p className="text-dark-400">Bài đăng sẽ xuất hiện ở đây sau khi được đăng</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-dark-600/30">
            {filteredHistory.map((item) => (
              <div key={item.id} className="p-4 hover:bg-dark-700/30 transition-colors stagger-item">
                <div className="flex items-start gap-3">
                  {item.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        item.status === 'success'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {item.status === 'success' ? 'Thành công' : 'Thất bại'}
                      </span>
                      <span className="text-xs text-dark-400">
                        {item.postedAt ? new Date(item.postedAt).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-dark-200">
                      <span className="text-white font-medium">{item.groupName}</span>
                    </p>
                    <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                      {item.content?.slice(0, 200)}
                    </p>
                    {item.error && (
                      <p className="text-xs text-red-400 mt-1">Lỗi: {item.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default History
