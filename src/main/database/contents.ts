import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './index'

export interface Content {
  id: string
  name: string
  platform: 'facebook' | 'tiktok' | 'both'
  template: string
  spintax: string | null
  media_paths: string | null
  created_at: string
  updated_at: string
}

export function getContents(platform?: string): Content[] {
  const database = getDatabase()
  let query = 'SELECT * FROM contents'
  const params: any[] = []
  if (platform) {
    query += ' WHERE platform = ? OR platform = ?'
    params.push(platform, 'both')
  }
  query += ' ORDER BY updated_at DESC'
  return database.prepare(query).all(...params) as Content[]
}

export function getContent(id: string): Content | undefined {
  const database = getDatabase()
  return database.prepare('SELECT * FROM contents WHERE id = ?').get(id) as Content | undefined
}

export function addContent(data: Omit<Content, 'id' | 'created_at' | 'updated_at'>): Content {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO contents (id, name, platform, template, spintax, media_paths, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name, data.platform, data.template, data.spintax || null, data.media_paths || null, now, now)
  return getContent(id)!
}

export function updateContent(id: string, updates: Partial<Content>): void {
  const database = getDatabase()
  const fields = ['name', 'platform', 'template', 'spintax', 'media_paths']
  const setClauses: string[] = []
  const params: any[] = []

  for (const field of fields) {
    if (field in updates) {
      setClauses.push(`${field} = ?`)
      params.push((updates as any)[field] ?? null)
    }
  }

  if (setClauses.length === 0) return
  setClauses.push('updated_at = ?')
  params.push(new Date().toISOString())
  params.push(id)

  database.prepare(`UPDATE contents SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function deleteContent(id: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM contents WHERE id = ?').run(id)
}
