import { AlertTriangle, CheckCircle2, Target, TrendingUp } from "lucide-react"
import { type FatorRResumo, formatBRL, formatPercent, FATOR_R_LIMITE } from "@/lib/fator-r-data"

type RecommendationPanelProps = {
  resumo: FatorRResumo
}

export function RecommendationPanel({ resumo }: RecommendationPanelProps) {
  const { isAnexoIII, ajusteNecessario, faturamentoProjetado, massaSalarialAcumulada } = resumo

  // Folha mínima recomendada para o próximo mês projetado permanecer/entrar no Anexo III.
  const folhaMinimaProjetada = faturamentoProjetado * FATOR_R_LIMITE

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        isAnexoIII
          ? "border-success/30 bg-success/5"
          : "border-warning/40 bg-warning/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isAnexoIII ? "bg-success/15 text-success" : "bg-warning/25 text-warning-foreground"
          }`}
        >
          {isAnexoIII ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <AlertTriangle className="h-5 w-5" aria-hidden />
          )}
        </span>

        <div className="flex-1">
          <h2 className="text-base font-semibold text-foreground">
            {isAnexoIII ? "Enquadramento saudável no Anexo III" : "Atenção: risco de Anexo V"}
          </h2>

          {isAnexoIII ? (
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              Seu Fator R está acima de {formatPercent(FATOR_R_LIMITE, 0)}. Para manter a alíquota
              reduzida no próximo mês, mantenha a folha/pró-labore em pelo menos{" "}
              <strong className="font-mono font-semibold text-foreground">
                {formatBRL(folhaMinimaProjetada)}
              </strong>{" "}
              sobre o faturamento projetado.
            </p>
          ) : (
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              Para migrar para o <strong className="text-foreground">Anexo III</strong> (alíquota
              reduzida) no próximo mês, você precisa ajustar a folha/pró-labore em{" "}
              <strong className="font-mono font-semibold text-danger">
                {formatBRL(ajusteNecessario)}
              </strong>{" "}
              nos próximos 12 meses acumulados.
            </p>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricBox
              icon={<Target className="h-4 w-4" aria-hidden />}
              label="Meta de folha / mês"
              value={formatBRL(folhaMinimaProjetada)}
            />
            <MetricBox
              icon={<TrendingUp className="h-4 w-4" aria-hidden />}
              label="Faturamento projetado"
              value={formatBRL(faturamentoProjetado)}
            />
            <MetricBox
              icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
              label="Massa salarial atual"
              value={formatBRL(massaSalarialAcumulada, { compact: true })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}
