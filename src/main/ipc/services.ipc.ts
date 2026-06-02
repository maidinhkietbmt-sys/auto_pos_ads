import { ipcMain } from 'electron'
import { launchBrowser, closeBrowser, loginToFacebook, loadStoredSession, getIsLoggedIn, postToMultipleGroups, postToGroup } from '../facebook-poster'
import { selectImages, copyImagesToStorage, deleteStoredImage, deleteStoredImages, listStoredImages } from '../image-manager'
import { isEncryptionAvailable } from '../crypto-utils'
import { initializeScheduler, stopAllSchedules, getActiveTaskCount, schedulePosting, unschedulePosting } from '../scheduler/index'
import {
  launchTikTokBrowser, closeTikTokBrowser, loginToTikTok, loadTikTokSession,
  getTikTokIsLoggedIn, authenticateWithToken, getTikTokProfile
} from '../services/tiktok'
import { postToTikTokViaApi, postToTikTokViaBrowser, validateMediaFile } from '../services/tiktok'
import {
  syncFacebookCampaigns, syncTikTokCampaigns, syncAllInsights,
  getAggregatedMetrics, findFacebookAdsAccount, findTikTokAdsAccount
} from '../services/ads-sync'

export function registerServicesIpcHandlers(): void {
  // ========== Facebook Engine ==========
  ipcMain.handle('facebook:login', async (_event, email: string, password: string) => {
    await launchBrowser(false)
    return await loginToFacebook(email, password)
  })
  ipcMain.handle('facebook:checkLogin', async () => {
    return getIsLoggedIn() || await loadStoredSession()
  })
  ipcMain.handle('facebook:logout', async () => {
    await closeBrowser()
  })
  ipcMain.handle('facebook:postToGroups', async (_event, groups: { url: string; name: string }[], content: string, imagePaths?: string[]) => {
    return await postToMultipleGroups(groups, content, imagePaths)
  })

  // ========== Images ==========
  ipcMain.handle('images:select', async () => {
    return await selectImages()
  })
  ipcMain.handle('images:copyToStorage', async (_event, sourcePaths: string[]) => {
    return await copyImagesToStorage(sourcePaths)
  })
  ipcMain.handle('images:delete', (_event, filename: string) => {
    return deleteStoredImage(filename)
  })
  ipcMain.handle('images:deleteMultiple', (_event, filenames: string[]) => {
    deleteStoredImages(filenames)
  })
  ipcMain.handle('images:list', () => {
    return listStoredImages()
  })

  // ========== Scheduler ==========
  ipcMain.handle('scheduler:init', () => {
    initializeScheduler()
  })
  ipcMain.handle('scheduler:stopAll', () => {
    stopAllSchedules()
  })
  ipcMain.handle('schedules:count', () => {
    return getActiveTaskCount()
  })

  // ========== TikTok Engine ==========
  ipcMain.handle('tiktok:login', async (_event, email: string, password: string, accountId?: string) => {
    await launchTikTokBrowser(false)
    return await loginToTikTok(email, password, accountId)
  })
  ipcMain.handle('tiktok:checkLogin', async (_event, accountId?: string) => {
    return getTikTokIsLoggedIn() || await loadTikTokSession(accountId)
  })
  ipcMain.handle('tiktok:logout', async () => {
    await closeTikTokBrowser()
  })
  ipcMain.handle('tiktok:authWithToken', async (_event, accessToken: string, accountId?: string) => {
    return await authenticateWithToken(accessToken, accountId)
  })
  ipcMain.handle('tiktok:getProfile', async () => {
    return await getTikTokProfile()
  })
  ipcMain.handle('tiktok:postViaApi', async (_event, accessToken: string, caption: string, mediaPath: string, accountId?: string) => {
    return await postToTikTokViaApi({
      accessToken, caption, sourceType: 'FILE_UPLOAD', mediaPath
    }, accountId)
  })
  ipcMain.handle('tiktok:postViaBrowser', async (_event, caption: string, mediaPaths: string[], accountId?: string) => {
    return await postToTikTokViaBrowser(caption, mediaPaths, accountId)
  })
  ipcMain.handle('tiktok:validateMedia', (_event, filePath: string) => {
    return validateMediaFile(filePath)
  })

  // ========== Ads Sync Engine ==========
  ipcMain.handle('ads:syncFacebook', async () => {
    const config = findFacebookAdsAccount()
    if (!config?.accessToken) {
      return { success: false, error: 'Không tìm thấy tài khoản Facebook Ads nào có access token' }
    }
    // Get ad account ID from the BM account's email field (format: act_XXXXX) or from settings
    const adAccountId = config.adAccountId || (await import('../database/accounts').then(m => {
      const bmAccounts = m.getAccounts('facebook').filter(a => a.account_type === 'bm' && a.email?.startsWith('act_'))
      return bmAccounts.length > 0 ? bmAccounts[0].email! : ''
    }))
    if (!adAccountId) {
      return { success: false, error: 'Thiếu Ad Account ID. Vui lòng tạo tài khoản Facebook loại BM với email là Ad Account ID (act_XXXXX).' }
    }
    return await syncFacebookCampaigns({ accessToken: config.accessToken, adAccountId })
  })
  ipcMain.handle('ads:syncTikTok', async () => {
    const config = findTikTokAdsAccount()
    if (!config) {
      return { success: false, error: 'Không tìm thấy tài khoản TikTok Ads nào có access token' }
    }
    return await syncTikTokCampaigns(config)
  })
  ipcMain.handle('ads:syncInsights', async (_event, startDate?: string, endDate?: string) => {
    const fbConfig = findFacebookAdsAccount()
    const ttConfig = findTikTokAdsAccount()
    const fbAccessConfig = fbConfig?.accessToken && fbConfig.adAccountId
      ? { accessToken: fbConfig.accessToken, adAccountId: fbConfig.adAccountId } as any
      : undefined
    const ttAccessConfig = ttConfig || undefined
    return await syncAllInsights(fbAccessConfig, ttAccessConfig, startDate, endDate)
  })
  ipcMain.handle('ads:getAggregatedMetrics', () => {
    return getAggregatedMetrics()
  })

  // ========== Encryption Status ==========
  ipcMain.handle('settings:encryptionStatus', () => ({
    available: isEncryptionAvailable(),
    enabled: true
  }))
}
