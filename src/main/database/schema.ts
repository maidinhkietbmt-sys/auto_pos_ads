export const CREATE_TABLES = `
-- ========================================
-- Social Media Auto Poster & Ads Manager
-- SQLite Schema
-- ========================================

-- 1. Proxies (must exist before accounts)
CREATE TABLE IF NOT EXISTS proxies (
  id        TEXT PRIMARY KEY,
  label     TEXT,
  type      TEXT CHECK(type IN ('http','https','socks5')) NOT NULL DEFAULT 'http',
  host      TEXT NOT NULL,
  port      INTEGER NOT NULL,
  username  TEXT,
  password  TEXT,
  region    TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Accounts (Facebook & TikTok)
CREATE TABLE IF NOT EXISTS accounts (
  id            TEXT PRIMARY KEY,
  platform      TEXT NOT NULL CHECK(platform IN ('facebook','tiktok')),
  account_type  TEXT NOT NULL,
  label         TEXT,
  email         TEXT,
  password      TEXT,
  twofa_secret  TEXT,
  access_token  TEXT,
  access_token_expires_at DATETIME,
  cookie_data   TEXT,
  proxy_id      TEXT REFERENCES proxies(id),
  user_agent    TEXT,
  status        TEXT DEFAULT 'live' CHECK(status IN ('live','die','checkpoint','limited','unverified')),
  note          TEXT,
  last_used_at  DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Groups (target groups, fanpages, pages)
CREATE TABLE IF NOT EXISTS groups_ (
  id             TEXT PRIMARY KEY,
  platform       TEXT NOT NULL CHECK(platform IN ('facebook','tiktok')),
  name           TEXT NOT NULL,
  url            TEXT NOT NULL,
  external_id    TEXT,
  type           TEXT DEFAULT 'group',
  is_active      BOOLEAN DEFAULT 1,
  last_posted_at DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Contents (post templates)
CREATE TABLE IF NOT EXISTS contents (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  platform    TEXT CHECK(platform IN ('facebook','tiktok','both')) DEFAULT 'both',
  template    TEXT NOT NULL,
  spintax     TEXT,
  media_paths TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  platform       TEXT CHECK(platform IN ('facebook','tiktok','both')) DEFAULT 'both',
  content_id     TEXT REFERENCES contents(id),
  account_ids    TEXT,
  group_ids      TEXT,
  cron_expression TEXT NOT NULL,
  is_active      BOOLEAN DEFAULT 1,
  start_date     DATE,
  end_date       DATE,
  last_run_at    DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Post History
CREATE TABLE IF NOT EXISTS post_history (
  id          TEXT PRIMARY KEY,
  platform    TEXT NOT NULL,
  schedule_id TEXT REFERENCES schedules(id),
  account_id  TEXT REFERENCES accounts(id),
  group_id    TEXT REFERENCES groups_(id),
  content_id  TEXT REFERENCES contents(id),
  content     TEXT,
  media_count INTEGER DEFAULT 0,
  status      TEXT CHECK(status IN ('success','failed','pending')) DEFAULT 'pending',
  error       TEXT,
  post_url    TEXT,
  posted_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Ad Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id              TEXT PRIMARY KEY,
  platform        TEXT NOT NULL CHECK(platform IN ('facebook','tiktok')),
  external_id     TEXT,
  name            TEXT NOT NULL,
  objective       TEXT,
  status          TEXT DEFAULT 'active' CHECK(status IN ('active','paused','deleted','archived')),
  daily_budget    REAL,
  lifetime_budget REAL,
  start_time      DATETIME,
  end_time        DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Ad Sets
CREATE TABLE IF NOT EXISTS ad_adsets (
  id            TEXT PRIMARY KEY,
  campaign_id   TEXT REFERENCES ad_campaigns(id),
  external_id   TEXT,
  name          TEXT NOT NULL,
  targeting     TEXT,
  bid_amount    REAL,
  bid_strategy  TEXT,
  status        TEXT DEFAULT 'active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Ad Insights (metrics cache)
CREATE TABLE IF NOT EXISTS ad_insights (
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

-- 10. Automated Rules
CREATE TABLE IF NOT EXISTS automated_rules (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  platform      TEXT,
  target_type   TEXT,
  target_id     TEXT,
  metric        TEXT NOT NULL,
  condition     TEXT NOT NULL CHECK(condition IN ('gt','lt','gte','lte','eq')),
  threshold     REAL NOT NULL,
  action        TEXT NOT NULL CHECK(action IN ('pause','increase_budget','decrease_budget','notify')),
  action_value  REAL,
  time_window   INTEGER,
  is_active     BOOLEAN DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  level       TEXT CHECK(level IN ('info','success','warning','error')) DEFAULT 'info',
  platform    TEXT,
  account_id  TEXT,
  group_id    TEXT,
  message     TEXT NOT NULL,
  details     TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_platform ON accounts(platform);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_groups_platform ON groups_(platform);
CREATE INDEX IF NOT EXISTS idx_post_history_status ON post_history(status);
CREATE INDEX IF NOT EXISTS idx_post_history_posted_at ON post_history(posted_at);
CREATE INDEX IF NOT EXISTS idx_post_history_platform ON post_history(platform);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_level ON activity_logs(level);
CREATE INDEX IF NOT EXISTS idx_ad_insights_adset_date ON ad_insights(adset_id, date);
CREATE INDEX IF NOT EXISTS idx_schedules_is_active ON schedules(is_active);
`
