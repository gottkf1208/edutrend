/* 홍보 카드 공방 — 저자마다 다른 홍보 이미지를 캔버스로 그린다 (CSS prefix st-)
   EDU.studio = { render(opts) -> Promise<canvas>, exportBlob(opts) -> Promise<{blob,w,h,filename}>, set(patch) }
   opts = { ratio: '4x5|1x1|9x16|16x9|link|profile|kakaobg', template: 'cover|art|quote|shelf', scale } */
(function () {
  'use strict';
  var EDU = window.EDU;
  if (!EDU || !EDU.util) return;
  var U = EDU.util, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon;

  var CY = '#00A2D3', INK = '#060606', WH = '#ffffff';
  var BOOK = EDU.book || {};
  var TITLE = BOOK.title || '2027 대한민국 미래 교육 트렌드';
  var SUB = ['30명의 현장 교육전문가들이 제시하는', '미래 교육의 전망과 해법'];
  var TEAM = BOOK.author || '미래 교육 집필팀', PUB = BOOK.publisher || '뜨인돌';
  var HEAD = '네 번째 책에 저자로 함께했어요';
  var TL = BOOK.titleLines && BOOK.titleLines.length === 3 ? BOOK.titleLines : ['2027 대한민국', '미래 교육', '트렌드'];
  var TITLE_BREAKS = [[TITLE], [TL[0], TL[1] + ' ' + TL[2]], TL];
  var HEAD_BREAKS = [[HEAD], ['네 번째 책에', '저자로 함께했어요'], ['네 번째 책에', '저자로', '함께했어요']];

  var RATIOS = [
    { id: '4x5', name: '피드 4:5', w: 2160, h: 2700, file: '4x5' },
    { id: '1x1', name: '정사각 1:1', w: 2160, h: 2160, file: '1x1' },
    { id: '9x16', name: '스토리 9:16', w: 2160, h: 3840, file: '9x16' },
    { id: '16x9', name: '가로 16:9', w: 3840, h: 2160, file: '16x9' },
    { id: 'link', name: '링크 카드', w: 2400, h: 1260, file: '링크카드' },
    { id: 'profile', name: '프사', w: 2160, h: 2160, file: '프사' },
    { id: 'kakaobg', name: '카톡 배경', w: 2160, h: 3840, file: '카톡배경' }
  ];
  var TEMPLATES = [
    { id: 'cover', name: '표지 그대로', type: 'image/png' },
    { id: 'art', name: '키워드 그림', type: 'image/png' },
    { id: 'quote', name: '한 문장', type: 'image/png' },
    { id: 'shelf', name: '네 권의 서가', type: 'image/png' },
    { id: 'bingo', name: '키워드 빙고', type: 'image/png' },
    { id: 'gift', name: '선물하기', type: 'image/png' }
  ];
  var TABS = [['size', '크기'], ['design', '디자인'], ['show', '표시']];
  var MASKS = [['sq', '네모'], ['kakao', '카톡'], ['insta', '인스타']];
  var COVERS = [
    { y: 2024, ar: 810 / 1200, col: '#FE5F4A' }, { y: 2025, ar: 974 / 1388, col: '#38D530' },
    { y: 2026, ar: 1949 / 2776, col: '#9D37C7' }, { y: 2027, ar: 1024 / 1459, col: CY }
  ];
  var BOOK_AR = 1456 / 1697, ARC_AR = 4.69;

  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function ratioOf(id) { return byId(RATIOS, id) || RATIOS[0]; }
  function tplOf(id) { return byId(TEMPLATES, id) || TEMPLATES[0]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function clean(s, max) { s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return max && s.length > max ? s.slice(0, max - 1).trim() + '…' : s; }

  /* ---------- state ---------- */
  var SKEY = 'edutrend.studio.v1';
  var state = { ratio: '4x5', template: 'cover', tab: 'size', mask: 'kakao', hook: 0, show: { name: true, org: true, handle: true } };
  (function () {
    var s = U.store.get(SKEY, null);
    if (!s || typeof s !== 'object') return;
    if (byId(RATIOS, s.ratio)) state.ratio = s.ratio;
    if (byId(TEMPLATES, s.template)) state.template = s.template;
    if (s.tab === 'size' || s.tab === 'design' || s.tab === 'show') state.tab = s.tab;
    if (s.mask === 'sq' || s.mask === 'kakao' || s.mask === 'insta') state.mask = s.mask;
    if (s.hook >= 0) state.hook = s.hook | 0;
    if (s.show && typeof s.show === 'object') ['name', 'org', 'handle'].forEach(function (k) { if (typeof s.show[k] === 'boolean') state.show[k] = s.show[k]; });
  })();
  function save() { U.store.set(SKEY, state); }

  /* ---------- what goes on the card ---------- */
  function model(opts, pf) {
    var p = opts.profile || EDU.getProfile(), kw = EDU.currentKeyword(p), show = opts.show || state.show;
    var d = {
      name: !pf && show.name ? clean(p.name, 24) : '', org: !pf && show.org ? clean(p.org, 44) : '', handle: !pf && show.handle ? clean(p.handle, 44) : '',
      kw: kw ? clean(kw.name, 40) : '', kwId: kw && kw.id !== 'custom' ? kw.id : '',
      fileKw: kw ? clean(kw.tag || kw.name, 40).replace(/\s+/g, '') : '', fileName: pf ? clean(p.name, 24) : (show.name ? clean(p.name, 24) : '')
    };
    d.kwNo = /^k\d+$/.test(d.kwId) ? parseInt(d.kwId.slice(1), 10) : 0;        // 표지 키워드 21개만 번호가 있다
    d.opener = !!(kw && kw.opener); d.kwLabel = d.opener ? (kw.label || '여는 글') : '키워드'; d.kwSub = d.opener ? clean(kw.sub, 60) : '';
    d.own = !!clean(p.line, 110);
    d.line = clean(p.line, 110) || hookLine(d, opts.hook != null ? opts.hook : state.hook);
    return d;
  }
  /* 한 줄 소개가 비어 있을 때 넣는 문구. '문구 바꾸기'로 돌려 가며 고른다 */
  var HOOKS_KW = [
    function (d) { return '2027 교실 스포일러\n' + d.kw; },
    function (d) { return d.kwNo ? '키워드 21개 중\n' + d.kwNo + '번, ' + d.kw : ''; },
    function (d) { return '이 책에서\n' + d.kw + ' 담당'; },
    function (d) { return '내년 교실 미리 보기\n' + d.kw; }
  ];
  var HOOKS_BOOK = ['2027 교실 스포일러', '현장 교육전문가 30명이 고른\n2027 키워드 21', '내년 교실,\n미리 보기', '네 번째 책이 나왔어요'];
  /* 여는 글을 쓴 두 분께 넣는 문구 */
  var HOOKS_OPEN = [
    function (d) { return d.kwLabel + '\n' + headBreak(d.kw); },
    function (d) { return d.kwSub ? d.kw + '\n' + d.kwSub : ''; },
    function (d) { return '2027 대한민국 미래 교육 트렌드\n' + d.kwLabel; }
  ];
  function headBreak(t) { var b = KW_BREAKS[t]; return b && b.length > 1 && t.length > 14 ? b[1].join('\n') : t; }
  function hookList(d) { return d.kw ? (d.opener ? HOOKS_OPEN : HOOKS_KW).map(function (f) { return f(d); }).filter(Boolean) : HOOKS_BOOK; }
  function hookLine(d, i) { var l = hookList(d); return l[((i | 0) % l.length + l.length) % l.length]; }
  function geomOf(r) {
    var W = r.w, H = r.h, S = Math.min(W, H), m = Math.round(S * 0.07);
    var g = { id: r.id, W: W, H: H, S: S, m: m, top: m, bot: m, land: W / H > 1.3, story: r.id === '9x16', kbg: r.id === 'kakaobg', pf: r.id === 'profile' };
    if (g.story) { g.top = Math.round(H * 0.14); g.bot = Math.round(H * 0.16); }   // 인스타 스토리: 위 14%·아래 16%는 비운다
    if (g.kbg) { g.top = Math.round(H * 0.12); g.bot = Math.round(H * 0.45); }     // 카톡 배경: 12%~55%만 쓴다(아래는 프사·이름에 가려진다)
    g.ts = r.id === 'link' ? 1.24 : 1;                                              // 링크 카드는 작게 보이므로 작은 글자를 키운다
    return g;
  }
  function fileNameOf(r, t, d) {
    var parts = ['2027미래교육트렌드', d.fileKw || '표지'];
    if (d.fileName) parts.push(d.fileName);
    parts.push(r.file);
    return U.fileName(parts.join('_')) + (t.type === 'image/png' ? '.png' : '.jpg');
  }

  /* ---------- fonts & images ---------- */
  var FD = '"Gmarket Sans", "Pretendard Variable", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  var FB = '"Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  var HAS_LS = (function () { try { return 'letterSpacing' in CanvasRenderingContext2D.prototype; } catch (e) { return false; } })();
  function loadFonts(sample) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var t = sample || TITLE;
    return Promise.all([
      document.fonts.load('700 48px "Gmarket Sans"', t), document.fonts.load('500 48px "Gmarket Sans"', t),
      document.fonts.load('500 48px "Pretendard Variable"', t), document.fonts.load('700 48px "Pretendard Variable"', t)
    ]).then(function () { }, function () { });
  }
  var pool = {}, failed = {};
  /** image or null (never rejects). pl: cache object for this batch */
  function getImg(url, pl) {
    pl = pl || {};
    if (pl[url]) return pl[url];
    if (failed[url] && Date.now() - failed[url] < 45000) return Promise.resolve(null);
    var p = U.loadImage(url).then(function (im) { return im; }, function () { failed[url] = Date.now(); delete pl[url]; return null; });
    pl[url] = p;
    return p;
  }
  function kwUrl(id, hd) { return EDU.kwArt ? EDU.kwArt(id, hd ? 'hd' : 'pv') : 'assets/kw/' + id + (hd ? '.png' : '.webp'); }
  function loadSources(tid, g, d, hd, pl) {
    var jobs = {}, out = {};
    if (tid === 'art') {
      if (d.kwId) jobs.kw = getImg(kwUrl(d.kwId, hd), pl).then(function (im) { return im || getImg(kwUrl(d.kwId, !hd), pl); });
      else if (!d.kw && !g.pf) jobs.book = getImg('assets/covers/book3d' + (hd ? '.png' : '.webp'), pl);
    }
    if (tid === 'quote') jobs.book = getImg('assets/covers/book3d' + (hd ? '.png' : '.webp'), pl);
    if (tid === 'gift') jobs.c2027 = getImg('assets/covers/2027' + (hd ? '.jpg' : '.webp'), pl);
    if (tid === 'shelf') COVERS.forEach(function (cv) { jobs['c' + cv.y] = getImg('assets/covers/' + cv.y + (hd ? '.jpg' : '.webp'), pl); });
    var keys = Object.keys(jobs);
    return Promise.all(keys.map(function (k) { return jobs[k]; })).then(function (res) { keys.forEach(function (k, i) { out[k] = res[i]; }); return out; });
  }

  /* ---------- canvas: text ---------- */
  function setFont(c, o) {
    c.font = (o.w || 700) + ' ' + o.s.toFixed(2) + 'px ' + (o.f === 'b' ? FB : FD);
    if (HAS_LS) c.letterSpacing = ((o.ls || 0) * o.s).toFixed(2) + 'px';
  }
  function tw(c, t, o) { setFont(c, o); var w = c.measureText(t).width; if (HAS_LS && o.ls) w -= o.ls * o.s; return w; }
  function draw(c, t, x, y, o) {
    setFont(c, o); c.fillStyle = o.c || INK; c.textAlign = o.a || 'left'; c.textBaseline = 'alphabetic';
    if (HAS_LS && o.ls && o.a === 'right') x += o.ls * o.s; else if (HAS_LS && o.ls && o.a === 'center') x += o.ls * o.s / 2;
    c.fillText(t, x, y);
  }
  function fitLine(c, t, maxW, size, min, fo) {
    var o = { w: fo.w, f: fo.f, ls: fo.ls, s: 100 }, w = tw(c, t, o) / 100;
    return w ? Math.max(min, Math.min(size, maxW / w)) : size;
  }
  function ellip(c, t, maxW, fo) {
    if (tw(c, t, fo) <= maxW) return t;
    var s = t.replace(/…$/, '');
    while (s.length > 1 && tw(c, s + '…', fo) > maxW) s = s.slice(0, -1);
    return s.trim() + '…';
  }
  /* ---------- 줄바꿈: 뜻이 이어지는 말은 한 줄에 둔다 ---------- */
  // 표지 키워드 21개는 끊어도 되는 자리를 정해 둔다 (예: '피지컬 | AI 교육' ○, '피지컬 AI | 교육' ✕)
  var KW_BREAKS = {
    '콘텐츠 인플레이션': [['콘텐츠 인플레이션'], ['콘텐츠', '인플레이션']],
    '맥락 리터러시': [['맥락 리터러시'], ['맥락', '리터러시']],
    '슬로 리딩': [['슬로 리딩'], ['슬로', '리딩']],
    'AI 시대의 글쓰기': [['AI 시대의 글쓰기'], ['AI 시대의', '글쓰기']],
    '인지적 아웃소싱': [['인지적 아웃소싱'], ['인지적', '아웃소싱']],
    '기초학력 책임교육': [['기초학력 책임교육'], ['기초학력', '책임교육']],
    '마이크로 스포츠': [['마이크로 스포츠'], ['마이크로', '스포츠']],
    '고1 자퇴 증가': [['고1 자퇴 증가'], ['고1 자퇴', '증가'], ['고1', '자퇴 증가']],
    'AI 시대의 특수교육': [['AI 시대의 특수교육'], ['AI 시대의', '특수교육']],
    '생성형 AI와 예술교육': [['생성형 AI와 예술교육'], ['생성형 AI와', '예술교육']],
    '공동교육과정': [['공동교육과정']],
    '포용적 과학문해력': [['포용적 과학문해력'], ['포용적', '과학문해력']],
    '교권과 미래 교육': [['교권과 미래 교육'], ['교권과', '미래 교육']],
    '뉴 커먼 디자인 씽킹': [['뉴 커먼 디자인 씽킹'], ['뉴 커먼', '디자인 씽킹']],
    '교사교육자': [['교사교육자']],
    'AI 시대 교육의 정당성': [['AI 시대 교육의 정당성'], ['AI 시대', '교육의 정당성'], ['AI 시대', '교육의', '정당성']],
    '사회정서학습': [['사회정서학습']],
    '피지컬 AI 교육': [['피지컬 AI 교육'], ['피지컬', 'AI 교육']],
    '바이브 코딩과 수업 설계': [['바이브 코딩과 수업 설계'], ['바이브 코딩과', '수업 설계']],
    'AI 스마트 글라스': [['AI 스마트 글라스'], ['AI 스마트', '글라스']],
    '고교학점제와 대입 개편': [['고교학점제와 대입 개편'], ['고교학점제와', '대입 개편']],
    // 여는 글 두 편
    '조용한 귀환': [['조용한 귀환'], ['조용한', '귀환']],
    '우리가 지켜야 할 교실, 우리가 만들어갈 미래 교육': [['우리가 지켜야 할 교실, 우리가 만들어갈 미래 교육'], ['우리가 지켜야 할 교실,', '우리가 만들어갈 미래 교육'], ['우리가 지켜야 할 교실,', '우리가 만들어갈', '미래 교육'], ['우리가 지켜야 할', '교실,', '우리가 만들어갈', '미래 교육']]
  };
  // 문장 속에서도 떨어지면 어색한 말 묶음 (긴 것부터)
  var GLUE = ['대한민국 미래 교육 트렌드', '미래 교육 트렌드가', '미래 교육 트렌드', '현장 교육전문가 30명이', '2027 교실 스포일러', '내년 교실 미리 보기', '키워드 21개 중', '2027 키워드 21', '미리 보기', '이 책에서', '바이브 코딩과', '교육의 정당성', '디자인 씽킹', '생성형 AI와', 'AI 시대의', '미래 교육', '수업 설계', '대입 개편', 'AI 스마트', '고1 자퇴', '슬로 리딩', 'AI 시대', 'AI 교육', '네 번째', '뉴 커먼'];
  function glueWords(text) {
    var t = String(text);
    GLUE.forEach(function (ph) { if (t.indexOf(ph) > -1) t = t.split(ph).join(ph.replace(/ /g, '\uE000')); });
    var ws = t.split(/\s+/).filter(Boolean).map(function (w) { return w.replace(/\uE000/g, ' '); }), out = [], i;
    // 한 글자 낱말(열 수, 할 것, 더 …)은 줄 끝에 혼자 남지 않게 뒷말에 붙인다
    for (i = 0; i < ws.length; i++) {
      if (/^[가-힣]$/.test(ws[i]) && i + 1 < ws.length) { ws[i + 1] = ws[i] + ' ' + ws[i + 1]; continue; }
      out.push(ws[i]);
    }
    return out;
  }
  function wrapGreedy(c, text, maxW, fo) {
    if (String(text).indexOf('\n') > -1) {           // '\n'은 꼭 끊는 자리
      var brk = false, out = String(text).split('\n').reduce(function (all, part) { var l = wrapGreedy(c, part, maxW, fo); if (l.broken) brk = true; return all.concat(l); }, []);
      out.broken = brk; return out;
    }
    var words = glueWords(text), lines = [], cur = '', i;
    for (i = 0; i < words.length; i++) {
      var wd = words[i], t = cur ? cur + ' ' + wd : wd;
      if (tw(c, t, fo) <= maxW) { cur = t; continue; }
      if (wd.indexOf(' ') > -1 && tw(c, wd, fo) > maxW) { Array.prototype.splice.apply(words, [i, 1].concat(wd.split(' '))); lines.broken = true; i--; continue; }   // 묶음이 한 줄보다 길면 풀어서 다시
      if (cur) lines.push(cur);
      while (wd.length > 1 && tw(c, wd, fo) > maxW) {          // 띄어쓰기 없는 긴 낱말만 글자 단위로 자른다
        var j = wd.length - 1;
        while (j > 1 && tw(c, wd.slice(0, j), fo) > maxW) j--;
        lines.push(wd.slice(0, j)); wd = wd.slice(j);
      }
      cur = wd;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  /** 같은 줄 수 안에서 줄 길이를 고르게 나눈다(묶어 둔 말은 한 덩어리). 끝줄에 낱말 하나만 남는 꼴을 막는다 */
  function balancePara(c, text, maxW, fo) {
    return String(text).split('\n').reduce(function (all, part) {
      var g = wrapGreedy(c, part, maxW, fo), n = g.length;
      if (n < 2 || g.broken) return all.concat(g);
      var atoms = glueWords(part), m = atoms.length, INF = 1e18, dp = [], prev = [], i, j, k;
      function wd(a, b) { return tw(c, atoms.slice(a, b + 1).join(' '), fo); }
      for (k = 0; k <= n; k++) { dp.push([]); prev.push([]); for (j = 0; j < m; j++) { dp[k].push(INF); prev[k].push(-1); } }
      for (j = 0; j < m; j++) { var w0 = wd(0, j); if (w0 <= maxW) dp[1][j] = w0 * w0; }
      for (k = 2; k <= n; k++) for (j = k - 1; j < m; j++) for (i = k - 1; i <= j; i++) {
        var w = wd(i, j); if (w > maxW || dp[k - 1][i - 1] >= INF) continue;
        var cost = dp[k - 1][i - 1] + w * w; if (cost < dp[k][j]) { dp[k][j] = cost; prev[k][j] = i; }
      }
      if (dp[n][m - 1] >= INF) return all.concat(g);
      var out = [], end = m - 1;
      for (k = n; k >= 1; k--) { var st = k === 1 ? 0 : prev[k][end]; out.unshift(atoms.slice(st, end + 1).join(' ')); end = st - 1; }
      return all.concat(out);
    }, []);
  }
  /** paragraph that auto-shrinks, then balances its lines. o: maxW,maxH,maxLines,sizeMax,sizeMin,lh,padEm */
  function fitPara(c, text, o) {
    var lh = o.lh || 1.3, fo = { w: 700, s: o.sizeMax, ls: o.ls == null ? -0.03 : o.ls }, lines, s = o.sizeMax, cut = false;
    for (; ;) {
      fo.s = s; lines = wrapGreedy(c, text, o.maxW, fo);
      // 붙여 둘 말이 갈라졌으면 글자를 조금 더 줄여 본다(처음 크기의 62%까지만)
      if ((lines.length <= o.maxLines && ((lines.length - 1) * lh + 0.88 + (o.padEm || 0)) * s <= o.maxH && !(lines.broken && s > o.sizeMax * 0.62)) || s <= o.sizeMin) break;
      s = Math.max(o.sizeMin, s * 0.96);
    }
    if (lines.length > o.maxLines) { lines = lines.slice(0, o.maxLines); lines[o.maxLines - 1] = ellip(c, lines[o.maxLines - 1] + '…', o.maxW, fo); cut = true; }
    var n = lines.length, w = 0;
    if (n > 1 && !cut) { var bl = balancePara(c, text, o.maxW, fo); if (bl.length === n) lines = bl; }
    lines.forEach(function (l) { w = Math.max(w, tw(c, l, fo)); });
    return { size: s, lines: lines, w: w, h: ((n - 1) * lh + 0.88) * s, lh: lh, ls: fo.ls };
  }
  /** lines [{segs:[{t,c}],k}] → the biggest type that fits. o: maxW,maxH,sizeMax,lh,reserve(em kept free beside the last line) */
  function evalHead(c, lines, o) {
    var lh = o.lh || 1.14, ls = o.ls == null ? -0.035 : o.ls, n = lines.length, size = o.sizeMax, em = 0, ws = [], i;
    for (i = 0; i < n; i++) {
      var L = lines[i], k = L.k || 1, t = L.segs.map(function (s) { return s.t; }).join('');
      var w = tw(c, t, { w: 700, s: 100, ls: ls }) / 100 * k; ws.push(w);
      size = Math.min(size, o.maxW / (w + (i === n - 1 ? (o.reserve || 0) * k : 0)));
      em += k * (i === n - 1 ? 0.88 : lh);
    }
    size = Math.min(size, o.maxH / em);
    return { size: size, lines: lines, ws: ws, h: em * size, lh: lh, ls: ls };
  }
  /** keyword-style headline: tries every way to break at spaces into minLines..maxLines and keeps the largest */
  function fitHeadline(c, text, o) {
    var fixed = !o._free && KW_BREAKS[String(text).replace(/\s+/g, ' ').trim()];
    if (fixed) {
      var ok = fixed.filter(function (ch) { return ch.length <= (o.maxLines || 3) && ch.length >= Math.min(o.minLines || 1, fixed[fixed.length - 1].length); });
      if (ok.length) return fitChoices(c, ok, Object.assign({}, o, { minLines: 1 }));
    }
    var words = text.split(/\s+/).filter(Boolean), n = words.length, best = null;
    var maxL = Math.min(o.maxLines || 3, n), minL = Math.min(o.minLines || 1, maxL), cols = o.cols || [INK, WH];
    function tryCuts(cuts) {
      var lines = [], i;
      for (i = 0; i < cuts.length; i++) lines.push({ k: 1, segs: [{ t: words.slice(cuts[i], i + 1 < cuts.length ? cuts[i + 1] : n).join(' ') }] });
      var r = evalHead(c, lines, o), mx = Math.max.apply(null, r.ws), mn = Math.min.apply(null, r.ws), odd = false;
      // '코딩과 | 수업'처럼 조사로 끝난 낱말 뒤에서 끊는 쪽을 고른다 (조사 낱말이 줄 가운데에 있으면 감점)
      if (lines.length > 1) lines.forEach(function (L) { var ws = L.segs[0].t.split(' '); for (var q = 0; q < ws.length - 1; q++) if (ws[q].length > 1 && /[과와의에를을]$/.test(ws[q])) odd = true; });
      var lastT = lines[lines.length - 1].segs[0].t, lone = lines.length > 1 && n > 2 && lastT.indexOf(' ') < 0 && lastT.length <= 2;   // 끝줄에 짧은 낱말 하나만 남는 꼴
      r.score = r.size * (mn / mx < 0.4 ? 0.85 : 1) * (odd ? 0.78 : 1) * (lone ? 0.74 : 1) * (1 - 0.03 * (lines.length - 1));
      if (!best || r.score > best.score) best = r;
    }
    (function rec(cuts, from) {
      if (cuts.length >= minL) tryCuts(cuts);
      if (cuts.length >= maxL) return;
      for (var i = from; i < n; i++) rec(cuts.concat(i), i + 1);
    })([0], 1);
    best.lines.forEach(function (L, i) { L.segs[0].c = i === best.lines.length - 1 ? cols[1] : cols[0]; });
    return best;
  }
  /** fixed wordings (book title, shelf headline): only the listed line breaks are allowed */
  function fitChoices(c, choices, o) {
    var best = null, cols = o.cols || [INK, WH];
    choices.forEach(function (ch) {
      if (ch.length > (o.maxLines || 3) || ch.length < (o.minLines || 1)) return;
      var r = evalHead(c, ch.map(function (t, i) { return { k: 1, segs: [{ t: t, c: i === ch.length - 1 ? cols[1] : cols[0] }] }; }), o);
      r.score = r.size * (1 - 0.03 * (ch.length - 1));
      if (!best || r.score > best.score) best = r;
    });
    return best || fitHeadline(c, choices[0].join(' '), Object.assign({}, o, { _free: true }));
  }
  /** the real title lockup: 2027(흰) 대한민국 / 미래 교육 / 트렌드(흰) — two lines on wide cards */
  function fitLockup(c, o, wide) {
    if (wide) return evalHead(c, [
      { k: 0.86, segs: [{ t: '2027', c: WH }, { t: ' 대한민국', c: INK }] },
      { k: 1, segs: [{ t: '미래 교육', c: INK }, { t: ' 트렌드', c: WH }] }
    ], o);
    return evalHead(c, [
      { k: 0.72, segs: [{ t: '2027', c: WH }, { t: ' 대한민국', c: INK }] },
      { k: 1, segs: [{ t: '미래 교육', c: INK }] },
      { k: 0.95, segs: [{ t: '트렌드', c: WH }] }
    ], o);
  }
  function drawHead(c, hd, x, y, align) {
    var last = null, yy = y, i;
    for (i = 0; i < hd.lines.length; i++) {
      var L = hd.lines[i], s = hd.size * (L.k || 1), w = hd.ws[i] * hd.size, x0 = align === 'center' ? x - w / 2 : x, xx = x0, base = yy + s * 0.77, j;
      for (j = 0; j < L.segs.length; j++) {
        var fo = { w: 700, s: s, ls: hd.ls, c: L.segs[j].c || INK };
        draw(c, L.segs[j].t, xx, base, fo);
        xx += tw(c, L.segs[j].t, fo) + (HAS_LS ? hd.ls * s : 0);
      }
      last = { x0: x0, x1: x0 + w, cy: base - s * 0.33, size: s };
      yy += s * hd.lh;
    }
    return last;
  }
  /** run of small pieces (이름 · 소속 · 아이디) with ' · ' between, wrapped at piece boundaries */
  function flow(c, segs, maxW, size, o) {
    o = o || {};
    if (o.one && (o.maxLines || 2) > 1) { var f1 = flow(c, segs, maxW, size, { maxLines: 1, min: o.one }); if (f1.fits) return f1; }
    var maxLines = o.maxLines || 2, min = o.min || 0.72, s = size, lines, sepW, i, ok;
    for (; ;) {
      lines = [[]]; ok = true; sepW = tw(c, ' · ', { w: 500, s: s, f: 'b' });
      var x = 0;
      for (i = 0; i < segs.length; i++) {
        var sg = segs[i], fo = { w: sg.w || 500, s: s * (sg.k || 1), f: sg.f || 'b', ls: sg.ls || 0 }, wd = tw(c, sg.t, fo), cur = lines[lines.length - 1];
        if (cur.length && x + sepW + wd > maxW) { lines.push([]); cur = lines[lines.length - 1]; x = 0; }
        if (wd > maxW) ok = false;
        cur.push({ sg: sg, fo: fo, w: wd, t: sg.t }); x += (cur.length > 1 ? sepW : 0) + wd;
      }
      if ((ok && lines.length <= maxLines) || s <= size * min) break;
      s *= 0.95;
    }
    var fits = ok && lines.length <= maxLines;
    if (lines.length > maxLines) lines = lines.slice(0, maxLines);
    var kmax = 1;
    lines.forEach(function (ln) { ln.forEach(function (it) { if (it.w > maxW) { it.t = ellip(c, it.t, maxW, it.fo); it.w = tw(c, it.t, it.fo); } kmax = Math.max(kmax, it.sg.k || 1); }); });
    var lh = s * kmax * 1.46;
    return { lines: lines, s: s, sepW: sepW, lh: lh, kmax: kmax, fits: fits, sep: segs.sep || '#8A8B90', h: (lines.length - 1) * lh + s * kmax * 0.9 };
  }
  function drawFlow(c, fl, x, top, align) {
    fl.lines.forEach(function (ln, li) {
      var w = 0, base = top + li * fl.lh + fl.s * fl.kmax * 0.79, xx;
      ln.forEach(function (it, i) { w += it.w + (i ? fl.sepW : 0); });
      xx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      ln.forEach(function (it, i) {
        if (i) { draw(c, ' · ', xx, base, { w: 500, s: fl.s, f: 'b', c: fl.sep }); xx += fl.sepW; }
        draw(c, it.t, xx, base - (it.fo.f === 'b' ? 0 : it.fo.s * 0.03), { w: it.fo.w, s: it.fo.s, f: it.fo.f, ls: it.fo.ls, c: it.sg.c });
        xx += it.w;
      });
    });
  }
  var TONES = {
    dark: { name: WH, org: '#C9CACD', handle: '#7FDBF6', sep: '#75767C', kw: CY },
    cy: { name: INK, org: '#04262F', handle: WH, sep: '#04262F', kw: WH },
    white: { name: INK, org: '#55565B', handle: '#00708F', sep: '#B4B5BA', kw: '#00708F' }
  };
  function authorSegs(d, tone, o) {
    var t = TONES[tone], a = [];
    o = o || {};
    if (d.name) a.push({ t: d.name, c: t.name, f: 'd', w: 700, k: o.nameK || 1.14, ls: -0.02 });
    if (d.org) a.push({ t: d.org, c: t.org, w: 550 });
    if (d.handle && !o.noHandle) a.push({ t: d.handle, c: t.handle, w: 550 });
    if (!a.length) { a.push({ t: TEAM, c: t.name, f: 'd', w: 700, k: o.nameK || 1.14, ls: -0.02 }); a.push({ t: PUB, c: t.org, w: 550 }); }
    if (o.kw && d.kw) a.push({ t: '{ ' + d.kw + ' }', c: t.kw, f: 'd', w: 500, ls: -0.01 });
    a.sep = t.sep;
    return a;
  }

  /* ---------- canvas: shapes ---------- */
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function sparkle(c, cx, cy, r, col) {            // 표지의 네 갈래 별
    var k = r * 0.17;
    c.beginPath(); c.moveTo(cx, cy - r);
    c.quadraticCurveTo(cx + k, cy - k, cx + r, cy); c.quadraticCurveTo(cx + k, cy + k, cx, cy + r);
    c.quadraticCurveTo(cx - k, cy + k, cx - r, cy); c.quadraticCurveTo(cx - k, cy - k, cx, cy - r);
    c.closePath(); c.fillStyle = col; c.fill();
    c.lineJoin = 'round'; c.lineWidth = r * 0.07; c.strokeStyle = col; c.stroke();
  }
  function arcs(c, cx, by, hw, h, col) {           // 표지의 펼친 책: 책등 아래 꼭짓점이 (cx, by)
    c.save(); c.strokeStyle = col; c.lineWidth = hw * 0.034; c.lineCap = 'round'; c.lineJoin = 'round';
    [[-0.613, -1, -0.15, -1], [-0.9, -0.595, -0.26, -0.81], [-1, -0.01, -0.46, -0.7]].forEach(function (a) {
      [1, -1].forEach(function (sg) {
        c.beginPath(); c.moveTo(cx + sg * a[0] * hw, by + a[1] * h);
        c.quadraticCurveTo(cx + sg * a[2] * hw, by + a[3] * h, cx, by); c.stroke();
      });
    });
    c.restore();
  }
  function brace(c, x, y, w, h, dir, col, lw) {     // dir 1 = '{' (tip at x), -1 = '}'
    var xs = x + dir * w * 0.52, xe = x + dir * w, r = Math.min(w * 0.62, h * 0.24), my = y + h / 2;
    c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(xe, y); c.quadraticCurveTo(xs, y, xs, y + r); c.lineTo(xs, my - r);
    c.quadraticCurveTo(xs, my, x, my); c.quadraticCurveTo(xs, my, xs, my + r); c.lineTo(xs, y + h - r);
    c.quadraticCurveTo(xs, y + h, xe, y + h); c.stroke(); c.restore();
  }
  /** `{ 한두 줄 }` — returns its size. x is the centre (or the left edge when align === 'left') */
  function braceBlock(c, x, top, lines, size, col, maxW, align) {
    var fo = { w: 500, s: size, ls: -0.02 }, wd = 0, i;
    for (i = 0; i < lines.length; i++) wd = Math.max(wd, tw(c, lines[i], fo));
    var need = wd + 2 * size * 1.1;
    if (need > maxW) { var k = maxW / need; size *= k; fo.s = size; wd *= k; }
    var lh = size * 1.42, th = lines.length * lh, bh = lines.length > 1 ? th + size * 0.3 : size * 1.8;
    var bw = lines.length > 1 ? bh * 0.19 : size * 0.5, gap = size * 0.55, total = wd + 2 * (bw + gap);
    var x0 = align === 'left' ? x : x - total / 2, lw = size * 0.115;
    brace(c, x0, top, bw, bh, 1, col, lw); brace(c, x0 + total, top, bw, bh, -1, col, lw);
    for (i = 0; i < lines.length; i++) draw(c, lines[i], x0 + total / 2, top + (bh - th) / 2 + i * lh + (lh - size * 0.88) / 2 + size * 0.77, { w: 500, s: size, ls: -0.02, c: col, a: 'center' });
    return { w: total, h: bh };
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function chip(c, x, y, text, s, maxW) {
    var fo = { w: 700, s: s, ls: -0.02 }, w = tw(c, text, fo), pad = s * 0.95;
    if (w + 2 * pad > maxW) { s = Math.max(s * 0.62, s * maxW / (w + 2 * pad)); fo.s = s; pad = s * 0.95; text = ellip(c, text, maxW - 2 * pad, fo); w = tw(c, text, fo); }
    var h = s * 2.2;
    roundRect(c, x, y, w + 2 * pad, h, h / 2); c.fillStyle = CY; c.fill();
    draw(c, text, x + pad, y + (h - s * 0.88) / 2 + s * 0.77, { w: 700, s: s, ls: -0.02, c: INK });
    return h;
  }
  /** stand-in picture when a keyword has no art: the cover's open book and stars */
  function emblem(c, cx, cy, s) {
    var aw = s * 0.84, ah = aw / ARC_AR;
    arcs(c, cx, cy + s * 0.37, aw / 2, ah, INK);
    sparkle(c, cx, cy - s * 0.085, s * 0.2, WH);
    sparkle(c, cx + s * 0.31, cy - s * 0.27, s * 0.085, INK);
    sparkle(c, cx - s * 0.3, cy - s * 0.2, s * 0.05, WH);
  }
  /** the picture of the 키워드 그림 template inside a box */
  function artPic(c, d, im, x, y, w, h, fw, fh) {
    var cx = x + w / 2, cy = y + h / 2, s = Math.min(w * fw, h * fh);
    if (im.kw) c.drawImage(im.kw, cx - s / 2, cy - s / 2, s, s);
    else if (!d.kw && im.book) { var bh = Math.min(h * fh, w * fw / BOOK_AR), bw = bh * BOOK_AR; c.drawImage(im.book, cx - bw / 2, cy - bh / 2, bw, bh); }
    else emblem(c, cx, cy, s * 0.9);
  }
  function bookAt(c, img, cv, x, y, w, h, lw) {     // one flat cover with a white keyline (so the cyan 2027 reads on cyan)
    rect(c, x - lw, y - lw, w + 2 * lw, h + 2 * lw, WH);
    if (img) c.drawImage(img, x, y, w, h);
    else { rect(c, x, y, w, h * 0.71, cv.col); rect(c, x, y + h * 0.71, w, h * 0.29, INK); }
  }
  /** 첫 권·2025·2026이 굵은 선 위에 나란히 서고, 2027이 맨 앞에 가장 크게 */
  function shelfScene(c, im, x, y, w, h) {
    var K = 1.3, GAP = 0.075, OV = 0.2, EXT = 0.13, LW = 0.04;
    var uw = COVERS[0].ar + GAP + COVERS[1].ar + GAP + COVERS[2].ar * (1 - OV) + COVERS[3].ar * K + 2 * EXT;
    var u = Math.min(w / uw, h / (K + LW)), sw = uw * u, x0 = x + (w - sw) / 2, base = y + h - LW * u, bx = x0 + EXT * u, i;
    for (i = 0; i < 3; i++) { bookAt(c, im['c' + COVERS[i].y], COVERS[i], bx, base - u, COVERS[i].ar * u, u, u * 0.022); bx += (COVERS[i].ar + GAP) * u; }
    bx -= (GAP + COVERS[2].ar * OV) * u;
    bookAt(c, im.c2027, COVERS[3], bx, base - K * u, COVERS[3].ar * K * u, K * u, u * 0.028);
    c.save(); c.strokeStyle = INK; c.lineWidth = LW * u; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0 + LW * u / 2, base + LW * u / 2); c.lineTo(x0 + sw - LW * u / 2, base + LW * u / 2); c.stroke(); c.restore();
    return { top: base - K * u, h: (K + LW) * u };
  }

  /* ---------- black field: 저자 block ---------- */
  function authorBlock(c, g, x, y, w, h, d, o) {
    o = o || {};
    var S = g.S, has = !!d.name, label = d.opener ? d.kwLabel : '저자', big, subs = [];   // 여는 글을 쓴 분은 '여는 글'로 적는다
    if (has) { big = d.name; if (d.org) subs.push({ t: d.org, c: '#C9CACD', w: 500 }); if (d.handle) subs.push({ t: d.handle, c: '#7FDBF6', w: 500 }); }
    else if (d.org || d.handle) { big = d.org || d.handle; if (d.org && d.handle) subs.push({ t: d.handle, c: '#7FDBF6', w: 500 }); }
    else { label = '지은이'; big = TEAM; subs.push({ t: '30명의 현장 교육전문가', c: '#C9CACD', w: 500 }); }
    subs.sep = '#75767C';
    var kw = o.kw || '', cap = kw ? (d.kwLabel || '키워드') : (label === '지은이' ? PUB : TEAM + ' · ' + PUB);
    var leftW = kw ? w * 0.55 : w, padT = S * 0.036, padB = g.story ? S * 0.012 : S * 0.062, q = 1, labS, subS, nameS, fl, g1, g2, total;
    for (; ;) {                                   // 검정 면 높이에 맞을 때까지 조금씩 줄인다
      labS = S * 0.026 * g.ts * q; subS = S * 0.033 * g.ts * q; g1 = S * 0.026 * q; g2 = S * 0.027 * q;
      var nameMax = S * (has ? 0.09 : 0.066) * q;
      nameS = fitLine(c, big, leftW, nameMax, nameMax * 0.4, { w: 700, ls: -0.03 });
      fl = subs.length ? flow(c, subs, leftW, subS, { maxLines: 2, min: 0.74, one: 0.84 }) : null;
      total = labS * 0.88 + g1 + nameS * 0.88 + (fl ? g2 + fl.h : 0);
      if (total <= h - padT - padB || q < 0.6) break;
      q *= 0.93;
    }
    var y0 = y + padT + Math.max(0, (h - padT - padB - total) / 2), ny = y0 + labS * 0.88 + g1;
    draw(c, label, x, y0 + labS * 0.77, { w: 500, s: labS, c: CY, ls: 0.12 });
    draw(c, cap, x + w, y0 + labS * 0.77, { w: 500, s: labS, c: kw ? CY : '#A5A6AB', a: 'right', ls: kw ? 0.12 : 0 });
    draw(c, ellip(c, big, leftW, { w: 700, s: nameS, ls: -0.03 }), x, ny + nameS * 0.77, { w: 700, s: nameS, c: WH, ls: -0.03 });
    if (fl) drawFlow(c, fl, x, ny + nameS * 0.88 + g2, 'left');
    if (kw) {
      var rw = w * 0.4, kh = fitHeadline(c, kw, { maxW: rw, maxH: total - labS * 0.88 - g1, maxLines: 2, sizeMax: S * 0.056 * q, lh: 1.24, cols: [CY, CY] }), ky = ny + Math.max(0, (nameS * 0.88 - kh.h) / 2), li;
      for (li = 0; li < kh.lines.length; li++) draw(c, kh.lines[li].segs[0].t, x + w, ky + li * kh.size * kh.lh + kh.size * 0.77, { w: 700, s: kh.size, c: CY, ls: kh.ls, a: 'right' });
    }
  }

  /* ---------- 1. 표지 그대로 ---------- */
  function tCover(c, g, d) {
    if (g.pf) return pfCover(c, g);
    var W = g.W, H = g.H, S = g.S, m = g.m, cw = W - 2 * m;
    var split = Math.round(H * (g.kbg ? 0.88 : g.story ? 0.685 : g.land ? 0.665 : 0.7));
    rect(c, 0, 0, W, split, CY); rect(c, 0, split, W, H - split, INK);
    var bb = braceBlock(c, W / 2, g.top, d.kw ? [TITLE] : SUB, S * (d.kw ? 0.035 : 0.032) * g.ts, INK, cw);
    var top = g.top + bb.h + S * 0.045, bot = g.kbg ? H - g.bot : split - S * 0.05, fl = null;
    if (g.kbg) { fl = flow(c, authorSegs(d, 'cy'), cw, S * 0.038, { maxLines: 2, min: 0.7 }); bot -= fl.h + S * 0.05; }
    var avail = bot - top, arcH = Math.min(avail * 0.2, cw * 0.8 / ARC_AR), arcW = arcH * ARC_AR, gap = S * 0.036;
    var o = { maxW: cw, maxH: avail - arcH - gap, maxLines: g.land ? 2 : 3, sizeMax: Math.min(W * 0.2, S * 0.24), reserve: 2.5 };
    var hd = d.kw ? fitHeadline(c, d.kw, o) : fitLockup(c, o, g.land);
    var y = top + (avail - hd.h - gap - arcH) / 2, L = drawHead(c, hd, W / 2, y, 'center'), r = L.size * 0.44, sg = L.size * 0.36;
    sparkle(c, L.x0 - sg - r, L.cy, r, WH); sparkle(c, L.x1 + sg + r, L.cy, r, INK);
    arcs(c, W / 2, y + hd.h + gap + arcH, arcW / 2, arcH, INK);
    if (g.kbg) drawFlow(c, fl, W / 2, H - g.bot - fl.h, 'center');
    else authorBlock(c, g, m, split, cw, (g.story ? H - g.bot : H) - split, d);
  }
  function pfCover(c, g) {                          // 프사: 2027 / ✦ 미래 교육 트렌드 ✦ / 펼친 책
    var W = g.W, cx = W / 2, cy = g.H / 2;
    rect(c, 0, 0, W, g.H, CY);
    var s1 = W * 0.228, s2 = W * 0.062, t2 = '미래 교육 트렌드', fo2 = { w: 700, s: s2, ls: -0.03 };
    draw(c, '2027', cx, cy - W * 0.212 + s1 * 0.77, { w: 700, s: s1, c: WH, ls: -0.04, a: 'center' });
    var w2 = tw(c, t2, fo2), y2 = cy + W * 0.032, r = W * 0.032, gp = W * 0.022;
    draw(c, t2, cx, y2 + s2 * 0.77, { w: 700, s: s2, c: INK, ls: -0.03, a: 'center' });
    sparkle(c, cx - w2 / 2 - gp - r, y2 + s2 * 0.44, r, WH); sparkle(c, cx + w2 / 2 + gp + r, y2 + s2 * 0.44, r, INK);
    arcs(c, cx, cy + W * 0.232, W * 0.225, W * 0.45 / ARC_AR, INK);
  }

  /* ---------- 2. 키워드 그림 ---------- */
  function artText(c, g, d, x, y, w, h, land) {
    var S = g.S, footS = S * 0.026 * g.ts, footH = footS * 0.9, footTxt = d.kw ? TITLE : TEAM + ' · ' + PUB, segs = [];
    if (d.name) segs.push({ t: d.name, c: WH, f: 'd', w: 700, k: 1.1, ls: -0.02 });
    if (d.org) segs.push({ t: d.org, c: '#C9CACD', w: 500 });
    if (land && d.handle) segs.push({ t: d.handle, c: '#7FDBF6', w: 500 });
    if (!segs.length) segs.push({ t: d.opener && d.kwSub ? d.kwSub : d.kw ? TEAM : SUB[0] + ' ' + SUB[1], c: '#C9CACD', w: 500 });
    if (d.opener) segs.unshift({ t: d.kwLabel, c: CY, w: 700 });   // 여는 글: 제목 아래에 '여는 글'을 먼저 적는다
    segs.sep = '#75767C';
    var fl = flow(c, segs, w, S * 0.036 * g.ts, { maxLines: land ? 2 : 1, min: 0.62 });
    var g1 = S * (land ? 0.036 : 0.025), g2 = S * 0.03, room = h - footH - g2 - fl.h - g1;
    var ho = { maxW: w, maxH: land ? room * 0.86 : room, maxLines: land ? 3 : 2, sizeMax: S * (land ? 0.16 : 0.11), cols: [WH, WH] };
    var hd = d.kw ? fitHeadline(c, d.kw, ho) : fitChoices(c, TITLE_BREAKS, ho);
    if (!d.kw) hd.lines.forEach(function (L) { var t = L.segs[0].t; if (t.indexOf('2027 ') === 0) L.segs = [{ t: '2027', c: CY }, { t: t.slice(4), c: WH }]; });
    var fy;
    if (land) {
      var gy = y + (h - footH - g2 - hd.h - g1 - fl.h) / 2;
      drawHead(c, hd, x, gy, 'left'); drawFlow(c, fl, x, gy + hd.h + g1, 'left'); fy = y + h - footH;
    } else {
      var ty = y + Math.max(0, (h - (hd.h + g1 + fl.h + g2 + footH)) / 2);
      drawHead(c, hd, x, ty, 'left'); drawFlow(c, fl, x, ty + hd.h + g1, 'left'); fy = ty + hd.h + g1 + fl.h + g2;
    }
    var r = footS * 0.55, fx = x + r * 2 + footS * 0.5, ffo = { w: 500, s: footS, c: '#E4E5E8', ls: -0.01 };
    sparkle(c, x + r, fy + footH / 2, r, CY);
    draw(c, footTxt, fx, fy + footS * 0.77, ffo);
    if (!land && d.handle) {
      var free = x + w - (fx + tw(c, footTxt, ffo) + footS * 1.6), hs = fitLine(c, d.handle, free, footS * 1.1, footS * 0.72, { w: 500, f: 'b' }), hfo = { w: 500, s: hs, f: 'b' };
      if (free > footS * 4) draw(c, ellip(c, d.handle, free, hfo), x + w, fy + footS * 0.77, { w: 500, s: hs, f: 'b', c: '#7FDBF6', a: 'right' });
    }
  }
  function tArt(c, g, d, im) {
    if (g.pf) return pfArt(c, g, d, im);
    var W = g.W, H = g.H, S = g.S, m = g.m, cw = W - 2 * m, field = d.kw ? CY : WH;
    if (g.land) {                                   // 가로형: 왼쪽 그림, 오른쪽 검정 면
      var pw = Math.round(W * 0.48);
      rect(c, 0, 0, pw, H, field); rect(c, pw, 0, W - pw, H, INK);
      artPic(c, d, im, 0, 0, pw, H, 0.84, 0.84);
      artText(c, g, d, pw + m, m, W - pw - 2 * m, H - 2 * m, true);
      return;
    }
    if (g.kbg) {                                    // 카톡 배경: 위쪽 구간에만 그림·글
      var fb = Math.round(H * 0.88), wb = Math.round(H * 0.6);
      if (d.kw) rect(c, 0, 0, W, fb, CY); else { rect(c, 0, 0, W, wb, WH); rect(c, 0, wb, W, fb - wb, CY); }
      rect(c, 0, fb, W, H - fb, INK);
      var zt = g.top, zb = H - g.bot, fl = flow(c, authorSegs(d, d.kw ? 'cy' : 'white'), cw, S * 0.038, { maxLines: 2, min: 0.7, one: 0.82 });
      var ko = { maxW: cw, maxH: S * 0.2, maxLines: 2, sizeMax: S * 0.094, cols: d.kw ? [WH, WH] : [INK, INK] }, hd = d.kw ? fitHeadline(c, d.kw, ko) : fitChoices(c, TITLE_BREAKS, ko);
      if (!d.kw) hd.lines.forEach(function (L) { var t = L.segs[0].t; if (t.indexOf('2027 ') === 0) L.segs = [{ t: '2027', c: CY }, { t: t.slice(4), c: INK }]; });
      var g1 = S * 0.038, g2 = S * 0.034, a = Math.min(cw * 0.7, zb - zt - hd.h - g2 - fl.h - g1), ty = zt + a + g1;
      artPic(c, d, im, (W - a) / 2, zt, a, a, 1, 1);
      drawHead(c, hd, W / 2, ty, 'center'); drawFlow(c, fl, W / 2, ty + hd.h + g2, 'center');
      return;
    }
    var bandH = Math.round(H * (g.story ? 0.34 : g.id === '1x1' ? 0.28 : 0.26)), ay = H - bandH, at = g.story ? Math.round(g.top * 0.72) : 0;
    rect(c, 0, 0, W, ay, field); rect(c, 0, ay, W, bandH, INK);
    artPic(c, d, im, 0, at, W, ay - at, 0.8, g.story ? 0.94 : 0.88);
    var ty2 = ay + S * 0.037, tb = H - (g.story ? g.bot : Math.round(S * 0.063));
    artText(c, g, d, m, ty2, cw, tb - ty2, false);
  }
  function pfArt(c, g, d, im) {
    var W = g.W, cx = W / 2, cy = g.H / 2, s = W * 0.57, ts = W * 0.027;
    rect(c, 0, 0, W, g.H, CY);
    if (im.kw) c.drawImage(im.kw, cx - s / 2, cy - s / 2 - W * 0.035, s, s); else emblem(c, cx, cy - W * 0.03, s * 0.92);
    draw(c, '2027 미래 교육 트렌드', cx, cy + W * 0.3 + ts * 0.77, { w: 700, s: ts, c: INK, ls: -0.01, a: 'center' });
  }

  /* ---------- 3. 한 문장 ---------- */
  function tQuote(c, g, d, im) {
    if (g.pf) return pfQuote(c, g, im);
    var W = g.W, H = g.H, S = g.S, m = g.m, bk = im.book, zb = H - g.bot, bh, bw, bx, by;
    rect(c, 0, 0, W, H, WH);
    if (g.kbg) { var wb = Math.round(H * 0.6), fb = Math.round(H * 0.88); rect(c, 0, wb, W, fb - wb, CY); rect(c, 0, fb, W, H - fb, INK); }
    // 책은 자르지 않는다: 어느 크기에서도 표지 전체가 여백 안에 들어온다
    if (g.land) { bh = H * 0.8; bw = bh * BOOK_AR; bx = W - m * 0.9 - bw; by = (H - bh) / 2; }
    else if (g.kbg) { bh = H * 0.205; bw = bh * BOOK_AR; bx = W - m * 0.55 - bw; by = zb - bh * 0.985; }
    else if (g.story) { bh = H * 0.31; bw = bh * BOOK_AR; bx = W - m * 0.7 - bw; by = zb - bh; }
    else { bh = H * (g.id === '1x1' ? 0.43 : 0.41); bw = bh * BOOK_AR; bx = W - m * 0.7 - bw; by = H - m * 0.75 - bh; }
    if (bk) c.drawImage(bk, bx, by, bw, bh);
    // 왼쪽 아래: 키워드 칩 + 작은 줄
    var capS = S * 0.023 * g.ts, chipS = S * 0.031 * g.ts, leftMax = bx + bw * 0.12 - m - S * 0.03, capBase = zb - capS * 0.11;
    draw(c, d.name || d.org || d.handle ? TEAM + ' · ' + PUB : '30명의 현장 교육전문가', m, capBase, { w: 500, s: capS, c: '#6E6E73' });
    var chipY = capBase - capS * 0.77 - S * 0.024 - chipS * 2.2;
    chip(c, m, chipY, d.kw || TITLE, chipS, leftMax);
    // 한 문장 + 이름
    var bwid = S * 0.056, bgap = S * 0.034, lw = S * 0.0125, qTop = g.top;
    var qBot = (g.land ? chipY : Math.min(by + bh * 0.03, chipY)) - S * 0.055, qRight = g.land ? bx + bw * 0.1 - S * 0.02 : W - m;
    var tx = m + bwid + bgap, maxW = qRight - m - 2 * (bwid + bgap);
    var att = flow(c, authorSegs(d, 'white', { nameK: 1.2 }), qRight - tx, S * 0.034 * g.ts, { maxLines: 2, min: 0.72, one: 0.86 }), attGap = S * 0.046;
    var fp = fitPara(c, d.line, { maxW: maxW, maxH: qBot - qTop - attGap - att.h, maxLines: 5, sizeMax: S * 0.095, sizeMin: S * 0.034, lh: 1.32, padEm: 0.46 });
    var pad = fp.size * 0.23, blockH = fp.h + 2 * pad, y0 = qTop + Math.max(0, (qBot - qTop - blockH - attGap - att.h) * (g.land ? 0.5 : 0.34)), i;
    brace(c, m, y0, bwid, blockH, 1, CY, lw); brace(c, tx + fp.w + bgap + bwid, y0, bwid, blockH, -1, CY, lw);
    for (i = 0; i < fp.lines.length; i++) draw(c, fp.lines[i], tx, y0 + pad + i * fp.lh * fp.size + fp.size * 0.77, { w: 700, s: fp.size, c: INK, ls: fp.ls });
    drawFlow(c, att, tx, y0 + blockH + attGap, 'left');
  }
  function pfQuote(c, g, im) {
    var W = g.W, cx = W / 2, cy = g.H / 2, bh = W * 0.6, bw = bh * BOOK_AR;
    rect(c, 0, 0, W, g.H, WH);
    if (im.book) { c.save(); c.translate(cx + W * 0.012, cy + W * 0.01); c.rotate(-4 * Math.PI / 180); c.drawImage(im.book, -bw / 2, -bh / 2, bw, bh); c.restore(); }
    else emblem(c, cx, cy, W * 0.5);
    sparkle(c, cx - W * 0.275, cy - W * 0.15, W * 0.042, CY);
    sparkle(c, cx + W * 0.29, cy + W * 0.13, W * 0.03, CY);
    sparkle(c, cx + W * 0.262, cy - W * 0.225, W * 0.02, INK);
  }

  /* ---------- 4. 네 권의 서가 ---------- */
  function tShelf(c, g, d, im) {
    if (g.pf) return pfShelf(c, g, im);
    var W = g.W, H = g.H, S = g.S, m = g.m, cw = W - 2 * m;
    var split = Math.round(H * (g.kbg ? 0.88 : g.story ? 0.685 : g.land ? 0.665 : 0.7));
    rect(c, 0, 0, W, split, CY); rect(c, 0, split, W, H - split, INK);
    var hd, L, r;
    if (g.land) {                                   // 가로형: 왼쪽 글, 오른쪽 책
      var scW = Math.round(cw * 0.57), scX = W - m - scW, colW = scX - m - S * 0.045;
      shelfScene(c, im, scX, m, scW, split - m - S * 0.05);
      var bb = braceBlock(c, m, m, [TITLE], S * 0.035 * g.ts, INK, colW, 'left'), top = m + bb.h + S * 0.045, bot = split - S * 0.055;
      hd = fitChoices(c, HEAD_BREAKS, { maxW: colW, maxH: bot - top, maxLines: 3, sizeMax: S * 0.17, reserve: 1.25 });
      L = drawHead(c, hd, m, top + (bot - top - hd.h) / 2, 'left'); r = L.size * 0.34;
      sparkle(c, L.x1 + L.size * 0.3 + r, L.cy - L.size * 0.08, r, WH); sparkle(c, L.x1 + L.size * 0.3 + r * 2.5, L.cy + L.size * 0.3, r * 0.5, INK);
      authorBlock(c, g, m, split, cw, H - split, d, { kw: d.kw });
      return;
    }
    var bb2 = braceBlock(c, W / 2, g.top, [TITLE], S * 0.035, INK, cw), top2 = g.top + bb2.h + S * 0.05, bot2 = g.kbg ? H - g.bot : split - S * 0.05, fl = null;
    if (g.kbg) { fl = flow(c, authorSegs(d, 'cy', { kw: true }), cw, S * 0.037, { maxLines: 2, min: 0.7, one: 0.9 }); bot2 -= fl.h + S * 0.045; }
    var two = bot2 - top2 > S * 0.62, gap = S * 0.05;
    hd = fitChoices(c, HEAD_BREAKS, { maxW: cw, maxH: (bot2 - top2) * 0.36, maxLines: two ? 2 : 1, minLines: two ? 2 : 1, sizeMax: S * 0.105 });
    var sceneH = Math.min(bot2 - top2 - hd.h - gap, cw / 3.2 * 1.36), y = top2 + (bot2 - top2 - hd.h - gap - sceneH) / 2;
    drawHead(c, hd, W / 2, y, 'center');
    shelfScene(c, im, m, y + hd.h + gap, cw, sceneH);
    if (g.kbg) drawFlow(c, fl, W / 2, H - g.bot - fl.h, 'center');
    else authorBlock(c, g, m, split, cw, (g.story ? H - g.bot : H) - split, d, { kw: d.kw });
  }
  function pfShelf(c, g, im) {                      // 프사: 네 권을 부채꼴로
    var W = g.W, cx = W / 2, cy = g.H / 2, h = W * 0.4, L = W * 0.36, py = cy + W * 0.345, ang = [-24, -8, 8, 24], i;
    rect(c, 0, 0, W, g.H, CY);
    for (i = 0; i < 4; i++) {
      var cv = COVERS[i], w = h * cv.ar;
      c.save(); c.translate(cx, py); c.rotate(ang[i] * Math.PI / 180);
      bookAt(c, im['c' + cv.y], cv, -w / 2, -L - h / 2, w, h, W * 0.0075);
      c.restore();
    }
  }

  /* ---------- 6. 선물하기: 리본을 올린 책 — 카카오톡 선물하기에서 책을 보낼 수 있다는 소식 ---------- */
  var GIFT_HEAD = '카톡 선물하기에도 있어요', GIFT_SUB = '고마운 분께 책 한 권 보내 보세요';
  var GIFT_BREAKS = [[GIFT_HEAD], ['카톡 선물하기에도', '있어요'], ['카톡', '선물하기에도', '있어요']];
  /** 리본 매듭. (x, y)는 매듭 한가운데, u는 고리 하나의 길이쯤 */
  function bow(c, x, y, u, rot) {
    c.save(); c.translate(x, y); c.rotate((rot || 0) * Math.PI / 180); c.scale(u, u);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 0.05; c.strokeStyle = INK; c.fillStyle = WH;
    [1, -1].forEach(function (sg) {               // 꼬리 두 가닥: 책 윗여백만 살짝 덮는다
      c.beginPath(); c.moveTo(sg * 0.08, -0.06); c.lineTo(sg * 1.04, 0.15); c.lineTo(sg * 0.87, 0.27); c.lineTo(sg * 0.98, 0.45); c.lineTo(sg * 0.02, 0.19); c.closePath(); c.fill(); c.stroke();
    });
    [1, -1].forEach(function (sg) {               // 고리 두 개
      c.beginPath(); c.moveTo(0, 0);
      c.bezierCurveTo(sg * 0.3, -0.82, sg * 1.3, -0.86, sg * 1.24, -0.2);
      c.bezierCurveTo(sg * 1.2, 0.3, sg * 0.42, 0.2, 0, 0); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(sg * 0.2, -0.1); c.quadraticCurveTo(sg * 0.62, -0.36, sg * 0.92, -0.26); c.stroke();
    });
    roundRect(c, -0.19, -0.25, 0.38, 0.46, 0.11); c.fill(); c.stroke();
    c.restore();
  }
  /** 책 한 권에 리본을 올린다. 표지는 가리지 않는다(리본은 책 위쪽 가장자리에 걸친다). 책이 놓인 자리를 돌려준다 */
  function giftScene(c, im, x, y, w, h, o) {
    o = o || {};
    var cv = COVERS[3], UP = 0.16, bh = Math.min(h / (1 + UP), w * (o.fw || 0.56) / cv.ar), bw = bh * cv.ar;
    var cx = x + w / 2, by = y + (h - bh * (1 + UP)) / 2 + bh * UP, u = bw * 0.215;
    bookAt(c, im.c2027, cv, cx - bw / 2, by, bw, bh, bw * 0.02);
    bow(c, cx, by - u * 0.22, u, -4);
    if (!o.plain) {
      sparkle(c, cx - bw * 0.5 - bw * 0.24, by + bh * 0.33, bw * 0.105, WH);
      sparkle(c, cx + bw * 0.5 + bw * 0.2, by + bh * 0.16, bw * 0.07, INK);
      sparkle(c, cx + bw * 0.5 + bw * 0.27, by + bh * 0.62, bw * 0.045, WH);
    }
    return { x: cx - bw / 2, y: by, w: bw, h: bh };
  }
  function tGift(c, g, d, im) {
    if (g.pf) return pfGift(c, g, im);
    var W = g.W, H = g.H, S = g.S, m = g.m, cw = W - 2 * m;
    var split = Math.round(H * (g.kbg ? 0.88 : g.story ? 0.685 : g.land ? 0.665 : 0.7));
    rect(c, 0, 0, W, split, CY); rect(c, 0, split, W, H - split, INK);
    var hd, bb;
    if (g.land || g.id === '1x1') {                 // 가로형·정사각: 왼쪽 글, 오른쪽 책
      var sq = !g.land, scW = Math.round(cw * (sq ? 0.5 : 0.36)), scX = W - m - scW, colW = scX - m - S * 0.04, scTop = m * 0.75;
      giftScene(c, im, scX, scTop, scW, split - scTop - S * 0.045, { fw: sq ? 0.8 : 0.62, plain: sq });
      bb = braceBlock(c, m, m, [GIFT_SUB], S * 0.033 * g.ts, INK, colW, 'left');
      var top = m + bb.h + S * 0.045, bot = split - S * 0.055;
      hd = fitChoices(c, GIFT_BREAKS, { maxW: colW, maxH: bot - top, maxLines: 3, minLines: sq ? 3 : 2, sizeMax: S * 0.17, reserve: sq ? 0 : 1.25 });
      var L = drawHead(c, hd, m, top + (bot - top - hd.h) / 2, 'left'), r = L.size * 0.34;
      if (!sq) { sparkle(c, L.x1 + L.size * 0.3 + r, L.cy - L.size * 0.08, r, WH); sparkle(c, L.x1 + L.size * 0.3 + r * 2.5, L.cy + L.size * 0.3, r * 0.5, INK); }
      authorBlock(c, g, m, split, cw, H - split, d, { kw: d.kw });
      return;
    }
    bb = braceBlock(c, W / 2, g.top, [GIFT_SUB], S * 0.035, INK, cw);
    var top2 = g.top + bb.h + S * 0.05, bot2 = g.kbg ? H - g.bot : split - S * 0.05, fl = null, gap = S * 0.05;
    if (g.kbg) { fl = flow(c, authorSegs(d, 'cy', { kw: true }), cw, S * 0.037, { maxLines: 2, min: 0.7, one: 0.9 }); bot2 -= fl.h + S * 0.045; }
    var two = g.story;
    hd = fitChoices(c, GIFT_BREAKS, { maxW: cw, maxH: (bot2 - top2) * 0.36, maxLines: two ? 2 : 1, minLines: two ? 2 : 1, sizeMax: S * 0.105 });
    var sceneH = bot2 - top2 - hd.h - gap;
    drawHead(c, hd, W / 2, top2, 'center');
    giftScene(c, im, m, top2 + hd.h + gap, cw, sceneH);
    if (g.kbg) drawFlow(c, fl, W / 2, H - g.bot - fl.h, 'center');
    else authorBlock(c, g, m, split, cw, (g.story ? H - g.bot : H) - split, d, { kw: d.kw });
  }
  function pfGift(c, g, im) {                       // 프사: 리본 올린 책 한 권
    var W = g.W;
    rect(c, 0, 0, W, g.H, CY);
    giftScene(c, im, W * 0.2, W * 0.17, W * 0.6, W * 0.66, { fw: 0.9 });
  }

  /* 키워드 빙고: 5×5 — 표지 키워드 21개 + 네 귀퉁이 별. 스토리에 올려 '아는 키워드에 동그라미'를 받는다 */
  function tBingo(c, g, d) {
    if (g.pf) return pfCover(c, g);
    var W = g.W, H = g.H, S = g.S, m = g.m, K = (window.EDU_ASSETS && EDU_ASSETS.keywords) || [], i;
    rect(c, 0, 0, W, H, CY);
    var top = g.top, bot = H - g.bot, fl = flow(c, authorSegs(d, 'cy'), W - 2 * m, S * 0.03 * g.ts, { maxLines: 1, min: 0.7 });
    var tx, ty, tw0, gx, gy, gs;                       // title box / grid box
    if (g.land) {
      gs = Math.min(bot - top, W * 0.5); gx = W - m - gs; gy = top + (bot - top - gs) / 2; tx = m; tw0 = gx - m * 1.6 - m; ty = gy;
    } else {
      gs = W - 2 * m; tx = m; tw0 = W - 2 * m;
      var headH = S * 0.215, footH = fl.h + S * 0.04, free = bot - top - headH - footH;
      gs = Math.min(gs, free); gx = (W - gs) / 2; ty = top + Math.max(0, (free - gs) * 0.4); gy = ty + headH;
    }
    // 제목
    var bb = braceBlock(c, tx, ty, [TITLE], S * 0.03 * g.ts, INK, tw0, 'left');
    var hs = Math.min(S * 0.1, tw0 / 5.4), hy = ty + bb.h + S * 0.022;
    draw(c, '키워드 ', tx, hy + hs * 0.77, { w: 700, s: hs, ls: -0.04, c: INK });
    var w1 = tw(c, '키워드 ', { w: 700, s: hs, ls: -0.04 });
    draw(c, '빙고', tx + w1, hy + hs * 0.77, { w: 700, s: hs, ls: -0.04, c: WH });
    var w2 = tw(c, '빙고', { w: 700, s: hs, ls: -0.04 });
    sparkle(c, tx + w1 + w2 + hs * 0.5, hy + hs * 0.36, hs * 0.3, INK);
    var subS = S * 0.03 * g.ts, sub = ['아는 키워드에 동그라미.', '몇 줄 나왔나요?'];
    if (g.land) for (i = 0; i < sub.length; i++) draw(c, sub[i], tx, hy + hs + S * 0.05 + i * subS * 1.5 + subS * 0.77, { w: 600, s: subS, f: 'b', c: INK });
    else {                                             // 제목 오른쪽에 두 줄로
      var room = tw0 - w1 - w2 - hs * 1.1, ss = Math.min(subS * 1.05, room / 11.6);
      for (i = 0; i < sub.length; i++) draw(c, sub[i], W - m, hy + hs * 0.5 - ss * 1.45 + i * ss * 1.45 + ss * 0.77 + ss * 0.35, { w: 600, s: ss, f: 'b', c: INK, a: 'right' });
    }
    // 판
    var gap = gs * 0.014, cell = (gs - 4 * gap) / 5, corner = { 0: 1, 4: 1, 20: 1, 24: 1 }, names = [], k = 0, fits = [], size = cell * 0.17;
    for (i = 0; i < 25; i++) names.push(corner[i] ? null : (K[k++] || { name: '' }));
    names.forEach(function (n, idx) {
      if (!n) { fits.push(null); return; }
      var f = fitHeadline(c, n.name, { maxW: cell * 0.86, maxH: cell * 0.74, maxLines: 3, sizeMax: cell * 0.17, lh: 1.22, ls: -0.04 });
      fits.push(f); size = Math.min(size, f.size);
    });
    for (i = 0; i < 25; i++) {
      var cx = gx + (i % 5) * (cell + gap), cy = gy + Math.floor(i / 5) * (cell + gap), n = names[i], mine = n && d.kwId && n.id === d.kwId;
      roundRect(c, cx, cy, cell, cell, cell * 0.07); c.fillStyle = n ? (mine ? INK : WH) : '#0090BC'; c.fill();
      if (!n) { sparkle(c, cx + cell / 2, cy + cell / 2, cell * 0.24, i === 0 || i === 24 ? WH : INK); continue; }
      var f = fits[i], lines = f.lines.map(function (L) { return L.segs[0].t; }), lh = size * 1.22, th = (lines.length - 1) * lh + size * 0.88, j;
      for (j = 0; j < lines.length; j++) draw(c, lines[j], cx + cell / 2, cy + (cell - th) / 2 + j * lh + size * 0.77, { w: 700, s: size, ls: -0.04, c: mine ? WH : INK, a: 'center' });
      if (mine) sparkle(c, cx + cell * 0.86, cy + cell * 0.14, cell * 0.075, CY);
    }
    // 이름
    if (g.land) { var fl2 = flow(c, authorSegs(d, 'cy'), tw0, S * 0.032 * g.ts, { maxLines: 2, min: 0.7 }); drawFlow(c, fl2, tx, gy + gs - fl2.h, 'left'); }
    else drawFlow(c, fl, W / 2, gy + gs + S * 0.04, 'center');
  }

  var DRAW = { cover: tCover, art: tArt, quote: tQuote, shelf: tShelf, bingo: tBingo, gift: tGift };

  /* ---------- render / export ---------- */
  function render(opts) {
    opts = opts || {};
    var r = ratioOf(opts.ratio || state.ratio), t = tplOf(opts.template || state.template), g = geomOf(r), d = model(opts, g.pf);
    var scale = opts.scale > 0 ? opts.scale : 1, hd = opts.hd != null ? opts.hd : r.w * scale > 1300;
    return Promise.all([loadFonts(TITLE + HEAD + GIFT_HEAD + GIFT_SUB + d.name + d.org + d.handle + d.kw + d.line), loadSources(t.id, g, d, hd, opts.pool || (hd ? {} : pool))]).then(function (res) {
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(r.w * scale)); cv.height = Math.max(1, Math.round(r.h * scale));
      var c = cv.getContext('2d');
      if (!c) throw new Error('canvas');
      c.scale(cv.width / r.w, cv.height / r.h);
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      DRAW[t.id](c, g, d, res[1]);
      return cv;
    });
  }
  function toBlob(cv, type) {
    return new Promise(function (res, rej) {
      try { cv.toBlob(function (b) { if (b && b.size) res(b); else rej(new Error('toBlob')); }, type, 0.95); } catch (e) { rej(e); }
    });
  }
  function thumbOf(cv, max) {
    var k = Math.min(1, max / Math.max(cv.width, cv.height)), t = document.createElement('canvas');
    t.width = Math.max(1, Math.round(cv.width * k)); t.height = Math.max(1, Math.round(cv.height * k));
    var c = t.getContext('2d'); c.imageSmoothingQuality = 'high'; c.drawImage(cv, 0, 0, t.width, t.height);
    var u = ''; try { u = t.toDataURL('image/jpeg', 0.82); } catch (e) { u = ''; }
    t.width = t.height = 0;
    return u;
  }
  /** full-size file. Falls back to 75% once when the device cannot hold the full canvas. */
  function exportBlob(opts) {
    opts = opts || {};
    var r = ratioOf(opts.ratio || state.ratio), t = tplOf(opts.template || state.template), d = model(opts, r.id === 'profile');
    var scale = opts.scale > 0 ? opts.scale : 1, pl = opts.pool || {};
    function attempt(sc) {
      return render({ ratio: r.id, template: t.id, scale: sc, hd: true, pool: pl, profile: opts.profile, show: opts.show }).then(function (cv) {
        return toBlob(cv, t.type).then(function (blob) {
          var out = { blob: blob, w: cv.width, h: cv.height, filename: fileNameOf(r, t, d), ratio: r.id, template: t.id };
          if (opts.thumb) out.thumb = thumbOf(cv, 360);
          cv.width = cv.height = 0;
          return out;
        }, function (e) { cv.width = cv.height = 0; throw e; });
      });
    }
    return attempt(scale).catch(function () { return attempt(scale * 0.75).then(function (o) { o.reduced = true; return o; }); });
  }

  /* ---------- screen ---------- */
  var root, stage, frame, canvas, paintSeq = 0, raf = 0, busy = false;
  function glyph(r) {
    var k = 13 / Math.max(r.w, r.h);
    return '<i class="st-rg' + (r.id === 'profile' ? ' is-round' : '') + '" style="width:' + Math.max(6, Math.round(r.w * k)) + 'px;height:' + Math.max(6, Math.round(r.h * k)) + 'px"></i>';
  }
  function build() {
    root = document.getElementById('studio');
    if (!root) return;
    root.innerHTML =
      '<div class="st-root">' +
        '<div class="vhead st-head"><h2>홍보 카드</h2><button type="button" class="st-allbtn" data-act="all">' + icon('grid') + '모든 크기</button></div>' +
        '<div class="st-stage">' +
          '<div class="st-frame"><canvas class="st-canvas" role="img" aria-label="홍보 카드 미리보기"></canvas></div>' +
          '<button type="button" class="st-pill" data-act="me" hidden>' + icon('pen') + '<span></span></button>' +
          '<button type="button" class="st-hook" data-act="hook" hidden>' + icon('shuffle') + '문구 바꾸기</button>' +
          '<div class="seg st-mask" role="group" aria-label="프로필 사진 잘림 미리보기" hidden>' + MASKS.map(function (m) { return '<button type="button" data-mask="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
          '<span class="st-dim" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="st-panel card">' +
          '<div class="st-phead"><h2>홍보 카드</h2><p>고르는 대로 왼쪽 미리보기가 바뀌어요</p></div>' +
          '<div class="seg st-tabs" role="tablist" aria-label="카드 옵션">' + TABS.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
          '<div class="st-groups">' +
            '<div class="st-group" data-group="size"><p class="st-label">크기</p><div class="scroller st-row">' +
              RATIOS.map(function (r) { return '<button type="button" class="chip st-chip" data-ratio="' + r.id + '">' + glyph(r) + esc(r.name) + '</button>'; }).join('') + '</div></div>' +
            '<div class="st-group" data-group="design"><p class="st-label">디자인</p><div class="scroller st-row">' +
              TEMPLATES.map(function (t) { return '<button type="button" class="chip st-chip" data-tpl="' + t.id + '">' + esc(t.name) + '</button>'; }).join('') + '</div></div>' +
            '<div class="st-group" data-group="show"><p class="st-label">표시</p><div class="scroller st-row">' +
              [['name', '이름'], ['org', '소속'], ['handle', '아이디']].map(function (s) { return '<button type="button" class="chip st-chip st-toggle" data-show="' + s[0] + '">' + icon('check') + s[1] + '</button>'; }).join('') +
              '<p class="st-note" hidden>프사에는 이름·소속·아이디를 넣지 않아요</p>' +
              '<button type="button" class="st-edit" data-act="me">' + icon('pen') + '내 정보 고치기</button></div></div>' +
          '</div>' +
          '<div class="st-actions">' +
            '<button type="button" class="btn btn-cy btn-block st-save" data-act="save">' + icon('download') + '<span>고화질로 저장</span></button>' +
            '<button type="button" class="btn btn-line btn-block st-all2" data-act="all">모든 크기 받기</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    stage = $('.st-stage', root); frame = $('.st-frame', root); canvas = $('.st-canvas', root);
    root.addEventListener('click', onClick);
    window.addEventListener('edu:profile', function () { sync(); schedule(); });
    window.addEventListener('edu:view', function (e) { if (e.detail && e.detail.view === 'studio') { sync(); schedule(); } });
    window.addEventListener('resize', schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(stage);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    sync(); schedule();
  }
  function onClick(e) {
    var b = e.target.closest('button');
    if (!b || !root.contains(b)) return;
    var v;
    if ((v = b.getAttribute('data-ratio'))) set({ ratio: v });
    else if ((v = b.getAttribute('data-tpl'))) set({ template: v });
    else if ((v = b.getAttribute('data-tab'))) { state.tab = v; save(); sync(); }
    else if ((v = b.getAttribute('data-mask'))) { state.mask = v; save(); sync(); }
    else if ((v = b.getAttribute('data-show'))) { var sh = {}; sh[v] = !state.show[v]; set({ show: sh }); }
    else if ((v = b.getAttribute('data-act'))) {
      if (v === 'me') U.goTo('me');
      else if (v === 'save') onSave(b);
      else if (v === 'all') openAll();
      else if (v === 'hook') { state.hook = (state.hook + 1) % 12; save(); schedule(); }
    }
  }
  function sync() {
    if (!root) return;
    var p = EDU.getProfile(), pf = state.ratio === 'profile', r = ratioOf(state.ratio), t = tplOf(state.template);
    $$('[data-ratio]', root).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ratio') === state.ratio ? 'true' : 'false'); });
    $$('[data-tpl]', root).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tpl') === state.template ? 'true' : 'false'); });
    $$('[data-tab]', root).forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === state.tab ? 'true' : 'false'); });
    $$('[data-group]', root).forEach(function (n) { n.classList.toggle('is-on', n.getAttribute('data-group') === state.tab); });
    $$('[data-show]', root).forEach(function (b) { b.setAttribute('aria-pressed', state.show[b.getAttribute('data-show')] ? 'true' : 'false'); b.hidden = pf; });
    $$('[data-mask]', root).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mask') === state.mask ? 'true' : 'false'); });
    $('.st-note', root).hidden = !pf;
    $('.st-mask', root).hidden = !pf;
    frame.className = 'st-frame' + (pf && state.mask !== 'sq' ? ' is-' + state.mask : '');
    var pill = $('.st-pill', root), msg = '';
    if (!pf) msg = !clean(p.name) ? '이름을 넣으면 카드에 들어가요' : !EDU.currentKeyword(p) ? '키워드를 고르면 카드에 들어가요' : '';
    pill.hidden = !msg; $('span', pill).textContent = msg;
    $('.st-hook', root).hidden = !(state.template === 'quote' && !pf && !clean(p.line));
    $('.st-dim', root).textContent = r.w + ' × ' + r.h + ' · ' + (t.type === 'image/png' ? 'PNG' : 'JPG');
    canvas.setAttribute('aria-label', '홍보 카드 미리보기: ' + t.name + ', ' + r.name);
  }
  function fit(r) {
    var wide = window.matchMedia && matchMedia('(min-width:900px)').matches, pad = wide ? 28 : 14, top = state.ratio === 'profile' ? 40 : 0;
    var aw = stage.clientWidth - pad * 2, ah = stage.clientHeight - pad * 2 - top;
    if (aw < 24 || ah < 24) return null;
    var k = Math.min(aw / r.w, ah / r.h), w = Math.max(1, Math.floor(r.w * k)), h = Math.max(1, Math.floor(r.h * k));
    frame.style.width = w + 'px'; frame.style.height = h + 'px'; frame.style.marginTop = top ? top + 'px' : '';
    return { w: w, h: h };
  }
  function schedule() {
    if (raf || !root) return;
    raf = requestAnimationFrame(function () { raf = 0; paint(); });
  }
  function paint() {
    if (EDU.currentView && EDU.currentView() && EDU.currentView() !== 'studio') return;   // 화면이 켜질 때(edu:view) 다시 그린다
    var r = ratioOf(state.ratio), box = fit(r);
    if (!box) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 3), seq = ++paintSeq;
    render({ scale: Math.round(box.w * dpr) / r.w, pool: pool, hd: box.w * dpr > 1100 ? undefined : false }).then(function (cv) {
      if (seq !== paintSeq) return;
      canvas.width = cv.width; canvas.height = cv.height;
      canvas.getContext('2d').drawImage(cv, 0, 0);
      root.classList.add('is-ready');
    }, function () { /* 다음 그리기에서 다시 시도 */ });
  }
  /** set({ratio, template, show:{name,org,handle}, tab, mask}) — updates the options and redraws. `style` is ignored. */
  function set(patch) {
    patch = patch || {};
    if (patch.ratio && byId(RATIOS, patch.ratio)) state.ratio = patch.ratio;
    if (patch.template && byId(TEMPLATES, patch.template)) state.template = patch.template;
    if (patch.tab === 'size' || patch.tab === 'design' || patch.tab === 'show') state.tab = patch.tab;
    if (patch.mask === 'sq' || patch.mask === 'kakao' || patch.mask === 'insta') state.mask = patch.mask;
    if (patch.show) ['name', 'org', 'handle'].forEach(function (k) { if (typeof patch.show[k] === 'boolean') state.show[k] = patch.show[k]; });
    save(); sync(); schedule();
    return { ratio: state.ratio, template: state.template, show: { name: state.show.name, org: state.show.org, handle: state.show.handle } };
  }

  function onSave(btn) {
    if (busy) return;
    busy = true;
    var label = $('span', btn), old = label.textContent, r = ratioOf(state.ratio), t = tplOf(state.template);
    label.textContent = '원본 만드는 중…'; btn.disabled = true; btn.setAttribute('aria-busy', 'true');
    setTimeout(function () {
      exportBlob({}).then(function (o) {
        U.saveSheet({ blob: o.blob, filename: o.filename, title: t.name + ' · ' + r.name, w: o.w, h: o.h });
        if (o.reduced) setTimeout(function () { U.toast('기기 메모리가 부족해서 조금 작은 크기로 만들었어요', { tio: 'curious', ms: 3200 }); }, 60);
      }, function () { U.toast('카드를 만들지 못했어요. 한 번 더 눌러 주세요', { tio: 'curious' }); })
        .then(function () { busy = false; label.textContent = old; btn.disabled = false; btn.removeAttribute('aria-busy'); });
    }, 40);
  }
  /** 모든 크기: one after another, each with its own 저장 */
  function openAll() {
    var t = tplOf(state.template), n = RATIOS.length, results = {}, closed = false, pl = {}, small = false;
    var dlg = U.sheet(t.name + ' · 모든 크기',
      '<div class="st-all"><p class="st-allmsg" role="status">크기 ' + n + '가지를 차례로 만들고 있어요 · 0/' + n + '</p><div class="progress"><i></i></div>' +
      '<ul class="st-alllist">' + RATIOS.map(function (r) {
        return '<li data-r="' + r.id + '"><span class="st-allthumb"></span><span class="st-allname"><strong>' + esc(r.name) + '</strong><small>' + r.w + ' × ' + r.h + '</small></span>' +
          '<button type="button" class="btn btn-small btn-dark" disabled>' + icon('download') + '저장</button></li>';
      }).join('') + '</ul></div>', 'st-sheet');
    var msg = $('.st-allmsg', dlg), bar = $('.progress i', dlg);
    dlg.addEventListener('edu:closed', function () { closed = true; results = {}; pl = {}; });
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest('li button'); if (!b) return;
      var id = b.closest('li').getAttribute('data-r'), o = results[id], r = ratioOf(id);
      if (o) U.saveSheet({ blob: o.blob, filename: o.filename, title: t.name + ' · ' + r.name, w: o.w, h: o.h, preview: o.thumb || undefined });
    });
    (function next(i) {
      if (closed) return;
      if (i >= n) { msg.textContent = '다 만들었어요. 필요한 크기마다 ‘저장’을 눌러 주세요' + (small ? ' (기기 메모리가 부족해 일부는 조금 작게 만들었어요)' : ''); bar.style.width = '100%'; return; }
      var r = RATIOS[i], li = $('li[data-r="' + r.id + '"]', dlg);
      li.classList.add('is-busy');
      exportBlob({ ratio: r.id, template: t.id, thumb: true, pool: pl }).then(function (o) {
        if (closed) return;
        results[r.id] = o; if (o.reduced) small = true;
        if (o.thumb) $('.st-allthumb', li).innerHTML = '<img src="' + o.thumb + '" alt="">';
        $('small', li).textContent = o.w + ' × ' + o.h + ' · ' + U.fmtBytes(o.blob.size);
        $('button', li).disabled = false;
      }, function () { if (!closed) $('small', li).textContent = '만들지 못했어요'; }).then(function () {
        if (closed) return;
        li.classList.remove('is-busy');
        msg.textContent = '크기 ' + n + '가지를 차례로 만들고 있어요 · ' + (i + 1) + '/' + n;
        bar.style.width = Math.round((i + 1) / n * 100) + '%';
        setTimeout(function () { next(i + 1); }, 30);
      });
    })(0);
  }

  EDU.studio = { render: render, exportBlob: exportBlob, set: set, ratios: RATIOS, templates: TEMPLATES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
