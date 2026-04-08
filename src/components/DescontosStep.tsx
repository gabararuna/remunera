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
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>Passo 5: Descontos e Dependentes</h2>

      <div style={{ marginBottom: '2.5rem' }}>
        <label className="field-label">Número de Dependentes (IRRF)</label>
        <MathInput
          value={data.dependentes}
          onChange={(val) => update('dependentes', Math.floor(Math.max(0, val)))}
        />
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>Descontos em Folha Fixos (Mensal R$)</p>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Inclua aqui o valor que você paga pelos benefícios, o valor descontado na sua folha.</p>
        <MathInput
          value={data.outros_descontos || 0}
          onChange={(val) => update('outros_descontos', val)}
          placeholder="Ex: 150.00"
        />
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <label className="field-label">Previdência Privada (Mensal R$)</label>
        <div style={{ marginBottom: '1.5rem' }}>
          <MathInput
            value={data.previdencia_valor || 0}
            onChange={(val) => update('previdencia_valor', val)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            id="incide_prev_13"
            checked={data.incide_prev_13}
            onChange={(e) => update('incide_prev_13', e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
          />
          <label htmlFor="incide_prev_13" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>Descontar previdência também no 13º?</label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
