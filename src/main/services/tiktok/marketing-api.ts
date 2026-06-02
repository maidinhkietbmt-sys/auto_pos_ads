/**
 * TikTok Marketing API Integration
 * 
 * API Base: https://business-api.tiktok.com/open_api/v1.3/
 * Documentation: https://business-api.tiktok.com/portal/docs
 */

// ========== Types ==========

export interface TikTokAdsConfig {
  accessToken: string
  advertiserId: string
  appId?: string
  secret?: string
}

export interface Campaign {
  id?: string
  externalId?: string
  campaignName: string
  objective: string           // TRAFFIC, CONVERSIONS, VIDEO_VIEWS, REACH, LEAD_GENERATION
  budgetMode: string           // BUDGET_MODE_DAY, BUDGET_MODE_TOTAL
  budget: number
  status: string               // ACTIVE, PAUSED, ARCHIVE
  startTime?: string
  endTime?: string
  operationSystem?: string[]   // ANDROID, IOS
}

export interface AdGroup {
  id?: string
  adgroupId?: string
  campaignId: string
  adgroupName: string
  placement: string[]          // PLACEMENT_TIKTOK, PLACEMENT_PANGLE, PLACEMENT_HELIUM
  targeting: Targeting
  bidAmount: number
  bidType: string              // CPA, CPC, CPM, OCMP
  budgetMode: string
  budget: number
  status: string
}

export interface Targeting {
  gender?: string              // GENDER_FEMALE, GENDER_MALE, NO_LIMIT
  ageGroups?: string[]         // AGE_13_17, AGE_18_24, AGE_25_34, AGE_35_44, AGE_45_54, AGE_55+
  geoLocations?: GeoLocation[]
  interests?: string[]
  deviceType?: string[]
  operatingSystem?: string[]
}

export interface GeoLocation {
  country: string
  region?: string
  city?: string
}

export interface AdCreative {
  id?: string
  adName: string
  adgroupId: string
  creatives: Creative[]
  status: string
}

export interface Creative {
  videoId?: string
  imageId?: string
  title: string
  callToAction: string        // LEARN_MORE, SHOP_NOW, BOOK_NOW, SIGN_UP, DOWNLOAD, CONTACT_US
  landingPageUrl: string
  displayName: string
}

export interface AdInsight {
  date: string
  impressions: number
  clicks: number
  spend: number
  cpm: number
  ctr: number
  cpc: number
  cpa: number
  conversions: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  requestId?: string
}

// ========== API Client ==========

const API_BASE = 'https://business-api.tiktok.com/open_api/v1.3'

export class TikTokApiClient {
  private accessToken: string
  private advertiserId: string

  constructor(config: TikTokAdsConfig) {
    this.accessToken = config.accessToken
    this.advertiserId = config.advertiserId
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE}${endpoint}`
    const headers: Record<string, string> = {
      'Access-Token': this.accessToken,
      'Content-Type': 'application/json'
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(`TikTok Marketing API Error: ${data.message} (code: ${data.code})`)
    }

    return data
  }

  // ========== Campaign Management ==========

  async createCampaign(campaign: Campaign): Promise<string> {
    const body = {
      advertiser_id: this.advertiserId,
      campaign_name: campaign.campaignName,
      objective_type: campaign.objective,
      budget_mode: campaign.budgetMode,
      budget: campaign.budget,
      status: campaign.status,
      ...(campaign.startTime && { start_time: campaign.startTime }),
      ...(campaign.endTime && { end_time: campaign.endTime }),
      ...(campaign.operationSystem && { operation_system: campaign.operationSystem })
    }

    const response = await this.request<{ campaign_id: string }>('POST', '/campaign/create/', body)
    return response.data.campaign_id
  }

  async getCampaigns(pageSize = 100): Promise<Campaign[]> {
    const response = await this.request<{ list: any[] }>('GET',
      `/campaign/get/?advertiser_id=${this.advertiserId}&page_size=${pageSize}`
    )
    return response.data.list.map((item: any) => ({
      id: item.campaign_id,
      campaignName: item.campaign_name,
      objective: item.objective_type,
      budgetMode: item.budget_mode,
      budget: parseFloat(item.budget),
      status: item.status
    }))
  }

  async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    await this.request('POST', '/campaign/update/', {
      advertiser_id: this.advertiserId,
      campaign_id: campaignId,
      status
    })
  }

  // ========== Ad Group Management ==========

  async createAdGroup(adGroup: AdGroup): Promise<string> {
    const body = {
      advertiser_id: this.advertiserId,
      campaign_id: adGroup.campaignId,
      adgroup_name: adGroup.adgroupName,
      placement: adGroup.placement,
      targeting: this.buildTargetingObject(adGroup.targeting),
      bid_amount: adGroup.bidAmount,
      bid_type: adGroup.bidType,
      budget_mode: adGroup.budgetMode,
      budget: adGroup.budget,
      status: adGroup.status
    }

    const response = await this.request<{ adgroup_id: string }>('POST', '/adgroup/create/', body)
    return response.data.adgroup_id
  }

  async getAdGroups(campaignId?: string): Promise<AdGroup[]> {
    let endpoint = `/adgroup/get/?advertiser_id=${this.advertiserId}&page_size=100`
    if (campaignId) endpoint += `&campaign_id=${campaignId}`

    const response = await this.request<{ list: any[] }>('GET', endpoint)
    return response.data.list.map((item: any) => ({
      id: item.adgroup_id,
      campaignId: item.campaign_id,
      adgroupName: item.adgroup_name,
      placement: item.placement || [],
      targeting: item.targeting || {},
      bidAmount: parseFloat(item.bid_amount || '0'),
      bidType: item.bid_type,
      budgetMode: item.budget_mode,
      budget: parseFloat(item.budget || '0'),
      status: item.status
    }))
  }

  private buildTargetingObject(targeting: Targeting): any {
    const result: any = {}

    if (targeting.gender) result.gender = targeting.gender
    if (targeting.ageGroups) result.age_groups = targeting.ageGroups

    if (targeting.geoLocations && targeting.geoLocations.length > 0) {
      result.geo_locations = {
        countries: targeting.geoLocations.map(g => g.country)
      }
      const regions = targeting.geoLocations.filter(g => g.region).map(g => g.region)
      if (regions.length > 0) result.geo_locations.regions = regions
    }

    if (targeting.interests && targeting.interests.length > 0) {
      result.interest_category_ids = targeting.interests
    }

    if (targeting.deviceType) {
      result.device_type = targeting.deviceType
    }

    return result
  }

  // ========== Ad Creative Management ==========

  async createAd(ad: AdCreative): Promise<string> {
    const creatives = ad.creatives.map(c => ({
      video_info: { video_id: c.videoId },
      title: c.title,
      call_to_action: c.callToAction,
      landing_page_url: c.landingPageUrl,
      display_name: c.displayName
    }))

    const body = {
      advertiser_id: this.advertiserId,
      adgroup_id: ad.adgroupId,
      ad_name: ad.adName,
      creatives,
      status: ad.status
    }

    const response = await this.request<{ ad_id: string }>('POST', '/ad/create/', body)
    return response.data.ad_id
  }

  // ========== Reporting & Insights ==========

  async getInsights(
    adgroupId: string,
    startDate: string,
    endDate: string
  ): Promise<AdInsight[]> {
    const response = await this.request<{ list: any[] }>('GET',
      `/report/integrated/get/?advertiser_id=${this.advertiserId}` +
      `&object_id=${adgroupId}` +
      `&object_type=ADGROUP` +
      `&start_date=${startDate}&end_date=${endDate}` +
      `&metrics=impressions,clicks,spend,cpm,ctr,cpc,cpa,conversions`
    )

    return response.data.list.map((item: any) => ({
      date: item.day || item.date,
      impressions: parseInt(item.impressions || '0'),
      clicks: parseInt(item.clicks || '0'),
      spend: parseFloat(item.spend || '0'),
      cpm: parseFloat(item.cpm || '0'),
      ctr: parseFloat(item.ctr || '0'),
      cpc: parseFloat(item.cpc || '0'),
      cpa: parseFloat(item.cpa || '0'),
      conversions: parseInt(item.conversions || '0')
    }))
  }

  // ========== Media Management ==========

  async uploadVideo(filePath: string): Promise<string> {
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(filePath)

    const formData = new FormData()
    const blob = new Blob([fileBuffer], { type: 'video/mp4' })
    formData.append('video_file', blob, 'video.mp4')
    formData.append('advertiser_id', this.advertiserId)

    const response = await fetch(`${API_BASE}/file/video/upload/`, {
      method: 'POST',
      headers: { 'Access-Token': this.accessToken },
      body: formData as any
    })

    const data = await response.json()
    if (data.code !== 0) {
      throw new Error(`Upload video thất bại: ${data.message}`)
    }

    return data.data.video_id
  }

  async uploadImage(filePath: string): Promise<string> {
    const fs = await import('fs')
    const fileBuffer = fs.readFileSync(filePath)

    const formData = new FormData()
    const blob = new Blob([fileBuffer], { type: 'image/png' })
    formData.append('image_file', blob, 'image.png')
    formData.append('advertiser_id', this.advertiserId)

    const response = await fetch(`${API_BASE}/file/image/upload/`, {
      method: 'POST',
      headers: { 'Access-Token': this.accessToken },
      body: formData as any
    })

    const data = await response.json()
    if (data.code !== 0) {
      throw new Error(`Upload image thất bại: ${data.message}`)
    }

    return data.data.image_id
  }
}

// ========== Factory ==========

export function createTikTokAdsClient(config: TikTokAdsConfig): TikTokApiClient {
  return new TikTokApiClient(config)
}

// ========== Batch Operations ==========

interface BatchCampaignConfig {
  namePrefix: string
  count: number
  baseBudget: number
  objective: string
  targeting: Targeting
  creativeTemplate: {
    title: string
    landingPageUrl: string
    displayName: string
    callToAction: string
  }
}

/**
 * Create multiple campaigns from a batch config
 */
export async function batchCreateCampaigns(
  client: TikTokApiClient,
  config: BatchCampaignConfig
): Promise<{ campaignId: string; error?: string }[]> {
  const results: { campaignId: string; error?: string }[] = []

  for (let i = 0; i < config.count; i++) {
    try {
      const campaignId = await client.createCampaign({
        campaignName: `${config.namePrefix} #${i + 1}`,
        objective: config.objective,
        budgetMode: 'BUDGET_MODE_DAY',
        budget: config.baseBudget,
        status: 'ACTIVE'
      })
      results.push({ campaignId })
    } catch (error: any) {
      results.push({ campaignId: '', error: error.message })
    }
  }

  return results
}
