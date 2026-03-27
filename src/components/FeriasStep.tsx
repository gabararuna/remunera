import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FeriasStep({ data, update, onNext, onBack }: Props) {
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
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Passo 3: Suas Férias</h2>

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="vender_abono"
            checked={data.vender_abono}
            onChange={(e) => update('vender_abono', e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="vender_abono">Deseja vender parte das suas férias (abono pecuniário)?</label>
        </div>
        {data.vender_abono && (
          <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem', width: '250px' }}>
            <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Quantos dias deseja vender?</p>
            <MathInput
              value={data.dias_abono || 0}
              onChange={(val) => update('dias_abono', val)}
              placeholder="Ex: 10"
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Períodos Programados</h3>
          <button
            onClick={handleAddFerias}
            style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--card-border)', borderRadius: '6px', cursor: 'pointer' }}
          >
            + Adicionar Período
          </button>
        </div>

        {data.ferias.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Data Inicial</p>
              <input
                type="date"
                className="input-field"
                value={f.inicio ? (isNaN(f.inicio.getTime()) ? '' : f.inicio.toISOString().split('T')[0]) : ''}
                onChange={(e) => updateFerias(i, 'inicio', e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Duração (Dias)</p>
              <MathInput
                value={f.dias || 0}
                onChange={(val) => updateFerias(i, 'dias', val)}
              />
            </div>
            <button
              onClick={() => removeFerias(i)}
              style={{ background: 'var(--danger-color)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              X
            </button>
          </div>
        ))}
      </div>

      {showWarning && (
        <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⚠️</span>
          <span>Atenção: Você programou <strong>{totalDiasProgramados} dias</strong>, mas deveria programar <strong>{diasNecessarios} dias</strong> para fechar os 30 dias de regra (considerando {diasAbono} dias de abono). O cálculo pode ficar incorreto!</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={onBack}>&larr; Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo &rarr;</button>
      </div>
    </div>
  );
}
