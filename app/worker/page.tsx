import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/app/worker/dictionaries';

export default function WorkerRoot() {
  redirect(`/worker/${DEFAULT_LOCALE}`);
}
