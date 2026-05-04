import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FeriasStep({ data, update, onNext, onBack }: Props) {
  const isPJ = data.regime_trabalho === 'pj';

  const handleAddFerias = () => {
    update('ferias', [...data.ferias, { inicio: new Date(), dias: 0 }]);
  };

  const updateFerias = (index: number, key: 'inicio' | 'dias', value: any) => {
    const newFerias = [...data.ferias];
    if (key === 'inicio') {
      newFerias[index].inicio = new Date(value);
    } else {
      newFerias[index].dias = value;
    }
    update('ferias', newFerias);
  };

  const removeFerias = (index: number) => {
    update('ferias', data.ferias.filter((_, i) => i !== index));
  };

  const totalDiasProgramados = data.ferias.reduce((acc, f) => acc + (f.dias || 0), 0);
  const diasAbono = data.vender_abono ? (data.dias_abono || 0) : 0;
  const diasNecessarios = 30 - diasAbono;
  const showWarning = totalDiasProgramados !== diasNecessarios && data.ferias.length > 0;

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>Passo 3: {isPJ ? 'Planejamento de Recesso (PJ)' : 'Suas Férias'}</h2>

      {isPJ && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
          <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>PJ não possui férias remuneradas por lei.</strong>
          Os períodos informados abaixo <em>não</em> geram receita de férias na projeção — apenas registram quando você não trabalhará. O pró-labore continuará sendo calculado normalmente. Use esta etapa como planejamento de agenda ou pule para o próximo passo.
        </div>
      )}

      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '15px', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            id="vender_abono"
            checked={data.vender_abono}
            onChange={(e) => update('vender_abono', e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
          />
          <label htmlFor="vender_abono" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>Deseja vender parte das suas férias (abono pecuniário)?</label>
        </div>
        {data.vender_abono && (
          <div className="animate-fade-in" style={{ marginLeft: '2rem', marginTop: '0.5rem', width: '280px' }}>
            <label className="field-label">Quantos dias deseja vender?</label>
            <MathInput
              value={data.dias_abono || 0}
              onChange={(val) => update('dias_abono', val)}
              placeholder="Ex: 10"
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>Períodos Programados</h3>
          <button
            onClick={handleAddFerias}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', background: 'rgba(0, 191, 165, 0.1)', borderColor: 'rgba(0, 191, 165, 0.2)' }}
          >
            + Adicionar Período
          </button>
        </div>

        {data.ferias.map((f, i) => (
          <div key={i} className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-end', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Data Inicial</label>
              <input
                type="date"
                className="input-field"
                value={f.inicio ? (isNaN(f.inicio.getTime()) ? '' : f.inicio.toISOString().split('T')[0]) : ''}
                onChange={(e) => updateFerias(i, 'inicio', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Duração (Dias)</label>
              <MathInput
                value={f.dias || 0}
                onChange={(val) => updateFerias(i, 'dias', val)}
              />
            </div>
            <button
              onClick={() => removeFerias(i)}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        ))}
      </div>

      {showWarning && (
        <div className="animate-fade-in" style={{ marginTop: '1rem', marginBottom: '2rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', color: '#ff6b6b', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '12px', lineHeight: '1.5' }}>
          <span style={{ fontSize: '1.2rem', marginTop: '-2px' }}>⚠️</span>
          <span>Atenção: Você programou <strong>{totalDiasProgramados} dias</strong>, mas deveria programar <strong>{diasNecessarios} dias</strong> para fechar os 30 dias de regra (considerando {diasAbono} dias de abono). O cálculo pode ficar incorreto!</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
