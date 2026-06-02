# 🚀 Social Media Auto Poster & Ads Manager

**Công cụ tự động đăng bài và quản lý quảng cáo đa nền tảng**  
Hỗ trợ Facebook Groups & TikTok — với Playwright automation, SQLite database, và human-behavior simulation engine chống phát hiện.

---

## 📸 Tổng quan

Ứng dụng desktop (Electron) giúp bạn:

- **Tự động đăng bài** lên Facebook Groups và TikTok theo lịch trình
- **Quản lý quảng cáo** Facebook Ads & TikTok Marketing API
- **Chống phát hiện** với human-behavior simulation (gõ phím giống người, di chuyển chuột bezier, cuộn trang theo profile)
- **Quản lý tài khoản** Facebook & TikTok, proxy, và session
- **Theo dõi hiệu suất** Dashboard, lịch sử, log real-time

---

## ✨ Tính năng chính

### 🤖 **Tự động đăng bài (Automation)**
- **Facebook Groups**: Đăng bài lên nhiều nhóm cùng lúc, upload ảnh, spintax content
- **TikTok**: Đăng video/ảnh qua API Content Posting và Playwright browser automation
- **Scheduler**: Lên lịch cron job, tự động đăng theo thời gian thực
- **Human-like behavior**: Gõ phím có tốc độ thay đổi, di chuột đường cong bezier, cuộn trang theo profile (reader/skimmer/scroller)

### 📊 **Quản lý quảng cáo (Ads Manager)**
- **Facebook Ads**: Đồng bộ campaigns, insights (CPM, CTR, CPC, CPA) qua Graph API
- **TikTok Ads**: Đồng bộ campaigns, reports qua Marketing API
- **Automated Rules**: Tự động tắt/tăng/giảm ngân sách khi CPA/CPM vượt ngưỡng
- **Export CSV**: Xuất báo cáo chiến dịch

### 👤 **Quản lý tài khoản**
- **Facebook**: Via, Clone, BM, Fanpage — hỗ trợ cookie và access token
- **TikTok**: Personal, Agency, Business — hỗ trợ OAuth 2.0
- **Proxy**: HTTP/HTTPS/SOCKS5 gán cho từng tài khoản
- **Session**: Lưu và restore session Facebook & TikTok (tránh đăng nhập lại)

### 🛡️ **Chống phát hiện (Anti-Detection)**
- **Stealth browser args**: 14+ flags chống phát hiện automation
- **Random User-Agent**: Pool 7+ User-Agent luân phiên
- **Human-like typing**: Tốc độ gõ ngẫu nhiên, typo simulation, pause sau ký tự đặc biệt
- **Mouse movement**: Đường cong bezier ease-in/ease-out, overshoot
- **Scrolling profiles**: Reader (chậm), Skimmer (nhanh), Scroller (liên tục)
- **Session timing**: Tự động phát hiện khung giờ hoạt động, thêm delay ngoài giờ

---

## 🏗️ Kiến trúc

```
src/
├── main/                         # Electron main process
│   ├── index.ts                  # Entry point, app lifecycle
│   ├── database/                 # SQLite database layer
│   │   ├── schema.ts             # 13 tables schema
│   │   ├── index.ts              # DB connection, migration, activity log
│   │   ├── accounts.ts           # Account CRUD
│   │   ├── contents.ts           # Content templates CRUD
│   │   ├── groups.ts             # Groups CRUD
│   │   ├── schedules.ts          # Schedules CRUD
│   │   ├── history.ts            # Post history + stats
│   │   ├── campaigns.ts          # Ad campaigns CRUD
│   │   └── settings.ts           # Key-value settings + encryption
│   ├── ipc/                      # IPC handlers
│   │   ├── index.ts              # Register all handlers
│   │   ├── accounts.ipc.ts       # Account IPC
│   │   ├── database.ipc.ts       # Content/Groups/Schedules/History IPC
│   │   └── services.ipc.ts       # Facebook/TikTok/Ads/Scheduler IPC
│   ├── scheduler/                # Cron scheduler
│   │   └── index.ts              # Schedule posting with human-like delays
│   ├── services/                 # Core services
│   │   ├── human-behavior.ts     # Centralized anti-detection engine
│   │   ├── facebook/
│   │   │   ├── index.ts
│   │   │   ├── ads.ts            # Facebook Ads API (Graph API)
│   │   │   └── ...               # (future: poster, auth)
│   │   ├── tiktok/
│   │   │   ├── auth.ts           # TikTok OAuth + Playwright login
│   │   │   ├── poster.ts         # TikTok Content Posting API + Browser
│   │   │   ├── marketing-api.ts  # TikTok Marketing API
│   │   │   └── index.ts          # Barrel exports
│   │   └── ads-sync.ts           # Unified sync engine (FB + TikTok)
│   └── facebook-poster.ts        # Facebook Playwright automation
├── preload/
│   └── index.ts                  # contextBridge API
└── renderer/                     # React UI
    └── src/
        ├── App.tsx               # Routes, ErrorBoundary, connection status
        ├── components/
        │   ├── Sidebar.tsx       # Navigation, platform & connection status
        │   ├── ActivityLog.tsx   # Real-time log drawer
        │   └── ErrorBoundary.tsx # Graceful error handling
        ├── pages/
        │   ├── Dashboard.tsx     # Overview stats, ads metrics
        │   ├── Accounts.tsx      # Account & proxy management
        │   ├── Groups.tsx        # Facebook Groups management
        │   ├── Content.tsx       # Content templates with spintax
        │   ├── Schedule.tsx      # Cron schedule management
        │   ├── Ads.tsx           # Ad campaigns + automated rules
        │   ├── History.tsx       # Post history viewer
        │   ├── Logs.tsx          # Activity logs with filter
        │   └── Settings.tsx      # Facebook login, app config
        ├── stores/
        │   ├── ThemeContext.tsx   # Dark/Light mode
        │   └── LogStore.ts       # Real-time log state
        └── utils/
            └── safeApi.ts        # Fallback API handlers
```

---

## 🛠️ Cài đặt

### Yêu cầu hệ thống

- **Node.js** 18+
- **npm** 9+
- **Python** 3.x (cho native module rebuild)
- **Git**

### Các bước cài đặt

```bash
# 1. Clone repository
git clone https://github.com/maidinhkietbmt-sys/auto_pos_ads.git
cd auto_pos_ads

# 2. Cài dependencies
npm install

# 3. Cài Playwright browser (chọn Chromium)
npx playwright install chromium

# 4. Rebuild native modules cho Electron
npm run postinstall
# hoặc: npx electron-rebuild -f -w better-sqlite3

# 5. Chạy development
npm run dev
```

Sau khi chạy `npm run dev`, cửa sổ Electron sẽ tự động mở.

---

## 📖 Hướng dẫn sử dụng

### 1. Đăng nhập Facebook

1. Vào tab **Cài đặt** (Settings)
2. Nhập Email và Password Facebook
3. Bấm **Đăng nhập Facebook**
4. Trình duyệt Playwright sẽ tự động đăng nhập và lưu session

### 2. Thêm tài khoản

1. Vào tab **Tài khoản** (Accounts)
2. Bấm **Thêm tài khoản** — chọn Facebook hoặc TikTok
3. Chọn loại: Via / Clone / BM (FB) hoặc Personal / Agency / Business (TT)
4. Nhập thông tin đăng nhập, access token (nếu có)
5. Gán proxy (tùy chọn)

### 3. Thêm Groups

1. Vào tab **Groups / Pages**
2. Bấm **Thêm nhóm**
3. Nhập tên nhóm và URL Facebook Groups

### 4. Tạo nội dung

1. Vào tab **Nội dung** (Content)
2. Bấm **Thêm nội dung**
3. Viết template với biến động `{{variable}}`
4. Đính kèm hình ảnh (tùy chọn)
5. Dùng spintax: `{lựa chọn 1|lựa chọn 2|lựa chọn 3}`

### 5. Lên lịch đăng bài

1. Vào tab **Lịch đăng** (Schedule)
2. Bấm **Tạo lịch mới**
3. Chọn nội dung, nhóm đích, và biểu thức cron
4. Lịch sẽ tự động chạy theo thời gian đã đặt

**Một số mẫu cron phổ biến:**
| Lịch | Biểu thức |
|------|-----------|
| Mỗi 6 giờ | `0 */6 * * *` |
| Mỗi 4 giờ | `0 */4 * * *` |
| 8h sáng & 8h tối | `0 8,20 * * *` |
| Mỗi ngày 3 lần | `0 8,14,20 * * *` |
| Thứ 2 đến thứ 6 - 8h | `0 8 * * 1-5` |

### 6. Quản lý quảng cáo

1. Vào tab **Quảng cáo** (Ads)
2. Bấm **Đồng bộ Facebook Ads** hoặc **Đồng bộ TikTok Ads**
3. Hệ thống sẽ tự động fetch campaigns từ API
4. Bấm **Sync Insights (7 ngày)** để cập nhật metrics
5. Tạo **Quy tắc tự động** để tự động quản lý ngân sách

### 7. Dashboard

Dashboard hiển thị:
- **Tổng quan**: Bài đã đăng, nhóm, lịch đang chạy, tỉ lệ thành công
- **Hiệu suất quảng cáo**: Spend, Impressions, Clicks, CTR, CPM, CPC, CPA, Conversions
- **Bài đăng gần đây**: 5 bài mới nhất
- **Lịch trình đang hoạt động**: Các cron job đang chạy

---

## ⚙️ Cấu hình

### Database

SQLite được lưu tại:
- **Windows**: `%APPDATA%/facebook-auto-poster/`
- **macOS**: `~/Library/Application Support/facebook-auto-poster/`
- **Linux**: `~/.config/facebook-auto-poster/`

### Mã hóa mật khẩu

- **Windows**: DPAPI
- **macOS**: Keychain
- **Linux**: libsecret

Nếu safeStorage không khả dụng, mật khẩu được lưu dạng plaintext.

### Environment Variables

Tạo file `.env` trong thư mục gốc:
```env
# Facebook Ads
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# TikTok API
TIKTOK_CLIENT_KEY=your_client_key
TIKTOK_CLIENT_SECRET=your_client_secret
```

---

## 🧠 Human-Behavior Engine

Module `human-behavior.ts` cung cấp các cơ chế chống phát hiện tập trung:

| Tính năng | Mô tả |
|-----------|-------|
| **Typing profiles** | slow, normal, fast, programmer — tốc độ gõ khác nhau |
| **Typo simulation** | Gõ sai → backspace → gõ lại (2% rate) |
| **Mouse bezier curves** | Di chuyển chuột theo đường cong với ease-in/ease-out |
| **Mouse arc movement** | Di chuột hình vòng cung (với tay đến nút) |
| **Scroll profiles** | reader (chậm), skimmer (nhanh), scroller (liên tục) |
| **Stealth browser args** | 14+ flags ẩn automation |
| **Random User-Agent** | Pool 7+ UA, random mỗi lần |
| **Random Viewport** | 7 kích thước màn hình phổ biến |
| **Geolocation config** | Hỗ trợ VN, US, UK, SG, JP, KR, AU, DE, FR |
| **Session timing** | Weighted random khung giờ hoạt động |
| **Idle activities** | Di chuột ngẫu nhiên, cuộn vô định |

---

## 🔧 Phát triển

### Scripts

```bash
npm run dev              # Chạy development mode
npm run build            # Build production
npm run preview          # Preview bản build
npm run postinstall      # Rebuild native modules
npx playwright install   # Cài Playwright browsers
npx tsc --noEmit         # TypeScript check
```

### Cấu trúc database

13 tables SQLite:
- `accounts` — Tài khoản FB & TikTok
- `proxies` — Proxy server
- `contents` — Content templates
- `groups` — Facebook Groups
- `schedules` — Cron schedules
- `post_history` — Lịch sử đăng bài
- `ad_campaigns` — Chiến dịch quảng cáo
- `ad_insights` — Metrics insights
- `ad_automated_rules` — Quy tắc tự động
- `activity_logs` — Log hoạt động
- `settings` — Key-value settings
- `sessions` — Session cache
- `media_cache` — Media file cache

---

## 🐛 Xử lý lỗi thường gặp

### "better-sqlite3 native module mismatch"

```bash
cd auto_pos_ads
npx electron-rebuild -f -w better-sqlite3
# hoặc:
npm run postinstall
```

### "Playwright browser not found"

```bash
npx playwright install chromium
```

### "Cannot find module 'better-sqlite3'"

```bash
npm install better-sqlite3 @types/better-sqlite3
```

---

## 📜 License

MIT License — bạn có thể tự do sử dụng, chỉnh sửa và phân phối.

---

## 📞 Hỗ trợ

Tạo issue trên GitHub: [https://github.com/maidinhkietbmt-sys/auto_pos_ads/issues](https://github.com/maidinhkietbmt-sys/auto_pos_ads/issues)

---

*Built with Electron, React, TypeScript, Playwright, and SQLite*
