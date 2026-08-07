"use client";

import React from "react";

interface GaugeChartProps {
  value: number;
  target?: number;
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // Define se atingiu a meta
  const isAnexoIII = value >= target;
  const strokeColor = isAnexoIII ? "#10B981" : "#F59E0B"; 
  const bgBadge = isAnexoIII 
    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
    : "bg-amber-100 text-amber-700 border-amber-200";

  // Configuração do Tamanho Fixo
  const size = 220; // Aumentei levemente para caber o ponteiro
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  
  // Cálculo do progresso da barra
  const percentOfTarget = Math.min((value / target) * 100, 100);
  const strokeDashoffset = circumference - (percentOfTarget / 100) * circumference;

  // Cálculo do ângulo do ponteiro (de 0 a 360 graus baseado no target)
  const angle = (percentOfTarget / 100) * 360;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-transparent">
      
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        
        {/* Desenho do Gráfico */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Arco de Fundo */}
          <circle
            className="text-slate-700/50"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx="50%"
            cy="50%"
          />
          {/* Barra Colorida */}
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

        {/* O PONTEIRO (Linha branca que sai do centro) */}
        <div 
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* A linha do ponteiro */}
          <div className="w-1 h-20 bg-white rounded-full shadow-lg -translate-y-5" />
          {/* Ponto central do ponteiro */}
          <div className="absolute w-3 h-3 bg-white rounded-full shadow-md" />
        </div>

        {/* Círculo Central Escuro */}
        <div className="absolute w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-700/50 flex flex-col items-center justify-center text-white shadow-xl z-10">
          <span className="text-2xl font-bold tracking-tight leading-none">
            {/* AQUI ESTÁ A CORREÇÃO: Usei Math.round para arredondar para número inteiro */}
            {Math.round(value)}%
          </span>
          <span className="text-[10px] font-medium text-slate-400 mt-1">
            Fator R
          </span>
        </div>

        {/* Marcador do Alvo (28%) */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
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
