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
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Passo 4: Benefícios e PLR</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ticket Mensal (VR/VA)</p>
        <MathInput
          value={data.ticket_mensal || 0}
          onChange={(val) => update('ticket_mensal', val)}
          placeholder="Ex: 800.00"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ticket de Natal (R$)</p>
          <MathInput
            value={data.ticket_anual || 0}
            onChange={(val) => update('ticket_anual', val)}
            placeholder="Ex: 1500.00"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data do Ticket de Natal</p>
          <input
            type="date"
            className="input-field"
            value={data.data_ticket_anual && !isNaN(data.data_ticket_anual.getTime()) ? data.data_ticket_anual.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_ticket_anual', new Date(e.target.value))}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Valor Bruto da PLR</p>
          <MathInput
            value={data.plr_bruto || 0}
            onChange={(val) => update('plr_bruto', val)}
            placeholder="Ex: 5000"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Data de Pagamento da PLR</p>
          <input
            type="date"
            className="input-field"
            value={data.data_plr && !isNaN(data.data_plr.getTime()) ? data.data_plr.toISOString().split('T')[0] : ''}
            onChange={(e) => update('data_plr', new Date(e.target.value))}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Valores Custeados pela Empresa</h3>
      <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Informe o custo real desses planos, não é o valor descontado, pois compõem sua qualidade de vida.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Plano de Saúde (R$)</p>
          <MathInput
            value={data.plano_saude || 0}
            onChange={(val) => update('plano_saude', val)}
            placeholder="Ex: 600.00"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Plano Odontológico (R$)</p>
          <MathInput
            value={data.plano_odonto || 0}
            onChange={(val) => update('plano_odonto', val)}
            placeholder="Ex: 50.00"
          />
        </div>
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>Seguro de Vida (R$)</p>
          <MathInput
            value={data.seguro_vida || 0}
            onChange={(val) => update('seguro_vida', val)}
            placeholder="Ex: 20.00"
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--card-border)' }} onClick={onBack}>&larr; Voltar</button>
        <button className="btn-primary" onClick={onNext}>Próximo Passo &rarr;</button>
      </div>
    </div>
  );
}
