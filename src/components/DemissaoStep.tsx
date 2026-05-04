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
  const regime = data.regime_trabalho || 'clt';
  const isPJ = regime === 'pj';
  const isServidor = regime === 'servidor_federal' || regime === 'servidor_estadual';
  const naoAplicavel = isPJ || isServidor;

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
    naoAplicavel ||
    !data.simular_demissao ||
    (!!data.data_demissao && !!data.data_admissao);

  return (
    <div className="glass-card animate-fade-in">
      <h2 style={{ marginBottom: '1rem', color: 'var(--accent-color)', fontSize: '1.15rem', fontWeight: 500 }}>Passo 6: Simulação de Encerramento</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
        Opcional — simule quanto você receberia em caso de encerramento do contrato.
      </p>

      {/* PJ: nota explicativa */}
      {isPJ && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
          <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '8px', fontSize: '1rem' }}>PJ não possui rescisão CLT</strong>
          <p style={{ marginBottom: '0' }}>
            O encerramento de uma empresa PJ não gera verbas rescisórias como aviso prévio, multa de FGTS ou 13º proporcional.
            O encerramento deve ser formalizado junto à Receita Federal e à Junta Comercial.
            Para planejamento, considere reservar fundos mensais equivalentes a uma "rescisão" para segurança.
          </p>
        </div>
      )}

      {/* Servidor: nota explicativa */}
      {isServidor && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
          <strong style={{ color: '#8b5cf6', display: 'block', marginBottom: '8px', fontSize: '1rem' }}>Servidores Públicos Estáveis não têm rescisão CLT</strong>
          <p style={{ marginBottom: '0' }}>
            {regime === 'servidor_federal'
              ? 'Servidores federais efetivos possuem estabilidade após 3 anos (art. 41 CF). O desligamento ocorre por exoneração voluntária, aposentadoria ou processo administrativo disciplinar — sem as verbas rescisórias do regime CLT.'
              : 'Servidores estaduais efetivos possuem estabilidade constitucional. O desligamento ocorre por exoneração, aposentadoria ou processo administrativo, conforme o Estatuto do servidor do estado.'
            }
          </p>
        </div>
      )}

      {/* Toggle + simulação de rescisão — visível apenas para CLT */}
      {!naoAplicavel && (
        <>
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input
            type="checkbox"
            id="simular_demissao"
            checked={data.simular_demissao}
            onChange={(e) => update('simular_demissao', e.target.checked)}
            style={{ width: '22px', height: '22px', accentColor: 'var(--accent-color)', flexShrink: 0 }}
          />
          <label htmlFor="simular_demissao" style={{ fontWeight: 400, cursor: 'pointer', fontSize: '0.95rem' }}>
            Quero simular o recebimento de verbas rescisórias
          </label>
        </div>

        {data.simular_demissao && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* Tipo de demissão */}
          <div>
            <p style={{ marginBottom: '1rem', fontWeight: 500, fontSize: '1rem' }}>Qual é o tipo de demissão?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {(Object.entries(TIPO_LABELS) as [TipoDemissao, typeof TIPO_LABELS[TipoDemissao]][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => update('tipo_demissao', key)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: `1px solid ${tipo === key ? info.color : 'rgba(255,255,255,0.08)'}`,
                    background: tipo === key ? `${info.color}15` : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    boxShadow: tipo === key ? `0 0 20px ${info.color}20` : 'none',
                  }}
                >
                  <div style={{ fontWeight: 500, color: tipo === key ? info.color : 'var(--text-primary)', marginBottom: '4px', fontSize: '1rem' }}>{info.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{info.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Datas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="field-label">Data de Admissão</label>
              <input
                type="date"
                className="input-field"
                value={data.data_admissao && !isNaN(data.data_admissao.getTime()) ? data.data_admissao.toISOString().split('T')[0] : ''}
                onChange={(e) => update('data_admissao', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
              />
            </div>
            <div>
              <label className="field-label">Data de Demissão</label>
              <input
                type="date"
                className="input-field"
                value={data.data_demissao && !isNaN(data.data_demissao.getTime()) ? data.data_demissao.toISOString().split('T')[0] : ''}
                onChange={(e) => update('data_demissao', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
              />
            </div>
          </div>

          {/* Férias proporcionais */}
          {!isJustaCausa && feriasAvos !== null && (
            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '6px' }}>Férias Proporcionais</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {feriasAvos} {feriasAvos === 1 ? 'avo' : 'avos'} — calculado automaticamente com base nas datas.
              </p>
            </div>
          )}

          {/* Aviso prévio */}
          {isSemJustaCausa && data.data_admissao && data.data_demissao && (
            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                Aviso Prévio — {diasAviso} dias (Lei 12.506/2011)
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                30 dias base + 3 dias por ano completo trabalhado (máx. 90 dias).
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  id="aviso_trabalhado"
                  checked={data.aviso_previo_trabalhado}
                  onChange={(e) => update('aviso_previo_trabalhado', e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                />
                <label htmlFor="aviso_trabalhado" style={{ fontSize: '0.95rem', cursor: 'pointer' }}>
                  Vou trabalhar o aviso prévio (não será indenizado)
                </label>
              </div>
            </div>
          )}

          {/* Saldo FGTS */}
          {isSemJustaCausa && (
            <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>Saldo do FGTS Acumulado (R$)</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Consulte seu saldo no app FGTS. Será calculada a multa rescisória de 40%.
              </p>
              <MathInput
                value={data.saldo_fgts || 0}
                onChange={(val) => update('saldo_fgts', val)}
                placeholder="Ex: 12500.00"
              />
            </div>
          )}

          {/* Férias vencidas */}
          <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.95rem' }}>Férias Vencidas Não Gozadas (dias)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Informe o número de dias se houver férias vencidas.{' '}
              {isJustaCausa ? 'Na justa causa, são pagas sem encargos.' : 'São pagas com adicional de 1/3.'}
            </p>
            <MathInput
              value={data.ferias_vencidas_dias || 0}
              onChange={(val) => update('ferias_vencidas_dias', Math.floor(Math.max(0, Math.min(30, val))))}
              placeholder="Ex: 30"
            />
          </div>

          {/* Info box por tipo */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '16px',
            border: `1px solid ${TIPO_LABELS[tipo].color}40`,
            background: `${TIPO_LABELS[tipo].color}08`,
          }}>
            <p style={{ fontWeight: 600, color: TIPO_LABELS[tipo].color, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
              {TIPO_LABELS[tipo].label} — O que você recebe
            </p>
            {isPedido && (
              <ul style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li>Saldo de salário proporcional ao mês</li>
                <li>Férias vencidas + 1/3 (se houver)</li>
                <li>Férias proporcionais + 1/3</li>
                <li>13º proporcional</li>
                <li style={{ opacity: 0.4 }}>Sem aviso prévio indenizado</li>
                <li style={{ opacity: 0.4 }}>Sem multa de 40% sobre FGTS</li>
                <li style={{ opacity: 0.4 }}>Sem seguro-desemprego</li>
              </ul>
            )}
            {isJustaCausa && (
              <ul style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li>Saldo de salário proporcional ao mês</li>
                <li>Férias vencidas não gozadas</li>
                <li style={{ opacity: 0.4 }}>Sem férias proporcionais</li>
                <li style={{ opacity: 0.4 }}>Sem 13º proporcional</li>
                <li style={{ opacity: 0.4 }}>Sem aviso prévio</li>
                <li style={{ opacity: 0.4 }}>Sem multa de 40% sobre FGTS</li>
              </ul>
            )}
            {isSemJustaCausa && (
              <ul style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                <li>Saldo de salário proporcional ao mês</li>
                <li>Aviso prévio indenizado ({diasAviso} dias) — se indenizado</li>
                <li>Férias vencidas + 1/3 (se houver)</li>
                <li>Férias proporcionais + 1/3</li>
                <li>13º proporcional</li>
                <li style={{ color: '#10b981' }}>Multa rescisória de 40% sobre o saldo FGTS</li>
                <li style={{ color: '#10b981' }}>Saque do FGTS e Seguro-desemprego</li>
              </ul>
            )}
          </div>

        </div>
        )}
        </>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
        <button
          className="btn-secondary"
          onClick={onBack}
        >
          Voltar
        </button>
        <button
          className="btn-primary"
          style={{ minWidth: '220px' }}
          onClick={onNext}
          disabled={!canProceed}
        >
          Gerar Projeção
        </button>
      </div>
    </div>
  );
}

