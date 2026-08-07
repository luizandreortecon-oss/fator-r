"use client";

import React from "react";

interface GaugeChartProps {
  value: number;
  target?: number;
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // Define as cores dinâmicas baseadas no valor
  const isAnexoIII = value >= target;
  const strokeColor = isAnexoIII ? "#10B981" : "#F59E0B"; // Verde ou Amarelo/Laranja
  const textColor = isAnexoIII ? "text-emerald-600" : "text-amber-600";
  const bgColor = isAnexoIII ? "bg-emerald-50" : "bg-amber-50";

  // Cálculo do círculo (A circunferência total é 100)
  const circumference = 100;
  // Quanto da barra vai ser preenchida (o valor atual)
  const strokeDashoffset = circumference - (value / target) * 100;
  // Limita para não passar de 100 ou ficar negativo
  const clampedOffset = Math.max(0, Math.min(strokeDashoffset, circumference));

  return (
    <div className={`flex flex-col items-center justify-center w-full p-6 rounded-2xl ${bgColor} border border-slate-200`}>
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Círculo de Fundo (Cinza clarinho) */}
        <svg className="w-full h-full -rotate-90">
          <circle
            className="text-slate-200"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          {/* Barra Colorida (Acompanha o valor) */}
          <circle
            className={`${isAnexoIII ? "text-emerald-500" : "text-amber-500"} transition-all duration-700 ease-out`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={clampedOffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
        </svg>

        {/* Círculo Central Escuro (Onde fica o número) */}
        <div className="absolute w-28 h-28 bg-slate-700 rounded-full flex flex-col items-center justify-center text-white shadow-lg">
          <span className="text-2xl font-bold tracking-tight">
            {value.toFixed(1)}%
          </span>
          <span className="text-[10px] font-medium text-slate-300 -mt-0.5">
            Fator R
          </span>
        </div>

        {/* Marcador Vermelho (28%) no topo */}
        <div className="absolute -top-4 right-1/2 translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-5 bg-red-500 rounded-full" />
          <span className="text-[10px] font-bold text-red-500 mt-0.5">28%</span>
        </div>
      </div>

      {/* Etiqueta de Status */}
      <div className="mt-4">
        {isAnexoIII ? (
          <span className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full">
            Anexo III — Alíquota Reduzida
          </span>
        ) : (
          <span className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 rounded-full">
            Zona de Atenção — Anexo V
          </span>
        )}
      </div>
    </div>
  );
}
