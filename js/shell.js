/* 2027 미래 교육 트렌드 홍보 키트 — app shell: header, tab bar, 내 정보 view, 링크 view, footer bar, help. prefix: sh- */
(function () {
  'use strict';
  var EDU = window.EDU, U = EDU.util, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon;
  var TABS = [['home', 'home', '홈'], ['me', 'user', '내 정보'], ['studio', 'image', '카드'], ['library', 'grid', '진열대'], ['captions', 'pen', '글감'], ['ai', 'wand', 'AI']];

  function coverSave() {
    var c = (window.EDU_ASSETS || {}).covers || {}, b = c.book3d || {};
    U.saveSheet({ title: '2027 입체 표지 (투명 배경 PNG)', filename: '2027미래교육트렌드_입체표지.png',
      url: 'assets/covers/book3d.png', preview: 'assets/covers/book3d.webp', w: b.w, h: b.h, bytes: b.bytes });
  }
  EDU.coverSave = coverSave;

  /* ---------------- header + tab bar ---------------- */
  function header() {
    var h = $('#siteHeader');
    h.innerHTML =
      '<a class="sh-brand" href="#home" data-go="home" aria-label="2027 대한민국 미래 교육 트렌드 저자 홍보 키트 홈">' +
        '<span class="sh-symbol" id="brandSymbol" aria-hidden="true">2027<i>.</i></span>' +
        '<span class="sh-name"><strong>미래 교육 트렌드</strong><span>저자 홍보 키트</span></span>' +
      '</a>' +
      '<nav class="sh-nav" aria-label="화면 바꾸기">' + TABS.concat([['links', 'link', '링크']]).map(function (t) {
        return '<a href="#' + t[0] + '" data-go="' + t[0] + '" data-tab="' + t[0] + '">' + t[2] + '</a>';
      }).join('') + '</nav>' +
      '<div class="sh-actions">' +
        '<a class="sh-buy" href="' + esc(EDU.book.buy.url) + '" target="_blank" rel="noopener" aria-label="' + esc(EDU.book.buy.store) + ' 책 구매 링크">' + bookIco() + '<span><i>책 </i>구매 링크</span></a>' +
        '<button type="button" class="icon-btn sh-help" id="helpBtn" aria-label="처음이라면">' + icon('help') + '</button>' +
        '<button type="button" class="btn btn-dark btn-small sh-cover" id="coverBtn">' + icon('download') + '<span>표지 받기</span></button>' +
      '</div>';
    $('#helpBtn').addEventListener('click', help);
    $('#coverBtn').addEventListener('click', coverSave);

    $('#dock').innerHTML = TABS.concat([['links', 'link', '링크']]).map(function (t) {
      return '<a href="#' + t[0] + '" data-go="' + t[0] + '" data-tab="' + t[0] + '">' + icon(t[1]) + '<span>' + t[2] + '</span></a>';
    }).join('');

    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-go]'); if (!a) return;
      // the brand symbol doubles as an easter-egg target: let rapid taps through without leaving the view
      e.preventDefault(); U.goTo(a.getAttribute('data-go'));
    });
    window.addEventListener('edu:view', function (e) {
      $$('[data-tab]').forEach(function (n) {
        var on = n.getAttribute('data-tab') === e.detail.view;
        n.classList.toggle('is-on', on);
        if (on) n.setAttribute('aria-current', 'page'); else n.removeAttribute('aria-current');
      });
    });

    if (EDU.env.inApp && !U.store.get('edutrend.inapp.dismissed', false)) {
      var bar = U.el('div', { class: 'sh-inapp', role: 'note' },
        '<p><b>' + U.inAppName[EDU.env.inApp] + ' 안에서 열렸어요.</b> 저장은 기본 브라우저에서 더 잘 돼요.</p>' +
        '<button type="button" class="btn btn-small btn-white" data-open>브라우저로 열기</button>' +
        '<button type="button" class="icon-btn" data-x aria-label="안내 닫기">' + icon('x') + '</button>');
      h.insertAdjacentElement('afterend', bar);
      $('[data-open]', bar).addEventListener('click', function () { U.openExternal(location.href); });
      $('[data-x]', bar).addEventListener('click', function () { bar.remove(); U.store.set('edutrend.inapp.dismissed', true); window.dispatchEvent(new Event('resize')); });
    }
  }

  /* ---------------- help ---------------- */
  function help() {
    var d = U.sheet('QUICK START',
      '<div class="sh-helpbody">' +
        '<img class="sh-helptio" src="assets/tio/wave.webp" alt="" width="96" height="100">' +
        '<h2>세 단계면 끝나요.</h2>' +
        '<ol class="sh-steps">' +
          '<li><span>1</span><div><strong>내 정보를 넣어요</strong><p>이름, 소속, 내 키워드. 한 번 넣으면 이 기기에 남아 있어요.</p></div></li>' +
          '<li><span>2</span><div><strong>홍보 카드를 저장해요</strong><p>크기와 디자인을 고르고 ‘고화질로 저장’을 눌러요.</p></div></li>' +
          '<li><span>3</span><div><strong>글을 복사하고 SNS를 열어요</strong><p>플랫폼만 고르면 글과 해시태그가 준비돼요.</p></div></li>' +
        '</ol>' +
        '<p class="save-tip"><b>카카오톡에서 열었다면</b> 화면 아래 ⋮ 또는 공유 버튼에서 ‘다른 브라우저로 열기’를 누르면 저장이 훨씬 잘 돼요.</p>' +
        '<button type="button" class="btn btn-dark btn-block" data-close data-start>알겠어요, 시작할게요' + icon('arrow-right') + '</button>' +
      '</div>', 'sh-helpdlg');
    $('[data-start]', d).addEventListener('click', function () { setTimeout(function () { U.goTo('me'); }, 80); });
  }
  EDU.help = help;

  /* ---------------- 내 정보 ---------------- */
  function me() {
    var s = $('#start'), A = window.EDU_ASSETS || { keywords: [] };
    var opts = '<option value="">키워드를 골라 주세요</option>' + A.keywords.map(function (k) {
      return '<option value="' + k.id + '">' + esc(k.name) + '</option>';
    }).join('') + '<option value="custom">목록에 없어요 (직접 쓰기)</option>';
    s.innerHTML =
      '<div class="sh-me">' +
        '<div class="vhead"><h2>내 정보</h2><p>이 기기에만 저장돼요</p></div>' +
        '<div class="sh-mebody">' +
          '<div class="sh-tagcard" id="tagCard" aria-label="내 정보 미리 보기"></div>' +
          '<form class="sh-form" id="profileForm" autocomplete="off" novalidate>' +
            '<div class="seg sh-steps2" role="tablist" aria-label="정보 묶음">' +
              '<button type="button" role="tab" data-step="1" aria-selected="true">기본</button>' +
              '<button type="button" role="tab" data-step="2" aria-selected="false">더 넣기 <small>선택</small></button>' +
            '</div>' +
            '<div class="sh-fields" id="pfFields">' +
              '<div class="sh-step is-on" data-pane="1">' +
                '<div class="field"><label for="pfName">이름</label><input class="input" id="pfName" name="name" maxlength="20" placeholder="예: 김햇살" autocomplete="name" enterkeyhint="next"></div>' +
                '<div class="field"><label for="pfOrg">소속 · 하는 일</label><input class="input" id="pfOrg" name="org" maxlength="30" placeholder="예: 종덕초등학교 교사" enterkeyhint="next"></div>' +
                '<div class="field"><label for="pfKw">내 키워드</label><select class="select" id="pfKw" name="kw">' + opts + '</select></div>' +
                '<div class="field" id="pfCustomWrap" hidden><label for="pfCustom">내 키워드 직접 쓰기</label><input class="input" id="pfCustom" name="kwCustom" maxlength="24" placeholder="예: 들어가며"></div>' +
              '</div>' +
              '<div class="sh-step" data-pane="2">' +
                '<div class="field"><label for="pfHandle">SNS 아이디</label><input class="input" id="pfHandle" name="handle" maxlength="32" placeholder="@아이디" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="next"></div>' +
                '<div class="field"><label for="pfLine">한 줄 소개</label><input class="input" id="pfLine" name="line" maxlength="60" placeholder="예: 로봇을 가르치는 아이들이 2027년 교실의 주인공이에요" enterkeyhint="next"><span class="hint">‘한 문장’ 카드와 글에 들어가요.</span></div>' +
                '<div class="field"><label for="pfLink">책 구매 링크</label><input class="input" id="pfLink" name="link" type="url" inputmode="url" maxlength="300" placeholder="https://" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"><span class="hint">비워 두면 YES24 책 주소가 들어가요.</span></div>' +
              '</div>' +
            '</div>' +
            '<div class="sh-formfoot"><span class="sh-saved" id="pfSaved" aria-live="polite"></span><button type="button" class="btn btn-ghost btn-small" id="pfReset">' + icon('refresh') + '비우기</button></div>' +
          '</form>' +
          '<div class="sh-mebtns">' +
            '<button type="button" class="btn btn-dark" data-go="studio">카드 만들기' + icon('arrow-right') + '</button>' +
            '<button type="button" class="btn btn-line" data-go="captions">' + icon('pen') + '글감 보기</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var f = $('#profileForm'), saved = $('#pfSaved'), t;
    function step(n) {
      $$('[data-step]', f).forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-step') === String(n))); });
      $$('[data-pane]', f).forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pane') === String(n)); });
    }
    f.addEventListener('click', function (e) { var b = e.target.closest('[data-step]'); if (b) step(b.getAttribute('data-step')); });
    function tag(pp) {
      var kw = EDU.currentKeyword(pp), hd = pp.handle || '';
      $('#tagCard').innerHTML =
        '<div class="sh-tagtop">' +
          '<p class="sh-tagbrace"><b>{</b><span>2027 대한민국 미래 교육 트렌드</span><b>}</b></p>' +
          '<p class="sh-tagkw' + (kw ? '' : ' is-empty') + '">' + esc(kw ? kw.name : '내 키워드') + '</p>' +
          '<span class="spark sh-tagspark" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="sh-tagbot">' +
          '<span class="sh-taglabel">저자</span>' +
          '<strong class="' + (pp.name ? '' : 'is-empty') + '">' + esc(pp.name || '이름') + '</strong>' +
          (pp.org ? '<span>' + esc(pp.org) + '</span>' : '') +
          (hd ? '<span class="sh-taghandle">' + esc(hd) + '</span>' : '') +
        '</div>';
    }
    function fill(pp) {
      ['name', 'org', 'kw', 'kwCustom', 'handle', 'line', 'link'].forEach(function (k) {
        var n = f.elements[k]; if (n && document.activeElement !== n) n.value = pp[k] || '';
      });
      $('#pfCustomWrap').hidden = pp.kw !== 'custom';
      tag(pp);
    }
    function read() {
      var o = {};
      ['name', 'org', 'kw', 'kwCustom', 'handle', 'line', 'link'].forEach(function (k) { o[k] = (f.elements[k].value || '').trim(); });
      if (o.handle && o.handle.charAt(0) !== '@') o.handle = '@' + o.handle.replace(/^@+/, '');
      return o;
    }
    function onInput() {
      var o = read();
      $('#pfCustomWrap').hidden = o.kw !== 'custom';
      EDU.setProfile(o);
      saved.innerHTML = icon('check') + '저장했어요';
      saved.classList.add('is-on'); clearTimeout(t); t = setTimeout(function () { saved.classList.remove('is-on'); }, 1600);
    }
    f.addEventListener('input', onInput);
    f.addEventListener('change', onInput);
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    $('#pfReset').addEventListener('click', function () {
      EDU.setProfile({ name: '', org: '', kw: '', kwCustom: '', handle: '', line: '', link: '' });
      f.reset(); step(1); fill(EDU.getProfile()); U.toast('내 정보를 비웠어요', { tio: 'curious' });
    });
    window.addEventListener('edu:profile', function (e) { fill(e.detail); });
    fill(EDU.getProfile());
  }

  /** 책 아이콘(힉스필드로 만든 2027 책 그림) — '책 보러 가기' 링크마다 붙인다 */
  function bookIco() { return '<img class="bk-ico" src="' + esc(EDU.book.icon) + '" alt="" width="160" height="160" decoding="async">'; }
  EDU.bookIco = bookIco;

  /* ---------------- 링크 ---------------- */
  function links() {
    var s = $('#links'), b = EDU.book;
    var stores = b.stores.map(function (st) {
      return '<a class="sh-link' + (st.url ? ' is-open' : '') + '" href="' + esc(st.url || st.search) + '" target="_blank" rel="noopener">' +
        '<span class="sh-linkico">' + (st.url ? bookIco() : icon('cart')) + '</span><span class="sh-linktxt"><strong>' + esc(st.name) + '</strong><small>' + (st.url ? '책 페이지로 가기' : '서점에서 책 찾기') + '</small></span>' + icon('arrow-up-right') + '</a>';
    }).join('');
    var accounts = EDU.accounts.map(function (a) {
      return '<a class="sh-link" href="' + esc(a.url) + '" target="_blank" rel="noopener"' + (a.app ? ' data-app="' + esc(a.app) + '"' : '') + '>' +
        '<span class="sh-linkico">' + icon(a.app ? 'heart' : 'link') + '</span><span class="sh-linktxt"><strong>' + esc(a.group + ' ' + a.name) + '</strong><small>' + esc(a.handle) + '</small></span>' + icon('arrow-up-right') + '</a>';
    }).join('');
    var back = EDU.series.filter(function (x) { return x.year !== 2027; }).map(function (x) {
      var bl = EDU.backlist.filter(function (y) { return y.year === x.year; })[0] || {};
      return '<a class="sh-back" href="' + esc(bl.yes24 || '#') + '" target="_blank" rel="noopener" style="--c:' + x.color + '">' +
        '<img src="' + x.cover + '.webp" alt="' + esc(x.title) + ' 표지" loading="lazy" width="140" height="200">' +
        '<span><strong>' + esc(x.label) + '</strong><small>' + x.authors + '명 · ' + esc(x.pub) + '</small></span></a>';
    }).join('');
    s.innerHTML =
      '<div class="sh-linksview">' +
        '<div class="vhead"><h2>링크</h2>' +
          '<div class="seg sh-linkseg" role="tablist" aria-label="링크 묶음">' +
            '<button type="button" role="tab" data-lp="buy" aria-selected="true">책</button>' +
            '<button type="button" role="tab" data-lp="acc" aria-selected="false">공식 계정</button>' +
            '<button type="button" role="tab" data-lp="share" aria-selected="false">나누기</button>' +
          '</div></div>' +
        '<div class="sh-linkpanes">' +
          '<div class="card sh-pane is-on" data-pane="buy"><h3 class="sh-h3">책 구매 링크</h3>' +
            '<div class="sh-share sh-buyurl"><code>' + esc(b.buy.url.replace(/^https?:\/\//, '')) + '</code><button type="button" class="btn btn-dark btn-small" id="buyCopy">' + icon('copy') + '복사</button></div>' +
            stores +
            (b.stores.some(function (st) { return st.url; }) ? '' : '<p class="note sh-storenote">지금은 서점 검색 결과로 이어져요. 책 페이지가 열리면 그 주소로 바로 가게 바꿔 둘게요.</p>') +
            '<h3 class="sh-h3 sh-h3b">먼저 나온 세 권</h3><div class="sh-backs">' + back + '</div></div>' +
          '<div class="card sh-pane" data-pane="acc"><h3 class="sh-h3">공식 계정</h3><p class="note sh-accnote">글에 태그하거나 소식을 확인할 때 쓰세요.</p>' + accounts + '</div>' +
          '<div class="card sh-pane" data-pane="share"><h3 class="sh-h3">이 키트 나누기</h3>' +
            '<p class="note">다른 저자분께 이 주소만 보내면 돼요.</p>' +
            '<div class="sh-share"><code>' + esc(EDU.site.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</code>' +
              '<button type="button" class="btn btn-dark btn-small" id="copySite">' + icon('copy') + '주소 복사</button></div>' +
            '<button type="button" class="btn btn-line btn-block" id="shareSite">' + icon('share') + '카카오톡 · 메시지로 보내기</button>' +
            '<div class="sh-about">' +
              '<button type="button" class="btn btn-ghost btn-small" data-help>' + icon('help') + '사용 방법</button>' +
              '<button type="button" class="btn btn-ghost btn-small js-eggcount"></button>' +
            '</div>' +
            '<p class="sh-fine">표지와 홍보 그림의 권리는 출판사와 집필팀에 있어요. 책 홍보에만 써 주세요. TIO는 (사)교사크리에이터협회의 캐릭터예요. 키트 만든 사람 두목쿼카.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
    s.addEventListener('click', function (e) {
      var t = e.target.closest('[data-lp]');
      if (t) {
        $$('[data-lp]', s).forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
        $$('[data-pane]', s).forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-pane') === t.getAttribute('data-lp')); });
      }
      if (e.target.closest('[data-help]')) help();
      var a = e.target.closest('a[data-app]');
      if (a && EDU.env.mobile) { e.preventDefault(); U.openApp(a.getAttribute('data-app'), a.href); }
    });
    $('#copySite').addEventListener('click', function () { U.copy(EDU.site, '주소를 복사했어요'); });
    $('#buyCopy').addEventListener('click', function () { U.copy(EDU.book.buy.url, '구매 링크를 복사했어요'); });
    $('#shareSite').addEventListener('click', function () {
      var data = { title: '2027 대한민국 미래 교육 트렌드 · 저자 홍보 키트', text: '2027 미래 교육 트렌드 저자 홍보 키트예요. 내 이름 넣은 카드랑 글감을 바로 받을 수 있어요.', url: EDU.site };
      if (navigator.share) navigator.share(data).catch(function () {});
      else U.copy(data.text + '\n' + data.url, '소개 글과 주소를 복사했어요');
    });
  }

  /* ---------------- footer bar (desktop) ---------------- */
  function footer() {
    $('#siteFooter').innerHTML =
      '<span><a class="sh-footbuy" href="' + esc(EDU.book.buy.url) + '" target="_blank" rel="noopener">' + bookIco() + '<b>2027 대한민국 미래 교육 트렌드</b><em>구매 링크' + icon('arrow-up-right') + '</em></a> · 미래 교육 집필팀 · 뜨인돌</span>' +
      '<span class="sh-footsp"></span>' +
      '<span>저자 홍보 키트 · 만든 사람 두목쿼카</span>' +
      '<button type="button" class="sh-egghunt js-eggcount"></button>' +
      '<button type="button" id="footHelp">사용 방법' + icon('arrow-up-right') + '</button>';
    $('#footHelp').addEventListener('click', help);
  }

  function init() { header(); me(); links(); footer(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
