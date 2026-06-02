import { chromium, Browser, Page } from 'playwright'
import { app } from 'electron'
import path from 'path'
import {
  randomDelay,
  Delays,
  humanLikeType,
  humanLikeMouseMove,
  humanLikeScroll,
  getStealthLaunchArgs,
  getRandomUserAgent,
  getRandomViewport,
  facebookConfig
} from './services/human-behavior'

let browser: Browser | null = null
let isLoggedIn = false
const fbConfig = facebookConfig()

export interface PostResult {
  success: boolean
  error?: string
  postUrl?: string
}

export async function launchBrowser(headless: boolean = true): Promise<void> {
  if (browser) return
  browser = await chromium.launch({
    headless,
    args: getStealthLaunchArgs()
  })
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
    isLoggedIn = false
  }
}

export async function loginToFacebook(email: string, password: string): Promise<boolean> {
  if (!browser) await launchBrowser()

  const context = browser!.contexts()[0] || await browser!.newContext({
    userAgent: getRandomUserAgent(),
    viewport: getRandomViewport()
  })

  const page = await context.newPage()

  try {
    await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle', timeout: 30000 })
    await Delays.afterNavigation()

    // Find and click email field with human-like mouse movement
    const emailField = await page.waitForSelector('#email', { timeout: 10000 })
    if (emailField) {
      await humanLikeMouseMove(page, '#email', fbConfig)
      await Delays.beforeClick()
      await humanLikeType(page, emailField, email, fbConfig)
    }

    // Type password with human-like typing
    const passField = await page.waitForSelector('#pass', { timeout: 5000 })
    if (passField) {
      await humanLikeMouseMove(page, '#pass', fbConfig)
      await Delays.beforeClick()
      await humanLikeType(page, passField, password, fbConfig)
    }

    await Delays.beforeClick()

    // Click login button
    const loginBtn = await page.waitForSelector('button[name="login"]', { timeout: 5000 })
    if (loginBtn) {
      await humanLikeMouseMove(page, 'button[name="login"]', fbConfig)
      await Delays.beforeClick()
      await loginBtn.click()
    }

    await Delays.afterNavigation()

    // Check if logged in successfully
    await page.waitForURL('**/facebook.com/?**', { timeout: 15000 }).catch(() => {})
    await randomDelay(2000, 4000)

    const currentUrl = page.url()
    if (currentUrl.includes('login') || currentUrl.includes('checkpoint')) {
      isLoggedIn = false
      await page.close()
      return false
    }

    isLoggedIn = true
    await context.storageState({ path: path.join(app.getPath('userData'), 'facebook-state.json') })
    await page.close()
    return true
  } catch (error) {
    await page.close().catch(() => {})
    return false
  }
}

export async function loadStoredSession(): Promise<boolean> {
  const statePath = path.join(app.getPath('userData'), 'facebook-state.json')
  const fs = await import('fs')
  if (!fs.existsSync(statePath)) return false

  try {
    if (!browser) await launchBrowser()
    for (const ctx of browser!.contexts()) {
      await ctx.close()
    }
    const context = await browser!.newContext({ storageState: statePath })
    const page = await context.newPage()
    await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle', timeout: 15000 })
    const loggedIn = !page.url().includes('login')
    await page.close()
    isLoggedIn = loggedIn
    return loggedIn
  } catch {
    return false
  }
}

/**
 * Upload multiple images to a Facebook post by setting input[type="file"]
 */
async function uploadImages(page: Page, imagePaths: string[]): Promise<void> {
  // Find the file input - Facebook usually has one hidden file input
  const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 8000 }).catch(() => null)
  if (!fileInput) {
    throw new Error('Không tìm thấy input upload file trên Facebook')
  }

  // Upload first image
  await fileInput.setInputFiles(imagePaths[0])
  await Delays.afterClick()

  // For additional images, click the "Add photos/video" button
  for (let i = 1; i < imagePaths.length; i++) {
    const addPhotoBtn = await page.waitForSelector(
      'div[role="button"]:has(span:has-text("Thêm ảnh"))',
      { timeout: 5000 }
    ).catch(() =>
      page.waitForSelector(
        'div[role="button"]:has(span:has-text("Add photos"))',
        { timeout: 5000 }
      ).catch(() => null)
    )

    if (!addPhotoBtn) {
      // Try clicking on the media area to add more photos
      const mediaArea = await page.waitForSelector(
        'div[aria-label="Thêm ảnh/video"]',
        { timeout: 3000 }
      ).catch(() =>
        page.waitForSelector(
          'div[aria-label="Add photos/video"]',
          { timeout: 3000 }
        ).catch(() => null)
      )

      if (!mediaArea) break // Can't find way to add more photos
      await humanLikeMouseMove(page, 'div[aria-label="Thêm ảnh/video"]', fbConfig)
        .catch(() => humanLikeMouseMove(page, 'div[aria-label="Add photos/video"]', fbConfig))
        .catch(() => {})
      await mediaArea.click()
      await Delays.afterClick()
    } else {
      await humanLikeMouseMove(page, 'div[role="button"]:has(span:has-text("Thêm ảnh"))', fbConfig)
        .catch(() => humanLikeMouseMove(page, 'div[role="button"]:has(span:has-text("Add photos"))', fbConfig))
        .catch(() => {})
      await addPhotoBtn.click()
      await Delays.afterClick()
    }

    // Upload next image via the newly appeared file input
    const nextInput = await page.waitForSelector('input[type="file"]', { timeout: 5000 }).catch(() => null)
    if (nextInput) {
      await nextInput.setInputFiles(imagePaths[i])
      await Delays.afterClick()
    } else {
      break
    }
  }
}

export async function postToGroup(
  groupUrl: string,
  groupName: string,
  content: string,
  imagePaths?: string[]
): Promise<PostResult> {
  if (!browser) await launchBrowser()
  if (!isLoggedIn) {
    return { success: false, error: 'Chưa đăng nhập Facebook. Vui lòng đăng nhập trước.' }
  }

  const context = browser!.contexts()[0] || await browser!.newContext()
  const page = await context.newPage()

  try {
    // Navigate to group
    await page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await Delays.afterNavigation()

    // Find and click the create post area
    const writeArea = await page.waitForSelector(
      'div[role="textbox"][aria-label*="Viết"]', { timeout: 10000 }
    ).catch(() =>
      page.waitForSelector(
        'div[role="textbox"][aria-label*="Write"]', { timeout: 10000 }
      ).catch(() =>
        page.waitForSelector(
          'div[role="textbox"][aria-label*="create"]', { timeout: 5000 }
        ).catch(() => null)
      )
    )

    if (!writeArea) {
      // Try clicking the "Create post" button first
      const createPostBtn = await page.waitForSelector(
        'div[role="button"]:has(span:has-text("Bài viết"))', { timeout: 5000 }
      ).catch(() =>
        page.waitForSelector(
          'div[role="button"]:has(span:has-text("Post"))', { timeout: 5000 }
        ).catch(() => null)
      )

      if (!createPostBtn) {
        await page.close()
        return { success: false, error: 'Không tìm thấy ô nhập nội dung bài đăng. Giao diện Facebook có thể đã thay đổi.' }
      }

      await humanLikeMouseMove(page, 'div[role="button"]:has(span:has-text("Bài viết"))', fbConfig)
        .catch(() => humanLikeMouseMove(page, 'div[role="button"]:has(span:has-text("Post"))', fbConfig))
        .catch(() => {})
      await createPostBtn.click()
      await Delays.afterClick()
    }

    // Find the text box and type content with human-like behavior
    const textBox = await page.waitForSelector(
      'div[role="textbox"][contenteditable="true"]', { timeout: 5000 }
    ).catch(() =>
      page.waitForSelector(
        'div[role="textbox"]', { timeout: 5000 }
      ).catch(() => null)
    )

    if (!textBox) {
      await page.close()
      return { success: false, error: 'Không tìm thấy ô nhập nội dung.' }
    }

    // Use human-like mouse movement to the text box
    await humanLikeMouseMove(page, 'div[role="textbox"][contenteditable="true"]', fbConfig)
      .catch(() => humanLikeMouseMove(page, 'div[role="textbox"]', fbConfig))
      .catch(() => {})
    await Delays.beforeClick()
    await textBox.click()
    await Delays.betweenFields()

    // Type the content with human-like typing simulation
    await humanLikeType(page, textBox, content, fbConfig)

    // Upload multiple images if provided
    if (imagePaths && imagePaths.length > 0) {
      await Delays.betweenActions()
      await uploadImages(page, imagePaths)
    }

    await Delays.thinking()

    // Click Post button with human-like mouse movement
    const postButton = await page.waitForSelector(
      'div[role="button"]:has(span:has-text("Đăng"))', { timeout: 5000 }
    ).catch(() =>
      page.waitForSelector(
        'div[role="button"]:has(span:has-text("Post"))', { timeout: 5000 }
      ).catch(() => null)
    )

    if (!postButton) {
      const postBtnByLabel = await page.waitForSelector(
        'div[aria-label="Đăng"]', { timeout: 3000 }
      ).catch(() =>
        page.waitForSelector(
          'div[aria-label="Post"]', { timeout: 3000 }
        ).catch(() => null)
      )

      if (!postBtnByLabel) {
        await page.close()
        return { success: false, error: 'Không tìm thấy nút Đăng bài.' }
      }

      await humanLikeMouseMove(page, 'div[aria-label="Đăng"]', fbConfig)
        .catch(() => humanLikeMouseMove(page, 'div[aria-label="Post"]', fbConfig))
        .catch(() => {})
      await postBtnByLabel.click()
    } else {
      await humanLikeMouseMove(page, 'div[role="button"]:has(span:has-text("Đăng"))', fbConfig)
        .catch(() => humanLikeMouseMove(page, 'div[role="button"]:has(span:has-text("Post"))', fbConfig))
        .catch(() => {})
      await postButton.click()
    }

    // Wait for post to complete
    await Delays.afterClick()

    // Scroll slightly as if reviewing the post
    await humanLikeScroll(page, 100, fbConfig)

    await page.close()
    return { success: true }
  } catch (error) {
    await page.close().catch(() => {})
    return {
      success: false,
      error: `Lỗi khi đăng bài: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

export async function postToMultipleGroups(
  groups: { url: string; name: string }[],
  content: string,
  imagePaths?: string[],
  onProgress?: (current: number, total: number, groupName: string, status: 'success' | 'failed') => void
): Promise<PostResult[]> {
  const results: PostResult[] = []
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    try {
      const result = await postToGroup(group.url, group.name, content, imagePaths)
      results.push(result)
      if (onProgress) {
        onProgress(i + 1, groups.length, group.name, result.success ? 'success' : 'failed')
      }
    } catch (error) {
      results.push({ success: false, error: `Lỗi: ${error instanceof Error ? error.message : 'Unknown'}` })
      if (onProgress) {
        onProgress(i + 1, groups.length, group.name, 'failed')
      }
    }
    // Human-like delay between posts to different groups
    if (i < groups.length - 1) {
      await Delays.betweenPosts('facebook')
    }
  }
  return results
}

export function getIsLoggedIn(): boolean {
  return isLoggedIn
}
