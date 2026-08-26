'use client'

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { UploadArea } from "@/components/upload-area"
import { KpiCards } from "@/components/kpi-cards"
import { GaugeChart } from "@/components/gauge-chart"
import { MonthlyBarChart } from "@/components/monthly-bar-chart"
import { RecommendationPanel } from "@/components/recommendation-panel"
import { monthlyData } from "@/lib/fator-r-data"

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
  const [faturamento, setFaturamento] = useState<string>('')
  const [massaSalarial, setMassaSalarial] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [chartData, setChartData] = useState(monthlyData)

  // Tratamento de valores para formato numérico
  const parseInputNumber = (val: string): number => {
    if (!val) return 0
    const cleanVal = val.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(cleanVal)
    return isNaN(parsed) ? 0 : parsed
  }

  // BUSCAR O HISTÓRICO DO BANCO DE DADOS
  const fetchHistorico = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('https://fator-r.onrender.com/api/historico', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.sucesso && data.historico.length > 0) {
        // 1. Atualiza os campos com o registro mais recente
        const ultimoRegistro = data.historico[0];
        
        setFaturamento(ultimoRegistro.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
        setMassaSalarial(ultimoRegistro.massa_salarial.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
        
        setResumo({
          fatorR: ultimoRegistro.fator_r <= 1 ? ultimoRegistro.fator_r : ultimoRegistro.fator_r / 100,
          anexo: ultimoRegistro.fator_r >= 28 ? "Anexo III" : "Anexo V",
          enquadrado: ultimoRegistro.fator_r >= 28,
          meta: 0.28,
          ajusteNecessario: Math.max(0, (ultimoRegistro.faturamento * 0.28) - ultimoRegistro.massa_salarial),
          faturamentoTotal: ultimoRegistro.faturamento,
          massaSalarialTotal: ultimoRegistro.massa_salarial,
          diferencaMassa: Math.max(0, (ultimoRegistro.faturamento * 0.28) - ultimoRegistro.massa_salarial),
        })

        // 2. Mapeia e atualiza o histórico dos 12 meses para o gráfico
        const dadosGrafico = data.historico.map((item: any) => ({
          month: item.mes || item.month || item.periodo,
          faturamento: Number(item.faturamento || 0),
          massaSalarial: Number(item.massa_salarial || item.folha || 0),
        })).reverse() // Exibe do mês mais antigo para o mais recente

        setChartData(dadosGrafico)
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

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

      setResumo({
        fatorR: (data.fator_r !== undefined ? data.fator_r : (massaNum / fatNum) * 100) / 100,
        anexo: data.anexo ?? (data.enquadrado ? "Anexo III" : "Anexo V"),
        enquadrado: data.enquadrado ?? ((massaNum / fatNum) >= 0.28),
        meta: (data.meta !== undefined ? data.meta : 28) / 100,
        ajusteNecessario: data.ajuste_necessario ?? Math.max(0, fatNum * 0.28 - massaNum),
        faturamentoTotal: data.faturamento ?? fatNum,
        massaSalarialTotal: data.massa_salarial ?? massaNum,
        diferencaMassa: data.ajuste_necessario ?? Math.max(0, fatNum * 0.28 - massaNum),
      })

    } catch (err: any) {
      setErro(err.message || 'Erro na comunicação com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDataExtractedFromUpload = (data: any) => {
    if (data.erro) {
      setErro(data.erro)
      return
    }

    const fat = data.faturamento || 0
    const massa = data.massaSalarial || 0
    const fatorRCalculado = data.fatorR !== undefined 
      ? data.fatorR 
      : (fat > 0 ? (massa / fat) * 100 : 0)

    setFaturamento(fat > 0 ? fat.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
    setMassaSalarial(massa > 0 ? massa.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')

    setResumo({
      fatorR: fatorRCalculado <= 1 ? fatorRCalculado : fatorRCalculado / 100,
      anexo: data.anexo || (fatorRCalculado >= 28 ? "Anexo III" : "Anexo V"),
      enquadrado: data.enquadrado ?? (fatorRCalculado >= 28),
      meta: 0.28,
      ajusteNecessario: Math.max(0, (fat * 0.28) - massa),
      faturamentoTotal: fat,
      massaSalarialTotal: massa,
      diferencaMassa: Math.max(0, (fat * 0.28) - massa),
    })
  }

  const gaugeValue = resumo.fatorR <= 1 ? resumo.fatorR * 100 : resumo.fatorR

  return (
    <main className="min-h-screen bg-slate-300 text-slate-900 pb-12">
      <DashboardHeader />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Formulário Manual */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-base font-bold text-slate-800">
            Simulação Direta de Fator R
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Informe os valores acumulados dos últimos 12 meses para consultar o enquadramento na API.
          </p>

          <form onSubmit={handleCalcular} className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Faturamento (12m)
              </label>
              <input
                type="text"
                placeholder="Ex: 200000,00"
                value={faturamento}
                onChange={(e) => setFaturamento(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Massa Salarial (12m)
              </label>
              <input
                type="text"
                placeholder="Ex: 70000,00"
                value={massaSalarial}
                onChange={(e) => setMassaSalarial(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Calculando na API...' : 'Calcular Fator R'}
            </button>
          </form>

          {erro && (
            <p className="mt-3 text-xs text-red-600 font-medium">{erro}</p>
          )}
        </div>

        {/* KPIs */}
        <KpiCards resumo={resumo} />

        {/* Upload + Gauge */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <UploadArea onDataExtracted={handleDataExtractedFromUpload} />

          <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2">
              <h2 className="text-base font-bold text-slate-800">Velocímetro do Fator R</h2>
              <p className="text-sm text-slate-500">
                Escala de 0% a 100% — limite de enquadramento em 28%
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center pt-4">
              <GaugeChart value={gaugeValue} />
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <RecommendationPanel resumo={resumo} />

        {/* Evolução mensal */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-800">Evolução Mensal</h2>
            <p className="text-sm text-slate-500">
              Faturamento Bruto vs Encargos / Folha de Pagamento — últimos 12 meses
            </p>
          </div>
          <MonthlyBarChart data={chartData} />
        </div>
      </div>
    </main>
  )
}
