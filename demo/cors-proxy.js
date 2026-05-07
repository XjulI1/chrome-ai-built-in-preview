// Mini proxy CORS local — zéro dépendance.
// Lance avec :  node cors-proxy.js
// Puis dans la page web, le proxy est en http://localhost:8787/
//
// Usage :
//   GET http://localhost:8787/?url=https%3A%2F%2Fapi.search.brave.com%2F...
//
// Tous les headers (dont X-Subscription-Token) sont forwardés à la cible.

const http  = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = 8787;
const ALLOWED_HOSTS = ['api.search.brave.com']; // sécurité : on ne proxy que ces hôtes

http.createServer((req, res) => {
  // CORS headers — autorise tout depuis le navigateur
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Max-Age',       '600');

  // Préflight
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // Récupère l'URL cible : ?url=...
  const incoming = new URL(req.url, `http://localhost:${PORT}`);
  const target   = incoming.searchParams.get('url');
  if (!target) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Param "url" manquant.' }));
  }

  let targetUrl;
  try { targetUrl = new URL(target); }
  catch { res.writeHead(400); return res.end('URL invalide'); }

  if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: `Hôte non autorisé : ${targetUrl.hostname}` }));
  }

  // Prépare les headers à forwarder (on retire ceux qui posent problème)
  const fwdHeaders = { ...req.headers };
  delete fwdHeaders.host;
  delete fwdHeaders.origin;
  delete fwdHeaders.referer;
  delete fwdHeaders['sec-fetch-mode'];
  delete fwdHeaders['sec-fetch-site'];
  delete fwdHeaders['sec-fetch-dest'];

  const proxyReq = https.request(targetUrl, {
    method: req.method,
    headers: fwdHeaders
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[proxy] error', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  req.pipe(proxyReq);
}).listen(PORT, () => {
  console.log(`✅ CORS proxy lancé sur http://localhost:${PORT}`);
  console.log(`   Hôtes autorisés : ${ALLOWED_HOSTS.join(', ')}`);
  console.log(`   Ctrl+C pour arrêter.`);
});
