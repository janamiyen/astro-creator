import { describe, it, expect } from 'vitest';
import { SwissEphWasmProvider } from '../astronomy/providers/swisseph-wasm.provider';
import { BirthInput } from '../astronomy/types';

describe('FASE 0: Validación Astronómica con Swiss Ephemeris', () => {
  const provider = new SwissEphWasmProvider();

  it('1. Calcula con exactitud astronómica la carta natal de referencia (Buenos Aires)', async () => {
    // Carta de prueba: 21 de Septiembre 1995, 14:30 en Buenos Aires (UTC-3)
    const testInput: BirthInput = {
      name: 'Test Native',
      birthDate: '1995-09-21',
      birthTime: '14:30',
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    };

    const chart = await provider.calculateChart({ input: testInput, maxOrb: 3.0 });

    expect(chart.metadata.provider).toBe('Swiss Ephemeris WebAssembly');
    expect(chart.metadata.zodiac).toBe('tropical');
    expect(chart.metadata.houseSystem).toBe('P');

    // 21 de Septiembre: Sol en los últimos grados de Virgo
    expect(chart.planets.sun.sign).toBe('Virgo');
    expect(chart.planets.sun.degree).toBeGreaterThanOrEqual(27);

    // Luna en Leo
    expect(chart.planets.moon.sign).toBe('Leo');

    // Ascendente calculado con Placidus para lat/lon de Buenos Aires a las 14:30
    // 305.5° -> Acuario (300° a 330°)
    expect(chart.angles.ascendantSign).toBe('Acuario');
    expect(chart.angles.midheavenSign).toBe('Libra'); // 206.1° -> 26°08' Libra (180° a 210°)
    expect(chart.houses.length).toBe(12);

    // Verificación de casas 1 a 12
    for (let h = 1; h <= 12; h++) {
      expect(chart.houses[h - 1].house).toBe(h);
      expect(chart.houses[h - 1].longitude).toBeGreaterThanOrEqual(0);
      expect(chart.houses[h - 1].longitude).toBeLessThan(360);
    }
  });

  it('2. Detecta retrogradación y velocidades planetarias reales', async () => {
    // 1 de Enero 2023, 00:00 UTC - Mercurio y Marte estaban retrógrados
    const retroInput: BirthInput = {
      name: 'Retrograde Test',
      birthDate: '2023-01-01',
      birthTime: '00:00',
      city: 'Greenwich',
      country: 'UK',
      latitude: 51.4769,
      longitude: 0.0,
      timezone: 'UTC',
    };

    const chart = await provider.calculateChart({ input: retroInput, maxOrb: 3.0 });

    // Marte retrógrado en Géminis a principios de 2023
    expect(chart.planets.mars.speed).toBeLessThan(0);
    expect(chart.planets.mars.isRetrograde).toBe(true);

    // Sol siempre directo
    expect(chart.planets.sun.speed).toBeGreaterThan(0);
    expect(chart.planets.sun.isRetrograde).toBe(false);
  });

  it('3. Calcula aspectos y orbes con estricta ponderación', async () => {
    const input: BirthInput = {
      name: 'Aspect Test',
      birthDate: '2000-01-01',
      birthTime: '12:00',
      city: 'London',
      country: 'UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    };

    const chart = await provider.calculateChart({ input, maxOrb: 3.0 });

    expect(chart.aspects.length).toBeGreaterThan(0);
    for (const aspect of chart.aspects) {
      expect(aspect.orb).toBeLessThanOrEqual(3.0);
      expect(aspect.weight).toBeGreaterThan(0);
      expect(['conjunction', 'sextile', 'square', 'trine', 'opposition']).toContain(
        aspect.aspectType
      );
    }
  });

  it('4. Realiza cálculo intradía fino de la Luna cada 15 minutos', async () => {
    const start = new Date('2026-09-21T00:00:00Z');
    const end = new Date('2026-09-21T04:00:00Z');

    const moonPoints = await provider.calculateIntradayMoon({
      startTimeUtc: start,
      endTimeUtc: end,
      stepMinutes: 15,
    });

    // 4 horas / 15 mins = 17 puntos (0, 15, 30 ... 240)
    expect(moonPoints.length).toBe(17);

    // La Luna avanza aproximadamente 0.5° por hora (~0.125° cada 15m)
    const diff = moonPoints[moonPoints.length - 1].longitude - moonPoints[0].longitude;
    expect(diff).toBeGreaterThan(1.5);
    expect(diff).toBeLessThan(3.0);
  });
});
