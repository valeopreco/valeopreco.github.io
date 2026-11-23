import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

const inputCls =
  'w-full rounded-sm border border-line bg-card px-3 min-h-[48px] text-[16px] text-ink placeholder:text-muted outline-none focus:border-ink focus-visible:outline-none focus:ring-2 focus:ring-[color-mix(in_oklch,var(--vale-lime-dark)_45%,transparent)] aria-[invalid=true]:border-danger';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  optional?: boolean;
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode;
}

/** Rótulo, ajuda e erro ligados ao controle por id (acessível a leitores de tela). */
export function Field({ label, hint, error, optional, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[14px] font-semibold text-ink">
        {label}
        {optional && <span className="ml-1.5 font-medium text-muted">(opcional)</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-[13px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...p }, ref) {
  return <input ref={ref} className={`${inputCls} ${className}`} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = '', ...p },
  ref,
) {
  return <textarea ref={ref} className={`${inputCls} py-2.5 min-h-[88px] resize-y ${className}`} {...p} />;
});

/** Campo monetário: teclado numérico no celular, aceita "300" e "1.299,90". */
export const MoneyInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { big?: boolean }>(
  function MoneyInput({ big, className = '', ...p }, ref) {
    return (
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display font-semibold text-muted ${big ? 'text-[22px] left-4' : 'text-[16px]'}`}
          aria-hidden="true"
        >
          R$
        </span>
        <input
          ref={ref}
          inputMode="decimal"
          autoComplete="off"
          className={`${inputCls} num ${big ? 'min-h-[68px] pl-14 text-[30px] font-semibold rounded-md' : 'pl-10'} ${className}`}
          {...p}
        />
      </div>
    );
  },
);
