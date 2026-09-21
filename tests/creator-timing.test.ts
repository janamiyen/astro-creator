import { describe, it, expect } from 'vitest';
import { SwissEphWasmProvider } from '../astronomy/providers/swisseph-wasm.provider';
import { CreatorTimingEngine } from '../creator-timing/creator-timing.engine';
import { BirthInput } from '../astronomy/types';

describe('Creator Timing Engine & Scoring', () => {
  const provider = new SwissEphWasmProvider();
  const engine = new CreatorTimingEngine(provider);

  it('Calcula el Creator Timing y genera ventanas con justificación astrológica auditada', async () => {
    const input: BirthInput = {
      name: 'Sofia Creator',
      birthDate: '1996-08-14',
      birthTime: '18:15',
      city: 'Madrid',
      country: 'Spain',
      latitude: 40.4168,
      longitude: -3.7038,
      timezone: 'Europe/Madrid',
      creatorNiche: 'fashion',
    };

    const chart = await provider.calculateChart({ input, maxOrb: 3.0 });
    const today = new Date('2026-09-21T12:00:00Z');

    const result = await engine.evaluateDay(chart, today, 'fashion');

    expect(result.generalScore).toBeGreaterThan(0);
    expect(result.generalScore).toBeLessThanOrEqual(100);
    expect(['Pico de Intensidad', 'Alta Actividad', 'Actividad Moderada', 'Actividad Suave']).toContain(
      result.activityLevel
    );

    // Debe contener ventanas con horas claras y no puntos sueltos
    expect(result.dailyWindows.length).toBeGreaterThanOrEqual(1);

    for (const win of result.dailyWindows) {
      expect(win.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(win.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(win.score).toBeGreaterThan(0);
      expect(win.whyNow.transitsList.length).toBeGreaterThan(0);
      expect(win.actionRecommendation).toBeTruthy();
    }

    // Best window
    expect(result.bestWindow).not.toBeNull();
  });
});
