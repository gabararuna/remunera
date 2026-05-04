import type { RegimeTrabalho, SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
}

const REGIMES: { value: RegimeTrabalho; label: string; desc: string }[] = [
  { value: 'clt', label: 'CLT', desc: 'INSS + FGTS + 13º + Férias + Rescisão' },
  { value: 'pj', label: 'Pessoa Jurídica', desc: 'Pró-labore + Distribuição de Lucros' },
  { value: 'servidor_federal', label: 'Servidor Federal', desc: 'RPPS Federal + 13º + Férias' },
  { value: 'servidor_estadual', label: 'Servidor Estadual', desc: 'RPPS Estadual + 13º + Férias' },
];

export function PeriodoStep({ data, update, onNext }: Props) {
  const regime = data.regime_trabalho || 'clt';
  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>Passo 1: Período e Premissas</h2>

      <div style={{ marginBottom: '2rem' }}>
        <label className="field-label">Qual é o seu regime de trabalho?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
          {REGIMES.map(r => (
            <button
              key={r.value}
              onClick={() => update('regime_trabalho', r.value)}
              style={{
                padding: '1rem',
                borderRadius: '12px',
                border: `1px solid ${regime === r.value ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)'}`,
                background: regime === r.value ? 'rgba(0,191,165,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
                boxShadow: regime === r.value ? '0 0 16px rgba(0,191,165,0.15)' : 'none',
              }}
            >
              <div style={{ fontWeight: 500, color: regime === r.value ? 'var(--accent-color)' : 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '4px' }}>{r.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label className="field-label">Data Inicial</label>
          <input
            type="date"
            className="input-field"
            value={data.data_inicio && !isNaN(data.data_inicio.getTime()) ? data.data_inicio.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_inicio', new Date(e.target.value))}
          />
        </div>
        <div>
          <label className="field-label">Meses a Projetar</label>
          <MathInput
            value={data.meses_projecao}
            onChange={(val) => update('meses_projecao', val)}
            placeholder="Ex: 12"
          />
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
        <label className="field-label" style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>Previsão de Aumento</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="field-label">Aumento (%)</label>
            <MathInput
              value={data.aumento_percentual}
              onChange={(val) => update('aumento_percentual', val)}
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="field-label">Mês de Efetivação</label>
            <input
              type="month"
              className="input-field"
              value={data.mes_aumento && !isNaN(data.mes_aumento.getTime()) ? data.mes_aumento.toISOString().slice(0, 7) : ''}
              onChange={(e) => update('mes_aumento', e.target.value ? new Date(e.target.value + '-02T00:00:00') : null)}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label className="field-label">
          {regime === 'pj' ? 'Pró-labore Bruto Inicial (R$)' : 'Salário / Vencimento Bruto Inicial (R$)'}
        </label>
        <MathInput
          value={data.salario_bruto || 0}
          onChange={(val) => update('salario_bruto', val)}
          placeholder={regime === 'pj' ? 'Ex: 5000.00' : 'Ex: 8637.40 ou 0.3*8000'}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button className="btn-primary" onClick={onNext} disabled={!data.salario_bruto}>Próximo Passo</button>
      </div>
    </div>
  );
}
