import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  DollarSign,
  Eye,
  MousePointer2,
  Target
} from 'lucide-react'

interface Stats {
  totalPosts: number
  totalGroups: number
  activeSchedules: number
  totalAccounts: number
}

interface TodayStats {
  success: number
  failed: number
  total: number
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

function Dashboard(): JSX.Element {
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalGroups: 0, activeSchedules: 0, totalAccounts: 0 })
  const [todayStats, setTodayStats] = useState<TodayStats>({ success: 0, failed: 0, total: 0 })
  const [adsMetrics, setAdsMetrics] = useState<AggregatedMetrics>({
    totalImpressions: 0, totalClicks: 0, totalSpend: 0, totalConversions: 0,
    avgCpm: 0, avgCtr: 0, avgCpc: 0, avgCpa: 0, campaignCount: 0, activeCampaigns: 0
  })
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [overall, today, hist, scheds, metrics] = await Promise.all([
        window.api.history.getOverallStats(),
        window.api.history.getTodayStats(),
        window.api.history.getAll(10),
        window.api.schedules.getAll(),
        window.api.ads.getAggregatedMetrics().catch(() => null)
      ])
      setStats(overall)
      setTodayStats(today)
      setRecentPosts(hist)
      setSchedules(scheds)
      if (metrics) setAdsMetrics(metrics)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const successRate = todayStats.total > 0
    ? Math.round((todayStats.success / todayStats.total) * 100)
    : 0

  const hasAdData = adsMetrics.campaignCount > 0

  const iconColors: Record<string, string> = {
    'Tổng bài đã đăng': 'text-brand-400',
    'Nhóm Facebook': 'text-blue-400',
    'Lịch đang chạy': 'text-emerald-400',
    'Tỉ lệ thành công': 'text-amber-400'
  }

  const statCards = [
    { title: 'Tổng bài đã đăng', value: stats.totalPosts, icon: BarChart3, color: 'from-brand-500 to-brand-600', bgColor: 'bg-brand-500/10' },
    { title: 'Nhóm Facebook', value: stats.totalGroups, icon: Users, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/10' },
    { title: 'Lịch đang chạy', value: stats.activeSchedules, icon: CalendarCheck, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-500/10' },
    { title: 'Tỉ lệ thành công', value: todayStats.total > 0 ? `${successRate}%` : '0%', icon: TrendingUp, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-500/10' }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-300 mt-1">Tổng quan hoạt động đăng bài & quảng cáo</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-2xl p-5 stagger-item">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-8 w-20 rounded mt-3" />
              </div>
              <div className="skeleton skeleton-circle w-12 h-12" />
            </div>
          </div>
        )) : statCards.map((card) => (
          <div key={card.title} className="glass rounded-2xl p-5 card-hover stagger-item">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-300 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${iconColors[card.title] || 'text-brand-400'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ads Performance Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-400" />
            Hiệu suất quảng cáo
          </h2>
          {hasAdData && (
            <span className="text-xs text-dark-400">
              {adsMetrics.activeCampaigns}/{adsMetrics.campaignCount} campaigns active
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-dark-700/50 rounded-xl p-4">
                <div className="skeleton h-3 w-16 rounded mb-2" />
                <div className="skeleton h-6 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : !hasAdData ? (
          <div className="text-center py-6">
            <Eye className="w-10 h-10 text-dark-500 mx-auto mb-2" />
            <p className="text-dark-400 text-sm">Chưa có dữ liệu quảng cáo</p>
            <p className="text-dark-500 text-xs mt-1">Đồng bộ chiến dịch từ Facebook/TikTok Ads hoặc tạo chiến dịch mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">Spend</p>
              <p className="text-lg font-bold text-red-400 mt-1">${adsMetrics.totalSpend.toFixed(2)}</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">Impressions</p>
              <p className="text-lg font-bold text-blue-400 mt-1">{adsMetrics.totalImpressions.toLocaleString()}</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">Clicks</p>
              <p className="text-lg font-bold text-cyan-400 mt-1">{adsMetrics.totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">CTR</p>
              <p className="text-lg font-bold text-green-400 mt-1">{adsMetrics.avgCtr.toFixed(2)}%</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">CPM</p>
              <p className="text-lg font-bold text-amber-400 mt-1">${adsMetrics.avgCpm.toFixed(2)}</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">CPC</p>
              <p className="text-lg font-bold text-orange-400 mt-1">${adsMetrics.avgCpc.toFixed(2)}</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">CPA</p>
              <p className="text-lg font-bold text-rose-400 mt-1">${adsMetrics.avgCpa.toFixed(2)}</p>
            </div>
            <div className="bg-dark-700/30 rounded-xl p-3 text-center">
              <p className="text-dark-400 text-[10px] uppercase tracking-wider">Conversions</p>
              <p className="text-lg font-bold text-purple-400 mt-1">{adsMetrics.totalConversions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Stats */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-brand-400" />
          Thống kê hôm nay
        </h2>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-700/50 rounded-xl p-4">
                <div className="flex justify-center mb-2"><div className="skeleton skeleton-circle w-6 h-6" /></div>
                <div className="skeleton h-4 w-16 rounded mx-auto mb-2" />
                <div className="skeleton h-8 w-12 rounded mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Thành công</span>
              </div>
              <p className="text-2xl font-bold text-white">{todayStats.success}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Thất bại</span>
              </div>
              <p className="text-2xl font-bold text-white">{todayStats.failed}</p>
            </div>
            <div className="bg-dark-700/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-brand-400" />
                <span className="text-brand-400 font-medium">Tỉ lệ</span>
              </div>
              <p className="text-2xl font-bold text-white">{successRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Bài đăng gần đây</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 space-y-2"><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-3 w-2/3 rounded" /></div>
                  <div className="skeleton skeleton-badge" />
                </div>
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-8 text-dark-400"><p>Chưa có bài đăng nào</p></div>
          ) : (
            <div className="space-y-3">
              {recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between bg-dark-700/30 rounded-xl p-3 card-hover">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{post.content?.slice(0, 80)}...</p>
                    <p className="text-xs text-dark-400 mt-1">
                      {post.groupName} • {new Date(post.postedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${post.status === 'success' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {post.status === 'success' ? 'OK' : 'Lỗi'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Lịch trình đang hoạt động</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2 flex-1 mr-3"><div className="skeleton h-4 w-40 rounded" /><div className="skeleton h-3 w-24 rounded" /></div>
                  <div className="skeleton skeleton-badge" />
                </div>
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-dark-400"><p>Chưa có lịch đăng bài nào</p></div>
          ) : (
            <div className="space-y-3">
              {schedules.filter(s => s.isActive).slice(0, 5).map((sched) => (
                <div key={sched.id} className="flex items-center justify-between bg-dark-700/30 rounded-xl p-3 card-hover">
                  <div>
                    <p className="text-sm font-medium text-white">{sched.name}</p>
                    <p className="text-xs text-dark-400 mt-1">Cron: {sched.cronExpression}</p>
                  </div>
                  <span className="badge-success">Đang chạy</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
