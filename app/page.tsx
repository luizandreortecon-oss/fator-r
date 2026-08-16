'use client'

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { UploadArea } from "@/components/upload-area"
import { KpiCards } from "@/components/kpi-cards"
import { GaugeChart } from "@/components/gauge-chart"
import { MonthlyBarChart } from "@/components/monthly-bar-chart"
import { RecommendationPanel } from "@/components/recommendation-panel"
import { calcularResumo, monthlyData } from "@/lib/fator-r-data"
const RESUMO_ZERADO = {
  fatorR: 0,
  anexo: "Anexo V",
  enquadrado: false,
  meta: 0.28,
  ajusteNecessario: 0,
  faturamentoTotal: 0,
  massaSalarialTotal: 0,
  diferencaMassa: 0,
}

export default function Page() {
  const [resumo, setResumo] = useState(RESUMO_ZERADO)
  // ... resto do código
export default function Page() {
  const [resumo, setResumo] = useState(calcularResumo(monthlyData))
  const [faturamento, setFaturamento] = useState<string>('')
  const [massaSalarial, setMassaSalarial] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Tratamento de valores para formato numérico
  const parseInputNumber = (val: string): number => {
    if (!val) return 0
    const cleanVal = val.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(cleanVal)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleCalcular = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    try {
      const API_URL = 'https://fator-r.onrender.com/api/calcular'

      const fatNum = parseInputNumber(faturamento)
      const massaNum = parseInputNumber(massaSalarial)

      if (fatNum <= 0) {
        throw new Error('Informe um faturamento válido maior que zero.')
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faturamento: fatNum,
          massa_salarial: massaNum,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao realizar o cálculo')
      }

      // Atualização do estado com fallbacks para evitar "NaN"
      setResumo({
        fatorR: (data.fator_r !== undefined ? data.fator_r : (massaNum / fatNum) * 100) / 100,
        anexo: data.anexo,
        enquadrado: data.enquadrado,
        meta: (data.meta !== undefined ? data.meta : 28) / 100,
        ajusteNecessario: data.ajuste_necessario ?? Math.max(0, fatNum * 0.28 - massaNum),
        faturamentoTotal: data.faturamento ?? fatNum,
        massaSalarialTotal: data.massa_salarial ?? massaNum,
        diferencaMassa: data.ajuste_necessario ?? Math.max(0, fatNum * 0.28 - massaNum),
      } as any)

    } catch (err: any) {
      setErro(err.message || 'Erro na comunicação com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const gaugeValue = resumo.fatorR <= 1 ? resumo.fatorR * 100 : resumo.fatorR

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Formulário */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-card-foreground">
            Simulação Direta de Fator R
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Informe os valores acumulados dos últimos 12 meses para consultar o enquadramento na API.
          </p>

          <form onSubmit={handleCalcular} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Faturamento (12m)
              </label>
              <input
                type="text"
                placeholder="Ex: 200000,00"
                value={faturamento}
                onChange={(e) => setFaturamento(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Massa Salarial (12m)
              </label>
              <input
                type="text"
                placeholder="Ex: 70000,00"
                value={massaSalarial}
                onChange={(e) => setMassaSalarial(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Calculando na API...' : 'Calcular Fator R'}
            </button>
          </form>

          {erro && (
            <p className="mt-3 text-xs text-destructive font-medium">{erro}</p>
          )}
        </div>

        {/* KPIs */}
        <KpiCards resumo={resumo} />

        {/* Upload + Gauge */}
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
              <GaugeChart value={gaugeValue} />
            </div>
          </div>
        </div>

        {/* Recomendações */}
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
