/* 2027 미래 교육 트렌드 홍보 키트 — 진열대 (ready-made promo images, one screen, paged). prefix: lib- */
(function () {
  'use strict';
  var EDU = window.EDU, U = EDU.util, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon;
  var A, state = { cat: null, page: {}, pages: 1, dir: 0 }, items = [], byId = {};

  /* 영상·GIF는 완성되는 대로 여기에 한 줄씩 넣으면 '움직이는 홍보물' 칸에 올라간다.
     { id, title, sub, kind:'video'|'gif'|'image', src, poster, w, h, bytes, filename } */
  EDU.media = EDU.media || [];

  var SIZE_LABEL = { '4x5': '피드 4:5', '1x1': '정사각', '9x16': '스토리 9:16', '16x9': '가로 16:9', link: '링크 카드', profile: '프사', kakaobg: '카톡 배경' };
  var ASPECT = { launch: 4 / 5, kw: 4 / 5, mine: 4 / 5, profile: 1, art: 1, cover: 4 / 5, motion: 1 };

  function add(it) { items.push(it); byId[it.id] = it; return it; }
  function fname() { return '2027미래교육트렌드_' + Array.prototype.slice.call(arguments).filter(Boolean).join('_'); }
  /* an item is { id, cat, title, sub, v:[{size,label,pv,md,hd,w,h,bytes,filename}], kw?, template?, fit?, checker?, ground? } */
  function single(id, cat, title, sub, f, extra) {
    return add(Object.assign({ id: id, cat: cat, title: title, sub: sub, v: [f] }, extra || {}));
  }

  function build() {
    A = window.EDU_ASSETS; items = []; byId = {};
    var P = window.EDU_PROMO, c = A.covers;

    if (P) {
      // ----- 출간 포스터 (책 전체) -----
      (P.book || []).forEach(function (b) {
        var v = variants(b, ['4x5', '1x1', '9x16', '16x9', 'link'], fname(b.name));
        if (v.length) add({ id: 'bk-' + b.id, cat: 'launch', title: b.title, sub: v.length + '가지 크기', v: v, template: b.template });
      });
      // ----- 키워드 포스터 21 -----
      (P.kw || []).forEach(function (k) {
        var kw = A.keywords.filter(function (x) { return x.id === k.id; })[0]; if (!kw) return;
        var v = variants(k, ['4x5', '1x1', '9x16', '16x9', 'link'], fname(kw.tag));
        if (v.length) add({ id: 'kw-' + k.id, cat: 'kw', title: kw.name, sub: v.length + '가지 크기', v: v, kw: k.id, template: k.template || 'art' });
      });
      // ----- 프사 · 카톡 배경 -----
      (P.book || []).forEach(function (b) {
        var pf = variants(b, ['profile'], fname(b.name)), bg = variants(b, ['kakaobg'], fname(b.name));
        if (pf.length) add({ id: 'pf-' + b.id, cat: 'profile', title: b.title, sub: '프사', v: pf, template: b.template, round: true });
        if (bg.length) add({ id: 'bg-' + b.id, cat: 'profile', title: b.title, sub: '카톡 배경', v: bg, template: b.template, fit: 'contain' });
      });
      (P.kw || []).forEach(function (k) {
        var kw = A.keywords.filter(function (x) { return x.id === k.id; })[0]; if (!kw) return;
        var pf = variants(k, ['profile'], fname(kw.tag));
        if (pf.length) add({ id: 'pf-' + k.id, cat: 'profile', title: kw.name, sub: '프사', v: pf, kw: k.id, template: 'art', round: true });
      });
    }
    // ----- 그림 원본 (키워드 그림 21, 투명) -----
    A.keywords.forEach(function (k) {
      single('art-' + k.id, 'art', k.name, '투명 PNG', { size: 'art', label: '원본', pv: EDU.kwArt(k.id, 'pv'), md: EDU.kwArt(k.id, 'pv'), hd: EDU.kwArt(k.id, 'hd'), w: 2048, h: 2048, filename: fname('그림', k.tag) + '.png' }, { kw: k.id, ground: true, fit: 'contain' });
    });
    // ----- 표지 -----
    single('cv-3d', 'cover', '입체 표지', '투명 배경 PNG', { size: 'cv', label: '원본', pv: 'assets/covers/book3d.webp', md: 'assets/covers/book3d.webp', hd: 'assets/covers/book3d.png', w: c.book3d.w, h: c.book3d.h, bytes: c.book3d.bytes, filename: fname('입체표지') + '.png' }, { fit: 'contain', checker: true });
    if (c.book3dWhite) single('cv-3dw', 'cover', '입체 표지', '흰 바탕 JPG', { size: 'cv', label: '원본', pv: 'assets/covers/book3d.webp', md: 'assets/covers/book3d.webp', hd: 'assets/covers/book3d-white.jpg', w: c.book3dWhite.w, h: c.book3dWhite.h, bytes: c.book3dWhite.bytes, filename: fname('입체표지_흰바탕') + '.jpg' }, { fit: 'contain' });
    single('cv-flat', 'cover', '평면 표지', 'JPG', { size: 'cv', label: '원본', pv: 'assets/covers/2027.webp', md: 'assets/covers/2027.webp', hd: 'assets/covers/2027.jpg', w: c['2027'].w, h: c['2027'].h, bytes: c['2027'].bytes, filename: fname('표지') + '.jpg' }, { fit: 'contain' });
    // ----- 움직이는 홍보물 (GIF + MP4) -----
    // 목록 파일 셋을 차례로 싣는다: 통통 튀는 책(js/motion-book.js) → 모션랩 장면(js/motionlab-data.js) → 표지 문법 모션(js/motion-data.js)
    var MS = [window.EDU_MOTION_BOOK, window.EDU_MOTIONLAB, window.EDU_MOTION].filter(Boolean), seenV = {};
    // 직접 렌더한 '통통 튀는 책'을 맨 앞에, 그다음 완성 영상(릴스·피드 영상)
    if (window.EDU_MOTION_BOOK) (window.EDU_MOTION_BOOK.items || []).forEach(addMotion);
    MS.forEach(function (M) { (M.videos || []).forEach(function (m) {
      if (seenV[m.id]) return; seenV[m.id] = 1;
      add({ id: 'md-' + m.id, cat: 'motion', title: m.title, sub: m.sub || '영상', kind: 'video', fit: 'contain', v: [{ size: 'mv', label: '원본', pv: m.poster || '', md: m.preview || m.src, hd: m.src, w: m.w, h: m.h, bytes: m.bytes, filename: m.filename }] });
    }); });
    // 캐러셀 낱장(정지 그림)은 출간 포스터 칸에
    MS.forEach(function (M) { (M.cards || []).forEach(function (m) {
      single('cd-' + m.id, 'launch', m.title, '캐러셀 낱장', { size: 'cd', label: '원본', pv: m.poster || m.src, md: m.poster || m.src, hd: m.src, w: m.w, h: m.h, bytes: m.bytes, filename: m.filename }, { fit: 'contain' });
    }); });
    MS.forEach(function (M) { if (M !== window.EDU_MOTION_BOOK) (M.items || []).forEach(addMotion); });
    function addMotion(m) {
      var order = ['4x5', '1x1', '16x9', '9x16'], kw = m.kw ? A.keywords.filter(function (x) { return x.id === m.kw; })[0] : null;
      var files = (m.files || []).slice().sort(function (x, y) { return order.indexOf(x.size) - order.indexOf(y.size); });
      if (m.kw) files.sort(function (x, y) { return (x.size === '1x1' ? 0 : 1) - (y.size === '1x1' ? 0 : 1); });
      var base = fname('움직이는', kw ? kw.tag : m.title.replace(/\s+/g, ''));
      add({ id: 'mv-' + m.id, cat: 'motion', title: m.title, sub: (m.secs ? m.secs + '초 · ' : '') + 'GIF · MP4', kind: 'motion', kw: m.kw || null, fit: 'contain',
        v: files.map(function (f) { var lb = f.label || f.size; return { size: f.size, label: lb, pv: f.poster, md: f.gif, hd: f.gif, mp4: f.mp4, w: f.gw, h: f.gh, vw: f.vw, vh: f.vh, bytes: f.gifBytes, mp4Bytes: f.mp4Bytes, filename: base + '_' + lb.replace(/[\s:]+/g, '') + '.gif', mp4name: base + '_' + lb.replace(/[\s:]+/g, '') + '.mp4' }; }) });
    }
    // 완성 영상(릴스 등)은 EDU.media에 한 줄씩: { id, title, sub, src(mp4), poster, w, h, bytes, filename }
    EDU.media.forEach(function (m) {
      add({ id: 'md-' + m.id, cat: 'motion', title: m.title, sub: m.sub || '영상', kind: 'video', fit: 'contain', v: [{ size: 'mv', label: '원본', pv: m.poster || '', md: m.src, hd: m.src, w: m.w, h: m.h, bytes: m.bytes, filename: m.filename }] });
    });
  }
  function variants(entry, sizes, base) {
    var out = [];
    sizes.forEach(function (sz) {
      var f = (entry.files || {})[sz]; if (!f) return;
      out.push({ size: sz, label: SIZE_LABEL[sz] || sz, pv: f.pv, md: f.md || f.pv, hd: f.hd, w: f.w, h: f.h, bytes: f.bytes, filename: base + '_' + (SIZE_LABEL[sz] || sz).replace(/[\s:]+/g, '') + (/\.png$/.test(f.hd) ? '.png' : '.jpg') });
    });
    return out;
  }

  function count(c) { return items.filter(function (i) { return i.cat === c; }).length; }
  function cats() {
    var kw = EDU.currentKeyword(), list = [];
    if (kw && kw.id !== 'custom' && mine().length) list.push({ id: 'mine', name: '내 키워드', n: mine().length });
    [['launch', '출간 포스터'], ['kw', '키워드 포스터'], ['profile', '프사 · 배경'], ['art', '그림 원본'], ['cover', '표지']].forEach(function (c) {
      var n = count(c[0]); if (n) list.push({ id: c[0], name: c[1], n: n });
    });
    list.push({ id: 'motion', name: '움직이는 홍보물', n: count('motion') });
    return list;
  }
  /* 내 키워드: 그 키워드의 포스터를 크기별 카드로 펼치고 프사와 원본 그림을 붙인다 */
  function mine() {
    var kw = EDU.currentKeyword(); if (!kw) return [];
    var out = [], it = byId['kw-' + kw.id];
    if (it) it.v.forEach(function (v) { out.push({ id: it.id + '@' + v.size, cat: 'mine', title: v.label, sub: v.w + '×' + v.h, v: [v], kw: kw.id, template: it.template, fit: 'contain', poster: true }); });
    var pf = byId['pf-' + kw.id]; if (pf) out.push(Object.assign({}, pf, { id: pf.id + '@m', cat: 'mine', title: '프사', sub: '2160×2160' }));
    var mv = byId['mv-kw-' + kw.id]; if (mv) out.push(Object.assign({}, mv, { id: mv.id + '@m', cat: 'mine', title: '움직이는 카드', sub: 'GIF · MP4' }));
    var ar = byId['art-' + kw.id]; if (ar) out.push(Object.assign({}, ar, { id: ar.id + '@m', cat: 'mine', title: '그림 원본', sub: '투명 PNG' }));
    return out;
  }
  function inCat(c) { return c === 'mine' ? mine() : items.filter(function (i) { return i.cat === c; }); }

  /* ---------- render (one screen: chips + a paged grid sized to the box) ---------- */
  function render() {
    var s = $('#library');
    s.innerHTML =
      '<div class="lib">' +
        '<div class="vhead"><h2>진열대</h2><div class="lib-pager" id="libPager"></div></div>' +
        '<div class="scroller lib-cats" id="libCats" role="tablist" aria-label="홍보물 종류"></div>' +
        '<div class="lib-bar" id="libBar"></div>' +
        '<div class="lib-box" id="libBox"><div class="lib-grid" id="libGrid"></div></div>' +
      '</div>';
    $('#libCats').addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (b) { state.cat = b.getAttribute('data-cat'); paint(); } });
    $('#libGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-item]'); if (b) return detail(b.getAttribute('data-item'));
      var g = e.target.closest('[data-egg]'); if (g) window.dispatchEvent(new CustomEvent('edu:egg', { detail: g.getAttribute('data-egg') }));
    });
    $('#libPager').addEventListener('click', function (e) { var b = e.target.closest('[data-page]'); if (b && !b.disabled) turn(+b.getAttribute('data-page')); });
    $('#libBar').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'all') saveMany(mine().filter(function (x) { return x.poster; }));
      if (act === 'pick') U.goTo('kwIndex');
    });
    var box = $('#libBox'), sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 48) turn(dx < 0 ? 1 : -1); }, { passive: true });
    s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); });
    paint();
  }
  function turn(d) {
    var n = state.pages || 1, cur = state.page[state.cat] || 0, nx = Math.max(0, Math.min(n - 1, cur + d));
    if (nx === cur) return;
    state.page[state.cat] = nx; state.dir = d; paint();
  }

  /* how many thumbnails fit the box: pick the column count that shows the most picture area */
  function fit(n, W, H, aspect) {
    var gap = W < 520 ? 8 : 14, cap = W < 520 ? 36 : 42, minW = W < 520 ? 96 : 110, maxW = aspect >= 1 ? 220 : 250;
    var best = null;
    for (var cols = 2; cols <= 12; cols++) {
      var cw = Math.min(maxW, (W - gap * (cols - 1)) / cols);
      if (cw < minW && cols > 2) break;
      var ch = cw / aspect + cap, rows = Math.floor((H + gap) / (ch + gap));
      if (rows < 1) { cw = Math.max(60, (H - cap) * aspect); rows = 1; }
      var shown = Math.min(n, cols * rows), area = cw * cw * shown;
      if (!best || area > best.area * 1.04) best = { cols: cols, rows: rows, cw: Math.floor(cw), per: cols * rows, area: area, gap: gap };
    }
    if (n <= best.cols) {
      var cw2 = Math.floor(Math.min(maxW, (W - best.gap * (n - 1)) / n, (H - cap) * aspect));
      best = { cols: n, rows: 1, cw: cw2, per: n, gap: best.gap };
    }
    return best;
  }

  function paint() {
    if (!$('#libGrid')) return;
    var cl = cats();
    if (!state.cat || !cl.some(function (c) { return c.id === state.cat; })) state.cat = cl[0].id;
    $('#libCats').innerHTML = cl.map(function (c) {
      return '<button type="button" class="chip" role="tab" data-cat="' + c.id + '" aria-selected="' + (c.id === state.cat) + '">' + esc(c.name) + (c.n ? '<small>' + c.n + '</small>' : '') + '</button>';
    }).join('');
    var on = $('#libCats [aria-selected="true"]');
    if (on && state.catShown !== state.cat) { state.catShown = state.cat; var sc = $('#libCats'); sc.scrollLeft = Math.max(0, on.offsetLeft - (sc.clientWidth - on.offsetWidth) / 2); }
    var list = inCat(state.cat), bar = $('#libBar'), grid = $('#libGrid'), box = $('#libBox'), pager = $('#libPager'), kw = EDU.currentKeyword();
    var pick = kw ? '' : '<button type="button" class="btn btn-line btn-small" data-act="pick">내 키워드 고르기</button>';
    if (state.cat === 'mine') bar.innerHTML = '<p><b>' + esc(kw.name) + '</b> 홍보물 모음</p><button type="button" class="btn btn-dark btn-small" data-act="all">' + icon('download') + '포스터 한 번에</button>';
    else if (state.cat === 'launch') bar.innerHTML = '<p>책 소식을 알리는 포스터예요. 누르면 크기를 고를 수 있어요</p>';
    else if (state.cat === 'kw') bar.innerHTML = '<p>표지 키워드 21개, 각각 다섯 가지 크기</p>' + pick;
    else if (state.cat === 'profile') bar.innerHTML = '<p>카톡 · 인스타 프로필 사진과 카톡 배경</p>' + pick;
    else if (state.cat === 'art') bar.innerHTML = '<p>직접 꾸밀 때 쓰는 투명 그림이에요. 시안 바탕에 얹어 주세요</p>';
    else if (state.cat === 'cover') bar.innerHTML = '<p>2027 표지 원본이에요. 입체는 투명 배경과 흰 바탕 두 가지</p>';
    else bar.innerHTML = '<p>완성되는 대로 여기에 올라와요</p>';

    if (!list.length) {
      grid.className = 'lib-grid lib-motion'; grid.removeAttribute('style'); pager.innerHTML = ''; state.pages = 1;
      grid.innerHTML =
        '<div class="lib-empty">' +
          '<button type="button" class="lib-emptytio" data-egg="bake" aria-label="영상을 굽고 있는 TIO"><img src="assets/tio/bake.webp" alt="" width="150" height="196"></button>' +
          '<h3>영상은 굽는 중이에요</h3>' +
          '<p>릴스, 움직이는 포스터, 블로그 썸네일 GIF가 완성되는 대로 이 칸에 올라와요. 그때도 원본 그대로 받을 수 있어요.</p>' +
          '<ul class="lib-soon"><li>' + icon('film') + '릴스 4:5</li><li>' + icon('film') + '세로 트레일러 9:16</li><li>' + icon('image') + '썸네일 GIF 1200×675</li></ul>' +
        '</div>';
      return;
    }
    var asp = ASPECT[state.cat] || 4 / 5, r = box.getBoundingClientRect(), f = fit(list.length, Math.max(200, r.width), Math.max(160, r.height), asp);
    var pages = Math.max(1, Math.ceil(list.length / f.per)), page = Math.min(state.page[state.cat] || 0, pages - 1);
    state.page[state.cat] = page; state.pages = pages;
    grid.className = 'lib-grid' + (state.dir ? (state.dir > 0 ? ' is-next' : ' is-prev') : ''); state.dir = 0;
    grid.style.cssText = 'grid-template-columns:repeat(' + f.cols + ',' + f.cw + 'px);gap:' + f.gap + 'px;--asp:' + asp;
    grid.innerHTML = list.slice(page * f.per, page * f.per + f.per).map(card).join('');
    pager.innerHTML = pages > 1
      ? '<button type="button" class="icon-btn" data-page="-1" aria-label="이전 쪽"' + (page === 0 ? ' disabled' : '') + '>' + icon('chev-right') + '</button>' +
        '<span aria-live="polite"><b>' + (page + 1) + '</b> / ' + pages + '</span>' +
        '<button type="button" class="icon-btn" data-page="1" aria-label="다음 쪽"' + (page === pages - 1 ? ' disabled' : '') + '>' + icon('chev-right') + '</button>'
      : '<span class="lib-count">' + list.length + '장</span>';
  }

  function card(it) {
    var p = EDU.getProfile(), mineKw = p.kw && it.kw === p.kw && it.cat !== 'mine', v = it.v[0];
    return '<button type="button" class="lib-card' + (it.checker ? ' is-checker' : '') + (it.ground ? ' is-ground' : '') + (it.fit === 'contain' ? ' is-contain' : '') + (it.round ? ' is-round' : '') + (mineKw ? ' is-mine' : '') + '" data-item="' + esc(it.id) + '" aria-label="' + esc(it.title + ' ' + (it.sub || '')) + ' 크게 보기">' +
      '<span class="lib-thumb">' +
        (it.kind === 'video' && !v.pv ? '<video src="' + esc(v.hd) + '" muted playsinline preload="metadata"></video>' : '<img src="' + esc(v.pv) + '" alt="" decoding="async">') +
        (it.kind === 'video' || it.kind === 'motion' ? '<i class="lib-play">' + icon('play', 'fill') + '</i>' : '') +
        (mineKw ? '<i class="lib-mine">내 키워드</i>' : '') +
      '</span>' +
      '<span class="lib-cap"><strong>' + esc(it.title) + '</strong><small>' + esc(it.sub || '') + '</small></span>' +
    '</button>';
  }

  /* ---------- detail sheet: big preview, size chips, save ---------- */
  function detail(id) {
    var list = inCat(state.cat), idx = list.findIndex(function (x) { return x.id === id; });
    if (idx < 0) { var one = byId[id]; if (!one) return; list = [one]; idx = 0; }
    var vi = 0;
    var d = U.sheet('홍보물', '<div class="lib-detail" id="libDetail"></div>', 'lib-dlg');
    function show(i, keepV) {
      idx = (i + list.length) % list.length;
      var it = list[idx]; if (!keepV) vi = 0; vi = Math.min(vi, it.v.length - 1);
      var v = it.v[vi], ext = (v.hd || '').split('.').pop().toUpperCase();
      var canCard = !!EDU.studio && (it.template || it.kw) && it.cat !== 'art' && it.cat !== 'cover' && !it.ground && it.kind !== 'motion' && it.kind !== 'video';
      $('#libDetail', d).innerHTML =
        '<div class="lib-stage' + (it.checker ? ' is-checker' : '') + (it.ground ? ' is-ground' : '') + '">' +
          (it.kind === 'video' ? '<video src="' + esc(v.md || v.hd) + '" poster="' + esc(v.pv || '') + '" controls playsinline loop autoplay muted></video>'
            : '<img src="' + esc(v.md || v.pv) + '" alt="' + esc(it.title) + '">') +
          (list.length > 1 ? '<button type="button" class="lib-nav lib-prev" data-step="-1" aria-label="이전">' + icon('chev-right') + '</button><button type="button" class="lib-nav lib-next" data-step="1" aria-label="다음">' + icon('chev-right') + '</button>' : '') +
        '</div>' +
        '<div class="lib-info">' +
          '<div class="lib-title"><h3>' + esc(it.title) + '</h3><span>' + (list.length > 1 ? (idx + 1) + ' / ' + list.length : '') + '</span></div>' +
          (it.v.length > 1 ? '<div class="scroller lib-sizes">' + it.v.map(function (x, k) { return '<button type="button" class="chip" data-v="' + k + '" aria-pressed="' + (k === vi) + '">' + esc(x.label) + '</button>'; }).join('') + '</div>' : '') +
          '<p class="lib-meta">' + [it.v.length > 1 || it.kind === 'motion' ? '' : it.sub, v.w && v.h ? v.w + '×' + v.h : '', ext, U.fmtBytes(v.bytes)].filter(Boolean).map(esc).join(' · ') + '</p>' +
          '<div class="lib-actions">' +
            '<button type="button" class="btn btn-cy btn-block" data-save>' + icon('download') + (it.kind === 'motion' ? 'GIF 저장' : it.kind === 'video' ? '영상 저장' : '고화질로 저장') + '</button>' +
            (it.kind === 'motion' && v.mp4 ? '<button type="button" class="btn btn-line btn-block" data-mp4>' + icon('film') + 'MP4 저장 <small>인스타 · 릴스용</small></button>' : '') +
            (canCard ? '<button type="button" class="btn btn-line btn-block" data-card>' + icon('wand') + '내 이름 넣어서 만들기</button>' : '') +
          '</div>' +
        '</div>';
    }
    d.addEventListener('click', function (e) {
      var st = e.target.closest('[data-step]'); if (st) return show(idx + (+st.getAttribute('data-step')));
      var vb = e.target.closest('[data-v]'); if (vb) { vi = +vb.getAttribute('data-v'); return show(idx, true); }
      var it = list[idx], v = it.v[vi];
      if (e.target.closest('[data-save]')) {
        d.close();
        U.saveSheet({ title: it.title + ' · ' + (it.v.length > 1 || it.cat === 'mine' ? v.label : it.sub || v.label), filename: v.filename, url: v.hd, preview: v.md || v.pv, w: v.w, h: v.h, bytes: v.bytes, kind: it.kind === 'video' ? 'video' : 'image' });
      }
      if (e.target.closest('[data-mp4]')) {
        d.close();
        U.saveSheet({ title: it.title + ' · ' + v.label + ' MP4', filename: v.mp4name, url: v.mp4, preview: v.pv, w: v.vw, h: v.vh, bytes: v.mp4Bytes, kind: 'video' });
      }
      if (e.target.closest('[data-card]')) {
        d.close();
        if (it.kw) EDU.setProfile({ kw: it.kw });
        var patch = { template: it.template || 'art' }; if (SIZE_LABEL[v.size]) patch.ratio = v.size;
        if (EDU.studio && EDU.studio.set) EDU.studio.set(patch);
        U.goTo('studio');
        U.toast('카드 공방에 그대로 옮겼어요', { tio: 'cheer' });
      }
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    var sx = null;
    d.addEventListener('touchstart', function (e) { sx = e.target.closest('.lib-stage') ? e.touches[0].clientX : null; }, { passive: true });
    d.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 56 && list.length > 1) show(idx + (dx < 0 ? 1 : -1)); }, { passive: true });
    show(idx);
  }

  /* ---------- several files at once (내 키워드 포스터 묶음) ---------- */
  function saveMany(list) {
    if (!list.length) return;
    var files = list.map(function (it) { return it.v[0]; });
    if (!EDU.env.mobile) {
      files.forEach(function (v, i) { setTimeout(function () { U.anchorDownload(v.hd, U.fileName(v.filename)); }, i * 450); });
      U.toast(files.length + '장을 내려받고 있어요', { tio: 'heart' });
      return;
    }
    var d = U.sheet('한 번에 저장', '<div class="save-body"><div class="lib-many">' + files.map(function (v) { return '<img src="' + esc(v.pv) + '" alt="' + esc(v.label) + '">'; }).join('') + '</div>' +
      '<div class="progress"><i></i></div><button type="button" class="btn btn-cy btn-block" disabled>' + icon('download') + '<span>원본 불러오는 중…</span></button>' +
      '<p class="note">한꺼번에 저장이 안 되는 기기에서는 그림을 하나씩 눌러 받아 주세요.</p></div>');
    var bar = $('.progress i', d), btn = $('button.btn-cy', d), done = 0, blobs = [];
    Promise.all(files.map(function (v, i) {
      return U.fetchBlob(v.hd).then(function (b) { done++; bar.style.width = Math.round(done / files.length * 100) + '%'; blobs[i] = new File([b], U.fileName(v.filename), { type: b.type || 'image/png' }); });
    })).then(function () {
      $('.progress', d).hidden = true; btn.disabled = false;
      var can = false; try { can = navigator.canShare && navigator.canShare({ files: blobs }); } catch (e) { can = false; }
      $('span', btn).textContent = can ? files.length + '장 사진 앱에 저장 · 공유' : '하나씩 저장하기';
      btn.onclick = function () {
        if (can) navigator.share({ files: blobs }).then(function () { d.close(); U.toast('저장 창을 열었어요', { tio: 'heart' }); }, function () {});
        else { d.close(); detail(list[0].id); }
      };
    }, function () { d.close(); detail(list[0].id); });
  }

  function init() {
    if (!window.EDU_ASSETS) return;
    build(); render();
    window.addEventListener('edu:profile', paint);
    window.addEventListener('edu:view', function (e) { if (e.detail.view === 'library') paint(); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(paint, 120); });
  }
  EDU.library = { open: function (cat) { state.cat = cat; U.goTo('library'); paint(); }, refresh: function () { build(); paint(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
