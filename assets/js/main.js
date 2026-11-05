// カーネルコンサルティング HP試作：メニューの開閉・先頭へ戻るボタン・スクロールで現れる動き
(function () {
	var btn = document.getElementById('menuBtn');
	var menu = document.getElementById('mobileMenu');
	function setMenu(open) {
		menu.hidden = !open;
		btn.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
		document.body.style.overflow = open ? 'hidden' : '';
	}
	if (btn && menu) {
		btn.addEventListener('click', function () { setMenu(menu.hidden); });
		menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });
		window.addEventListener('resize', function () { if (window.innerWidth > 980 && !menu.hidden) setMenu(false); });
	}

	var toTop = document.getElementById('toTop');
	if (toTop) {
		var onScroll = function () { toTop.classList.toggle('show', window.scrollY > 600); };
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	var items = document.querySelectorAll('.reveal');
	if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
	}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
	items.forEach(function (el) { io.observe(el); });
})();
