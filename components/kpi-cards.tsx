import { TrendingUp, Wallet, Users, Gauge, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { type FatorRResumo, formatBRL, formatPercent } from "@/lib/fator-r-data"

type KpiCardsProps = {
  resumo: FatorRResumo
}

export function KpiCards({ resumo }: KpiCardsProps) {
  const { fatorR, isAnexoIII, faturamentoAcumulado, massaSalarialAcumulada } = resumo

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Fator R Atual */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Fator R Atual</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <Gauge className="h-5 w-5" aria-hidden />
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-foreground">
          {formatPercent(fatorR)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Meta de enquadramento: 28,00%</p>
      </div>

      {/* Status do Enquadramento */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Status do Enquadramento</span>
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isAnexoIII ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}
          >
            {isAnexoIII ? (
              <ArrowUpRight className="h-5 w-5" aria-hidden />
            ) : (
              <ArrowDownRight className="h-5 w-5" aria-hidden />
            )}
          </span>
        </div>
        <div className="mt-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
              isAnexoIII
                ? "bg-success text-success-foreground"
                : "bg-danger text-danger-foreground"
            }`}
          >
            {isAnexoIII ? "Anexo III" : "Anexo V"}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isAnexoIII ? "Alíquota reduzida" : "Alíquota cheia"}
        </p>
      </div>

      {/* Faturamento Acumulado */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Faturamento (12 meses)</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-foreground">
          {formatBRL(faturamentoAcumulado, { compact: true })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{formatBRL(faturamentoAcumulado)}</p>
      </div>

      {/* Massa Salarial Acumulada */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Massa Salarial (12 meses)</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
            <Users className="h-5 w-5" aria-hidden />
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-foreground">
          {formatBRL(massaSalarialAcumulada, { compact: true })}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Wallet className="h-3 w-3" aria-hidden />
          Folha + Encargos + Pró-labore
        </p>
      </div>
    </div>
  )
}
