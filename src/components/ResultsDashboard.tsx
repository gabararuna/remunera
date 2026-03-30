import { useMemo } from 'react';
import type { SalaryParams } from '../types';
import { calcularProjecao, calcularRescisao } from '../lib/calculator';

interface Props {
  data: SalaryParams;
  onRestart: () => void;
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  pedido_demissao: { label: 'Pedido de Demissão', color: '#f59e0b' },
  justa_causa: { label: 'Demissão por Justa Causa', color: '#ef4444' },
  sem_justa_causa: { label: 'Demissão Sem Justa Causa', color: '#10b981' },
};

export function ResultsDashboard({ data, onRestart }: Props) {
  const receitas = useMemo(() => calcularProjecao(data), [data]);
  const rescisao = useMemo(() => data.simular_demissao ? calcularRescisao(data) : null, [data]);

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
  const tipoInfo = TIPO_LABELS[data.tipo_demissao] ?? TIPO_LABELS['pedido_demissao'];

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

      {/* ── SEÇÃO DE RESCISÃO ─────────────────────────────────── */}
      {rescisao && (
        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem', marginTop: '2rem', borderTop: `4px solid ${tipoInfo.color}` }}>
          <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: tipoInfo.color, marginBottom: '2px' }}>Simulação de Rescisão</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{tipoInfo.label}</p>
          </div>

          {/* Cards de resumo rescisório */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Bruto Rescisório</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatBRL(rescisao.totalBruto)}</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>INSS Rescisório</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>-{formatBRL(rescisao.totalInss)}</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>IRRF Rescisório</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>-{formatBRL(rescisao.totalIrrf)}</p>
            </div>
            <div style={{ padding: '1rem', background: `${tipoInfo.color}18`, borderRadius: '12px', textAlign: 'center', border: `1px solid ${tipoInfo.color}40` }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Líquido a Receber</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: tipoInfo.color }}>{formatBRL(rescisao.totalLiquido)}</p>
            </div>
            {rescisao.multaFgts > 0 && (
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Multa FGTS (40%)</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{formatBRL(rescisao.multaFgts)}</p>
              </div>
            )}
            {rescisao.fgtsTotal > 0 && (
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>FGTS Total a Sacar</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatBRL(rescisao.fgtsTotal)}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>saldo + multa 40%</p>
              </div>
            )}
          </div>

          {/* Tabela de verbas */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th className="sticky-header" style={{ padding: '0.75rem 1rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Verba Rescisória</th>
                  <th className="sticky-header" style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Bruto</th>
                  <th className="sticky-header" style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>INSS</th>
                  <th className="sticky-header" style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>IRRF</th>
                  <th className="sticky-header" style={{ padding: '0.75rem 1rem', color: tipoInfo.color, whiteSpace: 'nowrap' }}>Líquido</th>
                  <th className="sticky-header" style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>Tributável?</th>
                </tr>
              </thead>
              <tbody>
                {rescisao.verbas.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{v.descricao}</span>
                      {v.tooltip && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{v.tooltip}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{formatBRL(v.bruto)}</td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: v.inss > 0 ? '#ef4444' : undefined }}>{v.inss > 0 ? `-${formatBRL(v.inss)}` : 'R$ 0,00'}</td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: v.irrf > 0 ? '#ef4444' : undefined }}>{v.irrf > 0 ? `-${formatBRL(v.irrf)}` : 'R$ 0,00'}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: tipoInfo.color, whiteSpace: 'nowrap' }}>{formatBRL(v.liquido)}</td>
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        background: v.tributavel ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        color: v.tributavel ? '#ef4444' : '#10b981',
                      }}>
                        {v.tributavel ? 'Sim' : 'Isento'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(0,0,0,0.3)', fontWeight: 'bold', borderTop: `2px solid ${tipoInfo.color}`, fontSize: '0.95rem' }}>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>TOTAL</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{formatBRL(rescisao.totalBruto)}</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#ef4444' }}>{rescisao.totalInss > 0 ? `-${formatBRL(rescisao.totalInss)}` : 'R$ 0,00'}</td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#ef4444' }}>{rescisao.totalIrrf > 0 ? `-${formatBRL(rescisao.totalIrrf)}` : 'R$ 0,00'}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: tipoInfo.color, whiteSpace: 'nowrap' }}>{formatBRL(rescisao.totalLiquido)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Aviso sobre seguro-desemprego (apenas sem justa causa) */}
          {data.tipo_demissao === 'sem_justa_causa' && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#10b981' }}>Seguro-Desemprego</strong>
              <p style={{ marginTop: '4px' }}>
                Na demissão sem justa causa você tem direito ao seguro-desemprego, sujeito a carência mínima de emprego formal.
                O valor depende do salário médio dos últimos 3 meses e pode ser consultado no app Carteira de Trabalho Digital (Gov.br).
              </p>
            </div>
          )}
        </div>
      )}

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
