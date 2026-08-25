"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

interface MonthlyBarChartProps {
  data: any[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  return (
    <div className="h-[320px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={6}
        >
          {/* Linhas de grade horizontais sutis */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

          {/* Definições de Gradiente para efeito de profundidade */}
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
            dataKey="month" // Altere para 'mes' se essa for a chave no seu mock
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
            dy={8}
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
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
            formatter={(value: any) => [
              `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            ]}
          />

          {/* Colunas encorpadas com topo arredondado */}
          <Bar
            name="Faturamento Bruto"
            dataKey="faturamento"
            fill="url(#gradFaturamento)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            name="Encargos / Folha"
            dataKey="massaSalarial" // Altere se no seu objeto a chave for 'encargos' ou 'folha'
            fill="url(#gradEncargos)"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
