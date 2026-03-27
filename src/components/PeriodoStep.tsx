import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
}

export function PeriodoStep({ data, update, onNext }: Props) {
  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Passo 1: Período e Premissas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data Inicial</p>
          <input
            type="date"
            className="input-field"
            value={data.data_inicio && !isNaN(data.data_inicio.getTime()) ? data.data_inicio.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_inicio', new Date(e.target.value))}
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Meses a Projetar</p>
          <MathInput
            value={data.meses_projecao}
            onChange={(val) => update('meses_projecao', val)}
            placeholder="Ex: 12"
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Previsão de Aumento</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Aumento (%)</p>
            <MathInput
              value={data.aumento_percentual}
              onChange={(val) => update('aumento_percentual', val)}
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Mês de Efetivação</p>
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
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Salário Bruto Inicial (R$)</p>
        <MathInput
          value={data.salario_bruto || 0}
          onChange={(val) => update('salario_bruto', val)}
          placeholder="Ex: 8637.40 ou 0.3*8000"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button className="btn-primary" onClick={onNext} disabled={!data.salario_bruto}>Próximo Passo &rarr;</button>
      </div>
    </div>
  );
}
