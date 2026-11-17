/* 2027 미래 교육 트렌드 홍보 키트 — 숨은 TIO (easter eggs). prefix: egg- */
(function () {
  'use strict';
  var EDU = window.EDU, U = EDU.util, $ = U.$, esc = U.esc, icon = U.icon;
  var KEY = 'edutrend.eggs.v1';
  var EGGS = [
    { id: 'shelf', hint: '책장 위를 잠깐 지켜보세요', done: '책장 뒤에 숨어 있었어요' },
    { id: 'logo', hint: '맨 위 숫자를 여러 번 두드려 보세요', done: '2027. 을 다섯 번 두드렸어요' },
    { id: 'name', hint: '이름 칸에 누군가의 이름을 써 보세요', done: '이름 칸에 TIO를 불렀어요' },
    { id: 'bake', hint: '진열대에서 뭔가 굽고 있어요', done: '영상 굽는 TIO를 찾았어요' },
    { id: 'run', hint: '화면 아래로 누가 달려가요', done: '달리는 TIO를 붙잡았어요' }
  ];
  var STICKERS = [['book', '책 안은 TIO'], ['stack', '네 권 나르는 TIO'], ['mega', '홍보하는 TIO'], ['sit', '책 읽는 TIO'], ['bake', '영상 굽는 TIO'], ['peek', '빼꼼 TIO']];
  var found = U.store.get(KEY, {});

  function total() { return EGGS.filter(function (e) { return found[e.id]; }).length; }
  function badge() {
    var n = total();
    U.$$('.js-eggcount').forEach(function (b) { b.innerHTML = '숨은 TIO ' + n + ' / ' + EGGS.length; });
  }
  function collect(id, at) {
    var first = !found[id];
    if (first) { found[id] = 1; U.store.set(KEY, found); badge(); }
    pop(at, first ? 'cheer' : 'smile');
    var n = total();
    if (first && n === EGGS.length) setTimeout(prize, 1300);
    else U.toast(first ? 'TIO를 찾았어요! ' + n + ' / ' + EGGS.length : '여긴 벌써 찾았어요', { tio: first ? 'wow' : 'smile' });
  }
  function pop(at, pose) {
    var r = at && at.getBoundingClientRect ? at.getBoundingClientRect() : null;
    var x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top : innerHeight * 0.6;
    var n = U.el('div', { class: 'egg-pop', style: 'left:' + Math.max(8, Math.min(innerWidth - 100, x - 46)) + 'px;top:' + Math.max(70, y - 110) + 'px' }, '<img src="assets/tio/' + pose + '.webp" alt="">');
    document.body.appendChild(n); setTimeout(function () { n.remove(); }, 2000);
  }
  function rain(withTio) {
    if (EDU.env.reduced) return;
    var box = U.el('div', { class: 'egg-rain', 'aria-hidden': 'true' }), html = '', poses = ['cheer', 'happy', 'wave', 'heart', 'book', 'mega'];
    for (var i = 0; i < 26; i++) {
      var tio = withTio && i % 3 === 0, size = tio ? 46 + Math.random() * 26 : 12 + Math.random() * 20;
      html += '<i class="' + (tio ? '' : 's' + (i % 4 === 1 ? ' k' : '')) + '" style="left:' + (Math.random() * 96) + '%;width:' + size + 'px;height:' + (tio ? 'auto' : size + 'px') +
        ';animation-duration:' + (1.5 + Math.random() * 1.7) + 's;animation-delay:' + (Math.random() * 0.7) + 's;--r:' + Math.round(-220 + Math.random() * 440) + 'deg">' +
        (tio ? '<img src="assets/tio/' + poses[i % poses.length] + '.webp" alt="">' : '') + '</i>';
    }
    box.innerHTML = html; document.body.appendChild(box); setTimeout(function () { box.remove(); }, 4200);
  }
  function prize() {
    rain(true);
    var d = U.sheet('숨은 TIO', '<div class="egg-prize"><img src="assets/tio/book.webp" alt=""><h3>다섯 마리를 다 찾았어요</h3><p>찾아 주셔서 고마워요. TIO 스티커 여섯 장을 드릴게요. 투명 배경이라 카드나 스토리에 얹어 쓰기 좋아요.</p>' +
      '<div class="egg-stickers">' + STICKERS.map(function (s) { return '<button type="button" data-st="' + s[0] + '" aria-label="' + esc(s[1]) + ' 저장"><img src="assets/tio/' + s[0] + '.webp" alt=""></button>'; }).join('') + '</div>' +
      '<p class="note">스티커를 누르면 원본 PNG로 받아요.</p></div>');
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-st]'); if (!b) return;
      var k = b.getAttribute('data-st'), nm = STICKERS.filter(function (s) { return s[0] === k; })[0][1];
      d.close();
      U.saveSheet({ title: nm + ' (투명 PNG)', filename: 'TIO_' + nm.replace(/\s+/g, '') + '.png', url: 'assets/tio/hd/tio-' + k + '.png', preview: 'assets/tio/' + k + '.webp' });
    });
  }
  function status() {
    if (total() === EGGS.length) return prize();
    U.sheet('숨은 TIO', '<div class="egg-prize"><img src="assets/tio/curious.webp" alt=""><h3>숨은 TIO ' + total() + ' / ' + EGGS.length + '</h3><p>이 사이트 곳곳에 TIO가 숨어 있어요. 다 찾으면 작은 선물이 있어요.</p>' +
      '<ul class="egg-list">' + EGGS.map(function (e) { return '<li class="' + (found[e.id] ? 'is-found' : '') + '"><i>' + (found[e.id] ? icon('check') : '') + '</i>' + esc(found[e.id] ? e.done : e.hint) + '</li>'; }).join('') + '</ul></div>');
  }

  /* 1. 책장 위에서 빼꼼 */
  function shelfEgg() {
    var hook = $('.hero-egg[data-egg="shelf"]'); if (!hook) return;
    var panel = hook.parentElement;
    if (getComputedStyle(panel).position === 'static') panel.style.position = 'relative';
    var w = U.el('div', { class: 'egg-peek' }, '<button type="button" aria-label="책장 뒤에 숨은 TIO"><img src="assets/tio/peek.webp" alt="" width="148" height="123"></button>');
    panel.appendChild(w);
    var up = function () { w.classList.add('is-up'); setTimeout(function () { if (!w.dataset.hold) w.classList.remove('is-up'); }, 5200); };
    var first = setTimeout(up, EDU.env.reduced ? 1500 : 8500);
    var loop = setInterval(function () { if (!document.hidden && !w.classList.contains('is-up')) up(); }, 21000);
    $('button', w).addEventListener('click', function (e) {
      w.dataset.hold = 1; collect('shelf', e.currentTarget);
      setTimeout(function () { delete w.dataset.hold; w.classList.remove('is-up'); }, 1600);
    });
    void first; void loop;
  }
  /* 2. 로고 다섯 번 */
  function logoEgg() {
    var s = $('#brandSymbol'); if (!s) return;
    var n = 0, t;
    s.addEventListener('click', function (e) {
      e.preventDefault(); n++; clearTimeout(t); t = setTimeout(function () { n = 0; }, 1400);
      if (n >= 5) { n = 0; rain(true); collect('logo', s); }
    });
  }
  /* 3. 이름 칸에 TIO */
  function nameEgg() {
    document.addEventListener('input', function (e) {
      if (!e.target || e.target.id !== 'pfName') return;
      var v = e.target.value.trim().toLowerCase();
      if (v === 'tio' || v === '티오') collect('name', e.target);
    });
  }
  /* 4. 영상 굽는 TIO */
  function bakeEgg() {
    window.addEventListener('edu:egg', function (e) { if (e.detail === 'bake') collect('bake', $('.lib-emptytio')); });
  }
  /* 5. 화면 맨 아래를 가로질러 달리기 (탭바 바로 위) */
  function runEgg() {
    var host = $('#main'); if (!host) return;
    var lane = U.el('div', { class: 'egg-lane', 'aria-hidden': 'false' }); host.appendChild(lane);
    var busy = false, last = 0;
    function go() {
      if (busy || document.hidden || Date.now() - last < 50000) return; busy = true; last = Date.now();
      var r = U.el('button', { class: 'egg-run', type: 'button', 'aria-label': '달리는 TIO' }, '<img src="assets/tio/run.webp" alt="">');
      if (EDU.env.reduced) { r.style.animation = 'none'; r.style.left = '14px'; r.firstChild.style.animation = 'none'; setTimeout(function () { if (r.parentNode) { r.remove(); busy = false; } }, 9000); }
      lane.appendChild(r);
      r.addEventListener('click', function () { collect('run', r); r.style.animationPlayState = 'paused'; setTimeout(function () { r.remove(); busy = false; }, 900); });
      r.addEventListener('animationend', function () { r.remove(); busy = false; });
    }
    setTimeout(go, 24000);
    window.addEventListener('edu:view', function (e) { if (e.detail.view === 'links' || e.detail.view === 'library') setTimeout(go, 2600); });
  }
  /* 덤: 키보드로 2027 */
  function typeEgg() {
    var buf = '';
    document.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key && e.key.length === 1) { buf = (buf + e.key).slice(-4); if (buf === '2027') { buf = ''; rain(false); U.toast('2027, 네 번째 책이에요', { tio: 'book' }); } }
    });
  }

  function init() {
    badge();
    document.addEventListener('click', function (ev) { if (ev.target.closest('.js-eggcount')) status(); });
    setTimeout(shelfEgg, 60); logoEgg(); nameEgg(); bakeEgg(); runEgg(); typeEgg();
  }
  EDU.eggs = { status: status, rain: rain, reset: function () { found = {}; U.store.set(KEY, found); badge(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
