import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/vale/bits';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="fade-in">
      <h1 className="sr-only">Página não encontrada</h1>
      <EmptyState
        title="Essa página não existe"
        text="O endereço pode ter mudado ou o registro foi excluído."
        action={<Button onClick={() => navigate('/')}>Avaliar uma compra</Button>}
      />
    </div>
  );
}
