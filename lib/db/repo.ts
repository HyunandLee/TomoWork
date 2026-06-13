// 型付き read/write 層。生SQLをUI/APIに漏らさない。
import type {
  User,
  Worker,
  Employer,
  JobPosting,
  Application,
  HireEvent,
  Submission,
  Rating,
  Earning,
  Designation,
  Shift,
} from '@/lib/types';
import { getDb } from './migrate';

// ---- row → domain mappers ----------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowUser(r: any): User {
  return {
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
    role: r.role,
    linkedEmployerId: r.linked_employer_id ?? undefined,
    linkedWorkerId: r.linked_worker_id ?? undefined,
    createdAt: r.created_at,
  };
}

function rowWorker(r: any): Worker {
  return {
    id: r.id,
    nameRoman: r.name_roman,
    nameKana: r.name_kana,
    birthDate: r.birth_date,
    sex: r.sex,
    nationality: r.nationality,
    residenceStatus: r.residence_status,
    residenceUntil: r.residence_until,
    residenceCardNo: r.residence_card_no,
    hasActivityPermit: !!r.has_activity_permit,
    designation: r.designation_json ? (JSON.parse(r.designation_json) as Designation) : undefined,
  };
}

function rowEmployer(r: any): Employer {
  return {
    id: r.id,
    officeName: r.office_name,
    officeAddress: r.office_address,
    helloWorkOffice: r.hellowork_office,
  };
}

function rowJob(r: any): JobPosting {
  return {
    id: r.id,
    employerId: r.employer_id,
    title: r.title,
    jobCategory: r.job_category,
    weeklyHours: r.weekly_hours,
    hourlyWage: r.hourly_wage,
    location: r.location,
    status: r.status,
    createdAt: r.created_at,
  };
}

function rowApplication(r: any): Application {
  return {
    id: r.id,
    jobId: r.job_id,
    workerId: r.worker_id,
    status: r.status,
    createdAt: r.created_at,
  };
}

function rowHire(r: any): HireEvent {
  return {
    id: r.id,
    workerId: r.worker_id,
    employerId: r.employer_id,
    jobId: r.job_id ?? undefined,
    hireDate: r.hire_date,
    weeklyHours: r.weekly_hours,
    jobCategory: r.job_category,
    inLongVacation: !!r.in_long_vacation,
    wage: r.wage ?? undefined,
    shifts: r.shifts_json ? (JSON.parse(r.shifts_json) as Shift[]) : undefined,
    status: r.status,
  };
}

function rowSubmission(r: any): Submission {
  return {
    id: r.id,
    workerId: r.worker_id,
    employerId: r.employer_id,
    formId: r.form_id,
    receiptNo: r.receipt_no,
    status: r.status,
    payload: r.payload_json ? JSON.parse(r.payload_json) : undefined,
    createdAt: r.created_at,
  };
}

function rowRating(r: any): Rating {
  return {
    id: r.id,
    hireId: r.hire_id,
    raterRole: r.rater_role,
    stars: r.stars,
    comment: r.comment ?? undefined,
    createdAt: r.created_at,
  };
}

function rowEarning(r: any): Earning {
  return {
    id: r.id,
    workerId: r.worker_id,
    hireId: r.hire_id,
    amount: r.amount,
    workedOn: r.worked_on,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const now = () => new Date().toISOString();

export const repo = {
  // ---- users ----
  insertUser(u: User) {
    getDb()
      .prepare(
        `INSERT INTO users (id,email,password_hash,role,linked_employer_id,linked_worker_id,created_at)
         VALUES (@id,@email,@passwordHash,@role,@linkedEmployerId,@linkedWorkerId,@createdAt)`,
      )
      .run({
        ...u,
        linkedEmployerId: u.linkedEmployerId ?? null,
        linkedWorkerId: u.linkedWorkerId ?? null,
      });
  },
  getUserByEmail(email: string): User | undefined {
    const r = getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    return r ? rowUser(r) : undefined;
  },
  getUserById(id: string): User | undefined {
    const r = getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id);
    return r ? rowUser(r) : undefined;
  },

  // ---- workers ----
  insertWorker(w: Worker) {
    getDb()
      .prepare(
        `INSERT INTO workers (id,name_roman,name_kana,birth_date,sex,nationality,residence_status,residence_until,residence_card_no,has_activity_permit,designation_json)
         VALUES (@id,@nameRoman,@nameKana,@birthDate,@sex,@nationality,@residenceStatus,@residenceUntil,@residenceCardNo,@permit,@designation)`,
      )
      .run({
        ...w,
        permit: w.hasActivityPermit ? 1 : 0,
        designation: w.designation ? JSON.stringify(w.designation) : null,
      });
  },
  getWorker(id: string): Worker | undefined {
    const r = getDb().prepare(`SELECT * FROM workers WHERE id = ?`).get(id);
    return r ? rowWorker(r) : undefined;
  },
  listWorkers(): Worker[] {
    return getDb().prepare(`SELECT * FROM workers ORDER BY name_roman`).all().map(rowWorker);
  },

  // ---- employers ----
  insertEmployer(e: Employer) {
    getDb()
      .prepare(
        `INSERT INTO employers (id,office_name,office_address,hellowork_office)
         VALUES (@id,@officeName,@officeAddress,@helloWorkOffice)`,
      )
      .run(e);
  },
  getEmployer(id: string): Employer | undefined {
    const r = getDb().prepare(`SELECT * FROM employers WHERE id = ?`).get(id);
    return r ? rowEmployer(r) : undefined;
  },

  // ---- job postings ----
  insertJob(j: JobPosting) {
    getDb()
      .prepare(
        `INSERT INTO job_postings (id,employer_id,title,job_category,weekly_hours,hourly_wage,location,status,created_at)
         VALUES (@id,@employerId,@title,@jobCategory,@weeklyHours,@hourlyWage,@location,@status,@createdAt)`,
      )
      .run(j);
  },
  getJob(id: string): JobPosting | undefined {
    const r = getDb().prepare(`SELECT * FROM job_postings WHERE id = ?`).get(id);
    return r ? rowJob(r) : undefined;
  },
  listOpenJobs(): JobPosting[] {
    return getDb()
      .prepare(`SELECT * FROM job_postings WHERE status = 'open' ORDER BY created_at DESC`)
      .all()
      .map(rowJob);
  },
  listJobsByEmployer(employerId: string): JobPosting[] {
    return getDb()
      .prepare(`SELECT * FROM job_postings WHERE employer_id = ? ORDER BY created_at DESC`)
      .all(employerId)
      .map(rowJob);
  },
  setJobStatus(id: string, status: JobPosting['status']) {
    getDb().prepare(`UPDATE job_postings SET status = ? WHERE id = ?`).run(status, id);
  },

  // ---- applications ----
  insertApplication(a: Application) {
    getDb()
      .prepare(
        `INSERT INTO applications (id,job_id,worker_id,status,created_at)
         VALUES (@id,@jobId,@workerId,@status,@createdAt)`,
      )
      .run(a);
  },
  getApplication(id: string): Application | undefined {
    const r = getDb().prepare(`SELECT * FROM applications WHERE id = ?`).get(id);
    return r ? rowApplication(r) : undefined;
  },
  /** employer の全求人に対する応募一覧（自社スコープ）。 */
  listApplicationsByEmployer(employerId: string): Application[] {
    return getDb()
      .prepare(
        `SELECT a.* FROM applications a
         JOIN job_postings j ON j.id = a.job_id
         WHERE j.employer_id = ? ORDER BY a.created_at DESC`,
      )
      .all(employerId)
      .map(rowApplication);
  },
  listApplicationsByWorker(workerId: string): Application[] {
    return getDb()
      .prepare(`SELECT * FROM applications WHERE worker_id = ? ORDER BY created_at DESC`)
      .all(workerId)
      .map(rowApplication);
  },
  setApplicationStatus(id: string, status: Application['status']) {
    getDb().prepare(`UPDATE applications SET status = ? WHERE id = ?`).run(status, id);
  },

  // ---- hire events ----
  insertHire(h: HireEvent) {
    getDb()
      .prepare(
        `INSERT INTO hire_events (id,worker_id,employer_id,job_id,hire_date,weekly_hours,job_category,in_long_vacation,wage,shifts_json,status)
         VALUES (@id,@workerId,@employerId,@jobId,@hireDate,@weeklyHours,@jobCategory,@inLong,@wage,@shifts,@status)`,
      )
      .run({
        ...h,
        jobId: h.jobId ?? null,
        inLong: h.inLongVacation ? 1 : 0,
        wage: h.wage ?? null,
        shifts: h.shifts ? JSON.stringify(h.shifts) : null,
      });
  },
  getHire(id: string): HireEvent | undefined {
    const r = getDb().prepare(`SELECT * FROM hire_events WHERE id = ?`).get(id);
    return r ? rowHire(r) : undefined;
  },
  listHiresByWorker(workerId: string): HireEvent[] {
    return getDb()
      .prepare(`SELECT * FROM hire_events WHERE worker_id = ? ORDER BY hire_date DESC`)
      .all(workerId)
      .map(rowHire);
  },
  listHiresByEmployer(employerId: string): HireEvent[] {
    return getDb()
      .prepare(`SELECT * FROM hire_events WHERE employer_id = ? ORDER BY hire_date DESC`)
      .all(employerId)
      .map(rowHire);
  },
  setHireStatus(id: string, status: HireEvent['status']) {
    getDb().prepare(`UPDATE hire_events SET status = ? WHERE id = ?`).run(status, id);
  },

  // ---- submissions ----
  insertSubmission(s: Submission) {
    getDb()
      .prepare(
        `INSERT INTO submissions (id,worker_id,employer_id,form_id,receipt_no,status,payload_json,created_at)
         VALUES (@id,@workerId,@employerId,@formId,@receiptNo,@status,@payload,@createdAt)`,
      )
      .run({ ...s, payload: s.payload ? JSON.stringify(s.payload) : null });
  },
  listSubmissionsByEmployer(employerId: string): Submission[] {
    return getDb()
      .prepare(`SELECT * FROM submissions WHERE employer_id = ? ORDER BY created_at DESC`)
      .all(employerId)
      .map(rowSubmission);
  },
  listSubmissionsByWorker(workerId: string): Submission[] {
    return getDb()
      .prepare(`SELECT * FROM submissions WHERE worker_id = ? ORDER BY created_at DESC`)
      .all(workerId)
      .map(rowSubmission);
  },
  listAllSubmissions(): Submission[] {
    return getDb().prepare(`SELECT * FROM submissions ORDER BY created_at DESC`).all().map(rowSubmission);
  },
  /** 当日の受付連番（YYYYMMDD-NNNNNN 用）。 */
  countSubmissionsByReceiptPrefix(prefix: string): number {
    const r = getDb()
      .prepare(`SELECT COUNT(*) AS c FROM submissions WHERE receipt_no LIKE ?`)
      .get(prefix + '%') as { c: number };
    return r.c;
  },

  // ---- ratings ----
  /** 1 hire × 1 role につき1件（重複は上書き）。 */
  upsertRating(rt: Rating) {
    getDb()
      .prepare(
        `INSERT INTO ratings (id,hire_id,rater_role,stars,comment,created_at)
         VALUES (@id,@hireId,@raterRole,@stars,@comment,@createdAt)
         ON CONFLICT(hire_id,rater_role)
         DO UPDATE SET stars=excluded.stars, comment=excluded.comment, created_at=excluded.created_at`,
      )
      .run({ ...rt, comment: rt.comment ?? null });
  },
  getRating(hireId: string, raterRole: Rating['raterRole']): Rating | undefined {
    const r = getDb()
      .prepare(`SELECT * FROM ratings WHERE hire_id = ? AND rater_role = ?`)
      .get(hireId, raterRole);
    return r ? rowRating(r) : undefined;
  },
  /** worker が受けた評価（その worker の hire 群に対する employer 評価）。 */
  listRatingsForWorker(workerId: string): Rating[] {
    return getDb()
      .prepare(
        `SELECT r.* FROM ratings r
         JOIN hire_events h ON h.id = r.hire_id
         WHERE h.worker_id = ? AND r.rater_role = 'employer'`,
      )
      .all(workerId)
      .map(rowRating);
  },
  /** employer が受けた評価（その employer の hire 群に対する worker 評価）。 */
  listRatingsForEmployer(employerId: string): Rating[] {
    return getDb()
      .prepare(
        `SELECT r.* FROM ratings r
         JOIN hire_events h ON h.id = r.hire_id
         WHERE h.employer_id = ? AND r.rater_role = 'worker'`,
      )
      .all(employerId)
      .map(rowRating);
  },

  // ---- earnings ----
  insertEarning(e: Earning) {
    getDb()
      .prepare(
        `INSERT INTO earnings (id,worker_id,hire_id,amount,worked_on,created_at)
         VALUES (@id,@workerId,@hireId,@amount,@workedOn,@createdAt)`,
      )
      .run(e);
  },
  listEarningsByWorker(workerId: string): Earning[] {
    return getDb()
      .prepare(`SELECT * FROM earnings WHERE worker_id = ? ORDER BY worked_on DESC`)
      .all(workerId)
      .map(rowEarning);
  },
  sumEarningsByWorker(workerId: string): number {
    const r = getDb()
      .prepare(`SELECT COALESCE(SUM(amount),0) AS total FROM earnings WHERE worker_id = ?`)
      .get(workerId) as { total: number };
    return r.total;
  },
};

export { now };
