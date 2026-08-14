import { AlertTriangle, CheckCircle2, Target, TrendingUp, Wallet, ShieldCheck } from "lucide-react"

interface Resumo {
  fatorR: number
  anexo: string
  enquadrado: boolean
  meta: number
  ajusteNecessario?: number
  faturamentoTotal: number
  massaSalarialTotal: number
  diferencaMassa?: number
}

interface RecommendationPanelProps {
  resumo: Resumo
}

export function RecommendationPanel({ resumo }: RecommendationPanelProps) {
  const fatTotal = resumo.faturamentoTotal || 0
  const massaTotal = resumo.massaSalarialTotal || 0
  const fatorR = resumo.fatorR || 0

  // Identifica se a empresa está no Anexo III (Meta de 28% atingida)
  const isAnexo3 =
    resumo.anexo === "Anexo III" ||
    resumo.anexo === "III" ||
    resumo.enquadrado === true ||
    fatorR >= 0.28

  // Cálculos automáticos de suporte
  const metaMassaAnual = fatTotal * 0.28
  const metaMassaMensal = metaMassaAnual / 12
  const ajusteAnual = Math.max(0, metaMassaAnual - massaTotal)
  const margemSeguranca = Math.max(0, massaTotal - metaMassaAnual)

  // Formatação de Moedas sem risco de NaN
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(isNaN(val) ? 0 : val)
  }

  // Formatação de Porcentagem
  const formatPercent = (val: number) => {
    const p = val <= 1 ? val : val / 100
    return new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 2,
    }).format(isNaN(p) ? 0 : p)
  }

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all ${
        isAnexo3
          ? "border-blue-500/30 bg-blue-950/20 text-blue-100"
          : "border-amber-500/30 bg-amber-950/20 text-amber-100"
      }`}
    >
      {/* Cabeçalho do Alerta / Sucesso */}
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
              : "Atenção: Risco de tributação pelo Anexo V"}
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
                <strong className="text-red-400">
                  {formatCurrency(resumo.ajusteNecessario || ajusteAnual)}
                </strong>{" "}
                nos últimos 12 meses acumulados.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Cartões Informativos Inferiores */}
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
              ? "Valor acumulado acima do limite de 28%"
              : "Média mensal para enquadramento"}
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-lg border border-border/40 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Faturamento Acumulado (12m)</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(fatTotal)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Base de cálculo do Fator R
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
            <span>Massa Salarial Atual (12m)</span>
          </div>
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(massaTotal)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Folha + Encargos + Pró-labore
          </p>
        </div>
      </div>
    </div>
  )
}
