"use client";

import React from "react";

interface GaugeChartProps {
  value: number; // Ex: 0.25 ou 24.60 ou 30.00
  target?: number; // Padrão: 28%
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const isAnexoIII = value >= target;

  // Parâmetros do SVG do Velocímetro
  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Arco de 240 graus (das 8h às 4h no relógio)
  const angleRange = 240;
  const startAngle = 150; // Início do arco em graus
  const totalDash = (circumference * angleRange) / 360;

  // Cálculo da faixa vermelha fixa (0% a 28%)
  const redDash = (totalDash * target) / 100;

  // Cálculo da rotação do ponteiro de indicação de valor
  const currentAngle = startAngle + (normalizedValue / 100) * angleRange;

  // Posição da marcaição dos 28%
  const targetAngle = startAngle + (target / 100) * angleRange;
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetX = center + radius * Math.cos(targetRad);
  const targetY = center + radius * Math.sin(targetRad);

  // Status/Cores
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
          {/* 1. Trilha Cinza (28% até 100% - Zona Verde/Segura) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalDash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />

          {/* 2. Faixa Vermelha FIXA (0% a 28%) */}
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

        {/* 3. Marcador Fixo de 28% */}
        <div
          className="absolute z-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: targetX, top: targetY }}
        >
          <span className="absolute -top-6 text-[10px] font-bold text-red-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-red-200">
            {target}%
          </span>
          <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
        </div>

        {/* 4. PONTEIRO (Aponta exatamente para o valor atual) */}
        <div
          className="absolute inset-0 z-20 pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${currentAngle}deg)` }}
        >
          {/* Linha do Ponteiro que parte do centro até a borda */}
          <div
            className="absolute top-1/2 left-1/2 -translate-y-1/2 bg-slate-900 rounded-full shadow-md"
            style={{
              width: radius + strokeWidth / 2,
              height: "4px",
              transformOrigin: "left center",
            }}
          >
            {/* Cabeça do Ponteiro */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>

        {/* 5. Círculo Central com o Display */}
        <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-slate-800 flex flex-col items-center justify-center text-white shadow-lg z-30">
          <span className="text-2xl font-extrabold tracking-tight">
            {value.toFixed(2).replace(".", ",")}%
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
