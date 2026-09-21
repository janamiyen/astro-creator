'use client';

import React from 'react';
import { TimeWindow } from '@/creator-timing/creator-timing.engine';
import { X, ShieldCheck, Compass, Info, Sparkles } from 'lucide-react';

interface WhyNowModalProps {
  window: TimeWindow | null;
  onClose: () => void;
}

export const WhyNowModal: React.FC<WhyNowModalProps> = ({ window, onClose }) => {
  if (!window) return null;

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (typeof globalThis.window !== 'undefined') {
      globalThis.window.addEventListener('keydown', handleKeyDown);
      return () => globalThis.window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#111317] border border-[#2a3442] rounded-2xl p-6 lg:p-8 shadow-2xl space-y-6 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232a35] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#c2a878] font-bold">
                Auditoría Astrológica
              </span>
              <span className="text-xs text-[#8a929e]">·</span>
              <span className="text-xs text-[#dedad2] technical-mono">
                {window.startTime} — {window.endTime}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#f2efe9]">
              ¿Por qué ahora? · {window.categoryNameEs}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#171b21] hover:bg-[#232a35] text-[#8a929e] hover:text-[#f2efe9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Astronomical Evidence */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-[#8a929e] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#c2a878]" />
            Aspectos y Tránsitos Reales Detectados
          </h4>
          <div className="space-y-2">
            {window.whyNow.transitsList.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#171b21] border border-[#232a35] text-xs text-[#dedad2] leading-relaxed flex items-start gap-2.5"
              >
                <span className="text-[#c2a878] font-bold mt-0.5">✦</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Favorable Themes */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-[#8a929e]">
            Simbólicamente Favorece
          </h4>
          <div className="flex flex-wrap gap-2">
            {window.whyNow.favorableFor.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#1c2129] border border-[#2d3748] text-[#c2a878]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Creator Recommendation */}
        <div className="p-4 rounded-xl bg-[#141820] border border-[#232a35] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#c2a878] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Acción Práctica Recomendada
          </div>
          <p className="text-sm text-[#f2efe9] font-medium leading-relaxed">
            {window.actionRecommendation}
          </p>
          {window.exampleIdeas && window.exampleIdeas.length > 0 && (
            <div className="pt-2 text-xs text-[#8a929e] space-y-1">
              <span className="font-semibold text-[#dedad2]">Ideas sugeridas:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[#8a929e]">
                {window.exampleIdeas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Close button at bottom */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#171b21] hover:bg-[#232a35] border border-[#2a3442] text-xs uppercase tracking-wider font-bold text-[#f2efe9] transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
