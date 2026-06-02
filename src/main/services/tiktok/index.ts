export {
  launchTikTokBrowser,
  closeTikTokBrowser,
  authenticateWithToken,
  exchangeAuthCode,
  loginToTikTok,
  loadTikTokSession,
  getTikTokProfile,
  getTikTokIsLoggedIn,
  getTikTokCurrentAccountId,
  humanLikeMouseMove,
  humanLikeScroll,
  randomDelay,
  humanLikeType
} from './auth'

export type {
  TikTokAuthResult,
  TikTokProfile
} from './auth'

export {
  postToTikTokViaApi,
  postToTikTokViaBrowser,
  postToMultipleTikTokAccounts,
  validateMediaFile
} from './poster'

export type {
  PostResult,
  TikTokMedia
} from './poster'

export {
  createTikTokAdsClient,
  batchCreateCampaigns,
  TikTokApiClient
} from './marketing-api'

export type {
  TikTokAdsConfig,
  Campaign as TikTokCampaign,
  AdGroup as TikTokAdGroup,
  Targeting as TikTokTargeting,
  AdInsight as TikTokAdInsight
} from './marketing-api'
