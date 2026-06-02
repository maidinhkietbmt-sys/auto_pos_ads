import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './index'

export interface Group {
  id: string
  platform: 'facebook' | 'tiktok'
  name: string
  url: string
  external_id: string | null
  type: string | null
  is_active: boolean
  last_posted_at: string | null
  created_at: string
}

export function getGroups(platform?: string): Group[] {
  const database = getDatabase()
  let query = 'SELECT * FROM groups_'
  const params: any[] = []
  if (platform) {
    query += ' WHERE platform = ?'
    params.push(platform)
  }
  query += ' ORDER BY created_at DESC'
  return database.prepare(query).all(...params) as Group[]
}

export function getActiveGroups(platform?: string): Group[] {
  const database = getDatabase()
  let query = 'SELECT * FROM groups_ WHERE is_active = 1'
  const params: any[] = []
  if (platform) {
    query += ' AND platform = ?'
    params.push(platform)
  }
  query += ' ORDER BY created_at DESC'
  return database.prepare(query).all(...params) as Group[]
}

export function getGroup(id: string): Group | undefined {
  const database = getDatabase()
  return database.prepare('SELECT * FROM groups_ WHERE id = ?').get(id) as Group | undefined
}

export function addGroup(data: Omit<Group, 'id' | 'created_at'>): Group {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO groups_ (id, platform, name, url, external_id, type, is_active, last_posted_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.platform, data.name, data.url, data.external_id || null, data.type || 'group', data.is_active ? 1 : 0, data.last_posted_at || null, now)
  return getGroup(id)!
}

export function updateGroup(id: string, updates: Partial<Group>): void {
  const database = getDatabase()
  const fields = ['platform', 'name', 'url', 'external_id', 'type', 'is_active', 'last_posted_at']
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
  database.prepare(`UPDATE groups_ SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function updateGroupLastPosted(id: string): void {
  const database = getDatabase()
  database.prepare('UPDATE groups_ SET last_posted_at = ? WHERE id = ?')
    .run(new Date().toISOString(), id)
}

export function deleteGroup(id: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM groups_ WHERE id = ?').run(id)
}
