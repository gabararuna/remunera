import type { SalaryParams, TipoDemissao } from '../types';
import { MathInput } from './MathInput';
import { calcularDiasAvisoPrevio, calcularFeriasProporcionaisMeses } from '../lib/calculator';

interface Props {
  data: SalaryParams;
  update: <K extends keyof SalaryParams>(k: K, v: SalaryParams[K]) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIPO_LABELS: Record<TipoDemissao, { label: string; color: string; desc: string }> = {
  pedido_demissao: {
    label: 'Pedido de Demissão',
    color: '#f59e0b',
    desc: 'Você decide sair. Sem aviso prévio indenizado pela empresa e sem multa de FGTS.',
  },
  justa_causa: {
    label: 'Demissão por Justa Causa',
    color: '#ef4444',
    desc: 'Empresa demite por falta grave. Sem férias proporcionais, sem 13º proporcional, sem FGTS.',
  },
  sem_justa_causa: {
    label: 'Demissão Sem Justa Causa',
    color: '#10b981',
    desc: 'Empresa demite sem motivo grave. Recebe aviso prévio indenizado + multa 40% FGTS.',
  },
};

export function DemissaoStep({ data, update, onNext, onBack }: Props) {
  const tipo = data.tipo_demissao;
  const isSemJustaCausa = tipo === 'sem_justa_causa';
  const isPedido = tipo === 'pedido_demissao';
  const isJustaCausa = tipo === 'justa_causa';

  const diasAviso =
    data.data_admissao && data.data_demissao
      ? calcularDiasAvisoPrevio(data.data_admissao, data.data_demissao)
      : 30;

  const feriasAvos =
    data.data_admissao && data.data_demissao
      ? calcularFeriasProporcionaisMeses(data.data_admissao, data.data_demissao)
      : null;

  const canProceed =
    !data.simular_demissao ||
    (!!data.data_demissao && !!data.data_admissao);

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-color)' }}>Passo 6: Simulação de Demissão</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Opcional — simule quanto você receberia em caso de encerramento do contrato.
      </p>

      {/* Toggle principal */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <input
          type="checkbox"
          id="simular_demissao"
          checked={data.simular_demissao}
          onChange={(e) => update('simular_demissao', e.target.checked)}
          style={{ width: '20px', height: '20px', accentColor: 'var(--accent-color)', flexShrink: 0 }}
        />
        <label htmlFor="simular_demissao" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>
          Quero simular o recebimento de verbas rescisórias
        </label>
      </div>

      {data.simular_demissao && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Tipo de demissão */}
          <div>
            <p style={{ marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.95rem' }}>Qual é o tipo de demissão?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {(Object.entries(TIPO_LABELS) as [TipoDemissao, typeof TIPO_LABELS[TipoDemissao]][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => update('tipo_demissao', key)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `2px solid ${tipo === key ? info.color : 'rgba(255,255,255,0.1)'}`,
                    background: tipo === key ? `${info.color}18` : 'rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, color: tipo === key ? info.color : 'var(--text-primary)', marginBottom: '4px' }}>{info.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{info.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Datas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Data de Admissão</p>
              <input
                type="date"
                className="input-field"
                value={data.data_admissao && !isNaN(data.data_admissao.getTime()) ? data.data_admissao.toISOString().split('T')[0] : ''}
                onChange={(e) => update('data_admissao', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
              />
            </div>
            <div>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Data de Demissão</p>
              <input
                type="date"
                className="input-field"
                value={data.data_demissao && !isNaN(data.data_demissao.getTime()) ? data.data_demissao.toISOString().split('T')[0] : ''}
                onChange={(e) => update('data_demissao', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
              />
            </div>
          </div>

          {/* Férias proporcionais — exibe auto-calculado quando datas estão preenchidas */}
          {!isJustaCausa && feriasAvos !== null && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Férias Proporcionais</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {feriasAvos} {feriasAvos === 1 ? 'avo' : 'avos'} — calculado automaticamente
                com base nas datas de admissão e demissão.
              </p>
            </div>
          )}

          {/* Aviso prévio — só sem justa causa */}
          {isSemJustaCausa && data.data_admissao && data.data_demissao && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Aviso Prévio — {diasAviso} dias (Lei 12.506/2011)
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                30 dias base + 3 dias por ano completo trabalhado (máx. 90 dias).
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="aviso_trabalhado"
                  checked={data.aviso_previo_trabalhado}
                  onChange={(e) => update('aviso_previo_trabalhado', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
                <label htmlFor="aviso_trabalhado" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                  Vou trabalhar o aviso prévio (não será indenizado)
                </label>
              </div>
            </div>
          )}

          {/* Saldo FGTS — só sem justa causa */}
          {isSemJustaCausa && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Saldo do FGTS Acumulado (R$)</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Consulte seu saldo no app FGTS (Caixa Econômica). Será calculada a multa rescisória de 40%.
              </p>
              <MathInput
                value={data.saldo_fgts || 0}
                onChange={(val) => update('saldo_fgts', val)}
                placeholder="Ex: 12500.00"
              />
            </div>
          )}

          {/* Férias vencidas — todos os tipos */}
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Férias Vencidas Não Gozadas (dias)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Se você tem férias vencidas que ainda não tirou, informe o número de dias.{' '}
              {isJustaCausa ? 'Na justa causa, são pagas sem INSS/IRRF.' : 'São pagas com adicional de 1/3.'}
            </p>
            <MathInput
              value={data.ferias_vencidas_dias || 0}
              onChange={(val) => update('ferias_vencidas_dias', Math.floor(Math.max(0, Math.min(30, val))))}
              placeholder="Ex: 30"
            />
          </div>

          {/* Info box por tipo */}
          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            border: `1px solid ${TIPO_LABELS[tipo].color}30`,
            background: `${TIPO_LABELS[tipo].color}0d`,
          }}>
            <p style={{ fontWeight: 700, color: TIPO_LABELS[tipo].color, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {TIPO_LABELS[tipo].label} — o que você recebe
            </p>
            {isPedido && (
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 2 }}>
                <li>Saldo de salário proporcional ao mês de demissão</li>
                <li>Férias vencidas + 1/3 (se houver)</li>
                <li>Férias proporcionais + 1/3</li>
                <li>13º proporcional</li>
                <li style={{ opacity: 0.5 }}>Sem aviso prévio indenizado pela empresa</li>
                <li style={{ opacity: 0.5 }}>Sem multa de 40% sobre FGTS</li>
                <li style={{ opacity: 0.5 }}>Sem seguro-desemprego</li>
              </ul>
            )}
            {isJustaCausa && (
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 2 }}>
                <li>Saldo de salário proporcional ao mês de demissão</li>
                <li>Férias vencidas não gozadas (isenta de INSS/IRRF)</li>
                <li style={{ opacity: 0.5 }}>Sem férias proporcionais</li>
                <li style={{ opacity: 0.5 }}>Sem 13º proporcional</li>
                <li style={{ opacity: 0.5 }}>Sem aviso prévio indenizado</li>
                <li style={{ opacity: 0.5 }}>Sem multa de 40% sobre FGTS</li>
              </ul>
            )}
            {isSemJustaCausa && (
              <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 2 }}>
                <li>Saldo de salário proporcional ao mês de demissão</li>
                <li>Aviso prévio indenizado ({diasAviso} dias) — se não for trabalhado</li>
                <li>Férias vencidas + 1/3 (se houver)</li>
                <li>Férias proporcionais + 1/3</li>
                <li>13º proporcional</li>
                <li>Multa rescisória de 40% sobre o saldo FGTS</li>
                <li>Saque do FGTS permitido</li>
                <li>Direito ao seguro-desemprego (verifique carência)</li>
              </ul>
            )}
          </div>

        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button
          className="btn-primary"
          style={{ background: 'transparent', border: '1px solid var(--card-border)' }}
          onClick={onBack}
        >
          &larr; Voltar
        </button>
        <button
          className="btn-primary"
          style={{ background: 'var(--success-color)', opacity: canProceed ? 1 : 0.5 }}
          onClick={onNext}
          disabled={!canProceed}
        >
          Gerar Projeção &rarr;
        </button>
      </div>
    </div>
  );
}
