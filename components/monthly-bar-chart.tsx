"use client"

import { useEffect, useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

export interface MonthlyDataItem {
  month?: string
  mes?: string
  faturamento: number
  massaSalarial?: number
  encargos?: number
  folha?: number
  [key: string]: unknown
}

interface MonthlyBarChartProps {
  data?: MonthlyDataItem[] // Agora opcional para usar dados do backend
}

// 🔥 Função para buscar dados do backend
async function fetchMonthlyData(): Promise<MonthlyDataItem[]> {
  try {
    const response = await fetch('https://fator-r.onrender.com/api/dados-grafico')
    if (!response.ok) throw new Error('Erro ao buscar dados')
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Erro ao carregar dados do gráfico:', error)
    return [] // Retorna vazio em caso de erro
  }
}

export function MonthlyBarChart({ data: propData }: MonthlyBarChartProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [dados, setDados] = useState<MonthlyDataItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // 🔥 Carrega dados do backend se não vier via props
  useEffect(() => {
    async function carregarDados() {
      if (propData && propData.length > 0) {
        setDados(propData)
        setCarregando(false)
        return
      }

      try {
        setCarregando(true)
        const resultado = await fetchMonthlyData()
        setDados(resultado)
        setErro(null)
      } catch (err) {
        setErro('Não foi possível carregar os dados do gráfico')
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [propData])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 🔥 Loading
  if (!isMounted || carregando) {
    return <div className="h-[320px] w-full rounded-xl bg-slate-100 animate-pulse" />
  }

  // 🔥 Erro
  if (erro) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center text-red-500 text-sm">
        ⚠️ {erro}
      </div>
    )
  }

  // 🔥 Sem dados
  if (!dados || dados.length === 0) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center text-slate-400 text-sm">
        Nenhum dado disponível para exibir
      </div>
    )
  }

  // 🔥 Garante que o XAxis tenha a chave correta (month ou mes)
  const dadosComChave = dados.map((item) => ({
    ...item,
    label: item.month || item.mes || '',
  }))

  return (
    <div className="h-[320px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dadosComChave}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={8} // 🔥 Aumentei o espaço entre grupos
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

          <defs>
            <linearGradient id="gradFaturamento" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="gradEncargos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
              <stop offset="100%" stopColor="#D97706" stopOpacity={0.85} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            dy={8}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickFormatter={(val: number) => `R$ ${(val / 1000).toFixed(0)}k`}
          />

          <Tooltip
            cursor={{ fill: "rgba(226, 232, 240, 0.4)" }}
            contentStyle={{
              backgroundColor: "#0F172A",
              borderColor: "#1E293B",
              borderRadius: "10px",
              color: "#FFF",
              fontSize: "12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
            }}
            formatter={(value: number | string | undefined) => [
              `R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            ]}
          />

          {/* 🔥 COLUNAS MAIS LARGAS E COM IMPACTO */}
          <Bar
            name="Faturamento Bruto"
            dataKey="faturamento"
            fill="url(#gradFaturamento)"
            radius={[8, 8, 0, 0]}
            barSize={36} // 🔥 Mudei de maxBarSize para barSize fixo
          />
          <Bar
            name="Encargos / Folha"
            dataKey="massaSalarial"
            fill="url(#gradEncargos)"
            radius={[8, 8, 0, 0]}
            barSize={36} // 🔥 Mudei de maxBarSize para barSize fixo
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
