import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './styles/index.css';
import { router } from './app/router';
import { bootstrap } from './app/bootstrap';
import { registerPWA } from './app/pwa';
import { MemoryRepository } from './data/repositories/memoryRepo';
import { useApp } from './stores/app';

// Desenha o app imediatamente; o armazenamento abre em paralelo.
// Telas que dependem dele mostram o esqueleto de carregamento até ficar pronto.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

bootstrap().catch((e) => {
  console.error('Falha ao iniciar armazenamento', e);
  // Nunca deixa as telas carregando para sempre: segue em memória.
  if (!useApp.getState().repo) useApp.getState().setRepo(new MemoryRepository(), 'memory');
});

registerPWA();
