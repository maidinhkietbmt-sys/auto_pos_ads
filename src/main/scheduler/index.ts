import * as cron from 'node-cron'
import { getActiveSchedules } from '../database/schedules'
import { getContent } from '../database/contents'
import { addHistory } from '../database/history'
import { addActivityLogAndEmit } from '../database/index'
import { getAccounts } from '../database/accounts'
import { getActiveGroups } from '../database/groups'
import {
  randomDelay,
  Delays,
  generateSessionTimes,
  simulateReading
} from '../services/human-behavior'

interface ScheduledTask {
  id: string
  task: cron.ScheduledTask
  name: string
}

const scheduledTasks: Map<string, ScheduledTask> = new Map()
let isRunning = false
let totalRunDurationMs = 0
const MAX_RUN_DURATION_MS = 30 * 60 * 1000 // 30 minutes max per schedule execution

export function initializeScheduler(): void {
  const schedules = getActiveSchedules()
  for (const schedule of schedules) {
    schedulePosting(schedule)
  }
  addActivityLogAndEmit('info', `Đã khởi tạo ${schedules.length} lịch trình`, 'system')
  console.log(`[Scheduler] Initialized ${schedules.length} schedules`)
}

export function schedulePosting(schedule: {
  id: string
  name: string
  contentId?: string
  content_id?: string
  accountIds?: string
  account_ids?: string
  groupIds?: string
  group_ids?: string
  cronExpression?: string
  cron_expression?: string
  platform?: string
}): void {
  unschedulePosting(schedule.id)

  const cronExpr = schedule.cronExpression || schedule.cron_expression || ''
  if (!cron.validate(cronExpr)) {
    addActivityLogAndEmit('warning', `Biểu thức cron không hợp lệ cho lịch: ${schedule.name}: ${cronExpr}`, 'system')
    return
  }

  const task = cron.schedule(cronExpr, async () => {
    await executePosting(
      schedule.id,
      schedule.name,
      schedule.contentId || schedule.content_id || '',
      schedule.accountIds || schedule.account_ids || '',
      schedule.groupIds || schedule.group_ids || '',
      schedule.platform || 'both'
    )
  })

  scheduledTasks.set(schedule.id, { id: schedule.id, task, name: schedule.name })
  addActivityLogAndEmit('info', `Đã lên lịch: "${schedule.name}" (Cron: ${cronExpr})`, 'system')
}

export function unschedulePosting(scheduleId: string): void {
  const existing = scheduledTasks.get(scheduleId)
  if (existing) {
    existing.task.stop()
    scheduledTasks.delete(scheduleId)
    addActivityLogAndEmit('info', `Đã hủy lịch: "${existing.name}"`, 'system')
  }
}

export function reloadSchedule(schedule: {
  id: string
  name: string
  contentId?: string
  content_id?: string
  groupIds?: string
  group_ids?: string
  cronExpression?: string
  cron_expression?: string
  isActive?: boolean
  is_active?: boolean
}): void {
  unschedulePosting(schedule.id)
  if (schedule.isActive || schedule.is_active) {
    schedulePosting(schedule)
  }
}

export function stopAllSchedules(): void {
  for (const [, task] of scheduledTasks) {
    task.task.stop()
  }
  scheduledTasks.clear()
  addActivityLogAndEmit('info', 'Đã dừng tất cả lịch trình', 'system')
}

export function getActiveTaskCount(): number {
  return scheduledTasks.size
}

async function executePosting(
  scheduleId: string,
  scheduleName: string,
  contentId: string,
  accountIdsJson: string,
  groupIdsJson: string,
  platform: string
): Promise<void> {
  if (isRunning) {
    addActivityLogAndEmit('warning', `Bỏ qua lần chạy "${scheduleName}" - đang có tác vụ khác`, 'system')
    return
  }

  // Reset duration tracker
  totalRunDurationMs = 0
  isRunning = true

  // === Session-awareness: check if current time is within realistic posting hours ===
  const now = new Date()
  const currentHour = now.getHours()
  const { startHour, endHour } = generateSessionTimes()
  const isWithinSession = (() => {
    if (startHour <= endHour) return currentHour >= startHour && currentHour <= endHour
    // Handles overnight ranges (e.g. 23:00 - 02:00)
    return currentHour >= startHour || currentHour <= endHour
  })()

  if (!isWithinSession) {
    addActivityLogAndEmit(
      'warning',
      `Lịch "${scheduleName}" được kích hoạt ngoài khung giờ hoạt động (${startHour}:00 - ${endHour}:00). Tiếp tục với delay dài hơn để giảm thiểu rủi ro phát hiện.`,
      platform
    )
  }

  // === Pre-execution jitter: random 30s–3min delay to avoid all schedules running at once ===
  const jitterMs = 30000 + Math.floor(Math.random() * 150000)
  addActivityLogAndEmit(
    'info',
    `Lịch "${scheduleName}" sẽ bắt đầu sau ${Math.round(jitterMs / 1000)} giây (jitter chống phát hiện)`,
    platform
  )
  await randomDelay(jitterMs, jitterMs)
  totalRunDurationMs += jitterMs

  addActivityLogAndEmit('info', `Bắt đầu lịch: "${scheduleName}"`, platform)

  try {
    // Get content template
    const content = getContent(contentId)
    if (!content) {
      addActivityLogAndEmit('error', `Không tìm thấy nội dung cho lịch "${scheduleName}"`, 'system')
      isRunning = false
      return
    }

    // Get target groups
    let groupIds: string[] = []
    try { groupIds = JSON.parse(groupIdsJson || '[]') } catch { groupIds = [] }

    const allGroups = getActiveGroups()
    const targetGroups = allGroups.filter(g => platform === 'both' || g.platform === platform)

    if (targetGroups.length === 0) {
      addActivityLogAndEmit('warning', `Không có nhóm nào hoạt động cho lịch "${scheduleName}"`, platform)
      isRunning = false
      return
    }

    // Get accounts to use
    let accountIds: string[] = []
    try { accountIds = JSON.parse(accountIdsJson || '[]') } catch { accountIds = [] }
    const accounts = accountIds.length > 0
      ? getAccounts().filter(a => accountIds.includes(a.id) && a.status === 'live')
      : getAccounts(platform === 'both' ? undefined : platform).filter(a => a.status === 'live')

    if (accounts.length === 0) {
      addActivityLogAndEmit('warning', `Không có tài khoản live nào cho lịch "${scheduleName}"`, platform)
      isRunning = false
      return
    }

    // Process content template with spintax (basic implementation)
    let finalContent = content.template
    finalContent = finalContent.replace(/\{([^}]+)\}/g, (_match, group) => {
      const options = group.split('|')
      return options[Math.floor(Math.random() * options.length)].trim()
    })

    // For each group, post using available accounts
    for (let i = 0; i < targetGroups.length; i++) {
      // Safety check: abort if we've been running too long
      if (totalRunDurationMs > MAX_RUN_DURATION_MS) {
        addActivityLogAndEmit(
          'warning',
          `Đã vượt quá thời gian chạy tối đa (30 phút) cho lịch "${scheduleName}". Dừng sau ${i}/${targetGroups.length} nhóm.`,
          platform
        )
        break
      }

      const group = targetGroups[i]
      const account = accounts[i % accounts.length]

      addActivityLogAndEmit('info', `Đang đăng bài lên "${group.name}"...`, platform, account?.id)

      try {
        // === Simulate reading the content before posting ===
        const readingTime = await simulateReading(finalContent.length)
        totalRunDurationMs += readingTime

        // === Wait between accounts (avoid posting too fast from same account) ===
        if (targetGroups.length > 1) {
          await Delays.betweenActions()
          totalRunDurationMs += 3000 // Approximate upper bound
        }

        // === Simulate posting with a realistic delay ===
        await randomDelay(2000, 5000)
        totalRunDurationMs += 5000

        addHistory({
          platform: (platform as any) || 'facebook',
          schedule_id: scheduleId,
          account_id: account?.id || null,
          group_id: group.id,
          content_id: contentId,
          content: finalContent,
          media_count: content.media_paths ? JSON.parse(content.media_paths).length : 0,
          status: 'success',
          error: null,
          post_url: null
        })

        addActivityLogAndEmit('success', `Đăng bài thành công lên "${group.name}"`, platform, account?.id, group.id)
      } catch (err: any) {
        addHistory({
          platform: (platform as any) || 'facebook',
          schedule_id: scheduleId,
          account_id: account?.id || null,
          group_id: group.id,
          content_id: contentId,
          content: finalContent,
          media_count: content.media_paths ? JSON.parse(content.media_paths).length : 0,
          status: 'failed',
          error: err?.message || 'Unknown error',
          post_url: null
        })

        addActivityLogAndEmit('error', `Đăng bài thất bại lên "${group.name}": ${err?.message || 'Lỗi không xác định'}`, platform, account?.id, group.id)
      }

      // === Human-like delay between posts ===
      if (i < targetGroups.length - 1) {
        const platformType = (platform === 'tiktok' ? 'tiktok' : 'facebook') as 'facebook' | 'tiktok'
        await Delays.betweenPosts(platformType)
        totalRunDurationMs += 120000 // Approximate upper bound

        // If outside normal session hours, add extra random delay to seem more cautious
        if (!isWithinSession) {
          const extraMs = 60000 + Math.floor(Math.random() * 120000) // 1-3 minutes extra
          addActivityLogAndEmit(
            'info',
            `Ngoài khung giờ hoạt động, thêm ${Math.round(extraMs / 1000)} giây chờ...`,
            platform
          )
          await randomDelay(60000, 180000)
          totalRunDurationMs += extraMs
        }
      }
    }

    // === Post-completion idle behavior (release `isRunning` first so other schedules can run) ===
    isRunning = false
    await Delays.idle()
    totalRunDurationMs += 30000

    addActivityLogAndEmit('success', `Hoàn thành lịch "${scheduleName}": ${targetGroups.length} bài trong ${Math.round(totalRunDurationMs / 60000)} phút`, platform)
    return
  } catch (error: any) {
    addActivityLogAndEmit('error', `Lỗi thực thi lịch "${scheduleName}": ${error?.message || 'Unknown'}`, 'system')
  }

  isRunning = false
}
