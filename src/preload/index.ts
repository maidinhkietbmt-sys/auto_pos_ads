import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // ========== Accounts ==========
  accounts: {
    getAll: (platform?: string) => ipcRenderer.invoke('accounts:getAll', platform),
    get: (id: string) => ipcRenderer.invoke('accounts:get', id),
    add: (data: any) => ipcRenderer.invoke('accounts:add', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('accounts:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('accounts:delete', id),
    updateStatus: (id: string, status: string) => ipcRenderer.invoke('accounts:updateStatus', id, status)
  },

  // ========== Proxies ==========
  proxies: {
    getAll: () => ipcRenderer.invoke('proxies:getAll'),
    add: (data: any) => ipcRenderer.invoke('proxies:add', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('proxies:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('proxies:delete', id)
  },

  // ========== Groups ==========
  groups: {
    getAll: () => ipcRenderer.invoke('groups:getAll'),
    getActive: () => ipcRenderer.invoke('groups:getActive'),
    add: (data: any) => ipcRenderer.invoke('groups:add', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('groups:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('groups:delete', id),
    updateLastPosted: (id: string) => ipcRenderer.invoke('groups:updateLastPosted', id)
  },

  // ========== Content ==========
  content: {
    getAll: (platform?: string) => ipcRenderer.invoke('content:getAll', platform),
    get: (id: string) => ipcRenderer.invoke('content:get', id),
    add: (data: any) => ipcRenderer.invoke('content:add', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('content:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('content:delete', id)
  },

  // ========== Schedules ==========
  schedules: {
    getAll: () => ipcRenderer.invoke('schedules:getAll'),
    getActive: () => ipcRenderer.invoke('schedules:getActive'),
    add: (data: any) => ipcRenderer.invoke('schedules:add', data),
    update: (id: string, updates: any) => ipcRenderer.invoke('schedules:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('schedules:delete', id)
  },

  // ========== History ==========
  history: {
    getAll: (limit?: number) => ipcRenderer.invoke('history:getAll', limit),
    getTodayStats: () => ipcRenderer.invoke('history:getTodayStats'),
    getOverallStats: () => ipcRenderer.invoke('history:getOverallStats'),
    getPlatformStats: (platform: string) => ipcRenderer.invoke('history:getPlatformStats', platform),
    add: (record: any) => ipcRenderer.invoke('history:add', record)
  },

  // ========== Settings ==========
  settings: {
    getAll: (keys?: string[]) => ipcRenderer.invoke('settings:getAll', keys),
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
    getAppConfig: () => ipcRenderer.invoke('settings:getAppConfig'),
    saveAppConfig: (config: any) => ipcRenderer.invoke('settings:saveAppConfig', config),
    getFacebookCredentials: () => ipcRenderer.invoke('settings:getFacebookCredentials'),
    saveFacebookCredentials: (creds: any) => ipcRenderer.invoke('settings:saveFacebookCredentials', creds)
  },

  // ========== Ads Campaigns ==========
  ads: {
    getCampaigns: (platform?: string) => ipcRenderer.invoke('ads:getCampaigns', platform),
    getCampaign: (id: string) => ipcRenderer.invoke('ads:getCampaign', id),
    addCampaign: (data: any) => ipcRenderer.invoke('ads:addCampaign', data),
    updateCampaign: (id: string, updates: any) => ipcRenderer.invoke('ads:updateCampaign', id, updates),
    deleteCampaign: (id: string) => ipcRenderer.invoke('ads:deleteCampaign', id),
    getAdsets: (campaignId?: string) => ipcRenderer.invoke('ads:getAdsets', campaignId),
    addAdset: (data: any) => ipcRenderer.invoke('ads:addAdset', data),
    getInsights: (adsetId: string, days?: number) => ipcRenderer.invoke('ads:getInsights', adsetId, days),
    getRules: (platform?: string) => ipcRenderer.invoke('ads:getRules', platform),
    addRule: (data: any) => ipcRenderer.invoke('ads:addRule', data),
    updateRule: (id: string, updates: any) => ipcRenderer.invoke('ads:updateRule', id, updates),
    deleteRule: (id: string) => ipcRenderer.invoke('ads:deleteRule', id),
    syncFacebook: () => ipcRenderer.invoke('ads:syncFacebook'),
    syncTikTok: () => ipcRenderer.invoke('ads:syncTikTok'),
    syncInsights: (startDate?: string, endDate?: string) => ipcRenderer.invoke('ads:syncInsights', startDate, endDate),
    getAggregatedMetrics: () => ipcRenderer.invoke('ads:getAggregatedMetrics')
  },

  // ========== Activity Logs ==========
  logs: {
    getAll: (limit?: number, level?: string) => ipcRenderer.invoke('logs:getAll', limit, level),
    getRecent: (minutes?: number) => ipcRenderer.invoke('logs:getRecent', minutes),
    // Listen for real-time log push events
    onNewLog: (callback: (log: any) => void) => {
      const handler = (_event: any, log: any) => callback(log)
      ipcRenderer.on('logs:new', handler)
      return () => ipcRenderer.removeListener('logs:new', handler)
    }
  },

  // ========== Images ==========
  images: {
    select: () => ipcRenderer.invoke('images:select'),
    copyToStorage: (sourcePaths: string[]) => ipcRenderer.invoke('images:copyToStorage', sourcePaths),
    delete: (filename: string) => ipcRenderer.invoke('images:delete', filename),
    deleteMultiple: (filenames: string[]) => ipcRenderer.invoke('images:deleteMultiple', filenames),
    list: () => ipcRenderer.invoke('images:list')
  },

  // ========== Facebook Engine ==========
  facebook: {
    login: (email: string, password: string) => ipcRenderer.invoke('facebook:login', email, password),
    checkLogin: () => ipcRenderer.invoke('facebook:checkLogin'),
    logout: () => ipcRenderer.invoke('facebook:logout'),
    postToGroups: (groups: { url: string; name: string }[], content: string, imagePaths?: string[]) =>
      ipcRenderer.invoke('facebook:postToGroups', groups, content, imagePaths)
  },

  // ========== TikTok Engine ==========
  tiktok: {
    login: (email: string, password: string, accountId?: string) =>
      ipcRenderer.invoke('tiktok:login', email, password, accountId),
    checkLogin: (accountId?: string) => ipcRenderer.invoke('tiktok:checkLogin', accountId),
    logout: () => ipcRenderer.invoke('tiktok:logout'),
    authWithToken: (accessToken: string, accountId?: string) =>
      ipcRenderer.invoke('tiktok:authWithToken', accessToken, accountId),
    getProfile: () => ipcRenderer.invoke('tiktok:getProfile'),
    postViaApi: (accessToken: string, caption: string, mediaPath: string, accountId?: string) =>
      ipcRenderer.invoke('tiktok:postViaApi', accessToken, caption, mediaPath, accountId),
    postViaBrowser: (caption: string, mediaPaths: string[], accountId?: string) =>
      ipcRenderer.invoke('tiktok:postViaBrowser', caption, mediaPaths, accountId),
    validateMedia: (filePath: string) => ipcRenderer.invoke('tiktok:validateMedia', filePath)
  },

  // ========== Scheduler ==========
  scheduler: {
    init: () => ipcRenderer.invoke('scheduler:init'),
    stopAll: () => ipcRenderer.invoke('scheduler:stopAll'),
    count: () => ipcRenderer.invoke('schedules:count')
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
