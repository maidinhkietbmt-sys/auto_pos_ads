import { chromium, Browser, BrowserContext } from 'playwright'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import {
  randomDelay,
  Delays,
  humanLikeType,
  humanLikeMouseMove as hbHumanLikeMouseMove,
  humanLikeScroll as hbHumanLikeScroll,
  getStealthLaunchArgs,
  getRandomUserAgent,
  getRandomViewport,
  tikTokConfig,
  getGeoConfig,
  performIdleActivity
} from '../human-behavior'

// Re-export for poster.ts and barrel (index.ts) compatibility
export { randomDelay, humanLikeType }
export const humanLikeMouseMove = hbHumanLikeMouseMove
export const humanLikeScroll = hbHumanLikeScroll

// ========== Module State ==========
let browser: Browser | null = null
let activeContext: BrowserContext | null = null
let isLoggedIn = false
let currentAccountId: string | null = null
const ttConfig = tikTokConfig()

// ========== Types ==========
export interface TikTokAuthResult {
  success: boolean
  error?: string
  accountId?: string
  accessToken?: string
  expiresAt?: string
}

export interface TikTokProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  followers?: number
}

// ========== Browser Management ==========

const TIKTOK_BASE = 'https://www.tiktok.com'
const TIKTOK_LOGIN_URL = 'https://www.tiktok.com/login'

/**
 * Get the persistent storage path for TikTok session data
 */
function getTikTokStoragePath(): string {
  const dir = path.join(app.getPath('userData'), 'tiktok-sessions')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * Launch a Playwright browser instance configured for TikTok
 * with anti-detection measures from centralized human-behavior service
 */
export async function launchTikTokBrowser(
  headless: boolean = false,
  proxyConfig?: { host: string; port: number; username?: string; password?: string; type?: string }
): Promise<void> {
  if (browser) return

  const launchOptions: any = {
    headless,
    args: [
      ...getStealthLaunchArgs(),
      '--window-size=1280,800'
    ]
  }

  // Proxy support
  if (proxyConfig?.host) {
    const proxyUrl = proxyConfig.username
      ? `${proxyConfig.type || 'http'}://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.host}:${proxyConfig.port}`
      : `${proxyConfig.type || 'http'}://${proxyConfig.host}:${proxyConfig.port}`
    launchOptions.args.push(`--proxy-server=${proxyUrl}`)
  }

  browser = await chromium.launch(launchOptions)
}

/**
 * Close the TikTok browser and clean up
 */
export async function closeTikTokBrowser(): Promise<void> {
  if (activeContext) {
    await activeContext.close().catch(() => {})
    activeContext = null
  }
  if (browser) {
    await browser.close().catch(() => {})
    browser = null
  }
  isLoggedIn = false
  currentAccountId = null
}

/**
 * Create a fresh browser context with TikTok-friendly fingerprint
 * Uses centralized getRandomUserAgent, getRandomViewport, and getGeoConfig
 */
export async function createTikTokContext(accountId?: string): Promise<BrowserContext> {
  if (!browser) throw new Error('Browser not launched. Call launchTikTokBrowser() first.')

  // Close existing contexts
  for (const ctx of browser.contexts()) {
    await ctx.close().catch(() => {})
  }

  // Try to load stored session
  const sessionPath = accountId
    ? path.join(getTikTokStoragePath(), `tiktok-session-${accountId}.json`)
    : path.join(getTikTokStoragePath(), 'tiktok-session-default.json')

  const geo = getGeoConfig('VN')
  const contextOptions: any = {
    viewport: getRandomViewport(),
    userAgent: getRandomUserAgent(),
    locale: geo.locale,
    timezoneId: geo.timezoneId,
    geolocation: geo.geolocation,
    permissions: ['geolocation'],
    deviceScaleFactor: 1
  }

  // Load stored session if exists
  if (fs.existsSync(sessionPath)) {
    contextOptions.storageState = sessionPath
  }

  activeContext = await browser.newContext(contextOptions)
  return activeContext
}

// ========== OAuth 2.0 Authentication (API Method) ==========

/**
 * Validate a TikTok access token by fetching user info
 * TikTok OAuth uses: POST https://open.tiktokapis.com/v2/oauth/token/
 */
export async function authenticateWithToken(
  accessToken: string,
  accountId?: string
): Promise<TikTokAuthResult> {
  try {
    // Verify token by calling TikTok user info endpoint
    const response = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: ['open_id', 'union_id', 'display_name', 'avatar_url'] })
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error: `Token validation failed: ${error}` }
    }

    const data = await response.json()

    if (accountId) {
      // Update the stored account with the verified token
      const { updateAccount } = await import('../../database/accounts')
      const now = new Date()
      now.setDate(now.getDate() + 365) // Default 1 year expiry
      updateAccount(accountId, {
        access_token: accessToken,
        status: 'live',
        last_used_at: new Date().toISOString(),
        access_token_expires_at: now.toISOString()
      })
    }

    isLoggedIn = true
    currentAccountId = accountId || null

    return {
      success: true,
      accountId,
      accessToken
    }
  } catch (error: any) {
    return {
      success: false,
      error: `TikTok OAuth error: ${error?.message || 'Unknown'}`
    }
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeAuthCode(
  authCode: string,
  clientKey: string,
  clientSecret: string,
  redirectUri: string
): Promise<TikTokAuthResult> {
  try {
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    })

    const data = await response.json()

    if (data.access_token) {
      isLoggedIn = true
      return {
        success: true,
        accessToken: data.access_token,
        expiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : undefined
      }
    }

    return { success: false, error: data.error_description || 'Failed to exchange auth code' }
  } catch (error: any) {
    return { success: false, error: `Token exchange error: ${error?.message}` }
  }
}

// ========== Playwright Automation (Browser Method) ==========

/**
 * Login to TikTok via browser automation
 * Uses human-like behavior from centralized service for anti-detection
 */
export async function loginToTikTok(
  email: string,
  password: string,
  accountId?: string
): Promise<TikTokAuthResult> {
  try {
    const context = await createTikTokContext(accountId)
    const page = await context.newPage()

    try {
      // Step 1: Navigate to login page
      await page.goto(TIKTOK_LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 })
      await Delays.afterNavigation()

      // Step 2: Check if already logged in
      const currentUrl = page.url()
      if (!currentUrl.includes('login')) {
        // Already logged in via stored session
        await saveSession(page, accountId)
        isLoggedIn = true
        currentAccountId = accountId || null
        await page.close()
        return { success: true, accountId }
      }

      // Step 3: Switch to "Use phone/email" option
      const loginWithEmail = await page.waitForSelector(
        'div[data-tab="email"]',
        { timeout: 5000 }
      ).catch(() =>
        page.waitForSelector(
          'a:has-text("Use phone/email")',
          { timeout: 5000 }
        ).catch(() => null)
      )

      if (loginWithEmail) {
        await hbHumanLikeMouseMove(page, 'div[data-tab="email"]', ttConfig)
          .catch(() => hbHumanLikeMouseMove(page, 'a:has-text("Use phone/email")', ttConfig))
          .catch(() => {})
        await loginWithEmail.click()
        await Delays.afterClick()
      }

      // Step 4: Type email with human-like typing
      const emailInput = await page.waitForSelector(
        'input[type="text"], input[name="email"], input[placeholder*="email" i]',
        { timeout: 8000 }
      ).catch(() => null)

      if (!emailInput) {
        await page.close()
        return { success: false, error: 'Không tìm thấy ô nhập email trên TikTok' }
      }

      // Human-like mouse move to email field
      await hbHumanLikeMouseMove(page, 'input[type="text"]', ttConfig).catch(() => {})
      await Delays.beforeClick()
      await humanLikeType(page, emailInput, email, ttConfig)

      // Step 5: Type password
      const passwordInput = await page.waitForSelector(
        'input[type="password"], input[name="password"]',
        { timeout: 5000 }
      ).catch(() => null)

      if (!passwordInput) {
        await page.close()
        return { success: false, error: 'Không tìm thấy ô nhập mật khẩu trên TikTok' }
      }

      await hbHumanLikeMouseMove(page, 'input[type="password"]', ttConfig).catch(() => {})
      await Delays.beforeClick()
      await humanLikeType(page, passwordInput, password, ttConfig)

      // Step 6: Click login button
      await Delays.thinking()
      const loginButton = await page.waitForSelector(
        'button[type="submit"], button:has-text("Log in"), button:has-text("Đăng nhập")',
        { timeout: 5000 }
      ).catch(() => null)

      if (loginButton) {
        await hbHumanLikeMouseMove(page, 'button[type="submit"]', ttConfig).catch(() => {})
        await Delays.beforeClick()
        await loginButton.click()
      }

      // Step 7: Wait for redirect (handles 2FA and checkpoint)
      await Delays.afterNavigation()
      await randomDelay(2000, 4000, ttConfig)

      // Check for CAPTCHA or verification
      const hasCaptcha = await page.waitForSelector(
        'iframe[src*="captcha"], div[class*="captcha"]',
        { timeout: 5000 }
      ).catch(() => null)

      if (hasCaptcha) {
        await page.close()
        return {
          success: false,
          error: 'TikTok yêu cầu xác minh CAPTCHA. Vui lòng đăng nhập thủ công qua trình duyệt.'
        }
      }

      // Check login result
      const loggedInUrl = page.url()
      if (loggedInUrl.includes('login') || loggedInUrl.includes('challenge')) {
        await page.close()
        return { success: false, error: 'Đăng nhập TikTok thất bại. Kiểm tra email/mật khẩu hoặc xác thực.' }
      }

      // Success - save session
      await saveSession(page, accountId)
      isLoggedIn = true
      currentAccountId = accountId || null

      // Update account status in DB
      if (accountId) {
        const { updateAccount } = await import('../../database/accounts')
        updateAccount(accountId, { status: 'live', last_used_at: new Date().toISOString() })
      }

      // Perform idle activity to seem more human
      await performIdleActivity(page, ttConfig)

      await page.close()
      return { success: true, accountId }

    } catch (error: any) {
      await page.close().catch(() => {})
      return { success: false, error: `Lỗi đăng nhập TikTok: ${error?.message || 'Unknown'}` }
    }
  } catch (error: any) {
    return { success: false, error: `Lỗi browser TikTok: ${error?.message || 'Unknown'}` }
  }
}

// ========== Session Management ==========

/**
 * Save browser session (cookies + localStorage) for future use
 */
async function saveSession(page: any, accountId?: string): Promise<string> {
  const sessionPath = accountId
    ? path.join(getTikTokStoragePath(), `tiktok-session-${accountId}.json`)
    : path.join(getTikTokStoragePath(), 'tiktok-session-default.json')

  await page.context().storageState({ path: sessionPath })
  return sessionPath
}

/**
 * Load a stored TikTok session to skip login
 */
export async function loadTikTokSession(accountId?: string): Promise<boolean> {
  try {
    const sessionPath = accountId
      ? path.join(getTikTokStoragePath(), `tiktok-session-${accountId}.json`)
      : path.join(getTikTokStoragePath(), 'tiktok-session-default.json')

    if (!fs.existsSync(sessionPath)) return false

    const context = await createTikTokContext(accountId)
    const page = await context.newPage()

    await page.goto(TIKTOK_BASE, { waitUntil: 'networkidle', timeout: 15000 })
    await Delays.afterNavigation()

    // Check if we're logged in (not redirected to login)
    const currentUrl = page.url()
    const loggedIn = !currentUrl.includes('login') && !currentUrl.includes('challenge')

    if (loggedIn) {
      isLoggedIn = true
      currentAccountId = accountId || null
      // Refresh the saved session
      await saveSession(page, accountId)
    }

    await page.close()
    return loggedIn
  } catch {
    return false
  }
}

/**
 * Get the current TikTok profile info
 */
export async function getTikTokProfile(): Promise<TikTokProfile | null> {
  if (!browser || !isLoggedIn) return null

  try {
    const context = activeContext || browser.contexts()[0]
    if (!context) return null

    const page = await context.newPage()
    await page.goto(`${TIKTOK_BASE}/@me`, { waitUntil: 'networkidle', timeout: 15000 })

    // Extract profile info from page
    const profile = await page.evaluate(() => {
      const usernameEl = document.querySelector('h2[data-e2e="user-title"]')
      const displayNameEl = document.querySelector('h1[data-e2e="user-subtitle"]')

      return {
        username: usernameEl?.textContent?.trim() || '',
        displayName: displayNameEl?.textContent?.trim() || '',
      }
    })

    await page.close()

    if (profile.username) {
      return {
        id: currentAccountId || profile.username,
        username: profile.username,
        displayName: profile.displayName || profile.username
      }
    }
    return null
  } catch {
    return null
  }
}

// ========== Browser Context Management ==========

/**
 * Get all active browser contexts
 */
export function getBrowserContexts(): BrowserContext[] {
  return browser?.contexts() || []
}

// ========== Status Checks ==========

export function getTikTokIsLoggedIn(): boolean {
  return isLoggedIn
}

export function getTikTokCurrentAccountId(): string | null {
  return currentAccountId
}
