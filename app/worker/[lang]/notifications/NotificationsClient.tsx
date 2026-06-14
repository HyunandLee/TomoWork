'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/app/worker/dictionaries';
import type { NotificationView } from '@/lib/api/contracts';
import { IconBell } from '@tabler/icons-react';

type Props = {
  lang: string;
  d: Dictionary['notifications'];
};

function monthLabel(month: string | undefined, lang: string): string {
  if (!month) return '';
  const [, m] = month.split('-');
  if (lang === 'ja') return `${Number(m)}月`;
  if (lang === 'vi') return `Tháng ${Number(m)}`;
  if (lang === 'ku') return `Meha ${Number(m)}`;
  return `Month ${Number(m)}`;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export default function NotificationsClient({ lang, d }: Props) {
  const [items, setItems] = useState<NotificationView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setItems(res.data.items);
        setLoading(false);
        // 一覧を開いたら既読にする
        fetch('/api/notifications', { method: 'POST' }).catch(() => {});
      });
  }, []);

  if (loading) {
    return (
      <div className="page-body tw-page">
        <div className="text-center"><span className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1>{d.title}</h1>
          <p>{d.description}</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}><IconBell size={16} stroke={1.75} aria-hidden /></span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><IconBell size={48} stroke={1.5} aria-hidden /></div>
          <h3>{d.empty}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {items.map((n) => {
            const employer = n.employerName ?? '—';
            const month = monthLabel(n.month, lang);
            const isSalary = n.type === 'salary_updated';
            const t = isSalary ? d.salary_updated : d.review_request;
            const body = fill(t.body, {
              employer,
              month,
              amount: n.amount != null ? n.amount.toLocaleString() : '',
            });
            return (
              <div key={n.id} className="card" style={n.isRead ? undefined : { borderLeft: '4px solid var(--tw-primary)' }}>
                <div className="tw-row" style={{ alignItems: 'flex-start', gap: '.75rem' }}>
                  <span className="tw-avatar" style={isSalary ? undefined : { background: 'var(--tw-coral, #f97316)' }}>
                    {isSalary ? '¥' : '★'}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>{t.title}</div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.9rem', marginTop: '.15rem' }}>{body}</div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.72rem', marginTop: '.35rem' }}>
                      {n.createdAt.slice(0, 16).replace('T', ' ')}
                    </div>
                    {!isSalary && n.hireId && (
                      <Link
                        href={`/worker/${lang}/rate?hireId=${n.hireId}`}
                        className="btn btn-primary btn-sm mt-sm"
                      >
                        {d.review_request.cta}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
