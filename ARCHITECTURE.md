# Social Media Auto Poster & Ads Manager

> Ứng dụng Desktop tự động hóa đăng bài và quản lý quảng cáo trên Facebook & TikTok

## 1. KIẾN TRÚC TỔNG THỂ (ARCHITECTURE OVERVIEW)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ELECTRON SHELL (Main Process)                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     CORE SERVICES LAYER                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │ │
│  │  │  Database     │  │  Scheduler   │  │  Logging & Events    │  │ │
│  │  │  (better-     │  │  (node-cron) │  │  (EventEmitter)     │  │ │
│  │  │   sqlite3)    │  │              │  │                      │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │ │
│  │         │                 │                      │               │ │
│  │  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │ │
│  │  │                   IPC HANDLERS LAYER                       │  │ │
│  │  │  (ipcMain.handle → channels for renderer)                  │  │ │
│  │  └──────────────────────────┬────────────────────────────────┘  │ │
│  │                             │                                    │ │
│  │  ┌──────────────────────────┴────────────────────────────────┐  │ │
│  │  │               AUTOMATION SERVICES LAYER                    │  │ │
│  │  │  ┌──────────────────┐  ┌──────────────────┐               │  │ │
│  │  │  │  Facebook Engine  │  │  TikTok Engine   │               │  │ │
│  │  │  │  ├─ Poster        │  │  ├─ Poster        │               │  │ │
│  │  │  │  ├─ Ads API       │  │  ├─ Ads API       │               │  │ │
│  │  │  │  ├─ Auth/Anti-    │  │  ├─ Auth/Anti-    │               │  │ │
│  │  │  │  │  detection     │  │  │  detection     │               │  │ │
│  │  │  │  └─ Browser       │  │  └─ Browser       │               │  │ │
│  │  │  │     Profile Mgr   │  │     Profile Mgr   │               │  │ │
│  │  │  └──────────────────┘  └──────────────────┘               │  │ │
│  │  │  ┌──────────────────┐  ┌──────────────────┐               │  │ │
│  │  │  │  Spintax Engine  │  │  Human Behavior  │               │  │ │
│  │  │  │  (text variant)  │  │  (random delays, │               │  │ │
│  │  │  │                  │  │   mouse moves)   │               │  │ │
│  │  │  └──────────────────┘  └──────────────────┘               │  │ │
│  │  │  ┌──────────────────┐  ┌──────────────────┐               │  │ │
│  │  │  │  Proxy Manager   │  │  Automated Rules │               │  │ │
│  │  │  │  (HTTP/SOCKS5)   │  │  (ads budget     │               │  │ │
│  │  │  │                  │  │   control)       │               │  │ │
│  │  │  └──────────────────┘  └──────────────────┘               │  │ │
│  │  └───────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                  │
│  ┌─────────────────────────────────┴────────────────────────────────┐ │
│  │              PRELOAD (contextBridge)                              │ │
│  │              (window.api exposed to renderer)                     │ │
│  └─────────────────────────────────┬────────────────────────────────┘ │
└────────────────────────────────────┼──────────────────────────────────┘
                                     │
┌────────────────────────────────────┼──────────────────────────────────┐
│              RENDERER PROCESS      │                                  │
│  ┌─────────────────────────────────┴────────────────────────────────┐ │
│  │                    REACT APP (SPA)                                │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │   Layout: Sidebar + Main Content + Activity Log Drawer      │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │ │
│  │  │Dashboard  │ │Accounts  │ │Content   │ │ Schedule          │  │ │
│  │  │- Stats    │ │- FB list │ │- Editor  │ │- Cron config      │  │ │
│  │  │- Charts   │ │- TT list │ │- Spintax │ │- Calendar view     │  │ │
│  │  │- Activity │ │- Proxy   │ │- Media   │ │- Queue            │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │ │
│  │  │Ads       │ │Groups    │ │History   │ │ Settings           │  │ │
│  │  │- Campaign│ │- FB Grp  │ │- Posts   │ │- Config           │  │ │
│  │  │- Adset   │ │- TT Grp  │ │- Ads     │ │- Proxy            │  │ │
│  │  │- Reports │ │          │ │- Filters │ │- Encryption       │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Desktop Shell** | Electron 33 | Cross-platform desktop app |
| **Frontend** | React 18 + TypeScript | UI components & state |
| **Styling** | Tailwind CSS 3 | Utility-first styling |
| **Icons** | Lucide React | UI icon set |
| **Routing** | React Router 7 | Client-side routing |
| **Database** | better-sqlite3 | Local SQLite storage |
| **Browser Auto** | Playwright | Browser automation |
| **Scheduling** | node-cron | Cron-based job scheduling |
| **Encryption** | Electron safeStorage | OS-level password encryption |
| **Bundling** | electron-vite | Fast dev/build |
| **State** | zustand (optional) | Lightweight state mgmt |

## 3. CẤU TRÚC THƯ MỤC (FOLDER STRUCTURE)

```
facebook-auto-poster/
├── package.json
├── electron.vite.config.ts
├── tailwind.config.js
├── tsconfig.json / tsconfig.node.json / tsconfig.web.json
├── ARCHITECTURE.md
│
├── src/
│   ├── main/                              # Electron Main Process
│   │   ├── index.ts                       # App entry, window creation
│   │   ├── database/                      # Database Layer
│   │   │   ├── index.ts                   # DB init, connection, migrations
│   │   │   ├── schema.ts                  # SQL table definitions
│   │   │   ├── accounts.ts                # Account CRUD (FB + TikTok)
│   │   │   ├── contents.ts                # Content templates CRUD
│   │   │   ├── groups.ts                  # Groups CRUD (FB groups / TT)
│   │   │   ├── schedules.ts               # Schedules CRUD
│   │   │   ├── history.ts                 # Post/ad history CRUD
│   │   │   ├── campaigns.ts              # Ad campaigns CRUD
│   │   │   └── settings.ts               # App settings CRUD
│   │   │
│   │   ├── services/                      # Business Logic Services
│   │   │   ├── facebook/                  # Facebook Automation
│   │   │   │   ├── poster.ts              # Post to groups/pages
│   │   │   │   ├── ads.ts                 # Facebook Ads API
│   │   │   │   └── auth.ts                # Login, session management
│   │   │   ├── tiktok/                    # TikTok Automation
│   │   │   │   ├── poster.ts              # Post to TikTok
│   │   │   │   ├── ads.ts                 # TikTok Marketing API
│   │   │   │   └── auth.ts                # Login, session management
│   │   │   ├── spintax.ts                 # Spintax parser & engine
│   │   │   ├── human-behavior.ts          # Human-like delays & actions
│   │   │   └── proxy-manager.ts           # Proxy rotation & health
│   │   │
│   │   ├── scheduler/                     # Scheduling Engine
│   │   │   ├── index.ts                   # Cron job manager
│   │   │   └── rules-engine.ts            # Automated rules for ads
│   │   │
│   │   ├── ipc/                           # IPC Handlers
│   │   │   ├── index.ts                   # Register all handlers
│   │   │   ├── accounts.ipc.ts            # Account IPC channels
│   │   │   ├── facebook.ipc.ts            # Facebook engine IPC
│   │   │   ├── tiktok.ipc.ts              # TikTok engine IPC
│   │   │   ├── ads.ipc.ts                 # Ads management IPC
│   │   │   └── logs.ipc.ts                # Real-time log streaming
│   │   │
│   │   └── utils/                         # Shared Utilities
│   │       ├── crypto-utils.ts            # Encryption/decryption
│   │       └── image-manager.ts           # Image storage & management
│   │
│   ├── preload/
│   │   └── index.ts                       # contextBridge API
│   │
│   └── renderer/                          # React Frontend
│       ├── index.html
│       └── src/
│           ├── main.tsx                   # React entry point
│           ├── App.tsx                    # Root component with router
│           ├── index.css                  # Global styles + theme vars
│           │
│           ├── components/                # Shared Components
│           │   ├── Sidebar.tsx            # Navigation sidebar
│           │   ├── ActivityLog.tsx        # Real-time activity log
│           │   ├── AccountCard.tsx        # Account status card
│           │   ├── ProxyForm.tsx          # Proxy configuration form
│           │   ├── StatusBadge.tsx        # Live/Die/Checkpoint badge
│           │   └── CronPresets.tsx        # Cron expression presets
│           │
│           ├── pages/                     # Route Pages
│           │   ├── Dashboard.tsx          # Overview stats & charts
│           │   ├── Accounts.tsx           # Account management
│           │   ├── Groups.tsx             # Group/fanpage management
│           │   ├── Content.tsx            # Content editor with spintax
│           │   ├── Schedule.tsx           # Posting schedule config
│           │   ├── Ads.tsx               # Ad campaigns, adsets, ads
│           │   ├── History.tsx            # Post & ad history
│           │   ├── Logs.tsx               # Detailed activity logs
│           │   └── Settings.tsx           # App settings
│           │
│           └── stores/                    # State Management
│               ├── ThemeContext.tsx        # Dark/Light theme
│               └── LogStore.ts            # Activity log state
│
└── out/                                   # Build output
```

## 4. DATABASE SCHEMA (SQLite)

### 4.1 accounts — Tài khoản Facebook & TikTok
```sql
CREATE TABLE accounts (
  id            TEXT PRIMARY KEY,
  platform      TEXT NOT NULL CHECK(platform IN ('facebook','tiktok')),
  account_type  TEXT NOT NULL,         -- 'via','clone','bm' cho FB; 'personal','agency' cho TT
  email         TEXT,
  password      TEXT,                  -- Encrypted via safeStorage
  twofa_secret  TEXT,                  -- Mã 2FA
  access_token  TEXT,                  -- API token
  cookie_file   TEXT,                  -- Path to browser cookie storage
  proxy_id      TEXT,                  -- FK → proxies.id
  status        TEXT DEFAULT 'live' CHECK(status IN ('live','die','checkpoint','limited')),
  last_used_at  DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 proxies — Proxy riêng cho từng tài khoản
```sql
CREATE TABLE proxies (
  id        TEXT PRIMARY KEY,
  type      TEXT CHECK(type IN ('http','https','socks5')),
  host      TEXT NOT NULL,
  port      INTEGER NOT NULL,
  username  TEXT,
  password  TEXT,
  is_active BOOLEAN DEFAULT 1,
  region    TEXT                         -- Country/city
);
```

### 4.3 browser_profiles — Profile trình duyệt độc lập
```sql
CREATE TABLE browser_profiles (
  id            TEXT PRIMARY KEY,
  account_id    TEXT REFERENCES accounts(id),
  user_agent    TEXT,
  viewport_w    INTEGER DEFAULT 1280,
  viewport_h    INTEGER DEFAULT 720,
  locale        TEXT DEFAULT 'vi-VN',
  timezone      TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  storage_path  TEXT,                    -- Path to persistent profile
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 contents — Kho nội dung (mẫu bài đăng)
```sql
CREATE TABLE contents (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  platform    TEXT CHECK(platform IN ('facebook','tiktok','both')),
  template    TEXT NOT NULL,              -- Nội dung gốc với {{variable}}
  spintax     TEXT,                       -- Nội dung dạng Spintax {option1|option2}
  media_paths TEXT,                       -- JSON array of file paths
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 groups — Nhóm/Fanpage/Page đích
```sql
CREATE TABLE groups (
  id             TEXT PRIMARY KEY,
  platform       TEXT NOT NULL CHECK(platform IN ('facebook','tiktok')),
  name           TEXT NOT NULL,
  url            TEXT NOT NULL,
  external_id    TEXT,                    -- ID từ platform
  type           TEXT,                    -- 'group','fanpage','profile' cho FB; 'page' cho TT
  is_active      BOOLEAN DEFAULT 1,
  last_posted_at DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.6 schedules — Lịch đăng bài
```sql
CREATE TABLE schedules (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  platform      TEXT CHECK(platform IN ('facebook','tiktok','both')),
  content_id    TEXT REFERENCES contents(id),
  account_ids   TEXT,                    -- JSON array
  group_ids     TEXT,                    -- JSON array
  cron_expression TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT 1,
  start_date    DATE,
  end_date      DATE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.7 post_history — Lịch sử bài đăng
```sql
CREATE TABLE post_history (
  id          TEXT PRIMARY KEY,
  platform    TEXT NOT NULL,
  schedule_id TEXT REFERENCES schedules(id),
  account_id  TEXT REFERENCES accounts(id),
  group_id    TEXT REFERENCES groups(id),
  content_id  TEXT REFERENCES contents(id),
  content     TEXT,                      -- Nội dung thực tế đã đăng
  media_count INTEGER DEFAULT 0,
  status      TEXT CHECK(status IN ('success','failed','pending')),
  error       TEXT,
  post_url    TEXT,                      -- URL bài đăng nếu thành công
  posted_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.8 ad_campaigns — Chiến dịch quảng cáo
```sql
CREATE TABLE ad_campaigns (
  id            TEXT PRIMARY KEY,
  platform      TEXT NOT NULL CHECK(platform IN ('facebook','tiktok')),
  name          TEXT NOT NULL,
  objective     TEXT,                    -- awareness, traffic, conversion...
  status        TEXT DEFAULT 'active' CHECK(status IN ('active','paused','deleted')),
  daily_budget  REAL,
  lifetime_budget REAL,
  start_time    DATETIME,
  end_time      DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.9 ad_adsets — Nhóm quảng cáo
```sql
CREATE TABLE ad_adsets (
  id            TEXT PRIMARY KEY,
  campaign_id   TEXT REFERENCES ad_campaigns(id),
  name          TEXT NOT NULL,
  targeting     TEXT,                    -- JSON targeting config
  bid_amount    REAL,
  bid_strategy  TEXT,
  status        TEXT DEFAULT 'active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.10 ad_insights — Báo cáo real-time (cache từ API)
```sql
CREATE TABLE ad_insights (
  id          TEXT PRIMARY KEY,
  adset_id    TEXT REFERENCES ad_adsets(id),
  date        DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks      INTEGER DEFAULT 0,
  spend       REAL DEFAULT 0,
  cpm         REAL,
  ctr         REAL,
  cpc         REAL,
  cpa         REAL,
  conversions INTEGER DEFAULT 0,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.11 automated_rules — Quy tắc tự động
```sql
CREATE TABLE automated_rules (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  platform      TEXT,
  target_type   TEXT,                    -- 'campaign','adset','ad'
  target_id     TEXT,
  metric        TEXT NOT NULL,           -- 'cpa','cpm','ctr','spend'
  condition     TEXT NOT NULL,           -- 'gt','lt','gte','lte'
  threshold     REAL NOT NULL,
  action        TEXT NOT NULL,           -- 'pause','increase_budget','decrease_budget'
  action_value  REAL,
  time_window   INTEGER,                 -- minutes
  is_active     BOOLEAN DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.12 activity_logs — Nhật ký hoạt động real-time
```sql
CREATE TABLE activity_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  level       TEXT CHECK(level IN ('info','success','warning','error')),
  platform    TEXT,
  account_id  TEXT,
  message     TEXT NOT NULL,
  details     TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.13 settings — Cấu hình ứng dụng
```sql
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## 5. MODULES CHI TIẾT

### Module 1: Account Manager (Anti-Detection)
- Quản lý tài khoản Facebook (Via/Clone/BM) và TikTok (Personal/Agency)
- Hỗ trợ đăng nhập bằng API token hoặc mô phỏng trình duyệt
- Mỗi tài khoản có proxy riêng (HTTP/SOCKS5)
- Lưu cookie & localStorage độc lập qua browser profiles
- Tự động phát hiện và gắn nhãn trạng thái: Live / Die / Checkpoint / Limited

### Module 2: Content Automation
- Soạn thảo nội dung với biến động {{variable}}
- Spintax engine: tự động sinh biến thể nội dung
- Kho ảnh/video quản lý tập trung
- Lịch đăng thông minh theo cron
- Cơ chế Delay & Human-like behavior: nghỉ ngẫu nhiên 30-120s, cuộn chuột, gõ phím như người thật

### Module 3: Ads Automation
- Kết nối Facebook Ads API & TikTok Marketing API
- Tạo chiến dịch, adset, ad hàng loạt từ template
- Dashboard báo cáo real-time (CPM, CTR, CPC, CPA)
- Automated Rules: tự động tắt/bật campaign khi vượt ngưỡng chi phí

### Module 4: Scheduler & Queue
- Cron-based scheduling
- Queue quản lý thứ tự ưu tiên
- Cơ chế retry khi thất bại
- Giới hạn tốc độ (rate limiting) tránh spam

### Module 5: Logging & Monitoring
- Real-time activity log stream (IPC push từ main → renderer)
- Lưu trữ lịch sử đầy đủ
- Thông báo trạng thái tài khoản
- Dashboard tổng quan hiệu suất

## 6. DATA FLOW

```
User Action (React UI)
    │
    ▼
window.api.someMethod()    ← contextBridge (preload)
    │
    ▼
ipcMain.handle('channel')  ← Main Process IPC Handler
    │
    ├──► Database Layer (CRUD operations)
    │
    └──► Service Layer (business logic)
            │
            ├──► Playwright Browser (FB/TT automation)
            ├──► HTTP API Requests (Ads API)
            └──► EventEmitter → Log Stream
                    │
                    ▼
            webContents.send('log:new')  ← Push to renderer
                    │
                    ▼
            ActivityLog Component (React state)
```

## 7. SCHEDULER DATA FLOW

```
node-cron tick
    │
    ▼
Execute schedule
    │
    ▼
Resolve content (apply variables & spintax)
    │
    ▼
For each account in schedule:
    ├── Apply proxy
    ├── Load browser profile
    ├── Perform human-like behavior (random delays)
    ├── Execute posting (Playwright or API)
    └── Log result → DB + UI log stream
    │
    ▼
Update schedule last_run
```

## 8. ANTI-DETECTION STRATEGY

1. **Browser Profiles**: Mỗi tài khoản có profile riêng (user-agent, viewport, locale, timezone)
2. **Proxy Rotation**: Mỗi tài khoản gắn với proxy riêng, không dùng chung IP
3. **Human-like Behavior**: 
   - Delay ngẫu nhiên giữa các thao tác (30-120s)
   - Di chuyển chuột mô phỏng (mouse move track)
   - Cuộn trang trước khi đăng
   - Gõ phím với tốc độ ngẫu nhiên
4. **Spintax Content**: Mỗi bài đăng có nội dung khác nhau
5. **Session Persistence**: Lưu cookie, localStorage để không cần đăng nhập lại
