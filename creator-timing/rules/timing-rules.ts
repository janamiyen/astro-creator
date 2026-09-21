import {
  PlanetKey,
  AspectType,
  TransitAspect,
  NatalChartData,
  TransitData,
} from '../../astronomy/types';
import { PLANET_NAMES_ES } from '../../astronomy/calculations/coordinates';

export type CreatorCategory =
  | 'create'
  | 'publish'
  | 'sell'
  | 'engage'
  | 'experiment';

export interface RuleMatch {
  ruleId: string;
  category: CreatorCategory;
  scoreBonus: number; // e.g. 10 to 30 multiplied by orb weight
  explanation: string;
  astrologicalEvidence: {
    transitPlanet?: PlanetKey;
    natalPoint?: PlanetKey | 'ascendant' | 'midheaven';
    aspectType?: AspectType;
    orb?: number;
    house?: number;
  };
  keywords: string[];
}

export interface CreatorRule {
  id: string;
  category: CreatorCategory;
  baseScore: number;
  description: string;
  keywords: string[];
  check(context: {
    transitAspects: TransitAspect[];
    transitHouses: Record<PlanetKey, number>;
    natalChart: NatalChartData;
  }): RuleMatch[];
}

export const CREATOR_RULES: CreatorRule[] = [
  // --- CATEGORÍA: PUBLICAR (Visibilidad, Exposición, Alcance) ---
  {
    id: 'luna_trigono_venus',
    category: 'publish',
    baseScore: 35,
    description: 'Luna armónica con Venus: ventana estética, deseo y atracción visual.',
    keywords: ['estética', 'deseo', 'atracción', 'branding', 'lifestyle'],
    check({ transitAspects }) {
      const matches: RuleMatch[] = [];
      for (const a of transitAspects) {
        if (
          a.transitPlanet === 'moon' &&
          a.natalPoint === 'venus' &&
          (a.aspectType === 'trine' || a.aspectType === 'sextile' || a.aspectType === 'conjunction')
        ) {
          matches.push({
            ruleId: 'luna_trigono_venus',
            category: 'publish',
            scoreBonus: 35 * a.weight,
            explanation: `Luna ${a.aspectType === 'trine' ? 'trígono' : a.aspectType === 'sextile' ? 'sextil' : 'conjunción'} a Venus natal (orbe ${a.formattedOrb}): activa deseo, magnetismo y armonía visual.`,
            astrologicalEvidence: {
              transitPlanet: 'moon',
              natalPoint: 'venus',
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['estética', 'deseo', 'visual', 'lifestyle'],
          });
        }
      }
      return matches;
    },
  },
  {
    id: 'luna_jupiter_expansiva',
    category: 'publish',
    baseScore: 40,
    description: 'Luna en aspecto armónico a Júpiter natal: ventana de máxima expansión y alcance.',
    keywords: ['expansión', 'alcance', 'lanzamiento', 'comunidad', 'visibilidad'],
    check({ transitAspects }) {
      const matches: RuleMatch[] = [];
      for (const a of transitAspects) {
        if (
          a.transitPlanet === 'moon' &&
          a.natalPoint === 'jupiter' &&
          (a.aspectType === 'trine' || a.aspectType === 'sextile' || a.aspectType === 'conjunction')
        ) {
          matches.push({
            ruleId: 'luna_jupiter_expansiva',
            category: 'publish',
            scoreBonus: 40 * a.weight,
            explanation: `Luna en aspecto armónico con Júpiter natal (orbe ${a.formattedOrb}): simboliza amplificación de audiencia, buena recepción y proyección masiva.`,
            astrologicalEvidence: {
              transitPlanet: 'moon',
              natalPoint: 'jupiter',
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['expansión', 'alcance', 'viralidad_simbolica', 'proyección'],
          });
        }
      }
      return matches;
    },
  },
  {
    id: 'luna_mc_visibilidad',
    category: 'publish',
    baseScore: 45,
    description: 'Luna activando el Medio Cielo (MC): ventana de notoriedad pública y autoridad profesional.',
    keywords: ['autoridad', 'profesional', 'reconocimiento', 'visibilidad'],
    check({ transitAspects }) {
      const matches: RuleMatch[] = [];
      for (const a of transitAspects) {
        if (
          a.transitPlanet === 'moon' &&
          a.natalPoint === 'midheaven' &&
          (a.aspectType === 'conjunction' || a.aspectType === 'trine' || a.aspectType === 'sextile')
        ) {
          matches.push({
            ruleId: 'luna_mc_visibilidad',
            category: 'publish',
            scoreBonus: 45 * a.weight,
            explanation: `Luna activando Medio Cielo natal (orbe ${a.formattedOrb}): momento cumbre para exponer proyectos clave y fijar presencia en el feed.`,
            astrologicalEvidence: {
              transitPlanet: 'moon',
              natalPoint: 'midheaven',
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['autoridad', 'exposición', 'credibilidad'],
          });
        }
      }
      return matches;
    },
  },
  {
    id: 'sol_casa_10_11',
    category: 'publish',
    baseScore: 30,
    description: 'Sol transitando Casa 10 u 11: foco en visibilidad pública y redes sociales.',
    keywords: ['comunidad', 'exposición', 'liderazgo'],
    check({ transitHouses }) {
      const matches: RuleMatch[] = [];
      const sunHouse = transitHouses.sun;
      if (sunHouse === 10 || sunHouse === 11 || sunHouse === 1) {
        matches.push({
          ruleId: 'sol_casa_10_11',
          category: 'publish',
          scoreBonus: 25,
          explanation: `Sol iluminando tu Casa ${sunHouse} natal: resalta tu identidad y capacidad de tracción con la comunidad.`,
          astrologicalEvidence: {
            transitPlanet: 'sun',
            house: sunHouse,
          },
          keywords: ['identidad', 'redes', 'presencia'],
        });
      }
      return matches;
    },
  },

  // --- CATEGORÍA: CREAR (Inspiración, Storytelling, Diseño, Guionado) ---
  {
    id: 'venus_neptuno_creatividad',
    category: 'create',
    baseScore: 35,
    description: 'Interacción Venus / Neptuno / Luna en casas de imaginación.',
    keywords: ['inspiración', 'poesía', 'diseño', 'storytelling', 'edición'],
    check({ transitAspects, transitHouses }) {
      const matches: RuleMatch[] = [];
      for (const a of transitAspects) {
        if (
          (a.transitPlanet === 'venus' && a.natalPoint === 'neptune') ||
          (a.transitPlanet === 'neptune' && a.natalPoint === 'venus') ||
          (a.transitPlanet === 'moon' && a.natalPoint === 'neptune')
        ) {
          const tName = PLANET_NAMES_ES[a.transitPlanet] || a.transitPlanet;
          const nName = PLANET_NAMES_ES[a.natalPoint as keyof typeof PLANET_NAMES_ES] || a.natalPoint;
          matches.push({
            ruleId: 'venus_neptuno_creatividad',
            category: 'create',
            scoreBonus: 35 * a.weight,
            explanation: `Contacto de ${tName} con ${nName} natal (orbe ${a.formattedOrb}): sensibilidad visual e imaginación despierta para diseñar y conceptualizar.`,
            astrologicalEvidence: {
              transitPlanet: a.transitPlanet,
              natalPoint: a.natalPoint,
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['imaginación', 'diseño', 'atmósfera'],
          });
        }
      }
      if (transitHouses.moon === 5 || transitHouses.moon === 12) {
        matches.push({
          ruleId: 'luna_casa_5_12',
          category: 'create',
          scoreBonus: 20,
          explanation: `Luna transitando Casa ${transitHouses.moon}: estado de flujo para introspección y creación artística.`,
          astrologicalEvidence: {
            transitPlanet: 'moon',
            house: transitHouses.moon,
          },
          keywords: ['flow', 'creatividad', 'expresión'],
        });
      }
      return matches;
    },
  },

  // --- CATEGORÍA: INTERACTUAR (Engagement, Diálogo, Preguntas, Respuestas) ---
  {
    id: 'luna_mercurio_dialogo',
    category: 'engage',
    baseScore: 40,
    description: 'Luna en aspecto a Mercurio: agilidad mental, empatía y fluidez conversacional.',
    keywords: ['conversación', 'stories', 'encuestas', 'comentarios', 'directos'],
    check({ transitAspects }) {
      const matches: RuleMatch[] = [];
      for (const a of transitAspects) {
        if (
          a.transitPlanet === 'moon' &&
          a.natalPoint === 'mercury' &&
          (a.aspectType === 'trine' || a.aspectType === 'sextile' || a.aspectType === 'conjunction')
        ) {
          matches.push({
            ruleId: 'luna_mercurio_dialogo',
            category: 'engage',
            scoreBonus: 40 * a.weight,
            explanation: `Luna en armonía con Mercurio natal (orbe ${a.formattedOrb}): comunicación empática, claridad para responder mensajes y generar debate en Stories.`,
            astrologicalEvidence: {
              transitPlanet: 'moon',
              natalPoint: 'mercury',
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['diálogo', 'stories', 'preguntas', 'feedback'],
          });
        }
      }
      return matches;
    },
  },

  // --- CATEGORÍA: VENDER (Conversión, Propuestas, Lanzamientos Comerciales) ---
  {
    id: 'saturno_venus_jupiter_venta',
    category: 'sell',
    baseScore: 35,
    description: 'Tránsitos activando casas de recursos (2, 8, 10) o aspectos de valor.',
    keywords: ['valor', 'conversión', 'oferta', 'precio', 'lanzamiento'],
    check({ transitAspects, transitHouses }) {
      const matches: RuleMatch[] = [];
      const venHouse = transitHouses.venus;
      const jupHouse = transitHouses.jupiter;
      if (venHouse === 2 || venHouse === 8 || jupHouse === 2 || jupHouse === 10) {
        matches.push({
          ruleId: 'saturno_venus_jupiter_venta',
          category: 'sell',
          scoreBonus: 30,
          explanation: `Planetas de abundancia/estructura activando tus casas financieras (${venHouse || jupHouse}): favorable para presentar llamadas a la acción (CTA) y ofertas.`,
          astrologicalEvidence: {
            house: venHouse || jupHouse,
          },
          keywords: ['valor', 'propuesta', 'monetización'],
        });
      }
      for (const a of transitAspects) {
        if (
          (a.transitPlanet === 'venus' && a.natalPoint === 'saturn') ||
          (a.transitPlanet === 'jupiter' && a.natalPoint === 'venus')
        ) {
          const tName = PLANET_NAMES_ES[a.transitPlanet] || a.transitPlanet;
          const nName = PLANET_NAMES_ES[a.natalPoint as keyof typeof PLANET_NAMES_ES] || a.natalPoint;
          matches.push({
            ruleId: 'aspecto_valor_comercial',
            category: 'sell',
            scoreBonus: 30 * a.weight,
            explanation: `Aspecto entre ${tName} y ${nName} natal: ancla valor tangible y deseo en productos o servicios.`,
            astrologicalEvidence: {
              transitPlanet: a.transitPlanet,
              natalPoint: a.natalPoint,
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['conversión', 'calidad', 'confianza'],
          });
        }
      }
      return matches;
    },
  },

  // --- CATEGORÍA: EXPERIMENTAR (Formatos Nuevos, Tendencias Disruptivas) ---
  {
    id: 'urano_marte_mercurio_innovacion',
    category: 'experiment',
    baseScore: 40,
    description: 'Aspectos con Urano o Marte: audacia creativa, romper formatos y giros inesperados.',
    keywords: ['disrupción', 'tendencias', 'formato nuevo', 'polaridad', 'riesgo'],
    check({ transitAspects }) {
      const matches: RuleMatch[] = [];
      for (const a of transitAspects) {
        if (
          (a.transitPlanet === 'uranus' && (a.natalPoint === 'mercury' || a.natalPoint === 'sun' || a.natalPoint === 'mars')) ||
          (a.transitPlanet === 'mars' && a.natalPoint === 'uranus') ||
          (a.transitPlanet === 'moon' && a.natalPoint === 'uranus')
        ) {
          const tName = PLANET_NAMES_ES[a.transitPlanet] || a.transitPlanet;
          const nName = PLANET_NAMES_ES[a.natalPoint as keyof typeof PLANET_NAMES_ES] || a.natalPoint;
          matches.push({
            ruleId: 'urano_marte_mercurio_innovacion',
            category: 'experiment',
            scoreBonus: 35 * a.weight,
            explanation: `Contacto eléctrico de ${tName} con ${nName} natal (orbe ${a.formattedOrb}): impulso para probar un formato no convencional o expresar un punto de vista disruptivo.`,
            astrologicalEvidence: {
              transitPlanet: a.transitPlanet,
              natalPoint: a.natalPoint,
              aspectType: a.aspectType,
              orb: a.orb,
            },
            keywords: ['innovación', 'audacia', 'formato_nuevo'],
          });
        }
      }
      return matches;
    },
  },
];
