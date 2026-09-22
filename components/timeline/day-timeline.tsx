'use client';

import React from 'react';
import { TimeWindow } from '@/creator-timing/creator-timing.engine';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface DayTimelineProps {
  windows: TimeWindow[];
  onSelectWindow: (w: TimeWindow) => void;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ windows, onSelectWindow }) => {
  // Hours from 00:00 to 24:00 (full 24-hour range)
  const startHour = 0;
  const endHour = 24;
  const totalHours = 24;

  const getPositionPercent = (timeStr: string) => {
    let [h, m] = timeStr.split(':').map(Number);
    // If midnight at end of day, treat as 24:00
    if (h === 0 && m === 0 && timeStr !== '00:00') {
      h = 24;
    }
    const decimal = h + (m || 0) / 60;
    const clamped = Math.max(startHour, Math.min(endHour, decimal));
    return ((clamped - startHour) / totalHours) * 100;
  };

  const categoryColor: Record<string, string> = {
    publish: '#c2a878',
    create: '#8fa8d6',
    engage: '#76b896',
    sell: '#d99879',
    experiment: '#ba8ed4',
  };

  return (
    <div className="w-full bg-[#111317] border border-[#232a35] rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#dedad2]">
            Línea Temporal Intradía (24h)
          </h3>
          <p className="text-xs text-[#8a929e] mt-0.5">
            Ventanas calculadas con resolución lunar cada 15 minutos.
          </p>
        </div>
        <span className="text-xs technical-mono text-[#c2a878]">
          {windows.length} ventanas activas
        </span>
      </div>

      {/* Axis Hours Header */}
      <div className="relative w-full h-6 border-b border-[#232a35] text-[10px] technical-mono text-[#8a929e]">
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((hr) => {
          const leftPct = (hr / 24) * 100;
          return (
            <div
              key={hr}
              className="absolute -translate-x-1/2"
              style={{ left: `${leftPct}%` }}
            >
              {hr === 24 ? '24:00' : `${hr.toString().padStart(2, '0')}:00`}
            </div>
          );
        })}
      </div>

      {/* Timeline Bars Track */}
      <div className="space-y-4 pt-2">
        {windows.map((w) => {
          const left = getPositionPercent(w.startTime);
          const right = getPositionPercent(w.endTime);
          const width = Math.max(right - left, 6); // at least 6% visible width
          const color = categoryColor[w.category] || '#c2a878';

          return (
            <div key={w.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#f2efe9] flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {w.categoryNameEs}
                </span>
                <span className="technical-mono text-[#8a929e]">
                  {w.startTime} — {w.endTime}
                </span>
              </div>

              <div
                onClick={() => onSelectWindow(w)}
                className="relative h-9 w-full bg-[#171b21] rounded-lg border border-[#232a35] cursor-pointer hover:border-[#3a4556] transition-all group overflow-hidden"
              >
                {/* Visual Aspect Bar */}
                <div
                  className="absolute top-1 bottom-1 rounded-md transition-all flex items-center justify-between px-3 shadow-md group-hover:brightness-110"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    backgroundColor: `${color}25`,
                    borderColor: color,
                    borderWidth: '1px',
                  }}
                >
                  <span
                    className="text-[10px] font-bold technical-mono uppercase truncate"
                    style={{ color }}
                  >
                    {w.startTime}
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[10px] font-bold technical-mono"
                      style={{ color }}
                    >
                      ▲ EXACTO
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
