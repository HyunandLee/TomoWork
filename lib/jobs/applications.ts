// 応募（worker が選ぶ）・採用（employer）→ hire_event 生成で P0 フローへ接続。
import type { Application, HireEvent } from '@/lib/types';
import { repo, now } from '@/lib/db/repo';
import { genId } from '@/lib/util/id';

export class JobError extends Error {}

/** worker が求人に応募＝選択（applied）。 */
export function applyToJob(jobId: string, workerId: string): Application {
  const job = repo.getJob(jobId);
  if (!job) throw new JobError('求人が見つかりません');
  if (job.status !== 'open') throw new JobError('この求人は募集を終了しています');

  // 同一求人への重複応募を避ける
  const existing = repo
    .listApplicationsByWorker(workerId)
    .find((a) => a.jobId === jobId && a.status !== 'rejected');
  if (existing) return existing;

  const app: Application = {
    id: genId('app'),
    jobId,
    workerId,
    status: 'applied',
    createdAt: now(),
  };
  repo.insertApplication(app);
  return app;
}

export function listApplicantsForEmployer(employerId: string): Application[] {
  return repo.listApplicationsByEmployer(employerId);
}

export function listApplicationsForWorker(workerId: string): Application[] {
  return repo.listApplicationsByWorker(workerId);
}

/**
 * employer が応募者を採用 → application を accepted にし hire_event（pending）を生成。
 * 生成された hire は P0 の検証・様式第3号生成・提出フローの入力になる。
 */
export function acceptApplication(
  applicationId: string,
  employerId: string,
): HireEvent {
  const app = repo.getApplication(applicationId);
  if (!app) throw new JobError('応募が見つかりません');

  const job = repo.getJob(app.jobId);
  if (!job) throw new JobError('求人が見つかりません');
  if (job.employerId !== employerId) throw new JobError('自社の求人ではありません');
  if (app.status === 'accepted') {
    // すでに採用済みなら対応する hire を返す
    const existing = repo
      .listHiresByEmployer(employerId)
      .find((h) => h.jobId === job.id && h.workerId === app.workerId);
    if (existing) return existing;
  }

  repo.setApplicationStatus(app.id, 'accepted');

  const hire: HireEvent = {
    id: genId('hire'),
    workerId: app.workerId,
    employerId,
    jobId: job.id,
    hireDate: now().slice(0, 10),
    weeklyHours: job.weeklyHours,
    jobCategory: job.jobCategory,
    inLongVacation: false,
    wage: job.hourlyWage,
    status: 'pending',
  };
  repo.insertHire(hire);
  return hire;
}
