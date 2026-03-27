import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DescontosStep({ data, update, onNext, onBack }: Props) {
  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Passo 5: Descontos e Dependentes</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Número de Dependentes (IRRF)</p>
        <MathInput
          value={data.dependentes}
          onChange={(val) => update('dependentes', Math.floor(Math.max(0, val)))}
        />
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Descontos em Folha Fixos (Mensal R$)</p>
        <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Inclua aqui o valor que você paga pelos benefícios, o valor descontado na sua folha.</p>
        <MathInput
          value={data.outros_descontos || 0}
          onChange={(val) => update('outros_descontos', val)}
          placeholder="Ex: 150.00"
        />
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Previdência Privada (Mensal R$)</p>
        <div style={{ marginBottom: '1rem' }}>
          <MathInput
            value={data.previdencia_valor || 0}
            onChange={(val) => update('previdencia_valor', val)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="incide_prev_13"
            checked={data.incide_prev_13}
            onChange={(e) => update('incide_prev_13', e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="incide_prev_13">Descontar previdência também no 13º?</label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={onBack}>&larr; Voltar</button>
        <button className="btn-primary" style={{ background: 'var(--success-color)' }} onClick={onNext}>Gerar Projeção</button>
      </div>
    </div>
  );
}
