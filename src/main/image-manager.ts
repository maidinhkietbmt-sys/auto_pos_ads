import { app, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

const IMAGE_DIR = 'facebook-images'

export interface StoredImage {
  filename: string
  originalName: string
  storedPath: string
  size: number
  addedAt: string
}

function getImageStorageDir(): string {
  const dir = path.join(app.getPath('userData'), IMAGE_DIR)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/**
 * Mở hộp thoại chọn ảnh từ máy tính
 * Hỗ trợ chọn nhiều ảnh cùng lúc
 */
export async function selectImages(): Promise<string[]> {
  const result = await dialog.showOpenDialog({
    title: 'Chọn ảnh để đăng',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: 'Hình ảnh',
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']
      }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return []
  }

  return result.filePaths
}

/**
 * Sao chép ảnh vào thư mục lưu trữ local
 * Trả về thông tin ảnh đã lưu
 */
export async function copyImagesToStorage(sourcePaths: string[]): Promise<StoredImage[]> {
  const storageDir = getImageStorageDir()
  const storedImages: StoredImage[] = []

  for (const sourcePath of sourcePaths) {
    try {
      if (!fs.existsSync(sourcePath)) continue

      const ext = path.extname(sourcePath).toLowerCase()
      const originalName = path.basename(sourcePath)
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
      const destPath = path.join(storageDir, filename)

      fs.copyFileSync(sourcePath, destPath)

      const stats = fs.statSync(destPath)
      storedImages.push({
        filename,
        originalName,
        storedPath: destPath,
        size: stats.size,
        addedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error(`Failed to copy image ${sourcePath}:`, err)
    }
  }

  return storedImages
}

/**
 * Xóa ảnh khỏi thư mục lưu trữ
 */
export function deleteStoredImage(filename: string): boolean {
  const storageDir = getImageStorageDir()
  const filePath = path.join(storageDir, filename)

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  } catch (err) {
    console.error(`Failed to delete image ${filename}:`, err)
    return false
  }
}

/**
 * Xóa nhiều ảnh
 */
export function deleteStoredImages(filenames: string[]): void {
  for (const filename of filenames) {
    deleteStoredImage(filename)
  }
}

/**
 * Lấy tất cả ảnh đã lưu
 */
export function listStoredImages(): StoredImage[] {
  const storageDir = getImageStorageDir()

  try {
    const files = fs.readdirSync(storageDir)
    return files
      .filter(f => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f))
      .map(f => {
        const filePath = path.join(storageDir, f)
        try {
          const stats = fs.statSync(filePath)
          return {
            filename: f,
            originalName: f,
            storedPath: filePath,
            size: stats.size,
            addedAt: stats.birthtime.toISOString()
          }
        } catch {
          return null
        }
      })
      .filter((img): img is StoredImage => img !== null)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
  } catch {
    return []
  }
}

/**
 * Lấy kích thước ảnh dạng readable (VD: 1.5 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Kiểm tra định dạng ảnh có hợp lệ không
 */
export function isValidImageExtension(ext: string): boolean {
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext.toLowerCase())
}
