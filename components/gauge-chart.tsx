"use client";

import React from "react";

interface GaugeChartProps {
  value: number;      // O valor atual (ex: 24.6)
  target?: number;    // O limite da zona vermelha (ex: 28)
  maxValue?: number;  // O valor máximo do gráfico (ex: 100)
}

export function GaugeChart({ 
  value, 
  target = 28, 
  maxValue = 100 
}: GaugeChartProps) {

  // Lógica para desenhar o gráfico
  // 1. Calcula as porcentagens para desenhar os arcos
  const redPercentage = (target / maxValue) * 100;
  const currentPercentage = Math.min((value / maxValue) * 100, 100);

  // 2. Configurações do SVG (meio círculo, tamanho fixo)
  const radius = 80;
  const strokeWidth = 20;
  const circumference = Math.PI * radius;
  
  // 3. O ângulo do ponteiro (vai de -90 graus a 90 graus)
  const angle = -90 + (currentPercentage / 100) * 180;

  return (
    <div className="flex flex-col items-center justify-center w-full bg-slate-900 p-6 rounded-2xl text-white relative">
      
      <h3 className="text-lg font-bold mb-2 text-slate-300">MEDIDOR DE FATOR R</h3>
      
      {/* SVG onde o gráfico é desenhado */}
      <svg viewBox="0 0 220 130" className="w-full max-w-[300px] h-auto">
        {/* 1. Arco de Fundo (Cinza escuro) */}
        <path
          d="M 20 110 A 80 80 0 0 1 200 110"
          fill="none"
          stroke="#334155" // Cinza escuro
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* 2. Arco Vermelho (0% até 28%) */}
        <path
          d="M 20 110 A 80 80 0 0 1 200 110"
          fill="none"
          stroke="#EF4444" // Vermelho
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (redPercentage / 100) * circumference}
          strokeLinecap="round"
        />

        {/* 3. Arco Verde (Só aparece se o valor ultrapassar 28%) */}
        {currentPercentage > redPercentage && (
          <path
            d="M 20 110 A 80 80 0 0 1 200 110"
            fill="none"
            stroke="#10B981" // Verde
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - ((currentPercentage - redPercentage) / 100) * circumference}
            strokeLinecap="round"
            // O verde começa exatamente onde o vermelho termina
            style={{ transform: `rotate(${(redPercentage / 100) * 180}deg)`, transformOrigin: "110px 110px" }}
          />
        )}

        {/* 4. O Ponteiro */}
        <line
          x1="110"
          y1="110"
          x2="110"
          y2="40"
          stroke="#F8FAFC"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transform: `rotate(${angle}deg)`, transformOrigin: "110px 110px" }}
        />

        {/* 5. Marcadores de texto "0%" e "28%" */}
        <text x="15" y="120" fill="#EF4444" fontSize="12" fontWeight="bold">0%</text>
        <text x="40" y="15" fill="#EF4444" fontSize="12" fontWeight="bold">{target}%</text>
        <text x="185" y="120" fill="#10B981" fontSize="12" fontWeight="bold">100%</text>
      </svg>

      {/* Valor e Status */}
      <div className="mt-4 text-center">
        <div className="text-3xl font-bold">
          {value.toFixed(2)}%
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Fator R Atual
        </p>

        {/* Badge indicando se está na zona vermelha ou verde */}
        <div className="mt-3">
          {value < target ? (
            <span className="px-3 py-1 text-xs font-bold text-red-500 bg-red-500/20 border border-red-500/50 rounded-full">
              ZONA VERMELHA (Anexo V)
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-bold text-emerald-500 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
              ZONA VERDE (Anexo III)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
