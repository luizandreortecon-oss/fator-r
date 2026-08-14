'use client'

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { UploadArea } from "@/components/upload-area"
import { KpiCards } from "@/components/kpi-cards"
import { GaugeChart } from "@/components/gauge-chart"
import { MonthlyBarChart } from "@/components/monthly-bar-chart"
import { RecommendationPanel } from "@/components/recommendation-panel"
import { calcularResumo, monthlyData } from "@/lib/fator-r-data"

export default function Page() {
  // 1. Estado inicial com os dados padrão
  const [resumo, setResumo] = useState(calcularResumo(monthlyData))
  const [faturamento, setFaturamento] = useState<string>('')
  const [massaSalarial, setMassaSalarial] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // 2. Função para chamar o backend em Python no Render
  const handleCalcular = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    try {
      // ⚠️ SUBSTITUA PELA SUA URL DO RENDER
      const API_URL = 'https://fator-r-backend.onrender.com/api/calcular'

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faturamento: Number(faturamento),
          massa_salarial: Number(massaSalarial),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao realizar o cálculo')
      }

      // 3. Mapeia a resposta da API do Python para o formato que os componentes React esperam
      setResumo({
        fatorR: data.fator_r,
        anexo: data.anexo,
        enquadrado: data.enquadrado,
        meta: data.meta,
        ajusteNecessario: data.ajuste_necessario,
        faturamentoTotal: data.faturamento,
        massaSalarialTotal: data.massa_salarial,
        diferencaMassa: data.ajuste_necessario,
      } as any)

    } catch (err: any) {
      setErro(err.message || 'Erro na comunicação com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Formulário de Simulação Rápida */}
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
                type="number"
                placeholder="Ex: 100000"
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
                type="number"
                placeholder="Ex: 28000"
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

        {/* KPIs dinâmicos */}
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
