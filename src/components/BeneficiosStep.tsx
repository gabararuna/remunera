import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BeneficiosStep({ data, update, onNext, onBack }: Props) {
  const isPJ = data.regime_trabalho === 'pj';
  const isServidor = data.regime_trabalho === 'servidor_federal' || data.regime_trabalho === 'servidor_estadual';

  const plrLabel = isPJ ? 'Distribuição Extra / Bônus (R$)' : isServidor ? 'Gratificação Extraordinária (R$)' : 'Valor Bruto da PLR';
  const plrDateLabel = isPJ ? 'Data da Distribuição Extra' : isServidor ? 'Data da Gratificação' : 'Data de Pagamento da PLR';
  const plrNote = isPJ
    ? 'Distribuição adicional de lucros em data específica. Isenta de IR no Simples Nacional.'
    : isServidor
    ? 'Gratificação eventual não recorrente. Tributada pela tabela IRRF normal.'
    : null;

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>
        Passo 4: {isPJ ? 'Benefícios e Distribuição de Lucros' : 'Benefícios e PLR'}
      </h2>

      {/* PJ: Distribuição de lucros mensal */}
      {isPJ && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,191,165,0.04)', borderRadius: '16px', border: '1px solid rgba(0,191,165,0.12)' }}>
          <label className="field-label">Distribuição de Lucros Mensal (R$)</label>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Valor que você distribui mensalmente como lucro da empresa para si. Isento de IR no Simples Nacional.
          </p>
          <MathInput
            value={data.distribuicao_lucros || 0}
            onChange={(val) => update('distribuicao_lucros', val)}
            placeholder="Ex: 8000.00"
          />
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <label className="field-label">{isPJ ? 'Ticket / Vale Refeição (R$)' : 'Ticket Mensal (VR/VA)'}</label>
        <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
          {isPJ
            ? 'Vale alimentação ou refeição pago pela empresa. Entra no saldo em conta.'
            : 'Vale Refeição e/ou Alimentação recebido mensalmente. Entra no saldo em conta, mas não é tributado.'}
        </p>
        <MathInput
          value={data.ticket_mensal || 0}
          onChange={(val) => update('ticket_mensal', val)}
          placeholder="Ex: 800.00"
        />
      </div>

      {!isPJ && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <label className="field-label">Ticket de Natal (R$)</label>
            <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
              {isServidor ? 'Cesta ou cartão de natal, se houver.' : 'Cesta ou cartão de natal fornecido pela empresa. Não tributado.'}
            </p>
            <MathInput
              value={data.ticket_anual || 0}
              onChange={(val) => update('ticket_anual', val)}
              placeholder="Ex: 1500.00"
            />
          </div>
          <div>
            <label className="field-label">Data do Ticket de Natal</label>
            <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
              Data em que será creditado na projeção.
            </p>
            <input
              type="date"
              className="input-field"
              value={data.data_ticket_anual && !isNaN(data.data_ticket_anual.getTime()) ? data.data_ticket_anual.toISOString().split('T')[0] : ''}
              onChange={(e) => update('data_ticket_anual', new Date(e.target.value))}
            />
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
          {plrNote ?? (isPJ
            ? 'Pagamento pontual em data específica.'
            : 'Participação nos Lucros e Resultados — tributada por tabela própria mais favorável que o IRRF mensal.')}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="field-label">{plrLabel}</label>
            <MathInput
              value={data.plr_bruto || 0}
              onChange={(val) => update('plr_bruto', val)}
              placeholder="Ex: 5000"
            />
          </div>
          <div>
            <label className="field-label">{plrDateLabel}</label>
            <input
              type="date"
              className="input-field"
              value={data.data_plr && !isNaN(data.data_plr.getTime()) ? data.data_plr.toISOString().split('T')[0] : ''}
              onChange={(e) => update('data_plr', new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>
        {isPJ ? 'Benefícios em Espécie' : isServidor ? 'Benefícios do Cargo' : 'Valores Custeados pela Empresa'}
      </h3>
      <p style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {isPJ
          ? 'Informe o custo real dos planos que você contrata via empresa para si.'
          : 'Informe o custo real desses planos, não é o valor descontado, pois compõem sua qualidade de vida.'
        }
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <label className="field-label">Plano de Saúde (R$)</label>
          <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
            {isPJ ? 'Custo do plano contratado via PJ.' : 'Custo total do plano, incluindo a parte da empresa.'}
          </p>
          <MathInput
            value={data.plano_saude || 0}
            onChange={(val) => update('plano_saude', val)}
            placeholder="Ex: 600.00"
          />
        </div>
        <div>
          <label className="field-label">Plano Odontológico (R$)</label>
          <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
            Custo mensal do plano odonto, se houver.
          </p>
          <MathInput
            value={data.plano_odonto || 0}
            onChange={(val) => update('plano_odonto', val)}
            placeholder="Ex: 50.00"
          />
        </div>
        <div>
          <label className="field-label">Seguro de Vida (R$)</label>
          <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
            Custo do seguro de vida em grupo custeado pelo empregador.
          </p>
          <MathInput
            value={data.seguro_vida || 0}
            onChange={(val) => update('seguro_vida', val)}
            placeholder="Ex: 20.00"
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
