import {
  BirthInput,
  NatalChartData,
  TransitData,
  AstronomicalMetadata,
} from '../types';

export interface ChartCalculationParams {
  input: BirthInput;
  maxOrb?: number;
}

export interface TransitCalculationParams {
  natalChart: NatalChartData;
  dateUtc: Date;
  maxOrb?: number;
}

export interface EphemerisProvider {
  readonly name: string;
  readonly version: string;

  calculateChart(params: ChartCalculationParams): Promise<NatalChartData>;

  calculateTransits(params: TransitCalculationParams): Promise<TransitData>;

  /**
   * High-resolution Moon calculation for a given time window
   * returns moon longitudes and speeds at specified minute intervals
   */
  calculateIntradayMoon(params: {
    startTimeUtc: Date;
    endTimeUtc: Date;
    stepMinutes: number; // e.g. 10 or 15 minutes
  }): Promise<
    Array<{
      timestamp: Date;
      longitude: number;
      speed: number;
    }>
  >;
}
