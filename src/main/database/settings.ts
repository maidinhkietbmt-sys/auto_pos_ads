import { getDatabase } from './index'
import { encryptPassword, decryptPassword, isEncrypted } from '../crypto-utils'

// ========== Generic Settings ==========

export function getSetting(key: string): string | undefined {
  const database = getDatabase()
  const row = database.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value
}

export function setSetting(key: string, value: string): void {
  const database = getDatabase()
  database.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}

export function getSettings(keys?: string[]): Record<string, string> {
  const database = getDatabase()
  let query = 'SELECT key, value FROM settings'
  const params: any[] = []
  if (keys && keys.length > 0) {
    query += ' WHERE key IN (' + keys.map(() => '?').join(',') + ')'
    params.push(...keys)
  }
  const rows = database.prepare(query).all(...params) as { key: string; value: string }[]
  const result: Record<string, string> = {}
  for (const row of rows) {
    result[row.key] = row.value
  }
  return result
}

// ========== Facebook Credentials (with encryption) ==========

export interface FacebookCredentials {
  email: string
  password: string
  twofa_secret: string
}

export function getFacebookCredentials(): FacebookCredentials {
  const database = getDatabase()
  const settings = getSettings(['facebook_email', 'facebook_password', 'facebook_twofa_secret'])
  let password = settings['facebook_password'] || ''
  if (password && isEncrypted(password)) {
    password = decryptPassword(password)
  }
  return {
    email: settings['facebook_email'] || '',
    password,
    twofa_secret: settings['facebook_twofa_secret'] || ''
  }
}

export function saveFacebookCredentials(creds: Partial<FacebookCredentials>): void {
  if (creds.email !== undefined) setSetting('facebook_email', creds.email)
  if (creds.password !== undefined) {
    // Always encrypt before saving
    const encrypted = encryptPassword(creds.password)
    setSetting('facebook_password', encrypted)
  }
  if (creds.twofa_secret !== undefined) setSetting('facebook_twofa_secret', creds.twofa_secret)
}

// ========== App Configuration ==========

export interface AppConfig {
  headlessMode: boolean
  postIntervalSeconds: number
  maxPostsPerDay: number
  minDelaySeconds: number
  maxDelaySeconds: number
  humanLikeBehavior: boolean
  autoRetryFailed: boolean
  retryMaxAttempts: number
  theme: string
  language: string
}

export function getAppConfig(): AppConfig {
  const settings = getSettings()
  return {
    headlessMode: settings['headless_mode'] !== 'false',
    postIntervalSeconds: parseInt(settings['post_interval_seconds'] || '60'),
    maxPostsPerDay: parseInt(settings['max_posts_per_day'] || '50'),
    minDelaySeconds: parseInt(settings['min_delay_seconds'] || '30'),
    maxDelaySeconds: parseInt(settings['max_delay_seconds'] || '120'),
    humanLikeBehavior: settings['human_like_behavior'] !== 'false',
    autoRetryFailed: settings['auto_retry_failed'] !== 'false',
    retryMaxAttempts: parseInt(settings['retry_max_attempts'] || '3'),
    theme: settings['theme'] || 'dark',
    language: settings['language'] || 'vi'
  }
}

export function saveAppConfig(config: Partial<AppConfig>): void {
  if (config.headlessMode !== undefined) setSetting('headless_mode', config.headlessMode ? 'true' : 'false')
  if (config.postIntervalSeconds !== undefined) setSetting('post_interval_seconds', config.postIntervalSeconds.toString())
  if (config.maxPostsPerDay !== undefined) setSetting('max_posts_per_day', config.maxPostsPerDay.toString())
  if (config.minDelaySeconds !== undefined) setSetting('min_delay_seconds', config.minDelaySeconds.toString())
  if (config.maxDelaySeconds !== undefined) setSetting('max_delay_seconds', config.maxDelaySeconds.toString())
  if (config.humanLikeBehavior !== undefined) setSetting('human_like_behavior', config.humanLikeBehavior ? 'true' : 'false')
  if (config.autoRetryFailed !== undefined) setSetting('auto_retry_failed', config.autoRetryFailed ? 'true' : 'false')
  if (config.retryMaxAttempts !== undefined) setSetting('retry_max_attempts', config.retryMaxAttempts.toString())
  if (config.theme !== undefined) setSetting('theme', config.theme)
  if (config.language !== undefined) setSetting('language', config.language)
}
