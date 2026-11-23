import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/index.css';
import { router } from './app/router';
import { bootstrap } from './app/bootstrap';
import { registerPWA } from './app/pwa';

const root = createRoot(document.getElementById('root')!);

bootstrap()
  .catch((e) => console.error('Falha ao iniciar armazenamento', e))
  .finally(() => {
    root.render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });

registerPWA();
