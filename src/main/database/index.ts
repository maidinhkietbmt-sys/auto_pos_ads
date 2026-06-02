import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'
import { CREATE_TABLES } from './schema'
import fs from 'fs'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(): void {
  const userDataPath = app.getPath('userData')
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  const dbPath = join(userDataPath, 'social-auto-poster.db')
  console.log(`[DB] Initializing SQLite database at: ${dbPath}`)

  db = new Database(dbPath)

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  // Run migrations
  db.exec(CREATE_TABLES)

  // Seed default settings if empty
  const settingCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }
  if (settingCount.count === 0) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
    const defaultSettings: [string, string][] = [
      ['headless_mode', 'true'],
      ['post_interval_seconds', '60'],
      ['max_posts_per_day', '50'],
      ['min_delay_seconds', '30'],
      ['max_delay_seconds', '120'],
      ['human_like_behavior', 'true'],
      ['auto_retry_failed', 'true'],
      ['retry_max_attempts', '3'],
      ['log_retention_days', '30'],
      ['theme', 'dark'],
      ['language', 'vi']
    ]
    const insertMany = db.transaction((settings: [string, string][]) => {
      for (const [key, value] of settings) {
        insertSetting.run(key, value)
      }
    })
    insertMany(defaultSettings)
  }

  console.log('[DB] Database initialized successfully')
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    console.log('[DB] Database closed')
  }
}

// ========== Activity Logs ==========

export function addActivityLog(
  level: 'info' | 'success' | 'warning' | 'error',
  message: string,
  platform?: string,
  accountId?: string,
  groupId?: string,
  details?: string
): void {
  const database = getDatabase()
  const stmt = database.prepare(`
    INSERT INTO activity_logs (level, platform, account_id, group_id, message, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  stmt.run(level, platform || null, accountId || null, groupId || null, message, details || null)

  // Auto-clean old logs
  cleanOldLogs()
}

export function getActivityLogs(limit = 100, level?: string): any[] {
  const database = getDatabase()
  let query = 'SELECT * FROM activity_logs'
  const params: any[] = []

  if (level && level !== 'all') {
    query += ' WHERE level = ?'
    params.push(level)
  }

  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(limit)

  return database.prepare(query).all(...params)
}

export function getRecentLogs(minutes = 60): any[] {
  const database = getDatabase()
  return database.prepare(`
    SELECT * FROM activity_logs
    WHERE created_at >= datetime('now', '-' || ? || ' minutes')
    ORDER BY created_at DESC
    LIMIT 200
  `).all(minutes)
}

function cleanOldLogs(): void {
  try {
    const database = getDatabase()
    const settingsStmt = database.prepare('SELECT value FROM settings WHERE key = ?')
    const retentionDays = settingsStmt.get('log_retention_days') as { value: string } | undefined
    const days = parseInt(retentionDays?.value || '30')

    database.prepare(`
      DELETE FROM activity_logs
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `).run(days)
  } catch {
    // Silently fail cleanup
  }
}

// ========== Log streaming (for IPC push) ==========
import { EventEmitter } from 'events'
export const logEventEmitter = new EventEmitter()
export const LOG_EVENT = 'new-log'

export function addActivityLogAndEmit(
  level: 'info' | 'success' | 'warning' | 'error',
  message: string,
  platform?: string,
  accountId?: string,
  groupId?: string,
  details?: string
): void {
  addActivityLog(level, message, platform, accountId, groupId, details)
  logEventEmitter.emit(LOG_EVENT, {
    level,
    platform,
    account_id: accountId,
    group_id: groupId,
    message,
    details,
    created_at: new Date().toISOString()
  })
}
