import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm font-body font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] px-4 text-[15px]';

const variants: Record<Variant, string> = {
  primary: 'bg-lime text-ink hover:bg-[color-mix(in_oklch,var(--vale-lime),var(--vale-ink)_8%)] active:bg-lime-dark',
  secondary: 'bg-card text-ink border border-line hover:bg-gray-warm',
  ghost: 'text-ink hover:bg-[color-mix(in_oklch,var(--vale-ink)_6%,transparent)]',
  danger: 'bg-card text-danger border border-[color-mix(in_oklch,var(--vale-danger)_35%,transparent)] hover:bg-[color-mix(in_oklch,var(--vale-danger)_8%,var(--vale-white))]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', block, className = '', type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={`${base} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`} {...rest} />;
});
