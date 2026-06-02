import React, { useState, useRef, useEffect } from 'react'
import { Terminal, X, ChevronDown, ChevronUp, Trash2, ExternalLink, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { useLogStore, LogEntry } from '../stores/LogStore'

interface ActivityLogProps {
  isOpen: boolean
  onToggle: () => void
  isPinned?: boolean
  onTogglePin?: () => void
}

const LEVEL_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ''
  }
}

function LogItem({ log }: { log: LogEntry }): JSX.Element {
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info

  return (
    <div className="flex items-start gap-2 px-3 py-1.5 hover:bg-dark-700/30 transition-colors group text-xs">
      <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
        <config.icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-dark-400 font-mono flex-shrink-0 w-16">
        {formatTime(log.created_at)}
      </span>
      {log.platform && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
          log.platform === 'facebook' ? 'text-blue-400 bg-blue-500/10' : 'text-purple-400 bg-purple-500/10'
        } flex-shrink-0`}>
          {log.platform}
        </span>
      )}
      <span className={`${config.color} flex-1 min-w-0 truncate`}>
        {log.message}
      </span>
    </div>
  )
}

function ActivityLog({ isOpen, onToggle }: ActivityLogProps): JSX.Element {
  const { logs, clear } = useLogStore()
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to top when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs.length, autoScroll])

  const filteredLogs = filterLevel === 'all'
    ? logs
    : logs.filter(l => l.level === filterLevel)

  return (
    <div
      className={`fixed bottom-0 right-0 z-20 transition-all duration-300 ease-in-out ${
        isOpen ? 'h-72' : 'h-10'
      }`}
      style={{ width: 'calc(100% - 16rem)', left: '16rem' }}
    >
      {/* Toggle bar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 bg-dark-800 border-t border-dark-600/50 cursor-pointer select-none hover:bg-dark-700/80 transition-colors"
        onClick={onToggle}
        style={{ borderLeft: '1px solid rgba(71,85,105,0.3)' }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium text-dark-200">Activity Log</span>
          <span className="text-xs text-dark-400 bg-dark-600/50 px-2 py-0.5 rounded-full">
            {logs.length}
          </span>
          {logs.some(l => l.level === 'error') && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          )}
          {logs.some(l => l.level === 'warning') && !logs.some(l => l.level === 'error') && (
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
            {['all', 'info', 'success', 'warning', 'error'].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${
                  filterLevel === level
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-dark-500 hover:text-dark-300'
                }`}
              >
                {level === 'all' ? 'All' : level.slice(0, 3)}
              </button>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); clear() }}
            className="p-1 rounded hover:bg-dark-600/50 text-dark-400 hover:text-dark-200 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-dark-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-dark-400" />
          )}
        </div>
      </div>

      {/* Log content */}
      {isOpen && (
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto bg-dark-800/95 backdrop-blur-sm border-t border-dark-600/30 font-mono text-xs"
          style={{ borderLeft: '1px solid rgba(71,85,105,0.3)', maxHeight: 'calc(100% - 2.5rem)' }}
        >
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-dark-500 text-xs">
              <div className="text-center">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Không có log nào</p>
                <p className="mt-1">Hoạt động sẽ xuất hiện tại đây</p>
              </div>
            </div>
          ) : (
            <div className="py-1">
              {filteredLogs.map((log, index) => (
                <LogItem key={log.id || index} log={log} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityLog
