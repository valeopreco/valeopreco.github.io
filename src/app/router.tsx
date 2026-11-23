import { createBrowserRouter, createHashRouter, type RouteObject } from 'react-router-dom';
import type { ComponentType } from 'react';
import { AppShell } from '@/components/vale/AppShell';
import { EvaluatePage } from '@/features/evaluation/EvaluatePage';
import { ResultPage } from '@/features/evaluation/ResultPage';
import { NotFoundPage } from '@/features/legal/NotFoundPage';
import { RouteTitle } from './RouteTitle';

/** Telas secundárias carregam sob demanda; avaliar e resultado vêm no pacote principal. */
function lazy(title: string, load: () => Promise<ComponentType>): Pick<RouteObject, 'lazy'> {
  return {
    lazy: async () => {
      const C = await load();
      return { element: <RouteTitle title={title}><C /></RouteTitle> };
    },
  };
}

const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <RouteTitle title={null}><EvaluatePage /></RouteTitle> },
      { path: '/resultado', element: <RouteTitle title="Resultado"><ResultPage /></RouteTitle> },
      { path: '/historico', ...lazy('Histórico', () => import('@/features/history/HistoryPage').then((m) => m.HistoryPage)) },
      { path: '/historico/:id', ...lazy('Avaliação', () => import('@/features/history/HistoryDetailPage').then((m) => m.HistoryDetailPage)) },
      { path: '/metas', ...lazy('Metas', () => import('@/features/goals/GoalsPage').then((m) => m.GoalsPage)) },
      { path: '/perfil', ...lazy('Perfil', () => import('@/features/profile/ProfilePage').then((m) => m.ProfilePage)) },
      { path: '/privacidade', ...lazy('Política de Privacidade', () => import('@/features/legal/LegalPages').then((m) => m.PrivacyPage)) },
      { path: '/termos', ...lazy('Termos de Uso', () => import('@/features/legal/LegalPages').then((m) => m.TermsPage)) },
      { path: '*', element: <RouteTitle title="Página não encontrada"><NotFoundPage /></RouteTitle> },
    ],
  },
];

/** Hash router quando o host não reescreve rotas (prévia estática); browser router na Vercel. */
export const router = import.meta.env.VITE_HASH_ROUTER === 'true' ? createHashRouter(routes) : createBrowserRouter(routes);
