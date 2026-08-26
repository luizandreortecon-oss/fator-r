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
  Legend,
} from "recharts"

export interface MonthlyDataItem {
  month?: string
  mes?: string
  periodo_apuracao?: string
  periodo?: string
  faturamento?: number
  receita?: number
  massaSalarial?: number
  massa_salarial?: number
  encargos?: number
  folha?: number
  folhaPagamento?: number
  [key: string]: unknown
}

interface MonthlyBarChartProps {
  data: MonthlyDataItem[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-[340px] w-full rounded-xl bg-slate-100 animate-pulse" />
  }

  // Mapeia os dados aceitando chaves em camelCase e snake_case vindas do backend
  const chartData = data?.map((item) => ({
    ...item,
    monthKey: item.month || item.mes || item.periodo_apuracao || item.periodo || "",
    faturamentoKey: Number(item.faturamento ?? item.receita ?? 0),
    encargosKey: Number(item.massaSalarial ?? item.massa_salarial ?? item.encargos ?? item.folha ?? item.folhaPagamento ?? 0),
  }))

  return (
    <div className="h-[350px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={6}
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
            dataKey="monthKey"
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

          <Legend
            verticalAlign="top"
            align="left"
            wrapperStyle={{ paddingBottom: "15px", fontSize: "13px" }}
          />

          <Bar
            name="Faturamento Bruto"
            dataKey="faturamentoKey"
            fill="url(#gradFaturamento)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            name="Encargos / Folha"
            dataKey="encargosKey"
            fill="url(#gradEncargos)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
