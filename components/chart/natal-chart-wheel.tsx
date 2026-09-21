'use client';

import React, { useState } from 'react';
import {
  NatalChartData,
  PlanetPosition,
} from '@/astronomy/types';
import {
  PLANET_SYMBOLS,
  ZODIAC_SIGNS,
  ZODIAC_SYMBOLS,
  normalizeDegrees,
} from '@/astronomy/calculations/coordinates';

interface NatalChartWheelProps {
  chart: NatalChartData;
  size?: number;
  interactive?: boolean;
}

export const NatalChartWheel: React.FC<NatalChartWheelProps> = ({
  chart,
  size = 560,
  interactive = true,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetPosition | null>(null);

  const center = size / 2;
  const radius = size * 0.44;
  const innerRadius = size * 0.36;
  const planetRingRadius = size * 0.28;
  const aspectRingRadius = size * 0.20;

  // Ascendant shifts the entire wheel so House 1 / Ascendant sits at 180° (left side)
  const ascendantOffset = chart.angles.ascendant;

  const toChartCoords = (deg: number, r: number) => {
    // 0° Ascendant = 180° on canvas (traditional left-hand horizon)
    const angle = ((180 - (deg - ascendantOffset)) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 justify-center">
      {/* SVG Wheel */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="select-none overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <radialGradient id="observatoryGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#141820" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#090a0c" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Background circles */}
          <circle cx={center} cy={center} r={radius} fill="url(#observatoryGlow)" stroke="#232a35" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#232a35" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx={center} cy={center} r={planetRingRadius} fill="none" stroke="#1c2129" strokeWidth="1" />
          <circle cx={center} cy={center} r={aspectRingRadius} fill="#0d0f12" stroke="#232a35" strokeWidth="1" />

          {/* Zodiac 12 Signs Outer Ring */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const startDeg = index * 30;
            const midDeg = startDeg + 15;
            const p1 = toChartCoords(startDeg, radius);
            const p2 = toChartCoords(startDeg, innerRadius);
            const textPos = toChartCoords(midDeg, (radius + innerRadius) / 2);

            return (
              <g key={sign}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#232a35" strokeWidth="1" />
                <text
                  x={textPos.x}
                  y={textPos.y + 4}
                  fill="#8a929e"
                  fontSize="13"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  className="font-medium"
                >
                  {ZODIAC_SYMBOLS[sign]}
                </text>
              </g>
            );
          })}

          {/* House Cusps Lines (1 to 12) */}
          {chart.houses.map((cusp) => {
            const pOuter = toChartCoords(cusp.longitude, innerRadius);
            const isAxis = cusp.house === 1 || cusp.house === 4 || cusp.house === 7 || cusp.house === 10;
            const pInner = toChartCoords(cusp.longitude, isAxis ? aspectRingRadius : planetRingRadius);
            const textPos = toChartCoords(cusp.longitude + 15, innerRadius - 14);

            return (
              <g key={`cusp-${cusp.house}`}>
                <line
                  x1={pOuter.x}
                  y1={pOuter.y}
                  x2={pInner.x}
                  y2={pInner.y}
                  stroke={isAxis ? '#c2a878' : '#232a35'}
                  strokeWidth={isAxis ? 1.5 : 0.8}
                />
                <text
                  x={textPos.x}
                  y={textPos.y + 3}
                  fill="#4f5968"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {cusp.house}
                </text>
              </g>
            );
          })}

          {/* Major Aspect Lines inside Aspect Circle */}
          {chart.aspects.map((aspect, idx) => {
            if (aspect.planet1 === 'ascendant' || aspect.planet1 === 'midheaven') return null;
            if (aspect.planet2 === 'ascendant' || aspect.planet2 === 'midheaven') return null;

            const pos1 = chart.planets[aspect.planet1 as keyof typeof chart.planets];
            const pos2 = chart.planets[aspect.planet2 as keyof typeof chart.planets];
            if (!pos1 || !pos2) return null;

            const p1 = toChartCoords(pos1.longitude, aspectRingRadius - 2);
            const p2 = toChartCoords(pos2.longitude, aspectRingRadius - 2);

            let strokeColor = '#3a4556';
            if (aspect.aspectType === 'trine' || aspect.aspectType === 'sextile') {
              strokeColor = '#509673'; // Subtle green/teal for harmonious
            } else if (aspect.aspectType === 'square' || aspect.aspectType === 'opposition') {
              strokeColor = '#b56b59'; // Subtle terracotta/red for tension
            } else if (aspect.aspectType === 'conjunction') {
              strokeColor = '#c2a878'; // Gold for conjunction
            }

            return (
              <line
                key={`aspect-${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={strokeColor}
                strokeWidth={aspect.orb < 1.0 ? 1.2 : 0.6}
                strokeOpacity={aspect.weight * 0.7 + 0.2}
              />
            );
          })}

          {/* Planets Glyphs */}
          {chart.planetList.map((planet) => {
            const pos = toChartCoords(planet.longitude, planetRingRadius);
            const isHovered = selectedPlanet?.id === planet.id;

            return (
              <g
                key={planet.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedPlanet(planet)}
                onMouseEnter={() => setSelectedPlanet(planet)}
              >
                {/* Hit target */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 16 : 12}
                  fill={isHovered ? '#232a35' : '#141820'}
                  stroke={isHovered ? '#c2a878' : '#2a3442'}
                  strokeWidth="1"
                />
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  fill={isHovered ? '#ffffff' : '#dedad2'}
                  fontSize={isHovered ? '13' : '11'}
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  className="font-bold pointer-events-none"
                >
                  {PLANET_SYMBOLS[planet.id] || planet.id.slice(0, 2)}
                </text>
                {planet.isRetrograde && (
                  <text
                    x={pos.x + 8}
                    y={pos.y - 4}
                    fill="#b56b59"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    Rx
                  </text>
                )}
              </g>
            );
          })}

          {/* Horizon Line (Ascendant - Descendant) */}
          <line
            x1={center - radius}
            y1={center}
            x2={center + radius}
            y2={center}
            stroke="#c2a878"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {/* Meridian Line (MC - IC) */}
          <line
            x1={center}
            y1={center - radius}
            x2={center}
            y2={center + radius}
            stroke="#c2a878"
            strokeWidth="0.8"
            strokeDasharray="2 4"
          />

          {/* Ascendant tag */}
          <text x={center - radius + 12} y={center - 6} fill="#c2a878" fontSize="10" fontFamily="monospace" fontWeight="bold">
            AC
          </text>
          {/* Midheaven tag */}
          <text x={center + 6} y={center - radius + 14} fill="#c2a878" fontSize="10" fontFamily="monospace" fontWeight="bold">
            MC
          </text>
        </svg>
      </div>

      {/* Selected Planet or Default Detail Panel */}
      <div className="w-full max-w-sm bg-[#111317] border border-[#232a35] rounded-xl p-6 text-sm">
        {selectedPlanet ? (
          <div>
            <div className="flex items-center justify-between border-b border-[#232a35] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-[#c2a878]">
                  {PLANET_SYMBOLS[selectedPlanet.id]}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-[#f2efe9] uppercase tracking-wider">
                    {selectedPlanet.name}
                  </h4>
                  <span className="text-xs text-[#8a929e] technical-mono">
                    {selectedPlanet.formattedDegree}
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 bg-[#1a2029] border border-[#2d3748] rounded text-xs technical-mono text-[#c2a878]">
                Casa {selectedPlanet.house}
              </span>
            </div>

            <div className="space-y-3 technical-mono text-xs">
              <div className="flex justify-between py-1 border-b border-[#1a2029]">
                <span className="text-[#8a929e]">Longitud Absoluta:</span>
                <span className="text-[#f2efe9]">{selectedPlanet.longitude.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1a2029]">
                <span className="text-[#8a929e]">Velocidad Diaria:</span>
                <span className="text-[#f2efe9]">{selectedPlanet.speed.toFixed(4)}° / día</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1a2029]">
                <span className="text-[#8a929e]">Estado de Movimiento:</span>
                <span className={selectedPlanet.isRetrograde ? 'text-[#b56b59] font-medium' : 'text-[#509673]'}>
                  {selectedPlanet.isRetrograde ? 'Retrógrado (Rx)' : 'Directo'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1a2029]">
                <span className="text-[#8a929e]">Latitud Eclíptica:</span>
                <span className="text-[#f2efe9]">{selectedPlanet.latitude.toFixed(4)}°</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-[#8a929e]">
            <p className="text-xs uppercase tracking-widest text-[#c2a878] mb-2 font-medium">
              Observatorio Astral
            </p>
            <p className="text-xs">
              Toca o pasa el cursor sobre cualquier planeta en la rueda para inspeccionar sus coordenadas exactas, orbes y velocidad.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
