"use client";

import React from "react";

interface GaugeChartProps {
  value: number;
  target?: number;
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // Calcula a porcentagem de preenchimento baseada no alvo (28)
  const percentOfTarget = Math.min((value / target) * 100, 100);
  
  // Define as cores
  const isAnexoIII = value >= target;
  const strokeColor = isAnexoIII ? "#10B981" : "#F59E0B"; // Verde ou Laranja
  const bgBadge = isAnexoIII ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200";

  // Configuração do Círculo (Tamanhos fixos para não deformar)
  const size = 180;
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  
  // Cálculo do offset para desenhar a barra
  const strokeDashoffset = circumference - (percentOfTarget / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-transparent">
      
      {/* Container do Gráfico com tamanho fixo */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        
        {/* Desenho do Círculo via SVG */}
        <svg className="w-full h-full transform -rotate-90">
          {/* 1. Arco de Fundo (Cinza transparente para ver o fundo) */}
          <circle
            className="text-slate-700/50"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="50%"
            cy="50%"
          />
          {/* 2. Barra Colorida (Acompanha o valor) */}
          <circle
            className={`${isAnexoIII ? "text-emerald-500" : "text-amber-500"} transition-all duration-700 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="50%"
            cy="50%"
          />
        </svg>

        {/* 3. Círculo Central Escuro */}
        <div className="absolute w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-700/50 flex flex-col items-center justify-center text-white shadow-xl">
          <span className="text-2xl font-bold tracking-tight leading-none">
            {value.toFixed(1)}%
          </span>
          <span className="text-[10px] font-medium text-slate-400 mt-1">
            Fator R
          </span>
        </div>

        {/* 4. Marcador do Alvo (28%) */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-6 bg-red-500 rounded-full shadow-sm" />
          <span className="text-[10px] font-bold text-red-500 mt-0.5 bg-slate-900 px-1 rounded">28%</span>
        </div>
      </div>

      {/* Textos e Badge */}
      <div className="mt-4 text-center w-full">
        <p className="text-xs font-medium text-slate-400 mb-2">
          Escala de 0% a 100% — limite de enquadramento em {target}%
        </p>
        <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-full border ${bgBadge}`}>
          {isAnexoIII ? "Anexo III — Alíquota Reduzida" : "Zona de Atenção — Anexo V"}
        </span>
      </div>
    </div>
  );
}
