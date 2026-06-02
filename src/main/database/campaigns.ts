import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './index'

// ========== Ad Campaigns ==========

export interface AdCampaign {
  id: string
  platform: 'facebook' | 'tiktok'
  external_id: string | null
  name: string
  objective: string | null
  status: 'active' | 'paused' | 'deleted' | 'archived'
  daily_budget: number | null
  lifetime_budget: number | null
  start_time: string | null
  end_time: string | null
  created_at: string
}

export function getAdCampaigns(platform?: string): AdCampaign[] {
  const database = getDatabase()
  let query = 'SELECT * FROM ad_campaigns'
  const params: any[] = []
  if (platform) {
    query += ' WHERE platform = ?'
    params.push(platform)
  }
  query += ' ORDER BY created_at DESC'
  return database.prepare(query).all(...params) as AdCampaign[]
}

export function getAdCampaign(id: string): AdCampaign | undefined {
  const database = getDatabase()
  return database.prepare('SELECT * FROM ad_campaigns WHERE id = ?').get(id) as AdCampaign | undefined
}

export function addAdCampaign(data: Omit<AdCampaign, 'id' | 'created_at'>): AdCampaign {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO ad_campaigns (id, platform, external_id, name, objective, status, daily_budget, lifetime_budget, start_time, end_time, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.platform, data.external_id || null, data.name, data.objective || null, data.status, data.daily_budget || null, data.lifetime_budget || null, data.start_time || null, data.end_time || null, now)
  return getAdCampaign(id)!
}

export function updateAdCampaign(id: string, updates: Partial<AdCampaign>): void {
  const database = getDatabase()
  const fields = ['name', 'objective', 'status', 'daily_budget', 'lifetime_budget', 'start_time', 'end_time']
  const setClauses: string[] = []
  const params: any[] = []

  for (const field of fields) {
    if (field in updates) {
      setClauses.push(`${field} = ?`)
      params.push((updates as any)[field] ?? null)
    }
  }
  if (setClauses.length === 0) return
  params.push(id)
  database.prepare(`UPDATE ad_campaigns SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function deleteAdCampaign(id: string): void {
  const database = getDatabase()
  // Clean related adsets and insights
  const adsets = database.prepare('SELECT id FROM ad_adsets WHERE campaign_id = ?').all(id) as any[]
  for (const adset of adsets) {
    database.prepare('DELETE FROM ad_insights WHERE adset_id = ?').run(adset.id)
  }
  database.prepare('DELETE FROM ad_adsets WHERE campaign_id = ?').run(id)
  database.prepare('DELETE FROM ad_campaigns WHERE id = ?').run(id)
}

// ========== Ad Sets ==========

export interface AdAdset {
  id: string
  campaign_id: string
  external_id: string | null
  name: string
  targeting: string | null
  bid_amount: number | null
  bid_strategy: string | null
  status: string
  created_at: string
}

export function getAdAdsets(campaignId?: string): AdAdset[] {
  const database = getDatabase()
  let query = 'SELECT * FROM ad_adsets'
  const params: any[] = []
  if (campaignId) {
    query += ' WHERE campaign_id = ?'
    params.push(campaignId)
  }
  query += ' ORDER BY created_at DESC'
  return database.prepare(query).all(...params) as AdAdset[]
}

export function addAdAdset(data: Omit<AdAdset, 'id' | 'created_at'>): AdAdset {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO ad_adsets (id, campaign_id, external_id, name, targeting, bid_amount, bid_strategy, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.campaign_id, data.external_id || null, data.name, data.targeting || null, data.bid_amount || null, data.bid_strategy || null, data.status, now)
  return database.prepare('SELECT * FROM ad_adsets WHERE id = ?').get(id) as AdAdset
}

// ========== Ad Insights ==========

export interface AdInsight {
  id: string
  adset_id: string
  date: string
  impressions: number
  clicks: number
  spend: number
  cpm: number | null
  ctr: number | null
  cpc: number | null
  cpa: number | null
  conversions: number
  updated_at: string
}

export function getAdInsights(adsetId: string, days = 7): AdInsight[] {
  const database = getDatabase()
  return database.prepare(`
    SELECT * FROM ad_insights 
    WHERE adset_id = ? AND date >= date('now', '-' || ? || ' days')
    ORDER BY date ASC
  `).all(adsetId, days) as AdInsight[]
}

// ========== Automated Rules ==========

export interface AutomatedRule {
  id: string
  name: string
  platform: string | null
  target_type: string | null
  target_id: string | null
  metric: string
  condition: 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
  threshold: number
  action: 'pause' | 'increase_budget' | 'decrease_budget' | 'notify'
  action_value: number | null
  time_window: number | null
  is_active: boolean
  created_at: string
}

export function getAutomatedRules(platform?: string): AutomatedRule[] {
  const database = getDatabase()
  let query = 'SELECT * FROM automated_rules'
  const params: any[] = []
  if (platform) {
    query += ' WHERE platform = ?'
    params.push(platform)
  }
  query += ' ORDER BY created_at DESC'
  return database.prepare(query).all(...params) as AutomatedRule[]
}

export function addAutomatedRule(data: Omit<AutomatedRule, 'id' | 'created_at'>): AutomatedRule {
  const database = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()
  database.prepare(`
    INSERT INTO automated_rules (id, name, platform, target_type, target_id, metric, condition, threshold, action, action_value, time_window, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.name, data.platform || null, data.target_type || null,
    data.target_id || null, data.metric, data.condition, data.threshold,
    data.action, data.action_value || null, data.time_window || null,
    data.is_active ? 1 : 0, now
  )
  return database.prepare('SELECT * FROM automated_rules WHERE id = ?').get(id) as AutomatedRule
}

export function updateAutomatedRule(id: string, updates: Partial<AutomatedRule>): void {
  const database = getDatabase()
  const fields = ['name', 'platform', 'target_type', 'target_id', 'metric', 'condition', 'threshold', 'action', 'action_value', 'time_window', 'is_active']
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
  database.prepare(`UPDATE automated_rules SET ${setClauses.join(', ')} WHERE id = ?`).run(...params)
}

export function deleteAutomatedRule(id: string): void {
  const database = getDatabase()
  database.prepare('DELETE FROM automated_rules WHERE id = ?').run(id)
}
