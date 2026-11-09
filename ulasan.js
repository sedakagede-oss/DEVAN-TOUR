/* Ulasan tamu DEVAN TOUR — bintang + nama + komentar. Konten user hanya via textContent. */
(function () {
  var SLUGS = ['kintamani', 'ubud', 'uluwatu', 'nusa-penida', 'tanah-lot', 'bedugul'];

  function t(s) { return window.t ? window.t(s) : s; }
  function en() { return document.documentElement.lang === 'en'; }

  function detectPaket() {
    var el = document.querySelector('[data-ulasan-paket]');
    if (el && el.getAttribute('data-ulasan-paket')) return el.getAttribute('data-ulasan-paket');
    var m = (location.pathname || '').match(/\/paket\/([a-z0-9-]+)\.html/i);
    return m ? m[1].toLowerCase() : '';
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function starsHtml(n, sizeCls) {
    var wrap = el('span', 'ul-stars' + (sizeCls ? ' ' + sizeCls : ''));
    wrap.setAttribute('aria-label', n + ' / 5');
    for (var i = 1; i <= 5; i++) {
      var s = el('span', 'ul-star' + (i <= n ? ' on' : ''));
      s.textContent = '★';
      wrap.appendChild(s);
    }
    return wrap;
  }

  function fmtDate(ts) {
    try {
      return new Date(ts).toLocaleDateString(en() ? 'en-GB' : 'id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return ''; }
  }

  function renderList(box, reviews) {
    box.textContent = '';
    if (!reviews || !reviews.length) {
      var empty = el('p', 'ul-empty');
      empty.textContent = t('Belum ada ulasan. Jadilah yang pertama memberi ulasan!');
      box.appendChild(empty);
      return;
    }
    reviews.forEach(function (r) {
      var card = el('article', 'ul-card');
      var head = el('div', 'ul-card-h');
      var name = el('strong', 'ul-name');
      name.textContent = r.nama || '';
      head.appendChild(name);
      head.appendChild(starsHtml(Number(r.bintang) || 0, 'ul-stars-sm'));
      if (r.ts) {
        var d = el('time', 'ul-date');
        d.dateTime = new Date(r.ts).toISOString();
        d.textContent = fmtDate(r.ts);
        head.appendChild(d);
      }
      var p = el('p', 'ul-komen');
      p.textContent = r.komentar || '';
      card.appendChild(head);
      card.appendChild(p);
      box.appendChild(card);
    });
  }

  function renderSummary(box, average, count) {
    box.textContent = '';
    var row = el('div', 'ul-sum');
    if (count > 0) {
      row.appendChild(starsHtml(Math.round(average), 'ul-stars-lg'));
      var meta = el('div', 'ul-sum-meta');
      var avg = el('b', '');
      avg.textContent = String(average).replace('.', ',');
      meta.appendChild(avg);
      meta.appendChild(document.createTextNode(' / 5 · '));
      var cnt = el('span', '');
      cnt.textContent = count + ' ' + t(count === 1 ? 'ulasan' : 'ulasan');
      meta.appendChild(cnt);
      row.appendChild(meta);
    } else {
      var z = el('p', 'ul-sum-zero');
      z.textContent = t('Belum ada rating');
      row.appendChild(z);
    }
    box.appendChild(row);
  }

  function buildForm(paket, onDone) {
    var form = el('form', 'ul-form');
    form.setAttribute('novalidate', '');

    var title = el('h3', 'ul-form-title');
    title.textContent = t('Tulis ulasan Anda');
    form.appendChild(title);

    // honeypot
    var hpWrap = el('div', 'ul-hp');
    hpWrap.setAttribute('aria-hidden', 'true');
    var hpLab = el('label', '');
    hpLab.textContent = 'Website';
    var hp = el('input', '');
    hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hpWrap.appendChild(hpLab); hpWrap.appendChild(hp);
    form.appendChild(hpWrap);

    var starLab = el('div', 'ul-lab');
    starLab.textContent = t('Rating');
    form.appendChild(starLab);

    var starRow = el('div', 'ul-pick');
    starRow.setAttribute('role', 'radiogroup');
    starRow.setAttribute('aria-label', t('Rating'));
    var picked = 0;
    var starBtns = [];
    function paint() {
      starBtns.forEach(function (b, i) {
        b.classList.toggle('on', i < picked);
        b.setAttribute('aria-checked', i + 1 === picked ? 'true' : 'false');
      });
    }
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        var b = el('button', 'ul-pick-star');
        b.type = 'button';
        b.textContent = '★';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-label', n + ' ' + t('bintang'));
        b.addEventListener('click', function () { picked = n; paint(); err.textContent = ''; });
        b.addEventListener('mouseenter', function () {
          starBtns.forEach(function (x, idx) { x.classList.toggle('hov', idx < n); });
        });
        starRow.appendChild(b);
        starBtns.push(b);
      })(i);
    }
    starRow.addEventListener('mouseleave', function () {
      starBtns.forEach(function (x) { x.classList.remove('hov'); });
    });
    form.appendChild(starRow);

    var nameLab = el('label', 'ul-lab');
    var nameSpan = el('span', '');
    nameSpan.textContent = t('Nama Anda');
    nameLab.appendChild(nameSpan);
    var nameIn = el('input', 'ul-input');
    nameIn.type = 'text'; nameIn.name = 'nama'; nameIn.required = true;
    nameIn.maxLength = 40; nameIn.autocomplete = 'name';
    nameIn.placeholder = t('Contoh: Andi');
    nameLab.appendChild(nameIn);
    form.appendChild(nameLab);

    var komLab = el('label', 'ul-lab');
    var komSpan = el('span', '');
    komSpan.textContent = t('Komentar');
    komLab.appendChild(komSpan);
    var komIn = el('textarea', 'ul-input ul-ta');
    komIn.name = 'komentar'; komIn.required = true;
    komIn.maxLength = 600; komIn.rows = 4;
    komIn.placeholder = t('Ceritakan pengalaman tur Anda…');
    komLab.appendChild(komIn);
    form.appendChild(komLab);

    var err = el('p', 'ul-err');
    err.setAttribute('role', 'alert');
    err.hidden = true;
    form.appendChild(err);

    var btn = el('button', 'btn ul-submit');
    btn.type = 'submit';
    btn.textContent = t('Kirim ulasan');
    form.appendChild(btn);

    var note = el('p', 'ul-note');
    note.textContent = t('Ulasan akan tampil setelah kami tinjau.');
    form.appendChild(note);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true; err.textContent = '';
      var nama = (nameIn.value || '').trim();
      var komentar = (komIn.value || '').trim();
      if (picked < 1) {
        err.textContent = t('Pilih rating bintang dulu.');
        err.hidden = false; return;
      }
      if (nama.length < 2 || nama.length > 40) {
        err.textContent = t('Nama 2–40 karakter.');
        err.hidden = false; return;
      }
      if (komentar.length < 5 || komentar.length > 600) {
        err.textContent = t('Komentar 5–600 karakter.');
        err.hidden = false; return;
      }
      btn.disabled = true;
      btn.textContent = t('Mengirim…');
      fetch('/api/ulasan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          paket: paket,
          nama: nama,
          bintang: picked,
          komentar: komentar,
          website: hp.value || ''
        })
      }).then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; });
      }).then(function (res) {
        if (res.ok && res.d && res.d.ok) {
          form.textContent = '';
          var thanks = el('div', 'ul-thanks');
          var h = el('h3', '');
          h.textContent = t('Terima kasih!');
          var p = el('p', '');
          p.textContent = t('Ulasan Anda akan tampil setelah kami tinjau.');
          thanks.appendChild(h); thanks.appendChild(p);
          form.appendChild(thanks);
          if (onDone) onDone();
          return;
        }
        var msg = t('Gagal mengirim ulasan. Coba lagi.');
        if (res.status === 429) msg = t('Terlalu banyak kiriman. Tunggu sebentar lalu coba lagi.');
        else if (res.d && res.d.error === 'nama') msg = t('Nama 2–40 karakter.');
        else if (res.d && res.d.error === 'komentar') msg = t('Komentar 5–600 karakter.');
        else if (res.d && res.d.error === 'bintang') msg = t('Pilih rating bintang dulu.');
        err.textContent = msg; err.hidden = false;
        btn.disabled = false; btn.textContent = t('Kirim ulasan');
      }).catch(function () {
        err.textContent = t('Gagal mengirim ulasan. Coba lagi.');
        err.hidden = false;
        btn.disabled = false; btn.textContent = t('Kirim ulasan');
      });
    });

    return form;
  }

  function mount(root, paket) {
    root.textContent = '';
    var head = el('div', 'ul-head');
    var h2 = el('h2', 'ttl');
    h2.textContent = t('Ulasan Tamu');
    var sub = el('p', 'sub');
    sub.textContent = t('Bagikan pengalaman Anda setelah tur bersama DEVAN TOUR.');
    head.appendChild(h2); head.appendChild(sub);
    root.appendChild(head);

    var sum = el('div', 'ul-summary');
    var list = el('div', 'ul-list');
    var formWrap = el('div', 'ul-form-wrap');
    root.appendChild(sum);
    root.appendChild(list);
    root.appendChild(formWrap);

    function load() {
      fetch('/api/ulasan?paket=' + encodeURIComponent(paket) + '&v=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('ulasan'); return r.json(); })
        .then(function (d) {
          renderSummary(sum, d.average || 0, d.count || 0);
          renderList(list, d.reviews || []);
        })
        .catch(function () {
          renderSummary(sum, 0, 0);
          renderList(list, []);
        });
    }

    formWrap.appendChild(buildForm(paket, load));
    load();

    // re-render labels on language change
    new MutationObserver(function () {
      // rebuild form labels by remounting lightly
      var thanks = formWrap.querySelector('.ul-thanks');
      if (!thanks) {
        formWrap.textContent = '';
        formWrap.appendChild(buildForm(paket, load));
      }
      h2.textContent = t('Ulasan Tamu');
      sub.textContent = t('Bagikan pengalaman Anda setelah tur bersama DEVAN TOUR.');
      load();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function boot() {
    var paket = detectPaket();
    if (SLUGS.indexOf(paket) < 0) return;
    var root = document.getElementById('ulasan-root');
    if (!root) {
      var sec = document.querySelector('.ulasan-sec');
      if (sec) {
        root = el('div', 'wrap');
        root.id = 'ulasan-root';
        sec.appendChild(root);
      }
    }
    if (!root) return;
    mount(root, paket);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
