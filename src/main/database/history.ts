import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './index'

export interface PostHistory {
  id: string
  platform: 'facebook' | 'tiktok'
  schedule_id: string | null
  account_id: string | null
  group_id: string | null
  content_id: string | null
  content: string | null
  media_count: number
  status: 'success' | 'failed' | 'pending'
  error: string | null
  post_url: string | null
  posted_at: string
}

export function addHistory(record: Omit<PostHistory, 'id' | 'posted_at'>): PostHistory {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO post_history (id, platform, schedule_id, account_id, group_id, content_id, content, media_count, status, error, post_url, posted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, record.platform, record.schedule_id || null, record.account_id || null,
    record.group_id || null, record.content_id || null, record.content || null,
    record.media_count || 0, record.status, record.error || null,
    record.post_url || null, now
  )
  return database.prepare('SELECT * FROM post_history WHERE id = ?').get(id) as PostHistory
}

export function getHistory(limit = 100, platform?: string, status?: string): PostHistory[] {
  const database = getDatabase()
  let query = 'SELECT * FROM post_history WHERE 1=1'
  const params: any[] = []

  if (platform) {
    query += ' AND platform = ?'
    params.push(platform)
  }
  if (status && status !== 'all') {
    query += ' AND status = ?'
    params.push(status)
  }
  query += ' ORDER BY posted_at DESC LIMIT ?'
  params.push(limit)

  return database.prepare(query).all(...params) as PostHistory[]
}

export function getTodayStats(): { total: number; success: number; failed: number; pending: number } {
  const database = getDatabase()
  const today = new Date().toISOString().split('T')[0]
  const row = database.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
    FROM post_history WHERE date(posted_at) = ?
  `).get(today) as any

  return {
    total: row?.total || 0,
    success: row?.success || 0,
    failed: row?.failed || 0,
    pending: row?.pending || 0
  }
}

export function getOverallStats(): { totalPosts: number; totalGroups: number; activeSchedules: number; totalAccounts: number } {
  const database = getDatabase()
  const posts = database.prepare('SELECT COUNT(*) as count FROM post_history').get() as any
  const groups = database.prepare('SELECT COUNT(*) as count FROM groups_').get() as any
  const schedules = database.prepare('SELECT COUNT(*) as count FROM schedules WHERE is_active = 1').get() as any
  const accounts = database.prepare('SELECT COUNT(*) as count FROM accounts').get() as any

  return {
    totalPosts: posts?.count || 0,
    totalGroups: groups?.count || 0,
    activeSchedules: schedules?.count || 0,
    totalAccounts: accounts?.count || 0
  }
}

export function getPlatformStats(platform: string): { total: number; success: number; failed: number } {
  const database = getDatabase()
  const row = database.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM post_history WHERE platform = ?
  `).get(platform) as any

  return {
    total: row?.total || 0,
    success: row?.success || 0,
    failed: row?.failed || 0
  }
}
