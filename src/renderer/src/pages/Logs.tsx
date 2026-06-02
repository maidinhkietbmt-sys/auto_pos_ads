import React, { useState, useEffect, useRef } from 'react'
import {
  Terminal, RefreshCw, Filter, Trash2, AlertCircle,
  CheckCircle2, Info, AlertTriangle, Download
} from 'lucide-react'
import { useLogStore, LogEntry as LogEntryType } from '../stores/LogStore'

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  info: { icon: Info, color: 'text-blue-400', label: 'Info' },
  success: { icon: CheckCircle2, color: 'text-green-400', label: 'Success' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Warning' },
  error: { icon: AlertCircle, color: 'text-red-400', label: 'Error' }
}

function Logs(): JSX.Element {
  const { logs, clear } = useLogStore()
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historicalLogs, setHistoricalLogs] = useState<any[]>([])

  useEffect(() => {
    loadHistoricalLogs()
  }, [])

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs.length, autoScroll])

  const loadHistoricalLogs = async () => {
    setLoadingHistory(true)
    try {
      const result = await window.api.logs.getAll(200)
      setHistoricalLogs(result)
    } catch {
      // Silently fail
    } finally {
      setLoadingHistory(false)
    }
  }

  // Combine live logs with historical logs, deduplicated
  const allLogs = [...logs]
  const historicalIds = new Set(allLogs.map(l => l.id).filter(Boolean))

  for (const h of historicalLogs) {
    if (!historicalIds.has(h.id)) {
      allLogs.push(h)
    }
  }

  // Sort by time
  allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filtered = allLogs.filter(l => {
    if (filterLevel !== 'all' && l.level !== filterLevel) return false
    if (searchTerm && !l.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const exportLogs = () => {
    const content = filtered.map(l =>
      `[${l.created_at}] [${l.level.toUpperCase()}] ${l.platform ? `[${l.platform}] ` : ''}${l.message}`
    ).join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const levelCounts = {
    all: allLogs.length,
    info: allLogs.filter(l => l.level === 'info').length,
    success: allLogs.filter(l => l.level === 'success').length,
    warning: allLogs.filter(l => l.level === 'warning').length,
    error: allLogs.filter(l => l.level === 'error').length
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nhật ký hoạt động</h1>
          <p className="text-dark-300 mt-1">Theo dõi chi tiết tất cả hoạt động của hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportLogs} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={clear} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
            <Trash2 className="w-4 h-4" />
            Xóa
          </button>
          <button onClick={loadHistoricalLogs} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
            <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-dark-700/50 rounded-xl p-1">
          {['all', 'info', 'success', 'warning', 'error'].map(level => {
            const cfg = level === 'all' ? { color: 'text-dark-200', label: 'All' } : LEVEL_CONFIG[level]
            return (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterLevel === level
                    ? 'bg-brand-500/20 text-brand-400'
                    : `${cfg.color} hover:bg-dark-600/50`
                }`}
              >
                {cfg.label}
                <span className="ml-1.5 opacity-60">({levelCounts[level as keyof typeof levelCounts]})</span>
              </button>
            )
          })}
        </div>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm trong log..."
            className="w-full bg-dark-700/50 border border-dark-500 rounded-xl px-4 py-2 text-white text-sm placeholder-dark-400"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-dark-300 cursor-pointer">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={() => setAutoScroll(!autoScroll)}
            className="rounded border-dark-400 bg-dark-600"
          />
          Auto-scroll
        </label>
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        className="flex-1 glass rounded-2xl overflow-y-auto font-mono text-xs"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dark-500">
            <div className="text-center py-16">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có log nào</p>
              {searchTerm && <p className="mt-1">Thử tìm kiếm với từ khóa khác</p>}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-dark-600/20">
            {filtered.map((log, idx) => {
              const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info
              const Icon = cfg.icon
              return (
                <div key={log.id || idx} className="flex items-start gap-3 px-4 py-2.5 hover:bg-dark-700/30 transition-colors">
                  <div className={`mt-0.5 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-dark-500 w-20 flex-shrink-0">
                    {new Date(log.created_at).toLocaleTimeString('vi-VN')}
                  </span>
                  {log.platform && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase flex-shrink-0 ${
                      log.platform === 'facebook' ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10'
                    }`}>
                      {log.platform}
                    </span>
                  )}
                  <span className={`${cfg.color} flex-1`}>
                    {log.message}
                  </span>
                  {log.details && (
                    <span className="text-dark-500 hidden lg:block max-w-xs truncate" title={log.details}>
                      {log.details}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Logs
