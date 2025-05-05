self.addEventListener('install', (e) => {
  self.skipWaiting(); // Instalación rápida
});

self.addEventListener('fetch', (e) => {
  // Por ahora no hacemos nada especial
});
