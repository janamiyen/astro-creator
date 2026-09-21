import { normalizeDegrees, formatOrb } from '../calculations/coordinates';
import { AspectType, ChartAspect, PlanetKey, TransitAspect } from '../types';

export interface AspectDefinition {
  type: AspectType;
  nameEs: string;
  angle: number;
  symbol: string;
}

export const MAJOR_ASPECTS: AspectDefinition[] = [
  { type: 'conjunction', nameEs: 'Conjunción', angle: 0, symbol: '☌' },
  { type: 'sextile', nameEs: 'Sextil', angle: 60, symbol: '⚹' },
  { type: 'square', nameEs: 'Cuadratura', angle: 90, symbol: '□' },
  { type: 'trine', nameEs: 'Trígono', angle: 120, symbol: '△' },
  { type: 'opposition', nameEs: 'Oposición', angle: 180, symbol: '☍' },
];

/**
 * Calculates orb weight according to the specification:
 * 0°00'–0°30'   → peso 1.00 (máxima intensidad)
 * 0°30'–1°00'   → peso 0.80 (muy alta)
 * 1°00'–2°00'   → peso 0.50 (alta)
 * 2°00'–3°00'   → peso 0.25 (moderada)
 * >3°00'         → descartado para timing diario (0)
 */
export function calculateOrbWeight(orb: number): number {
  if (orb <= 0.5) return 1.0;
  if (orb <= 1.0) return 0.8;
  if (orb <= 2.0) return 0.5;
  if (orb <= 3.0) return 0.25;
  return 0;
}

/**
 * Checks if two celestial positions form any major aspect within maxOrb
 */
export function findAspect(
  pos1: number,
  speed1: number,
  pos2: number,
  speed2: number,
  maxOrb: number = 3.0
): {
  aspectType: AspectType;
  angle: number;
  orb: number;
  formattedOrb: string;
  isApplying: boolean;
  weight: number;
} | null {
  const p1 = normalizeDegrees(pos1);
  const p2 = normalizeDegrees(pos2);

  let diff = Math.abs(p1 - p2);
  if (diff > 180) {
    diff = 360 - diff;
  }

  for (const aspect of MAJOR_ASPECTS) {
    const orb = Math.abs(diff - aspect.angle);
    if (orb <= maxOrb) {
      // Determine applying vs separating:
      // Relative speed: pos1 moving relative to pos2
      // Check if distance to exact aspect will decrease in next small step
      const step = 0.01; // small time fraction
      const nextP1 = normalizeDegrees(p1 + speed1 * step);
      const nextP2 = normalizeDegrees(p2 + speed2 * step);

      let nextDiff = Math.abs(nextP1 - nextP2);
      if (nextDiff > 180) nextDiff = 360 - nextDiff;

      const nextOrb = Math.abs(nextDiff - aspect.angle);
      const isApplying = nextOrb < orb;

      return {
        aspectType: aspect.type,
        angle: aspect.angle,
        orb,
        formattedOrb: formatOrb(orb),
        isApplying,
        weight: calculateOrbWeight(orb),
      };
    }
  }

  return null;
}

/**
 * Calculates all natal aspects between planets and angles
 */
export function calculateChartAspects(
  planets: Record<string, { longitude: number; speed: number }>,
  angles?: { ascendant: number; midheaven: number },
  maxOrb: number = 3.0
): ChartAspect[] {
  const aspects: ChartAspect[] = [];
  const keys = Object.keys(planets) as PlanetKey[];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const p1 = keys[i];
      const p2 = keys[j];
      const found = findAspect(
        planets[p1].longitude,
        planets[p1].speed,
        planets[p2].longitude,
        planets[p2].speed,
        maxOrb
      );

      if (found) {
        aspects.push({
          planet1: p1,
          planet2: p2,
          aspectType: found.aspectType,
          angle: found.angle,
          orb: found.orb,
          formattedOrb: found.formattedOrb,
          isApplying: found.isApplying,
          weight: found.weight,
        });
      }
    }
  }

  // Include aspects to Ascendant and Midheaven if available
  if (angles) {
    for (const p of keys) {
      // to Ascendant
      const ascAspect = findAspect(
        planets[p].longitude,
        planets[p].speed,
        angles.ascendant,
        0, // angle is static in natal chart
        maxOrb
      );
      if (ascAspect) {
        aspects.push({
          planet1: p,
          planet2: 'ascendant',
          aspectType: ascAspect.aspectType,
          angle: ascAspect.angle,
          orb: ascAspect.orb,
          formattedOrb: ascAspect.formattedOrb,
          isApplying: ascAspect.isApplying,
          weight: ascAspect.weight,
        });
      }

      // to Midheaven
      const mcAspect = findAspect(
        planets[p].longitude,
        planets[p].speed,
        angles.midheaven,
        0,
        maxOrb
      );
      if (mcAspect) {
        aspects.push({
          planet1: p,
          planet2: 'midheaven',
          aspectType: mcAspect.aspectType,
          angle: mcAspect.angle,
          orb: mcAspect.orb,
          formattedOrb: mcAspect.formattedOrb,
          isApplying: mcAspect.isApplying,
          weight: mcAspect.weight,
        });
      }
    }
  }

  return aspects;
}
