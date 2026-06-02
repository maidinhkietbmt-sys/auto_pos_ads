/**
 * Facebook Ads API Integration via Meta Marketing API
 * 
 * API Base: https://graph.facebook.com/v21.0/
 * Documentation: https://developers.facebook.com/docs/marketing-api
 */

// ========== Types ==========

export interface FacebookAdsConfig {
  accessToken: string
  adAccountId: string     // Format: act_XXXXXXXXX
  appId?: string
  appSecret?: string
}

export interface Campaign {
  id?: string
  externalId?: string
  campaignName: string
  objective: string        // APP_INSTALLS, BRAND_AWARENESS, CONVERSIONS, ENGAGEMENT, LEAD_GENERATION, LINK_CLICKS, POST_ENGAGEMENT, REACH, TRAFFIC, VIDEO_VIEWS
  status: string           // ACTIVE, PAUSED, ARCHIVED, DELETED
  dailyBudget?: number     // In cents (USD)
  lifetimeBudget?: number
  startTime?: string
  endTime?: string
  specialAdCategories?: string[]
}

export interface AdSet {
  id?: string
  externalId?: string
  campaignId: string
  adsetName: string
  targeting: Targeting
  bidAmount?: number       // In cents
  bidStrategy?: string     // LOWEST_COST_WITHOUT_CAP, LOWEST_COST_WITH_BID_CAP, COST_CAP
  dailyBudget?: number
  lifetimeBudget?: number
  status: string
  optimizationGoal?: string
  billingEvent?: string    // IMPRESSIONS, LINK_CLICKS, PAGE_LIKES, POST_ENGAGEMENT, VIDEO_VIEWS
}

export interface Targeting {
  geoLocations?: {
    countries?: string[]
    regions?: { key: string; name?: string }[]
    cities?: { key: string; distance_unit?: string }[]
  }
  ageMin?: number
  ageMax?: number
  genders?: number         // 0=all, 1=male, 2=female
  interests?: { id: string; name: string }[]
  behaviors?: { id: string; name: string }[]
  customAudiences?: { id: string; name: string }[]
  excludedCustomAudiences?: { id: string; name: string }[]
  devicePlatforms?: string[]   // 'mobile', 'desktop'
  publisherPlatforms?: string[] // 'facebook', 'instagram', 'messenger', 'audience_network'
  facebookPositions?: string[]  // 'feed', 'story', 'video_feeds', 'marketplace'
}

export interface Ad {
  id?: string
  externalId?: string
  adsetId: string
  adName: string
  creative: AdCreative
  status: string
}

export interface AdCreative {
  title: string
  body: string
  imageHash?: string
  videoId?: string
  linkUrl?: string
  callToAction?: string   // LEARN_MORE, SHOP_NOW, BOOK_NOW, SIGN_UP, DOWNLOAD, CONTACT_US, SUBSCRIBE
  displayName?: string
  objectStorySpec?: any
}

export interface AdInsightResponse {
  date: string
  impressions: number
  clicks: number
  spend: number          // In USD
  cpm: number
  ctr: number
  cpc: number
  cpa: number
  conversions: number
  reach: number
  frequency: number
  costPerUniqueClick: number
}

// ========== API Client ==========

const API_VERSION = 'v21.0'
const API_BASE = `https://graph.facebook.com/${API_VERSION}`

export class FacebookAdsClient {
  private accessToken: string
  private adAccountId: string

  constructor(config: FacebookAdsConfig) {
    this.accessToken = config.accessToken
    this.adAccountId = config.adAccountId.replace('act_', '')
  }

  private get baseUrl(): string {
    return `${API_BASE}/act_${this.adAccountId}`
  }

  private async request<T>(method: 'GET' | 'POST', endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const searchParams = new URLSearchParams({
      access_token: this.accessToken,
      ...(params ? Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])
      ) : {})
    })

    const response = await fetch(`${url}?${searchParams}`, {
      method,
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(`Facebook Ads API Error: ${data.error.message} (code: ${data.error.code})`)
    }

    return data
  }

  // ========== Campaign Management ==========

  async createCampaign(campaign: Campaign): Promise<string> {
    const params: Record<string, any> = {
      name: campaign.campaignName,
      objective: campaign.objective,
      status: campaign.status,
      special_ad_categories: campaign.specialAdCategories || []
    }

    if (campaign.dailyBudget) {
      params.daily_budget = campaign.dailyBudget  // In cents
    }
    if (campaign.lifetimeBudget) {
      params.lifetime_budget = campaign.lifetimeBudget
    }

    const response = await this.request<{ id: string }>('POST', '/campaigns', params)
    return response.id
  }

  async getCampaigns(fields = 'id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time,created_time'): Promise<Campaign[]> {
    const response = await this.request<{ data: any[] }>('GET', '/campaigns', {
      fields,
      limit: 100,
      effective_status: '["ACTIVE","PAUSED","ARCHIVED"]'
    })

    return (response.data || []).map((item: any) => ({
      externalId: item.id,
      campaignName: item.name,
      objective: item.objective,
      status: item.status,
      dailyBudget: item.daily_budget ? parseInt(item.daily_budget) : undefined,
      lifetimeBudget: item.lifetime_budget ? parseInt(item.lifetime_budget) : undefined,
      startTime: item.start_time,
      endTime: item.stop_time,
      created_time: item.created_time
    }))
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    await this.request('POST', `/${campaignId}`, { status })
  }

  // ========== Ad Set Management ==========

  async createAdSet(adSet: AdSet): Promise<string> {
    const params: Record<string, any> = {
      name: adSet.adsetName,
      campaign_id: adSet.campaignId,
      status: adSet.status,
      targeting: adSet.targeting,
      optimization_goal: adSet.optimizationGoal || 'REACH',
      billing_event: adSet.billingEvent || 'IMPRESSIONS',
      bid_strategy: adSet.bidStrategy || 'LOWEST_COST_WITHOUT_CAP'
    }

    if (adSet.dailyBudget) params.daily_budget = adSet.dailyBudget
    if (adSet.lifetimeBudget) params.lifetime_budget = adSet.lifetimeBudget
    if (adSet.bidAmount) params.bid_amount = adSet.bidAmount

    const response = await this.request<{ id: string }>('POST', '/adsets', params)
    return response.id
  }

  async getAdSets(campaignId?: string): Promise<AdSet[]> {
    let endpoint = '/adsets'
    const params: Record<string, any> = {
      fields: 'id,name,campaign_id,targeting,bid_amount,bid_strategy,daily_budget,lifetime_budget,status,optimization_goal,billing_event',
      limit: 100,
      effective_status: '["ACTIVE","PAUSED","ARCHIVED"]'
    }
    if (campaignId) params.campaign_id = campaignId

    const response = await this.request<{ data: any[] }>('GET', endpoint, params)
    return (response.data || []).map((item: any) => ({
      externalId: item.id,
      campaignId: item.campaign_id,
      adsetName: item.name,
      targeting: item.targeting,
      bidAmount: item.bid_amount ? parseInt(item.bid_amount) : undefined,
      bidStrategy: item.bid_strategy,
      dailyBudget: item.daily_budget ? parseInt(item.daily_budget) : undefined,
      lifetimeBudget: item.lifetime_budget ? parseInt(item.lifetime_budget) : undefined,
      status: item.status,
      optimizationGoal: item.optimization_goal,
      billingEvent: item.billing_event
    }))
  }

  // ========== Ad Creative ==========

  async createAd(ad: Ad): Promise<string> {
    const params: Record<string, any> = {
      name: ad.adName,
      adset_id: ad.adsetId,
      status: ad.status,
      creative: {
        title: ad.creative.title,
        body: ad.creative.body,
        object_story_spec: {
          page_id: ad.creative.displayName || '',
          link_data: ad.creative.linkUrl ? {
            link: ad.creative.linkUrl,
            call_to_action: { type: ad.creative.callToAction || 'LEARN_MORE' },
            image_hash: ad.creative.imageHash
          } : undefined
        }
      }
    }

    const response = await this.request<{ id: string }>('POST', '/ads', params)
    return response.id
  }

  // ========== Insights & Reporting ==========

  async getInsights(
    level: 'campaign' | 'adset' | 'ad',
    startDate: string,
    endDate: string,
    objectId?: string
  ): Promise<AdInsightResponse[]> {
    const params: Record<string, any> = {
      level,
      fields: [
        'impressions', 'clicks', 'spend', 'cpm', 'ctr', 'cpc',
        'cpa', 'actions', 'reach', 'frequency', 'cost_per_unique_click',
        'date_start', 'date_stop'
      ].join(','),
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      limit: 100
    }

    if (objectId) params.id = objectId

    const response = await this.request<{ data: any[] }>('GET', '/insights', params)

    return (response.data || []).map((item: any) => {
      const findActionValue = (type: string) => {
        if (!item.actions) return 0
        const action = item.actions.find((a: any) => a.action_type === type)
        return action ? parseFloat(action.value) : 0
      }

      return {
        date: item.date_start,
        impressions: parseInt(item.impressions || '0'),
        clicks: parseInt(item.clicks || '0'),
        spend: parseFloat(item.spend || '0'),
        cpm: parseFloat(item.cpm || '0'),
        ctr: parseFloat(item.ctr || '0'),
        cpc: parseFloat(item.cpc || '0'),
        cpa: findActionValue(item.optimization_goal || 'conversion') || parseFloat(item.cpa || '0'),
        conversions: parseInt(findActionValue('purchase') || findActionValue('lead') || '0'),
        reach: parseInt(item.reach || '0'),
        frequency: parseFloat(item.frequency || '0'),
        costPerUniqueClick: parseFloat(item.cost_per_unique_click || '0')
      }
    })
  }

  async getCampaignInsights(
    campaignId: string,
    startDate: string,
    endDate: string
  ): Promise<AdInsightResponse[]> {
    return this.getInsights('campaign', startDate, endDate, campaignId)
  }

  // ========== Account Info ==========

  async getAccountInfo(): Promise<{ id: string; name: string; currency: string; timezone: string; balance: number }> {
    const response = await this.request<{ id: string; name: string; currency: string; timezone_name: string; balance: string }>('GET', '', {
      fields: 'id,name,currency,timezone_name,balance'
    })
    return {
      id: response.id,
      name: response.name,
      currency: response.currency,
      timezone: response.timezone_name,
      balance: parseFloat(response.balance || '0')
    }
  }

  // ========== Media Upload ==========

  async uploadImage(filePath: string): Promise<string> {
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: 'image/png' })

    const formData = new FormData()
    formData.append('access_token', this.accessToken)
    formData.append('filename', blob, 'image.png')

    const response = await fetch(`${API_BASE}/act_${this.adAccountId}/adimages`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    if (data.error) throw new Error(`Upload image thất bại: ${data.error.message}`)

    return Object.values(data.images || {})[0]?.hash || ''
  }

  async uploadVideo(filePath: string): Promise<string> {
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: 'video/mp4' })

    const formData = new FormData()
    formData.append('access_token', this.accessToken)
    formData.append('source', blob, 'video.mp4')

    const response = await fetch(`${API_BASE}/act_${this.adAccountId}/advideos`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    if (data.error) throw new Error(`Upload video thất bại: ${data.error.message}`)

    return data.video_id || ''
  }
}

// ========== Factory ==========

export function createFacebookAdsClient(config: FacebookAdsConfig): FacebookAdsClient {
  return new FacebookAdsClient(config)
}

// ========== Batch Operations ==========

interface BatchCampaignConfig {
  namePrefix: string
  count: number
  dailyBudget: number
  objective: string
  targeting: Targeting
}

export async function batchCreateCampaigns(
  client: FacebookAdsClient,
  config: BatchCampaignConfig
): Promise<{ campaignId: string; error?: string }[]> {
  const results: { campaignId: string; error?: string }[] = []

  for (let i = 0; i < config.count; i++) {
    try {
      const campaignId = await client.createCampaign({
        campaignName: `${config.namePrefix} #${i + 1}`,
        objective: config.objective,
        status: 'ACTIVE',
        dailyBudget: config.dailyBudget
      })
      results.push({ campaignId })
    } catch (error: any) {
      results.push({ campaignId: '', error: error.message })
    }
  }

  return results
}
