import React, { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Facebook,
  Shield,
  ShieldCheck,
  ShieldOff,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock
} from 'lucide-react'
import { safeLoadData } from '../utils/safeApi'

interface SettingsProps {
  onLoginStatusChange: (status: boolean) => void
}

function Settings({ onLoginStatusChange }: SettingsProps): JSX.Element {
  const [facebookEmail, setFacebookEmail] = useState('')
  const [facebookPassword, setFacebookPassword] = useState('')
  const [twoFactorSecret, setTwoFactorSecret] = useState('')
  const [headlessMode, setHeadlessMode] = useState(true)
  const [postInterval, setPostInterval] = useState(5)
  const [maxPostsPerDay, setMaxPostsPerDay] = useState(10)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [encryptionAvailable, setEncryptionAvailable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  useEffect(() => {
    loadSettings()
    checkLoginStatus()
    checkEncryption()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await window.api.settings.get()
      if (settings) {
        setFacebookEmail(settings.facebookEmail || '')
        setFacebookPassword(settings.facebookPassword || '')
        setTwoFactorSecret(settings.twoFactorSecret || '')
        setHeadlessMode(!!settings.headlessMode)
        setPostInterval(settings.postInterval || 5)
        setMaxPostsPerDay(settings.maxPostsPerDay || 10)
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const checkLoginStatus = async () => {
    const result = await safeLoadData(
      () => window.api.facebook.checkLogin(),
      () => console.warn('[Settings] checkLogin failed — API may be unavailable')
    )
    const loggedIn = !!result
    setIsLoggedIn(loggedIn)
    onLoginStatusChange(loggedIn)
  }

  const checkEncryption = async () => {
    try {
      const status = await window.api.settings.encryptionStatus()
      setEncryptionAvailable(status.available)
    } catch {
      setEncryptionAvailable(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await window.api.settings.update({
        facebookEmail,
        facebookPassword,
        twoFactorSecret,
        headlessMode,
        postInterval,
        maxPostsPerDay
      })

      if (encryptionAvailable) {
        setMessage({ type: 'success', text: 'Đã lưu cài đặt! Mật khẩu đã được mã hóa an toàn.' })
      } else {
        setMessage({ type: 'info', text: 'Đã lưu cài đặt! (Mật khẩu lưu dạng plaintext - safeStorage không khả dụng)' })
      }
      setTimeout(() => setMessage(null), 4000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi lưu cài đặt!' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogin = async () => {
    if (!facebookEmail || !facebookPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email và mật khẩu Facebook!' })
      return
    }

    setLoggingIn(true)
    setMessage(null)

    try {
      // Save credentials first
      await window.api.settings.update({
        facebookEmail,
        facebookPassword,
        twoFactorSecret,
        headlessMode,
        postInterval,
        maxPostsPerDay
      })

      const result = await window.api.facebook.login(facebookEmail, facebookPassword)
      if (result) {
        setIsLoggedIn(true)
        onLoginStatusChange(true)
        setMessage({ type: 'success', text: 'Đăng nhập Facebook thành công! Phiên làm việc đã được lưu.' })
      } else {
        setMessage({ type: 'error', text: 'Đăng nhập thất bại. Kiểm tra email/mật khẩu hoặc xác thực 2 yếu tố.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi đăng nhập Facebook!' })
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await window.api.facebook.logout()
      setIsLoggedIn(false)
      onLoginStatusChange(false)
      setMessage({ type: 'success', text: 'Đã đăng xuất Facebook!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi đăng xuất!' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Cài đặt</h1>
        <p className="text-dark-300 mt-1">Cấu hình tài khoản Facebook và ứng dụng</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20'
            : message.type === 'info'
              ? 'bg-blue-500/10 border border-blue-500/20'
              : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          ) : message.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span className={
            message.type === 'success' ? 'text-green-300'
            : message.type === 'info' ? 'text-blue-300'
            : 'text-red-300'
          }>
            {message.text}
          </span>
        </div>
      )}

      {/* Facebook Login */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${
            isLoggedIn ? 'bg-green-500/10' : 'bg-blue-500/10'
          }`}>
            <Facebook className={`w-6 h-6 ${
              isLoggedIn ? 'text-green-400' : 'text-blue-400'
            }`} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Tài khoản Facebook</h2>
            <p className="text-sm text-dark-400">
              {isLoggedIn ? 'Đã kết nối với Facebook' : 'Chưa kết nối tài khoản Facebook'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Encryption status badge */}
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                encryptionAvailable
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}
              title={encryptionAvailable
                ? 'Mật khẩu được mã hóa bằng DPAPI/Keychain của hệ thống'
                : 'safeStorage không khả dụng - mật khẩu lưu dạng plaintext'
              }
            >
              {encryptionAvailable ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <ShieldOff className="w-3.5 h-3.5" />
              )}
              {encryptionAvailable ? 'Mã hóa' : 'Không mã hóa'}
            </span>
            {isLoggedIn && (
              <span className="badge-success">Đã đăng nhập</span>
            )}
          </div>
        </div>

        {/* Encryption info bar */}
        {!encryptionAvailable && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
            <ShieldOff className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-300 font-medium">Mật khẩu chưa được mã hóa</p>
              <p className="text-xs text-yellow-400/70 mt-1">
                Hệ thống không hỗ trợ mã hóa (safeStorage). Mật khẩu Facebook được lưu dạng plaintext trong file JSON.
                Trên Windows, safeStorage hoạt động với DPAPI và thường có sẵn.
              </p>
            </div>
          </div>
        )}

        {encryptionAvailable && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-300 font-medium">Mật khẩu được mã hóa an toàn</p>
              <p className="text-xs text-green-400/70 mt-1">
                Sử dụng {typeof process !== 'undefined' && process.platform === 'win32' ? 'Windows DPAPI' : typeof process !== 'undefined' && process.platform === 'darwin' ? 'macOS Keychain' : 'libsecret'} để mã hóa.
                Mật khẩu được giải mã tự động khi sử dụng.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Email / Số điện thoại</label>
            <input
              type="email"
              value={facebookEmail}
              onChange={(e) => setFacebookEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={facebookPassword}
                onChange={(e) => setFacebookPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 pr-12 text-white placeholder-dark-400"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Mã xác thực 2 yếu tố (tùy chọn)
            </label>
            <input
              type="text"
              value={twoFactorSecret}
              onChange={(e) => setTwoFactorSecret(e.target.value)}
              placeholder="Nhập mã 2FA nếu có..."
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            {!isLoggedIn ? (
              <button
                onClick={handleLogin}
                disabled={loggingIn}
                className="btn-primary flex items-center gap-2"
              >
                {loggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Facebook className="w-4 h-4" />
                )}
                {loggingIn ? 'Đang đăng nhập...' : 'Đăng nhập Facebook'}
              </button>
            ) : (
              <button onClick={handleLogout} className="btn-danger flex items-center gap-2">
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-brand-500/10">
            <SettingsIcon className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Cấu hình ứng dụng</h2>
            <p className="text-sm text-dark-400">Tùy chỉnh cách hoạt động của tool</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Browser Mode */}
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Chế độ ẩn trình duyệt</p>
              <p className="text-sm text-dark-400">Chạy trình duyệt ẩn (không hiện cửa sổ)</p>
            </div>
            <button
              onClick={() => setHeadlessMode(!headlessMode)}
              className={`w-14 h-7 rounded-full transition-colors relative ${
                headlessMode ? 'bg-brand-500' : 'bg-dark-600'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  headlessMode ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          {/* Post Interval */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Khoảng cách giữa các bài đăng (giây)
            </label>
            <input
              type="number"
              value={postInterval}
              onChange={(e) => setPostInterval(Number(e.target.value))}
              min={3}
              max={60}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white"
            />
            <p className="text-xs text-dark-400 mt-1">Tối thiểu 3 giây để tránh bị Facebook chặn</p>
          </div>

          {/* Max Posts Per Day */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Giới hạn bài đăng mỗi ngày
            </label>
            <input
              type="number"
              value={maxPostsPerDay}
              onChange={(e) => setMaxPostsPerDay(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white"
            />
            <p className="text-xs text-dark-400 mt-1">Giới hạn này giúp tránh spam</p>
          </div>
        </div>
      </div>

      {/* Security info footer */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-dark-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-dark-400 space-y-1">
            <p>
              <strong className="text-dark-300">Bảo mật:</strong> Mật khẩu được mã hóa bằng
              {typeof process !== 'undefined' && process.platform === 'win32' ? ' Windows DPAPI' : typeof process !== 'undefined' && process.platform === 'darwin' ? ' macOS Keychain' : ' libsecret'}
              {' '}của hệ thống trước khi lưu vào database.
            </p>
            <p>
              Dữ liệu được lưu tại: <code className="text-brand-400 bg-dark-700 px-1.5 py-0.5 rounded">
                %APPDATA%/facebook-auto-poster/
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )
}

export default Settings
