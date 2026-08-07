"use client";

import React from "react";

interface GaugeChartProps {
  value: number;
  target?: number;
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // Ajuste de leitura: se for decimal (ex: 0.246), vira 24.6%
  const percentValue = value <= 1 ? value * 100 : value;
  const clampedValue = Math.min(Math.max(percentValue, 0), 100);
  const isAnexoIII = clampedValue >= target;

  // Ângulos da escala do relógio (-135° é o 0% e 135° é o 100%)
  const minAngle = -135;
  const maxAngle = 135;
  const currentAngle = minAngle + (clampedValue / 100) * (maxAngle - minAngle);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 bg-white rounded-xl">
      <div className="relative flex items-center justify-center w-64 h-48">
        
        {/* SVG do Velocímetro */}
        <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
          
          {/* 1. Arco Cinza de Fundo (100% da escala) */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth="14"
            strokeDasharray="330 110"
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* 2. Faixa VERMELHA Fixa (Zona Anexo V: 0% até 28%) */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="transparent"
            stroke="#EF4444"
            strokeWidth="14"
            strokeDasharray={`${0.28 * 330} 440`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* 3. Faixa VERDE Suave (Zona Anexo III: 28% até 100%) */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="transparent"
            stroke="#10B981"
            strokeWidth="14"
            strokeDasharray={`${0.72 * 330} 440`}
            strokeDashoffset={-0.28 * 330}
            opacity={0.3}
          />
        </svg>

        {/* Ponteiro / Agulha */}
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
          {percentValue.toFixed(2).replace(".", ",")}%
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
