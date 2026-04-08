import type { SalaryParams } from '../types';
import { MathInput } from './MathInput';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BeneficiosStep({ data, update, onNext, onBack }: Props) {
  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>Passo 4: Benefícios e PLR</h2>

      <div style={{ marginBottom: '2rem' }}>
        <label className="field-label">Ticket Mensal (VR/VA)</label>
        <MathInput
          value={data.ticket_mensal || 0}
          onChange={(val) => update('ticket_mensal', val)}
          placeholder="Ex: 800.00"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <label className="field-label">Ticket de Natal (R$)</label>
          <MathInput
            value={data.ticket_anual || 0}
            onChange={(val) => update('ticket_anual', val)}
            placeholder="Ex: 1500.00"
          />
        </div>
        <div>
          <label className="field-label">Data do Ticket de Natal</label>
          <input
            type="date"
            className="input-field"
            value={data.data_ticket_anual && !isNaN(data.data_ticket_anual.getTime()) ? data.data_ticket_anual.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_ticket_anual', new Date(e.target.value))}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <label className="field-label">Valor Bruto da PLR</label>
          <MathInput
            value={data.plr_bruto || 0}
            onChange={(val) => update('plr_bruto', val)}
            placeholder="Ex: 5000"
          />
        </div>
        <div>
          <label className="field-label">Data de Pagamento da PLR</label>
          <input
            type="date"
            className="input-field"
            value={data.data_plr && !isNaN(data.data_plr.getTime()) ? data.data_plr.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_plr', new Date(e.target.value))}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>Valores Custeados pela Empresa</h3>
      <p style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Informe o custo real desses planos, não é o valor descontado, pois compõem sua qualidade de vida.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <label className="field-label">Plano de Saúde (R$)</label>
          <MathInput
            value={data.plano_saude || 0}
            onChange={(val) => update('plano_saude', val)}
            placeholder="Ex: 600.00"
          />
        </div>
        <div>
          <label className="field-label">Plano Odontológico (R$)</label>
          <MathInput
            value={data.plano_odonto || 0}
            onChange={(val) => update('plano_odonto', val)}
            placeholder="Ex: 50.00"
          />
        </div>
        <div>
          <label className="field-label">Seguro de Vida (R$)</label>
          <MathInput
            value={data.seguro_vida || 0}
            onChange={(val) => update('seguro_vida', val)}
            placeholder="Ex: 20.00"
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo</button>
      </div>
    </div>
  );
}
