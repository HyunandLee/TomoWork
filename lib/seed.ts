// シードデータ（dev用）。
// - アカウント: employer@example.com / worker@example.com / admin@example.com (PW: password)
// - ワーカー: 通常利用に沿ったサンプル3種
// - 求人・完了済み就労・評価・稼ぎサンプル
import bcrypt from 'bcryptjs';
import { repo } from '@/lib/db/repo';
import { getDb } from '@/lib/db/migrate';
import { genId } from '@/lib/util/id';
import type { User, Worker, Employer, JobPosting, HireEvent, Rating, Earning } from '@/lib/types';

const NOW = new Date().toISOString();
const TODAY = NOW.slice(0, 10);

function d(offset: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().slice(0, 10);
}

export function ensureDevSeedData() {
  const db = getDb();
  const hash = bcrypt.hashSync('password', 10);

  const employers = [
    ['emp-001', 'サカナカフェ株式会社', '東京都渋谷区恵比寿1-1-1', '渋谷公共職業安定所'],
    ['emp-002', 'ミナトマート株式会社', '東京都新宿区西新宿2-2-2', '新宿公共職業安定所'],
    ['emp-003', '東京クイックデリバリー合同会社', '東京都港区芝3-3-3', '品川公共職業安定所'],
    ['emp-004', 'グリーンホテル上野', '東京都台東区上野4-4-4', '上野公共職業安定所'],
  ];

  const users = [
    ['usr-emp-001', 'employer@example.com', 'employer', 'emp-001', null],
    ['usr-emp-002', 'mart@example.com', 'employer', 'emp-002', null],
    ['usr-emp-003', 'delivery@example.com', 'employer', 'emp-003', null],
    ['usr-emp-004', 'hotel@example.com', 'employer', 'emp-004', null],
  ];

  const jobs = [
    ['job-001', 'emp-001', 'カフェスタッフ（ホール）', '飲食店', 20, 1100, '東京都渋谷区', 'open'],
    ['job-002', 'emp-002', 'コンビニ店員', '小売', 25, 1050, '東京都新宿区', 'open'],
    ['job-003', 'emp-003', 'デリバリースタッフ', '配送', 15, 1200, '東京都港区', 'open'],
    ['job-004', 'emp-001', 'カフェスタッフ（キッチン補助）', '飲食店', 18, 1150, '東京都渋谷区', 'open'],
    ['job-005', 'emp-002', 'スーパー品出しスタッフ', '小売', 16, 1120, '東京都中野区', 'open'],
    ['job-006', 'emp-004', 'ホテル清掃スタッフ', '清掃', 20, 1180, '東京都台東区', 'open'],
    ['job-007', 'emp-004', '朝食会場スタッフ', 'ホテル', 12, 1200, '東京都台東区', 'open'],
  ];

  const tx = db.transaction(() => {
    const employerStmt = db.prepare(`
      INSERT INTO employers (id, office_name, office_address, hellowork_office)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        office_name = excluded.office_name,
        office_address = excluded.office_address,
        hellowork_office = excluded.hellowork_office
    `);
    for (const employer of employers) employerStmt.run(...employer);

    const userStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, linked_employer_id, linked_worker_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        password_hash = excluded.password_hash,
        role = excluded.role,
        linked_employer_id = excluded.linked_employer_id,
        linked_worker_id = excluded.linked_worker_id
    `);
    for (const [id, email, role, employerId, workerId] of users) {
      userStmt.run(id, email, hash, role, employerId, workerId, NOW);
    }

    const jobStmt = db.prepare(`
      INSERT INTO job_postings (id, employer_id, title, job_category, weekly_hours, hourly_wage, location, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        employer_id = excluded.employer_id,
        title = excluded.title,
        job_category = excluded.job_category,
        weekly_hours = excluded.weekly_hours,
        hourly_wage = excluded.hourly_wage,
        location = excluded.location,
        status = excluded.status
    `);
    for (const job of jobs) jobStmt.run(...job, NOW);
  });

  tx();
}

export async function runSeed() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ---- employers ----
  const emp1: Employer = {
    id: 'emp-001',
    officeName: 'サカナカフェ株式会社',
    officeAddress: '東京都渋谷区恵比寿1-1-1',
    helloWorkOffice: '渋谷公共職業安定所',
  };
  const emp2: Employer = {
    id: 'emp-002',
    officeName: 'ミナトマート株式会社',
    officeAddress: '東京都新宿区西新宿2-2-2',
    helloWorkOffice: '新宿公共職業安定所',
  };
  const emp3: Employer = {
    id: 'emp-003',
    officeName: '東京クイックデリバリー合同会社',
    officeAddress: '東京都港区芝3-3-3',
    helloWorkOffice: '品川公共職業安定所',
  };
  const emp4: Employer = {
    id: 'emp-004',
    officeName: 'グリーンホテル上野',
    officeAddress: '東京都台東区上野4-4-4',
    helloWorkOffice: '上野公共職業安定所',
  };
  for (const e of [emp1, emp2, emp3, emp4]) repo.insertEmployer(e);

  // ---- workers ----
  // 正常①: 留学・許可あり・週20h
  const w1: Worker = {
    id: 'wkr-001',
    nameRoman: 'NGUYEN VAN AN',
    nameKana: 'グエン バン アン',
    birthDate: '2000-05-15',
    sex: '男',
    nationality: 'ベトナム',
    residenceStatus: '留学',
    residenceUntil: d(365),
    residenceCardNo: 'AB12345678CD',
    hasActivityPermit: true,
  };
  // 正常②: 家族滞在・許可あり・週15h
  const w2: Worker = {
    id: 'wkr-002',
    nameRoman: 'ZHANG MEIMEI',
    nameKana: 'ジャン メイメイ',
    birthDate: '1998-08-20',
    sex: '女',
    nationality: '中国',
    residenceStatus: '家族滞在',
    residenceUntil: d(200),
    residenceCardNo: 'CD98765432EF',
    hasActivityPermit: true,
  };
  // 正常③: 特定活動・就労可・無制限
  const w3: Worker = {
    id: 'wkr-003',
    nameRoman: 'KIM JISOO',
    nameKana: 'キム ジス',
    birthDate: '1995-03-10',
    sex: '女',
    nationality: '韓国',
    residenceStatus: '特定活動',
    residenceUntil: d(180),
    residenceCardNo: 'EF45678901GH',
    hasActivityPermit: false,
    designation: { workAllowed: true, weeklyCap: null },
  };
  for (const w of [w1, w2, w3]) {
    repo.insertWorker(w);
  }

  // ---- users ----
  const users: User[] = [
    {
      id: 'usr-emp-001',
      email: 'employer@example.com',
      passwordHash: hash('password'),
      role: 'employer',
      linkedEmployerId: emp1.id,
      createdAt: NOW,
    },
    {
      id: 'usr-emp-002',
      email: 'mart@example.com',
      passwordHash: hash('password'),
      role: 'employer',
      linkedEmployerId: emp2.id,
      createdAt: NOW,
    },
    {
      id: 'usr-emp-003',
      email: 'delivery@example.com',
      passwordHash: hash('password'),
      role: 'employer',
      linkedEmployerId: emp3.id,
      createdAt: NOW,
    },
    {
      id: 'usr-emp-004',
      email: 'hotel@example.com',
      passwordHash: hash('password'),
      role: 'employer',
      linkedEmployerId: emp4.id,
      createdAt: NOW,
    },
    {
      id: 'usr-wkr-001',
      email: 'worker@example.com',
      passwordHash: hash('password'),
      role: 'worker',
      linkedWorkerId: w1.id,
      createdAt: NOW,
    },
    {
      id: 'usr-adm-001',
      email: 'admin@example.com',
      passwordHash: hash('password'),
      role: 'admin',
      createdAt: NOW,
    },
  ];
  for (const u of users) repo.insertUser(u);

  // ---- job postings ----
  const jobs: JobPosting[] = [
    {
      id: 'job-001',
      employerId: emp1.id,
      title: 'カフェスタッフ（ホール）',
      jobCategory: '飲食店',
      weeklyHours: 20,
      hourlyWage: 1100,
      location: '東京都渋谷区',
      status: 'open',
      createdAt: NOW,
    },
    {
      id: 'job-002',
      employerId: emp2.id,
      title: 'コンビニ店員',
      jobCategory: '小売',
      weeklyHours: 25,
      hourlyWage: 1050,
      location: '東京都新宿区',
      status: 'open',
      createdAt: NOW,
    },
    {
      id: 'job-003',
      employerId: emp3.id,
      title: 'デリバリースタッフ',
      jobCategory: '配送',
      weeklyHours: 15,
      hourlyWage: 1200,
      location: '東京都港区',
      status: 'open',
      createdAt: NOW,
    },
    {
      id: 'job-004',
      employerId: emp1.id,
      title: 'カフェスタッフ（キッチン補助）',
      jobCategory: '飲食店',
      weeklyHours: 18,
      hourlyWage: 1150,
      location: '東京都渋谷区',
      status: 'open',
      createdAt: NOW,
    },
    {
      id: 'job-005',
      employerId: emp2.id,
      title: 'スーパー品出しスタッフ',
      jobCategory: '小売',
      weeklyHours: 16,
      hourlyWage: 1120,
      location: '東京都中野区',
      status: 'open',
      createdAt: NOW,
    },
    {
      id: 'job-006',
      employerId: emp4.id,
      title: 'ホテル清掃スタッフ',
      jobCategory: '清掃',
      weeklyHours: 20,
      hourlyWage: 1180,
      location: '東京都台東区',
      status: 'open',
      createdAt: NOW,
    },
    {
      id: 'job-007',
      employerId: emp4.id,
      title: '朝食会場スタッフ',
      jobCategory: 'ホテル',
      weeklyHours: 12,
      hourlyWage: 1200,
      location: '東京都台東区',
      status: 'open',
      createdAt: NOW,
    },
  ];
  for (const j of jobs) repo.insertJob(j);

  // ---- completed hire events（デモ用サンプル）----
  const hireCompleted1: HireEvent = {
    id: 'hire-c001',
    workerId: w1.id,
    employerId: emp1.id,
    jobId: 'job-001',
    hireDate: d(-30),
    weeklyHours: 20,
    jobCategory: '飲食店',
    inLongVacation: false,
    wage: 1100,
    status: 'completed',
  };
  const hireCompleted2: HireEvent = {
    id: 'hire-c002',
    workerId: w2.id,
    employerId: emp2.id,
    jobId: 'job-002',
    hireDate: d(-45),
    weeklyHours: 15,
    jobCategory: '小売',
    inLongVacation: false,
    wage: 1050,
    status: 'completed',
  };
  // pending hire（様式第3号生成のデモ用）
  const hirePending: HireEvent = {
    id: 'hire-p001',
    workerId: w1.id,
    employerId: emp1.id,
    jobId: 'job-001',
    hireDate: TODAY,
    weeklyHours: 20,
    jobCategory: '飲食店',
    inLongVacation: false,
    wage: 1100,
    status: 'pending',
  };
  for (const h of [hireCompleted1, hireCompleted2, hirePending]) {
    repo.insertHire(h);
  }

  // ---- submissions（完了済み就労分）----
  repo.insertSubmission({
    id: 'sub-001',
    workerId: w1.id,
    employerId: emp1.id,
    formId: 'shiki3',
    receiptNo: `${d(-30).replace(/-/g, '')}-000001`,
    status: '受理',
    payload: { titleJa: '外国人雇用状況届出書（様式第3号）', fields: [] },
    createdAt: d(-30) + 'T10:00:00.000Z',
  });
  repo.insertSubmission({
    id: 'sub-002',
    workerId: w2.id,
    employerId: emp2.id,
    formId: 'shiki3',
    receiptNo: `${d(-45).replace(/-/g, '')}-000001`,
    status: '受理',
    payload: { titleJa: '外国人雇用状況届出書（様式第3号）', fields: [] },
    createdAt: d(-45) + 'T10:00:00.000Z',
  });

  // ---- ratings サンプル ----
  const ratings: Rating[] = [
    {
      id: 'rat-001',
      hireId: hireCompleted1.id,
      raterRole: 'employer',
      stars: 5,
      comment: '真面目で仕事が速いです',
      createdAt: NOW,
    },
    {
      id: 'rat-002',
      hireId: hireCompleted1.id,
      raterRole: 'worker',
      stars: 4,
      comment: '働きやすい職場でした',
      createdAt: NOW,
    },
    {
      id: 'rat-003',
      hireId: hireCompleted2.id,
      raterRole: 'employer',
      stars: 4,
      comment: '時間を守れる方です',
      createdAt: NOW,
    },
    {
      id: 'rat-004',
      hireId: hireCompleted2.id,
      raterRole: 'worker',
      stars: 5,
      comment: '丁寧に教えてもらえました',
      createdAt: NOW,
    },
  ];
  for (const r of ratings) repo.upsertRating(r);

  // ---- earnings サンプル ----
  const earnings: Earning[] = [
    {
      id: 'earn-001',
      workerId: w1.id,
      hireId: hireCompleted1.id,
      amount: 1100 * 20,
      workedOn: d(-25),
      createdAt: NOW,
    },
    {
      id: 'earn-002',
      workerId: w1.id,
      hireId: hireCompleted1.id,
      amount: 1100 * 20,
      workedOn: d(-18),
      createdAt: NOW,
    },
  ];
  for (const e of earnings) repo.insertEarning(e);
}
