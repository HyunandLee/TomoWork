-- 永続化スキーマ（better-sqlite3）。起動時に migrate.ts が適用する。

CREATE TABLE IF NOT EXISTS users (
  id                 TEXT PRIMARY KEY,
  email              TEXT UNIQUE NOT NULL,
  password_hash      TEXT NOT NULL,
  role               TEXT NOT NULL CHECK (role IN ('employer','worker','admin')),
  linked_employer_id TEXT REFERENCES employers(id),
  linked_worker_id   TEXT REFERENCES workers(id),
  created_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workers (
  id                 TEXT PRIMARY KEY,
  name_roman         TEXT NOT NULL,
  name_kana          TEXT NOT NULL,
  birth_date         TEXT NOT NULL,
  sex                TEXT NOT NULL CHECK (sex IN ('男','女')),
  nationality        TEXT NOT NULL,
  residence_status   TEXT NOT NULL,
  residence_until    TEXT NOT NULL,
  residence_card_no  TEXT NOT NULL,
  has_activity_permit INTEGER NOT NULL DEFAULT 0,
  designation_json   TEXT
);

CREATE TABLE IF NOT EXISTS employers (
  id              TEXT PRIMARY KEY,
  office_name     TEXT NOT NULL,
  office_address  TEXT NOT NULL,
  hellowork_office TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_postings (
  id          TEXT PRIMARY KEY,
  employer_id TEXT NOT NULL REFERENCES employers(id),
  title       TEXT NOT NULL,
  job_category TEXT NOT NULL,
  weekly_hours INTEGER NOT NULL,
  hourly_wage  INTEGER NOT NULL,
  location     TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('open','closed')) DEFAULT 'open',
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id         TEXT PRIMARY KEY,
  job_id     TEXT NOT NULL REFERENCES job_postings(id),
  worker_id  TEXT NOT NULL REFERENCES workers(id),
  status     TEXT NOT NULL CHECK (status IN ('applied','accepted','rejected')) DEFAULT 'applied',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hire_events (
  id            TEXT PRIMARY KEY,
  worker_id     TEXT NOT NULL REFERENCES workers(id),
  employer_id   TEXT NOT NULL REFERENCES employers(id),
  job_id        TEXT REFERENCES job_postings(id),
  hire_date     TEXT NOT NULL,
  weekly_hours  INTEGER NOT NULL,
  job_category  TEXT NOT NULL,
  in_long_vacation INTEGER NOT NULL DEFAULT 0,
  wage          INTEGER,
  shifts_json   TEXT,
  status        TEXT NOT NULL CHECK (status IN ('pending','active','completed')) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS submissions (
  id          TEXT PRIMARY KEY,
  worker_id   TEXT NOT NULL REFERENCES workers(id),
  employer_id TEXT NOT NULL REFERENCES employers(id),
  form_id     TEXT NOT NULL,
  receipt_no  TEXT NOT NULL,
  status      TEXT NOT NULL,
  payload_json TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ratings (
  id         TEXT PRIMARY KEY,
  hire_id    TEXT NOT NULL REFERENCES hire_events(id),
  rater_role TEXT NOT NULL CHECK (rater_role IN ('employer','worker')),
  stars      INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (hire_id, rater_role)
);

CREATE TABLE IF NOT EXISTS earnings (
  id         TEXT PRIMARY KEY,
  worker_id  TEXT NOT NULL REFERENCES workers(id),
  hire_id    TEXT NOT NULL REFERENCES hire_events(id),
  amount     INTEGER NOT NULL,
  worked_on  TEXT NOT NULL,
  created_at TEXT NOT NULL
);
