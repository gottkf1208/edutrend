/* 2027 미래 교육 트렌드 홍보 키트 — shared utilities (window.EDU)
   Loaded first. Every module uses EDU.util / EDU.profile, never its own copies. */
(function () {
  'use strict';
  var EDU = (window.EDU = window.EDU || {});
  var ua = navigator.userAgent || '';

  /* ---------- environment ---------- */
  var ios = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  var inApp = /KAKAOTALK/i.test(ua) ? 'kakaotalk'
    : /Instagram/i.test(ua) ? 'instagram'
    : /FBAN|FBAV|FB_IAB/i.test(ua) ? 'facebook'
    : /NAVER\(inapp/i.test(ua) ? 'naver'
    : /\bLine\//i.test(ua) ? 'line'
    : /DaumApps/i.test(ua) ? 'daum'
    : /BAND\//i.test(ua) ? 'band'
    : null;
  var env = (EDU.env = { ios: ios, android: android, mobile: ios || android, inApp: inApp,
    reduced: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) });
  var INAPP_NAME = { kakaotalk: '카카오톡', instagram: '인스타그램', facebook: '페이스북', naver: '네이버 앱', line: '라인', daum: '다음 앱', band: '밴드' };

  /* ---------- dom ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ---------- icons (stroke, 24 grid) ---------- */
  var ICONS = {
    download: '<path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    share: '<path d="M12 15V4"/><path d="m8 8 4-4 4 4"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    'arrow-down': '<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.5-1.2 1-1.2 2"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m5 18 5-5 3 3 2.5-2.5L20 18"/>',
    film: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="m10 9 5 3-5 3z"/>',
    hash: '<path d="M5 9h14"/><path d="M5 15h14"/><path d="M10 4 8 20"/><path d="M16 4l-2 16"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    book: '<path d="M12 7c-2-1.6-4.7-2-8-2v13c3.3 0 6 .4 8 2 2-1.6 4.7-2 8-2V5c-3.3 0-6 .4-8 2z"/><path d="M12 7v13"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 5v6h-6"/>',
    shuffle: '<path d="M4 7h3.5c3.5 0 5.5 10 9 10H20"/><path d="M4 17h3.5c1.3 0 2.300-1.300 3.200-3"/><path d="M13.5 9.500c.900-1.500 1.900-2.500 3-2.500H20"/><path d="m17.500 4.500 2.500 2.500-2.500 2.500"/><path d="m17.500 14.500 2.500 2.500-2.500 2.500"/>',
    play: '<path d="M8 5.5v13l11-6.500z"/>',
    'chev-down': '<path d="m6 9 6 6 6-6"/>',
    'chev-right': '<path d="m9 6 6 6-6 6"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
    wand: '<path d="m5 19 10-10"/><path d="m14 5 .700 1.800L16.500 7.500l-1.800.700L14 10l-.700-1.800L11.500 7.500l1.800-.700z"/><path d="m19 12 .500 1.200 1.200.500-1.200.500L19 15.400l-.500-1.200-1.200-.500 1.200-.500z"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.500"/><path d="M11 18h2"/>',
    user: '<circle cx="12" cy="8.500" r="3.500"/><path d="M5 20c.800-3.500 3.500-5 7-5s6.200 1.500 7 5"/>',
    external: '<path d="M14 5h5v5"/><path d="M19 5 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"/>',
    heart: '<path d="M12 20s-7-4.300-7-9.500A3.800 3.800 0 0 1 12 8a3.800 3.800 0 0 1 7 2.500c0 5.200-7 9.500-7 9.500z"/>',
    cart: '<path d="M4 5h2l2 10h9l2-7H7.500"/><circle cx="10" cy="19" r="1.300"/><circle cx="16.500" cy="19" r="1.300"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    home: '<path d="M4 11.500 12 4l8 7.500"/><path d="M6 10v9h12v-9"/>',
    spark: '<path d="M12 3c.600 5.400 3.600 8.400 9 9-5.400.600-8.400 3.600-9 9-.600-5.400-3.600-8.400-9-9 5.400-.600 8.400-3.600 9-9z"/>'
  };
  function icon(name, cls) {
    var p = ICONS[name] || '';
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------- storage (never throws) ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  /* ---------- author profile (shared by every module) ---------- */
  var PKEY = 'edutrend.profile.v1';
  var DEFAULT = { name: '', org: '', kw: '', kwCustom: '', line: '', handle: '', link: '' };
  var profile = Object.assign({}, DEFAULT, store.get(PKEY, {}));
  EDU.getProfile = function () { return Object.assign({}, profile); };
  EDU.setProfile = function (patch, silent) {
    Object.assign(profile, patch || {});
    store.set(PKEY, profile);
    if (!silent) window.dispatchEvent(new CustomEvent('edu:profile', { detail: EDU.getProfile() }));
    return EDU.getProfile();
  };
  /** keyword object for the current profile: {id,name,tag} (art at EDU.kwArt(id)) or a custom one {id:'custom',name,tag} or null */
  EDU.currentKeyword = function (p) {
    p = p || profile;
    var list = (window.EDU_ASSETS && window.EDU_ASSETS.keywords) || [];
    if (p.kw && p.kw !== 'custom') { for (var i = 0; i < list.length; i++) if (list[i].id === p.kw) return list[i]; }
    if (p.kw === 'custom' && p.kwCustom) return { id: 'custom', name: p.kwCustom, tag: p.kwCustom.replace(/\s+/g, '') };
    return null;
  };

  /* ---------- toast ---------- */
  var toastEl, toastT;
  function toast(msg, opt) {
    opt = opt || {};
    if (!toastEl) { toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    var tio = opt.tio === false ? '' : '<img src="assets/tio/' + (opt.tio || 'happy') + '.webp" alt="">';
    toastEl.innerHTML = tio + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, opt.ms || 2200);
  }

  /* ---------- copy ---------- */
  function legacyCopy(text) {
    var ta = el('textarea', { readonly: true, style: 'position:fixed;left:-9999px;top:0;font-size:16px' });
    ta.value = text; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  }
  /** copy(text, doneMessage?) -> Promise<boolean>. Shows a toast on success; opens a manual-copy sheet on failure. */
  function copy(text, msg) {
    text = String(text == null ? '' : text);
    function ok() { if (msg !== false) toast(msg || '복사했어요', { tio: 'smile' }); return true; }
    function fail() { if (legacyCopy(text)) return ok(); manualCopy(text); return false; }
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(ok, fail);
    }
    return Promise.resolve(fail());
  }
  function manualCopy(text) {
    var d = sheet('직접 복사', '<div class="save-body"><p class="note">자동 복사가 막혀 있어요. 아래 글을 길게 눌러 전체 선택한 뒤 복사해 주세요.</p><textarea class="textarea" readonly style="min-height:220px"></textarea></div>');
    var ta = $('textarea', d); ta.value = text; setTimeout(function () { ta.focus(); ta.select(); }, 60);
  }

  /* ---------- dialog helper ---------- */
  function sheet(title, bodyHtml, cls) {
    var d = el('dialog', { class: 'sheet ' + (cls || '') },
      '<div class="dlg-top"><span>' + esc(title) + '</span><button type="button" class="icon-btn" data-close aria-label="닫기">' + icon('x') + '</button></div>' + bodyHtml);
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', function () { d.dispatchEvent(new Event('edu:closed')); d.remove(); });
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    return d;
  }

  /* ---------- open in real browser / app ---------- */
  function openExternal(url) {
    url = url || location.href;
    if (inApp === 'kakaotalk') { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url); return true; }
    if (android) { location.href = 'intent://' + url.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end'; return true; }
    copy(url, '주소를 복사했어요. Safari에 붙여넣어 열어 주세요');
    return false;
  }
  /** try an app scheme, fall back to a web url if the app did not open */
  function openApp(scheme, webUrl) {
    if (!env.mobile || !scheme) { window.open(webUrl, '_blank', 'noopener'); return; }
    var t = Date.now(), hidden = false;
    function vis() { if (document.hidden) hidden = true; }
    document.addEventListener('visibilitychange', vis);
    location.href = scheme;
    setTimeout(function () {
      document.removeEventListener('visibilitychange', vis);
      if (!hidden && Date.now() - t < 2200 && webUrl) location.href = webUrl;
    }, 1300);
  }

  /* ---------- saving files ---------- */
  function fmtBytes(n) { if (!n) return ''; return n > 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }
  function fileName(s) { return String(s).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_'); }
  function anchorDownload(href, name) {
    var a = el('a', { href: href, download: name, style: 'display:none' });
    document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 400);
  }
  function fetchBlob(url, onProgress) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var total = +r.headers.get('content-length') || 0;
      if (!r.body || !r.body.getReader || !total) return r.blob();
      var reader = r.body.getReader(), chunks = [], got = 0, type = r.headers.get('content-type') || '';
      return (function pump() {
        return reader.read().then(function (res) {
          if (res.done) return new Blob(chunks, { type: type });
          chunks.push(res.value); got += res.value.length; if (onProgress) onProgress(got / total);
          return pump();
        });
      })();
    });
  }
  function canShareFile(file) {
    try { return !!(navigator.canShare && navigator.share && navigator.canShare({ files: [file] })); } catch (e) { return false; }
  }
  /**
   * saveSheet(opts) — the one way every module hands a file to the author.
   * opts: { title, filename, url?, blob?, preview?, w?, h?, bytes?, kind?: 'image'|'video', note? }
   *  - url: same-origin file to fetch in full quality;  blob: already generated (canvas export)
   * Desktop: downloads straight away. Mobile: opens a sheet with save-to-photos / file / long-press routes.
   */
  function saveSheet(o) {
    var name = fileName(o.filename || 'edutrend.jpg');
    var kind = o.kind || (/\.(mp4|mov|webm)$/i.test(name) ? 'video' : 'image');
    if (!env.mobile) {
      if (o.blob) { var u = URL.createObjectURL(o.blob); anchorDownload(u, name); setTimeout(function () { URL.revokeObjectURL(u); }, 30000); }
      else anchorDownload(o.url, name);
      toast('고화질 원본을 내려받았어요', { tio: 'heart' });
      return null;
    }
    var dims = o.w && o.h ? o.w + '×' + o.h : '';
    var html = '<div class="save-body">' +
      (inApp ? '<div class="save-tip"><b>' + INAPP_NAME[inApp] + ' 안에서 열려 있어요.</b> 저장이 안 되면 기본 브라우저에서 여는 게 가장 확실해요. <button type="button" class="btn btn-small btn-dark" data-ext style="margin-top:8px">' + icon('external') + '기본 브라우저로 열기</button></div>' : '') +
      '<div class="save-preview">' + (kind === 'video' ? '<video playsinline muted loop autoplay></video>' : '<img alt="' + esc(o.title || '') + '">') + '</div>' +
      '<div class="save-meta"><strong>' + esc(o.title || name) + '</strong><span data-meta>' + [dims, fmtBytes(o.bytes)].filter(Boolean).join(' · ') + '</span></div>' +
      '<div class="progress" data-prog><i></i></div>' +
      '<div class="save-actions">' +
      '<button type="button" class="btn btn-cy btn-block" data-share disabled>' + icon('download') + '<span>원본 불러오는 중…</span></button>' +
      '<button type="button" class="btn btn-line btn-block" data-file disabled>' + icon('arrow-down') + '파일로 받기</button>' +
      '</div>' +
      '<p class="note">' + (kind === 'video' ? '저장이 안 되면 ‘파일로 받기’를 눌러 주세요.' : '버튼이 안 먹히면 위 그림을 <b>길게 눌러 ‘사진 앱에 저장’</b>을 고르면 돼요.') + (o.note ? ' ' + esc(o.note) : '') + '</p>' +
      '</div>';
    var d = sheet(o.sheetTitle || '고화질로 저장', html);
    var media = $('.save-preview img, .save-preview video', d), bShare = $('[data-share]', d), bFile = $('[data-file]', d), prog = $('[data-prog]', d), bar = $('i', prog);
    var objUrl = null, blob = o.blob || null, file = null;
    if (o.preview) media.src = o.preview; else if (o.url && kind === 'image') media.src = o.url;
    var ext = $('[data-ext]', d); if (ext) ext.addEventListener('click', function () { openExternal(location.href); });
    d.addEventListener('edu:closed', function () { if (objUrl) setTimeout(function () { URL.revokeObjectURL(objUrl); }, 1000); });

    function ready(b) {
      blob = b; prog.hidden = true;
      var type = b.type || (kind === 'video' ? 'video/mp4' : /\.png$/i.test(name) ? 'image/png' : /\.gif$/i.test(name) ? 'image/gif' : 'image/jpeg');
      try { file = new File([b], name, { type: type }); } catch (e) { file = null; }
      objUrl = URL.createObjectURL(b);
      media.src = objUrl;
      var meta = $('[data-meta]', d); meta.textContent = [dims, fmtBytes(b.size)].filter(Boolean).join(' · ');
      bFile.disabled = false;
      var shareable = file && canShareFile(file);
      bShare.disabled = false;
      $('span', bShare).textContent = shareable ? (kind === 'video' ? '영상 저장 · 공유' : '사진 앱에 저장 · 공유') : '고화질로 저장';
      bShare.onclick = function () {
        if (shareable) {
          navigator.share({ files: [file] }).then(function () { toast('저장 창을 열었어요', { tio: 'heart' }); }, function (err) {
            if (err && err.name === 'AbortError') return;
            anchorDownload(o.url && !o.blob ? o.url : objUrl, name);
          });
        } else {
          anchorDownload(o.url && !o.blob ? o.url : objUrl, name); toast('내려받기를 시작했어요', { tio: 'heart' });
        }
      };
      bFile.onclick = function () { anchorDownload(o.url && !o.blob ? o.url : objUrl, name); toast('내려받기를 시작했어요', { tio: 'heart' }); };
    }
    if (blob) ready(blob);
    else fetchBlob(o.url, function (p) { bar.style.width = Math.round(p * 100) + '%'; }).then(ready, function () {
      prog.hidden = true; bShare.disabled = false; bFile.disabled = false;
      $('span', bShare).textContent = '고화질로 저장';
      bShare.onclick = bFile.onclick = function () { anchorDownload(o.url, name); };
    });
    return d;
  }

  /* ---------- small helpers ---------- */
  function loadImage(src) {
    return new Promise(function (res, rej) { var im = new Image(); im.decoding = 'async'; im.onload = function () { res(im); }; im.onerror = function () { rej(new Error('image ' + src)); }; im.src = src; });
  }
  function reveal(root) {
    var nodes = $$('.reveal', root || document);
    if (!('IntersectionObserver' in window) || env.reduced) { nodes.forEach(function (n) { n.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  }
  /* ---------- views (one screen at a time; the page never scrolls) ---------- */
  var VIEW_OF = { home: 'home', hero: 'home', kwIndex: 'home', me: 'me', start: 'me', studio: 'studio', captions: 'captions', prompts: 'captions', library: 'library', links: 'links', ai: 'ai', ailab: 'ai' };
  var curView = null;
  function showView(v, sub, fromUser) {
    if (!VIEW_OF[v]) v = 'home';
    v = VIEW_OF[v];
    var changed = v !== curView;
    $$('.view').forEach(function (n) {
      var on = n.getAttribute('data-view') === v;
      n.classList.toggle('is-active', on);
      if (on) n.removeAttribute('inert'); else n.setAttribute('inert', '');
    });
    curView = v; document.body.setAttribute('data-view', v);
    if (fromUser && changed) { try { history.pushState({ v: v }, '', '#' + v); } catch (e) { location.hash = v; } }
    window.dispatchEvent(new CustomEvent('edu:view', { detail: { view: v, sub: sub } }));
  }
  /** goTo('home'|'me'|'studio'|'captions'|'prompts'|'library'|'links'|'kwIndex') — also accepts old ids 'start','hero' */
  function goTo(id) { showView(id, id === 'prompts' ? 'prompts' : id === 'kwIndex' ? 'kwIndex' : undefined, true); }
  function hashView() { var h = (location.hash || '').replace(/^#/, ''); return VIEW_OF[h] ? h : 'home'; }
  EDU.currentView = function () { return curView; };
  window.addEventListener('popstate', function () { var h = hashView(); showView(h, h === 'prompts' ? 'prompts' : undefined, false); });
  document.addEventListener('DOMContentLoaded', function () {
    var h = hashView(), v = VIEW_OF[h];
    $$('.view').forEach(function (n) { var on = n.getAttribute('data-view') === v; n.classList.toggle('is-active', on); if (!on) n.setAttribute('inert', ''); });
    curView = v; document.body.setAttribute('data-view', v);
    // tell modules after they have all rendered
    setTimeout(function () { window.dispatchEvent(new CustomEvent('edu:view', { detail: { view: v, sub: h === 'prompts' ? 'prompts' : undefined } })); }, 0);
  });

  EDU.util = { $: $, $$: $$, el: el, esc: esc, icon: icon, store: store, toast: toast, copy: copy, sheet: sheet,
    saveSheet: saveSheet, openExternal: openExternal, openApp: openApp, fetchBlob: fetchBlob, fmtBytes: fmtBytes,
    fileName: fileName, anchorDownload: anchorDownload, loadImage: loadImage, reveal: reveal, goTo: goTo, showView: showView, inAppName: INAPP_NAME };
})();
