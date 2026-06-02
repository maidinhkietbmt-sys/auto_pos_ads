import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './index'

export interface Account {
  id: string
  platform: 'facebook' | 'tiktok'
  account_type: string
  label: string | null
  email: string | null
  password: string | null
  twofa_secret: string | null
  access_token: string | null
  access_token_expires_at: string | null
  cookie_data: string | null
  proxy_id: string | null
  user_agent: string | null
  status: 'live' | 'die' | 'checkpoint' | 'limited' | 'unverified'
  note: string | null
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface AccountWithProxy extends Account {
  proxy_label?: string
  proxy_host?: string
  proxy_port?: number
  proxy_type?: string
}

export function getAccounts(platform?: string): AccountWithProxy[] {
  const database = getDatabase()
  let query = `
    SELECT a.*, p.label as proxy_label, p.host as proxy_host, 
           p.port as proxy_port, p.type as proxy_type
    FROM accounts a
    LEFT JOIN proxies p ON a.proxy_id = p.id
  `
  const params: any[] = []
  if (platform) {
    query += ' WHERE a.platform = ?'
    params.push(platform)
  }
  query += ' ORDER BY a.created_at DESC'
  return database.prepare(query).all(...params) as AccountWithProxy[]
}

export function getAccount(id: string): AccountWithProxy | undefined {
  const database = getDatabase()
  return database.prepare(`
    SELECT a.*, p.label as proxy_label, p.host as proxy_host, 
           p.port as proxy_port, p.type as proxy_type
    FROM accounts a
    LEFT JOIN proxies p ON a.proxy_id = p.id
    WHERE a.id = ?
  `).get(id) as AccountWithProxy | undefined
}

export function addAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Account {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()

  database.prepare(`
    INSERT INTO accounts (id, platform, account_type, label, email, password, 
      twofa_secret, access_token, access_token_expires_at, cookie_data, proxy_id,
      user_agent, status, note, last_used_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, account.platform, account.account_type, account.label || null,
    account.email || null, account.password || null,
    account.twofa_secret || null, account.access_token || null,
    account.access_token_expires_at || null, account.cookie_data || null,
    account.proxy_id || null, account.user_agent || null,
    account.status || 'live', account.note || null,
    account.last_used_at || null, now, now
  )

  return getAccount(id)!
}

export function updateAccount(id: string, updates: Partial<Account>): void {
  const database = getDatabase()
  const allowedFields = [
    'platform', 'account_type', 'label', 'email', 'password',
    'twofa_secret', 'access_token', 'access_token_expires_at', 'cookie_data',
    'proxy_id', 'user_agent', 'status', 'note', 'last_used_at'
  ]

  const setClauses: string[] = []
  const params: any[] = []

  for (const field of allowedFields) {
    if (field in updates) {
      setClauses.push(`${field} = ?`)
      params.push((updates as any)[field] ?? null)
    }
  }

  if (setClauses.length === 0) return

  setClauses.push('updated_at = ?')
  params.push(new Date().toISOString())
  params.push(id)

  database.prepare(`UPDATE accounts SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function deleteAccount(id: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM accounts WHERE id = ?').run(id)
}

export function updateAccountStatus(id: string, status: Account['status']): void {
  const database = getDatabase()
  database.prepare('UPDATE accounts SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, new Date().toISOString(), id)
}

export function getAccountsByStatus(status: string, platform?: string): AccountWithProxy[] {
  const database = getDatabase()
  let query = `
    SELECT a.*, p.label as proxy_label, p.host as proxy_host, 
           p.port as proxy_port, p.type as proxy_type
    FROM accounts a
    LEFT JOIN proxies p ON a.proxy_id = p.id
    WHERE a.status = ?
  `
  const params: any[] = [status]
  if (platform) {
    query += ' AND a.platform = ?'
    params.push(platform)
  }
  return database.prepare(query).all(...params) as AccountWithProxy[]
}

// ========== Proxies ==========

export interface Proxy {
  id: string
  label: string | null
  type: 'http' | 'https' | 'socks5'
  host: string
  port: number
  username: string | null
  password: string | null
  region: string | null
  is_active: boolean
  created_at: string
}

export function getProxies(): Proxy[] {
  const database = getDatabase()
  return database.prepare('SELECT * FROM proxies ORDER BY created_at DESC').all() as Proxy[]
}

export function addProxy(proxy: Omit<Proxy, 'id' | 'created_at'>): Proxy {
  const database = getDatabase()
  const id = uuidv4()
  database.prepare(`
    INSERT INTO proxies (id, label, type, host, port, username, password, region, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, proxy.label, proxy.type, proxy.host, proxy.port, proxy.username, proxy.password, proxy.region, proxy.is_active ? 1 : 0)
  return database.prepare('SELECT * FROM proxies WHERE id = ?').get(id) as Proxy
}

export function updateProxy(id: string, updates: Partial<Proxy>): void {
  const database = getDatabase()
  const fields = ['label', 'type', 'host', 'port', 'username', 'password', 'region', 'is_active']
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
  database.prepare(`UPDATE proxies SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function deleteProxy(id: string): void {
  const database = getDatabase()
  // Unlink accounts using this proxy first
  database.prepare('UPDATE accounts SET proxy_id = NULL WHERE proxy_id = ?').run(id)
  database.prepare('DELETE FROM proxies WHERE id = ?').run(id)
}
