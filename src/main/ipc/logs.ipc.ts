import { ipcMain, BrowserWindow } from 'electron'
import { getActivityLogs, getRecentLogs, logEventEmitter, LOG_EVENT } from '../database/index'

export function registerLogIpcHandlers(): void {
  ipcMain.handle('logs:getAll', (_event, limit?: number, level?: string) => getActivityLogs(limit, level))
  ipcMain.handle('logs:getRecent', (_event, minutes?: number) => getRecentLogs(minutes))

  // Push-based log streaming: when main process emits a log event,
  // forward to all renderer windows
  logEventEmitter.on(LOG_EVENT, (log: any) => {
    const windows = BrowserWindow.getAllWindows()
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('logs:new', log)
      }
    }
  })
}
