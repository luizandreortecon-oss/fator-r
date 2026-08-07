"use client"

import { useState } from "react"
import { type MonthlyRecord, formatBRL } from "@/lib/fator-r-data"

type MonthlyBarChartProps = {
  data: MonthlyRecord[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const [active, setActive] = useState<number | null>(null)

  const max = Math.max(...data.map((d) => Math.max(d.faturamento, d.folha)))

  return (
    <div className="w-full">
      {/* Legenda */}
      <div className="mb-4 flex items-center gap-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[var(--chart-1)]" aria-hidden />
          <span className="text-muted-foreground">Faturamento Bruto</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-[var(--chart-2)]" aria-hidden />
          <span className="text-muted-foreground">Encargos / Folha</span>
        </div>
      </div>

      <div className="relative">
        <div className="flex h-56 items-end gap-2 sm:gap-3">
          {data.map((d, i) => {
            const fatH = (d.faturamento / max) * 100
            const folhaH = (d.folha / max) * 100
            const isActive = active === i
            return (
              <div
                key={d.month}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                aria-label={`${d.month}: faturamento ${formatBRL(d.faturamento)}, folha ${formatBRL(d.folha)}`}
              >
                {/* Tooltip */}
                {isActive && (
                  <div className="absolute bottom-full z-10 mb-2 w-40 -translate-y-1 rounded-lg border border-border bg-popover p-3 text-left shadow-lg">
                    <p className="mb-2 text-xs font-semibold text-popover-foreground">{d.month}</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-[var(--chart-1)]" aria-hidden />
                          Faturamento
                        </span>
                        <span className="font-mono font-medium text-popover-foreground">
                          {formatBRL(d.faturamento)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-[var(--chart-2)]" aria-hidden />
                          Folha
                        </span>
                        <span className="font-mono font-medium text-popover-foreground">
                          {formatBRL(d.folha)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className="w-full max-w-3.5 rounded-t bg-[var(--chart-1)] transition-opacity"
                    style={{ height: `${fatH}%`, opacity: active === null || isActive ? 1 : 0.4 }}
                  />
                  <div
                    className="w-full max-w-3.5 rounded-t bg-[var(--chart-2)] transition-opacity"
                    style={{ height: `${folhaH}%`, opacity: active === null || isActive ? 1 : 0.4 }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Rótulos de mês */}
        <div className="mt-2 flex gap-2 sm:gap-3">
          {data.map((d) => (
            <span
              key={d.month}
              className="flex-1 text-center text-[10px] font-medium text-muted-foreground sm:text-xs"
            >
              {d.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
