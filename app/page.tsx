import { DashboardHeader } from "@/components/dashboard-header"
import { UploadArea } from "@/components/upload-area"
import { KpiCards } from "@/components/kpi-cards"
import { GaugeChart } from "@/components/gauge-chart"
import { MonthlyBarChart } from "@/components/monthly-bar-chart"
import { RecommendationPanel } from "@/components/recommendation-panel"
import { calcularResumo, monthlyData } from "@/lib/fator-r-data"

export default function Page() {
  const resumo = calcularResumo(monthlyData)

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* KPIs */}
        <KpiCards resumo={resumo} />

        {/* Upload + Velocímetro */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UploadArea />

          <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2">
              <h2 className="text-base font-semibold text-card-foreground">Velocímetro do Fator R</h2>
              <p className="text-sm text-muted-foreground">
                Escala de 0% a 100% — limite de enquadramento em 28%
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <GaugeChart value={resumo.fatorR} />
            </div>
          </div>
        </div>

        {/* Recomendação inteligente */}
        <RecommendationPanel resumo={resumo} />

        {/* Evolução mensal */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-card-foreground">Evolução Mensal</h2>
            <p className="text-sm text-muted-foreground">
              Faturamento Bruto vs Encargos / Folha de Pagamento — últimos 12 meses
            </p>
          </div>
          <MonthlyBarChart data={monthlyData} />
        </div>
      </div>
    </main>
  )
}
