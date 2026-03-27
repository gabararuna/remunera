export interface VacationPeriod {
  inicio: Date;
  dias: number;
}

export interface SalaryParams {
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
