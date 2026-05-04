import type { SalaryParams, Receipt, RescisaoResult, RescisaoVerba } from '../types';

// ── RPPS Federal (EC 103/2019) — alíquotas progressivas sobre o salário de contribuição
export const TABELA_RPPS_FEDERAL = [
  { limite: 1412.00, aliquota: 7.5 },
  { limite: 2666.68, aliquota: 9.0 },
  { limite: 4000.03, aliquota: 12.0 },
  { limite: 7786.02, aliquota: 14.0 },
  { limite: Infinity, aliquota: 16.5 }, // acima do teto: alíquota suplementar / Funpresp
];

export function calcular_rpps_federal(base_calculo: number): number {
  let total = 0.0;
  let restante = base_calculo;
  let anterior = 0.0;
  for (const faixa of TABELA_RPPS_FEDERAL) {
    const slice = Math.min(restante, faixa.limite - anterior);
    total += slice * (faixa.aliquota / 100);
    restante -= slice;
    if (restante <= 0) break;
    anterior = faixa.limite;
  }
  return Number(total.toFixed(2));
}

export const TETO_RGPS = 8475.55; // teto do salário de contribuição RGPS 2025

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

  const regime = dados.regime_trabalho || 'clt';
  const isPJ = regime === 'pj';
  const isServidor = regime === 'servidor_federal' || regime === 'servidor_estadual';

  // Contribuição previdenciária conforme regime
  const calcContribPrevidenciaria = (base: number): number => {
    if (isPJ) {
      const aliq = (dados.aliquota_inss_pj || 11) / 100;
      return Number((Math.min(base, TETO_RGPS) * aliq).toFixed(2));
    }
    if (regime === 'servidor_federal') return calcular_rpps_federal(base);
    if (regime === 'servidor_estadual') {
      return Number((base * (dados.aliquota_rpps_estadual || 14) / 100).toFixed(2));
    }
    return calcular_inss(base); // CLT
  };

  const increaseMultiplier = 1 + ((dados.aumento_percentual || 0) / 100);

  let dias_de_ferias_por_ano_mes: { [key: string]: number } = {};

  // PJ não possui férias remuneradas por lei — pula cálculo de férias
  const feriasValidas = isPJ ? [] : (dados.ferias || []).filter(f => !invalidDate(f.inicio) && f.dias > 0);

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

  // Quando simula demissão, corta a projeção no mês ANTERIOR ao da demissão.
  // O mês da demissão e as verbas rescisórias são exibidos na seção de rescisão.
  let totalMeses = dados.meses_projecao > 0 ? dados.meses_projecao : 12;
  if (dados.simular_demissao && dados.data_demissao && !isNaN(dados.data_demissao.getTime())) {
    const dem = dados.data_demissao;
    // Meses do mês inicial ao mês imediatamente ANTES da demissão
    const mesesAteDem =
      (dem.getFullYear() - startMeses.getFullYear()) * 12 +
      (dem.getMonth() - startMeses.getMonth());
    totalMeses = Math.max(0, mesesAteDem);
  }

  for (let m = 0; m < totalMeses; m++) {
    let dataAtual = new Date(startMeses.getFullYear(), startMeses.getMonth() + m, 1);
    let mes = dataAtual.getMonth() + 1; // 1 to 12
    let ano_corrente = dataAtual.getFullYear();

    const hasRaise = appliesRaise(dataAtual, dados.mes_aumento);

    // PJ não tem 13º automático; Servidores têm (igual ao CLT)
    // Pula 13º quando há simulação de demissão (será calculado como 13º proporcional na rescisão)
    if (!isPJ && !dados.simular_demissao && !projected13ForYear[ano_corrente] && (mes === 11 || mes === 12)) {
      projected13ForYear[ano_corrente] = true;
      const dec13Date = new Date(ano_corrente, 11, 1);
      const objRaise = appliesRaise(dec13Date, dados.mes_aumento);
      const salarioBase13 = objRaise ? dados.salario_bruto * increaseMultiplier : dados.salario_bruto;

      const inss_13 = calcContribPrevidenciaria(salarioBase13);
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
        let retidoPLR = 0;
        let descPlr = "PLR";
        if (isPJ) {
          // Distribuição de lucros: isenta de IR no Simples Nacional
          retidoPLR = 0;
          descPlr = "Distribuição Extra";
        } else if (isServidor) {
          // Gratificação: tabela IRRF normal (não PLR)
          retidoPLR = calcular_irrf(dados.plr_bruto, dados.dependentes);
          descPlr = "Gratificação Extraord.";
        } else {
          retidoPLR = calcular_irrf(dados.plr_bruto, 0, TABELA_IRRF_PLR);
        }
        recebimentos.push({ data: new Date(dados.data_plr), descricao: descPlr, bruto: dados.plr_bruto, inss: 0, irrf: retidoPLR, descontos: 0, liquido: dados.plr_bruto - retidoPLR, ticket: 0, fgts: 0, previdencia: 0, beneficios: 0 });
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

    // Para PJ: pró-labore é o mesmo independente de "dias trabalhados" (salário fixo mensal)
    const dias_fator = isPJ ? 30 : dias_trabalhados;
    const salario_bruto_mes = (currentSalarioBruto / 30) * dias_fator;
    const previdencia_mes = (previdencia_mensal / 30) * dias_fator;
    const outros_desc_mes = (dados.outros_descontos / 30) * dias_fator;
    const beneficios_total_mes = dados.plano_saude + dados.plano_odonto + dados.seguro_vida;
    const beneficios_proporcionais = (beneficios_total_mes / 30) * dias_fator;

    const inss_mes = calcContribPrevidenciaria(salario_bruto_mes);
    const irrf_mes = calcular_irrf(salario_bruto_mes - inss_mes - previdencia_mes, dados.dependentes);
    // FGTS existe apenas no CLT
    const fgts_mes = (!isPJ && !isServidor) ? calcular_fgts(salario_bruto_mes) : 0;

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

    let desc: string;
    if (isPJ) {
      desc = "Pró-labore";
    } else if (isServidor) {
      desc = dias_trabalhados === 30 ? "Vencimento Integral" : `Vencimento (${dias_trabalhados}d)`;
    } else {
      desc = dias_trabalhados === 30 ? "Salário Integral" : `Saldo Salário (${dias_trabalhados}d)`;
    }

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

    // PJ: adiciona distribuição de lucros mensal (isenta de IR no Simples Nacional)
    if (isPJ && dados.distribuicao_lucros > 0) {
      const distLucros = hasRaise ? dados.distribuicao_lucros * increaseMultiplier : dados.distribuicao_lucros;
      recebimentos.push({
        data: obter_data_pagamento(ano_corrente, mes, dados.dia_pagamento),
        descricao: "Distribuição de Lucros",
        bruto: distLucros,
        inss: 0,
        irrf: 0,
        descontos: 0,
        liquido: distLucros,
        ticket: 0,
        previdencia: 0,
        fgts: 0,
        beneficios: 0,
      });
    }
  }

  let validStart = new Date(startMeses.getFullYear(), startMeses.getMonth(), 1);
  let validEnd = new Date(startMeses.getFullYear(), startMeses.getMonth() + totalMeses, 0);

  const validReceipts = recebimentos.filter(r => r.data.getTime() >= validStart.getTime() && r.data.getTime() <= validEnd.getTime());

  return validReceipts.sort((a, b) => a.data.getTime() - b.data.getTime());
}

// ───────────────────────────────────────────────────────────────
// CÁLCULO RESCISÓRIO
// ───────────────────────────────────────────────────────────────

/**
 * Calcula dias de aviso prévio proporcional conforme Lei 12.506/2011.
 * 30 dias + 3 dias por ano completo trabalhado (máx 90 dias).
 */
export function calcularDiasAvisoPrevio(dataAdmissao: Date, dataDemissao: Date): number {
  const diffMs = dataDemissao.getTime() - dataAdmissao.getTime();
  const anosCompletos = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  return Math.min(90, 30 + anosCompletos * 3);
}

/**
 * Retorna quantos meses completos foram trabalhados no período aquisitivo atual.
 * Usa o aniversário da data de admissão como marco de início do período (máx 11).
 */
export function calcularFeriasProporcionaisMeses(dataAdmissao: Date, dataDemissao: Date): number {
  let aniverAtual = new Date(dataAdmissao);
  // Avança até o primeiro aniversário APÓS a demissão
  while (aniverAtual <= dataDemissao) {
    aniverAtual = new Date(aniverAtual.getFullYear() + 1, aniverAtual.getMonth(), aniverAtual.getDate());
  }
  // Recua um ano = início do período aquisitivo atual
  const inicioAquisitivo = new Date(aniverAtual.getFullYear() - 1, aniverAtual.getMonth(), aniverAtual.getDate());
  const meses =
    (dataDemissao.getFullYear() - inicioAquisitivo.getFullYear()) * 12 +
    (dataDemissao.getMonth() - inicioAquisitivo.getMonth());
  return Math.min(11, Math.max(0, meses));
}

export function calcularRescisao(dados: SalaryParams): RescisaoResult {
  // Rescisão CLT não se aplica a PJ nem Servidores
  if (dados.regime_trabalho && dados.regime_trabalho !== 'clt') {
    return { verbas: [], totalBruto: 0, totalInss: 0, totalIrrf: 0, totalLiquido: 0, diasAvisoPrevio: 0, multaFgts: 0, fgtsTotal: 0 };
  }

  const {
    tipo_demissao,
    data_demissao,
    data_admissao,
    salario_bruto,
    aumento_percentual,
    mes_aumento,
    dependentes,
    saldo_fgts,
    ferias_vencidas_dias,
    aviso_previo_trabalhado,
  } = dados;

  if (!data_demissao || !data_admissao) return { verbas: [], totalBruto: 0, totalInss: 0, totalIrrf: 0, totalLiquido: 0, diasAvisoPrevio: 0, multaFgts: 0, fgtsTotal: 0 };

  // Usa a função exportada para calcular avos de férias proporcionais
  const ferias_proporcionais_meses = calcularFeriasProporcionaisMeses(data_admissao, data_demissao);

  const increaseMultiplier = 1 + ((aumento_percentual || 0) / 100);
  const hasRaise = mes_aumento ? data_demissao >= mes_aumento : false;
  const salario = hasRaise ? salario_bruto * increaseMultiplier : salario_bruto;

  const verbas: RescisaoVerba[] = [];

  // ── Dias do mês trabalhado no mês da demissão ─────────────────
  const diasDemissao = data_demissao.getDate();
  const saldoSalarioBruto = (salario / 30) * diasDemissao;
  const inss_saldo = calcular_inss(saldoSalarioBruto);
  const irrf_saldo = calcular_irrf(saldoSalarioBruto - inss_saldo, dependentes);
  verbas.push({
    descricao: `Saldo de Salário (${diasDemissao} dias)`,
    bruto: saldoSalarioBruto,
    inss: inss_saldo,
    irrf: irrf_saldo,
    liquido: saldoSalarioBruto - inss_saldo - irrf_saldo,
    tributavel: true,
    tooltip: 'Salário proporcional aos dias trabalhados no mês da demissão.',
  });

  // ── Aviso prévio ─────────────────────────────────────────────
  const diasAviso = calcularDiasAvisoPrevio(data_admissao, data_demissao);
  let multaFgts = 0;
  let avisoBruto = 0;

  if (tipo_demissao === 'sem_justa_causa') {
    // Indenizado: empresa paga os dias à mais
    if (!aviso_previo_trabalhado) {
      avisoBruto = (salario / 30) * diasAviso;
      const inss_aviso = calcular_inss(avisoBruto);
      const irrf_aviso = calcular_irrf(avisoBruto - inss_aviso, dependentes);
      verbas.push({
        descricao: `Aviso Prévio Indenizado (${diasAviso} dias)`,
        bruto: avisoBruto,
        inss: inss_aviso,
        irrf: irrf_aviso,
        liquido: avisoBruto - inss_aviso - irrf_aviso,
        tributavel: true,
        tooltip: 'Aviso prévio indenizado conforme Lei 12.506/2011.',
      });
    }

    // Multa rescisória de 40% sobre FGTS
    multaFgts = saldo_fgts * 0.4;
  }

  // ── Férias Vencidas (não gozadas) ─────────────────────────────
  // Qualquer tipo de demissão (exceto justa causa recebe férias vencidas)
  if (tipo_demissao !== 'justa_causa' || ferias_vencidas_dias > 0) {
    if (ferias_vencidas_dias > 0) {
      const feriasVenBruto = (salario / 30) * ferias_vencidas_dias;
      const tercoVen = feriasVenBruto / 3;
      const totalFeriasVen = feriasVenBruto + tercoVen;
      const inss_fv = tipo_demissao === 'justa_causa' ? 0 : calcular_inss(totalFeriasVen);
      const irrf_fv = tipo_demissao === 'justa_causa' ? 0 : calcular_irrf(totalFeriasVen - inss_fv, dependentes);
      verbas.push({
        descricao: `Férias Vencidas + 1/3 (${ferias_vencidas_dias}d)`,
        bruto: totalFeriasVen,
        inss: inss_fv,
        irrf: irrf_fv,
        liquido: totalFeriasVen - inss_fv - irrf_fv,
        tributavel: tipo_demissao !== 'justa_causa',
        tooltip: 'Férias vencidas não gozadas + adicional de 1/3. Na justa causa, isenta de INSS/IRRF.',
      });
    }
  }

  // ── Férias Proporcionais ──────────────────────────────────────
  // Pedido de demissão e sem justa causa recebem férias proporcionais
  // Justa causa NÃO recebe férias proporcionais
  if (tipo_demissao !== 'justa_causa' && ferias_proporcionais_meses > 0) {
    const feriasPropBruto = (salario / 12) * ferias_proporcionais_meses;
    const tercoProp = feriasPropBruto / 3;
    const totalFeriasProp = feriasPropBruto + tercoProp;
    const inss_fp = calcular_inss(totalFeriasProp);
    const irrf_fp = calcular_irrf(totalFeriasProp - inss_fp, dependentes);
    verbas.push({
      descricao: `Férias Proporcionais + 1/3 (${ferias_proporcionais_meses}/12 avos)`,
      bruto: totalFeriasProp,
      inss: inss_fp,
      irrf: irrf_fp,
      liquido: totalFeriasProp - inss_fp - irrf_fp,
      tributavel: true,
      tooltip: `Férias proporcionais referente a ${ferias_proporcionais_meses} ${ferias_proporcionais_meses === 1 ? 'mês' : 'meses'} no período aquisitivo vigente.`,
    });
  }

  // ── 13º Proporcional ──────────────────────────────────────────
  // Pedido de demissão e sem justa causa recebem 13º proporcional
  // Justa causa NÃO recebe 13º proporcional
  if (tipo_demissao !== 'justa_causa') {
    // Meses trabalhados no ano da demissão
    const mesesTrabalhados = data_demissao.getMonth() + 1; // 1 a 12
    const decimo13Bruto = (salario / 12) * mesesTrabalhados;
    const inss_13 = calcular_inss(decimo13Bruto);
    const irrf_13 = calcular_irrf(decimo13Bruto - inss_13, dependentes);
    verbas.push({
      descricao: `13º Proporcional (${mesesTrabalhados}/12 avos)`,
      bruto: decimo13Bruto,
      inss: inss_13,
      irrf: irrf_13,
      liquido: decimo13Bruto - inss_13 - irrf_13,
      tributavel: true,
      tooltip: `13º salário proporcional ao meses trabalhados em ${data_demissao.getFullYear()}.`,
    });
  }

  // ── Multa FGTS (40%) — exibida como linha informativa ─────────
  const fgtsTotal = saldo_fgts + multaFgts;

  // Totais
  const totalBruto = verbas.reduce((s, v) => s + v.bruto, 0);
  const totalInss = verbas.reduce((s, v) => s + v.inss, 0);
  const totalIrrf = verbas.reduce((s, v) => s + v.irrf, 0);
  const totalLiquido = verbas.reduce((s, v) => s + v.liquido, 0);

  return { verbas, totalBruto, totalInss, totalIrrf, totalLiquido, diasAvisoPrevio: diasAviso, multaFgts, fgtsTotal };
}
