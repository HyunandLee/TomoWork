// tw-employer-screens-a.jsx — Sidebar / TopBar / Dashboard / Jobs
// Depends on tw-ui, tw-employer-data globals.

// ── Desktop helpers ────────────────────────────────────────
function ECard({ children, style = {}, pad = 20, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 16, padding: pad, border: '1px solid var(--tw-line)',
      boxShadow: '0 1px 2px rgba(23,59,55,0.04)', cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

function StatusPill({ status }) {
  const map = {
    open: { t: '募集中', bg: 'var(--tw-primary-soft)', fg: 'var(--tw-primary-dark)', dot: 'var(--tw-primary)' },
    closed: { t: '終了', bg: 'rgba(23,59,55,0.06)', fg: 'var(--tw-muted)', dot: 'var(--tw-muted)' },
    confirmed: { t: '確定', bg: 'var(--tw-primary-soft)', fg: 'var(--tw-primary-dark)', dot: 'var(--tw-primary)' },
    ready: { t: '自動作成ずみ', bg: 'var(--tw-primary-soft)', fg: 'var(--tw-primary-dark)', dot: 'var(--tw-primary)' },
    submitted: { t: '提出ずみ', bg: 'rgba(23,59,55,0.06)', fg: 'var(--tw-muted)', dot: 'var(--tw-muted)' },
  };
  const s = map[status] || map.open;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.bg, color: s.fg, fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />{s.t}
    </span>
  );
}

// ── Sidebar ────────────────────────────────────────────────
function Sidebar({ view, setView }) {
  const items = [
    { k: 'dash', label: 'ダッシュボード', icon: Ic.spark },
    { k: 'jobs', label: '求人', icon: Ic.brief },
    { k: 'applicants', label: '応募者', icon: Ic.user, badge: APPLICANTS.filter(a => a.new).length },
    { k: 'shifts', label: 'シフト・評価', icon: Ic.cal, badge: TO_RATE.length },
    { k: 'docs', label: '書類', icon: Ic.doc, badge: EMP_DOCS.filter(d => d.status === 'ready').length },
  ];
  return (
    <div style={{ width: 236, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--tw-line)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--tw-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🐟</span>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--tw-ink)', lineHeight: 1 }}>TunaWork</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--tw-primary-dark)', letterSpacing: 1, marginTop: 2 }}>FOR BUSINESS</div>
        </div>
      </div>
      {/* shop switcher */}
      <div style={{ margin: '0 14px 14px', padding: '10px 12px', background: 'var(--tw-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: `color-mix(in oklab, ${SHOP.tone} 20%, #fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{SHOP.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tw-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{SHOP.name}</div>
          <div style={{ fontSize: 11, color: 'var(--tw-muted)', fontWeight: 600 }}>{SHOP.branch}</div>
        </div>
        <Ic.chevR s={15} c="var(--tw-muted)" />
      </div>
      {/* nav */}
      <div style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map(it => {
          const on = view === it.k;
          return (
            <button key={it.k} onClick={() => setView(it.k)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 11, border: 'none', cursor: 'pointer',
              background: on ? 'var(--tw-primary-soft)' : 'transparent', fontFamily: 'inherit', textAlign: 'left', width: '100%',
            }}>
              <it.icon s={20} c={on ? 'var(--tw-primary-dark)' : 'var(--tw-muted)'} w={on ? 2.3 : 2} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: on ? 800 : 700, color: on ? 'var(--tw-primary-dark)' : 'var(--tw-ink)' }}>{it.label}</span>
              {it.badge > 0 && <span style={{ background: 'var(--tw-coral)', color: '#fff', fontSize: 11, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{it.badge}</span>}
            </button>
          );
        })}
      </div>
      {/* support mini */}
      <div style={{ margin: 14, padding: 14, borderRadius: 14, background: 'var(--tw-coral-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
          <Ic.heartHand s={17} c="var(--tw-coral)" />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#9A3D26' }}>学びを 応援中</span>
        </div>
        <div style={{ fontSize: 11.5, color: '#9A3D26', fontWeight: 600, lineHeight: 1.45 }}>利用料の一部が ワーカーの日本語学習・生活相談に つかわれています。</div>
      </div>
    </div>
  );
}

// ── TopBar ─────────────────────────────────────────────────
const VIEW_TITLES = { dash: 'ダッシュボード', jobs: '求人', applicants: '応募者', shifts: 'シフト・評価', docs: '書類' };

function TopBar({ view, onPost }) {
  return (
    <div style={{ height: 64, flexShrink: 0, borderBottom: '1px solid var(--tw-line)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px' }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--tw-ink)', flex: 1 }}>{VIEW_TITLES[view]}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--tw-bg)', borderRadius: 11, padding: '8px 13px', width: 230 }}>
        <Ic.search s={17} c="var(--tw-muted)" />
        <input placeholder="ワーカー・求人を さがす" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontFamily: 'inherit', fontWeight: 600, color: 'var(--tw-ink)', flex: 1, minWidth: 0 }} />
      </div>
      <button style={{ width: 40, height: 40, borderRadius: 11, border: '1px solid var(--tw-line)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
        <Ic.bell s={20} c="var(--tw-ink)" />
        <span style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: '50%', background: 'var(--tw-coral)', border: '2px solid #fff' }} />
      </button>
      <Btn kind="primary" size="sm" onClick={onPost}>＋ 求人を出す</Btn>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 6 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--tw-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>佐</div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────
function KPI({ label, value, sub, accent }) {
  return (
    <ECard style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tw-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 28, color: accent || 'var(--tw-ink)', letterSpacing: -0.5, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--tw-muted)', marginTop: 7 }}>{sub}</div>}
    </ECard>
  );
}

function Dashboard({ setView, onHire, onRate }) {
  return (
    <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--tw-ink)' }}>おかえりなさい、{SHOP.owner.split(' ')[0]} さん 👋</div>
        <div style={{ fontSize: 13.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 3 }}>今日も いい採用を。新しい応募が {APPLICANTS.filter(a => a.new).length}件 とどいています。</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 16 }}>
        <KPI label="募集中の 求人" value={DASH.openJobs} sub="3職種で 募集中" />
        <KPI label="今週の 応募" value={DASH.weekApplicants} sub="先週より +4" accent="var(--tw-primary-dark)" />
        <KPI label="今月の 採用" value={DASH.hiredMonth} sub="目標 8人" />
        <KPI label="今月の 支払い" value={'¥' + DASH.paidMonth.toLocaleString()} sub="ワーカー報酬の合計" />
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        {/* left col */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* やること */}
          <ECard>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 14 }}>やること</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { ic: Ic.user, t: '新しい応募を 確認する', n: APPLICANTS.filter(a => a.new).length, cta: '応募者を見る', go: () => setView('applicants'), tone: 'var(--tw-coral)' },
                { ic: Ic.spark, t: 'ワーカーを 評価する', n: TO_RATE.length, cta: '評価する', go: () => setView('shifts'), tone: 'var(--tw-primary)' },
                { ic: Ic.doc, t: 'ハローワーク書類を 確認', n: EMP_DOCS.filter(d => d.status === 'ready').length, cta: '書類を見る', go: () => setView('docs'), tone: 'var(--tw-primary)' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px', background: 'var(--tw-bg)', borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in oklab, ${r.tone} 16%, #fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <r.ic s={19} c={r.tone} />
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--tw-ink)' }}>{r.t}</span>
                  <span style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 15, color: r.tone }}>{r.n}</span>
                  <button onClick={r.go} style={{ border: 'none', background: '#fff', color: 'var(--tw-primary-dark)', fontWeight: 800, fontSize: 12.5, padding: '7px 12px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'inset 0 0 0 1px var(--tw-line)' }}>{r.cta}</button>
                </div>
              ))}
            </div>
          </ECard>

          {/* 直近の応募者 */}
          <ECard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)' }}>直近の 応募者</div>
              <button onClick={() => setView('applicants')} style={{ border: 'none', background: 'none', color: 'var(--tw-primary-dark)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>すべて見る →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {APPLICANTS.slice(0, 4).map(a => {
                const post = POSTINGS.find(p => p.id === a.posting);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 6px', borderBottom: '1px solid var(--tw-line)' }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar emoji={a.emoji} tone={a.tone} size={38} />
                      <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 13 }}>{a.flag}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--tw-ink)' }}>{a.name}</span>
                        {a.new && <span style={{ background: 'var(--tw-coral-soft)', color: '#C2452A', fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>NEW</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600 }}>{post.title} に 応募 · {a.applied}</div>
                    </div>
                    <RatingPill value={a.rating} count={a.count} size={13} />
                    <Btn kind="primary" size="sm" onClick={() => onHire(a)}>採用する</Btn>
                  </div>
                );
              })}
            </div>
          </ECard>
        </div>

        {/* right col */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* support contribution */}
          <ECard style={{ background: 'var(--tw-ink)', border: 'none', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Ic.heartHand s={20} c="var(--tw-coral)" />
              <span style={{ fontSize: 14.5, fontWeight: 800 }}>学習・相談支援への 貢献</span>
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, marginBottom: 4 }}>今月の利用料のうち</div>
            <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 30, letterSpacing: -0.5 }}>¥{DASH.supportPool.toLocaleString()}</div>
            <div style={{ fontSize: 12.5, opacity: 0.8, fontWeight: 600, margin: '6px 0 14px', lineHeight: 1.5 }}>が ワーカーの 日本語学習・生活相談に つかわれました。あなたの お店が、はたらく人の毎日を ささえています。</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['日本語学習', 55], ['AI相談', 25], ['人の相談員', 20]].map(([l, p], i) => (
                <div key={i} style={{ flex: p, textAlign: 'center' }}>
                  <div style={{ height: 6, borderRadius: 99, background: i === 0 ? 'var(--tw-coral)' : i === 1 ? 'var(--tw-primary)' : '#fff', opacity: i === 2 ? 0.5 : 1, marginBottom: 6 }} />
                  <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.85 }}>{l}</div>
                </div>
              ))}
            </div>
          </ECard>

          {/* shop rating */}
          <ECard>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 12 }}>お店の 評価（ワーカーから）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 38, color: 'var(--tw-ink)', lineHeight: 1 }}>{SHOP.rating}</div>
              <div>
                <Stars value={SHOP.rating} size={16} />
                <div style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 3 }}>{SHOP.count}件の 評価</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {['ていねいに おしえてくれる', 'やさしい にほんご', 'また はたらきたい'].map((t, i) => (
                <Tag key={i} tone="soft">{t}</Tag>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 13, lineHeight: 1.5, paddingTop: 13, borderTop: '1px solid var(--tw-line)' }}>
              💡 評価が 高いと、いい ワーカーが 集まりやすく なります。
            </div>
          </ECard>
        </div>
      </div>
    </div>
  );
}

// ── Jobs view ──────────────────────────────────────────────
function JobsView({ onPost, setView }) {
  return (
    <div style={{ padding: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontSize: 14, color: 'var(--tw-muted)', fontWeight: 600 }}>{POSTINGS.filter(p => p.status === 'open').length}件 募集中 · {POSTINGS.length}件の 求人</div>
        <Btn kind="primary" size="sm" onClick={onPost}>＋ 新しい求人を作る</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {POSTINGS.map(p => {
          const pct = Math.min(100, Math.round(p.hired / p.need * 100));
          return (
            <ECard key={p.id} style={{ opacity: p.status === 'closed' ? 0.62 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--tw-ink)' }}>{p.title}</span>
                    {p.soft && <Tag tone="coral">ふりがな OK</Tag>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600 }}>{p.cat} · {p.shift}</div>
                </div>
                <StatusPill status={p.status} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 14 }}>
                <Yen amount={p.wage} unit="/時間" size={22} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--tw-muted)', marginBottom: 5 }}>
                    <span>採用 {p.hired} / {p.need}人</span><span>応募 {p.applicants}人</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'rgba(23,59,55,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: 'var(--tw-primary)', borderRadius: 99 }} />
                  </div>
                </div>
              </div>
              <button onClick={() => setView('applicants')} disabled={p.status === 'closed'} style={{
                width: '100%', border: 'none', borderRadius: 11, padding: '11px 0', fontSize: 13.5, fontWeight: 800, fontFamily: 'inherit',
                cursor: p.status === 'closed' ? 'default' : 'pointer',
                background: p.status === 'closed' ? 'rgba(23,59,55,0.06)' : 'var(--tw-primary-soft)',
                color: p.status === 'closed' ? 'var(--tw-muted)' : 'var(--tw-primary-dark)',
              }}>{p.status === 'closed' ? '募集を終了しました' : `応募者を見る（${p.applicants}）`}</button>
            </ECard>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ECard, StatusPill, Sidebar, TopBar, Dashboard, JobsView, KPI });
