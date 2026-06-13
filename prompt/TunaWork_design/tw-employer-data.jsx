// tw-employer-data.jsx — 雇用主（お店）側 モックデータ。Exports to window.

// ログイン中の お店（自分）
const SHOP = {
  name: 'カフェ ひだまり', emoji: '☕', tone: '#C2842B',
  branch: '渋谷店', owner: '佐藤 みなと', rating: 4.8, count: 132,
  plan: 'スタンダード', monthFee: 18000,
};

// 自店の求人
const POSTINGS = [
  { id: 'p1', title: 'ホールスタッフ', wage: 1300, status: 'open', applicants: 8, hired: 2, need: 3, shift: '平日 10:00–15:00', soft: true, cat: 'ホール' },
  { id: 'p2', title: 'キッチン補助', wage: 1300, status: 'open', applicants: 5, hired: 1, need: 2, shift: '夕方 17:00–22:00', soft: true, cat: 'キッチン' },
  { id: 'p3', title: 'オープン清掃', wage: 1250, status: 'open', applicants: 3, hired: 2, need: 2, shift: '早朝 7:00–9:00', soft: true, cat: '清掃' },
  { id: 'p4', title: 'ランチピーク応援', wage: 1400, status: 'closed', applicants: 6, hired: 3, need: 3, shift: '昼 11:00–14:00', soft: false, cat: 'ホール' },
];

// 応募者（外国人ワーカー）
const APPLICANTS = [
  { id: 'a1', name: 'Minh', kana: 'ミン', flag: '🇻🇳', country: 'ベトナム', emoji: '🙂', tone: '#2BA88F',
    posting: 'p1', applied: '10分前', new: true,
    visa: '留学', visaOk: true, jlpt: 'N3', weekRemain: 9,
    rating: 4.9, count: 23, exp: 'カフェ経験 2回',
    tags: ['じかんどおり', 'まじめ', 'えがおが いい'] },
  { id: 'a2', name: 'Sofia', kana: 'ソフィア', flag: '🇵🇭', country: 'フィリピン', emoji: '😊', tone: '#D0543B',
    posting: 'p2', applied: '1時間前', new: true,
    visa: '特定技能', visaOk: true, jlpt: 'N4', weekRemain: null,
    rating: 4.7, count: 41, exp: '飲食 5回',
    tags: ['ていねい', 'よく気がつく', 'また来てほしい'] },
  { id: 'a3', name: 'Wei', kana: 'ウェイ', flag: '🇨🇳', country: '中国', emoji: '🙂', tone: '#3B7FD0',
    posting: 'p3', applied: '3時間前', new: true,
    visa: '留学', visaOk: true, jlpt: 'N2', weekRemain: 14,
    rating: 4.8, count: 33, exp: '清掃 4回',
    tags: ['ていねい', 'もくもく作業', 'じかんどおり'] },
  { id: 'a4', name: 'Arjun', kana: 'アルジュン', flag: '🇮🇳', country: 'インド', emoji: '😄', tone: '#9B6BD0',
    posting: 'p1', applied: '5時間前', new: false,
    visa: '家族滞在', visaOk: true, jlpt: 'N4', weekRemain: 11,
    rating: 4.5, count: 12, exp: 'ホール 2回',
    tags: ['あかるい', 'えいごOK', 'がんばりや'] },
  { id: 'a5', name: 'Putri', kana: 'プトリ', flag: '🇮🇩', country: 'インドネシア', emoji: '🙂', tone: '#E0962B',
    posting: 'p2', applied: '昨日', new: false,
    visa: '特定技能', visaOk: true, jlpt: 'N4', weekRemain: null,
    rating: 4.6, count: 8, exp: '飲食 3回',
    tags: ['ていねい', 'よく学ぶ'] },
];

// 採用ずみ・これからのシフト
const HIRED = [
  { id: 'h1', name: 'Minh', kana: 'ミン', flag: '🇻🇳', emoji: '🙂', tone: '#2BA88F', posting: 'p1', date: '6/15 (日)', time: '10:00–15:00', status: 'confirmed' },
  { id: 'h2', name: 'Sofia', kana: 'ソフィア', flag: '🇵🇭', emoji: '😊', tone: '#D0543B', posting: 'p2', date: '6/15 (日)', time: '17:00–22:00', status: 'confirmed' },
  { id: 'h3', name: 'Wei', kana: 'ウェイ', flag: '🇨🇳', emoji: '🙂', tone: '#3B7FD0', posting: 'p3', date: '6/16 (月)', time: '7:00–9:00', status: 'confirmed' },
];

// 評価まち（終わったシフト）
const TO_RATE = [
  { id: 'r1', name: 'Minh', kana: 'ミン', flag: '🇻🇳', emoji: '🙂', tone: '#2BA88F', posting: 'p1', date: '6/8 (日)', time: '10:00–15:00', hours: 5, paid: 7000 },
  { id: 'r2', name: 'Wei', kana: 'ウェイ', flag: '🇨🇳', emoji: '🙂', tone: '#3B7FD0', posting: 'p3', date: '6/8 (日)', time: '7:00–9:00', hours: 2, paid: 2700 },
];

// ワーカーに付けられる やさしいタグ（雇用主→ワーカー）
const WORKER_TAGS = ['じかんどおり', 'まじめ', 'えがおが いい', 'よく気がつく', 'のみこみが早い', 'また来てほしい'];

// ハローワーク提出 書類（採用ごと）
const EMP_DOCS = [
  { id: 'ed1', worker: 'Minh', flag: '🇻🇳', doc: '外国人雇用状況届出書', deadline: '採用から翌月末日まで', status: 'ready', auto: true },
  { id: 'ed2', worker: 'Sofia', flag: '🇵🇭', doc: '外国人雇用状況届出書', deadline: '採用から翌月末日まで', status: 'ready', auto: true },
  { id: 'ed3', worker: 'Wei', flag: '🇨🇳', doc: '外国人雇用状況届出書', deadline: '採用から翌月末日まで', status: 'submitted', auto: true },
  { id: 'ed4', worker: 'Arjun', flag: '🇮🇳', doc: '雇用契約書（やさしい日本語つき）', deadline: '初出勤まで', status: 'ready', auto: true },
];

// 自動生成される 外国人雇用状況届出書 の フィールド（採用モーダルのプレビュー用）
const HELLOWORK_FIELDS = (a) => [
  { label: '氏名（ローマ字）', value: a.name + ' / ' + a.kana, src: 'ワーカー登録' },
  { label: '在留資格', value: a.visa, src: '在留カード' },
  { label: '在留期間（満了日）', value: a.visa === '留学' ? '2027/03/31' : '2028/09/30', src: '在留カード' },
  { label: '在留カード番号', value: 'AB' + (a.count * 1234567 % 9000000 + 1000000) + 'CD', src: '在留カード' },
  { label: '国籍・地域', value: a.country, src: 'ワーカー登録' },
  { label: '生年月日', value: '2001/05/14', src: 'ワーカー登録' },
  { label: '資格外活動許可', value: a.visa === '留学' ? 'あり（週28時間以内）' : '不要', src: '在留カード' },
  { label: '雇入れ年月日', value: '2026/06/13', src: '求人情報' },
];

// ダッシュボード KPI
const DASH = {
  openJobs: 3, weekApplicants: 12, hiredMonth: 5, paidMonth: 182000,
  // 利用料のうち学習・相談支援にまわる額
  supportPool: 5400, supportPct: 30,
};

Object.assign(window, { SHOP, POSTINGS, APPLICANTS, HIRED, TO_RATE, WORKER_TAGS, EMP_DOCS, HELLOWORK_FIELDS, DASH });
