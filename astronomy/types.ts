export type ZodiacSystem = 'tropical' | 'sidereal';
export type HouseSystem = 'P' | 'K' | 'O' | 'R' | 'C' | 'E' | 'W'; // P = Placidus, K = Koch, etc.

export interface BirthInput {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm (or empty if unknown)
  timeUnknown?: boolean;
  timeApproximate?: boolean;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string; // IANA e.g. "America/Argentina/Buenos_Aires"
  creatorNiche?: string;
}

export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'northNode';

export type AspectType =
  | 'conjunction'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'opposition';

export interface PlanetPosition {
  id: PlanetKey;
  name: string;
  longitude: number; // 0 to 360
  latitude: number;
  distance: number;
  speed: number;
  isRetrograde: boolean;
  sign: string;
  signIndex: number; // 0 = Aries ... 11 = Pisces
  degreeInSign: number; // 0 to 29.999
  degree: number; // int degree
  minute: number; // int minute
  second: number; // int second
  formattedDegree: string; // e.g. "8°31' Leo"
  house: number; // 1 to 12
}

export interface HouseCusp {
  house: number;
  longitude: number;
  sign: string;
  degreeInSign: number;
  formattedDegree: string;
}

export interface ChartAngles {
  ascendant: number;
  midheaven: number;
  descendant: number;
  imumCoeli: number;
  formattedAscendant: string;
  formattedMidheaven: string;
  ascendantSign: string;
  midheavenSign: string;
}

export interface ChartAspect {
  planet1: PlanetKey | 'ascendant' | 'midheaven';
  planet2: PlanetKey | 'ascendant' | 'midheaven';
  aspectType: AspectType;
  angle: number; // 0, 60, 90, 120, 180
  orb: number; // in decimal degrees
  formattedOrb: string; // e.g. "0°24'"
  isApplying: boolean;
  weight: number; // 0.25 to 1.0 based on orb
}

export interface AstronomicalMetadata {
  provider: string;
  version: string;
  zodiac: ZodiacSystem;
  houseSystem: HouseSystem;
  utcTimestamp: string;
  julianDayUT: number;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface NatalChartData {
  input: BirthInput;
  metadata: AstronomicalMetadata;
  precision: 'high' | 'moderate' | 'unknown_time';
  planets: Record<PlanetKey, PlanetPosition>;
  planetList: PlanetPosition[];
  houses: HouseCusp[];
  angles: ChartAngles;
  aspects: ChartAspect[];
}

export interface TransitAspect {
  transitPlanet: PlanetKey;
  natalPoint: PlanetKey | 'ascendant' | 'midheaven';
  aspectType: AspectType;
  exactAngle: number;
  currentAngle: number;
  orb: number;
  formattedOrb: string;
  isApplying: boolean;
  weight: number;
  exactTimeEstimate?: string;
  transitHouse: number; // house in natal chart where transit planet sits
}

export interface TransitData {
  timestampUtc: string;
  julianDayUT: number;
  metadata: AstronomicalMetadata;
  transitPlanets: Record<PlanetKey, PlanetPosition>;
  transitHouses: Record<PlanetKey, number>; // which natal house each transiting planet activates
  aspectsToNatal: TransitAspect[];
}
