import SwissEph from 'swisseph-wasm';
import {
  EphemerisProvider,
  ChartCalculationParams,
  TransitCalculationParams,
} from './ephemeris-provider.interface';
import {
  NatalChartData,
  TransitData,
  PlanetKey,
  PlanetPosition,
  HouseCusp,
  ChartAngles,
  TransitAspect,
} from '../types';
import { convertLocalToUtc } from '../../lib/timezone/converter';
import { formatLongitude } from '../calculations/coordinates';
import { calculateChartAspects, findAspect } from '../aspects/aspect-calculator';
import { determineHouse } from '../houses/house-system';

export class SwissEphWasmProvider implements EphemerisProvider {
  public readonly name = 'Swiss Ephemeris WebAssembly';
  public readonly version = '2.10.x-wasm-0.1.0';

  private swe: any = null;
  private isInitialized = false;

  private async ensureInit() {
    if (!this.isInitialized) {
      this.swe = new SwissEph();

      // Ensure wasm & data paths resolve correctly both in local Node, Vercel Serverless, and Next.js
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          
          // Candidate paths where Vercel and local put the wasm/data
          const possibleDirs = [
            path.resolve(process.cwd(), 'public/wasm'),
            path.resolve(process.cwd(), 'node_modules/swisseph-wasm/wasm'),
            path.resolve(process.cwd(), '.next/server/chunks'),
            '/var/task/public/wasm',
            '/var/task/node_modules/swisseph-wasm/wasm',
          ];

          let foundDir: string | null = null;
          for (const d of possibleDirs) {
            if (fs.existsSync(path.join(d, 'swisseph.wasm'))) {
              foundDir = d;
              break;
            }
          }

          if (foundDir) {
            const wasmPath = path.join(foundDir, 'swisseph.wasm');
            const dataPath = path.join(foundDir, 'swisseph.data');
            const wasmBuf = fs.readFileSync(wasmPath);
            const dataBuf = fs.existsSync(dataPath) ? fs.readFileSync(dataPath) : null;

            // Load underlying Emscripten module directly with binary buffers
            const { pathToFileURL } = await import('url');
            const wasmJsPath = pathToFileURL(path.join(foundDir, 'swisseph.js')).href;
            const { default: WasmSwissEph } = await import(wasmJsPath);

            const mod = await WasmSwissEph({
              wasmBinary: wasmBuf,
              getPreloadedPackage: dataBuf ? () => dataBuf.buffer : undefined,
              locateFile: (p: string) => path.join(foundDir!, p),
            });

            // Attach initialized module to this.swe
            (this.swe as any)._customModule = mod;
            // Override SweModule getter via Object.defineProperty
            Object.defineProperty(this.swe, 'SweModule', {
              get: () => mod,
              configurable: true,
            });

            if (!mod.HEAP32) {
              mod.HEAP32 = new Int32Array(mod.HEAPF64.buffer);
            }
            this.swe.set_ephe_path('sweph');
            this.isInitialized = true;
            return;
          }
        } catch (err) {
          console.warn('Custom wasm buffer loader failed, falling back to default initSwissEph:', err);
        }
      }

      await this.swe.initSwissEph();
      this.isInitialized = true;
    }
  }

  private getPlanetConstant(key: PlanetKey): number {
    switch (key) {
      case 'sun':
        return this.swe.SE_SUN;
      case 'moon':
        return this.swe.SE_MOON;
      case 'mercury':
        return this.swe.SE_MERCURY;
      case 'venus':
        return this.swe.SE_VENUS;
      case 'mars':
        return this.swe.SE_MARS;
      case 'jupiter':
        return this.swe.SE_JUPITER;
      case 'saturn':
        return this.swe.SE_SATURN;
      case 'uranus':
        return this.swe.SE_URANUS;
      case 'neptune':
        return this.swe.SE_NEPTUNE;
      case 'pluto':
        return this.swe.SE_PLUTO;
      case 'northNode':
        return this.swe.SE_TRUE_NODE;
    }
  }

  async calculateChart(params: ChartCalculationParams): Promise<NatalChartData> {
    await this.ensureInit();
    const { input, maxOrb = 3.0 } = params;

    // 1. Time conversion to UTC
    const utcConv = convertLocalToUtc(
      input.birthDate,
      input.timeUnknown ? '12:00' : input.birthTime,
      input.timezone
    );

    // 2. Compute Julian Day UT
    const jdUT = this.swe.julday(
      utcConv.year,
      utcConv.month,
      utcConv.day,
      utcConv.decimalHourUtc
    );

    // 3. Compute Houses (Placidus 'P') & Angles
    // Placidus requires latitude and longitude
    const houseResult = this.swe.houses(
      jdUT,
      input.latitude,
      input.longitude,
      'P'
    );

    const houseCusps: HouseCusp[] = [];
    for (let h = 1; h <= 12; h++) {
      const cuspDeg = houseResult.cusps[h];
      const fmt = formatLongitude(cuspDeg);
      houseCusps.push({
        house: h,
        longitude: cuspDeg,
        sign: fmt.sign,
        degreeInSign: fmt.degreeInSign,
        formattedDegree: fmt.formatted,
      });
    }

    const ascendantDeg = houseResult.ascmc[0];
    const mcDeg = houseResult.ascmc[1];
    const descDeg = (ascendantDeg + 180) % 360;
    const icDeg = (mcDeg + 180) % 360;

    const ascFmt = formatLongitude(ascendantDeg);
    const mcFmt = formatLongitude(mcDeg);

    const angles: ChartAngles = {
      ascendant: ascendantDeg,
      midheaven: mcDeg,
      descendant: descDeg,
      imumCoeli: icDeg,
      ascendantSign: ascFmt.sign,
      midheavenSign: mcFmt.sign,
      formattedAscendant: ascFmt.formatted,
      formattedMidheaven: mcFmt.formatted,
    };

    // 4. Calculate Planets
    const planetKeys: PlanetKey[] = [
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
      'northNode',
    ];

    const planetNamesMap: Record<PlanetKey, string> = {
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
    };

    const planets: Partial<Record<PlanetKey, PlanetPosition>> = {};
    const planetList: PlanetPosition[] = [];

    for (const key of planetKeys) {
      const planetConst = this.getPlanetConstant(key);
      // flags: SEFLG_SWIEPH | SEFLG_SPEED
      const flag = this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED;
      const res = this.swe.calc_ut(jdUT, planetConst, flag);

      const lon = res[0];
      const lat = res[1];
      const dist = res[2];
      const speed = res[3];
      const isRetrograde = speed < 0;

      const fmt = formatLongitude(lon);
      const house = determineHouse(lon, houseCusps);

      const pos: PlanetPosition = {
        id: key,
        name: planetNamesMap[key],
        longitude: lon,
        latitude: lat,
        distance: dist,
        speed,
        isRetrograde,
        sign: fmt.sign,
        signIndex: fmt.signIndex,
        degreeInSign: fmt.degreeInSign,
        degree: fmt.degree,
        minute: fmt.minute,
        second: fmt.second,
        formattedDegree: fmt.formatted,
        house,
      };

      planets[key] = pos;
      planetList.push(pos);
    }

    // 5. Calculate Aspects
    const aspects = calculateChartAspects(
      planets as Record<string, { longitude: number; speed: number }>,
      input.timeUnknown ? undefined : { ascendant: ascendantDeg, midheaven: mcDeg },
      maxOrb
    );

    const precision = input.timeUnknown
      ? 'unknown_time'
      : input.timeApproximate
      ? 'moderate'
      : 'high';

    return {
      input,
      metadata: {
        provider: this.name,
        version: this.version,
        zodiac: 'tropical',
        houseSystem: 'P',
        utcTimestamp: utcConv.utcIso,
        julianDayUT: jdUT,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
      },
      precision,
      planets: planets as Record<PlanetKey, PlanetPosition>,
      planetList,
      houses: houseCusps,
      angles,
      aspects,
    };
  }

  async calculateTransits(params: TransitCalculationParams): Promise<TransitData> {
    await this.ensureInit();
    const { natalChart, dateUtc, maxOrb = 3.0 } = params;

    const year = dateUtc.getUTCFullYear();
    const month = dateUtc.getUTCMonth() + 1;
    const day = dateUtc.getUTCDate();
    const decimalHour =
      dateUtc.getUTCHours() +
      dateUtc.getUTCMinutes() / 60 +
      dateUtc.getUTCSeconds() / 3600;

    const jdUT = this.swe.julday(year, month, day, decimalHour);

    const planetKeys: PlanetKey[] = [
      'sun',
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
      'northNode',
    ];

    const transitPlanets: Partial<Record<PlanetKey, PlanetPosition>> = {};
    const transitHouses: Partial<Record<PlanetKey, number>> = {};

    for (const key of planetKeys) {
      const pConst = this.getPlanetConstant(key);
      const flag = this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED;
      const res = this.swe.calc_ut(jdUT, pConst, flag);

      const lon = res[0];
      const lat = res[1];
      const dist = res[2];
      const speed = res[3];
      const isRetrograde = speed < 0;

      const fmt = formatLongitude(lon);
      // Transit house in the user's natal chart:
      const natalHouse = determineHouse(lon, natalChart.houses);

      const pos: PlanetPosition = {
        id: key,
        name: key,
        longitude: lon,
        latitude: lat,
        distance: dist,
        speed,
        isRetrograde,
        sign: fmt.sign,
        signIndex: fmt.signIndex,
        degreeInSign: fmt.degreeInSign,
        degree: fmt.degree,
        minute: fmt.minute,
        second: fmt.second,
        formattedDegree: fmt.formatted,
        house: natalHouse,
      };

      transitPlanets[key] = pos;
      transitHouses[key] = natalHouse;
    }

    // Calculate transit aspects to natal planets & angles
    const aspectsToNatal: TransitAspect[] = [];

    for (const tKey of planetKeys) {
      const tPos = transitPlanets[tKey]!;

      // Aspect to each natal planet
      for (const nKey of planetKeys) {
        const nPos = natalChart.planets[nKey];
        if (!nPos) continue;

        const aspect = findAspect(
          tPos.longitude,
          tPos.speed,
          nPos.longitude,
          nPos.speed,
          maxOrb
        );

        if (aspect) {
          aspectsToNatal.push({
            transitPlanet: tKey,
            natalPoint: nKey,
            aspectType: aspect.aspectType,
            exactAngle: aspect.angle,
            currentAngle: Math.abs(tPos.longitude - nPos.longitude) % 360,
            orb: aspect.orb,
            formattedOrb: aspect.formattedOrb,
            isApplying: aspect.isApplying,
            weight: aspect.weight,
            transitHouse: tPos.house,
          });
        }
      }

      // Aspect to Natal Ascendant & Midheaven (if reliable)
      if (natalChart.precision !== 'unknown_time') {
        const ascAspect = findAspect(
          tPos.longitude,
          tPos.speed,
          natalChart.angles.ascendant,
          0,
          maxOrb
        );
        if (ascAspect) {
          aspectsToNatal.push({
            transitPlanet: tKey,
            natalPoint: 'ascendant',
            aspectType: ascAspect.aspectType,
            exactAngle: ascAspect.angle,
            currentAngle: Math.abs(tPos.longitude - natalChart.angles.ascendant) % 360,
            orb: ascAspect.orb,
            formattedOrb: ascAspect.formattedOrb,
            isApplying: ascAspect.isApplying,
            weight: ascAspect.weight,
            transitHouse: tPos.house,
          });
        }

        const mcAspect = findAspect(
          tPos.longitude,
          tPos.speed,
          natalChart.angles.midheaven,
          0,
          maxOrb
        );
        if (mcAspect) {
          aspectsToNatal.push({
            transitPlanet: tKey,
            natalPoint: 'midheaven',
            aspectType: mcAspect.aspectType,
            exactAngle: mcAspect.angle,
            currentAngle: Math.abs(tPos.longitude - natalChart.angles.midheaven) % 360,
            orb: mcAspect.orb,
            formattedOrb: mcAspect.formattedOrb,
            isApplying: mcAspect.isApplying,
            weight: mcAspect.weight,
            transitHouse: tPos.house,
          });
        }
      }
    }

    return {
      timestampUtc: dateUtc.toISOString(),
      julianDayUT: jdUT,
      metadata: {
        provider: this.name,
        version: this.version,
        zodiac: 'tropical',
        houseSystem: 'P',
        utcTimestamp: dateUtc.toISOString(),
        julianDayUT: jdUT,
        latitude: natalChart.input.latitude,
        longitude: natalChart.input.longitude,
        timezone: natalChart.input.timezone,
      },
      transitPlanets: transitPlanets as Record<PlanetKey, PlanetPosition>,
      transitHouses: transitHouses as Record<PlanetKey, number>,
      aspectsToNatal,
    };
  }

  async calculateIntradayMoon(params: {
    startTimeUtc: Date;
    endTimeUtc: Date;
    stepMinutes: number;
  }): Promise<
    Array<{
      timestamp: Date;
      longitude: number;
      speed: number;
    }>
  > {
    await this.ensureInit();
    const { startTimeUtc, endTimeUtc, stepMinutes } = params;
    const results: Array<{ timestamp: Date; longitude: number; speed: number }> = [];

    const startMs = startTimeUtc.getTime();
    const endMs = endTimeUtc.getTime();
    const stepMs = stepMinutes * 60 * 1000;

    for (let currentMs = startMs; currentMs <= endMs; currentMs += stepMs) {
      const dt = new Date(currentMs);
      const year = dt.getUTCFullYear();
      const month = dt.getUTCMonth() + 1;
      const day = dt.getUTCDate();
      const decimalHour =
        dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600;

      const jdUT = this.swe.julday(year, month, day, decimalHour);
      const flag = this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED;
      const res = this.swe.calc_ut(jdUT, this.swe.SE_MOON, flag);

      results.push({
        timestamp: dt,
        longitude: res[0],
        speed: res[3],
      });
    }

    return results;
  }
}
