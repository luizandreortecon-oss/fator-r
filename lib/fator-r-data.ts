// Modelo de dados e cálculos do Fator R do Simples Nacional.
// Fator R = Massa Salarial (12 meses) / Faturamento Bruto (12 meses)
// >= 28% -> Anexo III (alíquota reduzida) | < 28% -> Anexo V (alíquota cheia)

export const FATOR_R_LIMITE = 0.28

export type MonthlyRecord = {
  /** Mês de referência, ex: "Fev/25" */
  month: string
  /** Faturamento bruto do mês em R$ */
  faturamento: number
  /** Massa salarial do mês (folha + encargos + pró-labore) em R$ */
  folha: number
}

// Dados fictícios dos últimos 12 meses.
export const monthlyData: MonthlyRecord[] = [
  { month: 'Ago/24', faturamento: 92000, folha: 24500 },
  { month: 'Set/24', faturamento: 98500, folha: 25200 },
  { month: 'Out/24', faturamento: 105000, folha: 26100 },
  { month: 'Nov/24', faturamento: 111000, folha: 26800 },
  { month: 'Dez/24', faturamento: 128000, folha: 29500 },
  { month: 'Jan/25', faturamento: 96000, folha: 25000 },
  { month: 'Fev/25', faturamento: 99000, folha: 25400 },
  { month: 'Mar/25', faturamento: 103500, folha: 26000 },
  { month: 'Abr/25', faturamento: 108000, folha: 26400 },
  { month: 'Mai/25', faturamento: 112500, folha: 27000 },
  { month: 'Jun/25', faturamento: 118000, folha: 27700 },
  { month: 'Jul/25', faturamento: 121000, folha: 28400 },
]

export type FatorRResumo = {
  fatorR: number
  faturamentoAcumulado: number
  massaSalarialAcumulada: number
  isAnexoIII: boolean
  /** Massa salarial necessária para atingir 28% */
  massaSalarialAlvo: number
  /** Quanto falta ajustar na folha/pró-labore (0 se já está no Anexo III) */
  ajusteNecessario: number
  /** Faturamento previsto para o próximo mês (média dos últimos 3 meses) */
  faturamentoProjetado: number
}

export function calcularResumo(data: MonthlyRecord[] = monthlyData): FatorRResumo {
  const faturamentoAcumulado = data.reduce((acc, m) => acc + m.faturamento, 0)
  const massaSalarialAcumulada = data.reduce((acc, m) => acc + m.folha, 0)
  const fatorR = massaSalarialAcumulada / faturamentoAcumulado

  const massaSalarialAlvo = faturamentoAcumulado * FATOR_R_LIMITE
  const ajusteNecessario = Math.max(0, massaSalarialAlvo - massaSalarialAcumulada)

  const ultimos3 = data.slice(-3)
  const faturamentoProjetado =
    ultimos3.reduce((acc, m) => acc + m.faturamento, 0) / ultimos3.length

  return {
    fatorR,
    faturamentoAcumulado,
    massaSalarialAcumulada,
    isAnexoIII: fatorR >= FATOR_R_LIMITE,
    massaSalarialAlvo,
    ajusteNecessario,
    faturamentoProjetado,
  }
}

export function formatBRL(value: number, opts?: { compact?: boolean }): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: opts?.compact ? 'compact' : 'standard',
    maximumFractionDigits: opts?.compact ? 1 : 2,
  }).format(value)
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
