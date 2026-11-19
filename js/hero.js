/* 2027 미래 교육 트렌드 홍보 키트 — HOME view (prefix hero-, kw-)
   The cover re-staged: cyan field + black keyword band. The series shelf is the one moving thing:
   첫 권 → 2025 → 2026 slide onto a single black line, then 2027 (3D cover) settles in front.
   Exposes EDU.hero = { replay(), finish(), openKeywords() } */
(function () {
  'use strict';
  var EDU = (window.EDU = window.EDU || {});
  var U = EDU.util;
  if (!U) return;
  var $ = U.$, $$ = U.$$, el = U.el, esc = U.esc, icon = U.icon;
  function bookImg() { return '<img class="bk-ico" src="' + esc(EDU.book.icon) + '" alt="" width="160" height="160" decoding="async">'; }
  var A = window.EDU_ASSETS || {};
  var KW = A.keywords || [];
  var SERIES = (EDU.series || []).slice(0, 4);
  var BOOK = EDU.book || {};
  var reduced = !!(EDU.env && EDU.env.reduced);
  var canAnimate = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';

  /* the 3D cover picture (assets/covers/book3d.webp, 1000×1166): solid part of the book inside it */
  var B3 = { src: 'assets/covers/book3d.webp', iw: 1000, ih: 1166, x0: 202, x1: 981, y0: 18, y1: 1135, base: 1088 };
  var FLAT_RATIO = { 2024: 810 / 1200, 2025: 900 / 1283, 2026: 900 / 1282 };

  var mount, root, panel, stage, lineEl, rail, cap, scroller, track;
  var books = [];      // [{year, s, el, flat, x, w}]
  var pops = [];
  var state = 'empty'; // empty | playing | done
  var anims = [], timers = [];
  var ready = false, played = false, active = false, first = true, pending = 0, openYear = null, sheetEl = null;

  /* ---------------------------------------------------------------- markup */
  var BRACE = '<svg viewBox="0 0 12 44" preserveAspectRatio="none" aria-hidden="true"><path d="M10.5 1.5C7 1.5 6 3.500 6 7.500V16c0 3.500-1.200 5.500-4.500 6C4.800 22.500 6 24.500 6 28v8.500c0 4 1 6 4.500 6"/></svg>';

  function kwSet(dup) {
    return '<div class="kw-set"' + (dup ? ' aria-hidden="true"' : '') + '>' + KW.map(function (k) {
      return '<button type="button" class="kw-item" data-kw="' + k.id + '"' + (dup ? ' tabindex="-1"' : ' aria-pressed="false"') + '>' + esc(k.name) + '</button><i class="spark kw-sep" aria-hidden="true"></i>';
    }).join('') + '</div>';
  }

  function render() {
    var sub = esc(BOOK.sub || '30명의 현장 교육전문가들이 제시하는 미래 교육의 전망과 해법').replace('제시하는 ', '제시하는 <br>');
    var by = esc((BOOK.author || '미래 교육 집필팀') + ' · ' + (BOOK.publisher || '뜨인돌'));
    var bookHtml = SERIES.map(function (s) {
      var is3d = s.year === 2027;
      var name = (s.year === 2024 ? '첫 권, ' : '') + s.title;
      return '<button type="button" class="hero-book' + (is3d ? ' hero-book3d' : '') + '" data-year="' + s.year + '" style="--c:' + esc(s.color) + '" aria-expanded="false" aria-label="' + esc(name) + ' 책 정보 보기" disabled>' +
        (is3d ? '' : '<i class="hero-spine" aria-hidden="true"></i>') +
        '<img src="' + (is3d ? B3.src : esc(s.cover) + '.webp') + '" alt="" decoding="async" draggable="false">' +
        '</button>';
    }).join('');
    var railHtml = SERIES.map(function (s) {
      return '<li data-year="' + s.year + '" style="--c:' + esc(s.color) + '"><i></i><span><b>' + esc(s.label) + '</b> ' + s.authors + '명</span></li>';
    }).join('');

    root = el('div', { class: 'hero-root' },
      '<div class="hero-field">' +
        '<p class="hero-brace"><span class="hero-br">' + BRACE + '</span><span class="hero-brtxt">' + sub + '</span><span class="hero-br hero-br-r">' + BRACE + '</span></p>' +
        '<h1 class="hero-title" aria-label="' + esc(BOOK.title || '2027 대한민국 미래 교육 트렌드') + '">' +
          '<span class="hero-l1"><span class="hero-w">2027</span> 대한민국</span>' +
          '<span class="hero-l2">미래 교육</span>' +
          '<span class="hero-l3"><i class="hero-star hero-w" aria-hidden="true"></i><span class="hero-w">트렌드</span><i class="hero-star" aria-hidden="true"></i></span>' +
        '</h1>' +
        '<p class="hero-by"><span>' + by + '</span><span class="hero-pill">저자 홍보 키트</span></p>' +
        '<p class="hero-lead">네 번째 책이 나왔어요. 내 이름이 들어간 홍보 카드와 글감, 여기서 받아 가세요.</p>' +
        '<div class="hero-panel is-empty">' +
          '<span class="hero-egg" data-egg="shelf"></span>' +
          '<div class="hero-stage" role="group" aria-label="미래 교육 트렌드 시리즈 네 권">' +
            '<i class="hero-line" aria-hidden="true"></i>' +
            bookHtml +
            '<i class="hero-pop" aria-hidden="true"></i><i class="hero-pop is-k" aria-hidden="true"></i><i class="hero-pop" aria-hidden="true"></i><i class="hero-pop is-k" aria-hidden="true"></i>' +
          '</div>' +
          '<ul class="hero-rail" aria-label="시리즈 네 권과 저자 수">' + railHtml + '</ul>' +
          '<button type="button" class="hero-replay" aria-label="책 꽂는 장면 다시 보기">' + icon('refresh') + '<span>다시 보기</span></button>' +
          '<div class="hero-cap" hidden></div>' +
        '</div>' +
        '<div class="hero-cta">' +
          '<button type="button" class="btn btn-dark hero-go">내 홍보 카드 만들기' + icon('arrow-right') + '</button>' +
          '<a class="btn btn-white hero-buy" href="' + esc(EDU.book.buy.url) + '" target="_blank" rel="noopener">' + bookImg() + '<span>책 구매 링크</span></a>' +
          '<button type="button" class="btn btn-white hero-get" aria-label="표지 받기">' + icon('download') + '<span>표지 받기</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="hero-band">' +
        '<div class="kw-head"><span class="kw-label">KEYWORDS 21</span><button type="button" class="kw-all">전체 보기' + icon('chev-right') + '</button></div>' +
        '<div class="kw-scroller' + (reduced ? ' is-plain' : '') + '" role="group" aria-label="표지 키워드 21개. 누르면 내 키워드로 골라요">' +
          '<div class="kw-track">' + (reduced ? kwSet(false) : kwSet(true) + kwSet(false) + kwSet(true)) + '</div>' +
        '</div>' +
      '</div>');
    mount.textContent = '';
    mount.appendChild(root);

    panel = $('.hero-panel', root); stage = $('.hero-stage', root); lineEl = $('.hero-line', root);
    rail = $('.hero-rail', root); cap = $('.hero-cap', root);
    scroller = $('.kw-scroller', root); track = $('.kw-track', root);
    pops = $$('.hero-pop', root);
    books = SERIES.map(function (s) {
      return { year: s.year, s: s, flat: s.year !== 2027, el: $('.hero-book[data-year="' + s.year + '"]', root), x: 0, w: 0 };
    });
  }

  /* ---------------------------------------------------------------- layout */
  function layout() {
    if (!root) return;
    var w = mount.clientWidth, h = mount.clientHeight;
    if (!w || !h) return;
    var wide = w >= 900 || (w >= 600 && w / h > 1.35);
    root.style.setProperty('--hh', h + 'px');
    root.classList.toggle('is-wide', wide);
    root.classList.toggle('is-mid', !wide && h >= 600 && h < 690);
    root.classList.toggle('is-low', wide ? h < 560 : h < 600);
    root.classList.toggle('is-tiny', wide ? h < 400 : h < 450);
    fit();
    mqMeasure();
  }

  /* place the line, the four books and the sparkles for the current stage size */
  function fit() {
    if (!stage) return;
    var W = stage.clientWidth, H = stage.clientHeight;
    if (!W || !H) return;
    var r = Math.max(1.5, Math.min(2.1, W / H));
    var Hs = Math.min(H, W / r), Ws = Hs * r;
    var ox = (W - Ws) / 2, oy = (H - Hs) / 2;
    var lineH = Math.max(4, Math.min(9, Math.round(Hs * .03)));
    var yL = Math.round(oy + Hs * .875);                 // top edge of the shelf line

    // 2027 (3D): solid box
    var u = Hs * .79 / (B3.base - B3.y0);
    var w3 = (B3.x1 - B3.x0) * u, h3 = (B3.y1 - B3.y0) * u;
    // the three earlier books
    var wf = Hs * .36, spine = wf * .06;
    var mL = Ws * .035, mR = Ws * .035;
    var tuck = wf * .1;                                   // 2026 sits a little behind 2027
    var room = Ws - mL - mR - spine - w3 - wf + tuck;     // distance between the left edges of 첫 권 and 2026
    var step = Math.min(room / 2, wf * .92);
    var group = spine + step * 2 + wf - tuck + w3;
    var gx = ox + (Ws - group) / 2;

    var flats = books.filter(function (b) { return b.flat; });
    flats.forEach(function (b, i) {
      var hf = wf / (FLAT_RATIO[b.year] || .7);
      b.x = gx + spine + step * i; b.w = wf;
      b.el.style.left = b.x.toFixed(1) + 'px'; b.el.style.top = (yL - hf).toFixed(1) + 'px';
      b.el.style.width = wf.toFixed(1) + 'px'; b.el.style.height = hf.toFixed(1) + 'px';
      b.el.style.zIndex = 1 + i;
    });
    var b3 = books[books.length - 1], x3 = gx + group - w3, y3 = yL - (B3.base - B3.y0) * u;
    if (b3 && !b3.flat) {
      b3.x = x3; b3.w = w3;
      b3.el.style.left = x3.toFixed(1) + 'px'; b3.el.style.top = y3.toFixed(1) + 'px';
      b3.el.style.width = w3.toFixed(1) + 'px'; b3.el.style.height = h3.toFixed(1) + 'px';
      b3.el.style.zIndex = 5;
    }
    lineEl.style.left = (ox + Ws * .03).toFixed(1) + 'px'; lineEl.style.width = (Ws * .94).toFixed(1) + 'px';
    lineEl.style.top = yL + 'px'; lineEl.style.height = lineH + 'px';

    // sparkles: in the white above the earlier books, beside the top of 2027
    var P = [[-.1, .07, .1], [-.225, .185, .058], [-.05, .225, .042], [-.265, .035, .034]];
    pops.forEach(function (p, i) {
      var d = P[i] || P[0], size = Math.max(7, Hs * d[2]);
      p.style.width = p.style.height = size.toFixed(1) + 'px';
      p.style.left = (x3 + Hs * d[0] - size / 2).toFixed(1) + 'px';
      p.style.top = (y3 + Hs * d[1] - size / 2).toFixed(1) + 'px';
      p.style.zIndex = 6;
      p._from = [x3 + w3 * .04 - (x3 + Hs * d[0]), y3 + h3 * .1 - (y3 + Hs * d[1])];   // from the top corner of 2027
    });
    stage._geo = { W: W, H: H, Hs: Hs, y3: y3, h3: h3 };
  }

  /* ---------------------------------------------------------------- shelf sequence */
  var LEAD = 260, STEP = 860, SLIDE = 980, DROP = 1080;

  function setState(s) {
    state = s;
    panel.classList.toggle('is-empty', s === 'empty');
    panel.classList.toggle('is-playing', s === 'playing');
    panel.classList.toggle('is-done', s === 'done');
    books.forEach(function (b) { b.el.disabled = s !== 'done'; });
  }
  function lightRail(n) { $$('li', rail).forEach(function (li, i) { li.classList.toggle('is-on', i < n); }); }
  function clearRun() {
    timers.forEach(clearTimeout); timers = [];
    anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* already gone */ } }); anims = [];
  }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function run(node, frames, opt) { var a = node.animate(frames, opt); anims.push(a); return a; }

  /** final state at once: four books standing, rail lit, sparkles resting */
  function finish() {
    if (!root) return;
    clearTimeout(pending); pending = 0;
    clearRun();
    played = true;
    lightRail(books.length);
    setState('done');
  }

  function play() {
    if (!root) return;
    if (reduced || !canAnimate) { finish(); return; }
    clearRun(); closeCap(true);
    played = true;
    layout();
    lightRail(0);
    var geo = stage._geo || { W: stage.clientWidth, H: stage.clientHeight, Hs: stage.clientHeight, y3: 0, h3: 100 };
    var flats = books.filter(function (b) { return b.flat; }), b3 = books[books.length - 1];
    var tDrop = LEAD + flats.length * STEP;

    // 첫 권 → 2025 → 2026: slide in along the line from the left, lean on the stop, fall back upright
    flats.forEach(function (b, i) {
      var from = -((b.x + b.w * 1.12) / b.w * 100 + 4);                   // fully past the left edge of the stage
      var lean = 4 - i * .4;
      run(b.el, [
        { offset: 0,   transform: 'translateX(' + from.toFixed(1) + '%) rotate(-1deg)', easing: 'cubic-bezier(.22,.5,.5,.9)' },
        { offset: .42, transform: 'translateX(' + (from * .1).toFixed(1) + '%) rotate(-.5deg)', easing: 'cubic-bezier(.6,.4,.4,1)' },
        { offset: .6,  transform: 'translateX(0%) rotate(' + lean + 'deg)', easing: 'linear' },
        { offset: .66, transform: 'translateX(0%) rotate(' + lean + 'deg)', easing: 'cubic-bezier(.55,0,.8,.5)' },
        { offset: .92, transform: 'translateX(0%) rotate(0deg)', easing: 'linear' },
        { offset: 1,   transform: 'translateX(0%) rotate(0deg)' }
      ], { duration: SLIDE, delay: LEAD + i * STEP, fill: 'both' });
      later(function () { lightRail(i + 1); }, LEAD + i * STEP + SLIDE * .92);
    });

    // 2027: lowered from above in front of the row, front corner first, then it sits flat
    if (b3 && !b3.flat) {
      var up = -((geo.y3 + geo.h3 * 1.12) / geo.h3 * 100 + 4);
      run(b3.el, [
        { offset: 0,   transform: 'translate(3%,' + up.toFixed(1) + '%) rotate(-7deg) scale(1.07)', easing: 'cubic-bezier(.3,.05,.3,1)' },
        { offset: .66, transform: 'translate(.6%,-.6%) rotate(-2.6deg) scale(1.012)', easing: 'cubic-bezier(.55,0,.8,.6)' },
        { offset: .82, transform: 'translate(0%,.5%) rotate(.35deg) scale(1)', easing: 'cubic-bezier(.3,0,.3,1)' },
        { offset: 1,   transform: 'translate(0%,0%) rotate(0deg) scale(1)' }
      ], { duration: DROP, delay: tDrop, fill: 'both' });
      var tSeat = tDrop + DROP * .82;
      // the row takes the weight: a small lean away, nearest book first
      flats.slice().reverse().forEach(function (b, k) {
        var a = (1.1 - k * .35).toFixed(2);
        run(b.el, [
          { transform: 'rotate(0deg)', transformOrigin: '0% 100%', easing: 'cubic-bezier(.2,.7,.3,1)' },
          { offset: .34, transform: 'rotate(-' + a + 'deg)', transformOrigin: '0% 100%', easing: 'cubic-bezier(.45,0,.4,1)' },
          { transform: 'rotate(0deg)', transformOrigin: '0% 100%' }
        ], { duration: 520, delay: tSeat + k * 45, fill: 'none' });
      });
      later(function () { lightRail(books.length); }, tSeat);
      // sparkles: thrown out from the top corner of 2027, then they come to rest
      var last = null;
      pops.forEach(function (p, i) {
        var f = p._from || [0, 0];
        last = run(p, [
          { offset: 0,   transform: 'translate(' + f[0].toFixed(1) + 'px,' + f[1].toFixed(1) + 'px) scale(0) rotate(-70deg)', easing: 'cubic-bezier(.16,.7,.3,1)' },
          { offset: .52, transform: 'translate(' + (-f[0] * .16).toFixed(1) + 'px,' + (-f[1] * .16).toFixed(1) + 'px) scale(1.22) rotate(9deg)', easing: 'cubic-bezier(.45,0,.3,1)' },
          { offset: 1,   transform: 'translate(0px,0px) scale(1) rotate(0deg)' }
        ], { duration: 700, delay: tSeat - 20 + i * 80, fill: 'both' });
      });
      var end = tSeat + 80 * (pops.length - 1) + 700;
      if (last && last.finished && last.finished.then) last.finished.then(function () { if (state === 'playing') finish(); }, function () {});
      later(function () { if (state === 'playing') finish(); }, end + 400);
    } else {
      later(finish, tDrop + 200);
    }
    setState('playing');
  }

  function replay() { play(); }

  function requestPlay() {
    if (played || pending) return;
    if (reduced || !canAnimate) { finish(); return; }
    if (!ready) return;                       // images still loading; preload() calls back
    pending = setTimeout(function () {
      pending = 0;
      if (!active || played) return;
      if (sheetEl && sheetEl.isConnected) {     // the keyword sheet is covering the shelf: play once it is closed
        sheetEl.addEventListener('edu:closed', function () { setTimeout(function () { if (active && !played) requestPlay(); }, 120); });
        return;
      }
      play();
    }, 180);
  }

  function preload() {
    var srcs = books.map(function (b) { return b.el.querySelector('img').getAttribute('src'); });
    var done = function () { ready = true; if (active && !played) requestPlay(); };
    Promise.all(srcs.map(function (s) { return U.loadImage(s).then(null, function () { return null; }); })).then(done, done);
    setTimeout(function () { if (!ready) done(); }, 4000);   // never leave the shelf empty on a slow link
  }

  /* ---------------------------------------------------------------- caption card */
  function coverSave() {
    var c = (A.covers && A.covers.book3d) || {};
    U.saveSheet({ title: '2027 입체 표지 (투명 배경 PNG)', filename: '2027미래교육트렌드_입체표지.png', url: 'assets/covers/book3d.png', preview: 'assets/covers/book3d.webp', w: c.w, h: c.h });
  }
  function bookOf(year) { for (var i = 0; i < books.length; i++) if (books[i].year === year) return books[i]; return null; }

  function openCap(b, byKeyboard) {
    closeCap(true);
    var s = b.s, back = null;
    (EDU.backlist || []).forEach(function (x) { if (x.year === b.year) back = x; });
    var sub = '<span class="hero-nb">' + esc(s.authors) + '명의 현장 교육전문가</span>' + (s.pub ? ' · <span class="hero-nb">' + esc(s.pub) + '</span>' : '');
    var act = b.year === 2027
      ? '<a class="hero-capact" href="' + esc(EDU.book.buy.url) + '" target="_blank" rel="noopener">' + bookImg() + '구매 링크' + icon('arrow-up-right') + '</a>'
      : (back && back.yes24 ? '<a class="hero-capact" href="' + esc(back.yes24) + '" target="_blank" rel="noopener">서점에서 보기' + icon('arrow-up-right') + '</a>' : '');
    cap.innerHTML = '<i class="hero-capdot" style="--c:' + esc(s.color) + '"></i>' +
      '<div class="hero-captxt"><strong>' + esc(s.title) + '</strong><span>' + sub + '</span></div>' + act;
    cap.hidden = false;
    void cap.offsetWidth;
    cap.classList.add('is-on');
    b.el.classList.add('is-up'); b.el.setAttribute('aria-expanded', 'true');
    openYear = b.year;
    if (byKeyboard) { var a = $('.hero-capact', cap); if (a) a.focus(); }
  }
  function closeCap(silent) {
    if (openYear == null) return;
    var b = bookOf(openYear); openYear = null;
    if (b) { b.el.classList.remove('is-up'); b.el.setAttribute('aria-expanded', 'false'); }
    cap.classList.remove('is-on'); cap.hidden = true; cap.innerHTML = '';
    if (!silent && b && document.activeElement === document.body) b.el.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------- keywords */
  function kwOf(id) { for (var i = 0; i < KW.length; i++) if (KW[i].id === id) return KW[i]; return null; }
  function mark() {
    var cur = (EDU.getProfile ? EDU.getProfile().kw : '') || '';
    var nodes = $$('[data-kw]', root);
    if (sheetEl) nodes = nodes.concat($$('[data-kw]', sheetEl));
    nodes.forEach(function (n) {
      var on = n.getAttribute('data-kw') === cur && cur !== 'custom';
      n.classList.toggle('is-on', on);
      if (n.hasAttribute('aria-pressed')) n.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  /* '로' or '으로' after the keyword's last syllable */
  function ro(word) {
    var c = String(word).charCodeAt(String(word).length - 1);
    if (c < 0xAC00 || c > 0xD7A3) return /[360mnMN]$/.test(word) ? '으로' : '로';
    var jong = (c - 0xAC00) % 28;
    return jong === 0 || jong === 8 ? '로' : '으로';
  }
  function pick(id) {
    if (id === 'custom') { EDU.setProfile({ kw: 'custom' }); U.goTo('me'); return; }
    var k = kwOf(id); if (!k) return;
    EDU.setProfile({ kw: id });
    U.toast('‘' + k.name + '’' + ro(k.name) + ' 골랐어요', { tio: 'cheer' });
    U.goTo('me');
  }
  function openKeywords() {
    if (sheetEl && sheetEl.isConnected) return sheetEl;
    var html = '<div class="kw-body"><h2 class="kw-h">내 키워드를 누르면 카드가 준비돼요</h2><div class="kw-grid">' +
      KW.map(function (k) { return '<button type="button" class="kw-opt" data-kw="' + k.id + '" aria-pressed="false"><span>' + esc(k.name) + '</span></button>'; }).join('') +
      '<i class="kw-rule kw-rule-a" aria-hidden="true"></i><i class="kw-rule kw-rule-b" aria-hidden="true"></i></div>' +
      '<button type="button" class="kw-none" data-kw="custom">내 키워드가 목록에 없어요' + icon('arrow-right') + '</button></div>';
    var d = U.sheet('KEYWORDS 21', html, 'kw-sheet');
    sheetEl = d;
    d.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-kw]') : null; if (!b) return;
      var id = b.getAttribute('data-kw');
      d.close(); pick(id);
    });
    d.addEventListener('edu:closed', function () { if (sheetEl === d) sheetEl = null; });
    mark();
    return d;
  }

  /* marquee: drifts by transform; the moment a finger, a mouse or the keyboard arrives the offset is
     handed to the native horizontal scroll, and handed back when they leave */
  var mq = { x: 0, w: 0, mode: 'drift', raf: 0, last: 0, t: 0, on: false, touch: false, hover: false, focus: false };
  function mqSpeed() { return root.classList.contains('is-wide') ? 34 : 26; }   // px per second
  function mqMeasure() {
    if (reduced || !track) return;
    var sets = track.children; if (sets.length < 2) return;
    var w = sets[1].offsetLeft - sets[0].offsetLeft;
    if (w && w !== mq.w) {                              // fonts arrived or the tier changed: keep the same place in the list
      if (mq.mode === 'drift') { mq.x = mq.w ? (mq.x / mq.w * w) % w : mq.x % w; }
      mq.w = w;
      if (mq.mode === 'drift') mqPaint();
    }
  }
  function mqPaint() { track.style.transform = 'translate3d(' + (-mq.x).toFixed(2) + 'px,0,0)'; }
  function mqFrame(ts) {
    mq.raf = 0;
    if (!mq.on || mq.mode !== 'drift') return;
    var dt = mq.last ? Math.min(64, ts - mq.last) : 0; mq.last = ts;
    mq.x += mqSpeed() * dt / 1000;
    if (mq.w && mq.x >= mq.w) mq.x -= mq.w;
    mqPaint();
    mq.raf = requestAnimationFrame(mqFrame);
  }
  function mqKick() { if (reduced || !mq.on || mq.mode !== 'drift' || mq.raf) return; mq.last = 0; mq.raf = requestAnimationFrame(mqFrame); }
  function mqStart() { mq.on = true; mqKick(); }
  function mqStop() { mq.on = false; if (mq.raf) { cancelAnimationFrame(mq.raf); mq.raf = 0; } }
  function mqManual(slack) {
    clearTimeout(mq.t);
    if (reduced || mq.mode === 'manual') return;
    mq.mode = 'manual';
    if (mq.raf) { cancelAnimationFrame(mq.raf); mq.raf = 0; }
    var s = scroller.scrollLeft + mq.x;
    if (slack && mq.w && s < mq.w * .4) s += mq.w;       // room to swipe back
    track.style.transform = 'none';
    scroller.scrollLeft = s;
    mq.x = 0;
  }
  function mqResume(ms) {
    clearTimeout(mq.t);
    if (reduced) return;
    mq.t = setTimeout(function () {
      if (mq.mode !== 'manual' || mq.touch || mq.hover || mq.focus) return;
      var s = scroller.scrollLeft;
      mq.x = mq.w ? s % mq.w : 0;
      scroller.scrollLeft = 0; mqPaint();
      mq.mode = 'drift'; mqKick();
    }, ms);
  }
  function mqBind() {
    if (reduced) return;
    scroller.addEventListener('touchstart', function () { mq.touch = true; mqManual(true); }, { passive: true });
    var up = function () { mq.touch = false; mqResume(2400); };
    scroller.addEventListener('touchend', up, { passive: true });
    scroller.addEventListener('touchcancel', up, { passive: true });
    scroller.addEventListener('scroll', function () { if (mq.mode === 'manual' && !mq.touch) mqResume(mq.hover ? 600 : 2400); }, { passive: true });
    scroller.addEventListener('wheel', function () { mqManual(true); mqResume(2400); }, { passive: true });
    scroller.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { mq.hover = true; mqManual(true); } });
    scroller.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { mq.hover = false; mqResume(500); } });
    scroller.addEventListener('focusin', function () { mq.focus = true; mqManual(false); });
    scroller.addEventListener('focusout', function () { mq.focus = false; mqResume(1500); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) mqStop(); else if (active) mqStart(); });
  }

  /* ---------------------------------------------------------------- events */
  function bind() {
    $('.hero-go', root).addEventListener('click', function () { U.goTo('me'); });
    $('.hero-get', root).addEventListener('click', coverSave);
    $('.hero-replay', root).addEventListener('click', replay);
    $('.kw-all', root).addEventListener('click', openKeywords);

    scroller.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.kw-item') : null; if (!b) return;
      pick(b.getAttribute('data-kw'));
    });

    books.forEach(function (b) {
      b.el.addEventListener('click', function (e) {
        if (state !== 'done') return;
        if (openYear === b.year) closeCap(); else openCap(b, e.detail === 0);
      });
    });
    cap.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-act="cover"]') : null;
      if (a) coverSave();
    });
    // tap anywhere else to put the book back (on root as well: iOS only sends clicks from plain areas to a nearby listener)
    var away = function (e) {
      if (openYear == null || !e.target.closest) return;
      if (e.target.closest('.hero-book') || e.target.closest('.hero-cap')) return;
      closeCap(true);
    };
    root.addEventListener('click', away);
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) away(e); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || openYear == null) return;
      var b = bookOf(openYear); closeCap(true); if (b) b.el.focus({ preventScroll: true });
    });

    window.addEventListener('edu:profile', mark);
    window.addEventListener('edu:view', function (e) {
      var d = e.detail || {};
      active = d.view === 'home';
      if (active) {
        layout();
        if (!played) requestPlay();
        mqStart();
        if (d.sub === 'kwIndex' || (first && /^#kwIndex$/.test(location.hash))) openKeywords();
        first = false;
      } else {
        mqStop(); closeCap(true);
        if (state === 'playing') finish();          // seen once; later visits show the shelf as it stands
        clearTimeout(pending); pending = 0;
      }
    });
    window.addEventListener('resize', layout);
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(mount);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) document.fonts.ready.then(layout);
  }

  function init() {
    mount = document.getElementById('hero');
    if (!mount || root) return;
    render();
    layout();
    bind();
    mqBind();
    mark();
    if (!reduced && mq.w) { mq.x = Math.max(0, mq.w - 16); mqPaint(); }
    if (reduced || !canAnimate) finish();
    preload();
    // if the shell announced the view before this module was listening
    setTimeout(function () {
      if (active || !EDU.currentView || EDU.currentView() !== 'home') return;
      active = true; layout(); if (!played) requestPlay(); mqStart();
    }, 60);
  }

  EDU.hero = { replay: replay, finish: finish, openKeywords: openKeywords };

  if (document.getElementById('hero')) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
