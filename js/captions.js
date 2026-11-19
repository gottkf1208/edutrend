/* 2027 미래 교육 트렌드 홍보 키트 — 글감 뷰: SNS에 올릴 글 · 해시태그 · AI 프롬프트 (prefix cp- / pr-)
   글자는 js/copy-data.js(window.EDU_COPY)에 있고, 여기서는 조립과 화면만 맡는다.
   EDU.captions = { build(platform, mood, variant[, opts]) -> {text, tags, …}, showTab('caption'|'prompts'), … } */
(function () {
  'use strict';
  var EDU = (window.EDU = window.EDU || {});
  var C = window.EDU_COPY || {};
  var KEY = 'edutrend.captions.v1';
  /** 저자가 구매 링크를 비워 두면 쓰는 책 주소(YES24 책 페이지) */
  function buyUrl() { var b = EDU.book || {}; return (b.buy && b.buy.url) || ''; }

  /* ================================================================
     1. 글 조립 (화면 없이도 돈다 — build/captions_dump.js가 그대로 불러 쓴다)
     ================================================================ */

  /* ---------- 조사 ---------- */
  var JOSA = { '은': ['은', '는'], '이': ['이', '가'], '을': ['을', '를'], '과': ['과', '와'], '으로': ['으로', '로'],
    '이에요': ['이에요', '예요'], '이었': ['이었', '였'], '이라': ['이라', '라'] };
  var DIGIT = { 0: 1, 1: 2, 2: 0, 3: 1, 4: 0, 5: 0, 6: 1, 7: 2, 8: 2, 9: 0 };   // 영 일 이 삼 사 오 육 칠 팔 구
  /** 마지막 글자의 받침: 0 없음, 1 있음, 2 ㄹ받침, -1 알 수 없음 */
  function batchim(str) {
    var s = String(str == null ? '' : str).replace(/[\s’‘”“"'」』》〉)\]}.,!?~…·:;]+$/g, '');
    if (!s) return -1;
    var ch = s.charAt(s.length - 1), code = ch.charCodeAt(0);
    if (code >= 0xAC00 && code <= 0xD7A3) { var j = (code - 0xAC00) % 28; return j === 0 ? 0 : j === 8 ? 2 : 1; }
    if (/[0-9]/.test(ch)) return DIGIT[ch];
    if (/[A-Za-z]/.test(ch)) {
      if (ch === ch.toUpperCase()) return /[LR]/.test(ch) ? 2 : /[MN]/.test(ch) ? 1 : 0;   // 엘 알 / 엠 엔 / 나머지는 받침 없이 읽는다
      var w = (s.match(/[A-Za-z]+$/) || [''])[0].toLowerCase();
      if (/(le|l)$/.test(w)) return 2;                 // 구글, 메일
      if (/(ng|me|ne|m|n)$/.test(w)) return 1;         // 러닝, 타임, 라인, 줌
      if (/[bckpt]$/.test(w)) return 1;                // 웹, 매직, 북, 앱, 챗
      return 0;                                        // 캔바, 패드, 블로그, 박스 …
    }
    return -1;
  }
  function josa(prev, key) {
    var pair = JOSA[key]; if (!pair) return '';
    var b = batchim(prev);
    if (b === -1) return key === '으로' ? '(으)로' : pair[0] + '(' + pair[1] + ')';
    if (key === '으로') return b === 1 ? '으로' : '로';
    return b === 0 ? pair[1] : pair[0];
  }

  /* ---------- 값 다듬기 ---------- */
  function clean(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function sentence(s) { s = clean(s); return s && !/[.!?…~。”’"')\]]$/.test(s) ? s + '.' : s; }
  function cleanTag(s) { return String(s == null ? '' : s).replace(/[^0-9A-Za-z_ㄱ-ㆎ가-힣]/g, ''); }
  function orgTag(org) {
    var parts = clean(org).split(' ').filter(Boolean), i;
    for (i = 0; i < parts.length; i++) {
      if (/(학교|유치원|교육청|교육지원청|교육원|연수원|대학|대학원|연구소|연구원|연구회|협회|센터|재단|학회)$/.test(parts[i])) return cleanTag(parts.slice(0, i + 1).join(''));
    }
    return cleanTag(parts.join(''));
  }
  function keywordOf(p) {
    if (EDU.currentKeyword) return EDU.currentKeyword(p);
    var list = (window.EDU_ASSETS && window.EDU_ASSETS.keywords) || [], i;
    if (p.kw && p.kw !== 'custom') { for (i = 0; i < list.length; i++) if (list[i].id === p.kw) return list[i]; }
    if (p.kw === 'custom' && clean(p.kwCustom)) return { id: 'custom', name: p.kwCustom, tag: String(p.kwCustom).replace(/\s+/g, '') };
    return null;
  }
  /** 글과 태그에 넣을 주제. 직접 쓴 키워드가 ‘들어가며’ 같은 자리 이름이면 주제로 쓰지 않는다. */
  function topicOf(kw) {
    if (!kw || !clean(kw.name)) return null;
    if (kw.id === 'custom' && (C.notTopic || []).indexOf(clean(kw.name)) >= 0) return null;
    return kw;
  }
  /** 문장에 넣을 값들. 비어 있는 값은 '' → 그 값을 쓰는 문장이 빠진다. */
  function varsOf(profile, kw) {
    var p = profile || {}, link = clean(p.link) || buyUrl();   // 비워 두면 YES24 책 주소
    kw = topicOf(kw);
    return {
      '이름': clean(p.name), '소속': clean(p.org), '키워드': kw ? clean(kw.name) : '', '한줄': sentence(p.line),
      '아이디': clean(p.handle), '주소': link, '링크': link || C.linkFallback, '책': C.book,
      '표지': kw && kw.id !== 'custom' ? '1' : ''
    };
  }

  /* ---------- 문장 채우기 ---------- */
  /** 한 문장을 채운다. 빠진 값이 있으면 null. */
  function fill(tpl, vars, emoji) {
    var miss = false;
    var s = String(tpl).replace(/\{\?([^}]+)\}/g, function (m, k) { if (!vars[k]) miss = true; return ''; });
    if (miss) return null;
    s = s.replace(/\s*\{:([^}]+)\}/g, function (m, e) { return emoji ? ' ' + e : ''; });
    var out = '', re = /\{([^{}|]+)(?:\|([^{}]*))?\}/g, last = 0, m;
    while ((m = re.exec(s))) {
      out += s.slice(last, m.index); last = re.lastIndex;
      var k = m[1];
      if (JOSA[k]) out += josa(out, k);
      else if (Object.prototype.hasOwnProperty.call(vars, k)) {
        if (vars[k]) out += vars[k];
        else if (m[2] != null) out += '[' + m[2] + ']';       // 프롬프트의 빈칸
        else return null;
      } else out += m[0];
    }
    return (out + s.slice(last)).replace(/[ \t]{2,}/g, ' ').trim();
  }
  /** 문장 = 문자열 또는 후보 배열 → 값이 다 있는 첫 후보 */
  function pick(item, vars, emoji) {
    var alts = Array.isArray(item) ? item : [item], i, r;
    for (i = 0; i < alts.length; i++) { r = fill(alts[i], vars, emoji); if (r != null) return r; }
    return null;
  }
  function lines(items, vars, emoji) {
    return (items || []).map(function (it) { return pick(it, vars, emoji); }).filter(function (x) { return x; });
  }
  function shortOrMedium(variant, vars, emoji, sep) {
    return variant.map(function (para) { return lines(para, vars, emoji).join(' '); }).filter(Boolean).join(sep);
  }
  function numbered(arr) { return arr.map(function (t, i) { return (i + 1) + '. ' + t; }).join('\n'); }
  function longText(v, vars, emoji) {
    var L = C.longLabels, outline = lines(v.outline, vars, emoji), tail = lines(C.longTail, vars, emoji);
    return [
      L.titles + '\n' + numbered(lines(v.titles, vars, emoji)),
      L.open + '\n' + lines(v.open, vars, emoji).join(' '),
      L.outline + '\n' + numbered(outline.concat([L.info])) + '\n' + tail.join('\n')
    ].join('\n\n');
  }

  function byId(list, id) { for (var i = 0; i < (list || []).length; i++) if (list[i].id === id) return list[i]; return null; }
  function platformOf(id) { return byId(C.platforms, id) || C.platforms[0]; }
  function moodOf(id) { return byId(C.moods, id) || C.moods[0]; }

  /* ---------- 해시태그 ---------- */
  function uniq(a) { var seen = {}; return a.filter(function (t) { if (!t || t === '#' || seen[t]) return false; seen[t] = 1; return true; }); }
  /** 묶음별 태그 목록: [{id, name, tags[]}] */
  function tagGroups(profile, kw, custom) {
    var T = C.tags, kwTags = [], me = [], p = profile || {};
    kw = topicOf(kw);
    if (kw) kwTags = ['#' + cleanTag(kw.tag || kw.name)].concat(T.kw[kw.id] || []);
    if (clean(p.name)) me.push('#' + cleanTag(p.name));
    if (clean(p.org)) me.push('#' + orgTag(p.org));
    me = me.concat(custom || []);
    return [
      { id: 'book', name: T.groups.book, tags: T.book.slice() },
      { id: 'kw', name: T.groups.kw, tags: uniq(kwTags) },
      { id: 'reader', name: T.groups.reader, tags: T.reader.slice() },
      { id: 'me', name: T.groups.me, tags: uniq(me) }
    ];
  }
  function recommended(platformId, groups) {
    var d = platformOf(platformId).tags || {}, on = {};
    (d.book || []).forEach(function (i) { if (groups[0].tags[i]) on[groups[0].tags[i]] = 1; });
    groups[1].tags.slice(0, d.kw || 0).forEach(function (t) { on[t] = 1; });
    (d.reader || []).forEach(function (t) { on[t] = 1; });
    // 키워드가 없어서 태그가 하나뿐이면 책 태그를 하나 더 붙인다
    if (!groups[1].tags.length && (d.book || []).length === 1 && groups[0].tags[1]) on[groups[0].tags[1]] = 1;
    return on;
  }
  /** 고른 태그(추천 + 직접 켜고 끈 것). 책 → 내 키워드 → 읽을 사람 → 나 순서 */
  function selectedTags(platformId, groups, ov) {
    var rec = recommended(platformId, groups), out = [];
    ov = ov || {};
    groups.forEach(function (g) { g.tags.forEach(function (t) { if (ov[t] != null ? ov[t] : rec[t]) out.push(t); }); });
    return uniq(out);
  }

  /* ---------- X 글자 수 (가중치: 한글·이모지 2, 주소 23) ---------- */
  function xWeight(s) {
    var n = 0;
    s = String(s || '').replace(/https?:\/\/[^\s]+/g, function () { n += 23; return ''; });
    Array.from(s).forEach(function (ch) {
      var c = ch.codePointAt(0);
      n += (c <= 0x10FF || (c >= 0x2000 && c <= 0x200D) || (c >= 0x2010 && c <= 0x201F) || (c >= 0x2032 && c <= 0x2037)) ? 1 : 2;
    });
    return n;
  }
  function join(text, tagText) { return tagText ? text + '\n\n' + tagText : text; }

  /* ---------- 상태(저장) ---------- */
  var store = (EDU.util && EDU.util.store) || { get: function (k, d) { return d; }, set: function () {} };
  var S = { platform: 'ig', mood: 'spoiler', emoji: false, vi: {}, tagOv: {}, custom: [] };
  (function load() {
    var saved = store.get(KEY, null);
    if (!saved || typeof saved !== 'object') return;
    if (byId(C.platforms, saved.platform)) S.platform = saved.platform;
    if (byId(C.moods, saved.mood)) S.mood = saved.mood;
    S.emoji = !!saved.emoji;
    if (saved.vi && typeof saved.vi === 'object') S.vi = saved.vi;
    if (saved.tagOv && typeof saved.tagOv === 'object') S.tagOv = saved.tagOv;
    if (Array.isArray(saved.custom)) S.custom = saved.custom.filter(function (t) { return typeof t === 'string'; }).slice(0, 12);
  })();
  function save() { store.set(KEY, S); }

  /**
   * build(platform, mood, variant[, opts]) → { text, tags[], tagText, tagComma, full, len, variant, variants, weight }
   * opts(모두 선택): { profile, keyword, emoji, tagOv, custom } — 없으면 지금 저장된 내 정보와 화면 상태를 쓴다.
   */
  function build(platformId, moodId, variant, opts) {
    opts = opts || {};
    var profile = opts.profile || (EDU.getProfile ? EDU.getProfile() : {});
    var kw = opts.keyword !== undefined ? opts.keyword : keywordOf(profile);
    var emoji = opts.emoji != null ? !!opts.emoji : S.emoji;
    var P = platformOf(platformId || S.platform), M = moodOf(moodId || S.mood);
    var list = ((C.captions[M.id] || {})[P.len]) || [];
    var n = list.length || 1, i = ((parseInt(variant, 10) || 0) % n + n) % n;
    var vars = varsOf(profile, kw), v = list[i], text = '';
    if (v) text = P.len === 'long' ? longText(v, vars, emoji) : shortOrMedium(v, vars, emoji, P.len === 'short' ? '\n' : '\n\n');
    var groups = tagGroups(profile, kw, opts.custom || S.custom);
    var tags = selectedTags(P.id, groups, opts.tagOv || S.tagOv);
    if (P.id === 'linkedin' && C.linkedinEn) {            // 링크드인은 영어로
      var E = C.linkedinEn, kwEn = kw ? (C.kwEn[kw.id] || '‘' + clean(kw.name) + '’') : '', url = clean(profile.link) || buyUrl();
      n = E.variants.length; i = ((parseInt(variant, 10) || 0) % n + n) % n;
      text = E.variants[i].map(function (ln) {
        var t = typeof ln === 'string' ? ln : (kwEn ? ln[0] : ln[1]);
        return t.replace('{kw}', kwEn).replace('{book}', E.book).replace('{link}', url || E.linkFallback);
      }).join('\n\n');
      tags = E.tags.slice(0, 3).concat(kw && C.kwEnTag[kw.id] ? [C.kwEnTag[kw.id]] : []);
    }
    var tagText = tags.join(' ');
    return { platform: P.id, mood: M.id, len: P.len, variant: i, variants: n, text: text, tags: tags, tagText: tagText,
      tagComma: tags.map(function (t) { return t.slice(1); }).join(', '), full: join(text, tagText), weight: xWeight(join(text, tagText)), groups: groups };
  }

  /* ---------- AI 프롬프트 ---------- */
  function promptText(id, opts) {
    opts = opts || {};
    var pr = byId(C.prompts, id) || C.prompts[0];
    var profile = opts.profile || (EDU.getProfile ? EDU.getProfile() : {});
    var kw = opts.keyword !== undefined ? opts.keyword : keywordOf(profile);
    var vars = varsOf(profile, kw), B = C.promptBlocks;
    var tags = opts.tags || selectedTags('ig', tagGroups(profile, kw, opts.custom || S.custom), opts.tagOv || S.tagOv);
    var blocks = {
      '{책정보}': B.book, '{내정보}': B.me, '{지킬것}': B.rules, '{그림지킬것}': B.imageRules,
      '{태그}': [tags.join(' ') || C.tags.book.join(' ')],
      '{장치}': [kw && C.mech[kw.id] ? C.mech[kw.id] : C.mechBlank]   // 표지 키워드가 아니면 빈칸으로 남긴다
    };
    var out = [];
    pr.lines.forEach(function (ln) {
      (blocks[ln] || [ln]).forEach(function (l) {
        if (l === '') { out.push(''); return; }
        var r = /^\[.*\]$/.test(l) && l.indexOf('{') < 0 ? l : fill(l, vars, false);
        if (r != null) out.push(r);
      });
    });
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /** 붙여넣은 뒤 저자가 채울 빈칸 수: 값이 없어 [안내]로 남은 자리 + ‘…주세요’로 끝나는 한 줄짜리 빈칸 */
  var blankLabels = null;
  function promptBlanks(text) {
    if (!blankLabels) {
      blankLabels = {};
      var all = []; C.prompts.forEach(function (p) { all = all.concat(p.lines); });
      Object.keys(C.promptBlocks).forEach(function (k) { all = all.concat(C.promptBlocks[k]); });
      all.forEach(function (l) { (l.match(/\|[^{}]+\}/g) || []).forEach(function (m) { blankLabels['[' + m.slice(1, -1) + ']'] = 1; }); });
    }
    var n = 0, seen = {};
    (text.match(/\[[^\]\n]+\]/g) || []).forEach(function (b) {
      if (blankLabels[b]) { if (!seen[b]) { seen[b] = 1; n++; } }
      else if (b.length >= 15 && /주세요/.test(b)) n++;
    });
    return n;
  }

  EDU.captions = { build: build, prompt: promptText, josa: josa, batchim: batchim, xWeight: xWeight,
    showTab: function () {}, state: function () { return JSON.parse(JSON.stringify(S)); } };

  if (typeof document === 'undefined' || !EDU.util) return;

  /* ================================================================
     2. 화면
     ================================================================ */
  var U = EDU.util, $ = U.$, $$ = U.$$, esc = U.esc, icon = U.icon;
  var root, ta, curTab = 'caption', lastGen = null, tagSheet = null, curPrompt = 'p1', promptSheet = null;
  var wide = window.matchMedia ? window.matchMedia('(min-width: 900px)') : { matches: false };

  /* ---------- 여는 주소 (한곳에 모아 둔다) ---------- */
  var enc = encodeURIComponent;
  var URLS = {
    ig: function () { return { app: 'instagram://camera', web: 'https://www.instagram.com/' }; },
    reels: function () { return { app: 'instagram://camera', web: 'https://www.instagram.com/' }; },
    threads: function (t) { return { web: 'https://www.threads.net/intent/post?text=' + enc(t) }; },
    x: function (t) { return { web: 'https://x.com/intent/post?text=' + enc(t) }; },
    fb: function (t, p) { return { web: 'https://www.facebook.com/sharer/sharer.php?u=' + enc(clean(p.link) || buyUrl() || EDU.site) }; },
    blog: function () { return { web: 'https://blog.naver.com/GoBlogWrite.naver' }; },
    band: function (t) { return { web: 'https://band.us/plugin/share?body=' + enc(t) + '&route=' + enc(EDU.site) }; },
    linkedin: function (t) { return { web: 'https://www.linkedin.com/feed/?shareActive=true&text=' + enc(t) }; }
  };
  var AI = {
    chatgpt: { name: 'ChatGPT', label: 'ChatGPT에서 열기', q: 'https://chatgpt.com/?q=', bare: 'https://chatgpt.com/' },
    claude: { name: 'Claude', label: 'Claude에서 열기', q: 'https://claude.ai/new?q=', bare: 'https://claude.ai/new' },
    gemini: { name: 'Gemini', label: 'Gemini 열기', q: null, bare: 'https://gemini.google.com/app' }   // 주소로 글을 못 넣는다: 복사하고 연다
  };
  var AI_ORDER = ['chatgpt', 'claude', 'gemini'];
  var URL_MAX = 6000;
  function openWeb(url) { window.open(url, '_blank', 'noopener'); }
  function canShareText() { return !!(EDU.env && EDU.env.mobile && navigator.share); }

  /* ---------- 뼈대 ---------- */
  function chipRow(list, cur, attr) {
    return list.map(function (it) {
      return '<button type="button" class="chip cp-chip" ' + attr + '="' + it.id + '" aria-pressed="' + (it.id === cur) + '">' + esc(it.name) + '</button>';
    }).join('');
  }
  function skeleton() {
    return '<div class="cp-root" data-tab="caption">' +
      '<div class="cp-top">' +
        '<div class="seg cp-tabs" role="tablist" aria-label="글감 고르기">' +
          '<button type="button" role="tab" id="cpTabCaption" aria-controls="cpPaneCaption" aria-selected="true" data-tab="caption">올릴 글</button>' +
          '<button type="button" role="tab" id="cpTabPrompts" aria-controls="cpPanePrompts" aria-selected="false" data-tab="prompts">AI 프롬프트</button>' +
        '</div>' +
        '<div class="cp-emoji"><span id="cpEmojiLabel">이모지</span>' +
          '<div class="seg" role="group" aria-labelledby="cpEmojiLabel">' +
            '<button type="button" data-emoji="0" aria-pressed="true">없이</button><button type="button" data-emoji="1" aria-pressed="false">조금</button>' +
          '</div></div>' +
      '</div>' +

      '<div class="cp-pane cp-cap" id="cpPaneCaption" role="tabpanel" aria-labelledby="cpTabCaption">' +
        '<div class="cp-side">' +
          '<div class="cp-pick"><span class="cp-label" id="cpPlatLabel">올릴 곳</span><div class="scroller cp-chips cp-plats" role="group" aria-labelledby="cpPlatLabel">' + chipRow(C.platforms, S.platform, 'data-plat') + '</div></div>' +
          '<div class="cp-pick"><span class="cp-label" id="cpMoodLabel">글 분위기</span><div class="scroller cp-chips cp-moods" role="group" aria-labelledby="cpMoodLabel">' + chipRow(C.moods, S.mood, 'data-mood') + '</div></div>' +
          '<div class="cp-tagpanel"><div class="cp-taghead"><span class="cp-label">해시태그 <b class="cp-tagcount"></b></span>' +
            '<button type="button" class="cp-reset" data-tagreset>' + icon('refresh') + '추천으로 되돌리기</button></div>' +
            '<div class="cp-groups" data-groups></div></div>' +
        '</div>' +
        '<div class="cp-main">' +
          '<div class="copybox cp-box">' +
            '<div class="copybox-head"><span class="cp-count" aria-live="polite"></span>' +
              '<button type="button" class="btn btn-small btn-ghost cp-shuffle" data-shuffle>' + icon('shuffle') + '다른 문장 <b class="cp-vi"></b></button></div>' +
            '<p class="cp-note" hidden></p>' +
            '<textarea class="copybox-body cp-text" aria-label="올릴 글 (고쳐 써도 돼요)" spellcheck="false" autocapitalize="off"></textarea>' +
            '<button type="button" class="cp-hint" data-hint hidden><span></span>' + icon('arrow-right') + '</button>' +
          '</div>' +
          '<button type="button" class="cp-tagrow" data-tagsheet aria-haspopup="dialog">' +
            '<span class="cp-tagico">' + icon('hash') + '</span><strong class="cp-tagn"></strong><span class="cp-tagprev"></span>' +
            '<span class="cp-tagpick">고르기' + icon('chev-right') + '</span></button>' +
          '<div class="cp-actions">' +
            '<button type="button" class="btn btn-dark btn-block cp-go" data-go-post>' + icon('copy') + '<span></span></button>' +
            '<div class="cp-copy3">' +
              '<button type="button" class="btn btn-line btn-small" data-copy="both">글 + 태그</button>' +
              '<button type="button" class="btn btn-line btn-small" data-copy="text">글만</button>' +
              '<button type="button" class="btn btn-line btn-small" data-copy="tags">태그만</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="cp-pane pr-pane" id="cpPanePrompts" role="tabpanel" aria-labelledby="cpTabPrompts" hidden>' +
        '<div class="pr-side">' +
          '<p class="pr-lead">AI에게 그대로 붙여넣는 부탁 글이에요. 내 정보는 이미 들어가 있어요.</p>' +
          '<div class="pr-list" role="list">' + C.prompts.map(function (p) {
            return '<button type="button" class="pr-row" role="listitem" data-prompt="' + p.id + '">' +
              '<span class="pr-ico">' + icon(p.icon) + '</span>' +
              '<span class="pr-txt"><strong>' + esc(p.title) + '</strong><small>' + esc(p.use) + '</small></span>' + icon('chev-right', 'pr-chev') + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="pr-detail" data-prdetail></div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- 올릴 글 ---------- */
  function cur() { return build(S.platform, S.mood, S.vi[S.mood] || 0); }
  function tagsNow() { return cur().tags; }
  function tagTextFor(b) { return b.tagText; }
  function fullNow() { var b = cur(); return join(ta.value.trim(), tagTextFor(b)); }

  function hintText(p, kw) {
    var n = !clean(p.name), k = !kw;
    return n && k ? '내 정보를 채우면 이름과 키워드가 들어가요' : k ? '내 키워드를 고르면 글에 들어가요' : n ? '이름을 넣으면 글에 들어가요' : '';
  }
  function goLabel(P) {
    if (P.id === 'kakao') return canShareText() ? '복사하고 카카오톡으로 보내기' : '카카오톡에 붙일 글 복사';
    return '복사하고 ' + P.app + ' 열기';
  }
  function updateCount(b) {
    b = b || cur();
    var P = platformOf(S.platform), el = $('.cp-count', root), text = ta.value.trim();
    if (P.id === 'x') {
      var w = xWeight(join(text, b.tagText));
      el.innerHTML = '<b>' + w + '</b> / 280 <i>X 글자 수 · 태그 포함</i>';
      el.classList.toggle('is-over', w > 280);
      setNote(w > 280 ? 'X는 280자까지 올라가요. ' + (w - 280) + '자만큼 줄이거나 태그를 빼 주세요.' : '', true);
    } else {
      el.innerHTML = '<b>' + Array.from(text).length.toLocaleString('ko-KR') + '</b>자';
      el.classList.remove('is-over');
      setNote(P.note || '', false);
    }
  }
  function setNote(msg, warn) {
    var n = $('.cp-note', root);
    n.hidden = !msg; n.textContent = msg || ''; n.classList.toggle('is-warn', !!warn);
  }
  function groupsHtml(b, inSheet) {
    var on = {}; b.tags.forEach(function (t) { on[t] = 1; });
    return b.groups.map(function (g) {
      var body = g.tags.map(function (t) {
        return '<button type="button" class="chip cp-tag" data-tag="' + esc(t) + '" aria-pressed="' + (!!on[t]) + '">' + esc(t) + '</button>';
      }).join('');
      if (g.id === 'kw' && !g.tags.length) body = '<button type="button" class="cp-empty" data-hint' + (inSheet ? ' data-close' : '') + '>내 키워드를 고르면 태그가 생겨요' + icon('arrow-right') + '</button>';
      if (g.id === 'me') body += '<form class="cp-add" data-addtag><input class="input cp-addin" name="tag" maxlength="30" placeholder="태그 직접 추가" aria-label="태그 직접 추가" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done">' +
        '<button type="submit" class="btn btn-line btn-small">' + icon('plus') + '추가</button></form>';
      return '<div class="cp-group" data-g="' + g.id + '"><span class="cp-gname">' + esc(g.name) + '</span><div class="cp-gchips">' + body + '</div></div>';
    }).join('');
  }
  /** 묶음을 다시 그리되, 누르던 칩(또는 입력 칸)에 초점을 돌려준다 */
  function drawGroups(box, b, inSheet) {
    var a = document.activeElement, had = a && box.contains(a), tag = had ? a.getAttribute('data-tag') : null, inAdd = had && !!a.closest('[data-addtag]');
    box.innerHTML = groupsHtml(b, inSheet);
    if (tag) { var f = $$('.cp-tag', box).filter(function (x) { return x.getAttribute('data-tag') === tag; })[0]; if (f) f.focus({ preventScroll: true }); }
    else if (inAdd) { var i = $('.cp-addin', box); if (i) i.focus({ preventScroll: true }); }
  }
  function sheetDone(n) { return n ? '이 ' + n + '개로 쓰기' : '태그 없이 쓰기'; }
  function refreshTags(b) {
    b = b || cur();
    var n = b.tags.length, P = platformOf(S.platform);
    $('.cp-tagn', root).textContent = n ? '해시태그 ' + n + '개' : '해시태그 없음';
    $('.cp-tagprev', root).textContent = n ? (P.id === 'blog' ? b.tagComma : b.tagText) : (P.id === 'kakao' || P.id === 'band' ? P.name + '에는 태그를 붙이지 않아요' : '붙일 태그를 골라 주세요');
    $('.cp-tagcount', root).textContent = n ? n + '개' : '없음';
    drawGroups($('[data-groups]', root), b, false);
    if (tagSheet) {
      drawGroups($('[data-groups]', tagSheet), b, true);
      $('[data-sheetn]', tagSheet).textContent = sheetDone(n);
    }
    $$('[data-copy="tags"]', root).forEach(function (x) { x.disabled = !n; });
    updateCount(b);
  }
  /** 글·칩·버튼을 지금 상태에 맞춘다. 만들어진 글이 그대로면 고쳐 쓴 글은 건드리지 않는다. */
  function refresh() {
    var b = cur(), P = platformOf(S.platform), profile = EDU.getProfile(), kw = EDU.currentKeyword();
    root.setAttribute('data-plat', P.id); root.setAttribute('data-len', P.len);
    $$('[data-plat]', root).forEach(function (x) { if (x !== root) x.setAttribute('aria-pressed', x.getAttribute('data-plat') === S.platform); });
    $$('[data-mood]', root).forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-mood') === S.mood); });
    $$('[data-emoji]', root).forEach(function (x) { x.setAttribute('aria-pressed', (x.getAttribute('data-emoji') === '1') === S.emoji); });
    if (b.text !== lastGen) { ta.value = b.text; ta.scrollTop = 0; lastGen = b.text; }
    $('.cp-vi', root).textContent = (b.variant + 1) + '/' + b.variants;
    $('.cp-go span', root).textContent = goLabel(P);
    var h = hintText(profile, kw), hb = $('.cp-hint', root);
    hb.hidden = !h; $('span', hb).textContent = h; $('.cp-box', root).classList.toggle('has-hint', !!h);
    refreshTags(b);
  }
  function centerChip(sel) {
    var chip = $(sel + ' [aria-pressed="true"]', root), sc = chip && chip.parentNode;
    if (!sc || sc.scrollWidth <= sc.clientWidth) return;
    var to = chip.offsetLeft - (sc.clientWidth - chip.offsetWidth) / 2;
    try { sc.scrollTo({ left: to, behavior: EDU.env.reduced ? 'auto' : 'smooth' }); } catch (e) { sc.scrollLeft = to; }
  }

  /* ---------- 해시태그 고르기 ---------- */
  function toggleTag(t) {
    var on = tagsNow().indexOf(t) >= 0;
    S.tagOv[t] = !on; save(); refreshTags();
  }
  function addTag(form) {
    var inp = form.elements.tag, raw = cleanTag(inp.value);
    if (!raw) { U.toast('한글·영문·숫자로 적어 주세요', { tio: 'curious' }); return; }
    var t = '#' + raw;
    if (S.custom.indexOf(t) < 0 && S.custom.length < 12) S.custom.push(t);
    S.tagOv[t] = true; save(); refreshTags();
    U.toast(t + ' 태그를 더했어요', { tio: 'smile' });
  }
  function resetTags() {
    S.tagOv = {}; save(); refreshTags();
    U.toast('추천 태그로 되돌렸어요', { tio: 'smile' });
  }
  function openTagSheet() {
    var b = cur();
    tagSheet = U.sheet('해시태그 고르기',
      '<div class="cp-sheet"><p class="note">누르면 켜지고 꺼져요. 올릴 곳을 바꿔도 직접 고른 태그는 남아 있어요.</p>' +
      '<div class="cp-groups" data-groups>' + groupsHtml(b, true) + '</div>' +
      '<div class="cp-sheetfoot"><button type="button" class="cp-reset" data-tagreset>' + icon('refresh') + '추천으로 되돌리기</button>' +
      '<button type="button" class="btn btn-dark" data-close><span data-sheetn>' + sheetDone(b.tags.length) + '</span></button></div></div>', 'cp-tagsheet');
    wireTags(tagSheet);
    tagSheet.addEventListener('edu:closed', function () { tagSheet = null; });
  }
  function wireTags(scope) {
    scope.addEventListener('click', function (e) {
      var t = e.target.closest('.cp-tag'); if (t) { toggleTag(t.getAttribute('data-tag')); return; }
      if (e.target.closest('[data-tagreset]')) { resetTags(); return; }
      if (e.target.closest('[data-hint]')) U.goTo('me');
    });
    scope.addEventListener('submit', function (e) {
      var f = e.target.closest('[data-addtag]'); if (!f) return;
      e.preventDefault(); addTag(f);
    });
  }

  /* ---------- 복사 · 열기 ---------- */
  function copyOnly(kind) {
    var b = cur(), P = platformOf(S.platform), text = ta.value.trim();
    if (kind === 'text') return U.copy(text, '글을 복사했어요');
    if (kind === 'tags') {
      if (!b.tags.length) return U.toast('고른 태그가 없어요', { tio: 'curious' });
      return P.id === 'blog' ? U.copy(b.tagComma, '태그 칸에 붙일 수 있게 쉼표로 복사했어요') : U.copy(b.tagText, '태그 ' + b.tags.length + '개를 복사했어요');
    }
    return U.copy(join(text, b.tagText), b.tags.length ? '글과 태그를 복사했어요' : '글을 복사했어요');
  }
  function post() {
    var P = platformOf(S.platform), full = fullNow(), profile = EDU.getProfile();
    if (P.id === 'kakao') {
      if (canShareText()) {
        U.copy(full, false);
        try { navigator.share({ text: full }).catch(function () {}); } catch (e) { U.toast(P.done, { tio: 'smile' }); }
      } else U.copy(full, P.done);
      return;
    }
    // 복사를 먼저 걸고, 같은 누름 안에서 바로 연다(팝업 차단을 피한다)
    U.copy(full, P.done);
    var u = URLS[P.id](full, profile);
    if (u.app) U.openApp(u.app, u.web); else openWeb(u.web);
  }

  /* ---------- AI 프롬프트 ---------- */
  function promptBody(id) {
    var p = byId(C.prompts, id) || C.prompts[0], text = promptText(p.id);
    var blanks = promptBlanks(text);
    return '<div class="pr-body" data-prbody="' + p.id + '">' +
      '<div class="pr-head"><span class="pr-ico">' + icon(p.icon) + '</span><div><h3>' + esc(p.title) + '</h3><p>' + esc(p.use) + '</p></div></div>' +
      '<div class="copybox pr-box"><div class="copybox-head"><span>' + (blanks ? '대괄호 [ ] ' + blanks + '곳은 붙여넣은 뒤에 채워 주세요' : '그대로 붙여넣으면 돼요') + '</span>' +
        '<span class="pr-len">' + Array.from(text).length.toLocaleString('ko-KR') + '자</span></div>' +
        '<pre class="copybox-body pr-text" tabindex="0"></pre></div>' +
      '<div class="pr-actions">' +
        '<button type="button" class="btn btn-dark btn-block" data-pr="copy">' + icon('copy') + '프롬프트 복사</button>' +
        '<div class="pr-open3" data-n="' + (p.ai || AI_ORDER).length + '">' + (p.ai || AI_ORDER).map(function (k) {
          return '<button type="button" class="btn btn-line btn-small" data-pr="' + k + '">' + AI[k].label + '</button>';
        }).join('') + '</div></div></div>';
  }
  function fillPrompt(scope, id) { var pre = $('.pr-text', scope); if (pre) { pre.textContent = promptText(id); pre.scrollTop = 0; } }
  function promptAction(act, id) {
    var text = promptText(id);
    if (act === 'copy') return U.copy(text, '프롬프트를 복사했어요');
    var ai = AI[act]; if (!ai) return;
    var url = ai.q ? ai.q + enc(text) : null;
    if (url && url.length <= URL_MAX) { U.copy(text, '복사했어요. ' + ai.name + '에 프롬프트를 넣어서 열게요'); openWeb(url); }
    else { U.copy(text, '프롬프트를 복사했어요. 붙여넣어 주세요'); openWeb(ai.bare); }
  }
  function wirePrompt(scope) {
    scope.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pr]'); if (!b) return;
      var body = b.closest('[data-prbody]'); promptAction(b.getAttribute('data-pr'), body.getAttribute('data-prbody'));
    });
  }
  function showPrompt(id, fromUser) {
    curPrompt = (byId(C.prompts, id) || C.prompts[0]).id;
    $$('.pr-row', root).forEach(function (r) { r.setAttribute('aria-current', r.getAttribute('data-prompt') === curPrompt ? 'true' : 'false'); });
    var d = $('[data-prdetail]', root);
    d.innerHTML = promptBody(curPrompt); fillPrompt(d, curPrompt);
    if (fromUser && !wide.matches) {
      var p = byId(C.prompts, curPrompt);
      promptSheet = U.sheet('AI 프롬프트', promptBody(curPrompt), 'pr-sheet');
      fillPrompt(promptSheet, curPrompt); wirePrompt(promptSheet);
      promptSheet.setAttribute('aria-label', p.title);
      promptSheet.addEventListener('edu:closed', function () { promptSheet = null; });
    }
  }

  /* ---------- 탭 ---------- */
  function showTab(tab) {
    curTab = tab === 'prompts' ? 'prompts' : 'caption';
    if (!root) return;
    root.setAttribute('data-tab', curTab);
    $$('.cp-tabs [role="tab"]', root).forEach(function (b) {
      var on = b.getAttribute('data-tab') === curTab;
      b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
    });
    $('#cpPaneCaption', root).hidden = curTab !== 'caption';
    $('#cpPanePrompts', root).hidden = curTab !== 'prompts';
    $('.cp-emoji', root).hidden = curTab !== 'caption';
    if (curTab === 'caption') { centerChip('.cp-plats'); centerChip('.cp-moods'); }
  }
  EDU.captions.showTab = showTab;

  /* ---------- 시작 ---------- */
  function init() {
    var mount = document.getElementById('captions');
    if (!mount || !C.platforms) return;
    mount.innerHTML = skeleton();
    root = $('.cp-root', mount); ta = $('.cp-text', root);

    root.addEventListener('click', function (e) {
      var t = e.target, b;
      if ((b = t.closest('.cp-tabs [data-tab]'))) { showTab(b.getAttribute('data-tab')); return; }
      if ((b = t.closest('[data-emoji]'))) { S.emoji = b.getAttribute('data-emoji') === '1'; save(); refresh(); return; }
      if ((b = t.closest('.cp-chip[data-plat]'))) { S.platform = b.getAttribute('data-plat'); save(); refresh(); centerChip('.cp-plats'); return; }
      if ((b = t.closest('.cp-chip[data-mood]'))) { S.mood = b.getAttribute('data-mood'); save(); refresh(); centerChip('.cp-moods'); return; }
      if (t.closest('[data-shuffle]')) { var c = cur(); S.vi[S.mood] = (c.variant + 1) % c.variants; save(); refresh(); return; }
      if (t.closest('[data-tagsheet]')) { openTagSheet(); return; }
      if (t.closest('[data-go-post]')) { post(); return; }
      if ((b = t.closest('[data-copy]'))) { copyOnly(b.getAttribute('data-copy')); return; }
      if ((b = t.closest('.pr-row'))) { showPrompt(b.getAttribute('data-prompt'), true); return; }
      if (t.closest('.cp-main [data-hint]')) U.goTo('me');
    });
    $('.cp-tabs', root).addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault(); showTab(curTab === 'caption' ? 'prompts' : 'caption');
      $('.cp-tabs [aria-selected="true"]', root).focus();
    });
    wireTags($('.cp-tagpanel', root));
    wirePrompt($('[data-prdetail]', root));
    ta.addEventListener('input', function () { updateCount(); });

    window.addEventListener('edu:profile', function () {
      refresh();
      showPrompt(curPrompt, false);
      if (promptSheet) fillPrompt(promptSheet, curPrompt);
    });
    window.addEventListener('edu:view', function (e) {
      var d = e.detail || {};
      if (d.view !== 'captions') return;
      showTab(d.sub === 'prompts' ? 'prompts' : 'caption');   // 글감으로 들어오면 ‘올릴 글’부터, #prompts면 프롬프트부터
    });

    refresh(); showPrompt(curPrompt, false); showTab(curTab);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
