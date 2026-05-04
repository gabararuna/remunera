import { useState, useEffect } from 'react';
import type { SalaryParams } from '../types';

const defaultParams: SalaryParams = {
  regime_trabalho: 'clt',
  distribuicao_lucros: 0,
  aliquota_inss_pj: 11,
  aliquota_rpps_estadual: 14,

  data_inicio: new Date(),
  meses_projecao: 12,
  aumento_percentual: 0,
  mes_aumento: null,

  salario_bruto: 0,
  tem_adiantamento: false,
  valor_adiantamento: 0,
  dia_adiantamento: 15,
  plr_bruto: 0,
  data_plr: new Date(new Date().getFullYear(), 3, 15),
  ticket_mensal: 0,
  ticket_anual: 0,
  data_ticket_anual: new Date(new Date().getFullYear(), 11, 20),
  previdencia_valor: 0,
  plano_saude: 0,
  plano_odonto: 0,
  seguro_vida: 0,
  incide_prev_13: false,
  outros_descontos: 0,
  dependentes: 0,
  vender_abono: false,
  dia_pagamento: 'ultimo',
  ferias: [],

  // Simulação de demissão
  simular_demissao: false,
  tipo_demissao: 'pedido_demissao',
  data_demissao: null,
  data_admissao: null,
  saldo_fgts: 0,
  ferias_vencidas_dias: 0,
  aviso_previo_trabalhado: false,
};

// Reviver datas from JSON string
function reviver(key: string, value: any) {
  if (value && (key.includes('data') || key === 'inicio' || key === 'mes_aumento')) {
    return new Date(value);
  }
  return value;
}

export function useSalaryForm() {
  const [params, setParams] = useState<SalaryParams>(() => {
    try {
      const saved = localStorage.getItem('salarioJusto_params');
      if (saved) {
        const parsed = JSON.parse(saved, reviver);
        // Garante que é um array de ferias
        if (!parsed.ferias) parsed.ferias = [];
        
        // Garante as propriedades novas se for um state antigo salvo
        if (!parsed.data_inicio) parsed.data_inicio = defaultParams.data_inicio;
        if (parsed.meses_projecao === undefined) parsed.meses_projecao = defaultParams.meses_projecao;
        if (parsed.aumento_percentual === undefined) parsed.aumento_percentual = defaultParams.aumento_percentual;
        if (!parsed.regime_trabalho) parsed.regime_trabalho = defaultParams.regime_trabalho;
        if (parsed.distribuicao_lucros === undefined) parsed.distribuicao_lucros = defaultParams.distribuicao_lucros;
        if (parsed.aliquota_inss_pj === undefined) parsed.aliquota_inss_pj = defaultParams.aliquota_inss_pj;
        if (parsed.aliquota_rpps_estadual === undefined) parsed.aliquota_rpps_estadual = defaultParams.aliquota_rpps_estadual;

        return { ...defaultParams, ...parsed };
      }
    } catch (e) {
      console.error('Error parsing localStorage params', e);
    }
    return defaultParams;
  });

  useEffect(() => {
    localStorage.setItem('salarioJusto_params', JSON.stringify(params));
  }, [params]);

  const updateParam = <K extends keyof SalaryParams>(key: K, value: SalaryParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return { params, setParams, updateParam };
}
