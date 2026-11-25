import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Icon, type IconName } from './Icon';
import { LogoLink } from './Brand';
import { useApp } from '@/stores/app';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Avaliar', icon: 'home' },
  { to: '/historico', label: 'Histórico', icon: 'history' },
  { to: '/metas', label: 'Metas', icon: 'target' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
];

function navCls(active: boolean, layout: 'bar' | 'side') {
  const common = 'flex items-center rounded-sm font-semibold transition-colors';
  const tone = active ? 'text-ink bg-[color-mix(in_oklch,var(--vale-lime)_70%,transparent)]' : 'text-muted hover:text-ink';
  return layout === 'bar'
    ? `${common} ${tone} min-h-[52px] flex-1 flex-col justify-center gap-0.5 text-[12px]`
    : `${common} ${tone} min-h-[44px] gap-3 px-3 text-[15px]`;
}

function Toaster() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`fade-in pointer-events-auto max-w-md rounded-md px-4 py-3 text-left text-[14px] font-semibold ${
            t.tone === 'error' ? 'bg-danger text-card' : 'bg-ink text-paper'
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}

function StorageBanner() {
  const mode = useApp((s) => s.mode);
  if (mode !== 'memory') return null;
  return (
    <p className="mb-4 rounded-md border border-line bg-card px-4 py-3 text-[13.5px] text-muted">
      Este navegador não permite guardar dados no aparelho. Suas avaliações valem até você fechar a página.
    </p>
  );
}

export function AppShell() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[240px_1fr]">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Pular para o conteúdo
      </a>

      {/* Desktop: navegação lateral */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-line px-5 py-6 lg:flex">
        <LogoLink />
        <p className="mt-1 text-[13px] text-muted">O preço é só o começo.</p>
        <nav aria-label="Principal" className="mt-8 flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => navCls(isActive, 'side')}>
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <nav aria-label="Legal" className="mt-auto flex flex-col gap-1 text-[13px] text-muted">
          <NavLink to="/privacidade" className="hover:text-ink">Política de Privacidade</NavLink>
          <NavLink to="/termos" className="hover:text-ink">Termos de Uso</NavLink>
        </nav>
      </aside>

      <div className="flex min-h-[100dvh] flex-col">
        <header className="flex items-center justify-between px-5 pt-4 lg:hidden">
          <LogoLink />
        </header>
        <main id="conteudo" className={`mx-auto w-full flex-1 ${pathname === '/' ? 'max-w-app lg:max-w-[64rem]' : 'max-w-app'} px-5 pb-[calc(104px+env(safe-area-inset-bottom))] pt-4 lg:pb-16 lg:pt-12`}>
          <StorageBanner />
          <Outlet />
        </main>
      </div>

      {/* Celular: barra inferior */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-line bg-paper px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      >
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => navCls(isActive, 'bar')}>
            <Icon name={n.icon} size={22} />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <Toaster />
    </div>
  );
}
