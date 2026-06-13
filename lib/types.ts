// ドメインモデルの単一ソース。React/Next を import しないフレームワーク非依存な型定義。

export type ResidenceStatus = '留学' | '家族滞在' | '特定活動';
export type Role = 'employer' | 'worker' | 'admin';

/** 特定活動の指定書の内容（就労可否・週上限） */
export interface Designation {
  workAllowed: boolean;
  /** 週の労働時間上限。null = 無制限 */
  weeklyCap: number | null;
}

export interface Worker {
  id: string;
  nameRoman: string;
  nameKana: string;
  birthDate: string; // ISO yyyy-mm-dd
  sex: '男' | '女';
  nationality: string;
  residenceStatus: ResidenceStatus;
  residenceUntil: string; // ISO yyyy-mm-dd
  residenceCardNo: string;
  hasActivityPermit: boolean;
  designation?: Designation;
}

export interface Employer {
  id: string;
  officeName: string;
  officeAddress: string;
  helloWorkOffice: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  linkedEmployerId?: string;
  linkedWorkerId?: string;
  createdAt: string;
}

/** セッションに乗せる最小ユーザ情報 */
export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  linkedEmployerId?: string;
  linkedWorkerId?: string;
}

export interface JobPosting {
  id: string;
  employerId: string;
  title: string;
  jobCategory: string;
  weeklyHours: number;
  hourlyWage: number;
  location: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: 'applied' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Shift {
  date: string; // ISO yyyy-mm-dd
  hours: number;
  employerId: string;
}

export interface HireEvent {
  id: string;
  workerId: string;
  employerId: string;
  jobId?: string;
  hireDate: string; // ISO yyyy-mm-dd
  weeklyHours: number;
  jobCategory: string;
  inLongVacation: boolean;
  shifts?: Shift[];
  wage?: number;
  status: 'pending' | 'active' | 'completed';
}

export type Severity = 'OK' | 'NG';

export interface ValidationResult {
  ok: boolean;
  severity: Severity;
  code: string;
  reasonJa: string;
}

export interface Submission {
  id: string;
  workerId: string;
  employerId: string;
  formId: string;
  receiptNo: string;
  status: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface Rating {
  id: string;
  hireId: string;
  raterRole: 'employer' | 'worker';
  stars: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface RatingSummary {
  averageStars: number;
  count: number;
}

export interface Earning {
  id: string;
  workerId: string;
  hireId: string;
  amount: number;
  workedOn: string; // ISO yyyy-mm-dd
  createdAt: string;
}

export type NotificationType = 'salary_updated' | 'review_request';

/** 労働者アプリ向けの通知。表示文言は type＋データから多言語で描画する。 */
export interface WorkerNotification {
  id: string;
  workerId: string;
  type: NotificationType;
  hireId?: string;
  employerId?: string;
  /** salary_updated のとき：更新後の当月金額 */
  amount?: number;
  /** 対象の年月（YYYY-MM） */
  month?: string;
  isRead: boolean;
  createdAt: string;
}

/** 検証に必要な雇用イベントの入力（hire 全体を要求しない軽量版） */
export interface HireInput {
  weeklyHours: number;
  jobCategory: string;
  inLongVacation: boolean;
  hireDate: string;
  shifts?: Shift[];
}
