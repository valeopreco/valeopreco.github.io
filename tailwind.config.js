/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: 'var(--vale-lime)', dark: 'var(--vale-lime-dark)', ink: 'var(--vale-lime-ink)' },
        ink: 'var(--vale-ink)',
        paper: 'var(--vale-paper)',
        gray: { warm: 'var(--vale-gray)' },
        muted: 'var(--vale-muted)',
        card: 'var(--vale-white)',
        line: 'var(--vale-line)',
        danger: 'var(--vale-danger)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '20px' },
      maxWidth: { app: '40rem' },
    },
  },
  plugins: [],
};
