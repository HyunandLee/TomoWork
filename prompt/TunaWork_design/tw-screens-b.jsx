// tw-screens-b.jsx — しごと（応募状況・シフト）＋ 相互評価フロー
// Depends on tw-ui, tw-data, tw-screens-a globals.

function StatusBadge({ status }) {
  const map = {
    kettei: { t: '✓ けってい', bg: 'var(--tw-primary)', fg: '#fff' },
    oubo: { t: 'おうぼ中', bg: 'var(--tw-coral-soft)', fg: '#C2452A' },
  };
  const s = map[status] || map.oubo;
  return <span style={{ background: s.bg, color: s.fg, fontSize: 12.5, fontWeight: 800, padding: '5px 11px', borderRadius: 999 }}>{s.t}</span>;
}

function ScreenHeader({ title, sub }) {
  return (
    <div style={{ padding: '6px 18px 4px' }}>
      <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800, color: 'var(--tw-ink)', letterSpacing: -0.5 }}>{title}</h1>
      {sub && <div style={{ fontSize: 13.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ── しごと screen ───────────────────────────────────────────
function JobsScreen({ onOpen, onRate }) {
  const [tab, setTab] = React.useState('soon');
  return (
    <div>
      <ScreenHeader title="しごと" sub="おうぼちゅう・これから・おわった しごと" />
      {/* segmented */}
      <div style={{ display: 'flex', gap: 4, margin: '14px 18px 6px', background: 'rgba(23,59,55,0.06)', borderRadius: 14, padding: 4 }}>
        {[['soon', 'これから'], ['done', 'おわった']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, border: 'none', borderRadius: 11, padding: '9px 0', fontSize: 14.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
            background: tab === k ? 'var(--tw-card)' : 'transparent', color: tab === k ? 'var(--tw-ink)' : 'var(--tw-muted)',
            boxShadow: tab === k ? '0 2px 6px -3px rgba(23,59,55,0.3)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: '10px 18px 8px' }}>
        {tab === 'soon' ? <UpcomingList onOpen={onOpen} /> : <DoneList onRate={onRate} onOpen={onOpen} />}
      </div>
    </div>
  );
}

function UpcomingList({ onOpen }) {
  const next = MY_UPCOMING.find(m => m.status === 'kettei');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* next confirmed — hero */}
      {next && (() => {
        const job = JOBS.find(j => j.id === next.jobId);
        const e = EMPLOYERS[job.emp];
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tw-primary-dark)', marginBottom: 9, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ic.spark s={16} c="var(--tw-primary)" /> つぎの しごと
            </div>
            <Card pad={0} style={{ overflow: 'hidden', borderColor: 'color-mix(in oklab, var(--tw-primary) 30%, #fff)' }}>
              <div style={{ background: 'var(--tw-primary)', color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Ic.cal s={18} c="#fff" />
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{job.date} · {job.time}</span>
                </div>
                <StatusBadge status="kettei" />
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
                  <Avatar emoji={e.emoji} tone={e.tone} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tw-ink)' }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600 }}>{e.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tw-muted)', fontSize: 13.5, fontWeight: 600, marginBottom: 14 }}>
                  <Ic.pin s={15} c="var(--tw-primary)" /><ruby>{job.station}<rt>{job.stationY}</rt></ruby><span style={{ opacity: 0.7 }}>· あるいて {job.walk}分</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn kind="primary" size="sm" onClick={() => onOpen(job)} full><Ic.chat s={16} c="#fff" /> れんらく する</Btn>
                  <Btn kind="ghost" size="sm" onClick={() => onOpen(job)} full><Ic.pin s={16} c="var(--tw-ink)" /> ちずを みる</Btn>
                </div>
              </div>
            </Card>
          </div>
        );
      })()}

      {/* applied (pending) */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tw-muted)', marginBottom: 9 }}>おうぼ中（へんじ まち）</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MY_UPCOMING.filter(m => m.status === 'oubo').map(m => {
            const job = JOBS.find(j => j.id === m.jobId);
            const e = EMPLOYERS[job.emp];
            return (
              <Card key={m.jobId} onClick={() => onOpen(job)} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar emoji={e.emoji} tone={e.tone} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>{job.date} · {job.time}</div>
                </div>
                <StatusBadge status="oubo" />
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DoneList({ onRate, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {MY_DONE.map(m => {
        const job = JOBS.find(j => j.id === m.jobId);
        const e = EMPLOYERS[job.emp];
        return (
          <Card key={m.jobId}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: m.rated ? 0 : 12 }}>
              <Avatar emoji={e.emoji} tone={e.tone} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>{m.date} · {m.hoursWorked}時間</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 17, color: 'var(--tw-ink)' }}>+¥{m.earned.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--tw-primary-dark)', fontWeight: 700 }}>しはらいずみ</div>
              </div>
            </div>
            {m.rated ? (
              <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--tw-line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 700 }}>あなたの ひょうか</span>
                <Stars value={m.ratedStars} size={15} />
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600 }}>ありがとう 🙌</span>
              </div>
            ) : (
              <Btn full kind="coral" size="sm" onClick={() => onRate(job)}>
                <Star filled size={16} color="#fff" /> この おみせを ひょうか する
              </Btn>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Rating modal (mutual rating) ───────────────────────────
function RatingModal({ job, onClose, onDone }) {
  const e = EMPLOYERS[job.emp];
  const [stars, setStars] = React.useState(0);
  const [picked, setPicked] = React.useState([]);
  const [step, setStep] = React.useState('rate'); // rate | thanks
  const toggle = (t) => setPicked(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const labels = ['', 'いまいち', 'ふつう', 'よかった', 'とても よかった', 'さいこう！'];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,40,37,0.45)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', background: 'var(--tw-bg)', borderRadius: '28px 28px 0 0', maxHeight: '92%', overflow: 'auto', paddingBottom: 30, animation: 'tw-sheet .32s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'rgba(23,59,55,0.18)' }} />
        </div>

        {step === 'rate' ? (
          <div style={{ padding: '8px 20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 40 }}>🐟</div>
              <h2 style={{ margin: '4px 0 4px', fontSize: 22, fontWeight: 800, color: 'var(--tw-ink)' }}>おつかれさま！</h2>
              <div style={{ fontSize: 14, color: 'var(--tw-muted)', fontWeight: 600 }}>きょうの おみせは どうでしたか？</div>
            </div>

            <Card style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '14px 0' }}>
              <Avatar emoji={e.emoji} tone={e.tone} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--tw-ink)' }}>{e.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600 }}>{job.title}</div>
              </div>
            </Card>

            {/* stars */}
            <div style={{ background: 'var(--tw-card)', border: '1px solid var(--tw-line)', borderRadius: 22, padding: '20px 16px', textAlign: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={40} filled={stars >= i} onClick={() => setStars(i)} />
                ))}
              </div>
              <div style={{ height: 22, fontSize: 16, fontWeight: 800, color: stars ? 'var(--tw-coral)' : 'var(--tw-muted)' }}>{stars ? labels[stars] : 'ほしを タップ'}</div>
            </div>

            {/* tags */}
            <div style={{ opacity: stars ? 1 : 0.4, pointerEvents: stars ? 'auto' : 'none', transition: 'opacity .2s' }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 10 }}>よかった ところは？（えらべる）</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {GIVE_TAGS.map(t => (
                  <button key={t} onClick={() => toggle(t)} style={{
                    border: 'none', borderRadius: 999, padding: '9px 14px', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                    background: picked.includes(t) ? 'var(--tw-primary)' : 'var(--tw-card)',
                    color: picked.includes(t) ? '#fff' : 'var(--tw-ink)',
                    boxShadow: picked.includes(t) ? 'none' : 'inset 0 0 0 1.5px var(--tw-line)',
                  }}>{picked.includes(t) ? '✓ ' : ''}{t}</button>
                ))}
              </div>
            </div>

            <Btn full kind="primary" disabled={!stars} onClick={() => setStep('thanks')}>ひょうかを おくる</Btn>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 12 }}>
              おみせも あなたを ひょうかします。<br />おたがいに ★ を つけると、つぎの しごとが みつけやすく なります。
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 24px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 6 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 23, fontWeight: 800, color: 'var(--tw-ink)' }}>ありがとう！</h2>
            <div style={{ fontSize: 14.5, color: 'var(--tw-muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 20 }}>
              ひょうかを おくりました。<br />おみせからの ひょうかも とどきました 👇
            </div>
            <Card style={{ background: 'var(--tw-primary)', border: 'none', color: '#fff', padding: 20, marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>{e.name} からの ひょうか</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} filled size={26} color="#fff" />)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
                {['じかんどおり', 'まじめ', 'また きてほしい'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: '5px 11px', fontSize: 12.5, fontWeight: 700 }}>{t}</span>
                ))}
              </div>
            </Card>
            <div style={{ fontSize: 13.5, color: 'var(--tw-ink)', fontWeight: 700, marginBottom: 18 }}>
              あなたの ひょうかは <span style={{ color: 'var(--tw-coral)', fontFamily: 'var(--tw-num)' }}>★ 4.9</span> に なりました
            </div>
            <Btn full kind="primary" onClick={() => onDone(job)}>とじる</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { JobsScreen, RatingModal, ScreenHeader });
