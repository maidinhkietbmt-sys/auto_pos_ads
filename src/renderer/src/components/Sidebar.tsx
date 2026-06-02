import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarClock,
  Clock,
  Settings,
  Facebook,
  Music2,
  Shield,
  BarChart3,
  Terminal,
  Sun,
  Moon,
  Zap,
  UserCheck,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useTheme } from '../stores/ThemeContext'

interface SidebarProps {
  isFacebookLoggedIn: boolean
  isBackendConnected?: boolean
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/accounts', icon: UserCheck, label: 'Tài khoản' },
  { path: '/groups', icon: Users, label: 'Groups / Pages' },
  { path: '/content', icon: FileText, label: 'Nội dung' },
  { path: '/schedule', icon: CalendarClock, label: 'Lịch đăng' },
  { path: '/ads', icon: BarChart3, label: 'Quảng cáo' },
  { path: '/history', icon: Clock, label: 'Lịch sử' },
  { path: '/logs', icon: Terminal, label: 'Nhật ký' },
  { path: '/settings', icon: Settings, label: 'Cài đặt' }
]

function Sidebar({ isFacebookLoggedIn, isBackendConnected = false }: SidebarProps): JSX.Element {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-10"
      style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-default)' }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all duration-300 group-hover:scale-105">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Auto Poster</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>FB & TikTok Manager</p>
          </div>
        </div>
      </div>

      {/* Backend Connection Status */}
      <div className="px-4 pt-2 pb-1">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-500 ${
            isBackendConnected
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
          title={isBackendConnected ? 'Đã kết nối với hệ thống' : 'Mất kết nối với hệ thống. Một số tính năng sẽ không khả dụng.'}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          <span className="flex items-center gap-1.5">
            {isBackendConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {isBackendConnected ? 'Hệ thống: Online' : 'Hệ thống: Offline'}
          </span>
        </div>
      </div>

      {/* Platform Status */}
      <div className="px-4 py-2 space-y-2">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-500 ${
            isFacebookLoggedIn
              ? 'bg-blue-500/10 text-blue-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              isFacebookLoggedIn ? 'bg-blue-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          <span className="flex items-center gap-1">
            <Facebook className="w-3 h-3" />
            {isFacebookLoggedIn ? 'FB: Đã kết nối' : 'FB: Chưa kết nối'}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-dark-600/30 text-dark-300">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="flex items-center gap-1">
            <Music2 className="w-3 h-3" />
            TikTok: Chưa kết nối
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              animationDelay: `${0.03 + index * 0.04}s`,
              animationFillMode: 'forwards' as const,
              color: isActive ? undefined : 'var(--text-tertiary)'
            })}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 opacity-0 animate-fade-in ${
                isActive
                  ? 'bg-gradient-to-r from-brand-500/20 to-brand-600/10 text-brand-400 border border-brand-500/20 shadow-sm'
                  : 'border border-transparent'
              }`
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('text-brand-400')) {
                e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('text-brand-400')) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme toggle + Footer */}
      <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            color: 'var(--text-muted)',
            backgroundColor: 'var(--hover-bg)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--skeleton-from)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)' }}
        >
          <span className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
          <span className="text-xs opacity-60">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          v2.0.0 • FB & TikTok Automation
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
