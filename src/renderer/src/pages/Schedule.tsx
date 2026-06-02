import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, CalendarClock, Play, Square, Info } from 'lucide-react'

interface Schedule {
  id: string
  name: string
  contentId: string
  groupIds: string
  cronExpression: string
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  contentName?: string
}

interface Group {
  id: string
  name: string
  url: string
  isActive: boolean
}

function Schedule(): JSX.Element {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [contents, setContents] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [name, setName] = useState('')
  const [selectedContentId, setSelectedContentId] = useState('')
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [cronExpression, setCronExpression] = useState('0 */6 * * *')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [scheds, grps, cnts] = await Promise.all([
        window.api.schedules.getAll(),
        window.api.groups.getAll(),
        window.api.content.getAll()
      ])
      setSchedules(scheds)
      setGroups(grps)
      setContents(cnts)
    } catch (err) {
      console.error('Failed to load schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTodayDate = () => new Date().toISOString().split('T')[0]

  const handleAdd = async () => {
    if (!name.trim() || !selectedContentId || selectedGroupIds.length === 0) return
    try {
      await window.api.schedules.add({
        name: name.trim(),
        platform: 'both',
        content_id: selectedContentId,
        account_ids: '[]',
        group_ids: JSON.stringify(selectedGroupIds),
        cron_expression: cronExpression,
        is_active: true,
        start_date: startDate || getTodayDate(),
        end_date: endDate || null
      })
      resetAndClose()
      await loadData()
    } catch (err) {
      console.error('Failed to add schedule:', err)
    }
  }

  const handleEdit = async () => {
    if (!editingSchedule || !name.trim() || !selectedContentId || selectedGroupIds.length === 0) return
    try {
      await window.api.schedules.update(editingSchedule.id, {
        name: name.trim(),
        content_id: selectedContentId,
        group_ids: JSON.stringify(selectedGroupIds),
        cron_expression: cronExpression,
        is_active: isActive,
        start_date: startDate || getTodayDate(),
        end_date: endDate || null
      })
      resetAndClose()
      await loadData()
    } catch (err) {
      console.error('Failed to update schedule:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lịch này?')) return
    try {
      await window.api.schedules.delete(id)
      await loadData()
    } catch (err) {
      console.error('Failed to delete schedule:', err)
    }
  }

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setName(schedule.name)
    setSelectedContentId(schedule.contentId)
    setSelectedGroupIds(JSON.parse(schedule.groupIds))
    setCronExpression(schedule.cronExpression)
    setStartDate(schedule.startDate.split('T')[0])
    setEndDate(schedule.endDate ? schedule.endDate.split('T')[0] : '')
    setIsActive(schedule.isActive)
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingSchedule(null)
    setName('')
    setSelectedContentId('')
    setSelectedGroupIds([])
    setCronExpression('0 */6 * * *')
    setStartDate(getTodayDate())
    setEndDate('')
    setIsActive(true)
    setShowModal(true)
  }

  const resetAndClose = () => {
    setShowModal(false)
    setEditingSchedule(null)
  }

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const cronPresets = [
    { label: 'Mỗi 6 giờ', value: '0 */6 * * *' },
    { label: 'Mỗi 4 giờ', value: '0 */4 * * *' },
    { label: 'Mỗi 2 giờ', value: '0 */2 * * *' },
    { label: 'Mỗi giờ', value: '0 * * * *' },
    { label: '6h sáng hàng ngày', value: '0 6 * * *' },
    { label: '8h sáng & 8h tối', value: '0 8,20 * * *' },
    { label: 'Mỗi ngày 3 lần', value: '0 8,14,20 * * *' },
    { label: 'Thứ 2 đến thứ 6 - 8h', value: '0 8 * * 1-5' }
  ]

  const getGroupName = (groupId: string): string => {
    const group = groups.find(g => g.id === groupId)
    return group?.name || 'Unknown'
  }

  const getContentName = (contentId: string): string => {
    const content = contents.find(c => c.id === contentId)
    return content?.name || 'Unknown'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lịch đăng bài</h1>
          <p className="text-dark-300 mt-1">Lên lịch đăng bài tự động theo thời gian thực</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tạo lịch mới
        </button>
      </div>

      {/* Cron Info */}
      <div className="glass rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-dark-200">
            Biểu thức Cron được dùng để lên lịch đăng bài. Ví dụ: <code className="text-brand-400 bg-dark-700 px-2 py-0.5 rounded text-xs">0 */6 * * *</code> = mỗi 6 giờ.
            {' '}<span className="text-dark-400">Hệ thống sẽ tự động đăng bài theo lịch đã đặt.</span>
          </p>
        </div>
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="skeleton skeleton-circle w-10 h-10" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-48 rounded" />
                    <div className="skeleton h-3 w-28 rounded" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="skeleton skeleton-circle w-8 h-8" />
                  <div className="skeleton skeleton-circle w-8 h-8" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-3 w-12 rounded" />
                  <div className="skeleton h-4 w-20 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="skeleton h-3 w-12 rounded" />
                  <div className="flex gap-1">
                    <div className="skeleton h-5 w-14 rounded-full" />
                    <div className="skeleton h-5 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <CalendarClock className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có lịch trình</h3>
          <p className="text-dark-400 mb-6">Tạo lịch đăng bài để tự động hóa việc đăng bài</p>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2 mx-auto">
            <CalendarClock className="w-4 h-4" />
            Tạo lịch đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const groupIdList = JSON.parse(schedule.groupIds)
            return (
              <div
                key={schedule.id}
                className="glass rounded-2xl p-5 card-hover stagger-item"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      schedule.isActive ? 'bg-green-500/20' : 'bg-dark-600/50'
                    }`}>
                      <CalendarClock className={`w-5 h-5 ${
                        schedule.isActive ? 'text-green-400' : 'text-dark-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{schedule.name}</h3>
                        {schedule.isActive ? (
                          <span className="badge-success">Đang chạy</span>
                        ) : (
                          <span className="badge-warning">Tạm dừng</span>
                        )}
                      </div>
                      <p className="text-xs text-dark-400 mt-1">
                        Tạo: {new Date(schedule.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-brand-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-dark-400">Nội dung:</span>
                    <p className="text-white mt-1">{getContentName(schedule.contentId)}</p>
                  </div>
                  <div>
                    <span className="text-dark-400">Lịch (Cron):</span>
                    <p className="text-white mt-1 font-mono text-xs">{schedule.cronExpression}</p>
                  </div>
                  <div>
                    <span className="text-dark-400">Nhóm ({groupIdList.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {groupIdList.slice(0, 3).map((gid: string) => (
                        <span key={gid} className="text-xs px-2 py-0.5 rounded bg-dark-600/50 text-dark-200">
                          {getGroupName(gid)}
                        </span>
                      ))}
                      {groupIdList.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-dark-600/50 text-brand-400">
                          +{groupIdList.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingSchedule ? 'Sửa lịch' : 'Tạo lịch mới'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Tên lịch</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Đăng quảng cáo buổi sáng"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Nội dung</label>
                <select
                  value={selectedContentId}
                  onChange={(e) => setSelectedContentId(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Chọn nội dung...</option>
                  {contents.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Nhóm đăng bài</label>
                <div className="bg-dark-700/50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                  {groups.length === 0 ? (
                    <p className="text-dark-400 text-sm text-center py-4">Chưa có nhóm nào. Thêm nhóm trước!</p>
                  ) : (
                    groups.map((group) => (
                      <label key={group.id} className="flex items-center gap-3 cursor-pointer hover:bg-dark-600/30 rounded-lg px-3 py-2 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedGroupIds.includes(group.id)}
                          onChange={() => toggleGroupSelection(group.id)}
                          className="w-4 h-4 rounded border-dark-400 bg-dark-600 text-brand-500 focus:ring-brand-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-white">{group.name}</p>
                          <p className="text-xs text-dark-400">{group.isActive ? 'Hoạt động' : 'Tạm dừng'}</p>
                        </div>
                        {selectedGroupIds.includes(group.id) && (
                          <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded">Đã chọn</span>
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">Biểu thức Cron</label>
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 */6 * * *"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400 font-mono"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {cronPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setCronExpression(preset.value)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                        cronExpression === preset.value
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                          : 'bg-dark-700 border-dark-500 text-dark-300 hover:border-dark-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Ngày kết thúc (tùy chọn)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white"
                  />
                </div>
              </div>

              {editingSchedule && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isActive ? 'bg-brand-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-dark-200">Kích hoạt lịch</span>
                </label>
              )}
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Hủy</button>
              <button onClick={editingSchedule ? handleEdit : handleAdd} className="btn-primary">
                {editingSchedule ? 'Lưu thay đổi' : 'Tạo lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule
