export default function WorkerConsultPage() {
  const topics = [
    ['ビザ・ざいりゅう', '在留カード、更新、はたらける時間の相談'],
    ['ぜいきん・おかね', '給与、税金、生活費の不安'],
    ['びょういん・けんこう', '病気、けが、病院の行き方'],
    ['しごとの なやみ', '職場で困ったこと、言葉の不安'],
  ];

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Support</div>
          <h1><ruby>相談<rt>そうだん</rt></ruby></h1>
          <p>こまったことを、やさしい日本語で確認できます。</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>ひみつ</span>
      </div>

      <div className="tw-coral-panel">
        <div className="tw-row">
          <span className="tw-avatar" style={{ background: '#fff', color: 'var(--tw-coral)' }}>♡</span>
          <div>
            <div style={{ fontWeight: 800, color: '#9a3d26' }}>そうだんも べんきょうも むりょう</div>
            <div style={{ color: '#9a3d26', fontSize: '.88rem' }}>お店の利用料の一部で、ワーカーの生活相談と日本語学習を支えます。</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">こまったこと、ありませんか？</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          <div className="tw-soft-panel tw-row-between">
            <div className="tw-row">
              <span className="tw-avatar">AI</span>
              <div>
                <div style={{ fontWeight: 800 }}>AI に きく</div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.85rem' }}>本番では24時間、やさしい日本語で答えます。</div>
              </div>
            </div>
            <span className="tw-chip">すぐ</span>
          </div>
          <div className="tw-soft-panel tw-row-between">
            <div className="tw-row">
              <span className="tw-avatar">人</span>
              <div>
                <div style={{ fontWeight: 800 }}>人に そうだんする</div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.85rem' }}>専門家への予約と通訳サポートを想定しています。</div>
              </div>
            </div>
            <span className="tw-chip tw-chip-coral">予約</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">よくある相談</div>
        <div className="tw-chip-list">
          {topics.map(([label]) => (
            <span key={label} className="tw-chip tw-chip-plain">{label}</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem', marginTop: '1rem' }}>
          {topics.map(([label, desc]) => (
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
