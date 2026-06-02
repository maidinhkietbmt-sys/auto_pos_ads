import { safeStorage } from 'electron'

// Marker to identify encrypted strings in the database
const ENC_PREFIX = 'enc:'

/**
 * Kiểm tra xem safeStorage có khả dụng trên hệ thống không
 * - Windows: luôn có (dùng DPAPI)
 * - macOS: luôn có (dùng Keychain)
 * - Linux: cần libsecret
 */
export function isEncryptionAvailable(): boolean {
  return safeStorage.isEncryptionAvailable()
}

/**
 * Mã hóa mật khẩu bằng safeStorage
 * Trả về chuỗi base64 có prefix để nhận biết
 */
export function encryptPassword(plaintext: string): string {
  if (!plaintext) return plaintext
  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(plaintext)
      return ENC_PREFIX + encrypted.toString('base64')
    }
    // Fallback: lưu plaintext nếu safeStorage không khả dụng
    console.warn('[Crypto] safeStorage không khả dụng, lưu mật khẩu dạng plaintext!')
    return plaintext
  } catch (error) {
    console.error('[Crypto] Lỗi mã hóa:', error)
    return plaintext
  }
}

/**
 * Giải mã mật khẩu đã được mã hóa bằng safeStorage
 * Nếu password không có prefix `enc:`, trả về nguyên bản (plaintext cũ)
 */
export function decryptPassword(encrypted: string): string {
  if (!encrypted) return encrypted
  try {
    if (encrypted.startsWith(ENC_PREFIX)) {
      const base64Data = encrypted.slice(ENC_PREFIX.length)
      const buffer = Buffer.from(base64Data, 'base64')
      return safeStorage.decryptString(buffer)
    }
    // Không có prefix → dữ liệu cũ chưa mã hóa
    return encrypted
  } catch (error) {
    console.error('[Crypto] Lỗi giải mã:', error)
    return '' // Trả về chuỗi rỗng thay vì encrypted blob để tránh gửi sai lên Facebook
  }
}

/**
 * Kiểm tra một chuỗi có phải đã được mã hóa không
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith(ENC_PREFIX)
}
