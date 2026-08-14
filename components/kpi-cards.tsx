import { ArrowUpRight, ArrowDownRight, Gauge, Users, TrendingUp } from "lucide-react"

interface Resumo {
  fatorR: number
  anexo: string
  enquadrado: boolean
  meta: number
  faturamentoTotal: number
  massaSalarialTotal: number
}

interface KpiCardsProps {
  resumo: Resumo
}

export function KpiCards({ resumo }: KpiCardsProps) {
  // Trata todas as variações vindas do backend ("III", "Anexo III", "V", "Anexo V")
  const isAnexo3 =
    resumo.anexo === "Anexo III" ||
    resumo.anexo === "III" ||
    resumo.enquadrado === true

  // Garante a nomenclatura completa "Anexo III" ou "Anexo V"
  const displayAnexo = isAnexo3 ? "Anexo III" : "Anexo V"

  // Formatação de moeda BRL
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  // Formatação de Porcentagem
  const formatPercent = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val || 0)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Fator R Atual */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Fator R Atual</span>
          <div className="rounded-full bg-secondary p-2 text-secondary-foreground">
            <Gauge className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatPercent(resumo.fatorR)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Meta de enquadramento: {formatPercent(resumo.meta || 0.28)}
          </p>
        </div>
      </div>

      {/* 2. Status do Enquadramento (Padronizado) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Status do Enquadramento</span>
          <div className={`rounded-full p-2 ${isAnexo3 ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>
            {isAnexo3 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          </div>
        </div>
        <div className="mt-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors ${
              isAnexo3
                ? "bg-blue-600 border border-blue-500"
                : "bg-red-600 border border-red-500"
            }`}
          >
            {displayAnexo}
          </span>
          <p className="mt-2 text-xs text-muted-foreground">
            {isAnexo3 ? "Alíquota reduzida (Ideal)" : "Alíquota cheia (Atenção)"}
          </p>
        </div>
      </div>

      {/* 3. Faturamento (12 meses) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Faturamento (12 meses)</span>
          <div className="rounded-full bg-secondary p-2 text-secondary-foreground">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(resumo.faturamentoTotal)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Receita Bruta Acumulada</p>
        </div>
      </div>

      {/* 4. Massa Salarial (12 meses) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Massa Salarial (12 meses)</span>
          <div className="rounded-full bg-secondary p-2 text-secondary-foreground">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(resumo.massaSalarialTotal)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Folha + Encargos + Pró-labore</p>
        </div>
      </div>
    </div>
  )
}
