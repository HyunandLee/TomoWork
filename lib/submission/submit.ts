// 提出シミュレーション。OK時のみ提出 → 受付番号＋受理日時を返す。
import type { Worker, Employer, HireEvent, Submission, HireInput, Earning, WorkerNotification } from '@/lib/types';
import { repo, now } from '@/lib/db/repo';
import { genId } from '@/lib/util/id';
import { validate } from '@/lib/rules/validate';
import { buildShiki3 } from '@/lib/form/registry';

function receiptPrefix(d = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}-`;
}

/** YYYYMMDD-連番6桁 の受付番号を採番。 */
export function nextReceiptNo(): string {
  const prefix = receiptPrefix();
  const seq = repo.countSubmissionsByReceiptPrefix(prefix) + 1;
  return prefix + String(seq).padStart(6, '0');
}

export class SubmissionRejected extends Error {
  code: string;
  constructor(code: string, reasonJa: string) {
    super(reasonJa);
    this.code = code;
    this.name = 'SubmissionRejected';
  }
}

/**
 * 様式第3号を提出（模擬）。検証 OK の場合のみ submissions に保存し受付完了を返す。
 * NG の場合は SubmissionRejected を投げる。
 */
export function submitShiki3(hireId: string): Submission {
  const hire = repo.getHire(hireId);
  if (!hire) throw new SubmissionRejected('NOT_FOUND', '雇用イベントが見つかりません');

  const worker = repo.getWorker(hire.workerId);
  const employer = repo.getEmployer(hire.employerId);
  if (!worker || !employer) throw new SubmissionRejected('NOT_FOUND', 'ワーカー/事業所が見つかりません');

  const hireInput: HireInput = {
    weeklyHours: hire.weeklyHours,
    jobCategory: hire.jobCategory,
    inLongVacation: hire.inLongVacation,
    hireDate: hire.hireDate,
    shifts: hire.shifts,
  };
  const v = validate(worker, hireInput);
  if (!v.ok) throw new SubmissionRejected(v.code, v.reasonJa);

  const doc = buildShiki3(worker, employer, hire);
  const submission: Submission = {
    id: genId('sub'),
    workerId: worker.id,
    employerId: employer.id,
    formId: 'shiki3',
    receiptNo: nextReceiptNo(),
    status: '受理',
    payload: { fields: doc.fields, titleJa: doc.titleJa },
    createdAt: now(),
  };
  repo.insertSubmission(submission);

  // ---- 月次給与の反映（提出した月の給与を upsert）----
  // 各月ごとに提出するたびに、その月の給与が作成/更新される。
  if (hire.wage != null) {
    const monthKey = submission.createdAt.slice(0, 7); // 提出月（YYYY-MM）
    const monthlyEstimate = Math.round(hire.wage * hire.weeklyHours * 4.3);
    const existing = repo.getEarningForHireMonth(hire.id, monthKey);

    if (existing) {
      repo.updateEarningAmount(existing.id, monthlyEstimate, now());
    } else {
      const earning: Earning = {
        id: genId('earn'),
        workerId: worker.id,
        hireId: hire.id,
        amount: monthlyEstimate,
        workedOn: `${monthKey}-01`,
        createdAt: now(),
      };
      repo.insertEarning(earning);
    }

    // ① 給料更新の通知
    const salaryNote: WorkerNotification = {
      id: genId('ntf'),
      workerId: worker.id,
      type: 'salary_updated',
      hireId: hire.id,
      employerId: employer.id,
      amount: monthlyEstimate,
      month: monthKey,
      isRead: false,
      createdAt: now(),
    };
    repo.insertNotification(salaryNote);
  }

  // ② レビュー依頼の通知（雇用者が書類提出 → 労働者に今月の働きの評価を促す）
  const reviewNote: WorkerNotification = {
    id: genId('ntf'),
    workerId: worker.id,
    type: 'review_request',
    hireId: hire.id,
    employerId: employer.id,
    month: submission.createdAt.slice(0, 7),
    isRead: false,
    createdAt: now(),
  };
  repo.insertNotification(reviewNote);

  // 提出後は就労を active に（pending → active）。
  if (hire.status === 'pending') repo.setHireStatus(hire.id, 'active');

  return submission;
}

/**
 * NOTE(サーバPDF化): 現状はクライアントの @media print で PDF 出力する。
 * サーバ側で生成する場合は、buildShiki3 の fields を puppeteer 等で HTML→PDF 化し
 * Blob 等へ保存する余地をここに残す。
 */

export interface DocPreview {
  worker: Worker;
  employer: Employer;
  hire: HireEvent;
  validation: ReturnType<typeof validate>;
  doc: ReturnType<typeof buildShiki3>;
}

/** 提出前プレビュー（検証バナー＋様式第3号フィールド）を組み立てる。 */
export function previewShiki3(hireId: string): DocPreview | undefined {
  const hire = repo.getHire(hireId);
  if (!hire) return undefined;
  const worker = repo.getWorker(hire.workerId);
  const employer = repo.getEmployer(hire.employerId);
  if (!worker || !employer) return undefined;

  const validation = validate(worker, {
    weeklyHours: hire.weeklyHours,
    jobCategory: hire.jobCategory,
    inLongVacation: hire.inLongVacation,
    hireDate: hire.hireDate,
    shifts: hire.shifts,
  });
  return { worker, employer, hire, validation, doc: buildShiki3(worker, employer, hire) };
}
