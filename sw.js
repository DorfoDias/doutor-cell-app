// Service worker do Doutor Cell: deixa o sistema abrir como aplicativo no
// celular e mostra a última versão carregada se a internet cair.
// Estratégia: rede primeiro (sempre a versão mais nova); cache só de reserva.
const CACHE = 'doutor-cell-v2026-10-17'

self.addEventListener('install', (e) => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // Só arquivos do próprio site (nunca o banco de dados)
  if (url.origin !== self.location.origin) return
  e.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp.ok) {
          const copia = resp.clone()
          caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {})
        }
        return resp
      })
      .catch(() =>
        caches.match(req).then((emCache) => emCache || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))
      )
  )
})
