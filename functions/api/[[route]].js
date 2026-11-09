const enc = new TextEncoder();
const ITERATIONS = 8000;
const PAKET_SLUGS = ['kintamani', 'ubud', 'uluwatu', 'nusa-penida', 'tanah-lot', 'bedugul'];
const RATE_TTL = 60;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function b64(buf) {
  const bytes = new Uint8Array(buf);
  var s = '';
  for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function unb64(s) {
  const raw = atob(s);
  const out = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function pbkdf2(password, saltB64) {
  const salt = unb64(saltB64);
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: ITERATIONS }, key, 256);
  return b64(bits);
}

function newSalt() {
  return b64(crypto.getRandomValues(new Uint8Array(16)));
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  var x = 0;
  for (var i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

async function getAuth(env) {
  if (!env.HARGA) return null;
  const raw = await env.HARGA.get('admin-auth');
  return raw ? JSON.parse(raw) : null;
}

async function checkPassword(env, password) {
  const auth = await getAuth(env);
  if (!auth || !password) return false;
  const h = await pbkdf2(password, auth.salt);
  return safeEqual(h, auth.hash);
}

function readPassword(request, body) {
  return request.headers.get('x-admin-password') || (body && body.password) || '';
}

async function readBody(request) {
  try { return await request.json(); } catch (e) { return null; }
}

function validHarga(data) {
  return data && typeof data === 'object' && data.paket && typeof data.paket === 'object';
}

function isPaket(slug) {
  return PAKET_SLUGS.indexOf(slug) >= 0;
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clientIp(request) {
  return request.headers.get('cf-connecting-ip')
    || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown';
}

async function loadUlasan(env, slug) {
  const raw = env.HARGA && await env.HARGA.get('ulasan:' + slug);
  if (!raw) return { approved: [], pending: [] };
  try {
    const d = JSON.parse(raw);
    return {
      approved: Array.isArray(d.approved) ? d.approved : [],
      pending: Array.isArray(d.pending) ? d.pending : []
    };
  } catch (e) {
    return { approved: [], pending: [] };
  }
}

async function saveUlasan(env, slug, data) {
  await env.HARGA.put('ulasan:' + slug, JSON.stringify({
    approved: data.approved || [],
    pending: data.pending || []
  }));
}

function publicReviews(list) {
  return (list || []).map(function (r) {
    return {
      id: r.id,
      nama: r.nama,
      bintang: r.bintang,
      komentar: r.komentar,
      ts: r.ts
    };
  });
}

function avgStars(list) {
  if (!list || !list.length) return 0;
  var sum = 0;
  for (var i = 0; i < list.length; i++) sum += Number(list[i].bintang) || 0;
  return Math.round((sum / list.length) * 10) / 10;
}

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  var b = crypto.getRandomValues(new Uint8Array(16));
  var s = '';
  for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
  return s;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/');
  const route = parts.slice(1).join('/');
  const method = request.method.toUpperCase();

  try {
    if (route === 'admin' || route === 'admin/status') {
      if (method !== 'GET') return json({ error: 'method' }, 405);
      const auth = await getAuth(env);
      return json({ setupNeeded: !auth, hasKv: !!env.HARGA });
    }

    if (route === 'admin/setup') {
      if (method !== 'POST') return json({ error: 'method' }, 405);
      if (!env.HARGA) return json({ error: 'kv-missing' }, 500);
      if (await getAuth(env)) return json({ error: 'already' }, 409);
      const body = await readBody(request);
      const password = String((body && body.password) || '');
      if (password.length < 8) return json({ error: 'short' }, 400);
      const salt = newSalt();
      const hash = await pbkdf2(password, salt);
      await env.HARGA.put('admin-auth', JSON.stringify({ salt: salt, hash: hash }));
      return json({ ok: true });
    }

    if (route === 'admin/login') {
      if (method !== 'POST') return json({ error: 'method' }, 405);
      const body = await readBody(request);
      const password = String((body && body.password) || '');
      if (!(await checkPassword(env, password))) return json({ error: 'auth' }, 401);
      return json({ ok: true });
    }

    if (route === 'harga') {
      if (method === 'GET') {
        const saved = env.HARGA && await env.HARGA.get('harga.json');
        if (saved) {
          return new Response(saved, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
        }
        return fetch(new URL('/data/harga.json', url.origin));
      }
      if (method === 'POST' || method === 'PUT') {
        if (!env.HARGA) return json({ error: 'kv-missing' }, 500);
        const body = await readBody(request);
        const password = readPassword(request, body);
        if (!(await checkPassword(env, password))) return json({ error: 'auth' }, 401);
        const data = body && body.paket ? body : (body && body.data);
        if (!validHarga(data)) return json({ error: 'invalid' }, 400);
        await env.HARGA.put('harga.json', JSON.stringify(data));
        return json({ ok: true });
      }
      return json({ error: 'method' }, 405);
    }

    /* ---- Ulasan (guest reviews) ---- */
    if (route === 'ulasan') {
      if (method === 'GET') {
        const slug = String(url.searchParams.get('paket') || '').trim();
        if (!isPaket(slug)) return json({ error: 'paket' }, 400);
        const store = await loadUlasan(env, slug);
        const reviews = publicReviews(store.approved);
        return json({
          paket: slug,
          average: avgStars(reviews),
          count: reviews.length,
          reviews: reviews
        });
      }

      if (method === 'POST') {
        if (!env.HARGA) return json({ error: 'kv-missing' }, 500);
        const body = await readBody(request);
        if (!body || typeof body !== 'object') return json({ error: 'invalid' }, 400);

        // Honeypot: bots fill "website"
        if (stripHtml(body.website || body.hp || '')) {
          return json({ ok: true, pending: true });
        }

        const slug = stripHtml(body.paket || '').toLowerCase();
        if (!isPaket(slug)) return json({ error: 'paket' }, 400);

        const nama = stripHtml(body.nama || '');
        const komentar = stripHtml(body.komentar || '');
        const bintang = parseInt(body.bintang, 10);

        if (nama.length < 2 || nama.length > 40) return json({ error: 'nama' }, 400);
        if (komentar.length < 5 || komentar.length > 600) return json({ error: 'komentar' }, 400);
        if (!(bintang >= 1 && bintang <= 5)) return json({ error: 'bintang' }, 400);

        const ip = clientIp(request);
        const rlKey = 'ulasan-rl:' + ip;
        const limited = await env.HARGA.get(rlKey);
        if (limited) return json({ error: 'rate' }, 429);

        const store = await loadUlasan(env, slug);
        const item = {
          id: newId(),
          nama: nama,
          bintang: bintang,
          komentar: komentar,
          ts: Date.now(),
          ip: ip
        };
        store.pending.unshift(item);
        // Cap pending to avoid abuse growth
        if (store.pending.length > 200) store.pending = store.pending.slice(0, 200);
        await saveUlasan(env, slug, store);
        await env.HARGA.put(rlKey, '1', { expirationTtl: RATE_TTL });

        return json({
          ok: true,
          pending: true,
          message: 'Terima kasih! Ulasan Anda akan tampil setelah kami tinjau.'
        });
      }

      return json({ error: 'method' }, 405);
    }

    if (route === 'ulasan/admin') {
      if (method !== 'GET') return json({ error: 'method' }, 405);
      if (!env.HARGA) return json({ error: 'kv-missing' }, 500);
      const password = readPassword(request, null);
      if (!(await checkPassword(env, password))) return json({ error: 'auth' }, 401);
      const out = {};
      for (var i = 0; i < PAKET_SLUGS.length; i++) {
        const slug = PAKET_SLUGS[i];
        const store = await loadUlasan(env, slug);
        out[slug] = {
          pending: publicReviews(store.pending).map(function (r, idx) {
            // include ts already; admin needs id
            return Object.assign({}, r, { status: 'pending' });
          }),
          approved: publicReviews(store.approved).map(function (r) {
            return Object.assign({}, r, { status: 'approved' });
          })
        };
      }
      return json({ ok: true, paket: out });
    }

    if (route === 'ulasan/approve') {
      if (method !== 'POST') return json({ error: 'method' }, 405);
      if (!env.HARGA) return json({ error: 'kv-missing' }, 500);
      const body = await readBody(request);
      const password = readPassword(request, body);
      if (!(await checkPassword(env, password))) return json({ error: 'auth' }, 401);
      const slug = stripHtml((body && body.paket) || '').toLowerCase();
      const id = stripHtml((body && body.id) || '');
      if (!isPaket(slug) || !id) return json({ error: 'invalid' }, 400);
      const store = await loadUlasan(env, slug);
      var found = null;
      store.pending = store.pending.filter(function (r) {
        if (r.id === id) { found = r; return false; }
        return true;
      });
      if (!found) return json({ error: 'notfound' }, 404);
      // strip ip before publishing
      store.approved.unshift({
        id: found.id,
        nama: found.nama,
        bintang: found.bintang,
        komentar: found.komentar,
        ts: found.ts,
        approvedAt: Date.now()
      });
      if (store.approved.length > 500) store.approved = store.approved.slice(0, 500);
      await saveUlasan(env, slug, store);
      return json({ ok: true });
    }

    if (route === 'ulasan/delete') {
      if (method !== 'POST') return json({ error: 'method' }, 405);
      if (!env.HARGA) return json({ error: 'kv-missing' }, 500);
      const body = await readBody(request);
      const password = readPassword(request, body);
      if (!(await checkPassword(env, password))) return json({ error: 'auth' }, 401);
      const slug = stripHtml((body && body.paket) || '').toLowerCase();
      const id = stripHtml((body && body.id) || '');
      const which = stripHtml((body && body.status) || 'pending');
      if (!isPaket(slug) || !id) return json({ error: 'invalid' }, 400);
      const store = await loadUlasan(env, slug);
      var before = store.pending.length + store.approved.length;
      if (which === 'approved') {
        store.approved = store.approved.filter(function (r) { return r.id !== id; });
      } else {
        store.pending = store.pending.filter(function (r) { return r.id !== id; });
      }
      // also try the other list if not found / ambiguous
      store.pending = store.pending.filter(function (r) { return r.id !== id; });
      store.approved = store.approved.filter(function (r) { return r.id !== id; });
      var after = store.pending.length + store.approved.length;
      if (before === after) return json({ error: 'notfound' }, 404);
      await saveUlasan(env, slug, store);
      return json({ ok: true });
    }

    return json({ error: 'not found' }, 404);
  } catch (e) {
    return json({ error: 'server', detail: String(e && e.message || e) }, 500);
  }
}
