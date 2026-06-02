import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, ExternalLink, Globe, CheckCircle } from 'lucide-react'

interface Group {
  id: string
  name: string
  url: string
  isActive: boolean
  createdAt: string
  lastPostedAt: string | null
}

function Groups(): JSX.Element {
  const [groups, setGroups] = useState<Group[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      const data = await window.api.groups.getAll()
      setGroups(data)
    } catch (err) {
      console.error('Failed to load groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!name.trim() || !url.trim()) return
    try {
      await window.api.groups.add({ platform: 'facebook', name: name.trim(), url: url.trim(), type: 'group', is_active: true })
      setShowModal(false)
      setName('')
      setUrl('')
      await loadGroups()
    } catch (err) {
      console.error('Failed to add group:', err)
    }
  }

  const handleEdit = async () => {
    if (!editingGroup || !name.trim() || !url.trim()) return
    try {
      await window.api.groups.update(editingGroup.id, { name: name.trim(), url: url.trim(), is_active: isActive })
      setEditingGroup(null)
      setShowModal(false)
      setName('')
      setUrl('')
      setIsActive(true)
      await loadGroups()
    } catch (err) {
      console.error('Failed to update group:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nhóm này?')) return
    try {
      await window.api.groups.delete(id)
      await loadGroups()
    } catch (err) {
      console.error('Failed to delete group:', err)
    }
  }

  const openEditModal = (group: Group) => {
    setEditingGroup(group)
    setName(group.name)
    setUrl(group.url)
    setIsActive(group.isActive)
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingGroup(null)
    setName('')
    setUrl('')
    setIsActive(true)
    setShowModal(true)
  }

  const extractGroupId = (url: string): string => {
    const match = url.match(/facebook\.com\/groups\/([^/?]+)/)
    return match ? match[1] : url
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nhóm Facebook</h1>
          <p className="text-dark-300 mt-1">Quản lý các nhóm Facebook sẽ đăng bài</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm nhóm
        </button>
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4">
              <div className="skeleton skeleton-circle w-12 h-12 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-5 w-40 rounded" />
                  <div className="skeleton skeleton-badge" />
                </div>
                <div className="skeleton h-4 w-56 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
              <div className="flex gap-1">
                <div className="skeleton skeleton-circle w-8 h-8" />
                <div className="skeleton skeleton-circle w-8 h-8" />
                <div className="skeleton skeleton-circle w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Globe className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có nhóm nào</h3>
          <p className="text-dark-400 mb-6">Thêm nhóm Facebook để bắt đầu đăng bài tự động</p>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Thêm nhóm đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="glass rounded-2xl p-5 card-hover flex items-center justify-between stagger-item"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                  group.isActive
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-dark-600/50 text-dark-400'
                }`}>
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium truncate">{group.name}</h3>
                    {group.isActive ? (
                      <span className="badge-success text-xs">Hoạt động</span>
                    ) : (
                      <span className="badge-warning text-xs">Tạm dừng</span>
                    )}
                  </div>
                  <p className="text-sm text-dark-400 truncate mt-1">
                    ID: {extractGroupId(group.url)}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">
                    Thêm: {new Date(group.createdAt).toLocaleDateString('vi-VN')}
                    {group.lastPostedAt && ` • Đăng gần nhất: ${new Date(group.lastPostedAt).toLocaleDateString('vi-VN')}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => window.open(group.url, '_blank')}
                  className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-white transition-colors"
                  title="Mở nhóm"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(group)}
                  className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-brand-400 transition-colors"
                  title="Sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-lg mx-4 animate-slide-up">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingGroup ? 'Sửa nhóm' : 'Thêm nhóm mới'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Tên nhóm
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Nhóm Marketing Sài Gòn"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  URL nhóm
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.facebook.com/groups/..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:border-brand-500 transition-colors"
                />
              </div>
              {editingGroup && (
                <label className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsActive(!isActive)}>
                  <div
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isActive ? 'bg-brand-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-dark-200">Kích hoạt</span>
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={editingGroup ? handleEdit : handleAdd}
                className="btn-primary"
              >
                {editingGroup ? 'Lưu thay đổi' : 'Thêm nhóm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Groups
