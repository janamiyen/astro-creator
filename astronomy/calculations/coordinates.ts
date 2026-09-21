export const ZODIAC_SIGNS = [
  'Aries',
  'Tauro',
  'Géminis',
  'Cáncer',
  'Leo',
  'Virgo',
  'Libra',
  'Escorpio',
  'Sagitario',
  'Capricornio',
  'Acuario',
  'Piscis',
] as const;

export const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Tauro: '♉',
  Géminis: '♊',
  Cáncer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Escorpio: '♏',
  Sagitario: '♐',
  Capricornio: '♑',
  Acuario: '♒',
  Piscis: '♓',
};

export const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  northNode: '☊',
  ascendant: 'AC',
  midheaven: 'MC',
};

export const PLANET_NAMES_ES: Record<string, string> = {
  sun: 'Sol',
  moon: 'Luna',
  mercury: 'Mercurio',
  venus: 'Venus',
  mars: 'Marte',
  jupiter: 'Júpiter',
  saturn: 'Saturno',
  uranus: 'Urano',
  neptune: 'Neptuno',
  pluto: 'Plutón',
  northNode: 'Nodo Norte',
  ascendant: 'Ascendente',
  midheaven: 'Medio Cielo',
};

/**
 * Normalizes an angle to [0, 360)
 */
export function normalizeDegrees(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

/**
 * Formats a celestial longitude into Sign, Degree, Minute and Second
 */
export function formatLongitude(deg: number): {
  sign: string;
  signIndex: number;
  degreeInSign: number;
  degree: number;
  minute: number;
  second: number;
  formatted: string;
} {
  const norm = normalizeDegrees(deg);
  const signIndex = Math.floor(norm / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeInSign = norm - signIndex * 30;

  const degree = Math.floor(degreeInSign);
  const remainderMinutes = (degreeInSign - degree) * 60;
  const minute = Math.floor(remainderMinutes);
  const second = Math.floor((remainderMinutes - minute) * 60);

  const formatted = `${degree}°${minute.toString().padStart(2, '0')}' ${sign}`;

  return {
    sign,
    signIndex,
    degreeInSign,
    degree,
    minute,
    second,
    formatted,
  };
}

/**
 * Formats an orb decimal number into degrees and minutes (e.g. 0°24')
 */
export function formatOrb(orb: number): string {
  const d = Math.floor(orb);
  const m = Math.round((orb - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
}
