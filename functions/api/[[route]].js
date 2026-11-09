const enc = new TextEncoder();

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function unb64(s) {
  return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); });
}

async function pbkdf2(password, saltB64) {
  const salt = unb64(saltB64);
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: 120000 }, key, 256);
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

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/');
  const route = parts.slice(1).join('/');
  const method = request.method.toUpperCase();

  if (route === 'admin' || route === 'admin/status') {
    if (method !== 'GET') return json({ error: 'method' }, 405);
    const auth = await getAuth(env);
    return json({ setupNeeded: !auth });
  }

  if (route === 'admin/setup') {
    if (method !== 'POST') return json({ error: 'method' }, 405);
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

  return json({ error: 'not found' }, 404);
}
