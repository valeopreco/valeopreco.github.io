/**
 * Ícones lineares desenhados para o VALE?: traço 1.75 (casa com o peso 500/600 da Manrope),
 * pontas arredondadas, grade de 24. Só os que a interface usa.
 */
const paths = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  history: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4.5l3 2',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.3-3.5 4.2-5 7.5-5s6.2 1.5 7.5 5',
  back: 'M15 5l-7 7 7 7',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  trash: 'M4.5 7h15M10 11v6M14 11v6M6 7l1 12.5a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7M9 7V4.5h6V7',
  edit: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17zM14 7l3 3',
  chevron: 'M9 5l7 7-7 7',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  repeat: 'M17 2.5 20.5 6 17 9.5M3.5 11V9a3 3 0 0 1 3-3h14M7 21.5 3.5 18 7 14.5M20.5 13v2a3 3 0 0 1-3 3h-14',
  scale: 'M12 4v16M5 20h14M6 8h12M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z',
  ticket: 'M4 7h16v3.5a1.5 1.5 0 0 0 0 3V17H4v-3.5a1.5 1.5 0 0 0 0-3zM14 7v10',
  download: 'M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14',
  cloud: 'M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18.5z',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.5h.01',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}
