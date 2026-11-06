// カーネルコンサルティング HP試作：メニューの開閉・ヘッダー・先頭へ戻るボタン・画面に入ったときの動き
(function () {
	var header = document.getElementById('siteHeader');
	var btn = document.getElementById('menuBtn');
	var menu = document.getElementById('mobileMenu');
	var shade = document.getElementById('menuShade');
	var toTop = document.getElementById('toTop');
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function setMenu(open) {
		menu.hidden = !open;
		if (shade) shade.hidden = !open;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		document.body.style.overflow = open ? 'hidden' : '';
	}
	if (btn && menu) {
		btn.addEventListener('click', function () { setMenu(menu.hidden); });
		menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
		if (shade) shade.addEventListener('click', function () { setMenu(false); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
		window.addEventListener('resize', function () { if (window.innerWidth > 980 && !menu.hidden) setMenu(false); });
	}

	function onScroll() {
		var y = window.scrollY || document.documentElement.scrollTop;
		if (header) header.classList.toggle('scrolled', y > 40);
		if (toTop) toTop.classList.toggle('show', y > 600);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// 最初の画面：文字が左右から順に入る（最初の1回だけ）
	var hero = document.getElementById('hero');
	if (hero) {
		if (reduce) hero.classList.add('ready');
		else {
			// 書体が読み込まれてから動かす（動きの途中で書体が切り替わると、文字の幅が変わってがたついて見える）。遅くても1.4秒で始める
			var started = false;
			var go = function () { if (started) return; started = true; window.setTimeout(function () { hero.classList.add('ready'); }, 150); };
			if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
			window.setTimeout(go, 1400);
		}
	}

	if (reduce) return;

	// 画面に入ったら動いて出てくるもの： [選ぶ相手, 付ける動き, 1つずつずらす秒数, 最初の待ち秒数]
	var plan = [
		['.sec h2, .cta h2, .page-head h1', 'reveal from-l', 0, 0.05],
		['.page-lead, .sec-lead', 'reveal', 0, 0.25],
		['.about-text p:not(.eyebrow), .svc-text > p:not(.eyebrow), .philosophy p:not(.eyebrow), .outline-grid > div > p:not(.eyebrow), .producer-grid > div > p:not(.eyebrow), .cta-grid > div > p:not(.eyebrow), #access p:not(.eyebrow)', 'reveal', 0.12, 0.2],
		['.entry-list li', 'reveal zoom', 0.13, 0.1],
		['.biz-list li', 'reveal zoom', 0.15, 0],
		['.biz-img', 'wipe', 0.15, 0.1],
		['.about-photo, .svc-photo, .map', 'wipe', 0, 0.1],
		['.town-bg', 'wipe', 0, 0.2],
		['.pair:first-child', 'reveal from-l', 0, 0],
		['.pair:last-child', 'reveal from-r', 0, 0.2],
		['.field-list li', 'reveal zoom', 0.1, 0.35],
		['.mini-table > div, .co-table > div', 'reveal', 0.08, 0.1],
		['.want', 'reveal zoom', 0, 0.35],
		['.page-anchors li', 'reveal zoom', 0.1, 0.4],
		['.cta .btn, .outline .btn', 'reveal from-r', 0, 0.35],
		['.form .field, .form .consent, .form .btn', 'reveal', 0.07, 0.1]
	];
	var targets = [];
	plan.forEach(function (row) {
		var groups = new Map(); // 同じ親の中で順番にずらす
		document.querySelectorAll(row[0]).forEach(function (el) {
			if (el.dataset.fx) return;
			el.dataset.fx = '1';
			var n = groups.get(el.parentNode) || 0;
			groups.set(el.parentNode, n + 1);
			row[1].split(' ').forEach(function (c) { el.classList.add(c); });
			el.style.setProperty('--d', (row[3] + n * row[2]).toFixed(2) + 's');
			targets.push(el);
		});
	});
	// 英字のラベルの線、違いの図
	document.querySelectorAll('.eyebrow:not(.fx), .flow').forEach(function (el) { el.classList.add('watch'); targets.push(el); });
	var i = 0;
	document.querySelectorAll('.flow .flow-steps li').forEach(function (li) { li.style.setProperty('--i', i++); });

	function show(el) {
		if (el.dataset.shown) return;
		el.dataset.shown = '1';
		el.classList.add('in');
		if (!el.dataset.fx) return;
		// 動き終わったら動き用の指定を外す（ボタンやカードの、マウスを乗せたときの動きを邪魔しないため）
		var d = parseFloat(el.style.getPropertyValue('--d')) || 0;
		window.setTimeout(function () {
			el.classList.remove('reveal', 'from-l', 'from-r', 'zoom', 'wipe', 'in');
			el.style.removeProperty('--d');
		}, (d + 2.4) * 1000);
	}
	if (!('IntersectionObserver' in window)) { targets.forEach(show); return; }
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
	}, { rootMargin: '0px 0px -4% 0px', threshold: 0 });
	targets.forEach(function (el) { io.observe(el); });
	// 念のため：ページのいちばん下まで来たら、まだ出ていないものを全部出す
	function atBottom() {
		if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) targets.forEach(show);
	}
	window.addEventListener('scroll', atBottom, { passive: true });
	window.addEventListener('load', atBottom); // スクロールの要らない短いページ
})();
