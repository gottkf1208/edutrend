/* 2027 미래 교육 트렌드 홍보 키트 — facts & links (hand-edited; one place to change them) */
(function () {
  'use strict';
  var EDU = (window.EDU = window.EDU || {});

  EDU.site = 'https://edutrend.dumokquoka.com/';

  EDU.book = {
    title: '2027 대한민국 미래 교육 트렌드',
    titleLines: ['2027 대한민국', '미래 교육', '트렌드'],
    sub: '30명의 현장 교육전문가들이 제시하는 미래 교육의 전망과 해법',
    author: '미래 교육 집필팀',
    authors: 30,
    publisher: '뜨인돌',
    color: '#00A2D3',
    /* 서점 링크: 2026-11-17 기준 아직 등록 전. 등록되면 여기 주소만 넣으면 사이트 전체에 반영된다. */
    stores: [
      { id: 'kyobo', name: '교보문고', url: '', search: 'https://search.kyobobook.co.kr/search?keyword=' + encodeURIComponent('2027 대한민국 미래 교육 트렌드 뜨인돌') },
      { id: 'yes24', name: 'YES24', url: '', search: 'https://www.yes24.com/Product/Search?query=' + encodeURIComponent('2027 대한민국 미래 교육 트렌드') },
      { id: 'aladin', name: '알라딘', url: '', search: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=' + encodeURIComponent('2027 대한민국 미래 교육 트렌드') }
    ]
  };

  /* 시리즈 네 권 — 표지에 인쇄된 인원 그대로 */
  EDU.series = [
    { year: 2024, label: '첫 권', title: '대한민국 미래 교육 트렌드', authors: 36, color: '#FE5F4A', pub: '2023년 11월', cover: 'assets/covers/2024' },
    { year: 2025, label: '2025', title: '2025 대한민국 미래 교육 트렌드', authors: 37, color: '#38D530', pub: '2024년 11월', cover: 'assets/covers/2025' },
    { year: 2026, label: '2026', title: '2026 대한민국 미래 교육 트렌드', authors: 31, color: '#9D37C7', pub: '2025년 10월', cover: 'assets/covers/2026' },
    { year: 2027, label: '2027', title: '2027 대한민국 미래 교육 트렌드', authors: 30, color: '#00A2D3', pub: '', cover: 'assets/covers/2027' }
  ];

  /* 키워드 그림 21장 — 표지와 같은 결로 새로 그린 것(투명 배경, 시안 바탕 위에 얹는다) */
  EDU.kwArt = function (id, size) { // size: 'hd' (2048 PNG) | 'pv' (800 WebP)
    return 'assets/kw/' + id + (size === 'hd' ? '.png' : '.webp');
  };

  /* 공식 계정 */
  EDU.accounts = [
    { id: 'ddstone-ig', group: '뜨인돌', name: '인스타그램', handle: '@ddstone_books', url: 'https://www.instagram.com/ddstone_books/', app: 'instagram://user?username=ddstone_books' },
    { id: 'ddstone-blog', group: '뜨인돌', name: '네이버 블로그', handle: 'ddstone1994', url: 'https://blog.naver.com/ddstone1994' },
    { id: 'ddstone-fb', group: '뜨인돌', name: '페이스북', handle: 'ddstone1994', url: 'https://www.facebook.com/ddstone1994' },
    { id: 'ddstone-site', group: '뜨인돌', name: '출판사 홈페이지', handle: 'ddstone.com', url: 'https://www.ddstone.com/' },
    { id: 'tca-ig', group: '교사크리에이터협회', name: '인스타그램', handle: '@tcreator_official', url: 'https://www.instagram.com/tcreator_official/', app: 'instagram://user?username=tcreator_official' },
    { id: 'tca-site', group: '교사크리에이터협회', name: '협회 홈페이지', handle: 't-creator.com', url: 'https://t-creator.com/' }
  ];

  /* 이전 세 권 서점 페이지 */
  EDU.backlist = [
    { year: 2024, kyobo: 'https://product.kyobobook.co.kr/detail/S000210778266', yes24: 'https://www.yes24.com/product/goods/123181560' },
    { year: 2025, kyobo: 'https://product.kyobobook.co.kr/detail/S000214658820', yes24: 'https://www.yes24.com/product/goods/136477916' },
    { year: 2026, kyobo: 'https://product.kyobobook.co.kr/detail/S000218197119', yes24: 'https://www.yes24.com/product/goods/159506642' }
  ];
})();
