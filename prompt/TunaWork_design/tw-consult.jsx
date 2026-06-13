// tw-consult.jsx — 生活そうだん: AIチャット（window.claude）＋ 人への予約
// Depends on tw-ui globals.

const TOPICS = [
  { k: 'visa', label: 'ビザ・ざいりゅう', emoji: '🪪', seed: 'ざいりゅうカードの こうしんに ついて おしえてください。' },
  { k: 'money', label: 'ぜいきん・おかね', emoji: '💴', seed: 'アルバイトの ぜいきんに ついて しりたいです。' },
  { k: 'health', label: 'びょういん・けんこう', emoji: '🏥', seed: 'びょうきの とき、どこの びょういんに いけば いいですか？' },
  { k: 'home', label: 'すまい・けいやく', emoji: '🏠', seed: 'あたらしい へやを かりたいです。なにが ひつようですか？' },
  { k: 'work', label: 'しごとの なやみ', emoji: '😟', seed: 'しごとで こまった ことが あります。そうだんに のってください。' },
  { k: 'life', label: 'まいにちの せいかつ', emoji: '🌱', seed: 'ごみの だしかたが わかりません。おしえてください。' },
];

const SYS_PROMPT = [
  'あなたは「TunaWork」の せいかつ そうだん アシスタント「ツナさん」です。日本で はたらく 外国人を たすけます。',
  'ルール:',
  '1) かならず やさしい日本語で こたえる。むずかしい ことばや かんじは つかわない。',
  '2) みじかく こたえる（3〜5文）。だいじな ことから いう。',
  '3) ビザ・ぜいきん・びょういん・すまい・おかね・しごとの なやみ など せいかつの そうだんに のる。',
  '4) ほうりつや おかねの さいごの はんだんは「人の せんもんかに そうだんしてね」と つたえる。きけんな ときは「110番（けいさつ）」「119番（きゅうきゅう）」も つたえる。',
  '5) あたたかく、あいてを はげます。さいごに みじかい おうえんの ことばを そえる。',
].join('\n');

function Bubble({ from, children, pending }) {
  const ai = from === 'ai';
  return (
    <div style={{ display: 'flex', justifyContent: ai ? 'flex-start' : 'flex-end', gap: 8, alignItems: 'flex-end' }}>
      {ai && (
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic.bot s={18} c="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: '76%', padding: '11px 14px', fontSize: 14.5, fontWeight: 600, lineHeight: 1.6,
        borderRadius: ai ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
        background: ai ? 'var(--tw-card)' : 'var(--tw-primary)',
        color: ai ? 'var(--tw-ink)' : '#fff',
        border: ai ? '1px solid var(--tw-line)' : 'none',
        boxShadow: ai ? '0 2px 8px -5px rgba(23,59,55,0.3)' : 'none',
        whiteSpace: 'pre-wrap',
      }}>
        {pending ? <TypingDots /> : children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, padding: '2px 2px' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--tw-muted)', animation: `tw-blink 1.2s ${i * 0.18}s infinite` }} />
      ))}
    </span>
  );
}

// ── AI consultation chat (full screen) ─────────────────────
function ConsultChat({ initialSeed, onClose, onHuman }) {
  const [msgs, setMsgs] = React.useState([
    { from: 'ai', text: 'こんにちは！わたしは ツナさん です 🐟\nせいかつで こまった ことは ありますか？ビザ・おかね・びょういん など、なんでも きいてね。' },
  ]);
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const scrollRef = React.useRef(null);
  const started = msgs.length > 1;

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, busy]);

  React.useEffect(() => {
    if (initialSeed) send(initialSeed);
    // eslint-disable-next-line
  }, []);

  async function send(textArg) {
    const text = (typeof textArg === 'string' ? textArg : input).trim();
    if (!text || busy) return;
    setInput('');
    const next = [...msgs, { from: 'me', text }];
    setMsgs(next);
    setBusy(true);
    try {
      const history = next.map(m => (m.from === 'me' ? 'あなた: ' : 'ツナさん: ') + m.text).join('\n');
      const prompt = SYS_PROMPT + '\n\n--- これまでの かいわ ---\n' + history + '\n\nツナさん:';
      let reply;
      if (window.claude && window.claude.complete) {
        reply = await window.claude.complete(prompt);
      } else {
        await new Promise(r => setTimeout(r, 700));
        reply = 'ごめんなさい、いまは れんしゅう モードです。\nほんばんでは AI が やさしい日本語で こたえます。むずかしい ことは「人に そうだん」も つかってね。';
      }
      setMsgs(m => [...m, { from: 'ai', text: (reply || '').trim() || 'もういちど おしえてくれますか？' }]);
    } catch (e) {
      setMsgs(m => [...m, { from: 'ai', text: 'ごめんなさい、いま おへんじ できませんでした。すこし まってから もういちど ためしてね。' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 35, background: 'var(--tw-bg)', display: 'flex', flexDirection: 'column', animation: 'tw-fade .2s' }}>
      {/* header */}
      <div style={{ paddingTop: 50, paddingBottom: 12, paddingLeft: 14, paddingRight: 14, background: 'var(--tw-card)', borderBottom: '1px solid var(--tw-line)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'rgba(23,59,55,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Ic.chevL s={20} c="var(--tw-ink)" />
        </button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ic.bot s={22} c="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--tw-ink)' }}>ツナさん（AI そうだん）</div>
          <div style={{ fontSize: 11.5, color: 'var(--tw-primary-dark)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#33c277', display: 'inline-block' }} />むりょう・24時間・<Ic.lock s={12} c="var(--tw-primary-dark)" />ひみつ
          </div>
        </div>
        <button onClick={onHuman} style={{ border: 'none', background: 'var(--tw-coral-soft)', color: '#9A3D26', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          👤 人に
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="tw-scroll" style={{ flex: 1, overflow: 'auto', padding: '16px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => <Bubble key={i} from={m.from}>{m.text}</Bubble>)}
        {busy && <Bubble from="ai" pending />}
        {!started && !busy && (
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tw-muted)', margin: '6px 4px 9px' }}>よく ある そうだん</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TOPICS.map(t => (
                <button key={t.k} onClick={() => send(t.seed)} style={{ border: '1px solid var(--tw-line)', background: 'var(--tw-card)', color: 'var(--tw-ink)', borderRadius: 14, padding: '9px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 15 }}>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div style={{ padding: '10px 14px 26px', background: 'var(--tw-card)', borderTop: '1px solid var(--tw-line)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="メッセージを かいてね…"
            style={{ flex: 1, resize: 'none', border: '1px solid var(--tw-line)', borderRadius: 18, padding: '11px 15px', fontSize: 14.5, fontFamily: 'inherit', fontWeight: 600, color: 'var(--tw-ink)', outline: 'none', maxHeight: 90, background: 'var(--tw-bg)' }}
          />
          <button onClick={() => send()} disabled={busy || !input.trim()} style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: (busy || !input.trim()) ? 'rgba(23,59,55,0.12)' : 'var(--tw-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (busy || !input.trim()) ? 'default' : 'pointer', flexShrink: 0, transition: 'background .2s' }}>
            <Ic.send s={20} c="#fff" />
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--tw-muted)', fontWeight: 600, marginTop: 8 }}>AI の こたえは まちがう ことも あります。だいじな ことは 人に そうだんしてね。</div>
      </div>
    </div>
  );
}

// ── Human consultation (booking bottom sheet) ──────────────
const ADVISORS = [
  { name: 'グエン さん', emoji: '👩🏻‍💼', langs: '🇻🇳 🇯🇵', rating: 4.9, role: 'せいかつ そうだんいん' },
  { name: '田中 さん', emoji: '👨🏻‍💼', langs: '🇯🇵 🇬🇧', rating: 4.8, role: 'ぎょうせい しょし（ビザ）' },
];
const SLOTS = ['きょう 19:00', 'あした 12:00', 'あした 20:00', '6/16 18:00'];

function HumanConsult({ onClose }) {
  const [topic, setTopic] = React.useState(null);
  const [adv, setAdv] = React.useState(0);
  const [slot, setSlot] = React.useState(null);
  const [done, setDone] = React.useState(false);
  const canBook = topic && slot != null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 45, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,40,37,0.45)' }} />
      <div style={{ position: 'relative', background: 'var(--tw-bg)', borderRadius: '28px 28px 0 0', maxHeight: '94%', overflow: 'auto', paddingBottom: 30, animation: 'tw-sheet .32s cubic-bezier(.2,.8,.2,1)' }} className="tw-scroll">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'rgba(23,59,55,0.18)' }} />
        </div>

        {done ? (
          <div style={{ padding: '16px 24px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 50, marginBottom: 6 }}>📅</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--tw-ink)' }}>よやく できました！</h2>
            <div style={{ fontSize: 14.5, color: 'var(--tw-muted)', fontWeight: 600, lineHeight: 1.6, marginBottom: 18 }}>
              {ADVISORS[adv].name} と <b style={{ color: 'var(--tw-ink)' }}>{SLOTS[slot]}</b> に<br />ビデオで そうだん します。<br />つうやくも いっしょに はいります。
            </div>
            <Card style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', marginBottom: 16 }}>
              <div style={{ fontSize: 34 }}>{ADVISORS[adv].emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--tw-ink)' }}>{ADVISORS[adv].name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--tw-muted)', fontWeight: 600 }}>{ADVISORS[adv].role} · {ADVISORS[adv].langs}</div>
              </div>
              <Btn kind="ghost" size="sm"><Ic.phone s={16} c="var(--tw-ink)" /> れんらく</Btn>
            </Card>
            <Btn full kind="primary" onClick={onClose}>とじる</Btn>
          </div>
        ) : (
          <div style={{ padding: '6px 20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: '4px 0 4px', fontSize: 21, fontWeight: 800, color: 'var(--tw-ink)' }}>人に そうだん 👤</h2>
              <div style={{ fontSize: 13, color: 'var(--tw-muted)', fontWeight: 600 }}>むりょう・つうやく つき・ひみつは まもります</div>
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 9 }}>① なにを そうだん する？</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {TOPICS.map(t => (
                <button key={t.k} onClick={() => setTopic(t.k)} style={{
                  border: 'none', borderRadius: 999, padding: '9px 13px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  background: topic === t.k ? 'var(--tw-primary)' : 'var(--tw-card)', color: topic === t.k ? '#fff' : 'var(--tw-ink)',
                  boxShadow: topic === t.k ? 'none' : 'inset 0 0 0 1.5px var(--tw-line)', display: 'flex', alignItems: 'center', gap: 5,
                }}><span style={{ fontSize: 15 }}>{t.emoji}</span>{t.label}</button>
              ))}
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 9 }}>② そうだんいんを えらぶ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {ADVISORS.map((a, i) => (
                <Card key={i} onClick={() => setAdv(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, borderColor: adv === i ? 'var(--tw-primary)' : 'var(--tw-line)', borderWidth: adv === i ? 2 : 1, borderStyle: 'solid' }}>
                  <div style={{ fontSize: 32 }}>{a.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--tw-ink)' }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--tw-muted)', fontWeight: 600 }}>{a.role} · {a.langs}</div>
                  </div>
                  <RatingPill value={a.rating} size={13} />
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: adv === i ? 'none' : '2px solid var(--tw-line)', background: adv === i ? 'var(--tw-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {adv === i && <Ic.check s={14} c="#fff" />}
                  </div>
                </Card>
              ))}
            </div>

            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--tw-ink)', marginBottom: 9 }}>③ じかんを えらぶ</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 20 }}>
              {SLOTS.map((s, i) => (
                <button key={i} onClick={() => setSlot(i)} style={{
                  border: 'none', borderRadius: 14, padding: '12px 10px', fontSize: 13.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer',
                  background: slot === i ? 'var(--tw-primary)' : 'var(--tw-card)', color: slot === i ? '#fff' : 'var(--tw-ink)',
                  boxShadow: slot === i ? 'none' : 'inset 0 0 0 1.5px var(--tw-line)',
                }}>{s}</button>
              ))}
            </div>

            <Btn full kind="primary" disabled={!canBook} onClick={() => setDone(true)}>よやく する</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ConsultChat, HumanConsult, TOPICS });
