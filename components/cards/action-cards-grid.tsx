'use client';

import React from 'react';
import { TimeWindow } from '@/creator-timing/creator-timing.engine';
import { Sparkles, ArrowRight, PenTool, Share2, DollarSign, MessageCircle, Flame } from 'lucide-react';

interface ActionCardsGridProps {
  windows: TimeWindow[];
  onSelectWindow: (w: TimeWindow) => void;
}

export const ActionCardsGrid: React.FC<ActionCardsGridProps> = ({
  windows,
  onSelectWindow,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'create':
        return <PenTool className="w-5 h-5 text-[#8fa8d6]" />;
      case 'publish':
        return <Share2 className="w-5 h-5 text-[#c2a878]" />;
      case 'sell':
        return <DollarSign className="w-5 h-5 text-[#d99879]" />;
      case 'engage':
        return <MessageCircle className="w-5 h-5 text-[#76b896]" />;
      case 'experiment':
        return <Flame className="w-5 h-5 text-[#ba8ed4]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#c2a878]" />;
    }
  };

  // Pick best distinct window per category so cards don't show duplicates
  const displayedWindows = React.useMemo(() => {
    const seenCategories = new Set<string>();
    const uniqueWindows: TimeWindow[] = [];

    // Prioritize highest score window per category
    const sorted = [...windows].sort((a, b) => b.score - a.score);
    for (const w of sorted) {
      if (!seenCategories.has(w.category)) {
        seenCategories.add(w.category);
        uniqueWindows.push(w);
      }
    }

    // Sort by chronological start time for intuitive day planning
    return uniqueWindows.sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 4);
  }, [windows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#dedad2]">
          🎯 Qué Hacer Hoy · Ventanas Dedicadas
        </h3>
        <span className="text-xs text-[#8a929e]">
          Cada ventana tiene su propia justificación astrológica
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedWindows.map((w) => (
          <div
            key={w.id}
            onClick={() => onSelectWindow(w)}
            className="group cursor-pointer bg-[#111317] hover:bg-[#151921] border border-[#232a35] hover:border-[#3a4556] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-[#171b21] border border-[#232a35]">
                  {getCategoryIcon(w.category)}
                </div>
                <span className="text-xs font-bold technical-mono text-[#c2a878]">
                  {w.score} pts
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a929e]">
                  {w.categoryNameEs}
                </h4>
                <div className="text-xl font-bold text-[#f2efe9] technical-mono mt-0.5">
                  {w.startTime} — {w.endTime}
                </div>
              </div>

              <p className="text-xs text-[#dedad2] leading-relaxed line-clamp-2">
                {w.actionRecommendation}
              </p>
            </div>

            <div className="pt-4 mt-2 border-t border-[#1c2129] flex items-center justify-between text-xs text-[#8a929e] group-hover:text-[#c2a878] transition-colors">
              <span>Ver aspecto</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
