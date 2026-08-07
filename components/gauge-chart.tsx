"use client";

import React from "react";

interface GaugeChartProps {
  value: number; // Exemplo: 24.6 (para 24.60%)
  target?: number; // Padrão: 28 (Limite de enquadramento do Fator R)
}

export function GaugeChart({ value, target = 28 }: GaugeChartProps) {
  // Limita o valor entre 0 e 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Anexo III se o Fator R for >= 28%, caso contrário Anexo V
  const isAnexoIII = value >= target;

  // Cores dinâmicas
  // Verde (Emerald) para Anexo III (>= 28%), Laranja/Amarelo (Amber) para Anexo V (< 28%)
  const primaryColor = isAnexoIII ? "#10B981" : "#F59E0B";
  const badgeBg = isAnexoIII ? "bg-emerald-100" : "bg-amber-100";
  const badgeText = isAnexoIII ? "text-emerald-800" : "text-amber-800";
  const badgeBorder = isAnexoIII ? "border-emerald-300" : "border-amber-300";
  const statusLabel = isAnexoIII ? "ZONA DE ENQUADRAMENTO — ANEXO III" : "ZONA DE ATENÇÃO — ANEXO V";

  // Configurações do arco do gráfico SVG
  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // O arco cobre 240 graus (das 8h às 4h no relógio)
  const angleRange = 240; 
  const dashArray = (circumference * angleRange) / 360;
  const dashOffset = dashArray - (dashArray * normalizedValue) / 100;

  // Posição do marcador/pin em 28%
  const targetAngle = -210 + (28 / 100) * angleRange;
  const targetRad = (targetAngle * Math.PI) / 180;
  const targetX = center + radius * Math.cos(targetRad);
  const targetY = center + radius * Math.sin(targetRad);

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
      {/* Cabeçalho */}
      <div className="w-full text-left mb-2">
        <h3 className="text-base font-semibold text-gray-900">Velocímetro do Fator R</h3>
        <p className="text-xs text-gray-400 font-medium">
          Escala de 0% a 100% — limite de enquadramento em {target}%
        </p>
      </div>

      {/* Gráfico do Velocímetro */}
      <div className="relative flex items-center justify-center my-4" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform rotate-[150deg]"
        >
          {/* Trilha/Fundo cinza do arco */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashArray} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Preenchimento colorido do arco */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashArray} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Indicador do Limite (28%) */}
        <div
          className="absolute z-10 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: targetX, top: targetY }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-6 text-[11px] font-bold text-red-500 bg-white px-1 py-0.5 rounded shadow-sm border border-red-100">
              {target}%
            </span>
            <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
          </div>
        </div>

        {/* Círculo Central com o Valor */}
        <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-slate-800 flex flex-col items-center justify-center text-white shadow-lg">
          <span className="text-2xl font-extrabold tracking-tight">
            {value.toFixed(2).replace(".", ",")}%
          </span>
          <span className="text-[10px] uppercase font-medium tracking-wider text-slate-300 mt-0.5">
            Fator R
          </span>
        </div>
      </div>

      {/* Badge Inferior de Status */}
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
