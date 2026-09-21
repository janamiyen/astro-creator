'use client';

import React from 'react';
import { TimeWindow } from '@/creator-timing/creator-timing.engine';
import { Sparkles, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

interface BestWindowHeroProps {
  window: TimeWindow | null;
  onOpenWhyNow: (w: TimeWindow) => void;
}

export const BestWindowHero: React.FC<BestWindowHeroProps> = ({
  window,
  onOpenWhyNow,
}) => {
  if (!window) {
    return (
      <div className="w-full bg-[#111317] border border-[#232a35] rounded-2xl p-8 text-center text-[#8a929e]">
        No se encontraron ventanas con aspectos mayores para hoy.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden w-full bg-gradient-to-br from-[#13171e] via-[#0e1014] to-[#090a0c] border border-[#2a3442] rounded-2xl p-6 lg:p-8 shadow-2xl">
      {/* Subtle top golden accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c2a878] to-transparent opacity-80" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#c2a878]/15 text-[#c2a878] border border-[#c2a878]/30">
              <Sparkles className="w-3.5 h-3.5" />
              ⭐ Mejor Ventana del Día
            </span>
            <span className="text-xs text-[#8a929e] technical-mono uppercase">
              Intensidad: <span className="text-[#f2efe9]">{window.intensityLevel}</span>
            </span>
          </div>

          <div className="flex items-baseline gap-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#f2efe9] technical-mono">
              {window.startTime} — {window.endTime}
            </h2>
            <span className="px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider bg-[#171b21] border border-[#232a35] text-[#c2a878]">
              {window.categoryNameEs}
            </span>
          </div>

          <p className="text-base text-[#dedad2] max-w-2xl leading-relaxed">
            {window.actionRecommendation}
          </p>

          {/* Favorable tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-[#8a929e] mr-1">Favorece:</span>
            {window.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-full text-xs bg-[#171b21] border border-[#232a35] text-[#dedad2]"
              >
                · {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button & Evidence badge */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4">
          <div className="text-left md:text-right">
            <div className="text-xs text-[#8a929e] uppercase tracking-wider mb-1">
              Aspecto Clave
            </div>
            <div className="text-sm font-semibold text-[#f2efe9]">
              {window.primaryAspect}
            </div>
            <div className="text-xs text-[#c2a878] technical-mono">
              Orbe: {window.exactOrb}
            </div>
          </div>

          <button
            onClick={() => onOpenWhyNow(window)}
            className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-[#c2a878] hover:bg-[#d8be8d] text-[#090a0c] font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-[#c2a878]/20"
          >
            <span>Ver por qué</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
