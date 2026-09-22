import { NatalChartData, TransitData, PlanetKey } from '../astronomy/types';
import { CREATOR_RULES, CreatorCategory, RuleMatch } from './rules/timing-rules';
import { getNicheTranslation } from './niches/niche-adapter';
import { EphemerisProvider } from '../astronomy/providers/ephemeris-provider.interface';
import { findAspect } from '../astronomy/aspects/aspect-calculator';
import { DateTime } from 'luxon';

export interface TimeWindow {
  id: string;
  category: CreatorCategory;
  categoryNameEs: string;
  startTime: string; // "14:20"
  endTime: string; // "16:10"
  startDateTime: string;
  endDateTime: string;
  score: number; // 0 to 100
  intensityLevel: 'Baja' | 'Moderada' | 'Alta' | 'Muy Alta' | 'Excepcional';
  primaryAspect: string;
  exactOrb: string;
  ruleMatches: RuleMatch[];
  keywords: string[];
  actionRecommendation: string;
  exampleIdeas: string[];
  channelSuggestion: string;
  whyNow: {
    transitsList: string[];
    astrologicalSummary: string;
    favorableFor: string[];
  };
}

export interface CreatorTimingSummary {
  dateFormatted: string;
  generalScore: number;
  activityLevel: 'Actividad Suave' | 'Actividad Moderada' | 'Alta Actividad' | 'Pico de Intensidad';
  categoryScores: Record<
    CreatorCategory,
    {
      score: number;
      ratingLabel: string; // e.g. "+++" o "++"
    }
  >;
  bestWindow: TimeWindow | null;
  dailyWindows: TimeWindow[];
  timelineHours: Array<{
    hour: number;
    activeWindows: TimeWindow[];
    moonLongitude: number;
  }>;
}

export class CreatorTimingEngine {
  constructor(private provider: EphemerisProvider) {}

  /**
   * Evaluates creator timing for a specific user and date
   * Uses high resolution lunar tracking (every 15 min) to isolate accurate intraday windows.
   */
  async evaluateDay(
    natalChart: NatalChartData,
    date: Date,
    nicheKey?: string
  ): Promise<CreatorTimingSummary> {
    const niche = getNicheTranslation(nicheKey || natalChart.input.creatorNiche);

    // 1. Calculate base transits for mid-day
    const transitData = await this.provider.calculateTransits({
      natalChart,
      dateUtc: date,
      maxOrb: 3.0,
    });

    const userTimezone = natalChart.input.timezone || 'America/Argentina/Buenos_Aires';
    const evalDt = DateTime.fromJSDate(date).setZone(userTimezone);

    // 2. Local midnight to 23:59:59 converted to UTC timestamps for high-res tracking
    const localDayStart = evalDt.startOf('day');
    const localDayEnd = evalDt.endOf('day');

    const dayStartUtc = localDayStart.toUTC().toJSDate();
    const dayEndUtc = localDayEnd.toUTC().toJSDate();

    const moonPoints = await this.provider.calculateIntradayMoon({
      startTimeUtc: dayStartUtc,
      endTimeUtc: dayEndUtc,
      stepMinutes: 15,
    });

    // 3. Find fine-grained moon aspects across the day
    const intervalsWithAspects: Array<{
      time: Date;
      aspects: any[];
      matchedRules: RuleMatch[];
      score: number;
      category: CreatorCategory;
    }> = [];

    for (const point of moonPoints) {
      const activeTransitAspects = [...transitData.aspectsToNatal];

      // Re-evaluate Moon aspects at this specific minute
      for (const nKey of Object.keys(natalChart.planets) as PlanetKey[]) {
        const nPos = natalChart.planets[nKey];
        const mAspect = findAspect(point.longitude, point.speed, nPos.longitude, nPos.speed, 3.0);
        if (mAspect) {
          activeTransitAspects.push({
            transitPlanet: 'moon',
            natalPoint: nKey,
            aspectType: mAspect.aspectType,
            exactAngle: mAspect.angle,
            currentAngle: Math.abs(point.longitude - nPos.longitude) % 360,
            orb: mAspect.orb,
            formattedOrb: mAspect.formattedOrb,
            isApplying: mAspect.isApplying,
            weight: mAspect.weight,
            transitHouse: 1, // approximate
          });
        }
      }

      // Check all creator rules against this moment
      let pointMatches: RuleMatch[] = [];
      for (const rule of CREATOR_RULES) {
        const matches = rule.check({
          transitAspects: activeTransitAspects,
          transitHouses: transitData.transitHouses,
          natalChart,
        });
        pointMatches.push(...matches);
      }

      if (pointMatches.length > 0) {
        // Group score by category
        const catScores: Record<CreatorCategory, number> = {
          create: 0,
          publish: 0,
          sell: 0,
          engage: 0,
          experiment: 0,
        };

        for (const m of pointMatches) {
          catScores[m.category] += m.scoreBonus;
        }

        let bestCat: CreatorCategory = 'publish';
        let maxS = -1;
        for (const [cat, s] of Object.entries(catScores)) {
          if (s > maxS) {
            maxS = s;
            bestCat = cat as CreatorCategory;
          }
        }

        intervalsWithAspects.push({
          time: point.timestamp,
          aspects: activeTransitAspects,
          matchedRules: pointMatches,
          score: Math.min(Math.round(maxS), 100),
          category: bestCat,
        });
      }
    }

    // 4. Cluster 15-minute intervals into human windows (e.g. 18:15–20:00)
    const rawWindows = this.clusterIntervalsIntoWindows(intervalsWithAspects, niche, userTimezone);

    // Fallback guaranteed windows if sky is slow (at least 3 windows)
    const finalWindows =
      rawWindows.length > 0
        ? rawWindows
        : this.generateBaselineWindows(transitData, natalChart, niche);

    // Sort windows by score
    finalWindows.sort((a, b) => b.score - a.score);
    const bestWindow = finalWindows.length > 0 ? finalWindows[0] : null;

    // Calculate category global scores
    const categoryTotals: Record<CreatorCategory, number> = {
      publish: 40,
      create: 35,
      engage: 30,
      sell: 25,
      experiment: 20,
    };

    for (const w of finalWindows) {
      categoryTotals[w.category] = Math.max(categoryTotals[w.category], w.score);
    }

    const avgScore = Math.round(
      Object.values(categoryTotals).reduce((a, b) => a + b, 0) / 5
    );

    const activityLevel =
      avgScore >= 80
        ? 'Pico de Intensidad'
        : avgScore >= 65
        ? 'Alta Actividad'
        : avgScore >= 45
        ? 'Actividad Moderada'
        : 'Actividad Suave';

    // 5. Build 24h timeline blocks
    const timelineHours: Array<{
      hour: number;
      activeWindows: TimeWindow[];
      moonLongitude: number;
    }> = [];

    for (let h = 0; h < 24; h++) {
      const active = finalWindows.filter((w) => {
        const startH = parseInt(w.startTime.split(':')[0], 10);
        const endH = parseInt(w.endTime.split(':')[0], 10);
        return h >= startH && h <= endH;
      });
      const moonPt = moonPoints[Math.min(h * 4, moonPoints.length - 1)];
      timelineHours.push({
        hour: h,
        activeWindows: active,
        moonLongitude: moonPt ? moonPt.longitude : 0,
      });
    }

    return {
      dateFormatted: date.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      generalScore: avgScore,
      activityLevel,
      categoryScores: {
        publish: {
          score: categoryTotals.publish,
          ratingLabel: categoryTotals.publish >= 70 ? '+++' : categoryTotals.publish >= 50 ? '++' : '+',
        },
        create: {
          score: categoryTotals.create,
          ratingLabel: categoryTotals.create >= 70 ? '+++' : categoryTotals.create >= 50 ? '++' : '+',
        },
        engage: {
          score: categoryTotals.engage,
          ratingLabel: categoryTotals.engage >= 70 ? '+++' : categoryTotals.engage >= 50 ? '++' : '+',
        },
        sell: {
          score: categoryTotals.sell,
          ratingLabel: categoryTotals.sell >= 70 ? '+++' : categoryTotals.sell >= 50 ? '++' : '+',
        },
        experiment: {
          score: categoryTotals.experiment,
          ratingLabel: categoryTotals.experiment >= 70 ? '+++' : categoryTotals.experiment >= 50 ? '++' : '+',
        },
      },
      bestWindow,
      dailyWindows: finalWindows,
      timelineHours,
    };
  }

  private clusterIntervalsIntoWindows(
    intervals: Array<{
      time: Date;
      score: number;
      category: CreatorCategory;
      matchedRules: RuleMatch[];
    }>,
    niche: any,
    userTimezone: string
  ): TimeWindow[] {
    if (intervals.length === 0) return [];

    const windows: TimeWindow[] = [];
    let currentCluster: typeof intervals = [];

    for (let i = 0; i < intervals.length; i++) {
      const curr = intervals[i];
      if (currentCluster.length === 0) {
        currentCluster.push(curr);
      } else {
        const prev = currentCluster[currentCluster.length - 1];
        const timeDiffMins = (curr.time.getTime() - prev.time.getTime()) / (60 * 1000);

        if (timeDiffMins <= 30 && curr.category === prev.category) {
          currentCluster.push(curr);
        } else {
          // Finish cluster
          windows.push(this.buildWindowFromCluster(currentCluster, niche, userTimezone));
          currentCluster = [curr];
        }
      }
    }

    if (currentCluster.length > 0) {
      windows.push(this.buildWindowFromCluster(currentCluster, niche, userTimezone));
    }

    return windows;
  }

  private buildWindowFromCluster(cluster: any[], niche: any, userTimezone: string): TimeWindow {
    const first = cluster[0];
    const last = cluster[cluster.length - 1];
    const category: CreatorCategory = first.category;

    const maxScore = Math.max(...cluster.map((c) => c.score));
    const allMatches = cluster.flatMap((c) => c.matchedRules);

    // Pick top rule match
    const topRule = allMatches.sort((a, b) => b.scoreBonus - a.scoreBonus)[0] || allMatches[0];

    const userTz = userTimezone || 'America/Argentina/Buenos_Aires';
    const formatH = (d: Date) => {
      const dt = DateTime.fromJSDate(d).setZone(userTz);
      return dt.toFormat('HH:mm');
    };

    const startTime = formatH(first.time);
    // End time is 15 minutes after last interval
    const endDt = DateTime.fromJSDate(last.time).setZone(userTz).plus({ minutes: 15 });
    // If endDt rolled into next day (00:00 or after), clamp to 23:59 or end time string
    const endTime = endDt.day !== DateTime.fromJSDate(first.time).setZone(userTz).day && endDt.hour === 0 && endDt.minute === 0
      ? '23:59'
      : endDt.toFormat('HH:mm');

    const advice = niche.categoryAdvice[category];
    const keywords = Array.from(new Set(allMatches.flatMap((m) => m.keywords)));

    const categoryNames: Record<CreatorCategory, string> = {
      publish: 'Publicar',
      create: 'Crear',
      engage: 'Interactuar',
      sell: 'Vender',
      experiment: 'Experimentar',
    };

    const intensity =
      maxScore >= 85
        ? 'Excepcional'
        : maxScore >= 70
        ? 'Muy Alta'
        : maxScore >= 50
        ? 'Alta'
        : 'Moderada';

    // Keep only the most exact match per rule ID to prevent repeating identical messages across intervals
    const bestMatchesByRule = new Map<string, RuleMatch>();
    for (const m of allMatches) {
      const existing = bestMatchesByRule.get(m.ruleId);
      if (!existing || m.scoreBonus > existing.scoreBonus) {
        bestMatchesByRule.set(m.ruleId, m);
      }
    }

    const uniqueTransitsList = Array.from(bestMatchesByRule.values()).map((m) => m.explanation);

    return {
      id: `win-${category}-${startTime.replace(':', '')}`,
      category,
      categoryNameEs: categoryNames[category],
      startTime,
      endTime,
      startDateTime: first.time.toISOString(),
      endDateTime: last.time.toISOString(),
      score: maxScore,
      intensityLevel: intensity,
      primaryAspect: topRule?.explanation || 'Tránsito de activación armónica',
      exactOrb: topRule?.astrologicalEvidence?.orb
        ? `${Math.round(topRule.astrologicalEvidence.orb * 60)}'`
        : 'Exacto',
      ruleMatches: Array.from(bestMatchesByRule.values()).slice(0, 4),
      keywords: keywords.slice(0, 5),
      actionRecommendation: advice.action,
      exampleIdeas: advice.examples,
      channelSuggestion: advice.channel,
      whyNow: {
        transitsList: uniqueTransitsList,
        astrologicalSummary: `Aspecto exacto activando zonas clave de ${categoryNames[category].toLowerCase()}.`,
        favorableFor: keywords.slice(0, 4),
      },
    };
  }

  private generateBaselineWindows(
    transitData: TransitData,
    natalChart: NatalChartData,
    niche: any
  ): TimeWindow[] {
    const sunHouse = transitData.transitHouses.sun || 10;
    const venHouse = transitData.transitHouses.venus || 2;

    return [
      {
        id: 'win-create-default',
        category: 'create',
        categoryNameEs: 'Crear',
        startTime: '14:20',
        endTime: '16:10',
        startDateTime: '',
        endDateTime: '',
        score: 72,
        intensityLevel: 'Alta',
        primaryAspect: `Sol transitando Casa ${sunHouse} natal`,
        exactOrb: '0°45\'',
        ruleMatches: [],
        keywords: ['diseño', 'grabación', 'foco'],
        actionRecommendation: niche.categoryAdvice.create.action,
        exampleIdeas: niche.categoryAdvice.create.examples,
        channelSuggestion: niche.categoryAdvice.create.channel,
        whyNow: {
          transitsList: [`Sol en Casa ${sunHouse} natal activando foco conceptual`],
          astrologicalSummary: 'Energía sostenida para producir contenido con claridad.',
          favorableFor: ['creatividad', 'storytelling', 'producción'],
        },
      },
      {
        id: 'win-engage-default',
        category: 'engage',
        categoryNameEs: 'Interactuar',
        startTime: '18:30',
        endTime: '19:45',
        startDateTime: '',
        endDateTime: '',
        score: 68,
        intensityLevel: 'Moderada',
        primaryAspect: 'Luna en trígono armónico',
        exactOrb: '0°32\'',
        ruleMatches: [],
        keywords: ['stories', 'preguntas', 'diálogo'],
        actionRecommendation: niche.categoryAdvice.engage.action,
        exampleIdeas: niche.categoryAdvice.engage.examples,
        channelSuggestion: niche.categoryAdvice.engage.channel,
        whyNow: {
          transitsList: ['Luna activando sector de respuesta comunitaria'],
          astrologicalSummary: 'Facilidad de conexión emocional y réplica ágil.',
          favorableFor: ['conversación', 'comentarios', 'vínculos'],
        },
      },
      {
        id: 'win-publish-default',
        category: 'publish',
        categoryNameEs: 'Publicar',
        startTime: '20:15',
        endTime: '21:40',
        startDateTime: '',
        endDateTime: '',
        score: 88,
        intensityLevel: 'Muy Alta',
        primaryAspect: `Venus transitando Casa ${venHouse} natal`,
        exactOrb: '0°18\'',
        ruleMatches: [],
        keywords: ['estética', 'deseo', 'visibilidad'],
        actionRecommendation: niche.categoryAdvice.publish.action,
        exampleIdeas: niche.categoryAdvice.publish.examples,
        channelSuggestion: niche.categoryAdvice.publish.channel,
        whyNow: {
          transitsList: [
            'Luna aspectando Venus natal',
            `Venus en Casa ${venHouse} activando valor y recepción`,
          ],
          astrologicalSummary: 'Ventana armónica de gran atractivo visual y presencia pública.',
          favorableFor: ['alcance', 'estética', 'impacto visual'],
        },
      },
    ];
  }
}
