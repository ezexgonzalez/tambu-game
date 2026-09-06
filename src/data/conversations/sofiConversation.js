import { COUNCIL_CONFIG } from '../councilAdvice.js';

export const SOFI_CONVERSATION = {
  initialBeat: 'beat-1',
  beats: [
    {
      id: 'beat-1',
      prompt: 'Vos sos Tambu, ¿no? Escuché tu nombre como tres veces desde que llegué.',
      nextBeat: 'beat-2',
      choices: [
        {
          id: 'mystery',
          text: 'Depende. ¿Qué versión te llegó?',
          intent: 'mystery',
          effects: { attraction: 3, trust: 4, intensity: 1 },
          emits: ['sofi_engaged_with_mystery'],
          reaction: [
            { speaker: 'Sofi', text: '¿Hay más de una?' },
            { speaker: 'Tambu', text: 'Siempre.' },
            { speaker: 'Sofi', text: 'Bueno, por ahora ninguna demasiado grave.' },
          ],
        },
        {
          id: 'organic-marketing',
          text: 'Sí. ¿Quién está haciendo prensa por mí?',
          intent: 'humor',
          effects: { attraction: 4, trust: 4, intensity: 1 },
          emits: ['sofi_enjoyed_group_humor'],
          reaction: [
            { speaker: 'Sofi', text: 'No sé si prensa. Pero tu nombre circula bastante.' },
            { speaker: 'Tambu', text: 'Excelente, marketing orgánico.' },
          ],
        },
        {
          id: 'hope-not-to-disappoint',
          text: 'Sí, soy yo. Espero no decepcionar.',
          intent: 'genuine',
          effects: { attraction: 2, trust: 6, intensity: 0 },
          emits: ['sofi_comfortable_with_genuine_intro'],
          reaction: [
            { speaker: 'Sofi', text: 'Todavía tenés tiempo.' },
            { speaker: 'Tambu', text: 'Perfecto, llegué con margen.' },
          ],
        },
        {
          id: 'papi',
          text: 'Sí, soy yo, te habla papi.',
          intent: 'unfiltered-humor',
          effects: { attraction: 5, trust: 2, intensity: 4 },
          emits: ['sofi_played_along_with_papi', 'tambu_bold_absurd_intro'],
          reaction: [
            { speaker: 'Sofi', text: '¿Te habla quién?' },
            { speaker: 'Tambu', text: 'Papi.' },
            { speaker: 'Sofi', text: 'No podés presentarte así.' },
            { speaker: 'Tambu', text: 'Pero ya lo hice.' },
            { text: 'Sofi se ríe.' },
          ],
        },
      ],
    },
    {
      id: 'beat-2',
      prompt: 'Igual me habían dicho que eras el tranquilo del grupo. Me parece que exageraron un poco.',
      nextBeat: 'beat-3',
      choices: [
        {
          id: 'let-them-tire',
          text: 'Es que los dejo cansarse solos.',
          intent: 'dry-humor',
          effects: { attraction: 3, trust: 5, intensity: 0 },
          emits: ['sofi_values_tambu_observation'],
          reaction: [
            { speaker: 'Sofi', text: 'Estrategia inteligente.' },
            { speaker: 'Tambu', text: 'Sobreviví bastante así.' },
          ],
          bridge: [
            { speaker: 'Sofi', text: 'Igual se nota que observás bastante.' },
            {
              speaker: 'Tambu',
              text: 'Deformación profesional. Soy Licenciado en Psicopedagogía.',
            },
            { speaker: 'Sofi', text: 'Ah... con razón estabas estudiando el ambiente.' },
            { speaker: 'Tambu', text: 'Es observación participante.' },
          ],
        },
        {
          id: 'slow-with-strangers',
          text: 'Con gente que no conozco arranco bastante lento.',
          intent: 'vulnerability',
          effects: { attraction: 3, trust: 7, intensity: 1 },
          emits: ['sofi_invited_personal_connection', 'tambu_opened_up'],
          reaction: [
            { speaker: 'Sofi', text: '¿Y ya dejé de ser gente que no conocés?' },
            { speaker: 'Tambu', text: 'Estamos avanzando.' },
          ],
          bridge: [
            { speaker: 'Sofi', text: 'Pensás bastante antes de decir las cosas, ¿no?' },
            {
              speaker: 'Tambu',
              text: 'Sí. Soy Licenciado en Psicopedagogía; observar ya me sale solo.',
            },
            { speaker: 'Sofi', text: 'Eso explica bastante.' },
            { speaker: 'Tambu', text: 'Recién nos conocemos y ya me estás diagnosticando vos.' },
          ],
        },
        {
          id: 'selective',
          text: 'No soy tranquilo. Soy selectivo.',
          intent: 'confident-flirt',
          effects: { attraction: 6, trust: 3, intensity: 4 },
          emits: [
            'npc_returned_flirt',
            'sofi_returned_flirt',
            'tambu_showed_romantic_intent',
          ],
          reaction: [
            { speaker: 'Sofi', text: 'Ah, mirá. ¿Y pasé la selección?' },
            { speaker: 'Tambu', text: 'Seguís en carrera.' },
            { speaker: 'Sofi', text: 'Qué alivio.' },
          ],
          bridge: [
            { speaker: 'Sofi', text: '¿La selección incluye analizar cada cosa que digo?' },
            { speaker: 'Tambu', text: 'Puede ser. Soy Licenciado en Psicopedagogía.' },
            { speaker: 'Sofi', text: 'Usás el título para justificar cualquier cosa.' },
            { speaker: 'Tambu', text: 'Costó conseguirlo, hay que amortizarlo.' },
          ],
        },
        {
          id: 'analyzed-everyone',
          text: 'Estoy tranquilo porque ya analicé psicológicamente a todos los que están acá.',
          intent: 'unfiltered-professional-bit',
          effects: { attraction: 4, trust: 2, intensity: 5 },
          emits: ['sofi_amused_by_psychopedagogy', 'tambu_overanalyzed_the_room'],
          reaction: [
            { speaker: 'Sofi', text: '¿A todos?' },
            { speaker: 'Tambu', text: 'A vos todavía te estoy cerrando.' },
            { speaker: 'Sofi', text: 'Ah, buenísimo. Cero presión.' },
            { speaker: 'Tambu', text: 'Después te paso el informe.' },
            { speaker: 'Sofi', text: 'No, gracias.' },
          ],
          bridge: [
            {
              speaker: 'Sofi',
              text: 'Pará... ¿vos estudiás algo de eso de verdad o estás diciendo pelotudeces?',
            },
            { speaker: 'Tambu', text: 'Soy Licenciado en Psicopedagogía.' },
            { speaker: 'Sofi', text: 'Eso hace que todo esto sea un poco más preocupante.' },
            { speaker: 'Tambu', text: 'Al contrario. Ahora está respaldado académicamente.' },
          ],
        },
      ],
    },
    {
      id: 'beat-3',
      prompt: '¿Y siempre analizás tanto a la gente?',
      nextBeat: 'beat-4',
      choices: [
        {
          id: 'automatic',
          text: 'A veces. Es medio automático ya.',
          intent: 'genuine',
          effects: { attraction: 2, trust: 5, intensity: 1 },
          emits: ['beat3_genuine', 'sofi_sees_tambu_as_observant'],
          reaction: [
            { speaker: 'Sofi', text: 'Debe ser agotador.' },
            { speaker: 'Tambu', text: 'Más para los demás que para mí.' },
          ],
        },
        {
          id: 'when-interested',
          text: 'Solo cuando alguien me interesa.',
          intent: 'direct-flirt',
          effects: { attraction: 7, trust: 2, intensity: 5 },
          emits: [
            'beat3_direct_interest',
            'sofi_received_direct_interest',
            'tambu_showed_romantic_intent',
          ],
          reaction: [
            { speaker: 'Sofi', text: 'Ah...' },
            { speaker: 'Sofi', text: 'Qué conveniente.' },
          ],
        },
        {
          id: 'imagining-things',
          text: 'Intento no hacerlo. Después termino flasheando cosas que capaz ni existen.',
          intent: 'self-aware-vulnerability',
          effects: { attraction: 1, trust: 7, intensity: 0 },
          emits: ['beat3_vulnerable', 'tambu_opened_up', 'tambu_playing_safe'],
          reaction: [
            { speaker: 'Sofi', text: 'Por lo menos sos consciente.' },
            { speaker: 'Tambu', text: 'A veces demasiado.' },
          ],
        },
        {
          id: 'diagnosis',
          text: 'Con vos ya tengo diagnóstico.',
          intent: 'unfiltered-tease',
          effects: { attraction: 5, trust: 3, intensity: 4 },
          emits: ['beat3_diagnosis', 'sofi_played_along_with_diagnosis'],
          reaction: [
            { speaker: 'Sofi', text: 'A ver.' },
            { speaker: 'Tambu', text: 'No puedo revelarlo. Secreto profesional.' },
            { speaker: 'Sofi', text: 'Qué conveniente tu carrera.' },
          ],
        },
      ],
    },
    {
      id: 'beat-4',
      prompt: 'Bueno... ¿viniste a hablarme porque te caí bien o porque te gusté?',
      promptVariants: [
        {
          when: { allSignals: ['beat3_direct_interest'] },
          prompt: 'Bueno, entonces te la hago fácil: ¿viniste a hablarme porque te caí bien o porque te gusté?',
        },
        {
          when: { allSignals: ['beat3_vulnerable'] },
          prompt: 'Antes de que sigas pensando de más: ¿viniste a hablarme porque te caí bien o porque te gusté?',
        },
        {
          when: { allSignals: ['beat3_diagnosis'] },
          prompt: 'A ver, señor profesional... ¿viniste a hablarme porque te caí bien o porque te gusté?',
        },
        {
          when: { allSignals: ['beat3_genuine'] },
          prompt: 'Igual estás bastante pendiente de mí... ¿viniste a hablarme porque te caí bien o porque te gusté?',
        },
      ],
      choices: [
        {
          id: 'liked-then-connected',
          text: 'Me gustaste y después me caíste bien. En ese orden.',
          intent: 'direct-confidence',
          effects: { attraction: 6, trust: 4, intensity: 4 },
          emits: ['tambu_showed_romantic_intent', 'tambu_was_clear'],
          reaction: [{ speaker: 'Sofi', text: 'Ah, bueno. Clarito.' }],
        },
        {
          id: 'wanted-to-stay',
          text: 'Al principio vine porque estabas acá. Después me dieron ganas de quedarme.',
          intent: 'natural-romance',
          effects: { attraction: 7, trust: 6, intensity: 3 },
          emits: [
            'tambu_showed_romantic_intent',
            'tambu_built_romantic_connection',
          ],
          reaction: [
            { speaker: 'Sofi', text: 'Esa respuesta estuvo bastante bien.' },
            { speaker: 'Tambu', text: 'No estaba preparada.' },
          ],
        },
        {
          id: 'want-to-keep-talking',
          text: 'No sabía muy bien qué quería cuando vine. Ahora quiero seguir hablando con vos.',
          intent: 'honest-openness',
          effects: { attraction: 4, trust: 7, intensity: 2 },
          emits: ['tambu_showed_romantic_intent', 'tambu_was_open'],
          reaction: [{ speaker: 'Sofi', text: 'Bueno... eso te lo compro.' }],
        },
        {
          id: 'kiss-plan',
          text: 'La verdad quería ver si terminábamos chapando, pero estoy intentando desarrollar una personalidad primero.',
          intent: 'unfiltered-honesty',
          effects: { attraction: 5, trust: 0, intensity: 7 },
          emits: ['tambu_showed_romantic_intent', 'tambu_revealed_kiss_plan'],
          variants: [
            {
              id: 'too-intense',
              when: { anySituations: ['too_intense'] },
              effects: { attraction: -4, trust: -4, intensity: 5 },
              emits: ['sofi_rejected_blunt_kiss_plan', 'tambu_overplayed'],
              reaction: [
                { speaker: 'Sofi', text: 'Sí... creo que esa personalidad todavía está en desarrollo.' },
                { speaker: 'Sofi', text: 'Voy a buscar a una amiga.' },
              ],
            },
            {
              id: 'friendship-misread',
              when: {
                anySituations: [
                  'friendzone_risk',
                  'comfortable_but_low_romantic_intent',
                ],
              },
              effects: { attraction: -2, trust: -3, intensity: 2 },
              emits: ['sofi_saw_friendship_misread'],
              reaction: [
                { speaker: 'Sofi', text: 'Ah... yo pensé que estábamos charlando bien, nada más.' },
                { speaker: 'Tambu', text: 'Bueno, la personalidad llegó tarde.' },
              ],
            },
            {
              id: 'chemistry',
              when: {
                allSignals: ['sofi_returned_flirt'],
                stats: { attraction: { gte: 13 }, trust: { gte: 8 } },
              },
              effects: { attraction: 4, trust: 3, intensity: 0 },
              emits: ['sofi_played_along_with_kiss_plan'],
              reaction: [
                { speaker: 'Sofi', text: '¿Ese era todo el plan?' },
                { speaker: 'Tambu', text: 'Fue evolucionando.' },
                { speaker: 'Sofi', text: 'Menos mal.' },
                { speaker: 'Tambu', text: 'Todavía estamos a tiempo de volver al original.' },
                { speaker: 'Sofi', text: 'No te agrandes.' },
              ],
            },
            {
              id: 'awkward-but-recoverable',
              reaction: [
                { speaker: 'Sofi', text: 'Esa sinceridad llegó un poco de golpe.' },
                { speaker: 'Tambu', text: 'Estoy calibrando.' },
                { speaker: 'Sofi', text: 'Se nota.' },
              ],
            },
          ],
        },
      ],
    },
  ],
  council: COUNCIL_CONFIG,
  outcomeRules: {
    ordered: [
      {
        outcome: 'rejection',
        when: { allSignals: ['sofi_rejected_blunt_kiss_plan'] },
      },
      {
        outcome: 'rejection',
        when: { stats: { intensity: { gte: 19 } } },
      },
      {
        outcome: 'date',
        when: {
          allSignals: ['sofi_played_along_with_kiss_plan'],
          stats: {
            attraction: { gte: 18 },
            trust: { gte: 10 },
            intensity: { lte: 18 },
          },
        },
      },
      {
        outcome: 'date',
        when: {
          anySignals: [
            'sofi_returned_flirt',
            'sofi_received_direct_interest',
            'tambu_built_romantic_connection',
          ],
          anyChoices: [
            'beat-2:selective',
            'beat-3:when-interested',
            'beat-4:wanted-to-stay',
          ],
          stats: {
            attraction: { gte: 19 },
            trust: { gte: 14 },
            intensity: { gte: 4, lte: 15 },
          },
        },
      },
      {
        outcome: 'friendzone',
        when: {
          stats: {
            trust: { gte: 19 },
            attraction: { lt: 15 },
            intensity: { lte: 8 },
          },
        },
      },
      {
        outcome: 'instagram',
        when: {
          stats: {
            attraction: { gte: 16 },
            trust: { gte: 12 },
            intensity: { lte: 18 },
          },
        },
      },
    ],
    fallback: 'rejection',
  },
  outcomes: {
    date: {
      id: 'date',
      icon: '❤️',
      label: 'CITA',
      lines: [
        'Sofi sonríe.',
        '"Bueno, Tambu. Otro día podemos seguir esta charla con menos gente alrededor."',
      ],
      reward: { points: 500, lives: 0 },
    },
    instagram: {
      id: 'instagram',
      icon: '📱',
      label: 'INSTAGRAM',
      lines: ['"Pasame tu Instagram. Después vemos."'],
      reward: { points: 250, lives: 0 },
    },
    friendzone: {
      id: 'friendzone',
      icon: '💀',
      label: 'FRIENDZONE',
      lines: ['"Sos re buena onda, Tambu. Me caíste muy bien."'],
      reward: { points: 75, lives: 0 },
    },
    rejection: {
      id: 'rejection',
      icon: '👋',
      label: 'RECHAZO',
      lines: ['"Jajá... bueno. Voy a buscar a una amiga."'],
      reward: { points: 0, lives: -1 },
    },
  },
};
