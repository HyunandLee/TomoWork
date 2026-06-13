// tw-data.jsx — TunaWork mock data. Exports to window.

// Employers (with star ratings — mutual rating system)
const EMPLOYERS = {
  e1: { name: 'カフェ ひだまり', emoji: '☕', tone: '#C2842B', rating: 4.8, count: 132,
    tags: ['ていねいに おしえてくれる', 'やさしい にほんご', 'また はたらきたい'],
    note: '駅から ちかい カフェ。スタッフは みんな やさしいです。' },
  e2: { name: 'みなと そうこ', emoji: '📦', tone: '#3B7FD0', rating: 4.6, count: 208,
    tags: ['じかんどおり', 'たんじゅんな しごと', 'すぐ なれる'],
    note: 'にもつを はこぶ しごと。チームで はたらきます。' },
  e3: { name: 'いざかや 大漁', emoji: '🍶', tone: '#D0543B', rating: 4.4, count: 76,
    tags: ['まかない あり', 'たのしい ふんいき', 'えいご OK'],
    note: 'よる の いざかや。キッチンの おてつだいです。' },
  e4: { name: 'ホテル なぎさ', emoji: '🛎️', tone: '#2BA88F', rating: 4.9, count: 311,
    tags: ['ていねいに おしえてくれる', 'きれいな しょくば', 'こうきゅう'],
    note: 'ホテルの きゃくしつ せいそう。マニュアルが あります。' },
  e5: { name: 'みどり弁当 工場', emoji: '🍱', tone: '#5BA23B', rating: 4.5, count: 540,
    tags: ['じかんどおり', 'もくもく さぎょう', 'おおぜい'],
    note: 'おべんとうを つくる こうじょう。たちしごとです。' },
  e6: { name: 'スマイル引越', emoji: '🚚', tone: '#E0962B', rating: 4.3, count: 98,
    tags: ['からだを うごかす', 'にっぱらい', 'チームワーク'],
    note: 'ひっこしの おてつだい。ちからしごとです。' },
};

// Jobs
const JOBS = [
  { id: 'j1', emp: 'e1', title: 'カフェ ホールスタッフ', titleY: 'ホールスタッフ',
    cat: 'いんしょく', pay: 1300, payType: 'h', img: 'cafe interior photo',
    station: '渋谷駅', stationY: 'しぶやえき', walk: 5, date: '6/15 (日)', time: '10:00–15:00', hours: 5,
    tags: [['みけいけん OK', 'soft'], ['ふりがな サポート', 'coral'], ['週ばらい', 'sun']],
    visa: ['留学', '特定技能', '家族滞在'], soft: true, hot: true,
    body: ['おきゃくさまに のみものを はこびます。', 'テーブルを かたづけます。', 'レジは スタッフが てつだいます。'],
    bring: ['くろい くつ', 'えがお'], wear: 'おみせの エプロンを かします。' },
  { id: 'j2', emp: 'e2', title: '倉庫 ピッキング・仕分け', titleY: 'ピッキング',
    cat: 'けいさぎょう', pay: 1250, payType: 'h', img: 'warehouse photo',
    station: '川崎駅', stationY: 'かわさきえき', walk: 8, date: '6/14 (土)', time: '9:00–17:00', hours: 7,
    tags: [['みけいけん OK', 'soft'], ['もくもく さぎょう', 'plain'], ['そうげい あり', 'coral']],
    visa: ['留学', '特定技能', '技能実習', '家族滞在'], soft: false, hot: true,
    body: ['リストを みて、しなものを あつめます。', 'はこに いれて、シールを はります。', 'おもい にもつは すくないです。'],
    bring: ['うごきやすい ふく', 'ぼうし'], wear: 'てぶくろを かします。' },
  { id: 'j3', emp: 'e4', title: 'ホテル 客室清掃', titleY: 'きゃくしつ せいそう',
    cat: 'せいそう', pay: 1400, payType: 'h', img: 'hotel room photo',
    station: 'みなとみらい駅', stationY: 'みなとみらいえき', walk: 3, date: '6/16 (月)', time: '9:30–14:30', hours: 5,
    tags: [['きれいな しょくば', 'soft'], ['ふりがな サポート', 'coral'], ['こうじきゅう', 'sun']],
    visa: ['留学', '特定技能', '家族滞在', '永住'], soft: true, hot: false,
    body: ['ベッドを ととのえます。', 'おふろと トイレを そうじします。', 'タオルを あたらしく します。'],
    bring: ['うごきやすい ふく'], wear: 'せいそうふくを かします。' },
  { id: 'j4', emp: 'e5', title: '弁当工場 盛り付け', titleY: 'もりつけ',
    cat: 'こうじょう', pay: 1200, payType: 'h', img: 'food factory line photo',
    station: '横浜駅', stationY: 'よこはまえき', walk: 12, date: '6/14 (土)', time: '6:00–11:00', hours: 5,
    tags: [['みけいけん OK', 'soft'], ['もくもく さぎょう', 'plain'], ['あさ だけ', 'coral']],
    visa: ['留学', '特定技能', '技能実習', '家族滞在'], soft: true, hot: false,
    body: ['おべんとうに おかずを ならべます。', 'ラインで たちしごとを します。', 'おなじ さぎょうの くりかえしです。'],
    bring: ['なし（ぜんぶ かします）'], wear: 'しろい さぎょうふくを かします。' },
  { id: 'j5', emp: 'e3', title: '居酒屋 キッチン補助', titleY: 'キッチンほじょ',
    cat: 'いんしょく', pay: 1350, payType: 'h', img: 'izakaya kitchen photo',
    station: '新宿駅', stationY: 'しんじゅくえき', walk: 6, date: '6/15 (日)', time: '17:00–22:00', hours: 5,
    tags: [['まかない あり', 'coral'], ['えいご OK', 'soft'], ['週ばらい', 'sun']],
    visa: ['留学', '特定技能', '家族滞在'], soft: false, hot: false,
    body: ['おさらを あらいます。', 'かんたんな りょうりを てつだいます。', 'やさいを きります。'],
    bring: ['くろい くつ'], wear: 'コックコートを かします。' },
  { id: 'j6', emp: 'e6', title: '引越しアシスタント', titleY: 'ひっこし',
    cat: 'うんぱん', pay: 1500, payType: 'h', img: 'moving truck photo',
    station: '大宮駅', stationY: 'おおみやえき', walk: 10, date: '6/16 (月)', time: '8:00–16:00', hours: 7,
    tags: [['にっぱらい', 'sun'], ['からだを うごかす', 'plain'], ['こうじきゅう', 'coral']],
    visa: ['留学', '特定技能', '家族滞在'], soft: false, hot: false,
    body: ['にもつを トラックに のせます。', 'スタッフと いっしょに はこびます。', 'おもい ものは ふたりで もちます。'],
    bring: ['うごきやすい ふく', 'スニーカー', 'タオル'], wear: 'さぎょうようの てぶくろを かします。' },
];

// My jobs (worker's own applications / shifts)
const MY_UPCOMING = [
  { jobId: 'j1', status: 'kettei', today: false },   // 決定
  { jobId: 'j2', status: 'oubo', today: false },      // 応募中
];
const MY_DONE = [
  { jobId: 'j3', date: '6/8 (日)', earned: 7000, rated: false, hoursWorked: 5 },
  { jobId: 'j5', date: '6/1 (日)', earned: 6750, rated: true, ratedStars: 5, hoursWorked: 5 },
  { jobId: 'j4', date: '5/25 (日)', earned: 6000, rated: true, ratedStars: 4, hoursWorked: 5 },
];

// Rating tags worker can give the employer
const GIVE_TAGS = [
  'ていねいに おしえてくれた', 'やさしい にほんご', 'じかんどおり',
  'また はたらきたい', 'しょくばが きれい', 'スタッフが やさしい',
];

// Learning courses (funded by employer fees)
const COURSES = [
  { id: 'c1', title: 'しごとの あいさつ', titleY: '', level: 'N5', lessons: 12, done: 12, tone: '#2BA88F', emoji: '👋', tag: 'きほん' },
  { id: 'c2', title: '面接の 日本語', titleY: 'めんせつ', level: 'N4', lessons: 10, done: 6, tone: '#3B7FD0', emoji: '🗣️', tag: 'やくだつ' },
  { id: 'c3', title: '安全の ことば（倉庫・工場）', titleY: 'あんぜん', level: 'N5', lessons: 8, done: 3, tone: '#E0962B', emoji: '⚠️', tag: 'しごと' },
  { id: 'c4', title: 'お金と 税金の はなし', titleY: 'おかねと ぜいきん', level: 'N3', lessons: 6, done: 0, tone: '#9B6BD0', emoji: '💴', tag: 'せいかつ' },
  { id: 'c5', title: '生活の 日本語', titleY: 'せいかつ', level: 'N5', lessons: 14, done: 9, tone: '#D0543B', emoji: '🏠', tag: 'せいかつ' },
];

const WORDCARDS = [
  { jp: 'おつかれさま', read: '', en: 'Good work / Thank you', use: 'しごとの あとに いいます' },
  { jp: '承知しました', read: 'しょうちしました', en: 'Understood', use: 'はい、わかりました の ていねいな かたち' },
  { jp: '休憩', read: 'きゅうけい', en: 'Break / Rest', use: 'しごとの とちゅうの やすみ' },
];

// Documents (auto-generated for employer to submit to Hello Work)
const DOCS = [
  { id: 'd1', name: '外国人雇用状況届出書', nameY: 'がいこくじん こようじょうきょう とどけでしょ',
    desc: '雇い主が ハローワークに 出す 書類です。', status: 'done', who: 'employer' },
  { id: 'd2', name: '雇用契約書（やさしい日本語つき）', nameY: 'こよう けいやくしょ',
    desc: 'しごとの じょうけんを かいた 紙。あなたも もらえます。', status: 'done', who: 'both' },
  { id: 'd3', name: '在留資格 確認シート', nameY: 'ざいりゅうしかく かくにん',
    desc: 'はたらける ビザか チェックします。', status: 'done', who: 'system' },
  { id: 'd4', name: '資格外活動許可の コピー', nameY: 'しかくがい かつどう きょか',
    desc: '留学生が はたらく ために ひつようです。', status: 'check', who: 'you' },
];

// Worker profile
const ME = {
  name: 'Minh', nameJp: 'ミン', country: '🇻🇳 ベトナム', emoji: '🙂',
  rating: 4.9, count: 23, tone: '#2BA88F',
  visa: '留学', visaY: 'りゅうがく', expiry: '2027/03/31',
  weeklyCap: 28, weeklyUsed: 19,
  monthEarned: 64200, totalEarned: 412800, jobsDone: 23,
  gotTags: [
    { t: 'じかんどおり', n: 18 }, { t: 'まじめ', n: 15 },
    { t: 'えがおが いい', n: 11 }, { t: 'また きてほしい', n: 9 },
  ],
};

Object.assign(window, { EMPLOYERS, JOBS, MY_UPCOMING, MY_DONE, GIVE_TAGS, COURSES, WORDCARDS, DOCS, ME });
