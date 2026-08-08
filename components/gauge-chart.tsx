"use client";

import React from "react";

interface GaugeChartProps {
  /** 
   * Aceita tanto porcentagem inteira (ex: 24.6) quanto fração decimal (ex: 0.246).
   */
  value: number;
  target?: number; // Padrão: 28%
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // Trata a conversão de decimal (ex: 0.246) para porcentagem (24.6) se necessário
  const displayValue = value > 0 && value <= 1 ? value * 100 : value;
  
  // Garante que o valor fique no intervalo [0, 100]
  const normalizedValue = Math.min(Math.max(displayValue, 0), 100);
  const isAnexoIII = normalizedValue >= target;

  // Parâmetros de dimensão do velocímetro
  const size = 220;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const circumference = 2 * Math.PI * radius;

  // Arco total de 240 graus (das 8h às 4h / -210° a 30°)
  const angleRange = 240;
  const startAngle = -210;

  // Comprimento total da linha do arco
  const totalDash = (circumference * angleRange) / 360;

  // Divisão dos arcos: Vermelho (0 a 28%) e Verde (28% a 100%)
  const redDash = (totalDash * target) / 100;
  const greenDash = totalDash - redDash;

  // Ângulo exato do ponteiro para a porcentagem normalizada
  const pointerAngle = startAngle + (normalizedValue / 100) * angleRange;

  // Posição exata do pin/marcador do target (28%)
  const targetAngle = startAngle + (target / 100) * angleRange;
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetX = center + radius * Math.cos(targetRad);
  const targetY = center + radius * Math.sin(targetRad);

  // Status/Cores da Badge Inferior
  const badgeBg = isAnexoIII ? "bg-emerald-100" : "bg-amber-100";
  const badgeText = isAnexoIII ? "text-emerald-800" : "text-amber-800";
  const badgeBorder = isAnexoIII ? "border-emerald-300" : "border-amber-300";
  const statusLabel = isAnexoIII
    ? "ZONA DE ENQUADRAMENTO — ANEXO III"
    : "ZONA DE ATENÇÃO — ANEXO V";

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
      {/* Cabeçalho */}
      <div className="w-full text-left mb-2">
        <h3 className="text-base font-semibold text-gray-900">
          Velocímetro do Fator R
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          Escala de 0% a 100% — limite de enquadramento em {target}%
        </p>
      </div>

      {/* Área do Velocímetro */}
      <div
        className="relative flex items-center justify-center my-4"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="overflow-visible">
          {/* 1. Zona Verde (28% até 100%) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${greenDash} ${circumference}`}
            strokeDashoffset={-redDash}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />

          {/* 2. Zona Vermelha (0% até 28%) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeDasharray={`${redDash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />
        </svg>

        {/* 3. Marcador Fixo dos 28% */}
        <div
          className="absolute z-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: targetX, top: targetY }}
        >
          <span className="absolute -top-6 text-[10px] font-bold text-red-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-red-200">
            {target}%
          </span>
          <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
        </div>

        {/* 4. PONTEIRO / AGULHA */}
        <div
          className="absolute z-20 pointer-events-none transition-transform duration-500 ease-out flex items-center justify-start"
          style={{
            width: radius,
            height: "4px",
            left: center,
            top: center - 2,
            transformOrigin: "0% 50%",
            transform: `rotate(${pointerAngle}deg)`,
          }}
        >
          {/* Corpo do Ponteiro */}
          <div className="w-full h-full bg-slate-900 rounded-r-full relative">
            {/* Cabeça/Ponta do Ponteiro */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-900 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>

        {/* 5. Miolo Central com o Valor Corrigido */}
        <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-slate-800 flex flex-col items-center justify-center text-white shadow-lg z-30">
          <span className="text-2xl font-extrabold tracking-tight">
            {normalizedValue.toFixed(2).replace(".", ",")}%
          </span>
          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-300 mt-0.5">
            Fator R
          </span>
        </div>
      </div>

      {/* Badge Inferior */}
      <div className="w-full flex justify-center mt-2">
        <span
          className={`text-[11px] font-bold px-4 py-1.5 rounded-full border ${badgeBg} ${badgeText} ${badgeBorder} tracking-wide text-center`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}
