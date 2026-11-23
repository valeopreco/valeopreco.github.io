import { Link } from 'react-router-dom';

/** Marca VALE? — o ponto de interrogação leva o acento lima. */
export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'text-[44px] sm:text-[56px]' : 'text-[22px]';
  return (
    <span className={`font-display font-bold leading-none tracking-[-0.03em] ${cls}`}>
      VALE
      <span className="relative ml-[0.04em] inline-block">
        <span aria-hidden="true" className="absolute inset-x-[-0.08em] bottom-[0.08em] top-[0.18em] -z-0 rounded-[0.12em] bg-lime" />
        <span className="relative">?</span>
      </span>
    </span>
  );
}

export function LogoLink() {
  return (
    <Link to="/" className="inline-flex min-h-[44px] items-center" aria-label="VALE? — início">
      <Logo />
    </Link>
  );
}
