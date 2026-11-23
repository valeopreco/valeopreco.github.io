/** Registra o service worker só em produção e em contexto seguro (HTTPS). */
export function registerPWA() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) return;
  if (import.meta.env.VITE_DISABLE_SW === 'true') return;
  window.addEventListener('load', () => {
    import('virtual:pwa-register')
      .then(({ registerSW }) => registerSW({ immediate: true }))
      .catch(() => {
        /* sem service worker: o app continua funcionando on-line */
      });
  });
}
