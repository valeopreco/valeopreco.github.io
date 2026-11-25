/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * SEO determinístico: canonical, og:url e sitemap só existem quando VITE_SITE_URL
 * está definido (nunca publica domínio de exemplo). robots.txt sempre é gerado.
 */
function seo(siteUrl?: string): Plugin {
  const base = siteUrl?.replace(/\/+$/, '');
  const publicRoutes = ['/', '/privacidade', '/termos'];
  return {
    name: 'vale-seo',
    transformIndexHtml(html, ctx) {
      // CSP no HTML para hospedagens sem cabeçalhos (GitHub Pages). Só no build: o dev usa scripts inline.
      if (!ctx.server) {
        const csp = [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self'",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          "worker-src 'self'",
          "manifest-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
        ].join('; ');
        html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`);
      }
      if (!base) return html;
      return html
        .replace('</title>', `</title>\n    <link rel="canonical" href="${base}/" />\n    <meta property="og:url" content="${base}/" />`)
        .replace('content="/og-image.png"', `content="${base}/og-image.png"`)
        .replace('"inLanguage": "pt-BR",', `"inLanguage": "pt-BR",\n        "url": "${base}/",`);
    },
    generateBundle() {
      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /resultado',
        'Disallow: /historico',
        'Disallow: /metas',
        'Disallow: /perfil',
        ...(base ? ['', `Sitemap: ${base}/sitemap.xml`] : []),
        '',
      ].join('\n');
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      if (base) {
        const today = new Date().toISOString().slice(0, 10);
        const urls = publicRoutes.map((r) => `  <url><loc>${base}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n');
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        });
      }
    },
  };
}
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
  // Caminhos relativos: o app funciona na raiz de um domínio ou em subpasta.
  // '/' no GitHub Pages (rotas profundas como /historico/abc); './' só para prévias em subpasta.
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@vale/engine': fileURLToPath(new URL('./packages/engine/src/index.ts', import.meta.url)),
    },
  },
  plugins: [
    react(),
    seo(env.VITE_SITE_URL),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // registrado manualmente em src/app/pwa.ts
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'llms.txt'],
      manifest: {
        name: 'VALE? — O preço é só o começo',
        short_name: 'VALE?',
        description: 'Antes de comprar, veja quanto do seu tempo, dos seus hábitos e dos seus objetivos cabe nesse preço.',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#F3F0E7',
        theme_color: '#171717',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,txt}', 'data/ipca.json'],
      },
    }),
  ],
  test: {
    include: ['packages/engine/test/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
};
});
