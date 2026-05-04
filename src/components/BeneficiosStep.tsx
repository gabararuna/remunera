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

  const plrLabel = isPJ ? 'Distribuição Extra / Bônus (R$)' : isServidor ? 'Gratificação Extraordinária (R$)' : 'Valor Bruto da PLR (R$)';
  const plrDateLabel = isPJ ? 'Data da Distribuição Extra' : isServidor ? 'Data da Gratificação' : 'Data de Pagamento da PLR';
  const plrNote = isPJ
    ? 'Distribuição adicional de lucros em data específica. Isenta de IR no Simples Nacional.'
    : isServidor
    ? 'Gratificação eventual não recorrente. Tributada pela tabela IRRF normal.'
    : 'Participação nos Lucros e Resultados tributada por tabela própria mais favorável que o IRRF mensal.';

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '0.4rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>
        Passo 4: {isPJ ? 'Benefícios e Distribuição de Lucros' : 'Benefícios e PLR'}
      </h2>
      <p style={{ marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {isPJ
          ? 'Informe os benefícios recebidos via empresa. Eles entram no cálculo da remuneração total.'
          : 'Informe tickets, PLR e planos custeados pela empresa. Eles compõem sua remuneração total além do salário.'}
      </p>

      {/* PJ: Distribuição de lucros mensal */}
      {isPJ && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,191,165,0.04)', borderRadius: '16px', border: '1px solid rgba(0,191,165,0.12)' }}>
          <label className="field-label">Distribuição de Lucros Mensal (R$)</label>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Valor que você distribui mensalmente como lucro para si. Isento de IR no Simples Nacional.
          </p>
          <MathInput
            value={data.distribuicao_lucros || 0}
            onChange={(val) => update('distribuicao_lucros', val)}
            placeholder="Ex: 8000.00"
          />
        </div>
      )}

      {/* Ticket mensal */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label className="field-label">{isPJ ? 'Ticket / Vale Refeição (R$)' : 'Ticket Mensal — VR/VA (R$)'}</label>
        <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
          {isPJ
            ? 'Vale alimentação ou refeição pago pela empresa. Entra no saldo em conta.'
            : 'Vale Refeição e/ou Alimentação recebido mensalmente. Não é tributado — entra direto no saldo disponível.'}
        </p>
        <MathInput
          value={data.ticket_mensal || 0}
          onChange={(val) => update('ticket_mensal', val)}
          placeholder="Ex: 1510.51"
        />
      </div>

      {/* Ticket natal e PLR (não-PJ) */}
      {!isPJ && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <label className="field-label" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '1rem', display: 'block' }}>
            {isServidor ? 'Benefícios Anuais' : 'Ticket de Natal'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="field-label">Valor do Ticket de Natal (R$)</label>
              <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
                {isServidor ? 'Cesta ou cartão de natal, se houver.' : 'Cesta de natal fornecida pela empresa. Não tributado.'}
              </p>
              <MathInput
                value={data.ticket_anual || 0}
                onChange={(val) => update('ticket_anual', val)}
                placeholder="Ex: 1943.90"
              />
            </div>
            <div>
              <label className="field-label">Data do Ticket de Natal</label>
              <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
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
        </div>
      )}

      {/* PLR / Bônus */}
      <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label className="field-label" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '0.5rem', display: 'block' }}>
          {isPJ ? 'Distribuição / Bônus Pontual' : isServidor ? 'Gratificação Extraordinária' : 'Participação nos Lucros e Resultados'}
        </label>
        <p style={{ marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
          {plrNote}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="field-label">{plrLabel}</label>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
              Suporta expressões matemáticas como: 2*8356.82.
            </p>
            <MathInput
              value={data.plr_bruto || 0}
              onChange={(val) => update('plr_bruto', val)}
              placeholder="2*8356.82 ou 16713.64"
            />
          </div>
          <div>
            <label className="field-label">{plrDateLabel}</label>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
              Data de pagamento prevista na projeção.
            </p>
            <input
              type="date"
              className="input-field"
              value={data.data_plr && !isNaN(data.data_plr.getTime()) ? data.data_plr.toISOString().split('T')[0] : ''}
              onChange={(e) => update('data_plr', new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Planos custeados pela empresa */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.4rem', fontSize: '1rem', fontWeight: 500 }}>
          {isPJ ? 'Benefícios em Espécie' : isServidor ? 'Benefícios do Cargo' : 'Planos Custeados pela Empresa'}
        </h3>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {isPJ
            ? 'Informe o custo real dos planos que você contrata via empresa para si. Compõem o custo-benefício total.'
            : 'Informe o custo total de cada plano, não o valor descontado em folha. Eles representam remuneração indireta.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <label className="field-label">Plano de Saúde (R$)</label>
            <MathInput
              value={data.plano_saude || 0}
              onChange={(val) => update('plano_saude', val)}
              placeholder="Ex: 629.15"
            />
          </div>
          <div>
            <label className="field-label">Plano Odontológico (R$)</label>
            <MathInput
              value={data.plano_odonto || 0}
              onChange={(val) => update('plano_odonto', val)}
              placeholder="Ex: 11.26"
            />
          </div>
          <div>
            <label className="field-label">Seguro de Vida (R$)</label>
            <MathInput
              value={data.seguro_vida || 0}
              onChange={(val) => update('seguro_vida', val)}
              placeholder="Ex: 15.93"
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
