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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #e5b121', background: 'rgba(239, 68, 68, 0.02)' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Salário Líquido (1+2+3)</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{formatBRL(totais.liquido)}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(239, 68, 68, 0.08)', padding: '2px 10px', borderRadius: '99px', display: 'inline-block' }}>Média: {formatBRL(totais.liquido / months)}/mês</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid var(--accent-color)', background: 'rgba(0, 191, 165, 0.02)' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo em Conta (4+5)</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{formatBRL(totais.saldo_conta)}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(0, 191, 165, 0.08)', padding: '2px 10px', borderRadius: '99px', display: 'inline-block' }}>Média: {formatBRL(totais.saldo_conta / months)}/mês</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.02)' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo Real (6+7)</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{formatBRL(totais.saldo_real)}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(139, 92, 246, 0.08)', padding: '2px 10px', borderRadius: '99px', display: 'inline-block' }}>Média: {formatBRL(totais.saldo_real / months)}/mês</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #2889C9', background: 'rgba(16, 185, 129, 0.02)' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Saldo Total (8+9)</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{formatBRL(totais.saldo_total)}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(16, 185, 129, 0.08)', padding: '2px 10px', borderRadius: '99px', display: 'inline-block' }}>Média: {formatBRL(totais.saldo_total / months)}/mês</p>
        </div>
      </div>

      <div className="glass-card custom-scrollbar" style={{ padding: '1rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <h2 style={{ padding: '1.5rem 1.5rem 0.5rem', fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Projeção Timeline ({months} meses)</h2>
        <table className="luxury-table tabular">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', minWidth: '120px' }}>Evento</th>
              <th>Bruto (1)</th>
              <th style={{ color: '#ef4444' }}>Impostos (2)</th>
              <th style={{ color: '#ef4444' }}>Desc (3)</th>
              <th style={{ color: '#e5b121' }}>Líquido (4)</th>
              <th>Ticket (5)</th>
              <th style={{ color: 'var(--accent-color)' }}>Saldo Conta (6)</th>
              <th>Previdência (7)</th>
              <th style={{ color: '#8b5cf6' }}>Saldo Real (8)</th>
              <th>Indiretos (9)</th>
              <th style={{ color: '#2889C9' }}>Saldo Total (10)</th>
            </tr>
          </thead>
          <tbody>
            {receitas.map((r, i) => {
              const saldo_conta = r.liquido + r.ticket;
              const saldo_real = saldo_conta + r.previdencia + r.fgts;
              const saldo_total = saldo_real + r.beneficios;
              return (
                <tr key={i} className="table-row-item">
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.data.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-primary)', opacity: 0.6 }}>{r.descricao}</div>
                  </td>
                  <td>{formatBRL(r.bruto)}</td>
                  <td style={{ color: '#ef4444', opacity: (r.inss + r.irrf) > 0 ? 0.8 : 0.2 }}>
                    {(r.inss + r.irrf) > 0 ? `-${formatBRL(r.inss + r.irrf)}` : '—'}
                  </td>
                  <td style={{ color: '#ef4444', opacity: r.descontos > 0 ? 0.8 : 0.2 }}>
                    {r.descontos > 0 ? `-${formatBRL(r.descontos)}` : '—'}
                  </td>
                  <td style={{ color: '#e5b121', fontWeight: 500 }}>{formatBRL(r.liquido)}</td>
                  <td>{formatBRL(r.ticket)}</td>
                  <td style={{ color: 'var(--accent-color)', fontWeight: 500 }}>{formatBRL(saldo_conta)}</td>
                  <td>{formatBRL(r.previdencia + r.fgts)}</td>
                  <td style={{ color: '#8b5cf6', fontWeight: 500 }}>{formatBRL(saldo_real)}</td>
                  <td style={{ opacity: r.beneficios > 0 ? 1 : 0.2 }}>{formatBRL(r.beneficios)}</td>
                  <td style={{ color: '#2889C9', fontWeight: 500 }}>{formatBRL(saldo_total)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: 'rgba(255,255,255,0.02)', fontWeight: 500 }}>
              <td style={{ textAlign: 'left' }}>Totais</td>
              <td>{formatBRL(totais.bruto)}</td>
              <td style={{ color: '#ef4444' }}>-{formatBRL(totais.inss + totais.irrf)}</td>
              <td style={{ color: '#ef4444' }}>-{formatBRL(totais.descontos)}</td>
              <td style={{ color: '#e5b121' }}>{formatBRL(totais.liquido)}</td>
              <td>{formatBRL(totais.ticket)}</td>
              <td style={{ color: 'var(--accent-color)' }}>{formatBRL(totais.saldo_conta)}</td>
              <td>{formatBRL(totais.previdencia + totais.fgts)}</td>
              <td style={{ color: '#8b5cf6' }}>{formatBRL(totais.saldo_real)}</td>
              <td>{formatBRL(totais.beneficios)}</td>
              <td style={{ color: '#10b981' }}>{formatBRL(totais.saldo_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── SEÇÃO DE RESCISÃO ─────────────────────────────────── */}
      {rescisao && (
        <div className="glass-card animate-fade-in" style={{ padding: '2.5rem', marginTop: '3rem', borderTop: `6px solid ${tipoInfo.color}`, borderRadius: '24px' }}>
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ color: tipoInfo.color, marginBottom: '4px', fontSize: '1.4rem', fontWeight: 500 }}>Simulação de Rescisão</h2>
              <div style={{ display: 'inline-block', background: `${tipoInfo.color}15`, color: tipoInfo.color, padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 }}>{tipoInfo.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '2px' }}>Líquido Total a Receber</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 500, color: tipoInfo.color }}>{formatBRL(rescisao.totalLiquido)}</p>
            </div>
          </div>

          {/* Cards de resumo rescisório */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Bruto</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>{formatBRL(rescisao.totalBruto)}</p>
            </div>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Descontos (Encargos)</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 600, color: '#ef4444' }}>-{formatBRL(rescisao.totalInss + rescisao.totalIrrf)}</p>
            </div>
            {rescisao.multaFgts > 0 && (
              <div style={{ padding: '1.5rem', background: 'rgba(16,185,129,0.08)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Multa FGTS (40%)</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 600, color: '#10b981' }}>{formatBRL(rescisao.multaFgts)}</p>
              </div>
            )}
            {rescisao.fgtsTotal > 0 && (
              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>FGTS Total a Sacar</p>
                <p style={{ fontSize: '1.6rem', fontWeight: 600, color: '#10b981' }}>{formatBRL(rescisao.fgtsTotal)}</p>
                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>saldo acumulado + multa</p>
              </div>
            )}
          </div>

          {/* Tabela de verbas */}
          <div className="custom-scrollbar" style={{ overflowX: 'auto', borderRadius: '16px', background: 'rgba(255,255,255,0.01)', padding: '1rem' }}>
            <table className="luxury-table tabular" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', textAlign: 'right', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Verba Rescisória</th>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>Bruto</th>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>INSS</th>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>IRRF</th>
                  <th style={{ padding: '1rem', color: tipoInfo.color, whiteSpace: 'nowrap' }}>Líquido</th>
                  <th style={{ padding: '1rem', whiteSpace: 'nowrap', textAlign: 'center' }}>Tributável?</th>
                </tr>
              </thead>
              <tbody>
                {rescisao.verbas.map((v, i) => (
                  <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s ease' }} className="table-row-item">
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'left', whiteSpace: 'nowrap', borderRadius: '12px 0 0 12px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v.descricao}</span>
                      {v.tooltip && (
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.7 }}>{v.tooltip}</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatBRL(v.bruto)}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: '#ef4444', opacity: v.inss > 0 ? 1 : 0.3 }}>{v.inss > 0 ? `-${formatBRL(v.inss)}` : '-'}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: '#ef4444', opacity: v.irrf > 0 ? 1 : 0.3 }}>{v.irrf > 0 ? `-${formatBRL(v.irrf)}` : '-'}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: tipoInfo.color, whiteSpace: 'nowrap' }}>{formatBRL(v.liquido)}</td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap', textAlign: 'center', borderRadius: '0 12px 12px 0' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: v.tributavel ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: v.tributavel ? '#ef4444' : '#10b981',
                        border: `1px solid ${v.tributavel ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}`,
                      }}>
                        {v.tributavel ? 'Sim' : 'Isento'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 'bold', borderTop: `2px solid ${tipoInfo.color}`, fontSize: '1.05rem' }}>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'left', borderRadius: '12px 0 0 12px' }}>TOTAIS RESCISÓRIOS</td>
                  <td style={{ padding: '1.5rem 1rem', whiteSpace: 'nowrap' }}>{formatBRL(rescisao.totalBruto)}</td>
                  <td style={{ padding: '1.5rem 1rem', whiteSpace: 'nowrap', color: '#ef4444' }}>-{formatBRL(rescisao.totalInss)}</td>
                  <td style={{ padding: '1.5rem 1rem', whiteSpace: 'nowrap', color: '#ef4444' }}>-{formatBRL(rescisao.totalIrrf)}</td>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 600, color: tipoInfo.color, whiteSpace: 'nowrap' }}>{formatBRL(rescisao.totalLiquido)}</td>
                  <td style={{ borderRadius: '0 12px 12px 0' }}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Aviso sobre seguro-desemprego */}
          {data.tipo_demissao === 'sem_justa_causa' && (
            <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.15)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <div>
                <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px', fontSize: '1rem' }}>Seguro-Desemprego & FGTS</strong>
                <p>
                  Como a demissão é sem justa causa, você tem direito ao saque integral do FGTS acumulado e ao seguro-desemprego.
                  O valor do seguro depende da média dos seus últimos 3 salários. Verifique seu saldo e elegibilidade no app <strong>Carteira de Trabalho Digital</strong> ou <strong>FGTS</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <button className="btn-secondary" onClick={onRestart}>Refazer Simulação</button>
      </div>

      <style>{`
        .table-row-item:hover {
          background: rgba(255,255,255,0.06) !important;
          transform: translateY(-1px);
        }
        .sticky-header {
          position: sticky;
          top: 0;
          background: #000;
          z-index: 10;
        }
        @media (max-width: 768px) {
           .sticky-header {
              position: static;
           }
        }
      `}</style>
    </div>
  );
}

