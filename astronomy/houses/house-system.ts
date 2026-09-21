import { normalizeDegrees } from '../calculations/coordinates';
import { HouseCusp } from '../types';

/**
 * Determines which astrological house a given celestial longitude falls into
 * based on the 12 Placidus house cusps.
 *
 * Placidus cusps wrap around 360 degrees (0 = Aries).
 * House 1 starts at cusps[0] and extends to cusps[1], etc.
 */
export function determineHouse(longitude: number, cusps: HouseCusp[]): number {
  if (!cusps || cusps.length < 12) return 1;

  const pos = normalizeDegrees(longitude);

  for (let i = 0; i < 12; i++) {
    const currentCusp = normalizeDegrees(cusps[i].longitude);
    const nextIndex = (i + 1) % 12;
    const nextCusp = normalizeDegrees(cusps[nextIndex].longitude);

    if (currentCusp <= nextCusp) {
      // Normal case: cusp doesn't cross 0° Aries
      if (pos >= currentCusp && pos < nextCusp) {
        return cusps[i].house;
      }
    } else {
      // Wraparound case: cusp crosses 0° Aries (e.g. 350° to 20°)
      if (pos >= currentCusp || pos < nextCusp) {
        return cusps[i].house;
      }
    }
  }

  return 1;
}
