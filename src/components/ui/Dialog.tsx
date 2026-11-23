import * as D from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { Icon } from '../vale/Icon';
import { Button } from './Button';

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Painel inferior no celular, janela central no desktop. */
export function Dialog({ open, onOpenChange, title, description, children }: Props) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-40 bg-[color-mix(in_oklch,var(--vale-ink)_40%,transparent)]" />
        <D.Content
          className="fade-in fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-lg bg-paper p-6 pb-[max(24px,env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--vale-line)] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(32rem,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg"
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <D.Title className="font-display text-[22px] font-semibold leading-tight">{title}</D.Title>
              {description && <D.Description className="mt-1 text-[14px] text-muted">{description}</D.Description>}
            </div>
            <D.Close asChild>
              <button className="-mr-2 -mt-1 grid h-11 w-11 place-items-center rounded-sm text-muted hover:text-ink" aria-label="Fechar">
                <Icon name="close" />
              </button>
            </D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: Omit<Props, 'children'> & { confirmLabel: string; onConfirm(): void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} {...(description ? { description } : {})}>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
