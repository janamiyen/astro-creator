import { NextRequest, NextResponse } from 'next/server';
import { SwissEphWasmProvider } from '@/astronomy/providers/swisseph-wasm.provider';
import { CreatorTimingEngine } from '@/creator-timing/creator-timing.engine';
import { NatalChartData } from '@/astronomy/types';

const provider = new SwissEphWasmProvider();
const engine = new CreatorTimingEngine(provider);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chart, days = 7, nicheKey } = body as {
      chart: NatalChartData;
      days?: number;
      nicheKey?: string;
    };

    if (!chart || !chart.planets) {
      return NextResponse.json({ error: 'Carta natal requerida.' }, { status: 400 });
    }

    const today = new Date();
    const results = [];

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);

      const timing = await engine.evaluateDay(
        chart,
        targetDate,
        nicheKey || chart.input.creatorNiche
      );

      results.push({
        date: targetDate.toISOString(),
        dateFormatted: timing.dateFormatted,
        weekday: targetDate.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(),
        generalScore: timing.generalScore,
        activityLevel: timing.activityLevel,
        bestWindow: timing.bestWindow,
        categoryScores: timing.categoryScores,
      });
    }

    return NextResponse.json({
      days: results,
    });
  } catch (error: any) {
    console.error('Error in /api/calendar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
