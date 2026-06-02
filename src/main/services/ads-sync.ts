import { addActivityLogAndEmit } from '../database/index'
import {
  getAdCampaigns, addAdCampaign, updateAdCampaign, deleteAdCampaign,
  getAdAdsets, addAdAdset,
  getAdInsights
} from '../database/campaigns'
import { getAccounts } from '../database/accounts'
import { createTikTokAdsClient, TikTokApiClient, TikTokAdsConfig } from './tiktok/marketing-api'
import { createFacebookAdsClient, FacebookAdsClient, FacebookAdsConfig } from './facebook/ads'

// ========== Unified Types ==========

export interface SyncedCampaign {
  localId?: string
  platform: 'facebook' | 'tiktok'
  externalId: string
  name: string
  objective: string
  status: string
  dailyBudget?: number
  startTime?: string
  endTime?: string
}

export interface UnifiedInsight {
  date: string
  platform: 'facebook' | 'tiktok'
  campaignId: string
  campaignName: string
  impressions: number
  clicks: number
  spend: number
  cpm: number
  ctr: number
  cpc: number
  cpa: number
  conversions: number
  reach: number
}

export interface AggregatedMetrics {
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  totalConversions: number
  avgCpm: number
  avgCtr: number
  avgCpc: number
  avgCpa: number
  campaignCount: number
  activeCampaigns: number
}

// ========== Sync Functions ==========

/**
 * Sync Facebook campaigns from Meta API to local DB
 */
export async function syncFacebookCampaigns(config: FacebookAdsConfig): Promise<SyncedCampaign[]> {
  addActivityLogAndEmit('info', 'Bắt đầu đồng bộ Facebook Ads campaigns...', 'facebook')

  try {
    const client = createFacebookAdsClient(config)
    const remoteCampaigns = await client.getCampaigns()
    const localCampaigns = getAdCampaigns('facebook')
    const synced: SyncedCampaign[] = []

    for (const remote of remoteCampaigns) {
      const existing = localCampaigns.find(c => c.external_id === remote.externalId)

      if (existing) {
        // Update existing campaign
        updateAdCampaign(existing.id, {
          name: remote.campaignName,
          objective: remote.objective?.toLowerCase() || null,
          status: remote.status?.toLowerCase() as any || 'paused',
          daily_budget: remote.dailyBudget ? remote.dailyBudget / 100 : null,
          start_time: remote.startTime || null,
          end_time: remote.endTime || null
        })
        synced.push({ localId: existing.id, platform: 'facebook', ...remote } as any)
      } else {
        // Create new campaign record
        const local = addAdCampaign({
          platform: 'facebook',
          external_id: remote.externalId!,
          name: remote.campaignName,
          objective: remote.objective?.toLowerCase() || null,
          status: remote.status?.toLowerCase() as any || 'paused',
          daily_budget: remote.dailyBudget ? remote.dailyBudget / 100 : null,
          lifetime_budget: remote.lifetimeBudget ? remote.lifetimeBudget / 100 : null,
          start_time: remote.startTime || null,
          end_time: remote.endTime || null
        })
        synced.push({ localId: local.id, platform: 'facebook', ...remote } as any)
      }
    }

    addActivityLogAndEmit('success', `Đã đồng bộ ${synced.length} chiến dịch Facebook`, 'facebook')
    return synced
  } catch (error: any) {
    addActivityLogAndEmit('error', `Đồng bộ Facebook thất bại: ${error.message}`, 'facebook')
    throw error
  }
}

/**
 * Sync TikTok campaigns from Marketing API to local DB
 */
export async function syncTikTokCampaigns(config: TikTokAdsConfig): Promise<SyncedCampaign[]> {
  addActivityLogAndEmit('info', 'Bắt đầu đồng bộ TikTok Ads campaigns...', 'tiktok')

  try {
    const client = createTikTokAdsClient(config)
    const remoteCampaigns = await client.getCampaigns()
    const localCampaigns = getAdCampaigns('tiktok')
    const synced: SyncedCampaign[] = []

    for (const remote of remoteCampaigns) {
      const existing = localCampaigns.find(c => c.external_id === remote.id)

      if (existing) {
        updateAdCampaign(existing.id, {
          name: remote.campaignName,
          objective: remote.objective?.toLowerCase() || null,
          status: remote.status?.toLowerCase() as any || 'paused',
          daily_budget: remote.budget || null,
          start_time: remote.startTime || null,
          end_time: remote.endTime || null
        })
        synced.push({ localId: existing.id, platform: 'tiktok', externalId: remote.id!, name: remote.campaignName, objective: remote.objective, status: remote.status } as any)
      } else {
        const local = addAdCampaign({
          platform: 'tiktok',
          external_id: remote.id!,
          name: remote.campaignName,
          objective: remote.objective?.toLowerCase() || null,
          status: remote.status?.toLowerCase() as any || 'paused',
          daily_budget: remote.budget || null,
          start_time: remote.startTime || null,
          end_time: remote.endTime || null
        })
        synced.push({ localId: local.id, platform: 'tiktok', externalId: remote.id!, name: remote.campaignName, objective: remote.objective, status: remote.status } as any)
      }
    }

    addActivityLogAndEmit('success', `Đã đồng bộ ${synced.length} chiến dịch TikTok`, 'tiktok')
    return synced
  } catch (error: any) {
    addActivityLogAndEmit('error', `Đồng bộ TikTok thất bại: ${error.message}`, 'tiktok')
    throw error
  }
}

/**
 * Sync insights from Facebook/TikTok for all synced campaigns
 */
export async function syncAllInsights(
  fbConfig?: FacebookAdsConfig,
  ttConfig?: TikTokAdsConfig,
  startDate?: string,
  endDate?: string
): Promise<UnifiedInsight[]> {
  const toDate = endDate || new Date().toISOString().split('T')[0]
  const fromDate = startDate || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const allInsights: UnifiedInsight[] = []

  addActivityLogAndEmit('info', `Đang đồng bộ insights từ ${fromDate} đến ${toDate}...`, 'system')

  // Sync Facebook insights
  if (fbConfig) {
    try {
      const fbClient = createFacebookAdsClient(fbConfig)
      const fbCampaigns = getAdCampaigns('facebook')

      for (const campaign of fbCampaigns) {
        if (!campaign.external_id) continue

        const insights = await fbClient.getCampaignInsights(campaign.external_id, fromDate, toDate)
        for (const insight of insights) {
          allInsights.push({
            date: insight.date,
            platform: 'facebook',
            campaignId: campaign.id,
            campaignName: campaign.name,
            impressions: insight.impressions,
            clicks: insight.clicks,
            spend: insight.spend,
            cpm: insight.cpm,
            ctr: insight.ctr,
            cpc: insight.cpc,
            cpa: insight.cpa,
            conversions: insight.conversions,
            reach: insight.reach
          })
        }
      }
      addActivityLogAndEmit('success', `Đã đồng bộ insights cho ${fbCampaigns.length} campaign Facebook`, 'facebook')
    } catch (error: any) {
      addActivityLogAndEmit('error', `Đồng bộ Facebook insights thất bại: ${error.message}`, 'facebook')
    }
  }

  // Sync TikTok insights
  if (ttConfig) {
    try {
      const ttClient = createTikTokAdsClient(ttConfig)
      const ttAds = await ttClient.getAdGroups()
      const ttCampaigns = getAdCampaigns('tiktok')

      for (const adset of ttAds.slice(0, 10)) {
        if (!adset.id) continue

        const insights = await ttClient.getInsights(adset.id, fromDate, toDate)
        for (const insight of insights) {
          const campaign = ttCampaigns.find(c => c.external_id === adset.campaignId)
          allInsights.push({
            date: insight.date,
            platform: 'tiktok',
            campaignId: campaign?.id || adset.campaignId,
            campaignName: campaign?.name || adset.adgroupName,
            impressions: insight.impressions,
            clicks: insight.clicks,
            spend: insight.spend,
            cpm: insight.cpm,
            ctr: insight.ctr,
            cpc: insight.cpc,
            cpa: insight.cpa,
            conversions: insight.conversions,
            reach: 0 // TikTok API doesn't directly provide reach
          })
        }
      }
      addActivityLogAndEmit('success', `Đã đồng bộ insights từ TikTok`, 'tiktok')
    } catch (error: any) {
      addActivityLogAndEmit('error', `Đồng bộ TikTok insights thất bại: ${error.message}`, 'tiktok')
    }
  }

  addActivityLogAndEmit('success', `Hoàn tất đồng bộ: ${allInsights.length} bản ghi insights`, 'system')
  return allInsights
}

/**
 * Get aggregated metrics from local DB across all campaigns
 */
export function getAggregatedMetrics(): AggregatedMetrics {
  const campaigns = getAdCampaigns()
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length

  // Aggregate insights from DB
  let totalImpressions = 0
  let totalClicks = 0
  let totalSpend = 0
  let totalConversions = 0
  let insightCount = 0

  for (const campaign of campaigns) {
    const adsets = getAdAdsets(campaign.id)
    for (const adset of adsets) {
      const insights = getAdInsights(adset.id, 30)
      for (const insight of insights) {
        totalImpressions += insight.impressions
        totalClicks += insight.clicks
        totalSpend += insight.spend
        totalConversions += insight.conversions
        insightCount++
      }
    }
  }

  return {
    totalImpressions,
    totalClicks,
    totalSpend,
    totalConversions,
    avgCpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
    avgCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    avgCpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
    campaignCount: campaigns.length,
    activeCampaigns
  }
}

/**
 * Find the first active FB account with an access token for ads
 */
export function findFacebookAdsAccount(): { accessToken?: string; adAccountId?: string } | null {
  const fbAccounts = getAccounts('facebook').filter(a => a.status === 'live' && a.access_token)
  if (fbAccounts.length === 0) return null

  const account = fbAccounts[0]
  return {
    accessToken: account.access_token || undefined,
    adAccountId: account.account_type === 'bm' ? account.email || undefined : undefined
  }
}

/**
 * Find the first active TikTok account with an access token for ads
 */
export function findTikTokAdsAccount(): TikTokAdsConfig | null {
  const ttAccounts = getAccounts('tiktok').filter(a => a.status === 'live' && a.access_token)
  if (ttAccounts.length === 0) return null

  const account = ttAccounts[0]
  return {
    accessToken: account.access_token || '',
    advertiserId: account.email || account.label || ''
  }
}
