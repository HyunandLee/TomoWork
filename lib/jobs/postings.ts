// 求人投稿・一覧（employer は自社、worker は open のみ）。
import type { JobPosting } from '@/lib/types';
import { repo, now } from '@/lib/db/repo';
import { genId } from '@/lib/util/id';

export interface CreateJobInput {
  employerId: string;
  title: string;
  jobCategory: string;
  weeklyHours: number;
  hourlyWage: number;
  location: string;
}

export function createJob(input: CreateJobInput): JobPosting {
  const job: JobPosting = {
    id: genId('job'),
    employerId: input.employerId,
    title: input.title,
    jobCategory: input.jobCategory,
    weeklyHours: input.weeklyHours,
    hourlyWage: input.hourlyWage,
    location: input.location,
    status: 'open',
    createdAt: now(),
  };
  repo.insertJob(job);
  return job;
}

/** worker 向け: open の求人のみ。 */
export function listOpenJobs(): JobPosting[] {
  return repo.listOpenJobs();
}

/** employer 向け: 自社の求人のみ。 */
export function listJobsForEmployer(employerId: string): JobPosting[] {
  return repo.listJobsByEmployer(employerId);
}

export function closeJob(jobId: string): void {
  repo.setJobStatus(jobId, 'closed');
}
