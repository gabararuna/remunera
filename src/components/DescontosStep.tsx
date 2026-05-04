import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DescontosStep({ data, update, onNext, onBack }: Props) {
  const isPJ = data.regime_trabalho === 'pj';
  const isServidorEstadual = data.regime_trabalho === 'servidor_estadual';
  const isServidor = data.regime_trabalho === 'servidor_federal' || isServidorEstadual;

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '0.4rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>
        Passo 5: Descontos e Dependentes
      </h2>
      <p style={{ marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {isPJ
          ? 'Informe despesas fixas e contribuições previdenciárias. Elas impactam o resultado líquido mensal.'
          : 'Informe descontos em folha, dependentes e previdência privada para calcular o IRRF corretamente.'}
      </p>

      {/* Dependentes */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <label className="field-label">Número de Dependentes (IRRF)</label>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Cada dependente reduz a base do IRRF em R$ 189,59/mês (2024). Filhos, cônjuge e outros seguem as regras da Receita Federal.
        </p>
        <MathInput
          value={data.dependentes}
          onChange={(val) => update('dependentes', Math.floor(Math.max(0, val)))}
          placeholder="Ex: 0"
        />
      </div>

      {/* PJ: alíquota INSS */}
      {isPJ && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>Alíquota INSS Contribuinte Individual</p>
          <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Calculado sobre o pró-labore, limitado ao teto do RGPS (R$ 8.475,55).
          </p>
          <select
            className="input-field"
            value={data.aliquota_inss_pj || 11}
            onChange={(e) => update('aliquota_inss_pj', Number(e.target.value))}
          >
            <option value={5}>5% — MEI (apenas aposentadoria, sem auxílio-doença)</option>
            <option value={11}>11% — Plano Simplificado (apenas aposentadoria)</option>
            <option value={20}>20% — Plano Completo (cobertura total)</option>
          </select>
        </div>
      )}

      {/* Servidor Estadual: alíquota RPPS */}
      {isServidorEstadual && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <label className="field-label">Alíquota RPPS Estadual (%)</label>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Cada estado define sua própria alíquota, podendo ser flat ou progressiva. Após a EC 103/2019, muitos estados adotaram tabelas progressivas. Consulte o Diário Oficial ou o portal do RPPS do seu estado. Referências comuns: RS 11%, SP 11–14%, RJ 14%, MG 14%.
          </p>
          <MathInput
            value={data.aliquota_rpps_estadual || 14}
            onChange={(val) => update('aliquota_rpps_estadual', val)}
            placeholder="Ex: 14"
          />
        </div>
      )}

      {/* Servidor Federal: nota informativa */}
      {data.regime_trabalho === 'servidor_federal' && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', background: 'rgba(0,191,165,0.04)', border: '1px solid rgba(0,191,165,0.12)', borderRadius: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '4px' }}>RPPS Federal calculado automaticamente</strong>
          Alíquotas progressivas (EC 103/2019): 7,5% → 9% → 12% → 14% → 16,5%, aplicadas por faixa do vencimento.
          Para servidores que ingressaram <strong style={{ color: 'rgba(255,255,255,0.85)' }}>após fevereiro de 2013</strong>, o RPPS incide apenas até o teto do RGPS — o excedente é coberto pelo <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Funpresp</strong> (Exe, Leg ou Jud, conforme o Poder). Para quem ingressou antes, o RPPS cobre o salário integral e o Funpresp não se aplica.
        </div>
      )}

      {/* Descontos fixos */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <label className="field-label">{isPJ ? 'Despesas Fixas PJ (R$/mês)' : 'Desconto em Folha — Benefícios (R$/mês)'}</label>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {isPJ
            ? 'Inclua contador, softwares, taxas bancárias e outros custos fixos mensais da empresa.'
            : 'Valor total descontado em folha pelo uso dos benefícios (plano de saúde, odonto, etc.). É o que a empresa desconta — diferente do custo total do plano.'}
        </p>
        <MathInput
          value={data.outros_descontos || 0}
          onChange={(val) => update('outros_descontos', val)}
          placeholder={isPJ ? 'Ex: 200.00 (contador)' : 'Ex: 14.83'}
        />
      </div>

      {/* Previdência privada */}
      <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <label className="field-label">
          {isPJ ? 'Previdência Privada / PGBL (R$/mês)' : isServidor ? 'Previdência Complementar (R$/mês)' : 'Previdência Privada (R$/mês)'}
        </label>
        {data.regime_trabalho === 'servidor_federal' && (
          <p style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Para servidores pós-2013: contribuição ao Funpresp (Exe, Leg ou Jud). Para os demais, use este campo para plano privado adicional opcional (PGBL/VGBL).
          </p>
        )}
        {isServidorEstadual && (
          <p style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Contribuição ao fundo complementar do seu estado (ex: Prevcom-RS, SPPrev, Funprevsco, Funprev-PR, FUNAPE, Funprev-Bahia), se houver, ou plano privado adicional.
          </p>
        )}
        {!isServidor && (
          <p style={{ marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isPJ
              ? 'Contribuição mensal ao PGBL ou VGBL. Dedutível no IR até 12% da renda bruta no modelo completo.'
              : 'Contribuição mensal ao PGBL ou VGBL. Dedutível no IR até 12% da renda bruta anual no modelo completo.'}
          </p>
        )}
        <div style={{ marginBottom: '1.25rem' }}>
          <MathInput
            value={data.previdencia_valor || 0}
            onChange={(val) => update('previdencia_valor', val)}
            placeholder="Ex: 167.14"
          />
        </div>
        {!isPJ && !isServidor && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input
              type="checkbox"
              id="incide_prev_13"
              checked={data.incide_prev_13}
              onChange={(e) => update('incide_prev_13', e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)', marginTop: '2px', flexShrink: 0 }}
            />
            <label htmlFor="incide_prev_13" style={{ cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1.4 }}>
              Descontar previdência também no 13º salário?
            </label>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
