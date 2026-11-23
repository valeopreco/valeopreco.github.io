import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatBRL, type Cents } from '@vale/engine';
import { Icon } from './Icon';

/** Valor em reais com algarismos tabulares e Space Grotesk. */
export function MoneyValue({ cents, compact, className = '' }: { cents: Cents; compact?: boolean; className?: string }) {
  return <span className={`num font-semibold ${className}`}>{formatBRL(cents, compact ? { compact } : {})}</span>;
}

/** Selo discreto para resultados estimados. */
export function EstimateTag({ children = 'estimativa' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-[6px] border border-line px-1.5 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted">
      {children}
    </span>
  );
}

export function SourceNote({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[12.5px] leading-snug text-muted">{children}</p>;
}

export function Card({ children, className = '', as: As = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) {
  return <As className={`rounded-lg border border-line bg-card p-5 sm:p-6 ${className}`}>{children}</As>;
}

/**
 * Moldura comum dos blocos de percepção: a pergunta, o número em destaque e a explicação.
 * Raio externo 20, padding 20 → elementos internos usam raio 8 (≈ 20 − 12).
 */
export function InsightCard({
  icon,
  question,
  children,
  tag,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  question: string;
  children: ReactNode;
  tag?: ReactNode;
}) {
  return (
    <Card className="fade-in">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[14px] font-semibold text-muted">
          <Icon name={icon} size={18} />
          {question}
        </h2>
        {tag}
      </div>
      {children}
    </Card>
  );
}

/** Bloco que depende de dado que a pessoa ainda não informou. */
export function SetupCard({ icon, question, text, to, cta }: { icon: Parameters<typeof Icon>[0]['name']; question: string; text: string; to: string; cta: string }) {
  return (
    <section className="rounded-lg border border-dashed border-[color-mix(in_oklch,var(--vale-ink)_22%,transparent)] p-5 sm:p-6">
      <h2 className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-muted">
        <Icon name={icon} size={18} />
        {question}
      </h2>
      <p className="text-[15px] text-ink">{text}</p>
      <Link
        to={to}
        className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-lime-ink underline decoration-[color-mix(in_oklch,var(--vale-lime-ink)_40%,transparent)] underline-offset-4 hover:decoration-current"
      >
        {cta}
        <Icon name="chevron" size={16} />
      </Link>
    </section>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-card px-6 py-10 text-center">
      <p className="font-display text-[20px] font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-[34ch] text-[15px] text-muted">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-md bg-gray-warm ${className}`} />;
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Carregando">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-[76px]" />
      ))}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-line bg-card p-5 text-[15px]">
      <p className="font-semibold">Não deu para carregar.</p>
      <p className="mt-1 text-muted">{message}</p>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
