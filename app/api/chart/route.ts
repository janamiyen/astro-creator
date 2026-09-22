import { NextRequest, NextResponse } from 'next/server';
import { SwissEphWasmProvider } from '@/astronomy/providers/swisseph-wasm.provider';
import { CreatorTimingEngine } from '@/creator-timing/creator-timing.engine';
import { BirthInput } from '@/astronomy/types';

// Global singleton instance for server routes
const provider = new SwissEphWasmProvider();
const engine = new CreatorTimingEngine(provider);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, targetDate, maxOrb = 3.0 } = body as {
      input: BirthInput;
      targetDate?: string; // ISO date string
      maxOrb?: number;
    };

    if (!input || !input.birthDate || !input.timezone) {
      return NextResponse.json(
        { error: 'Datos de nacimiento incompletos (requiere fecha y timezone).' },
        { status: 400 }
      );
    }

    const birthYear = parseInt(input.birthDate.split('-')[0], 10);
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > 2100) {
      return NextResponse.json(
        { error: 'Año de nacimiento inválido. Debe estar comprendido entre 1900 y 2100.' },
        { status: 400 }
      );
    }

    // 1. Calculate Natal Chart
    const chart = await provider.calculateChart({
      input,
      maxOrb,
    });

    // 2. Date to evaluate
    const dateToEvaluate = targetDate ? new Date(targetDate) : new Date();

    // 3. Evaluate Creator Timing
    const creatorTiming = await engine.evaluateDay(
      chart,
      dateToEvaluate,
      input.creatorNiche
    );

    return NextResponse.json({
      chart,
      creatorTiming,
    });
  } catch (error: any) {
    console.error('Error in /api/chart calculation:', error);
    return NextResponse.json(
      { error: error.message || 'Error calculando carta y tránsitos con Swiss Ephemeris.' },
      { status: 500 }
    );
  }
}
