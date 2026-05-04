import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SalarioStep({ data, update, onNext, onBack }: Props) {
  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '0.4rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>
        Passo 2: Regras de Pagamento
      </h2>
      <p style={{ marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Informe quando você recebe e se há adiantamento salarial. Essas datas determinam o fluxo de caixa projetado mês a mês.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="field-label">Quando você recebe o salário?</label>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
          A data de crédito afeta o saldo projetado em cada mês da visualização.
        </p>
        <select
          className="input-field"
          value={data.dia_pagamento.toString()}
          onChange={(e) => update('dia_pagamento', e.target.value === 'ultimo' ? 'ultimo' : Number(e.target.value))}
        >
          <option value="ultimo">Último dia útil do mês</option>
          <option value="5">Quinto dia útil do mês seguinte</option>
        </select>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <input
            type="checkbox"
            id="tem_adiantamento"
            checked={data.tem_adiantamento}
            onChange={(e) => update('tem_adiantamento', e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)', marginTop: '2px', flexShrink: 0 }}
          />
          <div>
            <label htmlFor="tem_adiantamento" style={{ cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
              Recebo adiantamento salarial
            </label>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75, margin: 0 }}>
              Marque se a empresa paga uma parte do salário antecipadamente, geralmente na primeira quinzena.
            </p>
          </div>
        </div>
      </div>

      {data.tem_adiantamento && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,191,165,0.03)', borderRadius: '16px', border: '1px solid rgba(0,191,165,0.10)' }}>
          <div>
            <label className="field-label">Valor do Adiantamento (R$)</label>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
              Valor em reais. Suporta expressões matemáticas.
            </p>
            <MathInput
              value={data.valor_adiantamento || 0}
              onChange={(val) => update('valor_adiantamento', val)}
              placeholder="0.3*8356.82 ou 2507.05"
            />
          </div>
          <div>
            <label className="field-label">Dia do Adiantamento</label>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
              Dia do mês em que o valor é creditado na conta.
            </p>
            <MathInput
              value={data.dia_adiantamento || 0}
              onChange={(val) => update('dia_adiantamento', val)}
              placeholder="Ex: 15"
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
