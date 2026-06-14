import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { Locale } from '@/app/worker/dictionaries';
import { IconHeart } from '@tabler/icons-react';

export default async function WorkerConsultPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const d = dict.consult;

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1>{d.title}</h1>
          <p>{d.description}</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{d.secret_chip}</span>
      </div>

      <div className="tw-coral-panel">
        <div className="tw-row">
          <span className="tw-avatar" style={{ background: '#fff', color: 'var(--tw-coral)' }}><IconHeart size={22} stroke={1.75} aria-hidden /></span>
          <div>
            <div style={{ fontWeight: 800, color: '#9a3d26' }}>{d.free.title}</div>
            <div style={{ color: '#9a3d26', fontSize: '.88rem' }}>{d.free.desc}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{d.section_title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="tw-soft-panel tw-row-between">
            <div className="tw-row">
              <span className="tw-avatar">AI</span>
              <div>
                <div style={{ fontWeight: 800 }}>{d.ai.title}</div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.85rem' }}>{d.ai.desc}</div>
              </div>
            </div>
            <span className="tw-chip">{d.ai.chip}</span>
          </div>
          <div className="tw-soft-panel tw-row-between">
            <div className="tw-row">
              <span className="tw-avatar">人</span>
              <div>
                <div style={{ fontWeight: 800 }}>{d.human.title}</div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.85rem' }}>{d.human.desc}</div>
              </div>
            </div>
            <span className="tw-chip tw-chip-coral">{d.human.chip}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{d.topics_title}</div>
        <div className="tw-chip-list">
          {d.topics.map(([label]) => (
            <span key={label} className="tw-chip tw-chip-plain">{label}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', marginTop: '1rem' }}>
          {d.topics.map(([label, desc]) => (
            <div key={label} className="tw-row">
              <span className="tw-avatar" style={{ width: 34, height: 34 }}>{label.slice(0, 1)}</span>
              <div>
                <div style={{ fontWeight: 800 }}>{label}</div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.84rem' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
