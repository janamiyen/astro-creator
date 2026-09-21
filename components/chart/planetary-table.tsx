'use client';

import React, { useState } from 'react';
import { NatalChartData } from '@/astronomy/types';
import { PLANET_SYMBOLS } from '@/astronomy/calculations/coordinates';
import { MAJOR_ASPECTS } from '@/astronomy/aspects/aspect-calculator';

interface PlanetaryTableProps {
  chart: NatalChartData;
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ chart }) => {
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'aspects'>('planets');

  return (
    <div className="w-full bg-[#111317] border border-[#232a35] rounded-xl overflow-hidden text-sm">
      {/* Tabs Header */}
      <div className="flex border-b border-[#232a35] bg-[#0d0f12]">
        <button
          onClick={() => setActiveTab('planets')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeTab === 'planets'
              ? 'text-[#c2a878] border-b-2 border-[#c2a878] bg-[#141820]'
              : 'text-[#8a929e] hover:text-[#dedad2]'
          }`}
        >
          Planetas Natales
        </button>
        <button
          onClick={() => setActiveTab('houses')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeTab === 'houses'
              ? 'text-[#c2a878] border-b-2 border-[#c2a878] bg-[#141820]'
              : 'text-[#8a929e] hover:text-[#dedad2]'
          }`}
        >
          Cúspides de Casas (Placidus)
        </button>
        <button
          onClick={() => setActiveTab('aspects')}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeTab === 'aspects'
              ? 'text-[#c2a878] border-b-2 border-[#c2a878] bg-[#141820]'
              : 'text-[#8a929e] hover:text-[#dedad2]'
          }`}
        >
          Matriz de Aspectos ({chart.aspects.length})
        </button>
      </div>

      {/* Planets Table */}
      {activeTab === 'planets' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232a35] text-[11px] uppercase tracking-wider text-[#8a929e] bg-[#141820]">
                <th className="py-3 px-4">Planeta</th>
                <th className="py-3 px-4">Signo & Grado</th>
                <th className="py-3 px-4">Casa</th>
                <th className="py-3 px-4">Velocidad</th>
                <th className="py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2129] technical-mono text-xs">
              {chart.planetList.map((p) => (
                <tr key={p.id} className="hover:bg-[#171b21] transition-colors">
                  <td className="py-3 px-4 font-sans flex items-center gap-2 text-[#f2efe9]">
                    <span className="text-[#c2a878] font-bold text-sm">
                      {PLANET_SYMBOLS[p.id]}
                    </span>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3 px-4 text-[#dedad2]">{p.formattedDegree}</td>
                  <td className="py-3 px-4 text-[#c2a878]">Casa {p.house}</td>
                  <td className="py-3 px-4 text-[#8a929e]">{p.speed.toFixed(3)}°/d</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        p.isRetrograde
                          ? 'bg-[#b56b59]/20 text-[#b56b59] border border-[#b56b59]/30'
                          : 'bg-[#509673]/20 text-[#509673] border border-[#509673]/30'
                      }`}
                    >
                      {p.isRetrograde ? 'Rx Retrógrado' : 'Directo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Houses Table */}
      {activeTab === 'houses' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232a35] text-[11px] uppercase tracking-wider text-[#8a929e] bg-[#141820]">
                <th className="py-3 px-4">Casa</th>
                <th className="py-3 px-4">Cúspide Exacta</th>
                <th className="py-3 px-4">Longitud Absoluta</th>
                <th className="py-3 px-4">Significado en Creación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2129] technical-mono text-xs">
              {chart.houses.map((h) => {
                const houseSignificance: Record<number, string> = {
                  1: 'Presencia, identidad en cámara y estilo personal (Ascendente)',
                  2: 'Valor comercial, monetización y recursos tangibles',
                  3: 'Comunicación rápida, redacción, Stories y podcasts',
                  4: 'Bases personales, backstage íntimo y hogar',
                  5: 'Creatividad pura, espontaneidad, juego y expresión visual',
                  6: 'Rutinas diarias, organización de trabajo y salud',
                  7: 'Colaboraciones uno-a-uno, partnerships y entrevistas',
                  8: 'Transformación profunda, misterio y temas tabú',
                  9: 'Expansión de audiencia, visión filosófica y tutoriales largos',
                  10: 'Autoridad pública, prestigio profesional y lanzamientos (MC)',
                  11: 'Comunidad, redes sociales, alcance colectivo y engagement',
                  12: 'Introspección, brainstorming en soledad y edición profunda',
                };

                return (
                  <tr key={h.house} className="hover:bg-[#171b21] transition-colors">
                    <td className="py-3 px-4 font-sans text-[#c2a878] font-bold">
                      Casa {h.house}
                    </td>
                    <td className="py-3 px-4 text-[#dedad2]">{h.formattedDegree}</td>
                    <td className="py-3 px-4 text-[#8a929e]">{h.longitude.toFixed(2)}°</td>
                    <td className="py-3 px-4 font-sans text-xs text-[#8a929e]">
                      {houseSignificance[h.house]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Aspects Table */}
      {activeTab === 'aspects' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#232a35] text-[11px] uppercase tracking-wider text-[#8a929e] bg-[#141820]">
                <th className="py-3 px-4">Punto 1</th>
                <th className="py-3 px-4">Aspecto</th>
                <th className="py-3 px-4">Punto 2</th>
                <th className="py-3 px-4">Orbe</th>
                <th className="py-3 px-4">Dinámica</th>
                <th className="py-3 px-4">Intensidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2129] technical-mono text-xs">
              {chart.aspects.map((a, idx) => {
                const def = MAJOR_ASPECTS.find((m) => m.type === a.aspectType);

                return (
                  <tr key={idx} className="hover:bg-[#171b21] transition-colors">
                    <td className="py-3 px-4 font-sans text-[#f2efe9] uppercase font-medium">
                      {a.planet1}
                    </td>
                    <td className="py-3 px-4 font-sans flex items-center gap-1.5 text-[#c2a878]">
                      <span>{def?.symbol}</span>
                      <span>{def?.nameEs}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-[#f2efe9] uppercase font-medium">
                      {a.planet2}
                    </td>
                    <td className="py-3 px-4 text-[#dedad2]">{a.formattedOrb}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={a.isApplying ? 'text-[#c2a878]' : 'text-[#8a929e]'}>
                        {a.isApplying ? 'Aplicando' : 'Separando'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-16 bg-[#1c2129] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#c2a878] h-full"
                          style={{ width: `${a.weight * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
