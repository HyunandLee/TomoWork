// tw-screens-a.jsx — さがす / 仕事詳細 / しごと
// Depends on tw-ui, tw-data globals.

// ── Job card (list item) ───────────────────────────────────
function JobCard({ job, onOpen, compact }) {
  const e = EMPLOYERS[job.emp];
  return (
    <Card onClick={() => onOpen(job)} pad={0} style={{ overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <Placeholder label={job.img} h={compact ? 104 : 128} r={0} tone={e.tone} />
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {job.hot && <span style={{ background: 'var(--tw-coral)', color: '#fff', fontSize: 11.5, fontWeight: 800, padding: '4px 9px', borderRadius: 999 }}>🔥 にんき</span>}
          {job.soft && <span style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--tw-primary-dark)', fontSize: 11.5, fontWeight: 800, padding: '4px 9px', borderRadius: 999 }}>ふりがな OK</span>}
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 12px -6px rgba(0,0,0,0.4)' }}>
          <Yen amount={job.pay} unit={'/' + (job.payType === 'h' ? '時間' : '日')} size={20} />
        </div>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <Avatar emoji={e.emoji} tone={e.tone} size={28} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tw-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
          <RatingPill value={e.rating} count={e.count} size={13} />
        </div>
        <h3 style={{ margin: '0 0 9px', fontSize: 17, fontWeight: 800, color: 'var(--tw-ink)', letterSpacing: -0.3, lineHeight: 1.3 }}>{job.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, color: 'var(--tw-muted)', fontSize: 13, fontWeight: 600, marginBottom: 11 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic.cal s={14} c="var(--tw-muted)" />{job.date}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic.clock s={14} c="var(--tw-muted)" />{job.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--tw-muted)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
          <Ic.pin s={14} c="var(--tw-primary)" />
          <ruby>{job.station}<rt>{job.stationY}</rt></ruby>
          <span style={{ opacity: 0.7 }}>· あるいて {job.walk}分</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.tags.map((t, i) => <Tag key={i} tone={t[1]}>{t[0]}</Tag>)}
        </div>
      </div>
    </Card>
  );
}

// ── Find screen ────────────────────────────────────────────
function FindScreen({ onOpen }) {
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('すべて');
  const [softOnly, setSoftOnly] = React.useState(false);
  const cats = ['すべて', 'いんしょく', 'けいさぎょう', 'せいそう', 'こうじょう', 'うんぱん'];
  const filtered = JOBS.filter(j =>
    (cat === 'すべて' || j.cat === cat) &&
    (!softOnly || j.soft) &&
    (q === '' || j.title.includes(q) || EMPLOYERS[j.emp].name.includes(q) || j.station.includes(q))
  );
  const reco = filtered.filter(j => j.hot);
  const rest = filtered.filter(j => !j.hot);

  return (
    <div>
      {/* greeting header */}
      <div style={{ padding: '8px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar emoji={ME.emoji} tone={ME.tone} size={46} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600 }}><R k="今日" y="きょう" />も おつかれさま 👋</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--tw-ink)' }}>{ME.name} さん</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--tw-card)', border: '1px solid var(--tw-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Ic.bell s={21} c="var(--tw-ink)" />
            <span style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: '50%', background: 'var(--tw-coral)', border: '2px solid #fff' }} />
          </div>
        </div>
        {/* this month earnings strip */}
        <div style={{ marginTop: 14, background: 'var(--tw-primary)', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: '0 10px 22px -12px color-mix(in oklab, var(--tw-primary) 80%, #000)' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.9 }}><R k="今月" y="こんげつ" />の おかね</div>
            <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 27, letterSpacing: -0.5, lineHeight: 1.15 }}>¥{ME.monthEarned.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 11px' }}>
              <Star filled size={15} color="#fff" />
              <span style={{ fontWeight: 800, fontFamily: 'var(--tw-num)', fontSize: 15 }}>{ME.rating}</span>
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 5, fontWeight: 600 }}>あなたの ひょうか</div>
          </div>
        </div>
      </div>

      {/* search */}
      <div style={{ padding: '0 18px', position: 'sticky', top: 0, zIndex: 4, background: 'var(--tw-bg)', paddingBottom: 10, paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--tw-card)', border: '1px solid var(--tw-line)', borderRadius: 16, padding: '12px 15px', boxShadow: '0 6px 16px -14px rgba(23,59,55,0.5)' }}>
          <Ic.search s={20} c="var(--tw-muted)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="しごと・えき・おみせ で さがす"
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, fontFamily: 'inherit', fontWeight: 600, color: 'var(--tw-ink)', background: 'transparent', minWidth: 0 }} />
        </div>
        {/* category chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 11, paddingBottom: 2, msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="tw-noscroll">
          <button onClick={() => setSoftOnly(s => !s)} style={chipStyle(softOnly, true)}>
            {softOnly ? '✓ ' : ''}ふりがな OK
          </button>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={chipStyle(cat === c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* lists */}
      <div style={{ padding: '4px 18px 8px' }}>
        {reco.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <SectionHead>あなたに おすすめ ✨</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reco.map(j => <JobCard key={j.id} job={j} onOpen={onOpen} />)}
            </div>
          </div>
        )}
        <SectionHead>{reco.length > 0 ? 'ほかの しごと' : 'しごと いちらん'}</SectionHead>
        {rest.length === 0 && reco.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 28, color: 'var(--tw-muted)', fontWeight: 700 }}>
            みつかりませんでした 🐟<br /><span style={{ fontSize: 13, fontWeight: 600 }}>べつの ことばで さがしてね</span>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {rest.map(j => <JobCard key={j.id} job={j} onOpen={onOpen} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function chipStyle(active, accent) {
  return {
    border: 'none', borderRadius: 999, padding: '9px 15px', fontSize: 13.5, fontWeight: 700,
    fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
    background: active ? (accent ? 'var(--tw-coral)' : 'var(--tw-primary)') : 'var(--tw-card)',
    color: active ? '#fff' : 'var(--tw-ink)',
    boxShadow: active ? 'none' : 'inset 0 0 0 1px var(--tw-line)',
  };
}

// ── Job detail (full screen overlay) ───────────────────────
function JobDetail({ job, applied, onApply, onClose, onSeeReviews, goDocs }) {
  const e = EMPLOYERS[job.emp];
  const visaOk = job.visa.includes(ME.visa);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--tw-bg)', zIndex: 30, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
        {/* hero */}
        <div style={{ position: 'relative' }}>
          <Placeholder label={job.img} h={230} r={0} tone={e.tone} />
          <button onClick={onClose} style={{ position: 'absolute', top: 56, left: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.3)' }}>
            <Ic.chevL s={22} c="var(--tw-ink)" />
          </button>
        </div>
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {job.tags.map((t, i) => <Tag key={i} tone={t[1]}>{t[0]}</Tag>)}
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800, color: 'var(--tw-ink)', letterSpacing: -0.4, lineHeight: 1.3 }}>{job.title}</h1>

          {/* employer row */}
          <Card onClick={onSeeReviews} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Avatar emoji={e.emoji} tone={e.tone} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--tw-ink)' }}>{e.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Stars value={e.rating} size={15} />
                <span style={{ fontWeight: 800, fontFamily: 'var(--tw-num)', fontSize: 14, color: 'var(--tw-ink)' }}>{e.rating}</span>
                <span style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600 }}>くちこみ {e.count}</span>
              </div>
            </div>
            <Ic.chevR s={18} c="var(--tw-muted)" />
          </Card>

          {/* key facts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <Fact icon={<Ic.cal s={18} c="var(--tw-primary)" />} label="ひにち" value={job.date} />
            <Fact icon={<Ic.clock s={18} c="var(--tw-primary)" />} label="じかん" value={job.time} sub={`${job.hours}時間`} />
            <Fact icon={<Ic.pin s={18} c="var(--tw-primary)" />} label="ばしょ" value={<ruby>{job.station}<rt>{job.stationY}</rt></ruby>} sub={`あるいて ${job.walk}分`} />
            <Fact icon={<Ic.spark s={18} c="var(--tw-primary)" />} label="きゅうりょう" value={`¥${job.pay.toLocaleString()}`} sub={'1' + (job.payType === 'h' ? '時間' : '日') + 'あたり'} />
          </div>

          {/* map placeholder */}
          <Placeholder label={'map · ' + job.station} h={120} tone={e.tone} />

          {/* body — やさしい日本語 */}
          <div style={{ marginTop: 18 }}>
            <SectionHead>しごとの ないよう</SectionHead>
            <Card pad={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {job.body.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--tw-primary-soft)', color: 'var(--tw-primary-dark)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--tw-num)' }}>{i + 1}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--tw-ink)', lineHeight: 1.55, paddingTop: 1 }}>{b}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* bring / wear */}
          <div style={{ marginTop: 16 }}>
            <SectionHead>もちもの・ふくそう</SectionHead>
            <Card pad={16}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tw-muted)', marginBottom: 7 }}>もちもの</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                {job.bring.map((b, i) => <Tag key={i} tone="plain">{b}</Tag>)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tw-muted)', marginBottom: 7 }}>ふくそう</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--tw-ink)' }}>{job.wear}</div>
            </Card>
          </div>

          {/* visa check */}
          <div style={{ marginTop: 16 }}>
            <SectionHead>はたらける ビザ</SectionHead>
            <Card pad={16} style={{ borderColor: visaOk ? 'color-mix(in oklab, var(--tw-primary) 30%, #fff)' : 'var(--tw-coral)', background: visaOk ? 'color-mix(in oklab, var(--tw-primary) 6%, #fff)' : 'var(--tw-coral-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: visaOk ? 'var(--tw-primary)' : 'var(--tw-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic.check s={18} c="#fff" />
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)' }}>
                  {visaOk ? 'あなたの ビザで はたらけます' : 'ビザを かくにん してください'}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {job.visa.map((v, i) => (
                  <span key={i} style={{ background: v === ME.visa ? 'var(--tw-primary)' : 'rgba(23,59,55,0.06)', color: v === ME.visa ? '#fff' : 'var(--tw-muted)', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700 }}>{v}</span>
                ))}
              </div>
              <button onClick={goDocs} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', color: 'var(--tw-primary-dark)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                <Ic.doc s={16} c="var(--tw-primary-dark)" /> 書類は アプリが じどうで つくります <Ic.chevR s={14} c="var(--tw-primary-dark)" />
              </button>
            </Card>
          </div>
        </div>
      </div>

      {/* sticky apply bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 18px 30px', background: 'linear-gradient(to top, var(--tw-bg) 70%, transparent)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11.5, color: 'var(--tw-muted)', fontWeight: 700 }}>きゅうりょう</div>
          <Yen amount={job.pay} unit={'/' + (job.payType === 'h' ? '時間' : '日')} size={23} />
        </div>
        <div style={{ flex: 1 }}>
          {applied ? (
            <Btn full kind="soft" disabled><Ic.check s={18} c="var(--tw-primary-dark)" /> おうぼ しました</Btn>
          ) : (
            <Btn full kind="primary" onClick={() => onApply(job)}>この しごとに おうぼする</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ icon, label, value, sub }) {
  return (
    <div style={{ background: 'var(--tw-card)', border: '1px solid var(--tw-line)', borderRadius: 16, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon}<span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tw-muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tw-ink)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--tw-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, { JobCard, FindScreen, JobDetail, Fact, chipStyle });
