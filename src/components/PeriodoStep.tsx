import { useState, useEffect } from 'react';
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
  const [inpcLabel, setInpcLabel] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v3/agregados/1736/periodos/last/variaveis/2265?localidades=N1[all]')
      .then(r => r.json())
      .then(json => {
        const serie = json?.[0]?.resultados?.[0]?.series?.[0]?.serie;
        if (!serie) return;
        const val = parseFloat(Object.values(serie)[0] as string);
        if (isNaN(val)) return;
        setInpcLabel(`INPC 12m: ${val.toFixed(2).replace('.', ',')}%`);
        if (data.aumento_percentual === 0) {
          update('aumento_percentual', val);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '0.4rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>
        Passo 1: Período e Premissas
      </h2>
      <p style={{ marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Defina o regime de contratação, o horizonte da projeção e o salário base. Esses dados fundamentam todos os cálculos seguintes.
      </p>

      {/* Regime de trabalho */}
      <div style={{ marginBottom: '2rem' }}>
        <label className="field-label">Qual é o seu regime de trabalho?</label>
        <p style={{ marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
          Cada regime tem regras próprias de tributação, encargos e benefícios legais.
        </p>
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

      {/* Data e horizonte */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <label className="field-label">Data Inicial da Projeção</label>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
            A partir de quando você deseja projetar. Use o dia de hoje para ver a remuneração mais recente.
          </p>
          <input
            type="date"
            className="input-field"
            value={data.data_inicio && !isNaN(data.data_inicio.getTime()) ? data.data_inicio.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_inicio', new Date(e.target.value))}
          />
        </div>
        <div>
          <label className="field-label">Meses a Projetar</label>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
            Quantos meses à frente visualizar. Recomendamos 12 meses que cobre um ano fiscal completo.
          </p>
          <MathInput
            value={data.meses_projecao}
            onChange={(val) => update('meses_projecao', val)}
            placeholder="Ex: 12"
          />
        </div>
      </div>

      {/* Previsão de aumento */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <label className="field-label" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', margin: 0 }}>
            Previsão de Aumento Salarial
          </label>
          {inpcLabel && (
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'rgba(0,191,165,0.12)',
              color: 'var(--accent-color)',
              border: '1px solid rgba(0,191,165,0.25)',
              whiteSpace: 'nowrap',
            }}>
              {inpcLabel} · IBGE
            </span>
          )}
        </div>
        <p style={{ marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
          Informe o percentual e o mês de previsto caso existe reajuste previsto. O percentual foi preenchido com o INPC acumulado dos últimos 12 meses. Outubro é o mês mais comum para reajuste com base nos acordos coletivos.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="field-label">Percentual de Aumento (%)</label>
            <MathInput
              value={data.aumento_percentual}
              onChange={(val) => update('aumento_percentual', val)}
              placeholder="Ex: 5.06"
            />
          </div>
          <div>
            <label className="field-label">Mês de Vigência</label>
            <input
              type="month"
              className="input-field"
              value={data.mes_aumento && !isNaN(data.mes_aumento.getTime()) ? data.mes_aumento.toISOString().slice(0, 7) : ''}
              onChange={(e) => update('mes_aumento', e.target.value ? new Date(e.target.value + '-02T00:00:00') : null)}
            />
          </div>
        </div>
      </div>

      {/* Salário base */}
      <div style={{ marginBottom: '1rem' }}>
        <label className="field-label">
          {regime === 'pj' ? 'Pró-labore Bruto Inicial (R$)' : 'Salário / Vencimento Bruto Inicial (R$)'}
        </label>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.75 }}>
          {regime === 'pj'
            ? 'Valor do pró-labore conforme contrato. Suporta expressões matemáticas como: 8356.82 ou 1,3*8356.82.'
            : 'Salário bruto conforme carteira ou contrato. Suporta expressões matemáticas como: 8356.82 ou 1,3*8356.82.'}
        </p>
        <MathInput
          value={data.salario_bruto || 0}
          onChange={(val) => update('salario_bruto', val)}
          placeholder={regime === 'pj' ? 'Ex: 8356.82' : 'Ex: 8356.82 ou 1*8356.82'}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button className="btn-primary" onClick={onNext} disabled={!data.salario_bruto}>Próximo Passo</button>
      </div>
    </div>
  );
}
