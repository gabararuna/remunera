import type { SalaryParams, Receipt } from '../types';

export const TABELA_INSS = [
  { limite: 1621, aliquota: 7.5 },
  { limite: 2902.84, aliquota: 9.0 },
  { limite: 4354.27, aliquota: 12.0 },
  { limite: 8475.55, aliquota: 14.0 },
];
export const TETO_INSS = 1186.58;

export const TABELA_IRRF = [
  { limite: 2428.80, aliquota: 0.0, deducao: 0.0 },
  { limite: 2826.65, aliquota: 7.5, deducao: 182.16 },
  { limite: 3751.05, aliquota: 15.0, deducao: 394.16 },
  { limite: 4664.68, aliquota: 22.5, deducao: 675.49 },
  { limite: Infinity, aliquota: 27.5, deducao: 908.73 },
];
export const DEDUCAO_POR_DEPENDENTE_IRRF = 189.59;

export const TABELA_IRRF_PLR = [
  { limite: 8214.40, aliquota: 0.0, deducao: 0.0 },
  { limite: 9922.28, aliquota: 7.5, deducao: 616.08 },
  { limite: 13167.00, aliquota: 15.0, deducao: 1360.25 },
  { limite: 16380.38, aliquota: 22.5, deducao: 2347.78 },
  { limite: Infinity, aliquota: 27.5, deducao: 3166.80 },
];

export function calcular_inss(base_calculo: number): number {
  if (base_calculo > TABELA_INSS[TABELA_INSS.length - 1].limite) return TETO_INSS;
  let inss_total = 0.0;
  let base_restante = base_calculo;
  let limite_anterior = 0.0;
  for (const faixa of TABELA_INSS) {
    const base_faixa = Math.min(base_restante, faixa.limite - limite_anterior);
    inss_total += base_faixa * (faixa.aliquota / 100);
    base_restante -= base_faixa;
    if (base_restante <= 0) break;
    limite_anterior = faixa.limite;
  }
  return Number(inss_total.toFixed(2));
}

export function calcular_irrf(
  base_calculo: number,
  num_dependentes: number = 0,
  tabela: typeof TABELA_IRRF = TABELA_IRRF
): number {
  if (tabela === TABELA_IRRF) {
    base_calculo -= (num_dependentes * DEDUCAO_POR_DEPENDENTE_IRRF);
  }
  let irrf_completo = 0;
  for (const faixa of tabela) {
    if (base_calculo <= faixa.limite) {
      irrf_completo = base_calculo * (faixa.aliquota / 100) - faixa.deducao;
      break;
    }
  }
  return Math.max(0, irrf_completo);
}

export function calcular_fgts(base_calculo: number): number {
  return Number((base_calculo * 0.08).toFixed(2));
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function obter_data_pagamento(ano: number, mes: number, dia_regra: 'ultimo' | number): Date {
  if (dia_regra === 'ultimo') {
    let ultimo_dia = getDaysInMonth(ano, mes);
    let data_pag = new Date(ano, mes - 1, ultimo_dia);
    while (data_pag.getDay() === 0 || data_pag.getDay() === 6) {
      data_pag.setDate(data_pag.getDate() - 1);
    }
    return data_pag;
  } else {
    let prox_mes = mes === 12 ? 1 : mes + 1;
    let prox_ano = mes === 12 ? ano + 1 : ano;
    let dias_uteis_contados = 0;
    let dia_atual = 1;

    while (dias_uteis_contados < (dia_regra as number)) {
      let data_pag = new Date(prox_ano, prox_mes - 1, dia_atual);
      if (data_pag.getMonth() !== prox_mes - 1) {
        let fallback = new Date(prox_ano, prox_mes - 1, getDaysInMonth(prox_ano, prox_mes));
        while (fallback.getDay() === 0 || fallback.getDay() === 6) {
          fallback.setDate(fallback.getDate() - 1);
        }
        return fallback;
      }
      if (data_pag.getDay() !== 0 && data_pag.getDay() !== 6) {
        dias_uteis_contados++;
      }
      if (dias_uteis_contados === (dia_regra as number)) {
        return data_pag;
      }
      dia_atual++;
    }
    return new Date();
  }
}

function appliesRaise(dateToCheck: Date, raiseDate?: Date | null): boolean {
  if (!raiseDate) return false;
  return dateToCheck.getTime() >= raiseDate.getTime();
}

export function calcularProjecao(dados: SalaryParams): Receipt[] {
  let recebimentos: Receipt[] = [];

  const invalidDate = (d: any) => !d || isNaN(new Date(d).getTime());

  const increaseMultiplier = 1 + ((dados.aumento_percentual || 0) / 100);

  let dias_de_ferias_por_ano_mes: { [key: string]: number } = {};

  const feriasValidas = (dados.ferias || []).filter(f => !invalidDate(f.inicio) && f.dias > 0);

  feriasValidas.forEach((periodo, i) => {
    const dias = periodo.dias;
    let data_pagamento = new Date(periodo.inicio);
    data_pagamento.setDate(data_pagamento.getDate() - 2);

    const hasRaise = appliesRaise(periodo.inicio, dados.mes_aumento);
    const salarioParaFerias = hasRaise ? dados.salario_bruto * increaseMultiplier : dados.salario_bruto;

    const adiant_sal_ferias_bruto = (salarioParaFerias / 30) * dias;
    const adicional_terco_ferias_bruto = (salarioParaFerias / 3 / 30) * dias;
    const base_tributavel_ferias = adiant_sal_ferias_bruto + adicional_terco_ferias_bruto;

    const inss_ferias = calcular_inss(base_tributavel_ferias);
    const irrf_ferias = calcular_irrf(base_tributavel_ferias - inss_ferias, dados.dependentes);

    const proporcao_adiant = base_tributavel_ferias > 0 ? (adiant_sal_ferias_bruto / base_tributavel_ferias) : 0;
    const proporcao_terco = base_tributavel_ferias > 0 ? (adicional_terco_ferias_bruto / base_tributavel_ferias) : 0;

    const inss_adiant = inss_ferias * proporcao_adiant;
    const irrf_adiant = irrf_ferias * proporcao_adiant;
    recebimentos.push({
      data: new Date(data_pagamento),
      descricao: `Adiant. Salário (${dias}d Férias)`,
      bruto: adiant_sal_ferias_bruto,
      inss: inss_adiant,
      irrf: irrf_adiant,
      descontos: 0,
      liquido: adiant_sal_ferias_bruto - inss_adiant - irrf_adiant,
      ticket: 0,
      fgts: calcular_fgts(adiant_sal_ferias_bruto),
      previdencia: 0,
      beneficios: 0
    });

    const inss_terco = inss_ferias * proporcao_terco;
    const irrf_terco = irrf_ferias * proporcao_terco;
    recebimentos.push({
      data: new Date(data_pagamento),
      descricao: `Adicional 1/3 (${dias}d Férias)`,
      bruto: adicional_terco_ferias_bruto,
      inss: inss_terco,
      irrf: irrf_terco,
      descontos: 0,
      liquido: adicional_terco_ferias_bruto - inss_terco - irrf_terco,
      ticket: 0,
      fgts: calcular_fgts(adicional_terco_ferias_bruto),
      previdencia: 0,
      beneficios: 0
    });

    if (i === 0 && dados.vender_abono && (dados.dias_abono || 0) > 0) {
      const diasAbono = dados.dias_abono || 0;
      const abono_bruto = (salarioParaFerias / 30) * diasAbono;
      const adicional_terco_abono_bruto = (salarioParaFerias / 3 / 30) * diasAbono;
      recebimentos.push({ data: new Date(data_pagamento), descricao: `Abono Pecuniário (${diasAbono}d)`, bruto: abono_bruto, inss: 0, irrf: 0, descontos: 0, liquido: abono_bruto, ticket: 0, fgts: 0, previdencia: 0, beneficios: 0 });
      recebimentos.push({ data: new Date(data_pagamento), descricao: `Adicional 1/3 do Abono`, bruto: adicional_terco_abono_bruto, inss: 0, irrf: 0, descontos: 0, liquido: adicional_terco_abono_bruto, ticket: 0, fgts: 0, previdencia: 0, beneficios: 0 });
    }

    for (let d = 0; d < dias; d++) {
      let dia_atual = new Date(periodo.inicio);
      dia_atual.setDate(dia_atual.getDate() + d);
      const key = `${dia_atual.getFullYear()}-${dia_atual.getMonth() + 1}`;
      if (!dias_de_ferias_por_ano_mes[key]) dias_de_ferias_por_ano_mes[key] = 0;
      dias_de_ferias_por_ano_mes[key]++;
    }
  });

  let projected13ForYear: { [key: number]: boolean } = {};

  const startMeses = dados.data_inicio ? dados.data_inicio : new Date();
  const totalMeses = dados.meses_projecao > 0 ? dados.meses_projecao : 12;

  for (let m = 0; m < totalMeses; m++) {
    let dataAtual = new Date(startMeses.getFullYear(), startMeses.getMonth() + m, 1);
    let mes = dataAtual.getMonth() + 1; // 1 to 12
    let ano_corrente = dataAtual.getFullYear();

    const hasRaise = appliesRaise(dataAtual, dados.mes_aumento);

    if (!projected13ForYear[ano_corrente] && (mes === 11 || mes === 12)) {
      projected13ForYear[ano_corrente] = true;
      const dec13Date = new Date(ano_corrente, 11, 1);
      const objRaise = appliesRaise(dec13Date, dados.mes_aumento);
      const salarioBase13 = objRaise ? dados.salario_bruto * increaseMultiplier : dados.salario_bruto;

      const inss_13 = calcular_inss(salarioBase13);
      const previdenciaPara13 = objRaise ? dados.previdencia_valor * increaseMultiplier : dados.previdencia_valor;
      const prev_13 = dados.incide_prev_13 ? previdenciaPara13 : 0;
      const irrf_13 = calcular_irrf(salarioBase13 - inss_13 - prev_13, dados.dependentes);

      const segunda_parcela_13 = (salarioBase13 / 2) - inss_13 - irrf_13 - prev_13;

      recebimentos.push({ data: new Date(ano_corrente, 10, 30), descricao: `13º Salário (1ª Parc.)`, bruto: salarioBase13 / 2, inss: 0, irrf: 0, descontos: 0, liquido: salarioBase13 / 2, ticket: 0, fgts: calcular_fgts(salarioBase13 / 2), previdencia: 0, beneficios: 0 });
      recebimentos.push({ data: new Date(ano_corrente, 11, 20), descricao: `13º Salário (2ª Parc.)`, bruto: salarioBase13 / 2, inss: inss_13, irrf: irrf_13, descontos: prev_13, liquido: segunda_parcela_13, ticket: 0, fgts: calcular_fgts(salarioBase13 / 2), previdencia: prev_13, beneficios: 0 });
    }

    if (!invalidDate(dados.data_plr)) {
      let plrDate = new Date(dados.data_plr);
      if (plrDate.getFullYear() === ano_corrente && plrDate.getMonth() + 1 === mes) {
        const retidoPLR = calcular_irrf(dados.plr_bruto, 0, TABELA_IRRF_PLR);
        recebimentos.push({ data: new Date(dados.data_plr), descricao: "PLR", bruto: dados.plr_bruto, inss: 0, irrf: retidoPLR, descontos: 0, liquido: dados.plr_bruto - retidoPLR, ticket: 0, fgts: 0, previdencia: 0, beneficios: 0 });
      }
    }

    if (!invalidDate(dados.data_ticket_anual)) {
      let tDate = new Date(dados.data_ticket_anual);
      if (tDate.getFullYear() === ano_corrente && tDate.getMonth() + 1 === mes) {
        recebimentos.push({ data: new Date(dados.data_ticket_anual), descricao: "Ticket de Natal", bruto: 0, inss: 0, irrf: 0, descontos: 0, liquido: 0, ticket: dados.ticket_anual, fgts: 0, previdencia: 0, beneficios: 0 });
      }
    }

    const currentSalarioBruto = hasRaise ? dados.salario_bruto * increaseMultiplier : dados.salario_bruto;
    const previdencia_mensal = hasRaise ? dados.previdencia_valor * increaseMultiplier : dados.previdencia_valor;
    const ticket_mensal_val = hasRaise ? dados.ticket_mensal * increaseMultiplier : dados.ticket_mensal;

    const key = `${ano_corrente}-${mes}`;
    const dias_ferias_no_mes = dias_de_ferias_por_ano_mes[key] || 0;
    const dias_trabalhados = 30 - dias_ferias_no_mes;

    if (dias_trabalhados <= 0) {
      recebimentos.push({ data: obter_data_pagamento(ano_corrente, mes, dados.dia_pagamento), descricao: `Ticket integral (Mês Férias)`, bruto: 0, inss: 0, irrf: 0, descontos: 0, liquido: 0, ticket: ticket_mensal_val, fgts: 0, previdencia: 0, beneficios: 0 });
      continue;
    }

    const salario_bruto_mes = (currentSalarioBruto / 30) * dias_trabalhados;
    const previdencia_mes = (previdencia_mensal / 30) * dias_trabalhados;
    const outros_desc_mes = (dados.outros_descontos / 30) * dias_trabalhados;
    const beneficios_total_mes = dados.plano_saude + dados.plano_odonto + dados.seguro_vida;
    const beneficios_proporcionais = (beneficios_total_mes / 30) * dias_trabalhados;

    const inss_mes = calcular_inss(salario_bruto_mes);
    const irrf_mes = calcular_irrf(salario_bruto_mes - inss_mes - previdencia_mes, dados.dependentes);
    const fgts_mes = calcular_fgts(salario_bruto_mes);

    const salario_liq_total_original = salario_bruto_mes - inss_mes - irrf_mes - previdencia_mes - outros_desc_mes;

    let valor_vale_a_pagar = 0;
    if (dados.tem_adiantamento) {
      let target_ad = dados.valor_adiantamento;
      if (hasRaise) target_ad = target_ad * increaseMultiplier;

      valor_vale_a_pagar = Math.min(target_ad, Math.max(0, salario_liq_total_original));

      let ultimo_dia_do_mes = getDaysInMonth(ano_corrente, mes);
      let dia_do_vale = Math.min(dados.dia_adiantamento, ultimo_dia_do_mes);
      let data_vale = new Date(ano_corrente, mes - 1, dia_do_vale);
      while (data_vale.getDay() === 0 || data_vale.getDay() === 6) {
        data_vale.setDate(data_vale.getDate() - 1);
      }

      if (valor_vale_a_pagar > 0) {
        recebimentos.push({ data: data_vale, descricao: "Adiantamento Salarial", bruto: valor_vale_a_pagar, inss: 0, irrf: 0, descontos: 0, liquido: valor_vale_a_pagar, ticket: 0, fgts: 0, previdencia: 0, beneficios: 0 });
      }
    }

    const bruto_saldo = salario_bruto_mes - valor_vale_a_pagar;
    const liquido_final = bruto_saldo - inss_mes - irrf_mes - outros_desc_mes - previdencia_mes;
    const desc = dias_trabalhados === 30 ? "Salário Integral" : `Saldo Salário (${dias_trabalhados}d)`;

    recebimentos.push({
      data: obter_data_pagamento(ano_corrente, mes, dados.dia_pagamento),
      descricao: desc,
      bruto: bruto_saldo,
      inss: inss_mes,
      irrf: irrf_mes,
      descontos: outros_desc_mes,
      liquido: liquido_final,
      ticket: ticket_mensal_val,
      previdencia: previdencia_mes,
      fgts: fgts_mes,
      beneficios: beneficios_proporcionais
    });
  }

  let validStart = new Date(startMeses.getFullYear(), startMeses.getMonth(), 1);
  let validEnd = new Date(startMeses.getFullYear(), startMeses.getMonth() + totalMeses, 0);

  const validReceipts = recebimentos.filter(r => r.data.getTime() >= validStart.getTime() && r.data.getTime() <= validEnd.getTime());

  return validReceipts.sort((a, b) => a.data.getTime() - b.data.getTime());
}
