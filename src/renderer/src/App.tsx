import React, { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './stores/ThemeContext'
import Sidebar from './components/Sidebar'
import ActivityLog from './components/ActivityLog'
import ErrorBoundary from './components/ErrorBoundary'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Groups from './pages/Groups'
import Content from './pages/Content'
import Schedule from './pages/Schedule'
import Ads from './pages/Ads'
import History from './pages/History'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import { safeApi, checkBackendConnection } from './utils/safeApi'

declare global {
  interface Window {
    api: {
      accounts: {
        getAll: (platform?: string) => Promise<any[]>
        get: (id: string) => Promise<any>
        add: (data: any) => Promise<any>
        update: (id: string, updates: any) => Promise<void>
        delete: (id: string) => Promise<void>
        updateStatus: (id: string, status: string) => Promise<void>
      }
      proxies: {
        getAll: () => Promise<any[]>
        add: (data: any) => Promise<any>
        update: (id: string, updates: any) => Promise<void>
        delete: (id: string) => Promise<void>
      }
      groups: {
        getAll: () => Promise<any[]>
        getActive: () => Promise<any[]>
        add: (data: any) => Promise<any>
        update: (id: string, updates: any) => Promise<void>
        delete: (id: string) => Promise<void>
        updateLastPosted: (id: string) => Promise<void>
      }
      content: {
        getAll: (platform?: string) => Promise<any[]>
        get: (id: string) => Promise<any>
        add: (data: any) => Promise<any>
        update: (id: string, updates: any) => Promise<void>
        delete: (id: string) => Promise<void>
      }
      schedules: {
        getAll: () => Promise<any[]>
        getActive: () => Promise<any[]>
        add: (data: any) => Promise<any>
        update: (id: string, updates: any) => Promise<void>
        delete: (id: string) => Promise<void>
      }
      history: {
        getAll: (limit?: number) => Promise<any[]>
        getTodayStats: () => Promise<{ total: number; success: number; failed: number; pending: number }>
        getOverallStats: () => Promise<{ totalPosts: number; totalGroups: number; activeSchedules: number; totalAccounts: number }>
        getPlatformStats: (platform: string) => Promise<{ total: number; success: number; failed: number }>
        add: (record: any) => Promise<any>
      }
      settings: {
        getAll: (keys?: string[]) => Promise<Record<string, string>>
        get: (key: string) => Promise<string | undefined>
        set: (key: string, value: string) => Promise<void>
        getAppConfig: () => Promise<any>
        saveAppConfig: (config: any) => Promise<void>
        getFacebookCredentials: () => Promise<any>
        saveFacebookCredentials: (creds: any) => Promise<void>
      }
      ads: {
        getCampaigns: (platform?: string) => Promise<any[]>
        getCampaign: (id: string) => Promise<any>
        addCampaign: (data: any) => Promise<any>
        updateCampaign: (id: string, updates: any) => Promise<void>
        deleteCampaign: (id: string) => Promise<void>
        getAdsets: (campaignId?: string) => Promise<any[]>
        addAdset: (data: any) => Promise<any>
        getInsights: (adsetId: string, days?: number) => Promise<any[]>
        getRules: (platform?: string) => Promise<any[]>
        addRule: (data: any) => Promise<any>
        updateRule: (id: string, updates: any) => Promise<void>
        deleteRule: (id: string) => Promise<void>
      }
      logs: {
        getAll: (limit?: number, level?: string) => Promise<any[]>
        getRecent: (minutes?: number) => Promise<any[]>
        onNewLog: (callback: (log: any) => void) => () => void
      }
      images: {
        select: () => Promise<string[]>
        copyToStorage: (sourcePaths: string[]) => Promise<any[]>
        delete: (filename: string) => Promise<boolean>
        deleteMultiple: (filenames: string[]) => Promise<void>
        list: () => Promise<any[]>
      }
      facebook: {
        login: (email: string, password: string) => Promise<boolean>
        checkLogin: () => Promise<boolean>
        logout: () => Promise<void>
        postToGroups: (groups: { url: string; name: string }[], content: string, imagePaths?: string[]) => Promise<any>
      }
      scheduler: {
        init: () => Promise<void>
        stopAll: () => Promise<void>
        count: () => Promise<number>
      }
    }
  }
}

function App(): JSX.Element {
  const [isFacebookLoggedIn, setIsFacebookLoggedIn] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [logOpen, setLogOpen] = useState(true)

  // Check backend connection on mount and periodically
  useEffect(() => {
    const check = async () => {
      const connected = await checkBackendConnection()
      setIsBackendConnected(connected)
    }

    // Initial check
    check()

    // Periodic ping every 10 seconds
    const interval = setInterval(check, 10000)

    // Re-check on window focus (user returns to the app)
    const onFocus = () => check()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Check Facebook login status
  useEffect(() => {
    safeApi<any>('facebook', 'checkLogin')().then((loggedIn: boolean) => {
      setIsFacebookLoggedIn(loggedIn)
    })
  }, [])

  return (
    <ThemeProvider>
      <HashRouter>
        <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
          <Sidebar isFacebookLoggedIn={isFacebookLoggedIn} isBackendConnected={isBackendConnected} />
          <main
            className="flex-1 overflow-y-auto transition-all duration-300"
            style={{ marginLeft: '16rem', marginBottom: logOpen ? '18rem' : '2.5rem', padding: '1.5rem' }}
          >
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<ErrorBoundary><Accounts /></ErrorBoundary>} />
                <Route path="/groups" element={<ErrorBoundary><Groups /></ErrorBoundary>} />
                <Route path="/content" element={<ErrorBoundary><Content /></ErrorBoundary>} />
                <Route path="/schedule" element={<ErrorBoundary><Schedule /></ErrorBoundary>} />
                <Route path="/ads" element={<ErrorBoundary><Ads /></ErrorBoundary>} />
                <Route path="/history" element={<ErrorBoundary><History /></ErrorBoundary>} />
                <Route path="/logs" element={<ErrorBoundary><Logs /></ErrorBoundary>} />
                <Route
                  path="/settings"
                  element={
                    <ErrorBoundary>
                      <Settings
                        onLoginStatusChange={setIsFacebookLoggedIn}
                      />
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </main>
          <ActivityLog isOpen={logOpen} onToggle={() => setLogOpen(!logOpen)} />
        </div>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
