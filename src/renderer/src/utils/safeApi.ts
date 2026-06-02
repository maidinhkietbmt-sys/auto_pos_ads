/**
 * Safe API utility for gracefully handling missing Electron contextBridge APIs.
 * 
 * When the app runs inside Electron, `window.api` is provided by the preload script.
 * When running standalone (e.g., during development in a browser), `window.api` is undefined.
 * This utility provides fallback values and catches errors so the UI renders gracefully.
 */

// Default/fallback values for each API namespace
const FALLBACKS: Record<string, any> = {
  accounts: {
    getAll: () => Promise.resolve([]),
    get: () => Promise.resolve(null),
    add: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    updateStatus: () => Promise.resolve()
  },
  proxies: {
    getAll: () => Promise.resolve([]),
    add: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve()
  },
  groups: {
    getAll: () => Promise.resolve([]),
    getActive: () => Promise.resolve([]),
    add: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    updateLastPosted: () => Promise.resolve()
  },
  content: {
    getAll: () => Promise.resolve([]),
    get: () => Promise.resolve(null),
    add: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve()
  },
  schedules: {
    getAll: () => Promise.resolve([]),
    getActive: () => Promise.resolve([]),
    add: () => Promise.resolve({ id: 'mock' }),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve()
  },
  history: {
    getAll: () => Promise.resolve([]),
    getTodayStats: () => Promise.resolve({ total: 0, success: 0, failed: 0, pending: 0 }),
    getOverallStats: () => Promise.resolve({ totalPosts: 0, totalGroups: 0, activeSchedules: 0, totalAccounts: 0 }),
    getPlatformStats: () => Promise.resolve({ total: 0, success: 0, failed: 0 }),
    add: () => Promise.resolve({ id: 'mock' })
  },
  settings: {
    getAll: () => Promise.resolve({}),
    get: () => Promise.resolve({}),
    set: () => Promise.resolve(),
    getAppConfig: () => Promise.resolve({}),
    saveAppConfig: () => Promise.resolve(),
    getFacebookCredentials: () => Promise.resolve({}),
    saveFacebookCredentials: () => Promise.resolve(),
    encryptionStatus: () => Promise.resolve({ available: false, reason: 'not-ready' })
  },
  ads: {
    getCampaigns: () => Promise.resolve([]),
    getCampaign: () => Promise.resolve(null),
    addCampaign: () => Promise.resolve({ id: 'mock' }),
    updateCampaign: () => Promise.resolve(),
    deleteCampaign: () => Promise.resolve(),
    getAdsets: () => Promise.resolve([]),
    addAdset: () => Promise.resolve({ id: 'mock' }),
    getInsights: () => Promise.resolve([]),
    getRules: () => Promise.resolve([]),
    addRule: () => Promise.resolve({ id: 'mock' }),
    updateRule: () => Promise.resolve(),
    deleteRule: () => Promise.resolve(),
    syncFacebook: () => Promise.resolve([]),
    syncTikTok: () => Promise.resolve([]),
    syncInsights: () => Promise.resolve(),
    getAggregatedMetrics: () => Promise.resolve({
      totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalConversions: 0,
      avgCpm: 0, avgCtr: 0, avgCpc: 0, avgCpa: 0, campaignCount: 0, activeCampaigns: 0
    })
  },
  logs: {
    getAll: () => Promise.resolve([]),
    getRecent: () => Promise.resolve([]),
    onNewLog: () => {
      // Return a no-op cleanup function
      return () => {}
    }
  },
  images: {
    select: () => Promise.resolve([]),
    copyToStorage: () => Promise.resolve([]),
    delete: () => Promise.resolve(true),
    deleteMultiple: () => Promise.resolve(),
    list: () => Promise.resolve([])
  },
  facebook: {
    login: () => Promise.resolve(false),
    checkLogin: () => Promise.resolve(false),
    logout: () => Promise.resolve(),
    postToGroups: () => Promise.resolve([])
  },
  scheduler: {
    init: () => Promise.resolve(),
    stopAll: () => Promise.resolve(),
    count: () => Promise.resolve(0)
  }
}

/**
 * Check if the Electron API is available
 */
function isApiAvailable(): boolean {
  try {
    return !!(
      typeof window !== 'undefined' &&
      window.api &&
      typeof window.api === 'object'
    )
  } catch {
    return false
  }
}

/**
 * Safely access a nested API method.
 * Returns the real method if available, otherwise a fallback that returns the default value.
 * 
 * @param namespace - The API namespace (e.g., 'accounts', 'facebook')
 * @param method - The method name (e.g., 'getAll', 'checkLogin')
 * @returns A function that either calls the real API or returns fallback data
 */
export function safeApi<T extends (...args: any[]) => Promise<any>>(
  namespace: string,
  method: string
): T {
  const fallback = FALLBACKS[namespace]?.[method]
  if (!fallback) {
    console.warn(`[safeApi] No fallback for ${namespace}.${method}`)
    return (() => Promise.resolve(undefined)) as unknown as T
  }

  if (!isApiAvailable()) {
    return (() => {
      // Log a single warning per namespace per session
      if (!safeApi.warned.has(namespace)) {
        safeApi.warned.add(namespace)
        console.info(`[safeApi] API unavailable: ${namespace}.${method} — using fallback`)
      }
      return fallback()
    }) as unknown as T
  }

  try {
    const target = (window as any).api?.[namespace]?.[method]
    if (typeof target === 'function') {
      return target as T
    }
    return (() => {
      if (!safeApi.warned.has(namespace)) {
        safeApi.warned.add(namespace)
        console.info(`[safeApi] ${namespace}.${method} not found — using fallback`)
      }
      return fallback()
    }) as unknown as T
  } catch {
    return fallback as unknown as T
  }
}

// Static set to track which namespaces have been warned about
safeApi.warned = new Set<string>()

/**
 * Wraps an async data-loading function with try/catch and loading state.
 * Ensures consistent error handling across all pages.
 * 
 * @param loadFn - The async function to execute
 * @param onError - Optional error callback
 * @returns The result or undefined if failed
 */
export async function safeLoadData<T>(loadFn: () => Promise<T>, onError?: (err: any) => void): Promise<T | undefined> {
  try {
    return await loadFn()
  } catch (err) {
    console.warn('[safeLoadData] Data load failed:', err)
    onError?.(err)
    return undefined
  }
}

/**
 * Check if the Electron backend is connected by pinging a lightweight API endpoint.
 * Returns `true` if `window.api` exists and responds, `false` otherwise.
 * Does NOT throw — always returns a boolean.
 */
export async function checkBackendConnection(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false
    const api = (window as any).api
    if (!api || typeof api !== 'object') return false

    // Try the lightest available API method first
    if (typeof api.scheduler?.count === 'function') {
      await api.scheduler.count()
      return true
    }
    // Fallback: try a simple no-arg method
    if (typeof api.history?.getTodayStats === 'function') {
      await api.history.getTodayStats()
      return true
    }
    // window.api exists — that's enough proof of connection
    return true
  } catch {
    return false
  }
}
