import React, { useState, useEffect } from 'react'
import {
  BarChart3, Plus, Trash2, Edit2, Play, Pause, TrendingUp,
  DollarSign, MousePointer2, Eye, Target, PieChart, Clock,
  AlertTriangle, RefreshCw, Facebook, Music2, Download,
  Activity, EyeOff, Users, ArrowUpDown
} from 'lucide-react'

interface Campaign {
  id: string
  platform: 'facebook' | 'tiktok'
  external_id?: string | null
  name: string
  objective: string | null
  status: 'active' | 'paused' | 'deleted' | 'archived'
  daily_budget: number | null
  lifetime_budget: number | null
  start_time: string | null
  end_time: string | null
  created_at: string
}

interface Rule {
  id: string
  name: string
  platform: string | null
  target_type: string | null
  metric: string
  condition: string
  threshold: number
  action: string
  action_value: number | null
  time_window: number | null
  is_active: boolean
}

interface AggregatedMetrics {
  totalImpressions: number
  totalClicks: number
  totalSpend: number
  totalConversions: number
  avgCpm: number
  avgCtr: number
  avgCpc: number
  avgCpa: number
  campaignCount: number
  activeCampaigns: number
}

const OBJECTIVES = {
  facebook: ['awareness', 'traffic', 'engagement', 'leads', 'conversions', 'catalog_sales'],
  tiktok: ['awareness', 'traffic', 'reach', 'video_views', 'conversions', 'app_install']
}

const METRICS = [
  { key: 'cpa', label: 'CPA', icon: DollarSign },
  { key: 'cpm', label: 'CPM', icon: TrendingUp },
  { key: 'ctr', label: 'CTR', icon: MousePointer2 },
  { key: 'cpc', label: 'CPC', icon: Target },
  { key: 'spend', label: 'Chi phí', icon: DollarSign }
]

function Ads(): JSX.Element {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [metrics, setMetrics] = useState<AggregatedMetrics>({
    totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalConversions: 0,
    avgCpm: 0, avgCtr: 0, avgCpc: 0, avgCpa: 0, campaignCount: 0, activeCampaigns: 0
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState({ facebook: false, tiktok: false, insights: false })
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showInsights, setShowInsights] = useState<string | null>(null)

  // Campaign form
  const [campaignPlatform, setCampaignPlatform] = useState<'facebook' | 'tiktok'>('facebook')
  const [campaignName, setCampaignName] = useState('')
  const [campaignObjective, setCampaignObjective] = useState('')
  const [campaignStatus, setCampaignStatus] = useState('active')
  const [campaignDailyBudget, setCampaignDailyBudget] = useState('')

  // Rule form
  const [ruleName, setRuleName] = useState('')
  const [rulePlatform, setRulePlatform] = useState('')
  const [ruleMetric, setRuleMetric] = useState('cpa')
  const [ruleCondition, setRuleCondition] = useState('gt')
  const [ruleThreshold, setRuleThreshold] = useState('')
  const [ruleAction, setRuleAction] = useState('pause')
  const [ruleTimeWindow, setRuleTimeWindow] = useState('60')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cmps, rls, mtrx] = await Promise.all([
        window.api.ads.getCampaigns(),
        window.api.ads.getRules(),
        window.api.ads.getAggregatedMetrics()
      ])
      setCampaigns(cmps)
      setRules(rls)
      setMetrics(mtrx)
    } catch (err) {
      console.error('Failed to load ads data:', err)
    } finally {
      setLoading(false)
    }
  }

  const showSyncMessage = (type: 'success' | 'error', text: string) => {
    setSyncMessage({ type, text })
    setTimeout(() => setSyncMessage(null), 5000)
  }

  const handleSyncFacebook = async () => {
    setSyncing(s => ({ ...s, facebook: true }))
    try {
      const result = await window.api.ads.syncFacebook()
      showSyncMessage('success', `Đã đồng bộ ${(result as any[] || []).length} chiến dịch Facebook`)
      await loadData()
    } catch (err: any) {
      showSyncMessage('error', `Đồng bộ Facebook thất bại: ${err.message || 'Lỗi kết nối'}`)
    } finally {
      setSyncing(s => ({ ...s, facebook: false }))
    }
  }

  const handleSyncTikTok = async () => {
    setSyncing(s => ({ ...s, tiktok: true }))
    try {
      const result = await window.api.ads.syncTikTok()
      showSyncMessage('success', `Đã đồng bộ ${(result as any[] || []).length} chiến dịch TikTok`)
      await loadData()
    } catch (err: any) {
      showSyncMessage('error', `Đồng bộ TikTok thất bại: ${err.message || 'Lỗi kết nối'}`)
    } finally {
      setSyncing(s => ({ ...s, tiktok: false }))
    }
  }

  const handleSyncInsights = async () => {
    setSyncing(s => ({ ...s, insights: true }))
    try {
      await window.api.ads.syncInsights()
      showSyncMessage('success', 'Đã đồng bộ insights')
      await loadData()
    } catch (err: any) {
      showSyncMessage('error', `Đồng bộ insights thất bại: ${err.message || 'Lỗi kết nối'}`)
    } finally {
      setSyncing(s => ({ ...s, insights: false }))
    }
  }

  const filteredCampaigns = platformFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.platform === platformFilter)

  const handleSaveCampaign = async () => {
    try {
      const data = {
        platform: campaignPlatform,
        name: campaignName,
        objective: campaignObjective || null,
        status: campaignStatus,
        daily_budget: campaignDailyBudget ? parseFloat(campaignDailyBudget) : null
      }
      if (editingCampaignId) {
        await window.api.ads.updateCampaign(editingCampaignId, data)
      } else {
        await window.api.ads.addCampaign(data)
      }
      setShowCampaignModal(false)
      resetCampaignForm()
      await loadData()
    } catch (err) {
      console.error('Failed to save campaign:', err)
    }
  }

  const resetCampaignForm = () => {
    setEditingCampaignId(null)
    setCampaignPlatform('facebook')
    setCampaignName('')
    setCampaignObjective('')
    setCampaignStatus('active')
    setCampaignDailyBudget('')
  }

  const handleSaveRule = async () => {
    try {
      await window.api.ads.addRule({
        name: ruleName,
        platform: rulePlatform || null,
        target_type: 'campaign',
        metric: ruleMetric,
        condition: ruleCondition,
        threshold: parseFloat(ruleThreshold),
        action: ruleAction,
        action_value: null,
        time_window: parseInt(ruleTimeWindow),
        is_active: true
      })
      setShowRuleModal(false)
      setRuleName('')
      setRuleThreshold('')
      await loadData()
    } catch (err) {
      console.error('Failed to save rule:', err)
    }
  }

  const handleToggleRule = async (rule: Rule) => {
    try {
      await window.api.ads.updateRule(rule.id, { is_active: !rule.is_active })
      await loadData()
    } catch (err) { console.error(err) }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Xóa quy tắc này?')) return
    try {
      await window.api.ads.deleteRule(id)
      await loadData()
    } catch (err) { console.error(err) }
  }

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Xóa chiến dịch này?')) return
    try {
      await window.api.ads.deleteCampaign(id)
      await loadData()
    } catch (err) { console.error(err) }
  }

  const handleToggleCampaign = async (camp: Campaign) => {
    const newStatus = camp.status === 'active' ? 'paused' : 'active'
    try {
      await window.api.ads.updateCampaign(camp.id, { status: newStatus })
      await loadData()
    } catch (err) { console.error(err) }
  }

  const handleExportReport = () => {
    const lines = campaigns.map(c =>
      `${c.platform},${c.name},${c.status},${c.objective},${c.daily_budget || ''},${c.created_at}`
    ).join('\n')
    const blob = new Blob([`platform,name,status,objective, daily_budget,created_at\n${lines}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ads-campaigns-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const fbCampaigns = campaigns.filter(c => c.platform === 'facebook')
  const ttCampaigns = campaigns.filter(c => c.platform === 'tiktok')
  const activeCampaigns = campaigns.filter(c => c.status === 'active')

  const MetricCard = ({ label, value, prefix = '', suffix = '', color, icon: Icon }: { label: string; value: number | string; prefix?: string; suffix?: string; color: string; icon: React.ElementType }) => (
    <div className="glass rounded-xl p-4 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}{suffix}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${color.replace('text', 'bg')}/10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý quảng cáo</h1>
          <p className="text-dark-300 mt-1">Tạo, đồng bộ và theo dõi chiến dịch quảng cáo Facebook & TikTok</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportReport} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowRuleModal(true)} className="btn-secondary flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Quy tắc
          </button>
          <button onClick={() => { resetCampaignForm(); setShowCampaignModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tạo chiến dịch
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          syncMessage.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {syncMessage.type === 'success' ? (
            <Activity className="w-5 h-5 text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          <span className={syncMessage.type === 'success' ? 'text-green-300' : 'text-red-300'}>{syncMessage.text}</span>
        </div>
      )}

      {/* Sync Controls */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-dark-200">Đồng bộ:</span>
          <button onClick={handleSyncFacebook} disabled={syncing.facebook}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <RefreshCw className={`w-4 h-4 ${syncing.facebook ? 'animate-spin' : ''}`} />
            <Facebook className="w-3.5 h-3.5" />
            {syncing.facebook ? 'Đang đồng bộ...' : 'Facebook Ads'}
          </button>
          <button onClick={handleSyncTikTok} disabled={syncing.tiktok}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <RefreshCw className={`w-4 h-4 ${syncing.tiktok ? 'animate-spin' : ''}`} />
            <Music2 className="w-3.5 h-3.5" />
            {syncing.tiktok ? 'Đang đồng bộ...' : 'TikTok Ads'}
          </button>
          <button onClick={handleSyncInsights} disabled={syncing.insights}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors disabled:opacity-50 text-sm font-medium">
            <BarChart3 className={`w-4 h-4 ${syncing.insights ? 'animate-spin' : ''}`} />
            {syncing.insights ? 'Đang đồng bộ...' : 'Sync Insights (7 ngày)'}
          </button>
        </div>
      </div>

      {/* Aggregated Metrics Dashboard */}
      {!loading && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-semibold text-white">Tổng quan hiệu suất</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <MetricCard label="Tổng chi phí" value={metrics.totalSpend} prefix="$" color="text-red-400" icon={DollarSign} />
            <MetricCard label="Impressions" value={metrics.totalImpressions} color="text-blue-400" icon={Eye} />
            <MetricCard label="Clicks" value={metrics.totalClicks} color="text-cyan-400" icon={MousePointer2} />
            <MetricCard label="Conversions" value={metrics.totalConversions} color="text-green-400" icon={Users} />
            <MetricCard label="CTR" value={metrics.avgCtr} suffix="%" color="text-emerald-400" icon={TrendingUp} />
            <MetricCard label="CPM" value={metrics.avgCpm} prefix="$" color="text-amber-400" icon={EyeOff} />
            <MetricCard label="CPC" value={metrics.avgCpc} prefix="$" color="text-orange-400" icon={Target} />
            <MetricCard label="CPA" value={metrics.avgCpa} prefix="$" color="text-rose-400" icon={ArrowUpDown} />
            <MetricCard label="Campaigns" value={`${metrics.activeCampaigns}/${metrics.campaignCount}`} color="text-purple-400" icon={BarChart3} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4"><p className="text-dark-400 text-sm">Tổng chiến dịch</p><p className="text-2xl font-bold text-white mt-1">{campaigns.length}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-dark-400 text-sm">Đang chạy</p><p className="text-2xl font-bold text-green-400 mt-1">{activeCampaigns.length}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-dark-400 text-sm">Facebook</p><p className="text-2xl font-bold text-blue-400 mt-1">{fbCampaigns.length}</p></div>
        <div className="glass rounded-xl p-4"><p className="text-dark-400 text-sm">TikTok</p><p className="text-2xl font-bold text-purple-400 mt-1">{ttCampaigns.length}</p></div>
      </div>

      {/* Platform filter */}
      <div className="flex items-center gap-2">
        {['all', 'facebook', 'tiktok'].map(p => (
          <button key={p} onClick={() => setPlatformFilter(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              platformFilter === p
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-dark-300 hover:text-white bg-dark-700/30 border border-transparent'
            }`}>{p === 'all' ? 'Tất cả' : p === 'facebook' ? 'Facebook' : 'TikTok'}</button>
        ))}
        {filteredCampaigns.length > 0 && (
          <span className="text-xs text-dark-400 ml-auto">{filteredCampaigns.length} campaigns</span>
        )}
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="skeleton skeleton-circle w-10 h-10" />
              <div className="flex-1 space-y-2"><div className="skeleton h-5 w-48 rounded" /><div className="skeleton h-3 w-32 rounded" /></div>
              <div className="skeleton skeleton-badge" />
            </div>
          </div>
        ))}</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có chiến dịch</h3>
          <p className="text-dark-400 mb-4">Kết nối Facebook Ads API hoặc TikTok Marketing API hoặc tạo thủ công</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => { resetCampaignForm(); setShowCampaignModal(true) }} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />Tạo thủ công</button>
            <button onClick={handleSyncFacebook} className="btn-secondary flex items-center gap-2"><Facebook className="w-4 h-4" />Đồng bộ Facebook</button>
            <button onClick={handleSyncTikTok} className="btn-secondary flex items-center gap-2"><Music2 className="w-4 h-4" />Đồng bộ TikTok</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map(camp => (
            <div key={camp.id} className="glass rounded-2xl p-5 card-hover stagger-item">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${camp.platform === 'facebook' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                    {camp.platform === 'facebook' ? <Facebook className="w-5 h-5 text-blue-400" /> : <Music2 className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium truncate">{camp.name}</h3>
                      <span className={`badge-${camp.status === 'active' ? 'success' : 'warning'}`}>
                        {camp.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5 truncate">
                      {camp.objective || 'No objective'} • {camp.daily_budget ? `$${camp.daily_budget}/day` : '—'}
                      {camp.external_id && <span className="ml-2 text-brand-400">ID: {camp.external_id.slice(0, 12)}...</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  <button onClick={() => setShowInsights(showInsights === camp.id ? null : camp.id)}
                    className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-brand-400 transition-colors" title="Xem insights">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleCampaign(camp)}
                    className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-white transition-colors">
                    {camp.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDeleteCampaign(camp.id)}
                    className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Automated Rules */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-400" />
            Quy tắc tự động
          </h2>
          <button onClick={() => setShowRuleModal(true)} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Thêm quy tắc
          </button>
        </div>
        {rules.length === 0 ? (
          <div className="text-center py-8">
            <PieChart className="w-10 h-10 text-dark-500 mx-auto mb-2" />
            <p className="text-dark-400 text-sm">Chưa có quy tắc tự động nào</p>
            <p className="text-dark-500 text-xs mt-1">{'Ví dụ: Tự động tắt campaign khi CPA > $10 trong 2 giờ'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map(rule => {
              const metricCfg = METRICS.find(m => m.key === rule.metric)
              const Icon = metricCfg?.icon || AlertTriangle
              return (
                <div key={rule.id} className="flex items-center justify-between bg-dark-700/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-brand-400" />
                    <div>
                      <p className="text-sm text-white">{rule.name}</p>
                      <p className="text-xs text-dark-400">
                        Nếu {rule.metric.toUpperCase()} {rule.condition === 'gt' ? '>' : '<'} {rule.threshold}
                        {' → '}{rule.action === 'pause' ? 'Tắt' : rule.action === 'increase_budget' ? 'Tăng budget' : 'Giảm budget'}
                        {rule.time_window && ` (${rule.time_window} phút)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleRule(rule)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${rule.is_active ? 'bg-green-500' : 'bg-dark-600'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="mt-4 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
          <p className="text-xs text-brand-300">
            <strong>💡 Gợi ý:</strong> Thiết lập quy tắc để tự động kiểm soát ngân sách. Ví dụ: Nếu CPA vượt quá $10 trong 2 giờ, tự động tắt chiến dịch.
          </p>
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-lg mx-4 animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">{editingCampaignId ? 'Sửa chiến dịch' : 'Tạo chiến dịch mới'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Nền tảng</label>
                <div className="flex gap-3">
                  {(['facebook', 'tiktok'] as const).map(p => (
                    <button key={p} onClick={() => setCampaignPlatform(p)} disabled={!!editingCampaignId}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        campaignPlatform === p ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-dark-700 border-dark-500 text-dark-300'
                      } ${editingCampaignId ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      {p === 'facebook' ? <Facebook className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}{p === 'facebook' ? 'Facebook' : 'TikTok'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Tên chiến dịch</label>
                <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)}
                  placeholder="VD: Chiến dịch tháng 12" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Mục tiêu</label>
                <select value={campaignObjective} onChange={e => setCampaignObjective(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                  <option value="">Chọn mục tiêu...</option>
                  {OBJECTIVES[campaignPlatform].map(obj => (
                    <option key={obj} value={obj}>{obj.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Ngân sách ngày ($)</label>
                  <input type="number" value={campaignDailyBudget} onChange={e => setCampaignDailyBudget(e.target.value)}
                    placeholder="50" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Trạng thái</label>
                  <select value={campaignStatus} onChange={e => setCampaignStatus(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                    <option value="active">Active</option><option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCampaignModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSaveCampaign} className="btn-primary">{editingCampaignId ? 'Lưu' : 'Tạo chiến dịch'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">Thêm quy tắc tự động</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Tên quy tắc</label>
                <input type="text" value={ruleName} onChange={e => setRuleName(e.target.value)}
                  placeholder="VD: Tắt campaign khi CPA cao" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Chỉ số</label>
                  <select value={ruleMetric} onChange={e => setRuleMetric(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                    {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Điều kiện</label>
                  <select value={ruleCondition} onChange={e => setRuleCondition(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                    <option value="gt">Lớn hơn (&gt;)</option>
                    <option value="gte">Lớn hơn hoặc bằng (&gt;=)</option>
                    <option value="lt">Nhỏ hơn (&lt;)</option>
                    <option value="lte">Nhỏ hơn hoặc bằng (&lt;=)</option>
                    <option value="eq">Bằng (=)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Ngưỡng</label>
                <input type="number" value={ruleThreshold} onChange={e => setRuleThreshold(e.target.value)}
                  placeholder="10" step="0.01" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Hành động</label>
                  <select value={ruleAction} onChange={e => setRuleAction(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white">
                    <option value="pause">Tắt chiến dịch</option>
                    <option value="increase_budget">Tăng ngân sách</option>
                    <option value="decrease_budget">Giảm ngân sách</option>
                    <option value="notify">Thông báo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Khung thời gian (phút)</label>
                  <input type="number" value={ruleTimeWindow} onChange={e => setRuleTimeWindow(e.target.value)}
                    placeholder="60" className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRuleModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={handleSaveRule} className="btn-primary">Thêm quy tắc</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ads
