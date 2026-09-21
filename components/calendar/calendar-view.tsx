'use client';

import React, { useState, useEffect } from 'react';
import { NatalChartData } from '@/astronomy/types';
import { Calendar as CalendarIcon, ChevronRight, Info } from 'lucide-react';

interface CalendarViewProps {
  chart: NatalChartData;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ chart }) => {
  const [selectedRange, setSelectedRange] = useState<number>(7);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      try {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chart,
            days: selectedRange,
            nicheKey: chart.input.creatorNiche,
          }),
        });
        const data = await res.json();
        if (data.days) {
          setCalendarDays(data.days);
        }
      } catch (err) {
        console.error('Error fetching calendar:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCalendar();
  }, [chart, selectedRange]);

  const ranges = [
    { label: 'Hoy', days: 1 },
    { label: '3 días', days: 3 },
    { label: '7 días', days: 7 },
    { label: '14 días', days: 14 },
    { label: '30 días', days: 30 },
  ];

  return (
    <div className="w-full bg-[#111317] border border-[#232a35] rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#dedad2] flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#c2a878]" />
            Proyección Temporal & Ventanas Clave
          </h3>
          <p className="text-xs text-[#8a929e] mt-0.5">
            Línea temporal de aspectos aplicando, exactos y separando.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center gap-1 bg-[#171b21] p-1 rounded-xl border border-[#232a35]">
          {ranges.map((r) => (
            <button
              key={r.days}
              onClick={() => setSelectedRange(r.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRange === r.days
                  ? 'bg-[#c2a878] text-[#090a0c]'
                  : 'text-[#8a929e] hover:text-[#dedad2]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[#8a929e] technical-mono">
          Calculando efemérides y tránsitos astronómicos...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              className="bg-[#171b21] border border-[#232a35] rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#3a4556] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold technical-mono text-[#dedad2]">
                  {day.weekday}
                </span>
                <span className="text-[11px] technical-mono text-[#c2a878]">
                  {day.generalScore} pts
                </span>
              </div>

              {day.bestWindow ? (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#f2efe9] technical-mono">
                    {day.bestWindow.startTime}–{day.bestWindow.endTime}
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[#8a929e]">
                    {day.bestWindow.categoryNameEs}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#8a929e]">Sin pico exacto</div>
              )}

              {/* Progress mini indicator */}
              <div className="w-full bg-[#232a35] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#c2a878] h-full"
                  style={{ width: `${day.generalScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip disclaimer as requested */}
      <div className="flex items-center gap-2 text-[11px] text-[#8a929e] pt-2 border-t border-[#1c2129]">
        <Info className="w-3.5 h-3.5 text-[#c2a878]" />
        <span>Indicador relativo basado en tus tránsitos natales y las reglas auditables de Creator Timing.</span>
      </div>
    </div>
  );
};
