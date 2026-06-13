// tw-employer-screens-b.jsx — Applicants / Hire+AutoDoc / Shifts+Rate / Docs / PostJob
// Depends on tw-ui, tw-employer-data, tw-employer-screens-a globals.

function FlagAvatar({ a, size = 46 }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <Avatar emoji={a.emoji} tone={a.tone} size={size} />
      <span style={{ position: 'absolute', bottom: -2, right: -3, fontSize: size * 0.34 }}>{a.flag}</span>
    </div>
  );
}

function VisaBadge({ ok }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: ok ? 'var(--tw-primary-soft)' : 'var(--tw-coral-soft)', color: ok ? 'var(--tw-primary-dark)' : '#C2452A', fontSize: 12, fontWeight: 800, padding: '5px 11px', borderRadius: 999 }}>
      {ok ? <Ic.shield s={14} c="var(--tw-primary-dark)" /> : <Ic.shield s={14} c="#C2452A" />}
      {ok ? 'はたらけます' : '要確認'}
    </span>
  );
}

// ── Applicants view ────────────────────────────────────────
function ApplicantsView({ onHire }) {
  const [filter, setFilter] = React.useState('all');
  const posts = [['all', 'すべて'], ...POSTINGS.filter(p => p.status === 'open').map(p => [p.id, p.title])];
  const list = APPLICANTS.filter(a => filter === 'all' || a.posting === filter);

  return (
    <div style={{ padding: 26 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {posts.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            border: 'none', borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            background: filter === k ? 'var(--tw-primary)' : '#fff', color: filter === k ? '#fff' : 'var(--tw-ink)',
            boxShadow: filter === k ? 'none' : 'inset 0 0 0 1px var(--tw-line)',
          }}>{l}{k !== 'all' && ` (${APPLICANTS.filter(a => a.posting === k).length})`}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {list.map(a => {
          const post = POSTINGS.find(p => p.id === a.posting);
          return (
            <ECard key={a.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, marginBottom: 14 }}>
                <FlagAvatar a={a} size={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--tw-ink)' }}>{a.name}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600 }}>（{a.kana}）</span>
                    {a.new && <span style={{ background: 'var(--tw-coral-soft)', color: '#C2452A', fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>NEW</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>{a.country} · {post.title}に応募 · {a.applied}</div>
                </div>
                <RatingPill value={a.rating} count={a.count} size={14} />
              </div>

              {/* check row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 13 }}>
                <VisaBadge ok={a.visaOk} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(23,59,55,0.05)', color: 'var(--tw-ink)', fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 999 }}>在留：{a.visa}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(23,59,55,0.05)', color: 'var(--tw-ink)', fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 999 }}>日本語：{a.jlpt}</span>
                {a.weekRemain != null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(23,59,55,0.05)', color: 'var(--tw-ink)', fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 999 }}>今週あと {a.weekRemain}h</span>}
              </div>

              {/* tags */}
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tw-muted)', marginBottom: 7 }}>これまでの 雇い主から</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {a.tags.map((t, i) => <Tag key={i} tone="plain">「{t}」</Tag>)}
                <span style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600, alignSelf: 'center' }}>· {a.exp}</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, border: 'none', borderRadius: 11, padding: '11px 0', fontSize: 13.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', background: 'rgba(23,59,55,0.05)', color: 'var(--tw-muted)' }}>見送る</button>
                <div style={{ flex: 2 }}><Btn full kind="primary" size="sm" onClick={() => onHire(a)}>採用する</Btn></div>
              </div>
            </ECard>
          );
        })}
      </div>
    </div>
  );
}

// ── Hire modal (auto Hello Work doc) ───────────────────────
function HireModal({ applicant: a, onClose }) {
  const post = POSTINGS.find(p => p.id === a.posting);
  const [step, setStep] = React.useState('confirm'); // confirm | generating | done
  const fields = HELLOWORK_FIELDS(a);

  React.useEffect(() => {
    if (step === 'generating') {
      const t = setTimeout(() => setStep('done'), 1300);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <Overlay onClose={onClose} width={step === 'done' ? 620 : 480}>
      {step === 'confirm' && (
        <div style={{ padding: 26 }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 800, color: 'var(--tw-ink)' }}>このワーカーを 採用しますか？</h2>
          <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600, marginBottom: 18 }}>採用すると、ハローワークへの 提出書類が 自動で できます。</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'var(--tw-bg)', borderRadius: 14, marginBottom: 16 }}>
            <FlagAvatar a={a} size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--tw-ink)' }}>{a.name}（{a.kana}）</div>
              <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>{a.country} · 在留：{a.visa} · 日本語 {a.jlpt}</div>
            </div>
            <RatingPill value={a.rating} count={a.count} size={14} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, padding: '12px 14px', background: 'var(--tw-bg)', borderRadius: 12 }}>
              <div style={{ fontSize: 11.5, color: 'var(--tw-muted)', fontWeight: 700 }}>仕事</div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--tw-ink)', marginTop: 3 }}>{post.title}</div>
            </div>
            <div style={{ flex: 1, padding: '12px 14px', background: 'var(--tw-bg)', borderRadius: 12 }}>
              <div style={{ fontSize: 11.5, color: 'var(--tw-muted)', fontWeight: 700 }}>時給</div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--tw-ink)', marginTop: 3 }}>¥{post.wage.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', background: 'var(--tw-primary-soft)', borderRadius: 12, marginBottom: 20 }}>
            <Ic.shield s={18} c="var(--tw-primary-dark)" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tw-primary-dark)', lineHeight: 1.4 }}>在留資格は チェックずみ。この仕事で <b>はたらけます</b>。</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ flex: 1, border: 'none', borderRadius: 13, padding: '13px 0', fontSize: 14.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', background: 'rgba(23,59,55,0.05)', color: 'var(--tw-muted)' }}>キャンセル</button>
            <div style={{ flex: 2 }}><Btn full kind="primary" onClick={() => setStep('generating')}>採用して 書類を作る</Btn></div>
          </div>
        </div>
      )}

      {step === 'generating' && (
        <div style={{ padding: '50px 26px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--tw-primary-soft)', borderTopColor: 'var(--tw-primary)', margin: '0 auto 18px', animation: 'tw-spin .9s linear infinite' }} />
          <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--tw-ink)' }}>書類を 自動作成中…</div>
          <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 6 }}>在留カード情報から 外国人雇用状況届出書を つくっています</div>
        </div>
      )}

      {step === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '82vh' }}>
          <div style={{ padding: '24px 26px 16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic.check s={24} c="#fff" /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--tw-ink)' }}>{a.name} さんを 採用しました 🎉</h2>
                <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>提出書類が 自動で できました。中身を 確認してください。</div>
              </div>
            </div>
          </div>
          {/* document preview */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 26px' }} className="tw-scroll">
            <div style={{ border: '1px solid var(--tw-line)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ background: 'var(--tw-ink)', color: '#fff', padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800 }}>外国人雇用状況届出書</div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, marginTop: 2 }}>様式第3号 · ハローワーク提出用</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.16)', fontSize: 11, fontWeight: 800, padding: '5px 10px', borderRadius: 999 }}><Ic.spark s={13} c="#fff" />自動入力</span>
              </div>
              <div>
                {fields.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < fields.length - 1 ? '1px solid var(--tw-line)' : 'none' }}>
                    <div style={{ width: 150, fontSize: 12.5, fontWeight: 700, color: 'var(--tw-muted)', flexShrink: 0 }}>{f.label}</div>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 800, color: 'var(--tw-ink)' }}>{f.value}</div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--tw-primary-dark)', background: 'var(--tw-primary-soft)', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>{f.src}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 2px 4px', fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600 }}>
              <Ic.clock s={15} c="var(--tw-muted)" /> 提出期限：採用した月の 翌月末日まで。TunaWork から 電子申請も できます。
            </div>
          </div>
          <div style={{ padding: 20, display: 'flex', gap: 12, flexShrink: 0, borderTop: '1px solid var(--tw-line)' }}>
            <button onClick={onClose} style={{ flex: 1, border: 'none', borderRadius: 13, padding: '13px 0', fontSize: 14.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', background: 'rgba(23,59,55,0.05)', color: 'var(--tw-ink)' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic.dl s={17} c="var(--tw-ink)" />ダウンロード</span></button>
            <div style={{ flex: 1.4 }}><Btn full kind="primary" onClick={onClose}>確認して 完了</Btn></div>
          </div>
        </div>
      )}
    </Overlay>
  );
}

// ── Shifts + rating view ───────────────────────────────────
function ShiftsView({ onRate }) {
  return (
    <div style={{ padding: 26, display: 'flex', gap: 18, alignItems: 'flex-start' }}>
      {/* upcoming */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 13 }}>これからの シフト</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {HIRED.map(h => {
            const post = POSTINGS.find(p => p.id === h.posting);
            return (
              <ECard key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <FlagAvatar a={h} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)' }}>{h.name} <span style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600 }}>· {post.title}</span></div>
                  <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Ic.cal s={14} c="var(--tw-muted)" />{h.date} · {h.time}</div>
                </div>
                <StatusPill status="confirmed" />
              </ECard>
            );
          })}
        </div>
      </div>

      {/* to rate */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)' }}>評価まち</span>
          <span style={{ background: 'var(--tw-coral)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>{TO_RATE.length}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TO_RATE.map(r => {
            const post = POSTINGS.find(p => p.id === r.posting);
            return (
              <ECard key={r.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 13 }}>
                  <FlagAvatar a={r} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)' }}>{r.name} <span style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600 }}>· {post.title}</span></div>
                    <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>{r.date} · {r.hours}時間 · ¥{r.paid.toLocaleString()} 支払いずみ</div>
                  </div>
                </div>
                <Btn full kind="coral" size="sm" onClick={() => onRate(r)}><Star filled size={16} color="#fff" /> このワーカーを 評価する</Btn>
              </ECard>
            );
          })}
        </div>
        <div style={{ marginTop: 16, padding: 14, background: 'var(--tw-bg)', borderRadius: 12, fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600, lineHeight: 1.5 }}>
          🤝 おたがいに 評価する しくみ。あなたの 評価が ワーカーの 信頼スコアに なります。
        </div>
      </div>
    </div>
  );
}

// ── Rate worker modal (employer → worker) ──────────────────
function RateWorkerModal({ worker: w, onClose }) {
  const [stars, setStars] = React.useState(0);
  const [picked, setPicked] = React.useState([]);
  const [step, setStep] = React.useState('rate');
  const toggle = (t) => setPicked(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const labels = ['', 'いまひとつ', 'ふつう', 'よかった', 'とても よかった', 'さいこう！'];

  return (
    <Overlay onClose={onClose} width={460}>
      {step === 'rate' ? (
        <div style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
            <FlagAvatar a={w} size={50} />
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--tw-ink)' }}>{w.name} さんは どうでしたか？</h2>
              <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>おつかれさまでした · {w.date}</div>
            </div>
          </div>
          <div style={{ background: 'var(--tw-bg)', borderRadius: 16, padding: '20px 16px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={38} filled={stars >= i} onClick={() => setStars(i)} />)}
            </div>
            <div style={{ height: 20, fontSize: 15, fontWeight: 800, color: stars ? 'var(--tw-coral)' : 'var(--tw-muted)' }}>{stars ? labels[stars] : 'ほしを クリック'}</div>
          </div>
          <div style={{ opacity: stars ? 1 : 0.4, pointerEvents: stars ? 'auto' : 'none', transition: 'opacity .2s' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 9 }}>よかった ところ（えらべる）</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {WORKER_TAGS.map(t => (
                <button key={t} onClick={() => toggle(t)} style={{
                  border: 'none', borderRadius: 999, padding: '8px 13px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  background: picked.includes(t) ? 'var(--tw-primary)' : '#fff', color: picked.includes(t) ? '#fff' : 'var(--tw-ink)',
                  boxShadow: picked.includes(t) ? 'none' : 'inset 0 0 0 1.5px var(--tw-line)',
                }}>{picked.includes(t) ? '✓ ' : ''}{t}</button>
              ))}
            </div>
          </div>
          <Btn full kind="primary" disabled={!stars} onClick={() => setStep('thanks')}>評価を 送る</Btn>
        </div>
      ) : (
        <div style={{ padding: '26px 26px', textAlign: 'center' }}>
          <div style={{ fontSize: 46, marginBottom: 6 }}>🤝</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: 'var(--tw-ink)' }}>評価を 送りました！</h2>
          <div style={{ fontSize: 13.5, color: 'var(--tw-muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 18 }}>{w.name} さんの 信頼スコアに 反映されます。<br />{w.name} さんからの 評価も とどきました 👇</div>
          <div style={{ background: 'var(--tw-primary)', color: '#fff', borderRadius: 16, padding: 18, marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.9, marginBottom: 8 }}>{w.name} さんからの 評価</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>{[1, 2, 3, 4, 5].map(i => <Star key={i} filled size={24} color="#fff" />)}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
              {['ていねいに おしえてくれた', 'やさしい にほんご'].map(t => <span key={t} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 700 }}>{t}</span>)}
            </div>
          </div>
          <Btn full kind="primary" onClick={onClose}>とじる</Btn>
        </div>
      )}
    </Overlay>
  );
}

// ── Docs view ──────────────────────────────────────────────
function DocsView() {
  return (
    <div style={{ padding: 26 }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: 18, background: 'var(--tw-primary-soft)', borderRadius: 14, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic.shield s={21} c="#fff" /></div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tw-primary-dark)', lineHeight: 1.55 }}>
          外国人を 雇うと、<b>ハローワークへの 届出</b>が 必要です。TunaWork が ワーカーの 在留カード情報から <b>書類を 自動作成</b>。むずかしい 手続きは いりません。
        </div>
      </div>

      <div style={{ border: '1px solid var(--tw-line)', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', background: 'var(--tw-bg)', fontSize: 12, fontWeight: 800, color: 'var(--tw-muted)' }}>
          <div style={{ width: 150 }}>ワーカー</div>
          <div style={{ flex: 1 }}>書類</div>
          <div style={{ width: 200 }}>提出期限</div>
          <div style={{ width: 130 }}>状態</div>
          <div style={{ width: 110, textAlign: 'right' }}></div>
        </div>
        {EMP_DOCS.map((d, i) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', padding: '15px 18px', borderTop: '1px solid var(--tw-line)' }}>
            <div style={{ width: 150, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{d.flag}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--tw-ink)' }}>{d.worker}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--tw-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic.doc s={18} c="var(--tw-primary-dark)" /></div>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--tw-ink)' }}>{d.doc}</span>
              {d.auto && <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--tw-primary-dark)', background: 'var(--tw-primary-soft)', padding: '2px 7px', borderRadius: 6 }}>自動</span>}
            </div>
            <div style={{ width: 200, fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600 }}>{d.deadline}</div>
            <div style={{ width: 130 }}><StatusPill status={d.status} /></div>
            <div style={{ width: 110, textAlign: 'right' }}>
              {d.status === 'submitted'
                ? <span style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 700 }}>完了</span>
                : <button style={{ border: 'none', background: 'var(--tw-primary)', color: '#fff', fontSize: 12.5, fontWeight: 800, padding: '8px 14px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit' }}>提出する</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Post job modal ─────────────────────────────────────────
function PostJobModal({ onClose }) {
  const [done, setDone] = React.useState(false);
  const [soft, setSoft] = React.useState(true);
  const [cat, setCat] = React.useState('ホール');
  const field = (label, child) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 7 }}>{label}</div>
      {child}
    </div>
  );
  const inp = { width: '100%', border: '1px solid var(--tw-line)', borderRadius: 11, padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, color: 'var(--tw-ink)', outline: 'none', background: 'var(--tw-bg)', boxSizing: 'border-box' };

  return (
    <Overlay onClose={onClose} width={480}>
      {done ? (
        <div style={{ padding: '30px 26px', textAlign: 'center' }}>
          <div style={{ fontSize: 46, marginBottom: 8 }}>📣</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: 'var(--tw-ink)' }}>求人を 公開しました！</h2>
          <div style={{ fontSize: 13.5, color: 'var(--tw-muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 20 }}>近くの ワーカーに とどきます。<br />応募が きたら おしらせします。</div>
          <Btn full kind="primary" onClick={onClose}>とじる</Btn>
        </div>
      ) : (
        <div style={{ padding: 26 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: 'var(--tw-ink)' }}>新しい 求人を作る</h2>
          <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600, marginBottom: 20 }}>かんたん入力で すぐ 公開できます。</div>
          {field('職種', (
            <div style={{ display: 'flex', gap: 8 }}>
              {['ホール', 'キッチン', '清掃', 'その他'].map(c => (
                <button key={c} onClick={() => setCat(c)} style={{ flex: 1, border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', background: cat === c ? 'var(--tw-primary)' : 'var(--tw-bg)', color: cat === c ? '#fff' : 'var(--tw-ink)' }}>{c}</button>
              ))}
            </div>
          ))}
          {field('仕事のタイトル', <input style={inp} defaultValue="ホールスタッフ" />)}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1 }}>{field('時給（円）', <input style={inp} defaultValue="1300" />)}</div>
            <div style={{ flex: 1 }}>{field('募集人数', <input style={inp} defaultValue="3" />)}</div>
          </div>
          {field('シフト', <input style={inp} defaultValue="平日 10:00–15:00" />)}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--tw-coral-soft)', borderRadius: 12, marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9A3D26' }}>🈶 ふりがな・やさしい日本語サポート</div>
            <button onClick={() => setSoft(s => !s)} style={{ width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', background: soft ? 'var(--tw-coral)' : 'rgba(23,59,55,0.18)', position: 'relative', transition: 'background .2s' }}>
              <span style={{ position: 'absolute', top: 3, left: soft ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>
          <Btn full kind="primary" onClick={() => setDone(true)}>求人を 公開する</Btn>
        </div>
      )}
    </Overlay>
  );
}

// ── Overlay shell (centered modal) ─────────────────────────
function Overlay({ children, onClose, width = 480 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,40,37,0.5)', animation: 'tw-fade .2s' }} />
      <div style={{ position: 'relative', width, maxWidth: '100%', background: 'var(--tw-bg)', borderRadius: 22, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'tw-pop .26s cubic-bezier(.2,.9,.3,1.1)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(23,59,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
          <Ic.close s={16} c="var(--tw-ink)" />
        </button>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { ApplicantsView, HireModal, ShiftsView, RateWorkerModal, DocsView, PostJobModal, Overlay, FlagAvatar });
