import { useState, useEffect, useCallback, useRef } from 'react'

export interface LogEntry {
  id?: number
  level: 'info' | 'success' | 'warning' | 'error'
  platform?: string
  account_id?: string
  group_id?: string
  message: string
  details?: string
  created_at: string
}

const MAX_LOG_ENTRIES = 500

// Global state to share across components
let globalLogs: LogEntry[] = []
let listeners: Array<() => void> = []

function notifyListeners(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function pushLog(log: LogEntry): void {
  globalLogs = [log, ...globalLogs].slice(0, MAX_LOG_ENTRIES)
  notifyListeners()
}

export function clearLogs(): void {
  globalLogs = []
  notifyListeners()
}

export function useLogStore() {
  const [, setTick] = useState(0)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const listener = () => setTick(t => t + 1)
    listeners.push(listener)

    // Set up IPC listener for push-based log events
    const setupListener = async () => {
      try {
        const { api } = window as any
        if (api?.logs?.onNewLog) {
          unsubscribeRef.current = api.logs.onNewLog((log: LogEntry) => {
            pushLog(log)
          })
        }
      } catch {
        // Silently fail if API not available
      }
    }
    setupListener()

    return () => {
      listeners = listeners.filter(l => l !== listener)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const logs = globalLogs
  const addLog = useCallback((log: LogEntry) => pushLog(log), [])
  const clear = useCallback(() => clearLogs(), [])

  return { logs, addLog, clear }
}
