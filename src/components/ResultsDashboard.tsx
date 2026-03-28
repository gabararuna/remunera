import { useMemo } from 'react';
import type { SalaryParams } from '../types';
import { calcularProjecao } from '../lib/calculator';

interface Props {
  data: SalaryParams;
  onRestart: () => void;
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export function ResultsDashboard({ data, onRestart }: Props) {
  const receitas = useMemo(() => calcularProjecao(data), [data]);

  const totais = useMemo(() => {
    let t = { bruto: 0, inss: 0, irrf: 0, descontos: 0, liquido: 0, ticket: 0, saldo_conta: 0, previdencia: 0, fgts: 0, saldo_real: 0, beneficios: 0, saldo_total: 0 };
    receitas.forEach(r => {
      const saldo_conta_row = r.liquido + r.ticket;
      const saldo_real_row = saldo_conta_row + r.previdencia + r.fgts;
      const saldo_total_row = saldo_real_row + r.beneficios;

      t.bruto += r.bruto;
      t.inss += r.inss;
      t.irrf += r.irrf;
      t.descontos += r.descontos;
      t.liquido += r.liquido;
      t.ticket += r.ticket;
      t.saldo_conta += saldo_conta_row;
      t.previdencia += r.previdencia;
      t.fgts += r.fgts;
      t.saldo_real += saldo_real_row;
      t.beneficios += r.beneficios;
      t.saldo_total += saldo_total_row;
    });
    return t;
  }, [receitas]);

  const months = data.meses_projecao > 0 ? data.meses_projecao : 12;

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Salário Líquido (1+2+3+4)</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatBRL(totais.liquido)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Média R$: {formatBRL(totais.liquido / months)}/mês</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid var(--accent-color)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo em Conta (5+6)</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatBRL(totais.saldo_conta)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Média R$: {formatBRL(totais.saldo_conta / months)}/mês</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #8b5cf6' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo Real (7+8+9)</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatBRL(totais.saldo_real)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Média R$: {formatBRL(totais.saldo_real / months)}/mês</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid var(--success-color)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo Total (10+11)</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatBRL(totais.saldo_total)}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Média R$: {formatBRL(totais.saldo_total / months)}/mês</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <h2 style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>Timeline Financeira ({months} meses)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th className="sticky-header" style={{ padding: '1rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Evento</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(1) Salário Bruto</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(2) INSS</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(3) IRRF</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(4) Descontos</th>
              <th className="sticky-header" style={{ padding: '1rem', color: '#ef4444', whiteSpace: 'nowrap' }}>(5) Salário Líquido</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(6) Ticket</th>
              <th className="sticky-header" style={{ padding: '1rem', color: 'var(--accent-color)', whiteSpace: 'nowrap' }}>(7) Saldo Conta</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(8) Previdência</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(9) FGTS</th>
              <th className="sticky-header" style={{ padding: '1rem', color: '#8b5cf6', whiteSpace: 'nowrap' }}>(10) Saldo Real</th>
              <th className="sticky-header" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>(11) Ben. Indiretos</th>
              <th className="sticky-header" style={{ padding: '1rem', color: 'var(--success-color)', whiteSpace: 'nowrap' }}>(12) Saldo Total</th>
            </tr>
          </thead>
          <tbody>
            {receitas.map((r, i) => {
              const saldo_conta = r.liquido + r.ticket;
              const saldo_real = saldo_conta + r.previdencia + r.fgts;
              const saldo_total = saldo_real + r.beneficios;
              return (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'default', fontSize: '0.9rem' }} className="table-row-hover">
                  <td style={{ padding: '1rem', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <div style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>{r.data.toLocaleDateString('pt-BR')}</div>
                    <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }}>{r.descricao}</div>
                  </td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(r.bruto)}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{r.inss > 0 ? `-${formatBRL(r.inss)}` : 'R$ 0,00'}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{r.irrf > 0 ? `-${formatBRL(r.irrf)}` : 'R$ 0,00'}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{r.descontos > 0 ? `-${formatBRL(r.descontos)}` : 'R$ 0,00'}</td>
                  <td style={{ padding: '1rem', color: '#ef4444', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatBRL(r.liquido)}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(r.ticket)}</td>
                  <td style={{ padding: '1rem', color: 'var(--accent-color)', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatBRL(saldo_conta)}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(r.previdencia)}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(r.fgts)}</td>
                  <td style={{ padding: '1rem', color: '#8b5cf6', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatBRL(saldo_real)}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(r.beneficios)}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--success-color)', whiteSpace: 'nowrap' }}>{formatBRL(saldo_total)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(0,0,0,0.3)', fontWeight: 'bold', borderTop: '2px solid var(--accent-color)', fontSize: '0.95rem' }}>
              <td style={{ padding: '1rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Totais</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(totais.bruto)}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{totais.inss > 0 ? `-${formatBRL(totais.inss)}` : 'R$ 0,00'}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{totais.irrf > 0 ? `-${formatBRL(totais.irrf)}` : 'R$ 0,00'}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{totais.descontos > 0 ? `-${formatBRL(totais.descontos)}` : 'R$ 0,00'}</td>
              <td style={{ padding: '1rem', color: '#ef4444', whiteSpace: 'nowrap' }}>{formatBRL(totais.liquido)}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(totais.ticket)}</td>
              <td style={{ padding: '1rem', color: 'var(--accent-color)', whiteSpace: 'nowrap' }}>{formatBRL(totais.saldo_conta)}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(totais.previdencia)}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(totais.fgts)}</td>
              <td style={{ padding: '1rem', color: '#8b5cf6', whiteSpace: 'nowrap' }}>{formatBRL(totais.saldo_real)}</td>
              <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(totais.beneficios)}</td>
              <td style={{ padding: '1rem', color: 'var(--success-color)', whiteSpace: 'nowrap' }}>{formatBRL(totais.saldo_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <button className="btn-primary" onClick={onRestart}>&larr; Recalcular Premissas</button>
      </div>

      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.05);
        }
        .sticky-header {
          position: sticky;
          top: 0;
          background-color: #0f172a;
          z-index: 10;
          border-bottom: 1px solid var(--card-border);
        }
      `}</style>
    </div>
  );
}
