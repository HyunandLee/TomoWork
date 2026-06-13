# ビルドプロンプト：外国人雇用 両側マッチング＆書類生成アプリ

あなたはハッカソン用 Web アプリの **コアロジックと基盤** を実装するエンジニアです。
雇用主と外国人労働者の**両側**が使うアプリで、中心の流れは：

1. 雇用主が**求人を出す**／労働者が**バイト先を選ぶ**
2. 雇用主が採用 → 在留資格に基づく**就労コンプライアンス検証** → 合法なら**様式第3号を自動生成** → **デジタル提出を模擬**
3. 就労後、**雇用主と労働者が相互に星1〜5で評価**
4. 労働者は**自分の書類一覧・稼いだ額**を確認できる

**最優先は「正しく・テスト済みのコンプライアンス＆書類生成ロジック」（＝demoの主役）。** UI は薄いプレースホルダで構いません。後から完成済みデザイン（Claude Design 出力）を渡すので、**UI を差し替えてもロジック・APIに触れない**構造にし、UI が叩く**型付きAPI境界**を先に固定します。

> **相互レーティングは、後日実装する信頼伝播（PageRank的）アルゴリズムのデータ土台**です。今は**生の星を保存し、集計は単純平均のみ**。伝播計算は作りません（後で `ratings` を入力に乗せる）。

---

## 実装優先順位（この順で作る）
背骨を先に通し、両側機能をレイヤーで重ねる。各段で `npm run dev` が動く状態を保つ。

- **P0（背骨・demoの主役）**：認証＋ロール → DBスキーマ＋シード → ルールエンジン（validate）→ 様式第3号生成 → 提出シミュレーション。
- **P1（両側ループを繋ぐ）**：求人投稿（employer）→ バイト先選択（worker）→ 採用 → P0の生成フローに接続。
- **P2（相互評価＋労働者ダッシュボード）**：相互レーティング（星1〜5）→ 労働者の書類一覧 → 稼ぎ記録。
- **P3（任意）**：i18n スキャフォールド（ja/en/vi）、admin受理ビュー、連続7日間の精密判定。

---

## スコープ

### 作るもの（in scope）
- **認証・認可**：ロール（employer / worker / admin）付きログイン。Auth.js クレデンシャル＋シード済みアカウント。**軽量に**（メール検証・再設定・登録フローなし）。
- **永続化スキーマ一式**：users / workers / employers / job_postings / applications / hire_events / submissions / ratings / earnings。マイグレーション＋シード同梱。
- **型付きAPI層**：UI が叩くエンドポイントと Request/Response 型を `/lib/api` に固定。
- ルールエンジン：在留資格 ∈ {留学, 家族滞在, 特定活動} の就労可否・労働時間検証。
- 連続7日間スライディングウィンドウ判定（複数勤務先合算）。
- 様式第3号のフィールドマッピング＋HTMLレンダリング＋**PDF出力配線**。
- フォームレジストリ（様式第3号を1エントリ化、将来拡張可能に）。
- 提出シミュレーション（受付番号＋受理日時）。
- **求人投稿（employer）＋ バイト先選択（worker）**：※ブラウズ＆選択のみ。最適化アルゴリズムは作らない。
- **相互レーティング**：雇用主→労働者 / 労働者→雇用主、星1〜5。保存＋平均集計のみ。
- **労働者ダッシュボード**：自分について提出された書類一覧／稼いだ額の記録・合計。
- ドメイン定数の単一ソース／エラー分類→UI状態マッピング。
- シードデータ（地雷ワーカー＋各ロールアカウント＋求人＋完了済み就労＋評価サンプル）。
- デモ補助：シードリセット（dev限定）＋ワンクリックログイン。
- ルールエンジンのユニットテスト（アプリの心臓。重点的に）。
- （任意）i18n スキャフォールド／admin受理ビュー。

### 作らないもの（explicitly OUT of scope）
- ❌ AI・LLM 呼び出し（一切なし）
- ❌ **マッチング最適化アルゴリズム（安定マッチング等）** — 選択はブラウズ＆ピックのみ。最適化は後で別途
- ❌ **信頼伝播 / PageRank の計算** — `ratings` は保存するが伝播は後で別途
- ❌ ハローワーク実APIとの連携（提出は模擬のみ）
- ❌ 凝ったスタイリング / デザインシステム（プレースホルダのみ）
- ❌ ローマ字→カタカナ自動変換（データで両方保持）
- ❌ 認証の作り込み（メール検証・再設定・OAuth・MFA）
- ❌ 労働者の自己プロフィール登録（プロフィールはシード固定。労働者は選択・評価・閲覧・記録のみ）

---

## 技術スタック
- **TypeScript + Next.js (App Router)**
- 認証：**Auth.js (NextAuth) Credentials Provider** ＋ `bcrypt`。セッションに `{ userId, role }`。
- ロジックは `/lib` 配下の**フレームワーク非依存な純モジュール**（React/Next を import しない）。
- 永続化：**`better-sqlite3`**。スキーマ＋マイグレーション＋シード同梱。
- テスト：**Vitest**。
- 様式第3号は実物に似せた HTML。`@media print` でPDF化。
- i18n（任意）：`messages/{ja,en,vi}.json` ＋ `t(key, locale)`。

---

## ロール別の job-to-be-done（切り分けの定義）

| | employer | worker | admin |
|---|---|---|---|
| 求人 | **投稿・管理** | 一覧を見て**選ぶ** | 全件閲覧 |
| 採用・書類 | 応募者を**採用**→検証→様式第3号生成→提出 | （被採用） | 受理一覧 |
| 評価 | バイトを**星1〜5** | 雇用主を**星1〜5** | 全件 |
| ダッシュボード | 提出履歴 | **自分の書類一覧・稼ぎ** | 全件＋リセット |

労働者は「データの被写体」ではなく**能動的アクター**（選ぶ・評価する・確認する・記録する）。これで両側が一つのループで繋がる。

---

## ファイル構成
```
/lib
  types.ts
  constants/{residenceStatus,prohibitedJobs,validationCodes,uiStateMap}.ts
  auth/{options,guards}.ts
  db/{schema.sql,migrate.ts,repo.ts}
  api/contracts.ts
  rules/{statusRules,validate,hoursWindow}.ts
  form/{registry,mapToShiki3,wareki,cardFormat}.ts
  submission/submit.ts
  jobs/{postings,applications}.ts      # 求人投稿・応募/選択・採用
  ratings/ratings.ts                   # 相互評価：保存＋平均集計（伝播なし）
  earnings/earnings.ts                  # 稼ぎ記録＋合計
  seed.ts
/app
  login/page.tsx                        # ログイン＋dev用ワンクリック
  (employer)/
    page.tsx                            # ダッシュボード
    jobs/page.tsx                       # 求人投稿・管理
    applicants/page.tsx                 # 応募者一覧 → 採用へ
    doc/page.tsx                        # 検証バナー → 様式第3号 → 提出 → 受付完了
    history/page.tsx                    # 提出した届出
    rate/page.tsx                       # 完了就労のバイトを評価
  (worker)/
    page.tsx                            # ダッシュボード
    jobs/page.tsx                       # バイト先を選ぶ（求人ブラウズ＆応募）
    documents/page.tsx                  # 自分について提出された書類一覧
    earnings/page.tsx                   # 稼いだ額の記録・合計
    rate/page.tsx                       # 完了就労の雇用主を評価
  admin/page.tsx                        # （任意）受理一覧＋シードリセット
  api/
    auth/[...nextauth]/route.ts
    jobs/route.ts                       # GET一覧 / POST投稿
    applications/route.ts               # POST応募(worker) / GET一覧(employer)
    applications/[id]/accept/route.ts   # POST採用(employer)
    hire/validate/route.ts
    hire/submit/route.ts
    submissions/route.ts
    me/documents/route.ts               # worker：自分の書類
    earnings/route.ts                   # GET/POST(worker)
    ratings/route.ts                    # POST評価 / GET集計
    admin/reset/route.ts                # dev限定
/tests
  validate.test.ts  hoursWindow.test.ts  guards.test.ts  ratings.test.ts
```

---

## 認証・認可（`/lib/auth`）
- ロール `'employer' | 'worker' | 'admin'`。Credentials で `users` 照合（`bcrypt.compare`）。session に `userId`/`role`。
- `users` は `linkedEmployerId?` / `linkedWorkerId?` を持ち実体に紐づく。
- ルート保護（`requireRole`）：employer/worker/admin で上表の権限に限定。**労働者は自分に紐づくデータのみ**閲覧・評価可能。
- **dev用ワンクリックログイン**：`NODE_ENV !== 'production'` 限定で employer/worker/admin ボタン表示（壇上でパスワード不要）。

---

## 永続化スキーマ（`/lib/db/schema.sql`）
- `users(id, email UNIQUE, password_hash, role, linked_employer_id?, linked_worker_id?, created_at)`
- `workers(id, name_roman, name_kana, birth_date, sex, nationality, residence_status, residence_until, residence_card_no, has_activity_permit, designation_json?)`
- `employers(id, office_name, office_address, hellowork_office)`
- `job_postings(id, employer_id, title, job_category, weekly_hours, hourly_wage, location, status['open'|'closed'], created_at)`
- `applications(id, job_id, worker_id, status['applied'|'accepted'|'rejected'], created_at)`
- `hire_events(id, worker_id, employer_id, job_id?, hire_date, weekly_hours, job_category, in_long_vacation, wage?, shifts_json?, status['pending'|'active'|'completed'])`
- `submissions(id, worker_id, employer_id, form_id, receipt_no, status, payload_json, created_at)`
- `ratings(id, hire_id, rater_role['employer'|'worker'], stars[1-5], comment?, created_at)`  ※ratee は hire＋反対ロールで一意に定まる
- `earnings(id, worker_id, hire_id, amount, worked_on, created_at)`

`migrate.ts` で起動時にDDL適用、`repo.ts` で型付き read/write（生SQLをUIに漏らさない）。

---

## 型付きAPI層（`/lib/api/contracts.ts`）
レスポンスは常に `{ ok, data?, error? }`。
- `GET  /api/jobs` → `JobPosting[]`（worker：open のみ／employer：自社）
- `POST /api/jobs` ← 求人（employer）
- `POST /api/applications` ← `{ jobId }`（worker が**選ぶ**）
- `GET  /api/applications` → 応募者（employer、自社求人にスコープ）
- `POST /api/applications/:id/accept`（employer：採用 → hire_event 生成）
- `POST /api/hire/validate` ← `{ workerId, weeklyHours, jobCategory, inLongVacation, hireDate, shifts? }` → `ValidationResult`
- `POST /api/hire/submit` ← 同上（OK時のみ）→ `Submission`
- `GET  /api/submissions` → 提出履歴（ロールでスコープ）
- `GET  /api/me/documents` → 自分について提出された `Submission[]`（worker）
- `GET/POST /api/earnings` → 稼ぎ記録・合計（worker）
- `POST /api/ratings` ← `{ hireId, raterRole, stars, comment? }`（完了就労のみ）
- `GET  /api/ratings?subjectRole=&id=` → 平均星＋件数（集計のみ）
- `POST /api/admin/reset`（dev・admin限定）

---

## ドメイン定数（単一ソース・`/lib/constants`）
- `residenceStatus.ts`：在留資格 enum＋就労可否・上限テーブル。
- `prohibitedJobs.ts`：風俗営業等（パチンコ・麻雀・ゲームセンター・キャバレー・ナイトクラブ・ホストクラブ・ダンスホール・性風俗）。
- `validationCodes.ts`：`'EXPIRED'|'PROHIBITED_JOB'|'NO_PERMIT'|'HOURS_EXCEEDED'|'DESIGNATION_NO_WORK'|'CARD_FORMAT'`。
- `uiStateMap.ts`：code → `{ severity, color, labelJa }`。UI・テストはここを参照。

---

## データモデル（`/lib/types.ts` 抜粋）
```ts
export type ResidenceStatus = '留学' | '家族滞在' | '特定活動';
export type Role = 'employer' | 'worker' | 'admin';

export interface Designation { workAllowed: boolean; weeklyCap: number | null; }

export interface Worker {
  id: string; nameRoman: string; nameKana: string; birthDate: string;
  sex: '男' | '女'; nationality: string;
  residenceStatus: ResidenceStatus; residenceUntil: string;
  residenceCardNo: string; hasActivityPermit: boolean; designation?: Designation;
}
export interface Employer { id: string; officeName: string; officeAddress: string; helloWorkOffice: string; }

export interface JobPosting {
  id: string; employerId: string; title: string; jobCategory: string;
  weeklyHours: number; hourlyWage: number; location: string;
  status: 'open' | 'closed'; createdAt: string;
}
export interface Application { id: string; jobId: string; workerId: string; status: 'applied'|'accepted'|'rejected'; createdAt: string; }

export interface Shift { date: string; hours: number; employerId: string; }
export interface HireEvent {
  id: string; workerId: string; employerId: string; jobId?: string;
  hireDate: string; weeklyHours: number; jobCategory: string; inLongVacation: boolean;
  shifts?: Shift[]; wage?: number; status: 'pending'|'active'|'completed';
}

export type Severity = 'OK' | 'NG';
export interface ValidationResult { ok: boolean; severity: Severity; code: string; reasonJa: string; }
export interface Submission { id: string; workerId: string; employerId: string; formId: string; receiptNo: string; status: string; createdAt: string; }

export interface Rating { id: string; hireId: string; raterRole: 'employer'|'worker'; stars: number; comment?: string; createdAt: string; }
export interface RatingSummary { averageStars: number; count: number; }
export interface Earning { id: string; workerId: string; hireId: string; amount: number; workedOn: string; createdAt: string; }
```

---

## ルールエンジン仕様（`/lib/rules/validate.ts`）

3資格はすべて「**原則就労不可・許可があれば制限付き就労**」グループ。差分は時間上限の決まり方。

| 在留資格 | 就労根拠 | 週上限 | 長期休業特例 |
|---|---|---|---|
| 留学 | 資格外活動許可（包括） | 28h | **あり**（1日8h＝週40h、在籍校の学則上の長期休暇中のみ） |
| 家族滞在 | 資格外活動許可（包括） | 28h | **なし** |
| 特定活動 | 指定書 | 指定書記載（weeklyCap、null=無制限） | 指定書次第 |

### 絶対ルール（全資格共通）
- **風俗営業等は資格外活動許可があっても就労不可**（`prohibitedJobs`）。
- 週28時間は本来「**連続する7日間の合計**」で判定、**複数勤務先は合算**（→ `hoursWindow.ts`）。

### `validate(worker, hire)` 判定順序（最初に該当を返す）
1. **EXPIRED**：`residenceUntil < hireDate`
2. **PROHIBITED_JOB**：`jobCategory` が禁止業種
3. 在留資格で分岐：
   - **留学 / 家族滞在**：`!hasActivityPermit` → NO_PERMIT。`cap=28`（**留学＋inLongVacation** なら `40`）。`weeklyHours > cap` → HOURS_EXCEEDED
   - **特定活動**：`!designation.workAllowed` → DESIGNATION_NO_WORK。`weeklyCap!==null && weeklyHours>weeklyCap` → HOURS_EXCEEDED
4. それ以外 → **OK**

---

## 連続7日間判定（`/lib/rules/hoursWindow.ts`、P3）
`shifts` を日付ごとに合算 → **通常期**：全連続7日窓の合計 `>28` で NG。**留学＋長期休業中**：各日 `>8h` で NG（週40h上限も任意）。カレンダー週では収まるが連続7日で超過するケースを検出できることをテストで示す。

---

## 求人・選択フロー（`/lib/jobs`、P1）
- `postings.ts`：employer が求人を作成／一覧取得。worker には `status='open'` のみ。
- `applications.ts`：worker が求人に**応募＝選択**（`applied`）。employer が応募者を**採用**すると `accepted` になり、`hire_events`（status `pending`/`active`）を生成 → P0の検証・生成フローへ。
- これで worker の「バイト先を選べる」が書類生成ループに接続する（両側が断絶しない）。

---

## 相互レーティング（`/lib/ratings`、P2）
- 評価は **hire の status が `completed`** の場合のみ可。
- `POST` で `{ hireId, raterRole, stars(1-5), comment? }` を保存。**1 hire × 1 role につき1件**（重複は上書きor拒否）。
- ratee は hire＋反対ロールで一意。集計は**単純平均**：
  - 労働者の星 = その worker の hire 群に対する `raterRole='employer'` の平均。
  - 雇用主の星 = その employer の hire 群に対する `raterRole='worker'` の平均。
- **伝播・重み付け・PageRankは実装しない**（後日 `ratings` を入力に乗せる前提でスキーマを素直に保つ）。

---

## 労働者ダッシュボード（P2）
- `documents`：`GET /api/me/documents` で**自分について提出された様式第3号**を一覧（受付番号・提出先・提出日）。雇用主の history とは別物として明確に分離。
- `earnings`：`hire` ごとに稼いだ額を記録（`amount`, `workedOn`）。合計と内訳を表示。`wage × weeklyHours` から初期値を提案してもよい。

---

## 様式第3号 生成 / フォームレジストリ / PDF / 提出（P0）
- `mapToShiki3.ts`：氏名（**ローマ字＋カタカナ両方**）／生年月日（西暦＋和暦 `wareki.ts`）／性別／国籍・地域／在留資格／在留期間／**在留カード番号**（`^[A-Z]{2}\d{8}[A-Z]{2}$`、`cardFormat.ts`）／**資格外活動許可の有無**／雇入れ年月日／賃金／週所定労働時間／事業所名・所在地／管轄ハローワーク。
- 上部に**検証バナー**：OK→緑・提出有効／NG→赤・理由・提出無効（色とラベルは `uiStateMap.ts`）。
- `registry.ts`：`shiki3` を1エントリ登録（後で様式第2号・労働条件通知書を追加可能に）。
- PDF：「PDFで保存」ボタン＋`@media print`。サーバPDF化の余地はコメントで残す。
- `submit.ts`：OK時のみ提出。受付番号 `YYYYMMDD-`＋連番6桁、`submissions` 保存、受理日時・提出先を返す「受付完了ビュー」。

---

## シードデータ（`/lib/seed.ts`）
- **アカウント**（dev用・既知PW）：`employer@example.com` / `worker@example.com` / `admin@example.com`。
- **ワーカー**：留学・許可あり・週20h（OK）／家族滞在・許可あり・週15h（OK）／特定活動・`{workAllowed:true,weeklyCap:null}`（OK）／**【地雷①】留学・許可あり・通常期・週40h（NG）**／【地雷②】在留期限切れ（NG）／【地雷③】特定活動・`{workAllowed:false}`（NG）。
- **求人**：employer のオープン求人を数件。
- **完了済み就労（status `completed`）**：相互評価と稼ぎをデモ初期表示できるよう数件、評価サンプルと earnings を投入。
- `POST /api/admin/reset` で再シード（デモ前の初期化）。

---

## テスト（`/tests`）
- `validate()`：在留資格 × 各失敗モード ＋ OK。境界値（28/28.5/留学長期休業40）。
- `hoursWindow()`：連続7日窓 straddle・複数勤務先合算・長期休業1日8h。
- `guards`：ロール別アクセス制御（特に労働者が他人のデータにアクセスできないこと）。
- `ratings`：完了前は評価不可・1 hire×1 role の一意性・平均集計の正しさ。
- `npm test` グリーン。

---

## デザイン受け渡しの約束
- `/app` は **props でロジック/API出力を受け取るだけ**の presentational。業務ロジックを書かない。
- 後から Claude Design 製UIが `/app` を置き換えるが、**`/lib` と `/app/api`（型付き契約）は無改変で動く**こと。
- 現段階のスタイリングは最小限。

---

## 成果物
- `npm run dev` で動く（ログイン → 求人 → 選択 → 採用 → 検証 → 生成 → 提出 → 相互評価 → 労働者が書類・稼ぎを確認）。
- `npm test` グリーン。
- README：起動手順／ロジック・APIの所在／dev用ログイン情報／**デモ台本**：
  「employer でログイン→求人投稿／worker でログイン→バイト先を選ぶ→employer が採用→**地雷ワーカーで検証NGを見せる**→正常ワーカーで様式第3号生成→提出→受付番号→worker 側で書類一覧と稼ぎを確認→双方で星評価」。

Fetch this design file, read its readme, and implement the relevant aspects of the design. https://api.anthropic.com/v1/design/h/RtzStIRhWBwrMlQEOqK4Bg
Implement: the designs in this project