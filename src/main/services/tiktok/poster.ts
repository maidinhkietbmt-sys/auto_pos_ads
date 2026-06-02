import fs from 'fs'
import path from 'path'
import { BrowserContext } from 'playwright'
import { addActivityLogAndEmit } from '../../database/index'
import {
  launchTikTokBrowser as launchBrowser,
  getTikTokIsLoggedIn,
  getBrowserContexts,
  createTikTokContext,
  randomDelay
} from './auth'

// ========== Types ==========

export interface PostResult {
  success: boolean
  error?: string
  postUrl?: string
  publishId?: string
}

export interface TikTokMedia {
  filePath: string
  type: 'video' | 'photo'
  alt?: string
}

// ========== API-Based Posting ==========

interface ApiPostOptions {
  accessToken: string
  caption: string
  sourceType: 'PULL_FROM_URL' | 'FILE_UPLOAD'
  mediaUrl?: string
  mediaPath?: string
}

/**
 * Post a video to TikTok using the official Content Posting API
 */
export async function postToTikTokViaApi(
  options: ApiPostOptions,
  accountId?: string
): Promise<PostResult> {
  const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2'

  try {
    // Step 1: Initialize upload
    const initResponse = await fetch(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_info: {
          source: options.sourceType,
          video_size: options.mediaPath ? fs.statSync(options.mediaPath).size : 0,
          chunk_size: options.sourceType === 'FILE_UPLOAD' ? 5 * 1024 * 1024 : undefined
        }
      })
    })

    if (!initResponse.ok) {
      const err = await initResponse.text()
      return { success: false, error: `TikTok init upload failed: ${err}` }
    }

    const initData = await initResponse.json()
    const publishId = initData.data?.publish_id

    if (!publishId) {
      return { success: false, error: 'Không nhận được publish_id từ TikTok API' }
    }

    // Step 2: Upload file if using FILE_UPLOAD
    if (options.sourceType === 'FILE_UPLOAD' && options.mediaPath) {
      if (!fs.existsSync(options.mediaPath)) {
        return { success: false, error: `File không tồn tại: ${options.mediaPath}` }
      }

      const uploadUrl = initData.data?.upload_url
      if (!uploadUrl) {
        return { success: false, error: 'Không nhận được upload_url từ TikTok API' }
      }

      const fileBuffer = fs.readFileSync(options.mediaPath)
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'video/mp4' },
        body: fileBuffer
      })

      if (!uploadResponse.ok) {
        return { success: false, error: `Upload file thất bại: ${uploadResponse.statusText}` }
      }
    }

    // Step 3: Publish
    const publishResponse = await fetch(`${TIKTOK_API_BASE}/post/publish/video/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publish_id: publishId,
        post_info: {
          title: options.caption,
          privacy_level: 'PUBLIC',
          disable_comment: false,
          disable_duet: true,
          disable_stitch: true,
          brand_organic_toggle: false
        }
      })
    })

    if (!publishResponse.ok) {
      const err = await publishResponse.text()
      return { success: false, error: `TikTok publish failed: ${err}` }
    }

    // Step 4: Poll for completion
    const pollResult = await pollPublishStatus(publishId, options.accessToken)

    addActivityLogAndEmit(
      pollResult.success ? 'success' : 'info',
      pollResult.success
        ? `Đã đăng video lên TikTok thành công (ID: ${publishId})`
        : `TikTok đang xử lý video (ID: ${publishId})`,
      'tiktok',
      accountId,
      undefined,
      pollResult.postUrl || pollResult.error
    )

    return { success: pollResult.success, postUrl: pollResult.postUrl, publishId, error: pollResult.error }
  } catch (error: any) {
    return { success: false, error: `Lỗi TikTok API: ${error?.message || 'Unknown'}` }
  }
}

async function pollPublishStatus(
  publishId: string,
  accessToken: string,
  maxRetries = 10
): Promise<{ success: boolean; postUrl?: string; error?: string }> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000))
    try {
      const response = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publish_id: publishId })
      })
      const data = await response.json()
      if (data.data?.status === 'PUBLISH_COMPLETE') {
        return { success: true, postUrl: data.data?.post_url }
      }
      if (data.data?.status === 'PUBLISH_FAILED') {
        return { success: false, error: data.data?.fail_reason || 'Publish failed' }
      }
    } catch { /* retry */ }
  }
  return { success: false, error: 'Hết thời gian chờ TikTok xử lý (50 giây)' }
}

// ========== Playwright Browser Posting ==========

/**
 * Post to TikTok via browser automation with human-like behavior
 */
export async function postToTikTokViaBrowser(
  caption: string,
  mediaPaths: string[],
  accountId?: string,
  onProgress?: (step: string, pct: number) => void
): Promise<PostResult> {
  if (!getTikTokIsLoggedIn()) {
    return { success: false, error: 'Chưa đăng nhập TikTok. Vui lòng đăng nhập trước.' }
  }

  try {
    await launchBrowser(false)

    // Get or create a fresh context
    const existingContexts = getBrowserContexts()
    const context: BrowserContext = existingContexts[0] || await createTikTokContext(accountId)

    const page = await context.newPage()
    page.setDefaultTimeout(30000)

    try {
      // Step 1: Navigate to upload
      onProgress?.('Đang mở trang upload TikTok...', 10)
      addActivityLogAndEmit('info', 'Đang mở trang upload TikTok...', 'tiktok', accountId)
      await page.goto('https://www.tiktok.com/upload', { waitUntil: 'networkidle', timeout: 30000 })
      await randomDelay(2000, 4000)

      // Step 2: Upload media file
      onProgress?.('Đang upload file lên TikTok...', 25)
      addActivityLogAndEmit('info', `Đang upload file: ${path.basename(mediaPaths[0])}`, 'tiktok', accountId)

      const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 }).catch(() => null)
      if (!fileInput) {
        // Try clicking the upload button to trigger the file dialog
        const uploadBtn = await page.waitForSelector(
          'button:has-text("Select video"), button:has-text("Upload"), div[class*="upload"]',
          { timeout: 5000 }
        ).catch(() => null)
        if (uploadBtn) {
          await uploadBtn.click()
          await randomDelay(1000, 2000)
        }
      }

      // Wait for file input
      const uploadInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 }).catch(() => null)
      if (!uploadInput) {
        await page.close()
        return { success: false, error: 'Không tìm thấy input upload trên TikTok' }
      }

      await uploadInput.setInputFiles(mediaPaths[0])
      addActivityLogAndEmit('success', `Đã upload file: ${path.basename(mediaPaths[0])}`, 'tiktok', accountId)

      // Step 3: Wait for processing
      onProgress?.('Đang xử lý video...', 40)
      addActivityLogAndEmit('info', 'Đang chờ TikTok xử lý video...', 'tiktok', accountId)

      // Wait up to 60s for processing (check for "Edit post" or similar indicator)
      let processed = false
      for (let i = 0; i < 30; i++) {
        const hasEditButton = await page.$(
          'button:has-text("Edit"), div[class*="complete"], span:has-text("Post")'
        ).catch(() => null)
        if (hasEditButton) { processed = true; break }

        // Check if progress bar is complete
        const progressComplete = await page.$(
          'div[class*="progress"][class*="complete"], div[aria-valuenow="100"]'
        ).catch(() => null)
        if (progressComplete) { processed = true; break }

        await randomDelay(2000, 3000)
      }

      if (!processed) {
        addActivityLogAndEmit('warning', 'Video có thể chưa xử lý xong, tiếp tục...', 'tiktok', accountId)
      }

      // Step 4: Enter caption
      onProgress?.('Đang nhập mô tả...', 65)
      const captionInput = await page.waitForSelector(
        'div[contenteditable="true"], textarea, input[placeholder*="caption" i], div[class*="caption"]',
        { timeout: 10000 }
      ).catch(() => null)

      if (captionInput) {
        await captionInput.click()
        await randomDelay(300, 600)
        await captionInput.fill(caption)
        addActivityLogAndEmit('info', 'Đã nhập mô tả bài đăng', 'tiktok', accountId)
      } else {
        addActivityLogAndEmit('warning', 'Không tìm thấy ô nhập mô tả, bỏ qua...', 'tiktok', accountId)
      }

      // Step 5: Configure privacy / settings (optional)
      onProgress?.('Đang cấu hình bài đăng...', 80)

      // Step 6: Click Post
      onProgress?.('Đang đăng bài...', 90)
      const postButton = await page.waitForSelector(
        'button:has-text("Post"), button:has-text("Đăng"), div[role="button"]:has-text("Post")',
        { timeout: 5000 }
      ).catch(() => null)

      if (postButton) {
        await postButton.click()
        addActivityLogAndEmit('success', 'Đã nhấn nút đăng bài', 'tiktok', accountId)
      } else {
        await page.close()
        return { success: false, error: 'Không tìm thấy nút đăng bài trên TikTok' }
      }

      // Step 7: Wait for posting to complete
      await randomDelay(3000, 5000)
      onProgress?.('Hoàn tất!', 100)

      // Try to get the post URL from the page
      let postUrl = page.url()
      if (postUrl.includes('upload')) postUrl = ''

      await page.close()
      addActivityLogAndEmit('success', 'Đăng bài lên TikTok thành công!', 'tiktok', accountId)

      return { success: true, postUrl: postUrl || undefined }
    } catch (error: any) {
      await page.close().catch(() => {})
      return { success: false, error: `Lỗi khi đăng TikTok: ${error?.message || 'Unknown'}` }
    }
  } catch (error: any) {
    return { success: false, error: `Lỗi browser TikTok: ${error?.message || 'Unknown'}` }
  }
}

/**
 * Post to multiple TikTok accounts sequentially with human-like delays
 */
export async function postToMultipleTikTokAccounts(
  accounts: { id: string; accessToken?: string }[],
  caption: string,
  mediaPaths: string[],
  onProgress?: (current: number, total: number, accountId: string, status: 'success' | 'failed') => void
): Promise<PostResult[]> {
  const results: PostResult[] = []

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]
    let result: PostResult

    if (account.accessToken) {
      // Use API method for accounts with tokens
      result = await postToTikTokViaApi(
        { accessToken: account.accessToken, caption, sourceType: 'FILE_UPLOAD', mediaPath: mediaPaths[0] },
        account.id
      )
    } else {
      // Use browser method for accounts without tokens
      result = await postToTikTokViaBrowser(caption, mediaPaths, account.id)
    }

    results.push(result)

    if (onProgress) {
      onProgress(i + 1, accounts.length, account.id, result.success ? 'success' : 'failed')
    }

    // Human-like delay between accounts (30-120 seconds)
    if (i < accounts.length - 1) {
      const delay = 30000 + Math.random() * 90000
      addActivityLogAndEmit('info', `Chờ ${Math.round(delay / 1000)} giây trước khi đăng tài khoản tiếp theo...`, 'tiktok')
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return results
}

// ========== Media Helpers ==========

const ALLOWED_VIDEO_FORMATS = ['.mp4', '.mov', '.webm', '.avi', '.mkv']
const ALLOWED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.webp']

/**
 * Validate a media file for TikTok posting
 */
export function validateMediaFile(filePath: string): { valid: boolean; type?: 'video' | 'photo'; error?: string } {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: `File không tồn tại: ${filePath}` }
  }

  const ext = path.extname(filePath).toLowerCase()
  const stats = fs.statSync(filePath)

  if (ALLOWED_VIDEO_FORMATS.includes(ext)) {
    // TikTok max video size: 500MB
    if (stats.size > 500 * 1024 * 1024) {
      return { valid: false, error: 'Video quá lớn (tối đa 500MB)' }
    }
    return { valid: true, type: 'video' }
  }

  if (ALLOWED_IMAGE_FORMATS.includes(ext)) {
    if (stats.size > 20 * 1024 * 1024) {
      return { valid: false, error: 'Ảnh quá lớn (tối đa 20MB)' }
    }
    return { valid: true, type: 'photo' }
  }

  return { valid: false, error: `Định dạng không hỗ trợ: ${ext}. Hỗ trợ: ${[...ALLOWED_VIDEO_FORMATS, ...ALLOWED_IMAGE_FORMATS].join(', ')}` }
}

/**
 * Generate a thumbnail from a video file (placeholder implementation)
 */
export function getMediaThumbnail(filePath: string): string | null {
  // In production, use ffmpeg to extract a frame
  // For now, check if a thumbnail file exists alongside the video
  const baseName = path.basename(filePath, path.extname(filePath))
  const dir = path.dirname(filePath)

  for (const ext of ['.jpg', '.jpeg', '.png']) {
    const thumbPath = path.join(dir, `${baseName}_thumb${ext}`)
    if (fs.existsSync(thumbPath)) return thumbPath
  }

  return null
}
