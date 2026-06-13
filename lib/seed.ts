// シードデータ（dev用）。
// - アカウント: employer@example.com / worker@example.com / admin@example.com (PW: password)
// - ワーカー: 正常3種 + 地雷3種
// - 求人・完了済み就労・評価・稼ぎサンプル
import bcrypt from 'bcryptjs';
import { repo } from '@/lib/db/repo';
import { genId } from '@/lib/util/id';
import type { User, Worker, Employer, JobPosting, HireEvent, Rating, Earning } from '@/lib/types';

const NOW = new Date().toISOString();
const TODAY = NOW.slice(0, 10);

function d(offset: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().slice(0, 10);
}

export async function runSeed() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ---- employers ----
  const emp1: Employer = {
    id: 'emp-001',
    officeName: '株式会社サカナフーズ',
    officeAddress: '東京都渋谷区恵比寿1-1-1',
    helloWorkOffice: '渋谷公共職業安定所',
  };
  repo.insertEmployer(emp1);

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
  // 地雷①: 留学・許可あり・週40h（通常期→NG）
  const wMine1: Worker = {
    id: 'wkr-mine1',
    nameRoman: 'TANAKA ICHIRO',
    nameKana: 'タナカ イチロウ',
    birthDate: '2001-01-01',
    sex: '男',
    nationality: 'フィリピン',
    residenceStatus: '留学',
    residenceUntil: d(100),
    residenceCardNo: 'GH11223344IJ',
    hasActivityPermit: true,
  };
  // 地雷②: 在留期限切れ
  const wMine2: Worker = {
    id: 'wkr-mine2',
    nameRoman: 'PHAM THI HOAN',
    nameKana: 'ファム ティ ホアン',
    birthDate: '1999-07-22',
    sex: '女',
    nationality: 'ベトナム',
    residenceStatus: '留学',
    residenceUntil: d(-30), // 30日前に切れた
    residenceCardNo: 'IJ55667788KL',
    hasActivityPermit: true,
  };
  // 地雷③: 特定活動・就労不可
  const wMine3: Worker = {
    id: 'wkr-mine3',
    nameRoman: 'SINGH RAHUL',
    nameKana: 'シン ラフル',
    birthDate: '1997-11-30',
    sex: '男',
    nationality: 'インド',
    residenceStatus: '特定活動',
    residenceUntil: d(90),
    residenceCardNo: 'KL99001122MN',
    hasActivityPermit: false,
    designation: { workAllowed: false, weeklyCap: null },
  };

  for (const w of [w1, w2, w3, wMine1, wMine2, wMine3]) {
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
      employerId: emp1.id,
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
      employerId: emp1.id,
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
      title: '週40h勤務（地雷求人）',
      jobCategory: '事務',
      weeklyHours: 40,
      hourlyWage: 1300,
      location: '東京都千代田区',
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
    employerId: emp1.id,
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
  // 地雷ワーカー用pending（検証NG確認用）
  const hireMine1: HireEvent = {
    id: 'hire-mine1',
    workerId: wMine1.id,
    employerId: emp1.id,
    jobId: 'job-004',
    hireDate: TODAY,
    weeklyHours: 40,
    jobCategory: '事務',
    inLongVacation: false,
    wage: 1300,
    status: 'pending',
  };
  const hireMine2: HireEvent = {
    id: 'hire-mine2',
    workerId: wMine2.id,
    employerId: emp1.id,
    jobId: 'job-001',
    hireDate: TODAY,
    weeklyHours: 20,
    jobCategory: '飲食店',
    inLongVacation: false,
    wage: 1100,
    status: 'pending',
  };
  const hireMine3: HireEvent = {
    id: 'hire-mine3',
    workerId: wMine3.id,
    employerId: emp1.id,
    jobId: 'job-002',
    hireDate: TODAY,
    weeklyHours: 20,
    jobCategory: '小売',
    inLongVacation: false,
    wage: 1050,
    status: 'pending',
  };

  for (const h of [hireCompleted1, hireCompleted2, hirePending, hireMine1, hireMine2, hireMine3]) {
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
    employerId: emp1.id,
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
