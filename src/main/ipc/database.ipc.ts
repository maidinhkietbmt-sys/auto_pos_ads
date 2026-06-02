import { ipcMain } from 'electron'
import {
  getContents, getContent, addContent, updateContent, deleteContent
} from '../database/contents'
import {
  getGroups, getGroup, addGroup, updateGroup, updateGroupLastPosted, deleteGroup
} from '../database/groups'
import {
  getSchedules, getSchedule, getActiveSchedules,
  addSchedule, updateSchedule, deleteSchedule
} from '../database/schedules'
import {
  addHistory, getHistory, getTodayStats, getOverallStats, getPlatformStats
} from '../database/history'
import {
  getSetting, setSetting, getSettings,
  getAppConfig, saveAppConfig,
  getFacebookCredentials, saveFacebookCredentials
} from '../database/settings'
import {
  getAdCampaigns, getAdCampaign, addAdCampaign, updateAdCampaign, deleteAdCampaign,
  getAdAdsets, addAdAdset,
  getAdInsights,
  getAutomatedRules, addAutomatedRule, updateAutomatedRule, deleteAutomatedRule
} from '../database/campaigns'

export function registerDatabaseIpcHandlers(): void {
  // ========== Groups ==========
  ipcMain.handle('groups:getAll', () => getGroups())
  ipcMain.handle('groups:getActive', () => getActiveGroups())
  ipcMain.handle('groups:add', (_event, data) => addGroup(data))
  ipcMain.handle('groups:update', (_event, id: string, updates) => updateGroup(id, updates))
  ipcMain.handle('groups:delete', (_event, id: string) => deleteGroup(id))
  ipcMain.handle('groups:updateLastPosted', (_event, id: string) => updateGroupLastPosted(id))

  // ========== Content ==========
  ipcMain.handle('content:getAll', () => getContents())
  ipcMain.handle('content:get', (_event, id: string) => getContent(id))
  ipcMain.handle('content:add', (_event, data) => addContent(data))
  ipcMain.handle('content:update', (_event, id: string, updates) => updateContent(id, updates))
  ipcMain.handle('content:delete', (_event, id: string) => deleteContent(id))

  // ========== Schedules ==========
  ipcMain.handle('schedules:getAll', () => getSchedules())
  ipcMain.handle('schedules:getActive', () => getActiveSchedules())
  ipcMain.handle('schedules:add', (_event, data) => addSchedule(data))
  ipcMain.handle('schedules:update', (_event, id: string, updates) => updateSchedule(id, updates))
  ipcMain.handle('schedules:delete', (_event, id: string) => deleteSchedule(id))

  // ========== History ==========
  ipcMain.handle('history:getAll', (_event, limit?: number) => getHistory(limit))
  ipcMain.handle('history:getTodayStats', () => getTodayStats())
  ipcMain.handle('history:getOverallStats', () => getOverallStats())
  ipcMain.handle('history:getPlatformStats', (_event, platform: string) => getPlatformStats(platform))

  // ========== Settings ==========
  ipcMain.handle('settings:getAll', (_event, keys?: string[]) => getSettings(keys))
  ipcMain.handle('settings:get', (_event, key: string) => getSetting(key))
  ipcMain.handle('settings:set', (_event, key: string, value: string) => setSetting(key, value))
  ipcMain.handle('settings:getAppConfig', () => getAppConfig())
  ipcMain.handle('settings:saveAppConfig', (_event, config) => saveAppConfig(config))
  ipcMain.handle('settings:getFacebookCredentials', () => getFacebookCredentials())
  ipcMain.handle('settings:saveFacebookCredentials', (_event, creds) => saveFacebookCredentials(creds))

  // ========== Ad Campaigns ==========
  ipcMain.handle('ads:getCampaigns', (_event, platform?: string) => getAdCampaigns(platform))
  ipcMain.handle('ads:getCampaign', (_event, id: string) => getAdCampaign(id))
  ipcMain.handle('ads:addCampaign', (_event, data) => addAdCampaign(data))
  ipcMain.handle('ads:updateCampaign', (_event, id: string, updates) => updateAdCampaign(id, updates))
  ipcMain.handle('ads:deleteCampaign', (_event, id: string) => deleteAdCampaign(id))

  // ========== Ad Adsets ==========
  ipcMain.handle('ads:getAdsets', (_event, campaignId?: string) => getAdAdsets(campaignId))
  ipcMain.handle('ads:addAdset', (_event, data) => addAdAdset(data))

  // ========== Ad Insights ==========
  ipcMain.handle('ads:getInsights', (_event, adsetId: string, days?: number) => getAdInsights(adsetId, days))

  // ========== Automated Rules ==========
  ipcMain.handle('ads:getRules', (_event, platform?: string) => getAutomatedRules(platform))
  ipcMain.handle('ads:addRule', (_event, data) => addAutomatedRule(data))
  ipcMain.handle('ads:updateRule', (_event, id: string, updates) => updateAutomatedRule(id, updates))
  ipcMain.handle('ads:deleteRule', (_event, id: string) => deleteAutomatedRule(id))

  // ========== History helper (for posting flow) ==========
  ipcMain.handle('history:add', (_event, record) => addHistory(record))
}
