import React, { useState, useEffect } from 'react'
import {
  Plus, Trash2, Edit2, FileText, Copy, Image as ImageIcon,
  X, ChevronUp, ChevronDown, FolderOpen
} from 'lucide-react'

interface PostContent {
  id: string
  name: string
  template: string
  variables: string
  imagePaths: string[]
  createdAt: string
  updatedAt: string
}

interface Variable {
  name: string
  value: string
}

interface StoredImage {
  filename: string
  originalName: string
  storedPath: string
  size: number
  addedAt: string
}

function Content(): JSX.Element {
  const [contents, setContents] = useState<PostContent[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState<PostContent | null>(null)
  const [contentName, setContentName] = useState('')
  const [template, setTemplate] = useState('')
  const [variables, setVariables] = useState<Variable[]>([])
  const [imagePaths, setImagePaths] = useState<string[]>([])
  const [imageStore, setImageStore] = useState<Map<string, StoredImage>>(new Map())
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [importingImages, setImportingImages] = useState(false)

  useEffect(() => {
    loadContents()
    loadImageStore()
  }, [])

  const loadImageStore = async () => {
    try {
      const images = await window.api.images.list()
      const map = new Map<string, StoredImage>()
      for (const img of images) {
        map.set(img.filename, img)
      }
      setImageStore(map)
    } catch (err) {
      console.error('Failed to load image store:', err)
    }
  }

  const loadContents = async () => {
    try {
      const data = await window.api.content.getAll()
      setContents(data)
    } catch (err) {
      console.error('Failed to load contents:', err)
    } finally {
      setLoading(false)
    }
  }

  // ===== Image Management =====

  const handleBrowseImages = async () => {
    try {
      const selectedPaths = await window.api.images.select()
      if (selectedPaths.length === 0) return

      setImportingImages(true)
      const storedImages = await window.api.images.copyToStorage(selectedPaths)

      if (storedImages.length > 0) {
        const newPaths = storedImages.map(img => img.storedPath)
        setImagePaths(prev => [...prev, ...newPaths])

        // Update image store cache
        const updatedStore = new Map(imageStore)
        for (const img of storedImages) {
          updatedStore.set(img.filename, img)
        }
        setImageStore(updatedStore)
      }

      setImportingImages(false)
    } catch (err) {
      console.error('Failed to browse images:', err)
      setImportingImages(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImagePaths(prev => prev.filter((_, i) => i !== index))
  }

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return
    setImagePaths(prev => {
      const updated = [...prev]
      ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
      return updated
    })
  }

  const handleMoveImageDown = (index: number) => {
    if (index >= imagePaths.length - 1) return
    setImagePaths(prev => {
      const updated = [...prev]
      ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
      return updated
    })
  }

  const getFileName = (filePath: string): string => {
    const parts = filePath.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1]
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ===== Content CRUD =====

  const handleAdd = async () => {
    if (!contentName.trim() || !template.trim()) return
    try {
      await window.api.content.add({
        name: contentName.trim(),
        platform: 'both',
        template: template.trim(),
        spintax: JSON.stringify(variables),
        media_paths: JSON.stringify(imagePaths)
      })
      resetAndClose()
      await loadContents()
    } catch (err) {
      console.error('Failed to add content:', err)
    }
  }

  const handleEdit = async () => {
    if (!editingContent || !contentName.trim() || !template.trim()) return
    try {
      await window.api.content.update(editingContent.id, {
        name: contentName.trim(),
        template: template.trim(),
        spintax: JSON.stringify(variables),
        media_paths: JSON.stringify(imagePaths)
      })
      resetAndClose()
      await loadContents()
    } catch (err) {
      console.error('Failed to update content:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa nội dung này?')) return
    try {
      await window.api.content.delete(id)
      await loadContents()
    } catch (err) {
      console.error('Failed to delete content:', err)
    }
  }

  const openEditModal = async (content: PostContent) => {
    setEditingContent(content)
    setContentName(content.name)
    setTemplate(content.template)
    setVariables(JSON.parse(content.variables || '[]'))
    setImagePaths(content.imagePaths || [])
    generatePreview(content.template, JSON.parse(content.variables || '[]'))
    await loadImageStore()
    setShowModal(true)
  }

  const openAddModal = async () => {
    setEditingContent(null)
    setContentName('')
    setTemplate('')
    setVariables([{ name: '', value: '' }])
    setImagePaths([])
    setPreview('')
    await loadImageStore()
    setShowModal(true)
  }

  const resetAndClose = () => {
    setShowModal(false)
    setEditingContent(null)
    setContentName('')
    setTemplate('')
    setVariables([])
    setImagePaths([])
    setPreview('')
  }

  const addVariable = () => {
    setVariables([...variables, { name: '', value: '' }])
  }

  const updateVariable = (index: number, field: 'name' | 'value', val: string) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], [field]: val }
    setVariables(updated)
    generatePreview(template, updated)
  }

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const generatePreview = (tmpl: string, vars: Variable[]) => {
    let result = tmpl
    for (const v of vars) {
      if (v.name) {
        const escapedName = escapeRegex(v.name)
        result = result.replace(new RegExp(`\\{\\{${escapedName}\\}\\}`, 'g'), v.value || `{{${v.name}}}`)
      }
    }
    setPreview(result)
  }

  const handleTemplateChange = (value: string) => {
    setTemplate(value)
    generatePreview(value, variables)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const variableHints = [
    { name: 'name', desc: 'Tên khách hàng' },
    { name: 'phone', desc: 'Số điện thoại' },
    { name: 'product', desc: 'Tên sản phẩm' },
    { name: 'price', desc: 'Giá sản phẩm' },
    { name: 'today', desc: 'Ngày hiện tại' },
    { name: 'time', desc: 'Giờ hiện tại' }
  ]

  // Pre-made template categories
  const templateSuggestions = [
    {
      name: 'Quảng cáo sản phẩm',
      template: `🔥🔥 SẢN PHẨM CHẤT LƯỢNG - GIÁ TỐT NHẤT THỊ TRƯỜNG 🔥🔥

Chào cả nhà!  Em xin giới thiệu sản phẩm {{product}} mới về.

✨ Đặc điểm nổi bật:
• Chất liệu cao cấp
• Giá chỉ từ {{price}}
• Miễn phí giao hàng

📞 Liên hệ ngay: {{phone}} - gặp {{name}}

#sale #khuyenmai #{{product}}`
    },
    {
      name: 'Dịch vụ',
      template: `📢 DỊCH VỤ CHUYÊN NGHIỆP - UY TÍN HÀNG ĐẦU 📢

Bạn đang cần {{product}}?  Hãy đến với chúng tôi!

✅ Cam kết chất lượng
✅ Giá cả cạnh tranh: {{price}}
✅ Hỗ trợ 24/7

👉 IB ngay hoặc gọi {{phone}} để được tư vấn miễn phí!

#dichvu #{{product}} #uy tin`
    },
    {
      name: 'Tuyển dụng',
      template: `🚀 TUYỂN DỤNG GẤP - {{product}} 🚀

Công ty chúng tôi cần tuyển:

📌 Vị trí: {{product}}
💰 Mức lương: {{price}}
📍 Địa điểm làm việc:...

Yêu cầu:
• Có kinh nghiệm
• Nhiệt tình, trách nhiệm

☎️ Liên hệ: {{phone}} - {{name}}

#tuyendung #vieclam #{{product}}`
    }
  ]

  const insertTemplate = (tmpl: string) => {
    setTemplate(tmpl)
    const varMatches = tmpl.match(/\{\{(\w+)\}\}/g)
    if (varMatches) {
      const uniqueVars = [...new Set(varMatches.map(v => v.replace(/\{|\}/g, '')))]
      const newVars = uniqueVars.map(v => {
        const existing = variables.find(ev => ev.name === v)
        return existing || { name: v, value: '' }
      })
      setVariables(newVars)
    }
    generatePreview(tmpl, variables)
  }

  // File size indicator color
  const getImageSizeColor = (size: number): string => {
    if (size < 500 * 1024) return 'text-green-400'
    if (size < 2 * 1024 * 1024) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nội dung</h1>
          <p className="text-dark-300 mt-1">Tạo mẫu bài đăng quảng cáo với nội dung và hình ảnh</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm nội dung
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="skeleton skeleton-circle w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-40 rounded" />
                    <div className="skeleton h-3 w-24 rounded" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="skeleton skeleton-circle w-8 h-8" />
                  <div className="skeleton skeleton-circle w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : contents.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Chưa có nội dung nào</h3>
          <p className="text-dark-400 mb-4">Tạo mẫu bài đăng với biến động và hình ảnh để tự động hóa nội dung quảng cáo</p>
          <p className="text-dark-500 text-sm mb-6">
            Sử dụng {'{{variable}}'} để tạo nội dung động. Đính kèm nhiều ảnh để bài đăng thêm hấp dẫn!
          </p>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Tạo nội dung đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contents.map((content) => (
            <div key={content.id} className="glass rounded-2xl p-5 card-hover stagger-item">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{content.name}</h3>
                    <p className="text-xs text-dark-400">
                      Cập nhật: {new Date(content.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(content)}
                    className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-brand-400 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(content.id)}
                    className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-dark-300 line-clamp-2 mb-2">{content.template}</p>
              {content.imagePaths && content.imagePaths.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-brand-400">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{content.imagePaths.length} ảnh đính kèm</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="glass rounded-2xl p-6 w-full max-w-4xl mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingContent ? 'Sửa nội dung' : 'Thêm nội dung mới'}
            </h2>

            {/* Template suggestions */}
            {!editingContent && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark-200 mb-3">Mẫu có sẵn</label>
                <div className="flex flex-wrap gap-2">
                  {templateSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => insertTemplate(s.template)}
                      className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-sm hover:bg-brand-500/20 transition-colors border border-brand-500/20"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left side - Content editing */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">Tên mẫu</label>
                  <input
                    type="text"
                    value={contentName}
                    onChange={(e) => setContentName(e.target.value)}
                    placeholder="VD: Quảng cáo tháng 12"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Nội dung mẫu <span className="text-dark-400 font-normal">(dùng {'{{variable}}'} cho nội dung động)</span>
                  </label>
                  <textarea
                    value={template}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    rows={6}
                    placeholder="Viết nội dung bài đăng..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-dark-400 font-mono text-sm resize-y"
                  />
                </div>

                {/* Variables */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-dark-200">Biến động</label>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs text-dark-400">Gợi ý:</span>
                      {variableHints.map((hint) => (
                        <button
                          key={hint.name}
                          onClick={() => {
                            if (!variables.find(v => v.name === hint.name)) {
                              setVariables([...variables, { name: hint.name, value: '' }])
                            }
                          }}
                          className="text-xs px-2 py-0.5 rounded bg-dark-600/50 text-dark-300 hover:text-brand-400 transition-colors"
                        >
                          {'{{'}{hint.name}{'}}'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {variables.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => updateVariable(i, 'name', e.target.value)}
                          placeholder="Tên biến"
                          className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400 font-mono"
                        />
                        <input
                          type="text"
                          value={v.value}
                          onChange={(e) => updateVariable(i, 'value', e.target.value)}
                          placeholder="Giá trị mặc định"
                          className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm placeholder-dark-400"
                        />
                        {variables.length > 1 && (
                          <button
                            onClick={() => removeVariable(i)}
                            className="p-2 rounded-lg hover:bg-dark-600/50 text-dark-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addVariable}
                      className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      + Thêm biến
                    </button>
                  </div>
                </div>

                {/* Preview */}
                {preview && (
                  <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-500">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-dark-200">Xem trước</label>
                      <button
                        onClick={() => copyToClipboard(preview)}
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Sao chép
                      </button>
                    </div>
                    <div className="text-sm text-dark-200 whitespace-pre-wrap font-mono">
                      {preview}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Image Management */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-dark-200">Hình ảnh đính kèm</label>
                    <span className="text-xs text-dark-400">{imagePaths.length} ảnh</span>
                  </div>

                  {/* Browse button */}
                  <button
                    onClick={handleBrowseImages}
                    disabled={importingImages}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-dark-500 hover:border-brand-500/50 text-dark-300 hover:text-brand-400 transition-all bg-dark-700/30 hover:bg-dark-700/50 group"
                  >
                    {importingImages ? (
                      <>
                        <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Đang import ảnh...</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Chọn ảnh từ máy tính</p>
                          <p className="text-xs text-dark-400 mt-0.5">JPG, PNG, GIF, WEBP (chọn nhiều)</p>
                        </div>
                      </>
                    )}
                  </button>

                  {/* Image list */}
                  {imagePaths.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                      {imagePaths.map((imgPath, index) => {
                        const filename = getFileName(imgPath)
                        const storedInfo = Array.from(imageStore.values()).find(
                          s => s.storedPath === imgPath || s.filename === filename
                        )
                        return (
                          <div
                            key={`${imgPath}-${index}`}
                            className="flex items-center gap-3 bg-dark-700/50 rounded-xl p-3 group hover:bg-dark-700/80 transition-colors"
                          >
                            {/* Image thumbnail */}
                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-dark-600">
                              <img
                                src={`file://${imgPath}`}
                                alt={filename}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>

                            {/* Image info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{filename}</p>
                              {storedInfo && (
                                <p className={`text-xs mt-0.5 ${getImageSizeColor(storedInfo.size)}`}>
                                  {formatFileSize(storedInfo.size)}
                                </p>
                              )}
                              <p className="text-xs text-dark-500 mt-0.5">Ảnh {index + 1}</p>
                            </div>

                            {/* Controls - always visible with lower opacity, full on hover */}
                            <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleMoveImageUp(index)}
                                disabled={index === 0}
                                className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Lên trên"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveImageDown(index)}
                                disabled={index >= imagePaths.length - 1}
                                className="p-1.5 rounded-lg hover:bg-dark-600 text-dark-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title="Xuống dưới"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors"
                                title="Xóa ảnh"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {imagePaths.length === 0 && (
                    <div className="mt-3 bg-dark-700/30 rounded-xl p-6 text-center">
                      <ImageIcon className="w-10 h-10 text-dark-500 mx-auto mb-2" />
                      <p className="text-xs text-dark-500">Chưa có ảnh nào được chọn</p>
                      <p className="text-xs text-dark-600 mt-1">Bấm nút trên để thêm ảnh từ máy tính</p>
                    </div>
                  )}
                </div>

                {/* Image tips */}
                <div className="bg-brand-500/5 border border-brand-500/10 rounded-xl p-3">
                  <p className="text-xs text-brand-300 font-medium mb-1">💡 Mẹo đăng ảnh</p>
                  <ul className="text-xs text-dark-400 space-y-1">
                    <li>• Ảnh được lưu trữ local trong app</li>
                    <li>• Kéo thả để sắp xếp thứ tự ưu tiên</li>
                    <li>• Ảnh nhỏ &lt;500KB giúp đăng nhanh hơn</li>
                    <li>• Tối đa 10 ảnh cho mỗi bài đăng</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end border-t border-dark-600/30 pt-4">
              <button onClick={resetAndClose} className="btn-secondary">Hủy</button>
              <button onClick={editingContent ? handleEdit : handleAdd} className="btn-primary">
                {editingContent ? 'Lưu thay đổi' : 'Thêm nội dung'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Content
