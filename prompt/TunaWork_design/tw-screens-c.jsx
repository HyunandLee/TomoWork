// tw-screens-c.jsx — そうだん・まなぶ / しょるい（書類）/ マイページ
// Depends on tw-ui, tw-data, tw-screens-b, tw-consult globals.

const consultRow = {
  display: 'flex', alignItems: 'center', gap: 13, width: '100%',
  padding: '13px 16px', border: 'none', background: 'none', cursor: 'pointer',
  fontFamily: 'inherit',
};

// ── そうだん・まなぶ screen ─────────────────────────────────
function LearnScreen({ onConsult }) {
  return (
    <div>
      <ScreenHeader title="そうだん" sub="こまった ことを、人 や AI に きこう" />

      {/* funded banner */}
      <div style={{ margin: '14px 18px 0', background: 'var(--tw-coral-soft)', borderRadius: 18, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--tw-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic.heartHand s={22} c="#fff" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9A3D26', lineHeight: 1.45 }}>
          そうだんも べんきょうも <b>ぜんぶ むりょう</b>。<br />おみせの りようりょうで おうえん しています 💛
        </div>
      </div>

      {/* consult hero */}
      <div style={{ padding: '16px 18px 0' }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '15px 16px 6px' }}>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--tw-ink)' }}>こまった こと、ありませんか？ 🐟</div>
            <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 3 }}>ビザ・おかね・びょういん・しごとの なやみ…なんでも</div>
          </div>
          {/* AI row */}
          <button onClick={() => onConsult('ai')} style={consultRow}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic.bot s={26} c="#fff" />
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--tw-ink)', display: 'flex', alignItems: 'center', gap: 7 }}>AI に きく<span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--tw-primary-dark)', background: 'var(--tw-primary-soft)', padding: '2px 7px', borderRadius: 999 }}>すぐ</span></div>
              <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>24時間・やさしい日本語で すぐ こたえます</div>
            </div>
            <Ic.chevR s={18} c="var(--tw-muted)" />
          </button>
          <div style={{ height: 1, background: 'var(--tw-line)', margin: '0 16px' }} />
          {/* Human row */}
          <button onClick={() => onConsult('human')} style={consultRow}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--tw-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>👤</div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--tw-ink)' }}>人に そうだん する</div>
              <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 2 }}>せんもんかに よやく・つうやく つき</div>
            </div>
            <Ic.chevR s={18} c="var(--tw-muted)" />
          </button>
        </Card>
        {/* topic chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12, paddingBottom: 2 }} className="tw-noscroll">
          {TOPICS.map(t => (
            <button key={t.k} onClick={() => onConsult('ai', t.seed)} style={{ border: '1px solid var(--tw-line)', background: 'var(--tw-card)', color: 'var(--tw-ink)', borderRadius: 13, padding: '9px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ fontSize: 15 }}>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 11.5, color: 'var(--tw-muted)', fontWeight: 600 }}>
          <Ic.lock s={13} c="var(--tw-muted)" /> そうだんの ないようは ひみつ。おみせには つたわりません。
        </div>
      </div>

      {/* learn section */}
      <div style={{ padding: '24px 18px 0' }}>
        <SectionHead>むりょうで まなぶ 📚</SectionHead>
        {/* streak + level */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <Card style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><Ic.flame s={24} c="var(--tw-coral)" /></div>
            <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 24, color: 'var(--tw-ink)', lineHeight: 1 }}>7</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tw-muted)', marginTop: 4 }}>れんぞく にち</div>
          </Card>
          <Card style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><Ic.spark s={24} c="var(--tw-primary)" /></div>
            <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 24, color: 'var(--tw-ink)', lineHeight: 1 }}>N5</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tw-muted)', marginTop: 4 }}>いまの レベル</div>
          </Card>
          <Card style={{ flex: 1, textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}><Ic.book s={24} c="#9B6BD0" /></div>
            <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 24, color: 'var(--tw-ink)', lineHeight: 1 }}>30</div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tw-muted)', marginTop: 4 }}>おぼえた ことば</div>
          </Card>
        </div>
      </div>

      {/* courses */}
      <div style={{ padding: '0 18px 8px' }}>
        <SectionHead>コース</SectionHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COURSES.map(c => {
            const pct = Math.round(c.done / c.lessons * 100);
            const complete = c.done === c.lessons;
            return (
              <Card key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: `color-mix(in oklab, ${c.tone} 16%, #fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, flexShrink: 0 }}>{c.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--tw-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: c.tone, background: `color-mix(in oklab, ${c.tone} 14%, #fff)`, padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>{c.level}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 99, background: 'rgba(23,59,55,0.08)', overflow: 'hidden', marginBottom: 4 }}>
                    <div style={{ width: pct + '%', height: '100%', borderRadius: 99, background: c.tone, transition: 'width .4s' }} />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tw-muted)' }}>{complete ? '✓ クリア！' : `${c.done} / ${c.lessons} レッスン`}</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: complete ? 'var(--tw-primary-soft)' : c.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {complete ? <Ic.check s={18} c="var(--tw-primary-dark)" /> : <Ic.play s={16} c="#fff" />}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── しょるい screen ─────────────────────────────────────────
function DocsScreen() {
  const used = ME.weeklyUsed, cap = ME.weeklyCap;
  const pct = Math.round(used / cap * 100);
  const near = used / cap > 0.8;
  const statusMap = {
    done: { t: 'できた', bg: 'var(--tw-primary)', fg: '#fff', ic: 'check' },
    check: { t: 'かくにん中', bg: 'var(--tw-coral-soft)', fg: '#C2452A', ic: null },
  };
  const whoMap = { employer: 'おみせが だす', both: 'あなたも もらえる', system: 'アプリが つくる', you: 'あなたが だす' };

  return (
    <div>
      <ScreenHeader title="しょるい" sub="書類は アプリが じどうで つくります" />

      {/* visa card */}
      <div style={{ padding: '14px 18px 0' }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ background: 'var(--tw-ink)', color: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700, marginBottom: 3 }}>ざいりゅう しかく</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}><ruby>{ME.visa}<rt style={{ color: 'rgba(255,255,255,0.7)' }}>{ME.visaY}</rt></ruby></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, opacity: 0.7, fontWeight: 700 }}>ゆうこう きげん</div>
              <div style={{ fontFamily: 'var(--tw-num)', fontSize: 16, fontWeight: 800 }}>{ME.expiry}</div>
            </div>
          </div>
          {/* weekly hours meter (compliance) */}
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--tw-ink)' }}>こんしゅう はたらいた じかん</span>
              <span style={{ fontFamily: 'var(--tw-num)', fontSize: 14, fontWeight: 800, color: near ? 'var(--tw-coral)' : 'var(--tw-primary-dark)' }}>{used} / {cap} 時間</span>
            </div>
            <div style={{ height: 12, borderRadius: 99, background: 'rgba(23,59,55,0.08)', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: pct + '%', height: '100%', borderRadius: 99, background: near ? 'var(--tw-coral)' : 'var(--tw-primary)', transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tw-muted)', marginTop: 9, lineHeight: 1.5 }}>
              {near
                ? <>⚠️ あと <b style={{ color: 'var(--tw-coral)' }}>{cap - used}時間</b> で じょうげんです。むりを しないでね。</>
                : <>りゅうがくの ビザは <b>1しゅうに {cap}時間</b> まで はたらけます。あと <b style={{ color: 'var(--tw-primary-dark)' }}>{cap - used}時間</b>。</>}
            </div>
          </div>
        </Card>
      </div>

      {/* auto-doc explainer */}
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ background: 'var(--tw-primary-soft)', borderRadius: 18, padding: '14px 16px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic.shield s={19} c="#fff" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tw-primary-dark)', lineHeight: 1.5 }}>
            ハローワークに だす 書類は、<b>おみせと アプリ</b>が じどうで つくります。<br />
            <span style={{ color: 'var(--tw-ink)' }}>あなたは ざいりゅうカードを とうろく するだけ。むずかしい てつづきは いりません。</span>
          </div>
        </div>
      </div>

      {/* documents list */}
      <div style={{ padding: '18px 18px 8px' }}>
        <SectionHead>しょるいの じょうきょう</SectionHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {DOCS.map(d => {
            const s = statusMap[d.status];
            return (
              <Card key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--tw-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic.doc s={22} c="var(--tw-primary-dark)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--tw-ink)', lineHeight: 1.35 }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 3 }}>{whoMap[d.who]} · {d.desc}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
                  <span style={{ background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 800, padding: '4px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {s.ic && <Ic.check s={13} c="#fff" />}{s.t}
                  </span>
                  {d.status === 'done' && <Ic.dl s={19} c="var(--tw-muted)" />}
                </div>
              </Card>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 14, lineHeight: 1.5 }}>
          🔒 あなたの じょうほうは あんぜんに まもられます
        </div>
      </div>
    </div>
  );
}

// ── マイページ screen ───────────────────────────────────────
function ProfileScreen() {
  return (
    <div>
      {/* profile hero */}
      <div style={{ padding: '10px 18px 0' }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ background: 'var(--tw-primary)', height: 64 }} />
          <div style={{ padding: '0 18px 18px', marginTop: -34 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, boxShadow: '0 6px 14px -6px rgba(0,0,0,0.3)' }}>{ME.emoji}</div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--tw-ink)' }}>{ME.name} <span style={{ fontSize: 14, color: 'var(--tw-muted)', fontWeight: 700 }}>（{ME.nameJp}）</span></div>
                <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 700, marginTop: 2 }}>{ME.country}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--tw-coral-soft)', borderRadius: 999, padding: '6px 12px' }}>
                  <Star filled size={17} />
                  <span style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 17, color: 'var(--tw-ink)' }}>{ME.rating}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--tw-muted)', fontWeight: 700, marginTop: 4 }}>{ME.count}けんの ひょうか</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* earnings */}
      <div style={{ display: 'flex', gap: 12, padding: '14px 18px 0' }}>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tw-muted)' }}>こんげつ</div>
          <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 21, color: 'var(--tw-ink)', marginTop: 3 }}>¥{ME.monthEarned.toLocaleString()}</div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tw-muted)' }}>これまで ぜんぶ</div>
          <div style={{ fontFamily: 'var(--tw-num)', fontWeight: 800, fontSize: 21, color: 'var(--tw-ink)', marginTop: 3 }}>¥{ME.totalEarned.toLocaleString()}</div>
        </Card>
      </div>

      {/* got tags */}
      <div style={{ padding: '20px 18px 0' }}>
        <SectionHead>おみせから もらった こえ</SectionHead>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ME.gotTags.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--tw-ink)', flex: 1 }}>「{g.t}」</span>
                <div style={{ width: 90, height: 8, borderRadius: 99, background: 'rgba(23,59,55,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: (g.n / 18 * 100) + '%', height: '100%', background: 'var(--tw-primary)', borderRadius: 99 }} />
                </div>
                <span style={{ fontFamily: 'var(--tw-num)', fontSize: 13, fontWeight: 800, color: 'var(--tw-muted)', width: 28, textAlign: 'right' }}>{g.n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* settings list */}
      <div style={{ padding: '20px 18px 8px' }}>
        <SectionHead>せってい</SectionHead>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {[
            { ic: <Ic.globe s={20} c="var(--tw-primary-dark)" />, t: 'ことば / Language', v: 'やさしい日本語' },
            { ic: <Ic.doc s={20} c="var(--tw-primary-dark)" />, t: 'ざいりゅう カード', v: 'とうろくずみ' },
            { ic: <Ic.spark s={20} c="var(--tw-primary-dark)" />, t: 'こうざ（おかねの うけとり）', v: '●●●● 1234' },
            { ic: <Ic.chat s={20} c="var(--tw-primary-dark)" />, t: 'つうやく サポート', v: '24時間' },
            { ic: <Ic.shield s={20} c="var(--tw-primary-dark)" />, t: 'こまった ときは', v: '' },
          ].map((r, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--tw-line)' : 'none' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--tw-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.ic}</div>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700, color: 'var(--tw-ink)' }}>{r.t}</span>
              {r.v && <span style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 700 }}>{r.v}</span>}
              <Ic.chevR s={16} c="rgba(23,59,55,0.3)" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { LearnScreen, DocsScreen, ProfileScreen });
