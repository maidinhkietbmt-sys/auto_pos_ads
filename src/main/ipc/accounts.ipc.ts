import { ipcMain } from 'electron'
import {
  getAccounts, getAccount, addAccount, updateAccount, deleteAccount, updateAccountStatus,
  getProxies, addProxy, updateProxy, deleteProxy
} from '../database/accounts'

export function registerAccountIpcHandlers(): void {
  // ========== Accounts ==========
  ipcMain.handle('accounts:getAll', (_event, platform?: string) => getAccounts(platform))
  ipcMain.handle('accounts:get', (_event, id: string) => getAccount(id))
  ipcMain.handle('accounts:add', (_event, data) => addAccount(data))
  ipcMain.handle('accounts:update', (_event, id: string, updates) => updateAccount(id, updates))
  ipcMain.handle('accounts:delete', (_event, id: string) => deleteAccount(id))
  ipcMain.handle('accounts:updateStatus', (_event, id: string, status: string) => updateAccountStatus(id, status as any))

  // ========== Proxies ==========
  ipcMain.handle('proxies:getAll', () => getProxies())
  ipcMain.handle('proxies:add', (_event, data) => addProxy(data))
  ipcMain.handle('proxies:update', (_event, id: string, updates) => updateProxy(id, updates))
  ipcMain.handle('proxies:delete', (_event, id: string) => deleteProxy(id))
}
