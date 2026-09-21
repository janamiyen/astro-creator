import { CreatorCategory } from '../rules/timing-rules';

export interface NicheTranslation {
  nicheId: string;
  nameEs: string;
  categoryAdvice: Record<
    CreatorCategory,
    {
      action: string;
      examples: string[];
      channel: string;
    }
  >;
}

export const CREATOR_NICHES: Record<string, NicheTranslation> = {
  lifestyle: {
    nicheId: 'lifestyle',
    nameEs: 'Lifestyle',
    categoryAdvice: {
      publish: {
        action: 'Publicar carrusel estético o Reel de rutina diaria',
        examples: ['Vlog matutino/nocturno', 'Photo dump curado', 'Mini tour'],
        channel: 'Reels / Feed principal',
      },
      create: {
        action: 'Grabar b-roll con luz natural y armar paleta de colores',
        examples: ['Tomas de detalle', 'Selección musical', 'Edición de ritmo lento'],
        channel: 'Banco de clips / CapCut',
      },
      engage: {
        action: 'Abrir cajita de preguntas sobre hábitos y recomendaciones',
        examples: ['Q&A de favoritos del mes', 'Encuesta de opciones de viaje', 'Historias de café'],
        channel: 'Stories / Broadcast Channel',
      },
      sell: {
        action: 'Compartir código de descuento orgánico en contexto de uso',
        examples: ['Unboxing sutil', 'Outfit con enlaces directos', 'Recomendación sincera'],
        channel: 'Stories con enlace / Link in Bio',
      },
      experiment: {
        action: 'Mostrar el lado caótico o sin filtro de un proyecto personal',
        examples: ['Backstage sin editar', 'Confesión de proceso', 'Voz en off reflexiva'],
        channel: 'TikTok / Stories espontáneas',
      },
    },
  },
  fashion: {
    nicheId: 'fashion',
    nameEs: 'Moda & Belleza',
    categoryAdvice: {
      publish: {
        action: 'Mostrar lookbook, transición de outfit o editorial de maquillaje',
        examples: ['Get Ready With Me (GRWM)', '3 formas de usar una prenda', 'Look de noche'],
        channel: 'Reels / TikTok',
      },
      create: {
        action: 'Probar combinaciones, cuidar ángulos de iluminación y primeros planos',
        examples: ['Fotos de texturas y telas', 'Prueba de swatches', 'Guionado de estilo'],
        channel: 'Estudio / Espejo',
      },
      engage: {
        action: 'Pedir que elijan entre dos outfits para un evento',
        examples: ['¿Opción 1 o 2?', 'Comentarios votando accesorio', 'Encuesta de tendencias'],
        channel: 'Stories interactivas',
      },
      sell: {
        action: 'Presentar prendas con CTA directo a links o colección cápsula',
        examples: ['Cápsula limitada', 'Link a prendas exactas', 'Reseña de durabilidad'],
        channel: 'Stories destacadas / Carrito',
      },
      experiment: {
        action: 'Combinar piezas anti-tendencia o maquillaje conceptual arriesgado',
        examples: ['Estilo avant-garde', 'Crítica honesta de tendencias', 'Desafío de época'],
        channel: 'Reel de impacto',
      },
    },
  },
  tech: {
    nicheId: 'tech',
    nameEs: 'Tecnología & Educación',
    categoryAdvice: {
      publish: {
        action: 'Lanzar tutorial directo al grano, comparativa o breakdown técnico',
        examples: ['Cómo resolver X en 60 segundos', 'Review sin rodeos', 'Desmitificando un concepto'],
        channel: 'YouTube / LinkedIn / Carousel en IG',
      },
      create: {
        action: 'Escribir diagramas, estructura de guion o depurar ejemplos de código',
        examples: ['Puntos clave del hilo', 'Grabación de pantalla limpia', 'Gráficos explicativos'],
        channel: 'Notion / Miro / Screen recording',
      },
      engage: {
        action: 'Plantear un dilema técnico o pedir la opinión de colegas y seguidores',
        examples: ['¿Herramienta A o B?', '¿Cuál es el peor error al empezar?', 'Preguntas y respuestas en vivo'],
        channel: 'X / LinkedIn / Stories',
      },
      sell: {
        action: 'Abrir cupos de mentoría, curso o descarga de plantilla/recurso',
        examples: ['Presentación de caso de estudio', 'Oferta de software', 'Pack de templates'],
        channel: 'Newsletter / Link en bio',
      },
      experiment: {
        action: 'Compartir una opinión impopular sobre una nueva tecnología',
        examples: ['Predicción polémica', 'Test de estrés en vivo', 'Formato meme técnico'],
        channel: 'Threads / X / Shorts',
      },
    },
  },
  gaming: {
    nicheId: 'gaming',
    nameEs: 'Gaming & Entretenimiento',
    categoryAdvice: {
      publish: {
        action: 'Publicar el mejor highlight, jugada épica o clip de reacción',
        examples: ['Clutch imposible', 'Fails divertidos', 'Momento viral de stream'],
        channel: 'TikTok / YouTube Shorts',
      },
      create: {
        action: 'Revisar grabaciones largas para recortar momentos clave y efectos sonoros',
        examples: ['Edición dinámica con subtítulos', 'Selección de memes', 'Efectos visuales'],
        channel: 'Premiere / CapCut',
      },
      engage: {
        action: 'Hacer stream o encuestas sobre qué juego o reto jugar a continuación',
        examples: ['Votación de reto extremo', 'Comunidad en Discord', 'Duelo contra subs'],
        channel: 'Twitch / Discord / Stories',
      },
      sell: {
        action: 'Mencionar periféricos, patrocinadores o suscripciones de canal',
        examples: ['Setup tour con links de afiliados', 'Sorteo con patrocinador', 'Meta de subs'],
        channel: 'Stream overlays / Descripción de video',
      },
      experiment: {
        action: 'Jugar un juego completamente fuera de tu zona de confort con reglas absurdas',
        examples: ['Nuzlocke con castigos', 'Juego indie retro desconocido', 'Desafío a ciegas'],
        channel: 'Especial en directo / Shorts',
      },
    },
  },
  business: {
    nicheId: 'business',
    nameEs: 'Emprendimiento & Negocios',
    categoryAdvice: {
      publish: {
        action: 'Compartir aprendizaje clave, métricas transparentes o lección dura',
        examples: ['Cómo facturé mis primeros X', 'El error que me costó clientes', 'Framework de 3 pasos'],
        channel: 'LinkedIn / Carrusel de Instagram',
      },
      create: {
        action: 'Estructurar propuestas de valor, ofertas o esquemas de contenido',
        examples: ['Copywriting persuasivo', 'Guion para video largo', 'Planilla de recursos'],
        channel: 'Google Docs / Notion',
      },
      engage: {
        action: 'Preguntar a la audiencia cuál es su mayor cuello de botella actual',
        examples: ['¿Qué te detiene para lanzar?', 'Networking en comentarios', 'Debate en hilos'],
        channel: 'Stories / Hilos',
      },
      sell: {
        action: 'Llamada clara a agendar llamada, unirse a comunidad paga o comprar servicio',
        examples: ['Testimonio de cliente + CTA', 'Plazas limitadas para consultoría', 'Masterclass gratuita'],
        channel: 'Direct Message / Landing Page',
      },
      experiment: {
        action: 'Revelar números reales o fracasos que la mayoría suele ocultar',
        examples: ['Finanzas transparentes', 'Autopsia de un proyecto fallido', 'Pivote radical de estrategia'],
        channel: 'Post editorial largo',
      },
    },
  },
};

export function getNicheTranslation(nicheKey?: string): NicheTranslation {
  if (nicheKey && CREATOR_NICHES[nicheKey]) {
    return CREATOR_NICHES[nicheKey];
  }
  return CREATOR_NICHES.lifestyle; // default
}
