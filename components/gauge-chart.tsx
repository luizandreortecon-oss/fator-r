"use client";

import React from "react";

interface GaugeChartProps {
  value: number;
  target?: number;
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // CORREÇÃO 1: Calcula a porcentagem baseada na meta (0 a 28)
  const percentValue = (value / target) * 100;
  const clampedValue = Math.min(Math.max(percentValue, 0), 100);
  const isAnexoIII = clampedValue >= 100; // Se atingir 100% da meta (28), passa para o Anexo III

  const minAngle = -135;
  const maxAngle = 135;
  const currentAngle = minAngle + (clampedValue / 100) * (maxAngle - minAngle);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 bg-white rounded-xl">
      <div className="relative flex items-center justify-center w-64 h-48">
        {/* Trilho de Fundo */}
        <div 
          className="absolute w-48 h-48 rounded-full border-[14px] border-slate-100"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 85%)",
            maskImage: "radial-gradient(circle, transparent 58%, black 60%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 60%)"
          }}
        />

        {/* Arco do Progresso */}
        <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="transparent"
            stroke={isAnexoIII ? "#10B981" : "#EF4444"}
            strokeWidth="14"
            strokeDasharray={440}
            // CORREÇÃO 2: A barra usa a meta (28) como 100%, em vez de usar 100
            strokeDashoffset={440 - (clampedValue / 100) * 330}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Ponteiro */}
        <div 
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${currentAngle}deg)` }}
        >
          <div className="w-1.5 h-20 bg-slate-800 rounded-full shadow-md -translate-y-6" />
        </div>

        {/* Ponto Central */}
        <div className="absolute w-5 h-5 bg-slate-900 rounded-full border-4 border-white shadow-sm mt-8" />

        <span className="absolute bottom-6 left-6 text-xs font-semibold text-slate-400">0%</span>
        <span className="absolute bottom-6 right-6 text-xs font-semibold text-slate-400">100%</span>
      </div>

      <div className="text-center -mt-2">
        <div className="text-3xl font-black text-slate-800 tracking-tight">
          {value.toFixed(2).replace(".", ",")}%
        </div>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          Meta Anexo III: <strong className="text-slate-700">{target}%</strong>
        </p>

        <div className="mt-3">
          {isAnexoIII ? (
            <span className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
              Anexo III — Alíquota Reduzida
            </span>
          ) : (
            <span className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-full shadow-sm">
              Zona de Atenção — Anexo V
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
