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
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Passo 2: Regras de Pagamento</h2>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Quando você recebe o salário?</p>
        <select
          className="input-field"
          value={data.dia_pagamento.toString()}
          onChange={(e) => update('dia_pagamento', e.target.value === 'ultimo' ? 'ultimo' : Number(e.target.value))}
        >
          <option value="ultimo">Último dia útil do mês</option>
          <option value="5">Quinto dia útil do mês seguinte</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id="tem_adiantamento"
          checked={data.tem_adiantamento}
          onChange={(e) => update('tem_adiantamento', e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        <label htmlFor="tem_adiantamento">Recebo adiantamento salarial (Vale)</label>
      </div>

      {data.tem_adiantamento && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor do Adiantamento (R$)</p>
            <MathInput
              value={data.valor_adiantamento || 0}
              onChange={(val) => update('valor_adiantamento', val)}
              placeholder="Ex: 0.3*8000"
            />
          </div>
          <div>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Dia do Adiantamento</p>
            <MathInput
              value={data.dia_adiantamento || 0}
              onChange={(val) => update('dia_adiantamento', val)}
              placeholder="Ex: 15 ou 20"
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={onBack}>&larr; Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo &rarr;</button>
      </div>
    </div>
  );
}
