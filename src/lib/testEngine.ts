import { calcularProjecao } from './calculator';
import type { SalaryParams } from '../types';

const dadosFixos: SalaryParams = {
  regime_trabalho: 'clt',
  distribuicao_lucros: 0,
  aliquota_inss_pj: 11,
  aliquota_rpps_estadual: 14,
  data_inicio: new Date(2027, 0, 1),
  meses_projecao: 12,
  aumento_percentual: 5,
  mes_aumento: new Date(2027, 5, 1),
  salario_bruto: 8637.40,
  tem_adiantamento: true,
  valor_adiantamento: 0.3 * 8637.40,
  dia_adiantamento: 15,
  plr_bruto: 8637.40 * 2,
  data_plr: new Date(2027, 3, 15),
  ticket_mensal: 1510.51,
  ticket_anual: 1943.80,
  data_ticket_anual: new Date(2027, 11, 20),
  previdencia_valor: 167.14,
  plano_saude: 629.15,
  plano_odonto: 11.26,
  seguro_vida: 15.93,
  incide_prev_13: true,
  outros_descontos: 14.85,
  dependentes: 0,
  vender_abono: true,
  dia_pagamento: 'ultimo',
  ferias: [
    { inicio: new Date(2027, 1, 1), dias: 5 },
    { inicio: new Date(2027, 7, 23), dias: 15 }
  ],
  simular_demissao: false,
  tipo_demissao: 'pedido_demissao',
  data_demissao: null,
  data_admissao: null,
  saldo_fgts: 0,
  ferias_vencidas_dias: 0,
  aviso_previo_trabalhado: false,
};

const resultados = calcularProjecao(dadosFixos);

let totalUtilizavel = 0;
let totalLiquida = 0;
let totalGeral = 0;

resultados.forEach(r => {
  const utilizavel = r.liquido + r.ticket;
  const rem_liquida = utilizavel + r.fgts + r.previdencia;
  const rem_total = rem_liquida + r.beneficios;
  
  totalUtilizavel += utilizavel;
  totalLiquida += rem_liquida;
  totalGeral += rem_total;
});

console.log("Total Utilizável:", totalUtilizavel.toFixed(2));
console.log("Rem. Líquida:", totalLiquida.toFixed(2));
console.log("Rem. Total:", totalGeral.toFixed(2));
