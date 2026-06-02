import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './index'

export interface Schedule {
  id: string
  name: string
  platform: 'facebook' | 'tiktok' | 'both'
  content_id: string | null
  account_ids: string | null
  group_ids: string | null
  cron_expression: string
  is_active: boolean
  start_date: string | null
  end_date: string | null
  last_run_at: string | null
  created_at: string
}

export interface ScheduleWithRelations extends Schedule {
  content_name?: string
  content_platform?: string
  group_count?: number
  account_count?: number
}

export function getSchedules(platform?: string): ScheduleWithRelations[] {
  const database = getDatabase()
  let query = `
    SELECT s.*, c.name as content_name, c.platform as content_platform
    FROM schedules s
    LEFT JOIN contents c ON s.content_id = c.id
  `
  const params: any[] = []
  if (platform) {
    query += ' WHERE s.platform = ? OR s.platform = ?'
    params.push(platform, 'both')
  }
  query += ' ORDER BY s.created_at DESC'
  const rows = database.prepare(query).all(...params) as ScheduleWithRelations[]

  return rows.map(row => ({
    ...row,
    group_count: row.group_ids ? JSON.parse(row.group_ids).length : 0,
    account_count: row.account_ids ? JSON.parse(row.account_ids).length : 0
  }))
}

export function getSchedule(id: string): ScheduleWithRelations | undefined {
  const database = getDatabase()
  const row = database.prepare(`
    SELECT s.*, c.name as content_name, c.platform as content_platform
    FROM schedules s
    LEFT JOIN contents c ON s.content_id = c.id
    WHERE s.id = ?
  `).get(id) as ScheduleWithRelations | undefined

  if (row) {
    row.group_count = row.group_ids ? JSON.parse(row.group_ids).length : 0
    row.account_count = row.account_ids ? JSON.parse(row.account_ids).length : 0
  }
  return row
}

export function getActiveSchedules(): ScheduleWithRelations[] {
  const database = getDatabase()
  const rows = database.prepare(`
    SELECT s.*, c.name as content_name, c.platform as content_platform
    FROM schedules s
    LEFT JOIN contents c ON s.content_id = c.id
    WHERE s.is_active = 1
    ORDER BY s.created_at DESC
  `).all() as ScheduleWithRelations[]

  return rows.map(row => ({
    ...row,
    group_count: row.group_ids ? JSON.parse(row.group_ids).length : 0,
    account_count: row.account_ids ? JSON.parse(row.account_ids).length : 0
  }))
}

export function addSchedule(data: Omit<Schedule, 'id' | 'created_at' | 'last_run_at'>): Schedule {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO schedules (id, name, platform, content_id, account_ids, group_ids, cron_expression, is_active, start_date, end_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.platform, data.content_id || null,
    data.account_ids || null, data.group_ids || null,
    data.cron_expression, data.is_active ? 1 : 0,
    data.start_date || null, data.end_date || null, now
  )
  return getSchedule(id)!
}

export function updateSchedule(id: string, updates: Partial<Schedule>): void {
  const database = getDatabase()
  const fields = ['name', 'platform', 'content_id', 'account_ids', 'group_ids', 'cron_expression', 'is_active', 'start_date', 'end_date', 'last_run_at']
  const setClauses: string[] = []
  const params: any[] = []

  for (const field of fields) {
    if (field in updates) {
      setClauses.push(`${field} = ?`)
      const val = (updates as any)[field]
      params.push(field === 'is_active' ? (val ? 1 : 0) : val)
    }
  }

  if (setClauses.length === 0) return
  params.push(id)
  database.prepare(`UPDATE schedules SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function deleteSchedule(id: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM schedules WHERE id = ?').run(id)
}
