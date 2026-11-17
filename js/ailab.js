/* 2027 미래 교육 트렌드 홍보 키트 — AI로 만들기: 재료 저장 → 프롬프트 복사 → AI에 붙여넣기. prefix: ai- */
(function () {
  'use strict';
  var EDU = window.EDU, U = EDU.util, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon;
  var SKEY = 'edutrend.ailab.v1', state = { kind: U.store.get(SKEY, 'img') };

  /* ---------- AI 서비스 ---------- */
  var TOOLS = {
    chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com/', how: '＋ 버튼으로 재료 사진을 올리고 붙여넣어요' },
    gemini: { name: 'Gemini', url: 'https://gemini.google.com/app', how: '＋ 버튼으로 재료 사진을 올리고 붙여넣어요' },
    miricle: { name: '미리캔버스', url: 'https://www.miricanvas.com/ko/miricle/ai-video-generator', how: '미리클 AI ‘동영상 만들기’예요. ‘이미지 업로드’에 재료를 넣고 아래 칸에 붙여넣어요' },
    kling: { name: 'Kling', url: 'https://klingai.com/', how: 'Image to Video에 재료를 올리고 붙여넣어요' },
    higgsfield: { name: '힉스필드', url: 'https://higgsfield.ai/', how: 'Video에서 재료를 첫 장면으로 올리고 붙여넣어요' },
    suno: { name: 'Suno', url: 'https://suno.com/', how: 'Create의 음악 설명 칸에 붙여넣어요' }
  };
  var KINDS = [
    { id: 'img', name: '그림', note: 'AI가 표지 글자를 틀리게 다시 쓸 때가 있어요. 그러면 “표지는 첨부한 사진 그대로 써 주세요”라고 한 번 더 말해 보세요.' },
    { id: 'vid', name: '영상', note: 'AI 영상은 움직이는 동안 작은 글자가 흐려질 수 있고, 만들 때마다 서비스 크레딧이 들어요. 글자까지 또렷한 영상은 진열대의 ‘통통 튀는 책’을 받아 쓰세요.' },
    { id: 'snd', name: '음악', note: '완성된 음악은 릴스·쇼츠를 편집할 때 배경으로 깔아요.' }
  ];

  /* ---------- 재료 (이 사이트에 있는 파일) ---------- */
  function mats(p) {
    var A = window.EDU_ASSETS || { covers: {} }, c = A.covers || {}, kw = EDU.currentKeyword(p), out = {};
    out.book3dw = { name: '입체 표지 · 흰 바탕', pv: 'assets/covers/book3d.webp', hd: 'assets/covers/book3d-white.jpg', meta: c.book3dWhite, filename: '2027미래교육트렌드_입체표지_흰바탕.jpg' };
    out.flat = { name: '평면 표지', pv: 'assets/covers/2027.webp', hd: 'assets/covers/2027.jpg', meta: c['2027'], filename: '2027미래교육트렌드_표지.jpg' };
    if (kw && kw.id !== 'custom') {
      out.kwart = { name: kw.name + ' 그림', pv: 'assets/promo/kw/' + kw.id + '-profile.pv.webp', hd: 'assets/promo/kw/' + kw.id + '-profile.png', meta: { w: 2160, h: 2160 }, filename: '2027미래교육트렌드_' + (kw.tag || kw.name).replace(/\s+/g, '') + '_그림.png' };
      out.kwposter = { name: kw.name + ' 포스터', pv: 'assets/promo/kw/' + kw.id + '-4x5.pv.webp', hd: 'assets/promo/kw/' + kw.id + '-4x5.png', meta: { w: 2160, h: 2700 }, filename: '2027미래교육트렌드_' + (kw.tag || kw.name).replace(/\s+/g, '') + '_피드4x5.png' };
    }
    return out;
  }

  /* ---------- 프롬프트 ---------- */
  var KEEP = '책 표지는 첨부한 사진과 똑같이 써 주세요. 표지의 글자·색·그림을 바꾸거나 새로 쓰지 마세요.';
  var RECIPES = [
    { id: 'i1', kind: 'img', title: '책을 든 내 캐릭터', use: '표지를 든 선생님 캐릭터 한 장', mats: ['book3dw'], tools: ['chatgpt', 'gemini'], lines: [
      '첨부한 책 사진을 그대로 써서 그림을 한 장 그려 주세요.', '',
      '[그릴 것]',
      '- 이 책을 두 손으로 들고 활짝 웃는 선생님 캐릭터 한 명',
      '- 캐릭터 모습: [예: 단발머리, 동그란 안경, 남색 카디건]',
      '- ' + KEEP, '',
      '[그림 결]',
      '- 굵은 검정 선과 단순한 면으로 그린 깔끔한 2D 그림',
      '- 색은 하늘빛 파랑(#00A2D3), 검정, 흰색 세 가지만',
      '- 배경은 깨끗한 흰색, 책 주변에 네 갈래 별 반짝이 서너 개',
      '- 크기: 세로 4:5', '',
      '[하지 말 것]',
      '- 표지 말고 다른 곳에 글자를 넣지 마세요.',
      '- 실제 사람 사진처럼 그리지 마세요.'] },
    { id: 'i2', kind: 'img', title: '교실 책상 위의 책', use: '사진처럼 보이는 홍보 컷', mats: ['book3dw'], tools: ['chatgpt', 'gemini'], lines: [
      '첨부한 책 사진으로 홍보용 사진을 한 장 만들어 주세요.', '',
      '[장면]',
      '- 아침 햇살이 드는 교실 창가 책상 위에 이 책이 세워져 있어요.',
      '- 옆에는 연필 몇 자루와 머그잔 하나. 사람은 나오지 않아요.',
      '- 책이 주인공이에요. 화면 가운데에 크게 놓아 주세요.', '',
      '[꼭 지켜 주세요]',
      '- ' + KEEP,
      '- 표지 말고 다른 글자(칠판 글씨, 간판, 로고)는 넣지 마세요.',
      '- 크기: 세로 4:5. 실제 사진처럼 자연스럽게.'] },
    { id: 'i3', kind: 'img', title: '내 키워드 한 컷', use: '표지와 같은 결로 그리는 새 그림', mats: ['kwart', 'flat'], tools: ['chatgpt', 'gemini'], lines: [
      '첨부한 그림과 같은 결로 ‘{키워드}’{을} 보여 주는 새 그림을 한 장 그려 주세요.', '',
      '[그림 결: 첨부한 그림 그대로]',
      '- 굵은 검정 테두리 선, 흰색으로 채운 단순한 사물',
      '- 바탕은 하늘빛 파랑(#00A2D3) 한 가지',
      '- 네 갈래 별 반짝이 두세 개(흰색, 검정)',
      '- 그림자·그라데이션·입체 효과 없이 납작하게', '',
      '[그릴 것]',
      '- ‘{키워드}’ 하면 떠오르는 교실 장면이나 물건 하나: [예: 내 원고에 나오는 장면을 한 줄로]',
      '- 사람 얼굴은 그리지 않아요.', '',
      '[하지 말 것]',
      '- 글자, 숫자, 로고를 넣지 마세요.',
      '- 크기: 정사각형 1:1'] },
    { id: 'i4', kind: 'img', title: '카드뉴스 배경', use: '글자를 얹을 빈 배경 한 장', mats: ['flat'], tools: ['chatgpt', 'gemini'], lines: [
      '인스타그램 카드뉴스 배경으로 쓸 그림을 한 장 만들어 주세요. 글자는 제가 나중에 얹을 거예요.', '',
      '[모양]',
      '- 세로 4:5. 위 3분의 2는 하늘빛 파랑(#00A2D3), 아래 3분의 1은 검정(#060606)으로 나뉜 납작한 면',
      '- 파란 면 가장자리에 흰색·검정 네 갈래 별 반짝이 몇 개',
      '- 파란 면 아래쪽에 펼친 책을 굵은 검정 곡선 몇 줄로 단순하게',
      '- 가운데는 글자를 얹을 수 있게 넓게 비워 주세요.', '',
      '[하지 말 것]',
      '- 글자, 숫자, 로고를 넣지 마세요.',
      '- 그라데이션·그림자·사진 느낌 없이 납작하게.', '',
      '첨부한 책 표지의 색과 분위기를 참고해 주세요.'] },
    { id: 'i5', kind: 'img', title: '프사용 캐릭터', use: '동그랗게 잘려도 예쁜 프로필 그림', mats: ['book3dw'], tools: ['chatgpt', 'gemini'], lines: [
      '카카오톡·인스타그램 프로필 사진으로 쓸 그림을 한 장 그려 주세요.', '',
      '- 첨부한 책을 품에 안고 웃는 선생님 캐릭터 상반신: [예: 묶은 머리, 줄무늬 셔츠]',
      '- 동그랗게 잘려도 얼굴과 책이 다 보이게 가운데로 모아 주세요.',
      '- 바탕은 하늘빛 파랑(#00A2D3) 한 가지, 굵은 검정 선의 단순한 2D 그림',
      '- ' + KEEP,
      '- 다른 글자는 넣지 않아요.',
      '- 크기: 정사각형 1:1'] },

    { id: 'v1', kind: 'vid', title: '통통 튀는 책', use: '제자리에서 세 번 튀고 별이 톡톡', mats: ['book3dw'], tools: ['miricle', 'kling', 'higgsfield'], lines: [
      '깨끗한 흰색 스튜디오 배경, 카메라 고정, 고화질.',
      '책은 회전하거나 기울지 않고 처음 이미지의 각도를 그대로 유지한다.',
      '제자리에서 위아래로 통통 세 번 가볍고 귀엽게 튀고, 착지할 때 아주 살짝 눌렸다 펴진다. 바닥 그림자도 함께 커졌다 작아진다.',
      '책 주변에 작은 네 갈래 별 반짝이가 톡톡 나타났다 사라진다.',
      '표지의 글자와 디자인은 한 글자도 바꾸거나 뭉개지 않고 처음 이미지와 똑같이 선명하게 유지한다.',
      '다른 사물, 사람, 손은 나오지 않는다.'] },
    { id: 'v2', kind: 'vid', title: '별이 반짝이는 표지', use: '표지 그림이 살아 움직이는 5초', mats: ['flat'], tools: ['miricle', 'kling', 'higgsfield'], lines: [
      '첨부한 책 표지 그림이 화면에 꽉 찬 채 그대로 있다. 카메라는 움직이지 않는다.',
      '표지에 있는 네 갈래 별들이 차례로 반짝이고, 작은 별 몇 개가 위에서 아래로 천천히 떨어진다.',
      '가운데 펼친 책 곡선이 숨 쉬듯 아주 살짝 위아래로 움직인다.',
      '표지의 글자와 색은 한 글자도 바꾸거나 뭉개지 않고 처음 그대로 또렷하게 유지한다.',
      '새 글자나 사물은 나오지 않는다. 처음과 끝이 같은 모습으로 이어진다.'] },
    { id: 'v3', kind: 'vid', title: '천천히 다가오는 책', use: '빛이 한 번 스치는 차분한 5초', mats: ['book3dw'], tools: ['miricle', 'kling', 'higgsfield'], lines: [
      '깨끗한 흰색 스튜디오. 책은 가만히 서 있다. 회전하거나 넘어지지 않는다.',
      '카메라가 책 쪽으로 아주 천천히 다가간다(살짝 확대되는 정도).',
      '부드러운 빛이 표지를 왼쪽에서 오른쪽으로 한 번 스치고 지나간다.',
      '표지의 글자와 그림은 처음 그대로 또렷하게 유지한다.',
      '다른 물건, 사람, 손, 새 글자는 나오지 않는다.'] },
    { id: 'v4', kind: 'vid', title: '책상에 톡 놓이는 책', use: '위에서 내려와 한 번 튀고 자리 잡기', mats: ['book3dw'], tools: ['miricle', 'kling', 'higgsfield'], lines: [
      '밝은 나무 책상 위, 카메라 고정.',
      '책이 화면 위에서 가볍게 내려와 통 하고 한 번 튀고 자리를 잡는다. 책의 각도는 처음 이미지 그대로다.',
      '내려앉을 때 작은 네 갈래 별 반짝이가 주변에 톡 터졌다 사라진다.',
      '표지의 글자와 디자인은 한 글자도 바꾸거나 뭉개지 않고 처음 이미지와 똑같이 유지한다.',
      '사람과 손은 나오지 않는다.'] },
    { id: 'v5', kind: 'vid', title: '내 키워드 그림 움직이기', use: '포스터 속 그림이 까딱까딱', mats: ['kwart', 'kwposter'], tools: ['miricle', 'kling', 'higgsfield'], lines: [
      '첨부한 그림을 5초짜리 움직이는 그림으로 만든다. 카메라는 움직이지 않는다.',
      '그림 속 사물이 제자리에서 살짝살짝 움직인다(까딱이거나 통통 튀는 정도).',
      '별 반짝이가 번갈아 깜빡인다.',
      '색, 선 굵기, 그림 결, 글자는 처음 그대로 유지한다. 새 사물이나 글자를 더하지 않는다.',
      '처음과 끝이 같은 모습으로 이어진다.'] },

    { id: 's1', kind: 'snd', title: '릴스 배경음악', use: '가사 없는 밝은 15초', mats: [], tools: ['suno'], lines: [
      '밝고 깔끔한 15초 배경음악. 가사와 목소리 없이 연주만.',
      '경쾌한 마림바와 손뼉, 가벼운 베이스. 템포 100~110.',
      '새 책을 소개하는 짧은 교육 영상에 어울리게, 처음부터 바로 리듬이 시작되고 끝은 한 박자로 딱 떨어지게.'] }
  ];

  /* 을/를 */
  function batchim(w) { var c = String(w).replace(/[^가-힣0-9A-Za-z]+$/, '').slice(-1), k = c.charCodeAt(0); if (k >= 0xAC00 && k <= 0xD7A3) return (k - 0xAC00) % 28 !== 0; return /[013678LMNRlmnr]/.test(c); }
  function promptText(r, p) {
    var kw = EDU.currentKeyword(p), name = kw ? kw.name : '[내 키워드]';
    return r.lines.join('\n').replace(/\{키워드\}/g, name).replace(/\{을\}/g, batchim(name) ? '을' : '를');
  }
  function matsOf(r, p) { var all = mats(p); return r.mats.map(function (id) { return all[id]; }).filter(Boolean); }

  /* ---------- 화면 ---------- */
  var root;
  function build() {
    root = document.getElementById('ailab');
    if (!root) return;
    root.innerHTML =
      '<div class="ai-root">' +
        '<div class="vhead ai-head"><h2>AI로 만들기</h2><button type="button" class="ai-textlink" data-go="prompts">글 쓰는 프롬프트 ' + icon('chev-right') + '</button></div>' +
        '<ol class="ai-steps" aria-label="순서"><li><b>1</b>재료 저장</li><li><b>2</b>프롬프트 복사</li><li><b>3</b>AI에 붙여넣기</li></ol>' +
        '<div class="seg ai-kinds" role="tablist" aria-label="만들 것">' + KINDS.map(function (k) {
          return '<button type="button" role="tab" data-kind="' + k.id + '">' + k.name + '<small>' + RECIPES.filter(function (r) { return r.kind === k.id; }).length + '</small></button>';
        }).join('') + '</div>' +
        '<div class="ai-list" id="aiList"></div>' +
      '</div>';
    root.addEventListener('click', function (e) {
      var k = e.target.closest('[data-kind]'), r = e.target.closest('[data-recipe]'), g = e.target.closest('[data-go]');
      if (k) { state.kind = k.getAttribute('data-kind'); U.store.set(SKEY, state.kind); paint(); }
      else if (r) open(r.getAttribute('data-recipe'));
      else if (g) { e.preventDefault(); U.goTo(g.getAttribute('data-go')); }
    });
    paint();
  }
  function thumb(r, p) {
    var m = matsOf(r, p)[0];
    if (!m) return '<span class="ai-th is-icon">' + icon(r.kind === 'snd' ? 'play' : 'wand') + '</span>';
    return '<span class="ai-th' + (m.ground ? ' is-ground' : '') + '"><img src="' + esc(m.pv) + '" alt="" decoding="async" loading="lazy"></span>';
  }
  function paint() {
    if (!root) return;
    if (!KINDS.some(function (k) { return k.id === state.kind; })) state.kind = 'img';
    $$('[data-kind]', root).forEach(function (b) { var on = b.getAttribute('data-kind') === state.kind; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
    var p = EDU.getProfile(), list = RECIPES.filter(function (r) { return r.kind === state.kind; }), kind = KINDS.filter(function (k) { return k.id === state.kind; })[0];
    $('#aiList', root).innerHTML = list.map(function (r) {
      return '<button type="button" class="ai-row" data-recipe="' + r.id + '">' + thumb(r, p) +
        '<span class="ai-rt"><strong>' + esc(r.title) + '</strong><em>' + esc(r.use) + '</em></span>' +
        '<span class="ai-tools">' + r.tools.map(function (t) { return TOOLS[t].name; }).slice(0, 2).join(' · ') + '</span>' + icon('chev-right') + '</button>';
    }).join('') + '<p class="ai-note">' + icon('info') + '<span>' + esc(kind.note) + '</span></p>';
  }

  function open(id) {
    var r = RECIPES.filter(function (x) { return x.id === id; })[0]; if (!r) return;
    var p = EDU.getProfile(), ms = matsOf(r, p), text = promptText(r, p);
    var needKw = r.mats.some(function (m) { return m.indexOf('kw') === 0; }) && !mats(p).kwart, hasBlank = /\[예: /.test(text);
    var html =
      '<div class="ai-sheet-body">' +
        '<h3 class="ai-title">' + esc(r.title) + '</h3>' +
        (ms.length || needKw ? '<section class="ai-sec"><p class="ai-lab"><b>1</b>재료 저장' + (ms.length ? '<small>AI에 올릴 사진이에요</small>' : '') + '</p>' +
          (needKw ? '<button type="button" class="ai-need" data-me>' + icon('pen') + '내 키워드를 고르면 내 그림이 재료로 나와요' + icon('chev-right') + '</button>' : '') +
          '<div class="ai-mats">' + ms.map(function (m, i) {
            return '<button type="button" class="ai-mat" data-mat="' + i + '"><span class="ai-th' + (m.ground ? ' is-ground' : '') + '"><img src="' + esc(m.pv) + '" alt=""></span><span><strong>' + esc(m.name) + '</strong><em>' + icon('download') + '저장</em></span></button>';
          }).join('') + '</div></section>' : '') +
        '<section class="ai-sec"><p class="ai-lab"><b>' + (ms.length || needKw ? 2 : 1) + '</b>프롬프트 복사' + (hasBlank ? '<small>[ ] 안은 내 이야기로 바꿔요</small>' : '') + '</p>' +
          '<div class="ai-prompt" tabindex="0">' + esc(text).replace(/\[(예: [^\]]+)\]/g, '<mark>[$1]</mark>') + '</div>' +
          '<button type="button" class="btn btn-dark btn-block" data-copy>' + icon('copy') + '프롬프트 복사</button></section>' +
        '<section class="ai-sec"><p class="ai-lab"><b>' + (ms.length || needKw ? 3 : 2) + '</b>AI에 붙여넣기<small>누르면 복사하고 새 창으로 열어요</small></p>' +
          '<div class="ai-open">' + r.tools.map(function (t) { return '<a class="btn btn-line" href="' + TOOLS[t].url + '" target="_blank" rel="noopener" data-tool="' + t + '">' + esc(TOOLS[t].name) + icon('arrow-up-right') + '</a>'; }).join('') + '</div>' +
          '<p class="ai-how" id="aiHow">' + esc(TOOLS[r.tools[0]].how) + '</p></section>' +
      '</div>';
    var d = U.sheet('AI로 만들기', html, 'ai-sheet');
    d.addEventListener('click', function (e) {
      var m = e.target.closest('[data-mat]'), c = e.target.closest('[data-copy]'), t = e.target.closest('[data-tool]'), me = e.target.closest('[data-me]');
      if (m) { var x = ms[+m.getAttribute('data-mat')], mt = x.meta || {}; U.saveSheet({ title: x.name, filename: x.filename, url: x.hd, preview: x.pv, w: mt.w, h: mt.h, bytes: mt.bytes, kind: 'image' }); }
      else if (c) U.copy(text, '프롬프트를 복사했어요');
      else if (t) { var tool = TOOLS[t.getAttribute('data-tool')]; U.copy(text, '복사했어요. ' + tool.name + '에 붙여넣으세요'); $('#aiHow', d).textContent = tool.how; }
      else if (me) { d.close(); U.goTo('me'); }
    });
  }

  EDU.ailab = { open: open, recipes: RECIPES, prompt: function (id, p) { var r = RECIPES.filter(function (x) { return x.id === id; })[0]; return r ? promptText(r, p || EDU.getProfile()) : ''; } };
  document.addEventListener('DOMContentLoaded', build);
  window.addEventListener('edu:profile', paint);
})();
