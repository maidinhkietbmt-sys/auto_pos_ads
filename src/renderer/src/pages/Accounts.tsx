import React, { useState, useEffect } from 'react'
import {
  Plus, Trash2, Edit2, UserCheck, Facebook, Music2, Globe,
  Shield, ShieldOff, Wifi, RefreshCw, ExternalLink, Eye, EyeOff,
  CheckCircle2, XCircle, AlertTriangle, HelpCircle
} from 'lucide-react'

interface Account {
  id: string
  platform: 'facebook' | 'tiktok'
  account_type: string
  label: string | null
  email: string | null
  password: string | null
  twofa_secret: string | null
  access_token: string | null
  cookie_data: string | null
  proxy_id: string | null
  user_agent: string | null
  status: 'live' | 'die' | 'checkpoint' | 'limited' | 'unverified'
  note: string | null
  last_used_at: string | null
  proxy_label?: string
  proxy_host?: string
  proxy_port?: number
  proxy_type?: string
}

interface Proxy {
  id: string
  label: string | null
  type: string
  host: string
  port: number
  username: string | null
  password: string | null
  region: string | null
  is_active: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  live: { label: 'Live', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  die: { label: 'Die', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  checkpoint: { label: 'Checkpoint', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: AlertTriangle },
  limited: { label: 'Limited', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertTriangle },
  unverified: { label: 'Chưa xác minh', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: HelpCircle }
}

const ACCOUNT_TYPES: Record<string, string[]> = {
  facebook: ['via', 'clone', 'bm', 'fanpage'],
  tiktok: ['personal', 'agency', 'business']
}

function Accounts(): JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  // Form state
  const [formPlatform, setFormPlatform] = useState<'facebook' | 'tiktok'>('facebook')
  const [formType, setFormType] = useState('via')
  const [formLabel, setFormLabel] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formToken, setFormToken] = useState('')
  const [formProxyId, setFormProxyId] = useState('')
  const [formStatus, setFormStatus] = useState<Account['status']>('live')
  const [formNote, setFormNote] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Proxy form
  const [showProxyModal, setShowProxyModal] = useState(false)
  const [proxyLabel, setProxyLabel] = useState('')
  const [proxyType, setProxyType] = useState<string>('http')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyUser, setProxyUser] = useState('')
  const [proxyPass, setProxyPass] = useState('')
  const [proxyRegion, setProxyRegion] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [accs, proxs] = await Promise.all([
        window.api.accounts.getAll(),
        window.api.proxies.getAll()
      ])
      setAccounts(accs)
      setProxies(proxs)
    } catch (err) {
      console.error('Failed to load accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAccounts = platformFilter === 'all'
    ? accounts
    : accounts.filter(a => a.platform === platformFilter)

  const fbAccounts = accounts.filter(a => a.platform === 'facebook')
  const ttAccounts = accounts.filter(a => a.platform === 'tiktok')
  const liveAccounts = accounts.filter(a => a.status === 'live')

  const resetForm = () => {
    setEditingId(null)
    setFormPlatform('facebook')
    setFormType('via')
    setFormLabel('')
    setFormEmail('')
    setFormPassword('')
    setFormToken('')
    setFormProxyId('')
    setFormStatus('live')
    setFormNote('')
    setShowModal(false)
  }

  const openEdit = async (id: string) => {
    const acc = accounts.find(a => a.id === id)
    if (!acc) return
    setEditingId(id)
    setFormPlatform(acc.platform)
    setFormType(acc.account_type)
    setFormLabel(acc.label || '')
    setFormEmail(acc.email || '')
    setFormPassword(acc.password || '')
    setFormToken(acc.access_token || '')
    setFormProxyId(acc.proxy_id || '')
    setFormStatus(acc.status)
    setFormNote(acc.note || '')
    setShowModal(true)
  }

  const handleSave = async () => {
    const data: any = {
      platform: formPlatform,
      account_type: formType,
      label: formLabel || null,
      email: formEmail || null,
      password: formPassword || null,
      access_token: formToken || null,
      proxy_id: formProxyId || null,
      status: formStatus,
      note: formNote || null
    }

    try {
      if (editingId) {
        await window.api.accounts.update(editingId, data)
      } else {
        await window.api.accounts.add(data)
      }
      resetForm()
      await loadData()
    } catch (err) {
      console.error('Failed to save account:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản này?')) return
    try {
      await window.api.accounts.delete(id)
      await loadData()
    } catch (err) {
      console.error('Failed to delete account:', err)
    }
  }

  const handleSaveProxy = async () => {
    try {
      await window.api.proxies.add({
        label: proxyLabel || null,
        type: proxyType,
        host: proxyHost,
        port: parseInt(proxyPort),
        username: proxyUser || null,
        password: proxyPass || null,
        region: proxyRegion || null,
        is_active: true
      })
      setShowProxyModal(false)
      resetProxyForm()
      await loadData()
    } catch (err) {
      console.error('Failed to save proxy:', err)
    }
  }

  const resetProxyForm = () => {
    setProxyLabel('')
    setProxyType('http')
    setProxyHost('')
    setProxyPort('')
    setProxyUser('')
    setProxyPass('')
    setProxyRegion('')
  }

  const AccountCard = ({ acc }: { acc: Account }) => {
    const statusCfg = STATUS_CONFIG[acc.status] || STATUS_CONFIG.unverified
    const StatusIcon = statusCfg.icon

    return (
      <div className="glass rounded-2xl p-5 card-hover stagger-item">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              acc.platform === 'facebook' ? 'bg-blue-500/20' : 'bg-purple-500/20'
            }`}>
              {acc.platform === 'facebook' ? (
                <Facebook className="w-5 h-5 text-blue-400" />
              ) : (
                <Music2 className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium">{acc.label || acc.email || 'No label'}</h3>
                <span className={`${statusCfg.bg} ${statusCfg.color} text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs text-dark-400 mt-0.5">
                {acc.platform === 'facebook' ? 'Facebook' : 'TikTok'} • {acc.account_type}
                {acc.email && ` • ${acc.email}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => openEdit(acc.id)} className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-brand-400 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(acc.id)} className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-dark-500">Token</span>
            <p className="text-dark-300 mt-0.5 truncate">
              {acc.access_token ? `${acc.access_token.slice(0, 15)}...` : '—'}
            </p>
          </div>
          <div>
            <span className="text-dark-500">Proxy</span>
            <p className="text-dark-300 mt-0.5 truncate">
              {acc.proxy_host ? `${acc.proxy_host}:${acc.proxy_port}` : '—'}
            </p>
          </div>
          <div>
            <span className="text-dark-500">Lần cuối</span>
            <p className="text-dark-300 mt-0.5">
              {acc.last_used_at ? new Date(acc.last_used_at).toLocaleDateString('vi-VN') : '—'}
            </p>
          </div>
        </div>

        {acc.note && (
          <p className="text-xs text-dark-400 mt-2 italic">{acc.note}</p>
        )}
      </div>
    )
  }

  const StatCard = ({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) => (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color.replace('text', 'bg')}/10`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-dark-400">{label}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý tài khoản</h1>
          <p className="text-dark-300 mt-1">Quản lý tài khoản Facebook & TikTok, proxy, và browser profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowProxyModal(true)} className="btn-secondary flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Thêm Proxy
          </button>
          <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Tổng tài khoản" value={accounts.length} color="text-brand-400" icon={UserCheck} />
          <StatCard label="Facebook" value={fbAccounts.length} color="text-blue-400" icon={Facebook} />
          <StatCard label="TikTok" value={ttAccounts.length} color="text-purple-400" icon={Music2} />
          <StatCard label="Đang Live" value={liveAccounts.length} color="text-green-400" icon={CheckCircle2} />
        </div>
      )}

      {/* Platform filter */}
      <div className="flex items-center gap-2">
        {['all', 'facebook', 'tiktok'].map(p => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              platformFilter === p
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-dark-300 hover:text-white bg-dark-700/30 border border-transparent'
            }`}
          >
            {p === 'all' ? 'Tất cả' : p === 'facebook' ? 'Facebook' : 'TikTok'}
          </button>
        ))}
      </div>

      {/* Account list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="skeleton skeleton-circle w-11 h-11" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <UserCheck className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có tài khoản nào</h3>
          <p className="text-dark-400 mb-2">
            {platformFilter === 'all' ? 'Thêm tài khoản Facebook hoặc TikTok để bắt đầu' :
             `Chưa có tài khoản ${platformFilter === 'facebook' ? 'Facebook' : 'TikTok'} nào`}
          </p>
          <p className="text-dark-500 text-sm mb-6">
            Hỗ trợ Via/Clone/BM cho Facebook, Personal/Agency cho TikTok
          </p>
          <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Thêm tài khoản đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAccounts.map(acc => (
            <AccountCard key={acc.id} acc={acc} />
          ))}
        </div>
      )}

      {/* Account Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="glass rounded-2xl p-6 w-full max-w-lg mx-4 animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Sửa tài khoản' : 'Thêm tài khoản mới'}
            </h2>

            <div className="space-y-4">
              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Nền tảng</label>
                <div className="flex gap-3">
                  {(['facebook', 'tiktok'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => { setFormPlatform(p); setFormType(ACCOUNT_TYPES[p][0]) }}
                      disabled={!!editingId}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        formPlatform === p
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                          : 'bg-dark-700 border-dark-500 text-dark-300'
                      } ${editingId ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {p === 'facebook' ? <Facebook className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
                      {p === 'facebook' ? 'Facebook' : 'TikTok'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Loại tài khoản</label>
                <div className="flex flex-wrap gap-2">
                  {ACCOUNT_TYPES[formPlatform].map(t => (
                    <button
                      key={t}
                      onClick={() => setFormType(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        formType === t
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                          : 'bg-dark-700 border-dark-500 text-dark-300 hover:border-dark-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Tên hiển thị</label>
                <input type="text" value={formLabel} onChange={e => setFormLabel(e.target.value)}
                  placeholder="VD: Acc FB chính" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Email / Username</label>
                  <input type="text" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                    placeholder="email@example.com" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder="••••••••" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 pr-12 text-white" />
                    <button onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Access Token */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Access Token</label>
                <input type="text" value={formToken} onChange={e => setFormToken(e.target.value)}
                  placeholder="EAAB... (dùng API method)" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white font-mono text-xs" />
              </div>

              {/* Status & Proxy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Trạng thái</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Proxy</label>
                  <select value={formProxyId} onChange={e => setFormProxyId(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                    <option value="">Không dùng proxy</option>
                    {proxies.filter(p => p.is_active).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.label || `${p.host}:${p.port}`} ({p.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Ghi chú</label>
                <textarea value={formNote} onChange={e => setFormNote(e.target.value)} rows={2}
                  placeholder="Ghi chú về tài khoản này..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={resetForm} className="btn-secondary">Hủy</button>
              <button onClick={handleSave} className="btn-primary">{
                editingId ? 'Lưu thay đổi' : 'Thêm tài khoản'
              }</button>
            </div>
          </div>
        </div>
      )}

      {/* Proxy Add Modal */}
      {showProxyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-lg mx-4 animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">Thêm Proxy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Loại proxy</label>
                <div className="flex gap-2">
                  {['http', 'https', 'socks5'].map(t => (
                    <button key={t} onClick={() => setProxyType(t)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                        proxyType === t ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-dark-700 border-dark-500 text-dark-300'
                      }`}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Tên (tùy chọn)</label>
                <input type="text" value={proxyLabel} onChange={e => setProxyLabel(e.target.value)}
                  placeholder="Proxy chính" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-dark-200 mb-2">Host</label>
                  <input type="text" value={proxyHost} onChange={e => setProxyHost(e.target.value)}
                    placeholder="192.168.1.1" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Port</label>
                  <input type="number" value={proxyPort} onChange={e => setProxyPort(e.target.value)}
                    placeholder="3128" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Username (tùy chọn)</label>
                  <input type="text" value={proxyUser} onChange={e => setProxyUser(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Password</label>
                  <input type="password" value={proxyPass} onChange={e => setProxyPass(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Khu vực (tùy chọn)</label>
                <input type="text" value={proxyRegion} onChange={e => setProxyRegion(e.target.value)}
                  placeholder="VN, US, SG..." className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowProxyModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSaveProxy} className="btn-primary">Thêm Proxy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
