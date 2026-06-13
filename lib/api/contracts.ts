// 型付きAPI契約。UI が叩く Request/Response 型を固定する。
// レスポンスは常に { ok, data?, error? }。
import type {
  JobPosting,
  Application,
  HireEvent,
  Submission,
  Rating,
  RatingSummary,
  Earning,
  ValidationResult,
  WorkerNotification,
} from '@/lib/types';

// ---- 共通レスポンス ----
export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: string;
  code?: string;
}
export type ApiRes<T> = ApiOk<T> | ApiErr;

// ---- /api/jobs ----
export type GetJobsRes = ApiRes<JobPosting[]>;
export interface PostJobBody {
  title: string;
  jobCategory: string;
  weeklyHours: number;
  hourlyWage: number;
  location: string;
}
export type PostJobRes = ApiRes<JobPosting>;

// ---- /api/applications ----
export interface PostApplicationBody { jobId: string; }
export type PostApplicationRes = ApiRes<Application>;
export type GetApplicationsRes = ApiRes<Application[]>;

// ---- /api/applications/[id]/accept ----
export type PostAcceptRes = ApiRes<HireEvent>;

// ---- /api/hire/validate ----
export interface HireValidateBody {
  workerId: string;
  weeklyHours: number;
  jobCategory: string;
  inLongVacation: boolean;
  hireDate: string;
  shifts?: Array<{ date: string; hours: number; employerId: string }>;
}
export type HireValidateRes = ApiRes<ValidationResult>;

// ---- /api/hire/submit ----
export interface HireSubmitBody { hireId: string; }
export type HireSubmitRes = ApiRes<Submission>;

// ---- /api/submissions ----
export type GetSubmissionsRes = ApiRes<Submission[]>;

// ---- /api/me/documents ----
export type GetMyDocumentsRes = ApiRes<Submission[]>;

// ---- /api/earnings ----
export type GetEarningsRes = ApiRes<{ items: Earning[]; total: number }>;

// ---- /api/ratings ----
export interface PostRatingBody {
  hireId: string;
  raterRole: 'employer' | 'worker';
  stars: number;
  comment?: string;
}
export type PostRatingRes = ApiRes<Rating>;
export type GetRatingsRes = ApiRes<RatingSummary>;

// ---- /api/admin/reset ----
export type PostResetRes = ApiRes<{ message: string }>;

// ---- /api/notifications ----
export interface NotificationView extends WorkerNotification {
  employerName?: string;
}
export type GetNotificationsRes = ApiRes<{ items: NotificationView[]; unread: number }>;
export type PostNotificationsReadRes = ApiRes<{ unread: number }>;
