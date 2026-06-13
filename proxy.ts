import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOCALES = ['ja', 'en', 'vi', 'ku'];
const WORKER_SUBPAGES = ['jobs', 'earnings', 'documents', 'consult', 'rate'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /worker/[segment] か /worker/[segment]/... にマッチ
  const m = pathname.match(/^\/worker\/([^/]+)(\/.*)?$/);
  if (!m) return;

  const segment = m[1];
  const rest = m[2] ?? '';

  // すでにロケールが付いていれば何もしない
  if (LOCALES.includes(segment)) return;

  // 旧パス（/worker/jobs など）をデフォルトロケールへリダイレクト
  if (WORKER_SUBPAGES.includes(segment)) {
    const url = request.nextUrl.clone();
    url.pathname = `/worker/ja/${segment}${rest}`;
    return NextResponse.redirect(url, { status: 308 });
  }
}

export const config = {
  matcher: ['/worker/:path+'],
};
