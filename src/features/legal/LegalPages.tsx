import type { ReactNode } from 'react';
import { site } from '@/content/site';

function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="fade-in max-w-[62ch] text-[15px] leading-relaxed [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:font-semibold [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
      <h1 className="font-display text-[30px] font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="text-[13px] text-muted">Atualizado em {site.legalUpdatedAt}.</p>
      {children}
    </article>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Política de Privacidade">
      <p>
        O {site.name} ajuda você a enxergar o que um preço representa antes de comprar. Esta página explica que dados entram no app, onde ficam e
        como você os controla, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>
      <h2>Sem conta</h2>
      <p>
        Tudo o que você digita (preços, renda, horas, metas, avaliações e decisões) fica guardado apenas no seu aparelho, no armazenamento do
        navegador. Nada é enviado para servidores. Apagar os dados do navegador ou usar “Apagar tudo” no Perfil remove essas informações.
      </p>
      <h2>Com conta (opcional)</h2>
      <ul>
        <li>Guardamos seu e-mail para o acesso e os dados que você registrar, para sincronizar entre aparelhos.</li>
        <li>Os dados ficam em um banco Supabase com regras que permitem a cada pessoa ver apenas os próprios registros.</li>
        <li>A base legal é a execução do serviço que você pediu ao criar a conta.</li>
      </ul>
      <h2>O que não fazemos</h2>
      <ul>
        <li>Não vendemos nem compartilhamos seus dados com anunciantes.</li>
        <li>Não usamos inteligência artificial com seus dados; os cálculos são feitos por fórmulas fixas.</li>
        <li>Não usamos cookies de rastreamento.</li>
      </ul>
      <h2>Seus direitos</h2>
      <p>
        Você pode baixar uma cópia dos seus dados e apagá-los a qualquer momento no Perfil. Com conta, a opção “Excluir conta e dados” remove tudo
        de forma definitiva. Dúvidas ou pedidos: <a className="underline underline-offset-4" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
      <p>Responsável: {site.owner}.</p>
    </Legal>
  );
}

export function TermsPage() {
  return (
    <Legal title="Termos de Uso">
      <h2>O que o {site.name} é</h2>
      <p>
        Uma ferramenta de reflexão antes da compra. Ela mostra perspectivas sobre um preço, como tempo de trabalho, equivalências, repetição,
        custo por uso e relação com metas. A decisão é sempre sua; o app não recomenda comprar ou deixar de comprar.
      </p>
      <h2>O que ele não é</h2>
      <p>
        Não é consultoria financeira, contábil ou de investimentos. Os resultados dependem dos dados que você informa e de preços de referência
        que podem ser estimativas, sempre identificadas como tal.
      </p>
      <h2>Uso</h2>
      <ul>
        <li>Use o app de forma lícita e sem tentar acessar dados de outras pessoas.</li>
        <li>Você é responsável pela veracidade do que informa e pela guarda do acesso ao seu e-mail.</li>
        <li>O serviço pode mudar ou ficar indisponível; avaliações salvas mantêm os valores do dia em que foram feitas.</li>
      </ul>
      <h2>Contato</h2>
      <p>
        {site.owner} · <a className="underline underline-offset-4" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      </p>
    </Legal>
  );
}
