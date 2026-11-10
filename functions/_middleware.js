/**
 * Inject AggregateRating + Review JSON-LD into package HTML
 * only when real approved reviews exist in KV (ulasan:{slug}).
 * Invents nothing: zero approved reviews → no rating markup.
 */
const PAKET_RE = /^\/(?:en\/)?paket\/([a-z0-9-]+)(?:\.html)?\/?$/i;

function jsonSafe(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function isoDate(ts) {
  var n = Number(ts);
  if (!n) return undefined;
  if (n < 1e12) n = n * 1000;
  var d = new Date(n);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function clean(s, max) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max || 600);
}

function tripName(html, slug) {
  var m = html.match(/<script type="application\/ld\+json">(\{[^<]*"@type":\s*"TouristTrip"[^<]*\})<\/script>/);
  if (m) {
    try {
      var d = JSON.parse(m[1]);
      if (d && d.name) return String(d.name);
    } catch (e) {}
  }
  var h = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h) return clean(h[1].replace(/<[^>]+>/g, ' '), 160);
  return slug;
}

function canonical(html, requestUrl) {
  var m = html.match(/<link rel="canonical" href="([^"]+)"/i);
  if (m) return m[1];
  return requestUrl.split('#')[0].split('?')[0];
}

async function approvedReviews(env, slug) {
  if (!env.HARGA) return [];
  const raw = await env.HARGA.get('ulasan:' + slug);
  if (!raw) return [];
  try {
    const d = JSON.parse(raw);
    return Array.isArray(d.approved) ? d.approved : [];
  } catch (e) {
    return [];
  }
}

function buildLd(html, url, slug, list) {
  const reviews = [];
  let sum = 0;
  const max = Math.min(list.length, 40);
  for (var i = 0; i < max; i++) {
    const r = list[i];
    const rating = Number(r && r.bintang);
    if (!rating || rating < 1 || rating > 5) continue;
    const author = clean(r.nama, 40);
    const body = clean(r.komentar, 600);
    if (!author || !body) continue;
    const item = {
      '@type': 'Review',
      author: { '@type': 'Person', name: author },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(rating),
        bestRating: '5',
        worstRating: '1'
      },
      reviewBody: body
    };
    const d = isoDate(r.ts);
    if (d) item.datePublished = d;
    reviews.push(item);
    sum += rating;
  }
  // also count valid ratings beyond the 40 included in review[]
  let count = reviews.length;
  let total = sum;
  for (var j = max; j < list.length; j++) {
    const rating = Number(list[j] && list[j].bintang);
    if (rating >= 1 && rating <= 5) { count++; total += rating; }
  }
  if (count < 1) return null;
  const avg = Math.round((total / count) * 10) / 10;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tripName(html, slug),
    url: canonical(html, url),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(avg),
      reviewCount: String(count),
      bestRating: '5',
      worstRating: '1'
    },
    review: reviews
  };
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return next();
  }
  const m = url.pathname.match(PAKET_RE);
  if (!m) return next();
  const slug = m[1].toLowerCase();

  const res = await next();
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('text/html')) return res;

  const html = await res.text();
  const list = await approvedReviews(env, slug);
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  headers.set('cache-control', 'public, max-age=0, must-revalidate, s-maxage=300');

  const ld = list.length ? buildLd(html, url.href, slug, list) : null;
  if (!ld) {
    return new Response(html, { status: res.status, headers, statusText: res.statusText });
  }
  const script = '<script type="application/ld+json">' + jsonSafe(ld) + '</script>\n';
  const out = html.includes('</head>')
    ? html.replace('</head>', script + '</head>')
    : script + html;
  return new Response(out, { status: res.status, headers, statusText: res.statusText });
}
