// カーネルコンサルティング HP試作：お問い合わせフォームの送信（Formspree）
(function () {
	var form = document.getElementById('contactForm');
	if (!form) return;
	var msg = document.getElementById('formMsg');
	var btn = form.querySelector('button[type=submit]');
	var say = function (text, kind) { if (!msg) return; msg.textContent = text; msg.className = 'form-msg ' + (kind || ''); };

	// URLの ?type=school などで、ご相談の内容をあらかじめ選ぶ
	var type = new URLSearchParams(location.search).get('type');
	if (type) { var pre = form.querySelector('[data-type="' + type + '"]'); if (pre) pre.checked = true; }

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		say('', '');
		if (!form.checkValidity()) { form.reportValidity(); say('入力していない必須の項目があります。', 'err'); return; }
		if (/TODO_/.test(form.action)) { say('確認用の試作版のため、まだ送信できません（送信先を設定すると使えるようになります）。', 'err'); return; }

		btn.disabled = true; btn.classList.add('sending'); say('送信しています…', '');
		fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
			.then(function (r) {
				if (r.ok) { location.href = form.getAttribute('data-thanks') || 'thanks.html'; return; }
				throw new Error('error');
			})
			.catch(function () {
				btn.disabled = false; btn.classList.remove('sending');
				say('送信できませんでした。時間をおいて、もう一度お試しください。', 'err');
			});
	});
})();
