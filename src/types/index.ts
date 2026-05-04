export interface VacationPeriod {
  inicio: Date;
  dias: number;
}

export type TipoDemissao = 'pedido_demissao' | 'justa_causa' | 'sem_justa_causa';
export type RegimeTrabalho = 'clt' | 'pj' | 'servidor_federal' | 'servidor_estadual';

export interface SalaryParams {
  regime_trabalho: RegimeTrabalho;
  // PJ
  distribuicao_lucros: number;      // distribuição de lucros mensal (isenta IR no Simples)
  aliquota_inss_pj: number;         // alíquota INSS contribuinte individual: 5, 11 ou 20
  // Servidor Estadual
  aliquota_rpps_estadual: number;   // alíquota RPPS fixa do estado (%)

  data_inicio: Date;
  meses_projecao: number;
  aumento_percentual: number;
  mes_aumento?: Date | null;

  salario_bruto: number;
  tem_adiantamento: boolean;
  valor_adiantamento: number;
  dia_adiantamento: number;
  plr_bruto: number;
  data_plr: Date;
  ticket_mensal: number;
  ticket_anual: number;
  data_ticket_anual: Date;
  previdencia_valor: number;
  plano_saude: number;
  plano_odonto: number;
  seguro_vida: number;
  incide_prev_13: boolean;
  outros_descontos: number;
  dependentes: number;
  vender_abono: boolean;
  dias_abono?: number;
  dia_pagamento: 'ultimo' | number;
  ferias: VacationPeriod[];

  // Simulação de demissão
  simular_demissao: boolean;
  tipo_demissao: TipoDemissao;
  data_demissao: Date | null;
  data_admissao: Date | null;       // para cálculo do tempo de serviço e aviso prévio
  saldo_fgts: number;               // saldo de FGTS acumulado (para calcular multa 40%)
  ferias_vencidas_dias: number;     // dias de férias vencidas não gozadas
  aviso_previo_trabalhado: boolean; // se vai trabalhar o aviso prévio (ou ser indenizado)
}

export interface Receipt {
  data: Date;
  descricao: string;
  bruto: number;
  inss: number;
  irrf: number;
  descontos: number;
  liquido: number;
  ticket: number;
  previdencia: number;
  fgts: number;
  beneficios: number;
}

export interface RescisaoVerba {
  descricao: string;
  bruto: number;
  inss: number;
  irrf: number;
  liquido: number;
  tributavel: boolean;
  tooltip?: string;
}

export interface RescisaoResult {
  verbas: RescisaoVerba[];
  totalBruto: number;
  totalInss: number;
  totalIrrf: number;
  totalLiquido: number;
  diasAvisoPrevio: number;
  multaFgts: number;
  fgtsTotal: number; // acumulado + multa
}
