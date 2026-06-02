/**
 * Human Behavior Simulation Service
 * 
 * Centralized utilities for simulating human-like interactions during
 * browser automation. Designed to be reused by Facebook, TikTok, and
 * any future platform modules to avoid detection.
 * 
 * Features:
 * - Multiple typing profiles (slow, normal, fast, programmer)
 * - Multiple scrolling profiles (reader, skimmer, scroller)
 * - Mouse movement with bezier-like curves
 * - Random delay generators with configurable distributions
 * - Browser fingerprint overrides
 * - Session timing patterns
 */

// ========================================================================
// CONFIGURATION
// ========================================================================

export interface HumanBehaviorConfig {
  /** Typing speed profile */
  typingProfile: 'slow' | 'normal' | 'fast' | 'programmer' | 'random'
  /** Scrolling behavior profile */
  scrollProfile: 'reader' | 'skimmer' | 'scroller' | 'random'
  /** Mouse movement complexity (steps count multiplier) */
  mouseComplexity: 'minimal' | 'normal' | 'realistic'
  /** Multiplier for all delays (0.5 = 2x faster, 2 = 2x slower) */
  delayMultiplier: number
  /** Whether to add random mouse movements between actions */
  idleMouseMovements: boolean
  /** Whether to add random page scrolls between actions */
  idleScrolling: boolean
  /** Whether to simulate random tab switching behavior */
  simulateTabSwitching: boolean
  /** Error rate (typo correction simulation) - 0 to 1 */
  typoRate: number
}

export const DEFAULT_CONFIG: HumanBehaviorConfig = {
  typingProfile: 'normal',
  scrollProfile: 'random',
  mouseComplexity: 'normal',
  delayMultiplier: 1.0,
  idleMouseMovements: false,
  idleScrolling: false,
  simulateTabSwitching: false,
  typoRate: 0.02
}

/**
 * Create a configuration optimized for Facebook automation
 */
export function facebookConfig(overrides?: Partial<HumanBehaviorConfig>): HumanBehaviorConfig {
  return { ...DEFAULT_CONFIG, typingProfile: 'normal', scrollProfile: 'reader', mouseComplexity: 'normal', ...overrides }
}

/**
 * Create a configuration optimized for TikTok automation
 * TikTok is more aggressive with bot detection, so use slower profiles
 */
export function tikTokConfig(overrides?: Partial<HumanBehaviorConfig>): HumanBehaviorConfig {
  return {
    ...DEFAULT_CONFIG,
    typingProfile: 'slow',
    scrollProfile: 'skimmer',
    mouseComplexity: 'realistic',
    idleMouseMovements: true,
    idleScrolling: true,
    ...overrides
  }
}

// ========================================================================
// RANDOM DELAYS
// ========================================================================

/**
 * Sleep for a random duration within [min, max] milliseconds.
 * Applies the global delayMultiplier from config.
 */
export async function randomDelay(minMs: number, maxMs: number, config?: HumanBehaviorConfig): Promise<void> {
  const mult = config?.delayMultiplier ?? 1
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  const adjusted = Math.round(ms * mult)
  return new Promise(resolve => setTimeout(resolve, adjusted))
}

/**
 * Common delay patterns used across automation tasks.
 * These provide semantically-named delays for readability.
 */
export const Delays = {
  /** After navigation, wait for page to settle */
  afterNavigation: () => randomDelay(1500, 3500),
  /** Before clicking an element */
  beforeClick: () => randomDelay(300, 1200),
  /** After clicking an element */
  afterClick: () => randomDelay(500, 1500),
  /** Between typing characters */
  betweenKeystrokes: (profile: HumanBehaviorConfig['typingProfile'] = 'normal') => {
    const ranges: Record<string, [number, number]> = {
      slow: [80, 200],
      normal: [40, 120],
      fast: [20, 60],
      programmer: [10, 40],
      random: [[80, 200], [40, 120], [20, 60]][Math.floor(Math.random() * 3)] as [number, number]
    }
    const [min, max] = ranges[profile] || ranges.normal
    return randomDelay(min, max)
  },
  /** Typing pause after special characters */
  afterSpecialChar: () => randomDelay(250, 600),
  /** Between filling form fields */
  betweenFields: () => randomDelay(400, 1500),
  /** Between subsequent page actions (submitting, scrolling) */
  betweenActions: () => randomDelay(1000, 3000),
  /** Between posting to different groups/accounts */
  betweenPosts: (platform: 'facebook' | 'tiktok' = 'facebook') => {
    const [min, max] = platform === 'tiktok' ? [45000, 150000] : [30000, 120000]
    return randomDelay(min, max)
  },
  /** Short "thinking" pause before a decision */
  thinking: () => randomDelay(800, 2500),
  /** Pause simulating reading content */
  reading: () => randomDelay(3000, 8000),
  /** Idle pause as if user stepped away briefly */
  idle: () => randomDelay(10000, 30000),
}

// ========================================================================
// HUMAN-LIKE TYPING
// ========================================================================

/** Delay ranges for each typing profile (char delay in ms) */
const TYPING_DELAYS: Record<string, { min: number; max: number }> = {
  slow: { min: 80, max: 200 },
  normal: { min: 40, max: 120 },
  fast: { min: 20, max: 60 },
  programmer: { min: 10, max: 40 }
}

/** Characters that naturally cause longer pauses when typing */
const PAUSE_CHARS = new Set([' ', '.', ',', '!', '?', '@', '\n', '\t'])
/** Characters that might trigger a brief hesitation */
const HESITATION_CHARS = new Set(['@', '.', '/', '\\', '|'])

/**
 * Type text with human-like speed variations.
 * 
 * @param page - Playwright Page instance
 * @param element - The input/textarea element to type into
 * @param text - The text to type
 * @param config - Optional human behavior config
 */
export async function humanLikeType(
  page: any,
  element: any,
  text: string,
  config?: HumanBehaviorConfig
): Promise<void> {
  const profile = config?.typingProfile || 'normal'
  const { min, max } = TYPING_DELAYS[profile] || TYPING_DELAYS.normal

  // Clear the field first
  await element.click()
  await randomDelay(150, 400)
  await element.fill('')

  const chars = text.split('')
  let i = 0

  while (i < chars.length) {
    const char = chars[i]

    // Simulate occasional typo (only on normal/slow profiles)
    if (profile !== 'fast' && profile !== 'programmer' && Math.random() < 0.015) {
      // Type wrong character
      const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26))
      await element.type(wrongChar, { delay: randomDelay(min, max) })
      await randomDelay(200, 500) // Realize the mistake
      await page.keyboard.press('Backspace')
      await randomDelay(150, 350)
      // Now type the correct character
      await element.type(char, { delay: randomDelay(min, max) })
    } else {
      await element.type(char, { delay: randomDelay(min, max) })
    }

    // Special character handling
    if (PAUSE_CHARS.has(char)) {
      await randomDelay(200, 500)
    } else if (HESITATION_CHARS.has(char)) {
      await randomDelay(100, 250)
    }

    // Random micro-pause (3% chance per character)
    if (Math.random() < 0.03) {
      await randomDelay(400, 1200)
    }

    i++
  }

  // Brief pause after finishing typing
  await randomDelay(200, 600)
}

/**
 * Type text character by character without clearing the field first.
 * Useful for appending content or typing into already-populated fields.
 */
export async function humanLikeAppend(
  page: any,
  element: any,
  text: string,
  config?: HumanBehaviorConfig
): Promise<void> {
  const profile = config?.typingProfile || 'normal'
  const { min, max } = TYPING_DELAYS[profile] || TYPING_DELAYS.normal

  for (const char of text) {
    await element.type(char, { delay: randomDelay(min, max) })
    if (PAUSE_CHARS.has(char)) {
      await randomDelay(150, 400)
    }
  }
}

// ========================================================================
// MOUSE MOVEMENT
// ========================================================================

/**
 * Simulate human-like mouse movement from current position to a target element.
 * Uses a multi-step bezier-like curve with slight overshoot.
 * 
 * @param page - Playwright Page instance
 * @param selector - CSS selector of the target element
 * @param config - Optional behavior config
 */
export async function humanLikeMouseMove(
  page: any,
  selector: string,
  config?: HumanBehaviorConfig
): Promise<void> {
  const element = await page.waitForSelector(selector, { timeout: 5000 }).catch(() => null)
  if (!element) return

  const box = await element.boundingBox()
  if (!box) return

  const complexity = config?.mouseComplexity || 'normal'
  const stepCounts: Record<string, [number, number]> = {
    minimal: [3, 6],
    normal: [5, 12],
    realistic: [8, 20]
  }
  const [stepsMin, stepsMax] = stepCounts[complexity] || stepCounts.normal
  const steps = stepsMin + Math.floor(Math.random() * (stepsMax - stepsMin))

  const targetX = box.x + box.width / 2
  const targetY = box.y + box.height / 2

  // Introduce slight target variance (humans don't always click the exact center)
  const endX = targetX + (Math.random() - 0.5) * 10
  const endY = targetY + (Math.random() - 0.5) * 10

  // Start from (0,0) — Playwright's default mouse position
  const startX = 0
  const startY = 0

  for (let i = 1; i <= steps; i++) {
    const t = i / steps

    // Use bezier-like curve with slight overshoot near the end
    const eased = t < 0.5
      ? 2 * t * t // Ease in
      : 1 - Math.pow(-2 * t + 2, 2) / 2 // Ease out

    const x = startX + (endX - startX) * eased + (Math.random() - 0.5) * (1 - t) * 40
    const y = startY + (endY - startY) * eased + (Math.random() - 0.5) * (1 - t) * 40

    await page.mouse.move(x, y)
    await randomDelay(20, 80)
  }

  // Very short pause at the destination before clicking
  await randomDelay(100, 250)
}

/**
 * Move mouse in an arc pattern (simulates reaching for a UI element from across the screen)
 */
export async function humanLikeMouseArc(
  page: any,
  targetSelector: string,
  startOffset?: { x: number; y: number }
): Promise<void> {
  const element = await page.waitForSelector(targetSelector, { timeout: 5000 }).catch(() => null)
  if (!element) return

  const box = await element.boundingBox()
  if (!box) return

  const endX = box.x + box.width / 2
  const endY = box.y + box.height / 2
  const startX = startOffset?.x ?? (endX > 500 ? 100 : 800)
  const startY = startOffset?.y ?? 200

  // Arc control point (creates a curved path)
  const cpX = (startX + endX) / 2 + (Math.random() - 0.5) * 200
  const cpY = Math.min(startY, endY) - 50 - Math.random() * 100

  const steps = 10 + Math.floor(Math.random() * 15)

  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * cpX + t * t * endX
    const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * cpY + t * t * endY

    await page.mouse.move(x, y)
    await randomDelay(30, 100)
  }
}

// ========================================================================
// SCROLLING BEHAVIOR
// ========================================================================

/** Scroll profile configurations */
const SCROLL_PROFILES: Record<string, { stepsMin: number; stepsMax: number; stepSizeMin: number; stepSizeMax: number; pauseMin: number; pauseMax: number }> = {
  /** Slow, deliberate scrolling - like reading every line */
  reader: { stepsMin: 6, stepsMax: 12, stepSizeMin: 80, stepSizeMax: 200, pauseMin: 800, pauseMax: 2500 },
  /** Fast scrolling - like looking for something specific */
  skimmer: { stepsMin: 4, stepsMax: 8, stepSizeMin: 250, stepSizeMax: 500, pauseMin: 300, pauseMax: 1000 },
  /** Rapid continuous scrolling */
  scroller: { stepsMin: 3, stepsMax: 6, stepSizeMin: 400, stepSizeMax: 800, pauseMin: 100, pauseMax: 400 },
}

/**
 * Simulate human-like scrolling on the page.
 * 
 * @param page - Playwright Page instance
 * @param scrollDistance - Total pixels to scroll (negative = scroll up)
 * @param config - Optional behavior config
 */
export async function humanLikeScroll(
  page: any,
  scrollDistance: number = 300,
  config?: HumanBehaviorConfig
): Promise<void> {
  const profileName = config?.scrollProfile || 'random'
  const profile = profileName === 'random'
    ? Object.values(SCROLL_PROFILES)[Math.floor(Math.random() * 3)]
    : SCROLL_PROFILES[profileName] || SCROLL_PROFILES.reader

  const steps = profile.stepsMin + Math.floor(Math.random() * (profile.stepsMax - profile.stepsMin))
  const direction = scrollDistance >= 0 ? 1 : -1
  const totalDistance = Math.abs(scrollDistance)
  const baseStepSize = totalDistance / steps

  for (let i = 0; i < steps; i++) {
    // Vary step size within the profile range
    const variation = (Math.random() - 0.5) * (profile.stepSizeMax - profile.stepSizeMin)
    const stepSize = Math.max(20, baseStepSize + variation) * direction

    await page.evaluate((y: number) => window.scrollBy(0, y), stepSize)

    // Each scroll step has a pause
    const pause = profile.pauseMin + Math.random() * (profile.pauseMax - profile.pauseMin)
    await randomDelay(pause, pause + 200)
  }

  // Sometimes overshoot and scroll back slightly (human correction)
  if (Math.random() < 0.3) {
    await randomDelay(500, 1500)
    const correction = (Math.random() * 30 + 10) * -direction
    await page.evaluate((y: number) => window.scrollBy(0, y), correction)
  }
}

/**
 * Scroll to bottom of page gradually, as a human would
 */
export async function humanLikeScrollToBottom(page: any, config?: HumanBehaviorConfig): Promise<void> {
  let scrollTop = 0
  let attempts = 0
  const maxAttempts = 20

  while (attempts < maxAttempts) {
    const newScrollTop = await page.evaluate(() => {
      window.scrollBy(0, 300 + Math.random() * 500)
      return window.scrollY
    })
    await randomDelay(400, 1500)

    if (newScrollTop === scrollTop) break // Reached bottom
    scrollTop = newScrollTop
    attempts++
  }
}

// ========================================================================
// BROWSER FINGERPRINT
// ========================================================================

/**
 * Get browser launch arguments that help avoid automation detection.
 * These flags disable common signals that websites use to detect bots.
 */
export function getStealthLaunchArgs(): string[] {
  return [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-session-crashed-bubble',
    '--disable-account-consistency',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-pings',
    '--mute-audio'
  ]
}

/**
 * Generate a diverse User-Agent string from a pool of modern browsers.
 * Returns a random agent each call to avoid fingerprinting.
 */
export function getRandomUserAgent(): string {
  const agents = [
    // Windows Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    // Windows Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    // macOS Chrome
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // macOS Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    // Windows Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
  ]
  return agents[Math.floor(Math.random() * agents.length)]
}

/**
 * Generate viewport dimensions that look realistic for a desktop user.
 */
export function getRandomViewport(): { width: number; height: number } {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 1600, height: 900 },
    { width: 2560, height: 1440 }
  ]
  return viewports[Math.floor(Math.random() * viewports.length)]
}

/**
 * Get realistic timezone/locale/geolocation based on a proxy region code.
 */
export function getGeoConfig(regionCode?: string): {
  timezoneId: string
  locale: string
  geolocation: { latitude: number; longitude: number }
} {
  const regions: Record<string, { timezoneId: string; locale: string; geolocation: { latitude: number; longitude: number } }> = {
    VN: { timezoneId: 'Asia/Ho_Chi_Minh', locale: 'vi-VN', geolocation: { latitude: 21.0285, longitude: 105.8542 } },
    US: { timezoneId: 'America/New_York', locale: 'en-US', geolocation: { latitude: 40.7128, longitude: -74.006 } },
    UK: { timezoneId: 'Europe/London', locale: 'en-GB', geolocation: { latitude: 51.5074, longitude: -0.1278 } },
    SG: { timezoneId: 'Asia/Singapore', locale: 'en-SG', geolocation: { latitude: 1.3521, longitude: 103.8198 } },
    JP: { timezoneId: 'Asia/Tokyo', locale: 'ja-JP', geolocation: { latitude: 35.6762, longitude: 139.6503 } },
    KR: { timezoneId: 'Asia/Seoul', locale: 'ko-KR', geolocation: { latitude: 37.5665, longitude: 126.978 } },
    AU: { timezoneId: 'Australia/Sydney', locale: 'en-AU', geolocation: { latitude: -33.8688, longitude: 151.2093 } },
    DE: { timezoneId: 'Europe/Berlin', locale: 'de-DE', geolocation: { latitude: 52.52, longitude: 13.405 } },
    FR: { timezoneId: 'Europe/Paris', locale: 'fr-FR', geolocation: { latitude: 48.8566, longitude: 2.3522 } },
  }
  return regions[regionCode?.toUpperCase() || ''] || regions.VN
}

// ========================================================================
// SESSION TIMING PATTERNS
// ========================================================================

/**
 * Generate a realistic-looking session schedule.
 * Returns timestamp ranges that look like real user activity patterns.
 */
export function generateSessionTimes(): { startHour: number; endHour: number } {
  // Weighted random: most users active in morning/evening
  const patterns = [
    { weight: 35, startHour: 7, endHour: 12 },   // Morning
    { weight: 20, startHour: 12, endHour: 14 },  // Lunch break
    { weight: 25, startHour: 18, endHour: 23 },  // Evening
    { weight: 10, startHour: 14, endHour: 18 },  // Afternoon
    { weight: 10, startHour: 23, endHour: 2 },   // Late night
  ]

  const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0)
  let rand = Math.random() * totalWeight
  for (const pattern of patterns) {
    rand -= pattern.weight
    if (rand <= 0) return { startHour: pattern.startHour, endHour: pattern.endHour }
  }

  return { startHour: 8, endHour: 18 }
}

// ========================================================================
// IDLE BEHAVIORS
// ========================================================================

/**
 * Perform random idle activities to appear more human.
 * Call this between major automation steps.
 */
export async function performIdleActivity(page: any, config?: HumanBehaviorConfig): Promise<void> {
  if (!config?.idleMouseMovements && !config?.idleScrolling) return

  const actions: (() => Promise<void>)[] = []

  if (config?.idleMouseMovements) {
    actions.push(async () => {
      // Random mouse movement
      const x = Math.random() * 500
      const y = Math.random() * 500
      await page.mouse.move(x, y)
      await randomDelay(50, 200)
    })
    actions.push(async () => {
      // Small circle movement
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        await page.mouse.move(300 + Math.cos(angle) * 50, 300 + Math.sin(angle) * 50)
        await randomDelay(30, 80)
      }
    })
  }

  if (config?.idleScrolling) {
    actions.push(async () => {
      await humanLikeScroll(page, 100 + Math.random() * 200)
    })
    actions.push(async () => {
      await humanLikeScroll(page, -(50 + Math.random() * 100))
    })
  }

  // Perform 0-2 random idle actions
  const count = Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)]
    if (action) await action()
    await randomDelay(1000, 4000)
  }
}

// ========================================================================
// LINKEDIN / FB / TT SPECIFIC TIMING
// ========================================================================

/**
 * Simulate reading a piece of content before interacting.
 * For example, "reading" a post's text before commenting.
 */
export async function simulateReading(textLength: number): Promise<void> {
  // Average reading speed: ~200 words/min = ~3.3 words/sec
  // Average word length: ~5 chars
  const words = textLength / 5
  const readingTimeMs = (words / 3.3) * 1000
  // Add some variance (humans don't read at constant speed)
  const variance = (Math.random() - 0.5) * 0.5 // ±25%
  await randomDelay(
    Math.max(1000, Math.floor(readingTimeMs * (1 + variance) * 0.5)), // Skim: 50% speed
    Math.max(2000, Math.floor(readingTimeMs * (1 - variance) * 1.5))  // Read fully: 150% speed
  )
}
