import { AlertTriangle, CheckCircle2, Target, TrendingUp, Wallet, ShieldCheck } from "lucide-react"

interface Resumo {
  fatorR?: number
  anexo?: string
  enquadrado?: boolean
  meta?: number
  ajusteNecessario?: number
  ajuste_necessario?: number
  faturamentoTotal?: number
  faturamento?: number
  massaSalarialTotal?: number
  massaSalarial?: number
  massa_salarial?: number
  diferencaMassa?: number
}

interface RecommendationPanelProps {
  resumo: Resumo
}

export function RecommendationPanel({ resumo }: RecommendationPanelProps) {
  // Extração defensiva com fallbacks contra qualquer valor indefinido
  const fatTotal = Number(resumo.faturamentoTotal ?? resumo.faturamento ?? 0)
  const massaTotal = Number(resumo.massaSalarialTotal ?? resumo.massaSalarial ?? resumo.massa_salarial ?? 0)
  const fatorR = Number(resumo.fatorR ?? 0)
  const ajusteReq = Number(resumo.ajusteNecessario ?? resumo.ajuste_necessario ?? resumo.diferencaMassa ?? 0)

  // Verifica se está enquadrado no Anexo III
  const isAnexo3 =
    resumo.anexo === "Anexo III" ||
    resumo.anexo === "III" ||
    resumo.enquadrado === true ||
    fatorR >= 0.28

  // Cálculos das metas
  const metaMassaAnual = fatTotal * 0.28
  const metaMassaMensal = metaMassaAnual / 12
  const ajusteAnual = ajusteReq > 0 ? ajusteReq : Math.max(0, metaMassaAnual - massaTotal)
  const margemSeguranca = Math.max(0, massaTotal - metaMassaAnual)

  // Formatação de moeda BRL blindada contra NaN
  const formatCurrency = (val: any) => {
    const num = typeof val === "number" ? val : parseFloat(val)
    const safeNum = isNaN(num) || !isFinite(num) ? 0 : num
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeNum)
  }

  // Formatação de porcentagem blindada
  const formatPercent = (val: any) => {
    const num = typeof val === "number" ? val : parseFloat(val)
    const safeNum = isNaN(num) || !isFinite(num) ? 0 : num
    const p = safeNum <= 1 ? safeNum : safeNum / 100
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(p)
  }

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all ${
        isAnexo3
          ? "border-blue-500/30 bg-blue-950/20 text-blue-100"
          : "border-amber-500/30 bg-amber-950/20 text-amber-100"
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-start gap-3">
        <div
          className={`rounded-lg p-2.5 ${
            isAnexo3 ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
          }`}
        >
          {isAnexo3 ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <AlertTriangle className="h-6 w-6" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            {isAnexo3
              ? "Excelente! Empresa enquadrada no Anexo III"
              : "Atenção: risco de Anexo V"}
          </h3>
          <p className="text-sm opacity-90 leading-relaxed text-muted-foreground">
            {isAnexo3 ? (
              <>
                Sua massa salarial representa{" "}
                <strong className="text-blue-400">{formatPercent(fatorR)}</strong> do
                faturamento nos últimos 12 meses (meta mínima: 28,00%).{" "}
                <span className="font-semibold text-foreground">
                  Não é necessário realizar nenhum aumento na folha de pagamento ou pró-labore.
                </span>
              </>
            ) : (
              <>
                Para migrar para o <strong className="text-foreground">Anexo III</strong> (alíquota reduzida),
                você precisa ajustar a folha/pró-labore em{" "}
                <strong className="text-red-500 font-bold">
                  {formatCurrency(ajusteAnual)}
                </strong>{" "}
                nos próximos 12 meses acumulados.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cartões Inferiores */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-lg border border-border/40 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <Target className="h-3.5 w-3.5 text-primary" />
            <span>{isAnexo3 ? "Margem de Segurança (12m)" : "Meta de folha / mês"}</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {isAnexo3
              ? formatCurrency(margemSeguranca)
              : formatCurrency(metaMassaMensal)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isAnexo3
              ? "Valor acumulado acima dos 28%"
              : "Média mensal para enquadramento"}
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-lg border border-border/40 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Faturamento projetado</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(fatTotal)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Base de cálculo (12m)
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-lg border border-border/40 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            {isAnexo3 ? (
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            ) : (
              <Wallet className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>Massa salarial atual</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(massaTotal)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Folha + Encargos + Pró-labore (12m)
          </p>
        </div>
      </div>
    </div>
  )
}
