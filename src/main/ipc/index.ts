import { registerAccountIpcHandlers } from './accounts.ipc'
import { registerLogIpcHandlers } from './logs.ipc'
import { registerDatabaseIpcHandlers } from './database.ipc'
import { registerServicesIpcHandlers } from './services.ipc'

export function registerAllIpcHandlers(): void {
  registerDatabaseIpcHandlers()
  registerAccountIpcHandlers()
  registerLogIpcHandlers()
  registerServicesIpcHandlers()
}
