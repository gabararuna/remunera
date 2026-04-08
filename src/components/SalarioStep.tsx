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
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>Passo 2: Regras de Pagamento</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="field-label">Quando você recebe o salário?</label>
        <select
          className="input-field"
          value={data.dia_pagamento.toString()}
          onChange={(e) => update('dia_pagamento', e.target.value === 'ultimo' ? 'ultimo' : Number(e.target.value))}
        >
          <option value="ultimo">Último dia útil do mês</option>
          <option value="5">Quinto dia útil do mês seguinte</option>
        </select>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <input
          type="checkbox"
          id="tem_adiantamento"
          checked={data.tem_adiantamento}
          onChange={(e) => update('tem_adiantamento', e.target.checked)}
          style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
        />
        <label htmlFor="tem_adiantamento" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>Recebo adiantamento salarial (Vale)</label>
      </div>

      {data.tem_adiantamento && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label className="field-label">Valor do Adiantamento (R$)</label>
            <MathInput
              value={data.valor_adiantamento || 0}
              onChange={(val) => update('valor_adiantamento', val)}
              placeholder="Ex: 0.3*8000"
            />
          </div>
          <div>
            <label className="field-label">Dia do Adiantamento</label>
            <MathInput
              value={data.dia_adiantamento || 0}
              onChange={(val) => update('dia_adiantamento', val)}
              placeholder="Ex: 15 ou 20"
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
