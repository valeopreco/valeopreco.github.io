import { useEffect, type ReactNode } from 'react';

const HOME_TITLE = 'VALE? — O preço é só o começo';
const PRIVATE = new Set(['Resultado', 'Histórico', 'Avaliação', 'Metas', 'Perfil']);

/** Título único por rota; áreas pessoais recebem noindex. */
export function RouteTitle({ title, children }: { title: string | null; children: ReactNode }) {
  useEffect(() => {
    document.title = title ? `${title} · VALE?` : HOME_TITLE;
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = title && PRIVATE.has(title) ? 'noindex, nofollow' : 'index, follow';
  }, [title]);
  return <>{children}</>;
}
